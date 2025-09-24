import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class TerritoryController extends BaseController {
  constructor() {
    super();
    this.model = prisma.territory;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, startDate, endDate, branchId: filterBranchId } = req.query;
      const { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
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

      // Build filters
      const filters = {};
      if (isDeleted === 'true') {
        filters.deletedAt = { not: null };
      } else {
        filters.deletedAt = null;
      }
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Role-based user filtering
      if (role === 'ADMIN') {
        // No userId filter
      }
      // else if (role === 'ADMIN') {
      //   if (!branchId) {
      //     return this.handleError(next, 'Admin must be associated with a branch', 400);
      //   }
      //   const branchUsers = await prisma.user.findMany({
      //     where: { branchId },
      //     select: { id: true },
      //   });
      //   const userIds = branchUsers.map(u => u.id);
      //   filters.userId = { in: userIds };
      // } 
      else if (role === 'MANAGER' || role === 'AGENT') {
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }


      if (filterBranchId) {
        filters.branchId = filterBranchId;
      }

      console.log(filters);


      // Base select (user.branch excluded)
      const baseSelect = {
        id: true,
        name: true,
        branchId: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        status: true,
        createdAt: true,
        deletedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branchId: true,
          },
        },
      };

      // Final select based on role
      const select =
        role !== 'ADMIN'
          ? baseSelect
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


      // Execute queries concurrently
      const [totalItems, territories] = await Promise.all([
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
        territories: territories.map(t => ({
          ...t,
          _id: t.id,
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
      await prisma.$disconnect();
    }
  }

  async insert(req, res, next) {
    try {
      const { name, branchId: bodyBranchId } = req.body;
      let { id: userId, role, branchId } = req.user || {};

      if (role == 'ADMIN' && !bodyBranchId) {
        return this.handleError(next, 'BranchId is required', 422);
      }

      if (role == 'ADMIN') {
        branchId = bodyBranchId;
      }

      // Validate required fields
      if (!name?.trim()) {
        return this.handleError(next, 'Territory name is required', 400);
      }

      // Check for duplicate territory name
      const existingTerritory = await this.model.findFirst({
        where: { name: name.trim(), branchId: branchId, deletedAt: null },
      });
      if (existingTerritory) {
        return this.handleError(next, 'Territory name already exists', 422);
      }

      // Validate branchId (from req.user.branchId)
      if (!branchId) {
        return this.handleError(next, 'User must be associated with a branch', 400);
      }
      const branchExists = await prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branchExists) {
        return this.handleError(next, 'Invalid branch ID', 400);
      }

      const territory = await this.model.create({
        data: {
          userId,
          branchId,
          name: name.trim(),
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Territory created successfully',
        territory: { ...territory, _id: territory.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async info(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      // Build filters
      const filters = { id, deletedAt: null };

      const territory = await this.model.findFirst({
        where: filters,
        select: {
          id: true,
          name: true,
          branchId: true,
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
          status: true,
          createdAt: true,
          deletedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              branchId: true,
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
          },
        },
      });

      if (!territory) {
        return this.handleError(next, 'Territory not found', 404);
      }

      if (!territory.branchId) {
        return this.handleError(next, 'Branch Not Attach To Territory', 404);
      }

      if (territory.branchId != branchId && role != 'ADMIN') {
        return this.handleError(next, 'Unauthorized access', 403);
      }

      return res.status(200).json({
        success: true,
        territory: { ...territory, _id: territory.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async update(req, res, next) {
    try {
      const { name, branchId: bodyBranchId } = req.body;
      const { id } = req.params;
      let { id: userId, role, branchId } = req.user || {};

      if (role == 'ADMIN' && !bodyBranchId) {
        return this.handleError(next, 'BranchId is required', 422);
      }

      if (role == 'ADMIN') {
        branchId = bodyBranchId;
      }

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      // Build filters for access check
      const filters = { id, deletedAt: null };
      if (role === 'ADMIN') {
        // No userId filter
      }
      // else if (role === 'ADMIN') {
      //   if (!branchId) {
      //     return this.handleError(next, 'Admin must be associated with a branch', 400);
      //   }
      //   const branchUsers = await prisma.user.findMany({
      //     where: { branchId },
      //     select: { id: true },
      //   });
      //   const userIds = branchUsers.map(u => u.id);
      //   filters.userId = { in: userIds };
      // } 
      else if (role === 'MANAGER' || role === 'AGENT') {
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      const existingTerritory = await this.model.findFirst({
        where: filters,
      });
      if (!existingTerritory) {
        return this.handleError(next, 'Territory not found or not authorized', 404);
      }

      // Validate inputs
      if (name && !name.trim()) {
        return this.handleError(next, 'Territory name cannot be empty', 400);
      }

      // Check for duplicate name
      if (name && name.trim() !== existingTerritory.name) {
        const nameExists = await this.model.findFirst({
          where: { name: name.trim(), deletedAt: null, },
        });
        if (nameExists) {
          return this.handleError(next, 'Territory name already exists', 422);
        }
      }

      // Validate branchId (from req.user.branchId)
      if (!branchId) {
        return this.handleError(next, 'User must be associated with a branch', 400);
      }

      const branchExists = await prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branchExists) {
        return this.handleError(next, 'Invalid branch ID', 400);
      }

      const updatedTerritory = await this.model.update({
        where: { id },
        data: {
          name: name?.trim() ?? existingTerritory.name,
          branchId,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Territory updated successfully',
        territory: { ...updatedTerritory, _id: updatedTerritory.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async status(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      // Build filters for access check
      const filters = { id, deletedAt: null };
      if (role === 'ADMIN') {
        // No userId filter
      }
      // else if (role === 'ADMIN') {
      //   if (!branchId) {
      //     return this.handleError(next, 'Admin must be associated with a branch', 400);
      //   }
      //   const branchUsers = await prisma.user.findMany({
      //     where: { branchId },
      //     select: { id: true },
      //   });
      //   const userIds = branchUsers.map(u => u.id);
      //   filters.userId = { in: userIds };
      // } 
      else if (role === 'MANAGER' || role === 'AGENT') {
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      const territory = await this.model.findFirst({
        where: filters,
      });
      if (!territory) {
        return this.handleError(next, 'Territory not found or not authorized', 404);
      }

      const newStatus = !territory.status;

      const updatedTerritory = await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Territory status updated successfully to ${newStatus ? 'Active' : 'Inactive'}`,
        territory: { ...updatedTerritory, _id: updatedTerritory.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      // Build filters for access check
      const filters = { id };
      if (role === 'ADMIN') {
        // No userId filter
      }
      // else if (role === 'ADMIN') {
      //   if (!branchId) {
      //     return this.handleError(next, 'Admin must be associated with a branch', 400);
      //   }
      //   const branchUsers = await prisma.user.findMany({
      //     where: { branchId },
      //     select: { id: true },
      //   });
      //   const userIds = branchUsers.map(u => u.id);
      //   filters.userId = { in: userIds };
      // } 
      else if (role === 'MANAGER' || role === 'AGENT') {
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      const territory = await this.model.findFirst({
        where: filters,
      });
      if (!territory) {
        return this.handleError(next, 'Territory not found or not authorized', 404);
      }

      const newDeletedAt = territory.deletedAt ? null : new Date();

      const updatedTerritory = await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `Territory has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
        territory: { ...updatedTerritory, _id: updatedTerritory.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }
}

export default new TerritoryController();