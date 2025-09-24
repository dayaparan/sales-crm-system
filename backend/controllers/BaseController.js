import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/Error.js';
import sendMail, { EmailEnums, EmailTemplates } from '../utils/sendMail.js';
import { createLogger, format, transports } from 'winston';
import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

class BaseController {
  // Account types as constants
  static accountTypes = {
    USER: 'USER',
    ADMIN: 'ADMIN',
  };

  generateToken(id, duration = '365d') {
    try {
      if (!id) {
        throw new ErrorHandler('ID and type are required for token generation', 400);
      }
      return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: duration,
        algorithm: 'HS256',
      });
    } catch (error) {
      logger.error('Token generation failed:', error);
      throw new ErrorHandler(error.message || 'Failed to generate token', 500);
    }
  }

  handleError(next, message, statusCode = 500) {
    const error = new ErrorHandler(message, statusCode);
    // logger.error(message, { stack: error.stack });
    next(error);
  }

  validateRequiredFields(reqBody, requiredFields, reqFiles = [], requiredFileFields = []) {
    // Check if required fields are missing in the request body
    const missingFields = requiredFields.filter(field => !reqBody[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `The following fields are required: ${missingFields.join(', ')}`
      };
    }

    // Check if required files are missing
    const missingFiles = requiredFileFields.filter(requiredField => {
      // Loop through files and check if the fieldname matches the required ones
      return !reqFiles.some(file => file.fieldname === requiredField);
    });

    // If there are missing files, return an error message
    if (missingFiles.length > 0) {
      return {
        success: false,
        message: `The following files are required: ${missingFiles.join(', ')}`
      };
    }

    return null;  // No missing fields or files
  }

  generateOtp(limit) {
    try {
      const digits = '0123456789';
      let otp = '';
      for (let i = 0; i < limit; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
      }
      return otp;
    } catch (error) {
      logger.error('OTP generation failed:', error);
      throw new ErrorHandler('Failed to generate OTP', 500);
    }
  }

  verifyToken(token) {
    try {
      if (!token) {
        throw new ErrorHandler('Token is required', 401);
      }
      return jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new ErrorHandler(
        error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
        401
      );
    }
  }

  decodeToken(token) {
    try {
      if (!token) {
        throw new ErrorHandler('Token is required', 400);
      }
      return jwt.decode(token);
    } catch (error) {
      logger.error('Token decoding failed:', error);
      throw new ErrorHandler('Failed to decode token', 400);
    }
  }

  async handleFileUploads(files, basePath = 'uploads') {
    const uploadedPaths = [];

    for (const field in files) {
      const fileArray = Array.isArray(files[field]) ? files[field] : [files[field]];

      for (const file of fileArray) {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 1e6)}${ext}`;
        const uploadDir = path.join('public', basePath);
        const uploadPath = path.join(uploadDir, uniqueName);
        const publicPath = path.join(basePath, uniqueName).replace(/\\/g, '/');

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(uploadPath, file.buffer);

        uploadedPaths.push({
          fieldname: file.fieldname,
          path: publicPath,
        });
      }
    }

    return uploadedPaths;
  }

  async sendOtpMail(email, otp, subject) {
    try {
      if (!email || !otp || !subject) {
        throw new ErrorHandler('Email, OTP, and subject are required', 400);
      }
      await sendMail({
        template: EmailTemplates.otp,
        subject,
        otp,
        email,
        type: EmailEnums.otp,
      });
      logger.info(`OTP email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}:`, error);
      throw new ErrorHandler('Failed to send OTP email', 500);
    }
  }

  async universalMail(email, data, subject, type) {
    try {
      if (!email || !subject || !type || !EmailTemplates[type] || !EmailEnums[type]) {
        throw new ErrorHandler('Invalid email parameters or template type', 400);
      }
      await sendMail({
        template: EmailTemplates[type],
        subject,
        data,
        email,
        type: EmailEnums[type],
      });
      logger.info(`Email of type ${type} sent to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send ${type} email to ${email}:`, error);
      throw new ErrorHandler(`Failed to send ${type} email`, 500);
    }
  }

  async generateUniqueBranchCode(city, length = 6) {
    // Extract first 3 letters of city name and convert to uppercase
    const cityPrefix = city.slice(0, 3).toUpperCase();

    // Ensure the prefix is exactly 3 characters
    if (cityPrefix.length !== 3) {
      throw new Error('City name must have at least 3 characters');
    }

    let sequence = 1;

    while (true) {
      // Format number as 3-digit string (e.g., 001, 002)
      const numberPart = sequence.toString().padStart(3, '0');
      const code = `${cityPrefix}${numberPart}`;

      // Ensure total length does not exceed specified length
      if (code.length > length) {
        throw new Error(`Generated code exceeds length limit of ${length}`);
      }

      // Check uniqueness in DB
      const exists = await prisma.branch.findFirst({
        where: { code },
      });

      if (!exists) {
        return code; // Unique code found
      }

      // Increment sequence for next attempt
      sequence++;
    }
  }

  async insertLeadTimeline({ leadId, title, description, createdById }) {
    try {
      // Validate inputs
      if (!leadId || typeof leadId !== 'string' || !leadId.trim()) {
        throw new Error('leadId is required and must be a non-empty string');
      }
      if (!title || typeof title !== 'string' || !title.trim()) {
        throw new Error('title is required and must be a non-empty string');
      }

      // Create LeadTimeline
      const leadTimeline = await prisma.leadTimeline.create({
        data: {
          leadId,
          title: title.trim(),
          description: description?.trim() || null,
          createdById: createdById || null,
        },
      });

      return {
        success: true,
        message: 'Lead timeline entry created successfully',
        data: leadTimeline,
      };
    } catch (error) {
      console.error('Error creating lead timeline:', error.message);
      throw new Error(error.message || 'Failed to create lead timeline');
    }
  }

}

export default BaseController;