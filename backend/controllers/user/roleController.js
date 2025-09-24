import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class RoleController extends BaseController {
  constructor() {
    super();
    this.model = prisma.role;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10 } = req.query;
      const { id: userId } = req.user || {};
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skipNum = (pageNum - 1) * limitNum;

      // Validate pagination
      if (isNaN(pageNum) || pageNum < 1) return this.handleError(next, 'Invalid page number', 400);
      if (isNaN(limitNum) || limitNum < 1) return this.handleError(next, 'Invalid limit value', 400);

      // Build filter
      const filters = { userId };
      if (isDeleted === 'true') {
        filters.deletedAt = { not: null };
      } else if (isDeleted === 'false' || isDeleted === undefined) {
        filters.deletedAt = null;
      }

      // Count & fetch
      const totalItems = await this.model.count({ where: filters });
      const roles = await this.model.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          permission: true,
          status: true,
          createdAt: true,
          deletedAt: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: skipNum,
        take: limitNum,
      });

      return res.status(200).json({
        success: true,
        roles: roles.map((role) => ({
          ...role,
          _id: role.id, // Map id to _id for compatibility
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
    }
  }

  async insert(req, res, next) {
    try {
      const { name, permission } = req.body;
      const { id: userId } = req.user || {};

      // Validate name if provided
      if (name && !name.trim()) {
        return this.handleError(next, 'Role name cannot be empty', 400);
      }

      // Check if role name already exists for this user
      if (name) {
        const existingRole = await this.model.findFirst({
          where: { name: name.trim(), userId, deletedAt: null },
        });
        if (existingRole) {
          return this.handleError(next, 'Role name already exists', 422);
        }
      }

      // Validate permission if provided
      if (permission && (!Array.isArray(permission) || !permission.every((p) => typeof p === 'string'))) {
        return this.handleError(next, 'Permission must be an array of strings', 400);
      }

      await this.model.create({
        data: {
          userId,
          name: name?.trim(),
          permission: permission || [],
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Role created successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async info(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user || {};

      const role = await this.model.findFirst({
        where: { deletedAt: null, id: id, userId },
        select: {
          id: true,
          name: true,
          permission: true,
          status: true,
          createdAt: true,
          branchId: true,
          user: { select: { name: true, email: true } },
        },
      });

      if (!role) {
        return this.handleError(next, 'Role not found', 404);
      }

      return res.status(200).json({
        success: true,
        role: {
          ...role,
          _id: role.id, // Map id to _id for compatibility
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async update(req, res, next) {
    try {
      const { name, permission } = req.body;
      const { id } = req.params;
      const { id: userId } = req.user || {};

      // Validate name if provided
      if (name && !name.trim()) {
        return this.handleError(next, 'Role name cannot be empty', 400);
      }

      const existingRole = await this.model.findFirst({
        where: { id: id, userId, deletedAt: null },
      });
      if (!existingRole) {
        return this.handleError(next, 'Role not found', 404);
      }

      // Check if name is being updated to an existing one
      if (name && name !== existingRole.name) {
        const nameExists = await this.model.findFirst({
          where: { name: name.trim(), userId, deletedAt: null },
        });
        if (nameExists) {
          return this.handleError(next, 'Role name already exists', 422);
        }
      }

      // Validate permission if provided
      if (permission && (!Array.isArray(permission) || !permission.every((p) => typeof p === 'string'))) {
        return this.handleError(next, 'Permission must be an array of strings', 400);
      }

      await this.model.update({
        where: { id: id },
        data: {
          name: name?.trim() || existingRole.name,
          permission: permission || existingRole.permission,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Role updated successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async status(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user || {};

      const role = await this.model.findFirst({
        where: { deletedAt: null, id: id, userId },
      });
      if (!role) {
        return this.handleError(next, 'Role not found', 404);
      }

      const newStatus = !role.status;

      await this.model.update({
        where: { id: id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Role status updated successfully to ${newStatus ? 'Active' : 'De-Active'}`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user || {};

      const role = await this.model.findFirst({
        where: { id: id, userId },
      });
      if (!role) {
        return this.handleError(next, 'Role not found', 404);
      }

      const newDeletedAt = role.deletedAt ? null : new Date();

      await this.model.update({
        where: { id: id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `Role has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }
}

export default new RoleController();
