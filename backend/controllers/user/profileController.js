import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class ProfileController extends BaseController {
  constructor() {
    super();
    this.model = prisma.user;
    this.get = this.get.bind(this);
    this.update = this.update.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  async get(req, res, next) {
    try {
      const { id } = req.user;

      const user = await this.model.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profile: true,
          role: true,
          status: true,
          branchId: true,
          // Fetch primary branch details
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              country: true,
              city: true,
              address: true,
              phone: true,
              email: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        return this.handleError(next, 'User not found', 404);
      }

      return res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to retrieve profile', 500);
    }
  }

  async update(req, res, next) {
    const { name, phone, timeZone, currency, notifications = {} } = req.body;
    const { id } = req.user;

    try {
      // Validate required fields
      const requiredFields = ['name', 'phone'];
      const validationResult = this.validateRequiredFields(req.body, requiredFields);
      if (validationResult) {
        return res.status(400).json(validationResult);
      }

      const existingUser = await this.model.findUnique({ where: { id } });
      if (!existingUser) {
        return this.handleError(next, 'User not found', 404);
      }

      let profile = existingUser.profile;
      if (req.files) {
        const uploadedPaths = await this.handleFileUploads(req.files, `user/profile/${id}`);
        for (const { fieldname, path } of uploadedPaths) {
          if (fieldname === 'profile') profile = path;
        }
      }

      // 🔹 Convert notifications to boolean safely
      const emailNotification = notifications.email === true || notifications.email === 'true' || notifications.email === 1;
      const whatsappNotification = notifications.whatsapp === true || notifications.whatsapp === 'true' || notifications.whatsapp === 1;
      const smsNotification = notifications.sms === true || notifications.sms === 'true' || notifications.sms === 1;

      const updatedUser = await this.model.update({
        where: { id },
        data: {
          name: name.trim(),
          phone: phone.trim(),
          timeZone: timeZone?.trim(),
          currency: currency?.trim(),
          emailNotification,
          whatsappNotification,
          smsNotification,
          profile,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profile: true,
          role: { select: { name: true, permission: true } },
          timeZone: true,
          currency: true,
          emailNotification: true,
          whatsappNotification: true,
          smsNotification: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Profile Saved Successfully',
        user: {
          _id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          profile: updatedUser.profile,
          role: updatedUser.role || null,
          timeZone: updatedUser.timeZone || null,
          currency: updatedUser.currency || null,
          notifications: {
            email: updatedUser.emailNotification,
            whatsapp: updatedUser.whatsappNotification,
            sms: updatedUser.smsNotification,
          },
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to update profile', 500);
    }
  }


  async changePassword(req, res, next) {
    try {
      const { password, newPassword } = req.body;
      const { id } = req.user;

      if (!password || !newPassword) {
        return this.handleError(next, 'Both password and newPassword are required.', 400);
      }

      const user = await this.model.findUnique({
        where: { id },
        select: { password: true },
      });
      if (!user) {
        return this.handleError(next, 'User not found', 404);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return this.handleError(next, 'Current password is invalid.', 400);
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.model.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred.', 500);
    }
  }
}

export default new ProfileController();
