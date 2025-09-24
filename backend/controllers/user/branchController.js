import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class BranchController extends BaseController {
  constructor() {
    super();
    this.model = prisma.branch;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, startDate, endDate } = req.query;
      const { id: createdById } = req.user || {};
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skipNum = (pageNum - 1) * limitNum;

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
      const filters = {};
      if (isDeleted === 'true') {
        filters.deletedAt = { not: null };
      } else if (isDeleted === 'false' || isDeleted === undefined) {
        filters.deletedAt = null;
      }
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Common select clause
      const select = {
        id: true,
        name: true,
        code: true,
        country: true,
        city: true,
        address: true,
        timezone: true,
        currency: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        createdBy: { select: { id: true, name: true, email: true, profile: true } },
      };

      // Execute queries concurrently
      const [totalItems, branches] = await Promise.all([
        this.model.count({ where: filters }),
        this.model.findMany({
          where: filters,
          select,
          orderBy: { createdAt: 'desc' },
          skip: skipNum,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        branches: branches.map((branch) => ({
          ...branch,
          _id: branch.id,
          createdBy: branch.createdBy || null,
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
      const { name, country, city, address, timezone, currency, phone, email } = req.body;
      const { id: createdById } = req.user || {};

      // Validate required fields
      const requiredFields = ['name', 'country', 'city', 'address', 'timezone', 'currency', 'phone', 'email'];
      const validationError = this.validateRequiredFields(req.body, requiredFields);
      if (validationError) return res.status(200).json(validationError);

      // Check if branch name or code already exists
      const existingBranch = await this.model.findFirst({
        where: {
          OR: [{ name: name.trim() }],
          deletedAt: null,
        },
      });
      if (existingBranch) {
        return this.handleError(next, 'Branch name or code already exists', 422);
      }

      // Create branch
      const newBranch = await this.model.create({
        data: {
          createdById,
          name: name.trim(),
          code: await this.generateUniqueBranchCode(city, 6),
          country: country.trim(),
          city: city.trim(),
          address: address.trim(),
          timezone: timezone.trim(),
          currency: currency.trim(),
          phone: phone.trim(),
          email: email.trim(),
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Branch created successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async info(req, res, next) {
    try {
      const { id } = req.params;
      const { id: createdById } = req.user || {};
      // console.log(id);
      
      const branch = await this.model.findFirst({
        where: { deletedAt: null, id },
        select: {
          id: true,
          name: true,
          code: true,
          country: true,
          city: true,
          address: true,
          timezone: true,
          currency: true,
          phone: true,
          email: true,
          status: true,
          createdAt: true,
          createdBy: { select: { id: true, name: true, email: true, profile: true } },
        },
      });

      if (!branch) {
        return this.handleError(next, 'Branch not found', 404);
      }

      return res.status(200).json({
        success: true,
        branch: {
          ...branch,
          _id: branch.id,
          createdBy: branch.createdBy || null,
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async update(req, res, next) {
    try {
      const { name, country, city, address, timezone, currency, phone, email } = req.body;
      const { id } = req.params;
      const { id: createdById } = req.user || {};

      // Validate required fields
      const requiredFields = ['name', 'country', 'city', 'address', 'timezone', 'currency', 'phone', 'email'];
      const validationError = this.validateRequiredFields(req.body, requiredFields);
      if (validationError) return res.status(200).json(validationError);

      const existingBranch = await this.model.findFirst({
        where: { id, createdById, deletedAt: null },
      });
      if (!existingBranch) {
        return this.handleError(next, 'Branch not found', 404);
      }

      // Check if name or code is being updated to an existing one
      if (name !== existingBranch.name) {
        const nameOrCodeExists = await this.model.findFirst({
          where: {
            OR: [{ name: name.trim() }],
            id: { not: id },
            deletedAt: null,
          },
        });
        if (nameOrCodeExists) {
          return this.handleError(next, 'Branch name or code already exists', 422);
        }
      }

      // Update branch
      await this.model.update({
        where: { id },
        data: {
          name: name.trim(),
          country: country.trim(),
          city: city.trim(),
          address: address.trim(),
          timezone: timezone.trim(),
          currency: currency.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Branch updated successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async status(req, res, next) {
    try {
      const { id } = req.params;
      const { id: createdById } = req.user || {};

      const branch = await this.model.findFirst({
        where: { deletedAt: null, id, createdById },
      });
      if (!branch) {
        return this.handleError(next, 'Branch not found', 404);
      }

      const newStatus = !branch.status;

      await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Branch status updated successfully to ${newStatus ? 'Active' : 'De-Active'}`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { id: createdById } = req.user || {};

      const branch = await this.model.findFirst({
        where: { id, createdById },
      });
      if (!branch) {
        return this.handleError(next, 'Branch not found', 404);
      }

      const newDeletedAt = branch.deletedAt ? null : new Date();

      await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      // Clear branchId for users associated with this branch if deleted
      if (newDeletedAt) {
        await prisma.user.updateMany({
          where: { branchId: id },
          data: { branchId: null },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Branch has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }
}

export default new BranchController();