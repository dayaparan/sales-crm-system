import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class UnitTypeController extends BaseController {
  constructor() {
    super();
    this.model = prisma.unitType;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, projectId, startDate, endDate, branchId: filterBranchId } = req.query;
      const { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

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

      // Build filters
      const filters = {};
      if (isDeleted === 'true') {
        filters.deletedAt = { not: null };
      } else {
        filters.deletedAt = null;
      }
      if (projectId) {
        filters.projectId = projectId;
      }
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
      if (filterBranchId) {
        filters.branchId = filterBranchId;
      }

      // Role-based user filtering
      if (role === 'ADMIN') {
        // No userId filter; fetch all unit types
      }
      // else if (role === 'ADMIN') {
      //   if (!branchId) {
      //     return this.handleError(next, 'Admin must be associated with a branch', 400);
      //   }
      //   // Fetch users associated with the admin's branch
      //   const branchUsers = await prisma.user.findMany({
      //     where: { branchId },
      //     select: { id: true },
      //   });
      //   const userIds = branchUsers.map(u => u.id);
      //   filters.userId = { in: userIds };
      // } 
      else if (role === 'MANAGER' || role === 'AGENT') {
        // Only fetch projects for the current manager
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      // Common select clause
      // Base select (ADMIN case: user.branch excluded)
      const baseSelect = {
        id: true,
        name: true,
        projectId: true,
        sizeSqft: true,
        basePriceLakhs: true,
        totalUnits: true,
        availableUnits: true,
        fineAcresEligible: true,
        propertyTypeEligible: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            branchId: true,
          },
        },
        project: {
          select: {
            name: true,
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
      const [totalItems, unitTypes] = await Promise.all([
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
        unitTypes: unitTypes.map((unitType) => ({
          ...unitType,
          _id: unitType.id,
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
      const {
        name,
        projectId,
        sizeSqft,
        basePriceLakhs,
        totalUnits,
        fineAcresEligible,
        propertyTypeEligible,
        branchId: bodyBranchId,
      } = req.body;
      let { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      if (role == 'ADMIN' && !bodyBranchId) {
        return this.handleError(next, 'BranchId is required', 422);
      }

      if (role == 'ADMIN') {
        branchId = bodyBranchId;
      }

      // Validate required fields
      if (!name?.trim()) {
        return this.handleError(next, 'Unit type name is required', 400);
      }

      // Validate numeric fields
      if (sizeSqft && (isNaN(sizeSqft) || sizeSqft < 0)) {
        return this.handleError(next, 'Size in square feet must be a positive number', 400);
      }
      if (basePriceLakhs && (isNaN(basePriceLakhs) || basePriceLakhs < 0)) {
        return this.handleError(next, 'Base price in lakhs must be a positive number', 400);
      }
      if (totalUnits && (isNaN(totalUnits) || totalUnits < 0)) {
        return this.handleError(next, 'Total units must be a positive number', 400);
      }

      // Validate projectId and access
      if (projectId) {
        let project;
        if (role === 'ADMIN') {
          project = await prisma.project.findFirst({
            where: { id: projectId, deletedAt: null },
          });
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
        //   project = await prisma.project.findFirst({
        //     where: { id: projectId, userId: { in: userIds }, deletedAt: null },
        //   });
        // } 
        else if (role === 'MANAGER' || role === 'AGENT') {
          // project = await prisma.project.findFirst({
          //   where: { id: projectId, userId, deletedAt: null },
          // });

          filters.branchId = branchId;

        } else {
          return this.handleError(next, 'Unauthorized role', 403);
        }
        if (!project) {
          return this.handleError(next, 'Project not found or not authorized', 404);
        }
      }

      // Check for duplicate unit type name within the same project
      if (name && projectId) {
        const existingUnitType = await this.model.findFirst({
          where: { name: name.trim(), projectId, deletedAt: null },
        });
        if (existingUnitType) {
          return this.handleError(next, 'Unit type name already exists for this project', 422);
        }
      }

      const unitType = await this.model.create({
        data: {
          userId,
          projectId,
          name: name.trim(),
          branchId: branchId || null,
          sizeSqft: sizeSqft ? parseFloat(sizeSqft) : null,
          basePriceLakhs: basePriceLakhs ? parseFloat(basePriceLakhs) : null,
          totalUnits: totalUnits ? parseInt(totalUnits) : null,
          availableUnits: totalUnits ? parseInt(totalUnits) : null,
          fineAcresEligible: fineAcresEligible !== undefined ? fineAcresEligible : null,
          propertyTypeEligible: propertyTypeEligible?.trim() || null,
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Unit type created successfully',
        unitType: { ...unitType, _id: unitType.id },
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

      const unitType = await this.model.findFirst({
        where: filters,
        select: {
          id: true,
          name: true,
          projectId: true,
          sizeSqft: true,
          basePriceLakhs: true,
          totalUnits: true,
          availableUnits: true,
          fineAcresEligible: true,
          propertyTypeEligible: true,
          status: true,
          createdAt: true,
          deletedAt: true,
          branchId: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              role: true,
              branchId: true,
              branch: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          project: { select: { name: true } },
        },
      });

      if (!unitType) {
        return this.handleError(next, 'Unit type not found', 404);
      }

      if (!unitType.branchId) {
        return this.handleError(next, 'Branch Not Attach To UnitType', 404);
      }

      if (unitType.branchId != branchId && role != 'ADMIN') {
        return this.handleError(next, 'Unauthorized access', 403);
      }

      return res.status(200).json({
        success: true,
        unitType: { ...unitType, _id: unitType.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async update(req, res, next) {
    try {
      const {
        name,
        projectId,
        sizeSqft,
        basePriceLakhs,
        totalUnits,
        fineAcresEligible,
        propertyTypeEligible,
        branchId: bodyBranchId,
      } = req.body;
      const { id } = req.params;
      let { id: userId, role, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      if (role == 'ADMIN' && !bodyBranchId) {
        return this.handleError(next, 'BranchId is required', 422);
      }

      if (role == 'ADMIN') {
        branchId = bodyBranchId;
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

      const existingUnitType = await this.model.findFirst({
        where: filters,
      });
      if (!existingUnitType) {
        return this.handleError(next, 'Unit type not found or not authorized', 404);
      }

      // Validate inputs
      if (name && !name.trim()) {
        return this.handleError(next, 'Unit type name cannot be empty', 400);
      }
      if (sizeSqft && (isNaN(sizeSqft) || sizeSqft < 0)) {
        return this.handleError(next, 'Size in square feet must be a positive number', 400);
      }
      if (basePriceLakhs && (isNaN(basePriceLakhs) || basePriceLakhs < 0)) {
        return this.handleError(next, 'Base price in lakhs must be a positive number', 400);
      }
      if (totalUnits && (isNaN(totalUnits) || totalUnits < 0)) {
        return this.handleError(next, 'Total units must be a positive number', 400);
      }

      // Validate projectId if provided
      if (projectId && projectId !== existingUnitType.projectId) {
        let project;
        if (role === 'ADMIN') {
          project = await prisma.project.findFirst({
            where: { id: projectId, deletedAt: null },
          });
        }
        // else if (role === 'ADMIN') {
        //   const branchUsers = await prisma.user.findMany({
        //     where: { branchId },
        //     select: { id: true },
        //   });
        //   const userIds = branchUsers.map(u => u.id);
        //   project = await prisma.project.findFirst({
        //     where: { id: projectId, userId: { in: userIds }, deletedAt: null },
        //   });
        // } 
        else if (role === 'MANAGER' || role === 'AGENT') {
          // project = await prisma.project.findFirst({
          //   where: { id: projectId, userId, deletedAt: null },
          // });
          filters.branchId = branchId;
        }
        if (!project) {
          return this.handleError(next, 'Project not found or not authorized', 404);
        }
      }

      // Check for duplicate name within the same project
      if (name && projectId && (name.trim() !== existingUnitType.name || projectId !== existingUnitType.projectId)) {
        const nameExists = await this.model.findFirst({
          where: { name: name.trim(), projectId, deletedAt: null },
        });
        if (nameExists) {
          return this.handleError(next, 'Unit type name already exists for this project', 422);
        }
      }

      const updatedUnitType = await this.model.update({
        where: { id },
        data: {
          name: name?.trim() ?? existingUnitType.name,
          projectId: projectId ?? existingUnitType.projectId,
          sizeSqft: sizeSqft !== undefined ? parseFloat(sizeSqft) : existingUnitType.sizeSqft,
          basePriceLakhs: basePriceLakhs !== undefined ? parseFloat(basePriceLakhs) : existingUnitType.basePriceLakhs,
          totalUnits: totalUnits !== undefined ? parseInt(totalUnits) : existingUnitType.totalUnits,
          fineAcresEligible: fineAcresEligible !== undefined ? fineAcresEligible : existingUnitType.fineAcresEligible,
          propertyTypeEligible: propertyTypeEligible?.trim() ?? existingUnitType.propertyTypeEligible,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Unit type updated successfully',
        unitType: { ...updatedUnitType, _id: updatedUnitType.id },
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

      const unitType = await this.model.findFirst({
        where: filters,
      });
      if (!unitType) {
        return this.handleError(next, 'Unit type not found or not authorized', 404);
      }

      const newStatus = !unitType.status;

      const updatedUnitType = await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Unit type status updated successfully to ${newStatus ? 'Active' : 'Inactive'}`,
        unitType: { ...updatedUnitType, _id: updatedUnitType.id },
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

      const unitType = await this.model.findFirst({
        where: filters,
      });
      if (!unitType) {
        return this.handleError(next, 'Unit type not found or not authorized', 404);
      }

      const newDeletedAt = unitType.deletedAt ? null : new Date();

      const updatedUnitType = await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `Unit type has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
        unitType: { ...updatedUnitType, _id: updatedUnitType.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }
}

export default new UnitTypeController();