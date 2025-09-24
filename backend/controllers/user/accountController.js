import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class AccountController extends BaseController {
  constructor() {
    super();
    this.model = prisma.user;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, role, branchId, startDate, endDate } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skipNum = (pageNum - 1) * limitNum;
      const { id, role: userRole, branchId: userBranchId } = req.user;

      if (userBranchId) {
        branchId = userBranchId;
      }

      // Restrict AGENT role access
      if (userRole === 'AGENT') {
        return this.handleError(next, 'Access denied', 403);
      }

      // Validate pagination
      if (isNaN(pageNum) || pageNum < 1) {
        return this.handleError(next, 'Invalid page number', 400);
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return this.handleError(next, 'Invalid limit value', 400);
      }

      // Validate date range
      if ((startDate && !endDate) || (!startDate && endDate)) {
        return this.handleError(next, 'Both startDate and endDate are required for date range filtering', 400);
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return this.handleError(next, 'Invalid date format', 400);
        }
        if (start > end) {
          return this.handleError(next, 'startDate must be before endDate', 400);
        }
      }

      // Build filter
      const filters = { id: { not: id } };
      if (isDeleted === 'true') {
        filters.deletedAt = { not: null };
      } else if (isDeleted === 'false' || isDeleted === undefined) {
        filters.deletedAt = null;
      }

      // Role-based filtering
      if (role) {
        if (userRole === 'ADMIN') {
          filters.role = role;
        }
        // else if (userRole === 'ADMIN') {
        //   if (['MANAGER', 'AGENT'].includes(role)) {
        //     filters.role = role;
        //   } else {
        //     return this.handleError(next, 'Invalid role filter. Only MANAGER or AGENT allowed', 400);
        //   }
        // } 
        else if (userRole === 'MANAGER') {
          if (role === 'AGENT') {
            filters.role = role;
          } else {
            return this.handleError(next, 'Invalid role filter. Only AGENT allowed', 400);
          }
        }
      } else {
        // Default role restrictions
        if (userRole === 'ADMIN') {
          filters.role = { in: ['MANAGER', 'AGENT', 'ADMIN'] };
        } else if (userRole === 'MANAGER') {
          filters.role = 'AGENT';
        }
      }

      // Branch ID filter
      if (branchId) {
        filters.branchId = branchId;
      }

      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Common select clause
      const baseSelect = {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile: true,
        role: true,
        status: true,
        branchId: true,
        createdAt: true,
        deletedAt: true,
      };

      // Build select according to role
      const finalSelect =
        userRole !== 'ADMIN'
          ? baseSelect // No branch populate for ADMIN
          : {
            ...baseSelect,
            branch: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          };
      console.log(finalSelect);

      // Execute queries concurrently
      const [totalItems, users] = await Promise.all([
        this.model.count({ where: filters }),
        this.model.findMany({
          where: filters,
          select: finalSelect,
          orderBy: { createdAt: 'desc' },
          skip: skipNum,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        users: users.map(user => ({
          ...user,
          _id: user.id,
        })),
        pagination: {
          currentPage: pageNum,
          pageSize: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await this.model.$disconnect?.();
    }
  }

  async insert(req, res, next) {
    try {
      let { name, email, phone, role, branchId } = req.body;
      const { branchId: userbranchId } = req.user;

      if (!branchId) {
        branchId = userbranchId;
      }

      const requiredFields = ['name', 'email', 'role'];
      const validationError = this.validateRequiredFields(req.body, requiredFields);
      if (validationError) return this.handleError(next, validationError.message, 422);

      // Validate role
      const ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'AGENT'];
      if (!ALLOWED_ROLES.includes(role)) {
        return this.handleError(next, `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`, 400);
      }

      // Check if email already exists
      const existingUser = await this.model.findFirst({
        where: { email, deletedAt: null },
      });
      if (existingUser) {
        return this.handleError(next, 'Email already exists', 422);
      }

      // Validate branchId if provided
      let validBranchId = null;
      if (branchId) {
        const branch = await prisma.branch.findFirst({
          where: { id: branchId, deletedAt: null },
        });
        if (!branch) {
          return this.handleError(next, 'Invalid branch ID provided', 422);
        }
        validBranchId = branchId;
      }

      // Handle profile upload
      let profile = '';
      if (req.files) {
        const uploadedPaths = await this.handleFileUploads(req.files, `user/profiles/${email}`);
        profile = uploadedPaths.find(file => file.fieldname === 'profile')?.path || '';
      }

      // Create user
      const newUser = await this.model.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim(),
          profile,
          role,
          branchId: validBranchId,
          ...(validBranchId && {
            managedBranches: {
              connect: { id: validBranchId },
            },
          }),
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
      });

    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async info(req, res, next) {
    try {
      const { id } = req.params;

      const user = await this.model.findFirst({
        where: { deletedAt: null, id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profile: true,
          role: true,
          status: true,
          branchId: true,
          createdAt: true,
        },
      });

      if (!user) {
        return this.handleError(next, 'User not found', 404);
      }

      return res.status(200).json({
        success: true,
        user: {
          ...user,
          _id: user.id,
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async update(req, res, next) {
    try {
      const { name, email, phone, role, branchId } = req.body;
      const { id } = req.params;

      const requiredFields = ['name', 'email', 'role'];
      const validationError = this.validateRequiredFields(req.body, requiredFields);
      if (validationError) return this.handleError(next, validationError.message, 422);

      // Validate role
      const ALLOWED_ROLES = ['ADMIN', 'MANAGER', 'AGENT'];
      if (!ALLOWED_ROLES.includes(role)) {
        return this.handleError(next, 'Invalid role. Must be ADMIN, MANAGER, or AGENT', 400);
      }

      const existingUser = await this.model.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existingUser) {
        return this.handleError(next, 'User not found', 404);
      }

      // Check if email is being updated to an existing one
      if (email !== existingUser.email) {
        const emailExists = await this.model.findFirst({
          where: { email, deletedAt: null },
        });
        if (emailExists) {
          return this.handleError(next, 'Email already exists', 422);
        }
      }

      // Branch handling
      let validBranchId = null;
      if (role !== 'ADMIN') {
        if (branchId) {
          const branch = await prisma.branch.findFirst({
            where: { id: branchId, deletedAt: null },
          });
          if (!branch) {
            return this.handleError(next, 'Invalid branch ID provided', 422);
          }
          validBranchId = branchId;
        }
      }
      // agar role = ADMIN hai tu validBranchId hamesha null rahegi

      // Handle profile upload
      let profile = existingUser.profile;
      if (req.files) {
        const uploadedPaths = await this.handleFileUploads(req.files, `user/profiles/${email}`);
        for (const { fieldname, path } of uploadedPaths) {
          if (fieldname === 'profile') profile = path;
        }
      }

      // Update user
      await this.model.update({
        where: { id },
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone?.trim(),
          profile,
          role,
          branchId: validBranchId, // ADMIN => null
          managedBranches: {
            set: role !== 'ADMIN' && validBranchId ? [{ id: validBranchId }] : [],
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async status(req, res, next) {
    try {
      const { id } = req.params;

      const user = await this.model.findFirst({
        where: { deletedAt: null, id },
      });
      if (!user) {
        return this.handleError(next, 'User not found', 404);
      }

      const newStatus = !user.status;

      await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `User status updated successfully to ${newStatus ? 'Active' : 'De-Active'}`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const user = await this.model.findFirst({
        where: { id },
      });
      if (!user) {
        return this.handleError(next, 'User not found', 404);
      }

      const newDeletedAt = user.deletedAt ? null : new Date();

      await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `User has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }
}

export default new AccountController();