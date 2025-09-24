import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class AuthController extends BaseController {
  constructor() {
    super();
    this.model = prisma.user;
    this.signIn = this.signIn.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async signIn(req, res, next) {
    try {
      const { email } = req.body;

      // Validate input
      const validationError = this.validateRequiredFields(req.body, ['email']);
      if (validationError) {
        return res.status(400).json(validationError);
      }

      const normalizedEmail = email.toLowerCase();

      // Fetch user by email with role
      const user = await this.model.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profile: true,
          status: true,
          deletedAt: true,
          role: true,
          branchId: true,
        },
      });

      if (!user) {
        return this.handleError(next, 'Access Denied: Your email is not authorized. Please contact your Administrator or HR Manager for access.', 404);
      }

      if (user.deletedAt) {
        return this.handleError(next, 'Your account is deleted. Please contact support.', 403);
      }

      if (!user.status) {
        return this.handleError(next, 'Your account is locked. Please contact support.', 403);
      }

      let branch;
      if (user.role !== 'ADMIN') {
        if (!user.branchId) {
          return this.handleError(next, 'No branch assigned to your account. Please contact admin.', 403);
        }

        branch = await prisma.branch.findFirst({
          where: { id: user.branchId, deletedAt: null },
          select: { id: true, name: true },
        });

        if (!branch) {
          return this.handleError(next, 'No active branch assigned to your account. Please contact admin.', 403);
        }
      }

      // Generate auth token
      // const token = this.generateToken(user.id, '365d');

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          email: user.email,
          role: user.role || null,
          branch: user.branchId || null,
        },
      });

    } catch (error) {
      return this.handleError(next, error.message || 'Failed to login', 500);
    }
  }
  async forgotPassword(req, res, next) {
    const { email } = req.body;

    try {
      // Validate required fields
      const requiredFields = ['email'];
      const validationResult = this.validateRequiredFields(req.body, requiredFields);
      if (validationResult) {
        return res.status(400).json(validationResult);
      }

      // Fetch user
      const user = await this.model.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          status: true,
          deletedAt: true,
          email: true,
        },
      });

      if (!user) {
        return this.handleError(next, 'User account not found', 404);
      }

      if (user.deletedAt) {
        return this.handleError(next, 'Your account is deleted. Please contact support.', 403);
      }

      if (!user.status) {
        return this.handleError(next, 'Your account is locked. Please contact support.', 403);
      }

      // Generate token and OTP
      const token = this.generateToken(user.id, '15m');
      await this.sendOtpMail(user.email, `${req.headers.origin}/dashboard/reset-password?token=${token}`, 'YOUR ONE TIME OTP IS HERE');

      return res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email',
        token,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to process request', 500);
    }
  }

  async resetPassword(req, res, next) {
    const { password } = req.body;
    const { id } = req.user;

    try {
      // Validate required fields
      const requiredFields = ['password'];
      const validationResult = this.validateRequiredFields(req.body, requiredFields);
      if (validationResult) {
        return res.status(400).json(validationResult);
      }

      // Fetch user
      const user = await this.model.findUnique({
        where: { id },
      });

      if (!user) {
        return this.handleError(next, 'Account not found', 404);
      }

      if (user.deletedAt) {
        return this.handleError(next, 'Account is deleted', 400);
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password
      await this.model.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to reset password', 500);
    }
  }
}

export default new AuthController();
