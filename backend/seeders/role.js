import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`),
  ),
  transports: [new transports.Console(), new transports.File({ filename: 'logs/error.log', level: 'error' }), new transports.File({ filename: 'logs/combined.log' })],
});

const prisma = new PrismaClient();

// Role seed data
const roleData = {
  name: process.env.ROLE_NAME || 'Admin',
  permission: process.env.ROLE_PERMISSIONS ? process.env.ROLE_PERMISSIONS.split(',') : ['read', 'write', 'delete'],
  adminId: process.env.ROLE_ADMIN_ID ? parseInt(process.env.ROLE_ADMIN_ID, 10) : null, // optional reference to an admin user
  status: true,
  deletedAt: null,
};

const seedRole = async () => {
  try {
    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL is not defined in .env');
      process.exit(1);
    }

    // Check for existing role
    const existingRole = await prisma.role.findFirst({
      where: { name: roleData.name },
    });

    if (existingRole) {
      logger.warn(`⚠️ Role with name "${roleData.name}" already exists`);
      process.exit(0);
    }

    // Create the role
    const role = await prisma.role.create({
      data: {
        name: roleData.name,
        permission: roleData.permission,
        adminId: roleData.adminId,
        status: roleData.status,
        deletedAt: roleData.deletedAt,
      },
    });

    logger.info(`✅ Role "${role.name}" seeded successfully`);
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Error seeding role: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    logger.info('🔌 PostgreSQL disconnected');
  }
};

seedRole();
