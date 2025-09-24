import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class ProjectController extends BaseController {
  constructor() {
    super();
    this.model = prisma.project;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, city, state, startDate, endDate, branchId: filterBranchId } = req.query;
      const { id: userId, role: userRole, branchId } = req.user || {};

      // Validate user authentication
      if (!userId || !userRole) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skipNum = (pageNum - 1) * limitNum;

      // Validate pagination
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ success: false, message: 'Invalid page number' });
      }
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ success: false, message: 'Invalid limit value' });
      }

      // Validate date range
      if ((startDate && !endDate) || (!startDate && endDate)) {
        return res.status(400).json({ success: false, message: 'Both startDate and endDate are required for date range filtering' });
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid date format' });
        }
        if (start > end) {
          return res.status(400).json({ success: false, message: 'startDate must be before endDate' });
        }
      }

      // Build filters
      const filters = {};
      if (isDeleted === 'true') {
        filters.deletedAt = { not: null };
      } else {
        filters.deletedAt = null;
      }
      if (city) filters.city = { contains: city, mode: 'insensitive' };
      if (state) filters.state = { contains: state, mode: 'insensitive' };
      if (startDate && endDate) {
        filters.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // if (filterBranchId) {
      //   filters.branchId = filterBranchId;
      // }

      // Role-based user filtering
      // if (userRole === 'ADMIN') {
      //   // No userId filter; fetch all projects
      // } else if (userRole === 'MANAGER' || userRole === 'AGENT') {
      //   // Only fetch projects for the current manager
      //   filters.branchId = branchId;
      // } else {
      //   return res.status(403).json({ success: false, message: 'Unauthorized role' });
      // }

      // Common select clause
      // Base select (branch excluded)
      const select = {
        id: true,
        name: true,
        brand: true,
        location: true,
        city: true,
        state: true,
        size: true,
        price: true,
        unit: true,
        breakDown: true,
        totalUnits: true,
        totalAcres: true,
        possessionYear: true,
        operationalDate: true,
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
      };

      // Final select based on role
      // const select =
      //   userRole !== 'ADMIN'
      //     ? baseSelect
      //     : {
      //       ...baseSelect,
      //       branch: {
      //         select: {
      //           id: true,
      //           name: true,
      //           code: true,
      //         },
      //       },
      //     };


      // Execute queries concurrently
      const [totalItems, projects] = await Promise.all([
        prisma.project.count({ where: filters }),
        prisma.project.findMany({
          where: filters,
          select,
          orderBy: { createdAt: 'desc' },
          skip: skipNum,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        projects: projects.map((project) => ({
          ...project,
          _id: project.id,
        })),
        pagination: {
          currentPage: pageNum,
          pageSize: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'An unexpected error occurred',
      });
    } finally {
      await prisma.$disconnect();
    }
  }

  async insert(req, res, next) {
    try {
      const { name, brand, location, city, state, size, price, unit, breakDown, totalUnits, totalAcres, possessionYear, operationalDate, branchId: bodyBranchId } = req.body;
      let { id: userId, role, branchId } = req.user || {};

      // if (role == 'ADMIN' && !bodyBranchId) {
      //   return this.handleError(next, 'BranchId is required', 422);
      // }

      // if (role == 'ADMIN') {
      //   branchId = bodyBranchId;
      // }

      // Validate required fields
      if (!name?.trim()) {
        return this.handleError(next, 'Project name is required', 400);
      }

      // Validate numeric fields
      if (totalUnits && (isNaN(totalUnits) || totalUnits < 0)) {
        return this.handleError(next, 'Total units must be a positive number', 400);
      }
      if (totalAcres && (isNaN(totalAcres) || totalAcres < 0)) {
        return this.handleError(next, 'Total acres must be a positive number', 400);
      }
      if (possessionYear && (isNaN(possessionYear) || possessionYear < 1900 || possessionYear > 2100)) {
        return this.handleError(next, 'Invalid possession year', 400);
      }
      if (operationalDate && isNaN(Date.parse(operationalDate))) {
        return this.handleError(next, 'Invalid operational date', 400);
      }

      // Check for duplicate project name
      const existingProject = await this.model.findFirst({
        where: { name: name.trim(), userId, deletedAt: null },
      });
      if (existingProject) {
        return this.handleError(next, 'Project name already exists', 422);
      }

      const project = await this.model.create({
        data: {
          userId,
          name: name.trim(),
          brand: brand?.trim(),
          // branchId: branchId || null,
          location: location?.trim(),
          city: city?.trim(),
          state: state?.trim(),
          size: size,
          price: price,
          unit: unit,
          breakDown: breakDown?.trim(),
          totalUnits: totalUnits ? parseInt(totalUnits) : null,
          totalAcres: totalAcres ? parseFloat(totalAcres) : null,
          possessionYear: possessionYear ? parseInt(possessionYear) : null,
          operationalDate: operationalDate ? new Date(operationalDate) : null,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async info(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId, branchId, role } = req.user || {};

      const project = await this.model.findFirst({
        where: { deletedAt: null, id },
        select: {
          id: true,
          name: true,
          brand: true,
          location: true,
          city: true,
          state: true,
          size: true,
          price: true,
          unit: true,
          breakDown: true,
          totalUnits: true,
          totalAcres: true,
          possessionYear: true,
          operationalDate: true,
          status: true,
          createdAt: true,
          // branchId: true,
          // branch: { select: { name: true, code: true } },
          user: { select: { name: true, email: true } },
        },
      });

      if (!project) {
        return this.handleError(next, 'Project not found', 404);
      }

      // if (!project.branchId) {
      //   return this.handleError(next, 'Branch Not Attach To Project', 404);
      // }

      // if (project.branchId != branchId && role != 'ADMIN') {
      //   return this.handleError(next, 'Unauthorized access', 403);
      // }

      return res.status(200).json({
        success: true,
        project: {
          ...project,
          _id: project.id,
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async update(req, res, next) {
    try {
      const {
        name,
        brand,
        location,
        city,
        state,
        size,
        price,
        unit,
        breakDown,
        totalUnits,
        totalAcres,
        possessionYear,
        operationalDate,
        // branchId: bodyBranchId
      } = req.body;
      const { id } = req.params;
      let { id: userId, branchId, role } = req.user || {};

      // if (role == 'ADMIN' && !bodyBranchId) {
      //   return this.handleError(next, 'BranchId is required', 422);
      // }

      // if (role == 'ADMIN') {
      //   branchId = bodyBranchId;
      // }

      const existingProject = await this.model.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existingProject) {
        return this.handleError(next, 'Project not found', 404);
      }

      // Validate inputs
      if (name && !name.trim()) {
        return this.handleError(next, 'Project name cannot be empty', 400);
      }
      if (totalUnits && (isNaN(totalUnits) || totalUnits < 0)) {
        return this.handleError(next, 'Total units must be a positive number', 400);
      }
      if (totalAcres && (isNaN(totalAcres) || totalAcres < 0)) {
        return this.handleError(next, 'Total acres must be a positive number', 400);
      }
      if (possessionYear && (isNaN(possessionYear) || possessionYear < 1900 || possessionYear > 2100)) {
        return this.handleError(next, 'Invalid possession year', 400);
      }
      if (operationalDate && isNaN(Date.parse(operationalDate))) {
        return this.handleError(next, 'Invalid operational date', 400);
      }

      // Check for duplicate name
      if (name && name.trim() !== existingProject.name) {
        const nameExists = await this.model.findFirst({
          where: { name: name.trim(), userId, deletedAt: null },
        });
        if (nameExists) {
          return this.handleError(next, 'Project name already exists', 422);
        }
      }

      const updatedProject = await this.model.update({
        where: { id },
        data: {
          name: name?.trim() ?? existingProject.name,
          brand: brand?.trim() ?? existingProject.brand,
          location: location?.trim() ?? existingProject.location,
          city: city?.trim() ?? existingProject.city,
          state: state?.trim() ?? existingProject.state,
          size: size ?? existingProject.size,
          price: price ?? existingProject.price,
          unit: unit ?? existingProject.unit,
          breakDown: breakDown?.trim() ?? existingProject.breakDown,
          totalUnits: totalUnits !== undefined ? parseInt(totalUnits) : existingProject.totalUnits,
          totalAcres: totalAcres !== undefined ? parseFloat(totalAcres) : existingProject.totalAcres,
          possessionYear: possessionYear !== undefined ? parseInt(possessionYear) : existingProject.possessionYear,
          operationalDate: operationalDate ? new Date(operationalDate) : existingProject.operationalDate,
          // branchId
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        project: { ...updatedProject, _id: updatedProject.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async status(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user || {};

      const project = await this.model.findFirst({
        where: { deletedAt: null, id, userId },
      });
      if (!project) {
        return this.handleError(next, 'Project not found', 404);
      }

      const newStatus = !project.status;

      const updatedProject = await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Project status updated successfully to ${newStatus ? 'Active' : 'Inactive'}`,
        project: { ...updatedProject, _id: updatedProject.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user || {};

      const project = await this.model.findFirst({
        where: { id, userId },
      });
      if (!project) {
        return this.handleError(next, 'Project not found', 404);
      }

      const newDeletedAt = project.deletedAt ? null : new Date();

      const updatedProject = await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `Project has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
        project: { ...updatedProject, _id: updatedProject.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }
}

export default new ProjectController();