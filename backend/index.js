import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';
import winston from 'winston';
import os from 'os';
import ErrorHandler from './middlewares/ErrorHandler.js';
import ApiV1Router from './routes/api/v1/index.js';
import { initializeSocket } from './socket.js';

// Load environment variables
dotenv.config({ path: '.env' });

// Enhanced Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.errors({ stack: true })),
  transports: [
    new winston.transports.Console(),
    ...(process.env.ENVIRONMENT !== 'DEVELOPMENT'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
});

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// API key validation middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  // if (!apiKey || apiKey !== process.env.API_KEY) {
  //   return res.status(401).json({ error: 'Invalid API key' });
  // }
  next();
};

// Custom Morgan format for minimal logging
morgan.token('method', (req) => req.method);
morgan.token('url', (req) => req.originalUrl || req.url);
morgan.token('status', (req, res) => res.statusCode);
const customMorganFormat = ':method :url :status';

// Middleware setup
const setupMiddleware = () => {
  // Enhanced helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Compression
  app.use(
    compression({
      level: 6,
      threshold: 1024,
    }),
  );

  // CORS configuration
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
      maxAge: 86400,
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Request timeout
  // app.use(timeout('5s'));

  // Request logging with custom format
  app.use(
    morgan(customMorganFormat, {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
      skip: (req, res) => res.statusCode < 400 && process.env.ENVIRONMENT === 'DEVELOPMENT',
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Input sanitization
  app.use(xssClean());

  // Static files
  app.use('/uploads', cors({ origin: '*' }), express.static('uploads'));
  app.use(
    '/public',
    express.static('public', {
      setHeaders: (res) => {
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // Allow cross-origin access
      },
    }),
  );

  // app.use(
  //   '/public',
  //   express.static('public', {
  //     setHeaders: (res) => {
  //       res.set('X-Content-Type-Options', 'nosniff');
  //     },
  //   }),
  // );

  // API key authentication for API routes
  app.use('/api/v1', apiKeyAuth);
};

// Initialize services
const initializeServices = async () => {
  try {
    // Socket initialization
    initializeSocket(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:1000'],
      },
    });
    logger.info('Socket initialized successfully');
  } catch (error) {
    logger.error('Service initialization failed:', error);
    process.exit(1);
  }
};

// Routes setup
const setupRoutes = () => {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    });
  });

  // Welcome endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to the API',
      version: '1.0.0',
      environment: process.env.ENVIRONMENT || 'DEVELOPMENT',
    });
  });

  // API routes
  app.use('/api/v1', ApiV1Router);

  // 404 handler
  app.use((req, res, next) => {
    res.status(404).json({
      error: 'Not Found',
      message: `The requested resource ${req.originalUrl} was not found`,
    });
  });

  // Error handling middleware
  app.use(ErrorHandler);
};

// Get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Graceful shutdown
const setupGracefulShutdown = () => {
  const signals = ['SIGINT', 'SIGTERM'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);

      try {
        await new Promise((resolve) => {
          server.close(() => {
            logger.info('HTTP server closed');
            resolve();
          });
        });

        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });
  });
};

// Main server initialization
const startServer = async () => {
  try {
    setupMiddleware();
    await initializeServices();
    setupRoutes();
    setupGracefulShutdown();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      const ip = getLocalIP();
      logger.info(`Server is running at http://${ip}:${PORT}/api/v1/`);
      logger.info(`Environment: ${process.env.ENVIRONMENT || 'DEVELOPMENT'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Enhanced error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
