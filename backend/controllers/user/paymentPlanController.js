import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class PaymentPlanController extends BaseController {
  constructor() {
    super();
    this.model = prisma.paymentPlan;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.delete = this.delete.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, modelType, startDate, endDate, branchId: filterBranchId } = req.query;
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
      if (modelType) {
        filters.modelType = modelType;
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
        // No userId filter; fetch all payment plans
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
        // Only fetch projects for the current manager
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      // Common select clause
      // Base select without branch
      const baseSelect = {
        id: true,
        name: true,
        modelType: true,
        duration: true,
        downPayment: true,
        installment: true,
        discountPercentage: true,
        guaranteedRoi: true,
        specialCondition: true,
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
      const [totalItems, paymentPlans] = await Promise.all([
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
        paymentPlans: paymentPlans.map((plan) => ({
          ...plan,
          _id: plan.id,
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
        modelType,
        duration,
        downPayment,
        installment,
        discountPercentage,
        guaranteedRoi,
        specialCondition,
        branchId: bodyBranchId
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
        return this.handleError(next, 'Payment plan name is required', 400);
      }

      // Validate numeric fields
      if (downPayment && (isNaN(downPayment) || parseFloat(downPayment) < 0)) {
        return this.handleError(next, 'Down payment must be a positive number', 400);
      }
      if (installment && (isNaN(installment) || parseFloat(installment) < 0)) {
        return this.handleError(next, 'Installment amount must be a positive number', 400);
      }
      if (discountPercentage && (isNaN(discountPercentage) || parseFloat(discountPercentage) < 0)) {
        return this.handleError(next, 'Discount percentage must be a positive number', 400);
      }
      if (guaranteedRoi && (isNaN(guaranteedRoi) || parseFloat(guaranteedRoi) < 0)) {
        return this.handleError(next, 'Guaranteed ROI must be a positive number', 400);
      }

      // Check for duplicate payment plan name
      const existingPaymentPlan = await this.model.findFirst({
        where: { name: name.trim(), deletedAt: null },
      });
      if (existingPaymentPlan) {
        return this.handleError(next, 'Payment plan name already exists', 422);
      }

      const paymentPlan = await this.model.create({
        data: {
          userId,
          name: name.trim(),
          branchId: branchId || null,
          modelType: modelType?.trim() || null,
          duration: duration?.toString() || null,
          downPayment: downPayment?.toString() || null,
          installment: installment?.toString() || null,
          discountPercentage: discountPercentage?.toString() || null,
          guaranteedRoi: guaranteedRoi?.toString() || null,
          specialCondition: specialCondition?.trim() || null,
          status: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Payment plan created successfully',
        paymentPlan: { ...paymentPlan, _id: paymentPlan.id },
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

      const paymentPlan = await this.model.findFirst({
        where: filters,
        select: {
          id: true,
          name: true,
          modelType: true,
          duration: true,
          downPayment: true,
          installment: true,
          discountPercentage: true,
          guaranteedRoi: true,
          specialCondition: true,
          status: true,
          createdAt: true,
          deletedAt: true,
          branchId: true,
          branch: { select: { name: true, code: true } },
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
        },
      });

      if (!paymentPlan) {
        return this.handleError(next, 'Payment plan not found', 404);
      }

      if (!paymentPlan.branchId) {
        return this.handleError(next, 'Branch Not Attach To Payment plan', 404);
      }

      if (paymentPlan.branchId != branchId && role != 'ADMIN') {
        return this.handleError(next, 'Unauthorized access', 403);
      }

      return res.status(200).json({
        success: true,
        paymentPlan: { ...paymentPlan, _id: paymentPlan.id },
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
        modelType,
        duration,
        downPayment,
        installment,
        discountPercentage,
        guaranteedRoi,
        specialCondition,
        branchId: bodyBranchId
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

      const existingPaymentPlan = await this.model.findFirst({
        where: filters,
      });
      if (!existingPaymentPlan) {
        return this.handleError(next, 'Payment plan not found or not authorized', 404);
      }

      // Validate inputs
      if (name && !name.trim()) {
        return this.handleError(next, 'Payment plan name cannot be empty', 400);
      }
      if (downPayment && (isNaN(downPayment) || parseFloat(downPayment) < 0)) {
        return this.handleError(next, 'Down payment must be a positive number', 400);
      }
      if (installment && (isNaN(installment) || parseFloat(installment) < 0)) {
        return this.handleError(next, 'Installment amount must be a positive number', 400);
      }
      if (discountPercentage && (isNaN(discountPercentage) || parseFloat(discountPercentage) < 0)) {
        return this.handleError(next, 'Discount percentage must be a positive number', 400);
      }
      if (guaranteedRoi && (isNaN(guaranteedRoi) || parseFloat(guaranteedRoi) < 0)) {
        return this.handleError(next, 'Guaranteed ROI must be a positive number', 400);
      }

      // Check for duplicate name
      if (name && name.trim() !== existingPaymentPlan.name) {
        const nameExists = await this.model.findFirst({
          where: { name: name.trim(), deletedAt: null },
        });
        if (nameExists) {
          return this.handleError(next, 'Payment plan name already exists', 422);
        }
      }

      const updatedPaymentPlan = await this.model.update({
        where: { id },
        data: {
          name: name?.trim() ?? existingPaymentPlan.name,
          modelType: modelType?.trim() ?? existingPaymentPlan.modelType,
          duration: duration?.toString() ?? existingPaymentPlan.duration,
          downPayment: downPayment?.toString() ?? existingPaymentPlan.downPayment,
          installment: installment?.toString() ?? existingPaymentPlan.installment,
          discountPercentage: discountPercentage?.toString() ?? existingPaymentPlan.discountPercentage,
          guaranteedRoi: guaranteedRoi?.toString() ?? existingPaymentPlan.guaranteedRoi,
          specialCondition: specialCondition?.trim() ?? existingPaymentPlan.specialCondition,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Payment plan updated successfully',
        paymentPlan: { ...updatedPaymentPlan, _id: updatedPaymentPlan.id },
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

      const paymentPlan = await this.model.findFirst({
        where: filters,
      });
      if (!paymentPlan) {
        return this.handleError(next, 'Payment plan not found or not authorized', 404);
      }

      const newStatus = !paymentPlan.status;

      const updatedPaymentPlan = await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Payment plan status updated successfully to ${newStatus ? 'Active' : 'Inactive'}`,
        paymentPlan: { ...updatedPaymentPlan, _id: updatedPaymentPlan.id },
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

      const paymentPlan = await this.model.findFirst({
        where: filters,
      });
      if (!paymentPlan) {
        return this.handleError(next, 'Payment plan not found or not authorized', 404);
      }

      const newDeletedAt = paymentPlan.deletedAt ? null : new Date();

      const updatedPaymentPlan = await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `Payment plan has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
        paymentPlan: { ...updatedPaymentPlan, _id: updatedPaymentPlan.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }
}

export default new PaymentPlanController();