import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message }) =>
        `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Admin user data
const adminUserData = {
  name: process.env.ADMIN_NAME || 'Sameer Khanzada',
  email: process.env.ADMIN_EMAIL || 'alisameer52718@gmail.com',
  phone: process.env.ADMIN_PHONE || '03132141748',
  profile: process.env.ADMIN_PROFILE || null,
  role: process.env.ADMIN_ROLE || 'ADMIN', // Default role
  status: true,
  deletedAt: null,
  branchId: process.env.ADMIN_BRANCH_ID || null, // Optional for ADMIN
};

const prisma = new PrismaClient();

const seedAdminUser = async () => {
  try {
    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL is not defined in .env');
      process.exit(1);
    }

    // Allowed roles (no SUPER_ADMIN anymore)
    const ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'AGENT'];
    if (!ALLOWED_ROLES.includes(adminUserData.role)) {
      logger.error(
        `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`
      );
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: adminUserData.email.toLowerCase() },
    });
    if (existingUser) {
      logger.warn(`User with email ${adminUserData.email} already exists`);
      process.exit(0);
    }

    // Validate branchId rules
    let validBranchId = null;
    if (['MANAGER', 'AGENT'].includes(adminUserData.role)) {
      if (!adminUserData.branchId) {
        logger.error('branchId is required for MANAGER and AGENT roles');
        process.exit(1);
      }
      const branch = await prisma.branch.findFirst({
        where: { id: adminUserData.branchId, deletedAt: null },
      });
      if (!branch) {
        logger.error(`Invalid branch ID provided: ${adminUserData.branchId}`);
        process.exit(1);
      }
      validBranchId = adminUserData.branchId;
    } else if (adminUserData.role === 'ADMIN' && adminUserData.branchId) {
      // If ADMIN has branchId, validate it
      const branch = await prisma.branch.findFirst({
        where: { id: adminUserData.branchId, deletedAt: null },
      });
      if (!branch) {
        logger.error(`Invalid branch ID provided: ${adminUserData.branchId}`);
        process.exit(1);
      }
      validBranchId = adminUserData.branchId;
    }

    // Create user
    const adminUser = await prisma.user.create({
      data: {
        name: adminUserData.name,
        email: adminUserData.email.toLowerCase(),
        phone: adminUserData.phone,
        profile: adminUserData.profile,
        role: adminUserData.role,
        status: adminUserData.status,
        deletedAt: adminUserData.deletedAt,
        branchId: validBranchId,
        ...(validBranchId && {
          managedBranches: {
            connect: { id: validBranchId },
          },
        }),
      },
    });

    logger.info(
      `✅ User seeded successfully: ${adminUser.email} with role ${adminUser.role}`
    );
    process.exit(0);
  } catch (error) {
    console.error(error);
    logger.error(`❌ Error seeding user: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    logger.info('PostgreSQL disconnected');
  }
};

seedAdminUser();
