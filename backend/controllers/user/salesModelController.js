import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class SalesModelController extends BaseController {
    constructor() {
        super();
        this.model = prisma.salesModel;
        this.get = this.get.bind(this);
        this.insert = this.insert.bind(this);
        this.info = this.info.bind(this);
        this.update = this.update.bind(this);
        this.status = this.status.bind(this);
        this.delete = this.delete.bind(this);
    }

    async get(req, res, next) {
        try {
            let { isDeleted, page = 1, limit = 10, ownershipType, startDate, endDate, branchId: filterBranchId } = req.query;
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

            // Validate ownershipType
            if (ownershipType && !['FULL', 'FRACTIONAL', 'LEASE', 'TIMESHARE'].includes(ownershipType)) {
                return this.handleError(
                    next,
                    'Invalid ownership type. Must be one of: FULL, FRACTIONAL, LEASE, TIMESHARE',
                    400
                );
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
            if (ownershipType) {
                filters.ownershipType = ownershipType;
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
                // No userId filter; fetch all sales models
            }
            // else if (role === 'ADMIN') {
            //     if (!branchId) {
            //         return this.handleError(next, 'Admin must be associated with a branch', 400);
            //     }
            //     const branchUsers = await prisma.user.findMany({
            //         where: { branchId },
            //         select: { id: true },
            //     });
            //     const userIds = branchUsers.map(u => u.id);
            //     filters.userId = { in: userIds };
            // } 
            else if (role === 'MANAGER' || role === 'AGENT') {
                // Only fetch projects for the current manager
                filters.branchId = branchId;
            } else {
                return this.handleError(next, 'Unauthorized role', 403);
            }

            // Common select clause
            // Base select (branch excluded)
            const baseSelect = {
                id: true,
                name: true,
                ownershipType: true,
                minInvestmentLakhs: true,
                buybackTerms: true,
                usageRights: true,
                guaranteedRoiPercent: true,
                profitSharePercent: true,
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
            const [totalItems, salesModels] = await Promise.all([
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
                salesModels: salesModels.map((model) => ({
                    ...model,
                    _id: model.id,
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
                ownershipType,
                minInvestmentLakhs,
                buybackTerms,
                usageRights,
                guaranteedRoiPercent,
                profitSharePercent,
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
                return this.handleError(next, 'Sales model name is required', 400);
            }
            if (!ownershipType) {
                return this.handleError(next, 'Ownership type is required', 400);
            }
            if (!usageRights) {
                return this.handleError(next, 'Usage rights is required', 400);
            }

            // Validate enum fields
            if (ownershipType && !['FULL', 'FRACTIONAL', 'LEASE', 'TIMESHARE'].includes(ownershipType)) {
                return this.handleError(next, 'Invalid ownership type. Must be one of: FULL, FRACTIONAL, LEASE, TIMESHARE', 400);
            }
            if (usageRights && !['EXCLUSIVE', 'SHARED', 'LIMITED'].includes(usageRights)) {
                return this.handleError(next, 'Invalid usage rights. Must be one of: EXCLUSIVE, SHARED, LIMITED', 400);
            }

            // Validate numeric fields
            if (minInvestmentLakhs && (isNaN(minInvestmentLakhs) || parseFloat(minInvestmentLakhs) < 0)) {
                return this.handleError(next, 'Minimum investment in lakhs must be a positive number', 400);
            }
            if (guaranteedRoiPercent && (isNaN(guaranteedRoiPercent) || parseFloat(guaranteedRoiPercent) < 0)) {
                return this.handleError(next, 'Guaranteed ROI percent must be a positive number', 400);
            }
            if (profitSharePercent && (isNaN(profitSharePercent) || parseFloat(profitSharePercent) < 0)) {
                return this.handleError(next, 'Profit share percent must be a positive number', 400);
            }

            // Check for duplicate sales model name
            const existingSalesModel = await this.model.findFirst({
                where: { name: name.trim(), deletedAt: null },
            });
            if (existingSalesModel) {
                return this.handleError(next, 'Sales model name already exists', 422);
            }

            const salesModel = await this.model.create({
                data: {
                    userId,
                    name: name.trim(),
                    branchId: branchId || null,
                    ownershipType,
                    minInvestmentLakhs: minInvestmentLakhs ? parseFloat(minInvestmentLakhs) : null,
                    buybackTerms: buybackTerms?.trim() || null,
                    usageRights,
                    guaranteedRoiPercent: guaranteedRoiPercent ? parseFloat(guaranteedRoiPercent) : null,
                    profitSharePercent: profitSharePercent ? parseFloat(profitSharePercent) : null,
                    status: true,
                },
            });

            return res.status(201).json({
                success: true,
                message: 'Sales model created successfully',
                salesModel: { ...salesModel, _id: salesModel.id },
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

            const salesModel = await this.model.findFirst({
                where: filters,
                select: {
                    id: true,
                    name: true,
                    ownershipType: true,
                    minInvestmentLakhs: true,
                    buybackTerms: true,
                    usageRights: true,
                    guaranteedRoiPercent: true,
                    profitSharePercent: true,
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
                },
            });

            if (!salesModel) {
                return this.handleError(next, 'Sales model not found', 404);
            }

            if (!salesModel.branchId) {
                return this.handleError(next, 'Branch Not Attach To Sales model', 404);
            }

            if (salesModel.branchId != branchId && role != 'ADMIN') {
                return this.handleError(next, 'Unauthorized access', 403);
            }

            return res.status(200).json({
                success: true,
                salesModel: { ...salesModel, _id: salesModel.id },
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
                ownershipType,
                minInvestmentLakhs,
                buybackTerms,
                usageRights,
                guaranteedRoiPercent,
                profitSharePercent,
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
            //     if (!branchId) {
            //         return this.handleError(next, 'Admin must be associated with a branch', 400);
            //     }
            //     const branchUsers = await prisma.user.findMany({
            //         where: { branchId },
            //         select: { id: true },
            //     });
            //     const userIds = branchUsers.map(u => u.id);
            //     filters.userId = { in: userIds };
            // } 
            else if (role === 'MANAGER' || role === 'AGENT') {
                filters.branchId = branchId;
            } else {
                return this.handleError(next, 'Unauthorized role', 403);
            }

            const existingSalesModel = await this.model.findFirst({
                where: filters,
            });
            if (!existingSalesModel) {
                return this.handleError(next, 'Sales model not found or not authorized', 404);
            }

            // Validate inputs
            if (name && !name.trim()) {
                return this.handleError(next, 'Sales model name cannot be empty', 400);
            }
            if (ownershipType && !['FULL', 'FRACTIONAL', 'LEASE', 'TIMESHARE'].includes(ownershipType)) {
                return this.handleError(next, 'Invalid ownership type. Must be one of: FULL, FRACTIONAL, LEASE, TIMESHARE', 400);
            }
            if (usageRights && !['EXCLUSIVE', 'SHARED', 'LIMITED'].includes(usageRights)) {
                return this.handleError(next, 'Invalid usage rights. Must be one of: EXCLUSIVE, SHARED, LIMITED', 400);
            }
            if (minInvestmentLakhs && (isNaN(minInvestmentLakhs) || parseFloat(minInvestmentLakhs) < 0)) {
                return this.handleError(next, 'Minimum investment in lakhs must be a positive number', 400);
            }
            if (guaranteedRoiPercent && (isNaN(guaranteedRoiPercent) || parseFloat(guaranteedRoiPercent) < 0)) {
                return this.handleError(next, 'Guaranteed ROI percent must be a positive number', 400);
            }
            if (profitSharePercent && (isNaN(profitSharePercent) || parseFloat(profitSharePercent) < 0)) {
                return this.handleError(next, 'Profit share percent must be a positive number', 400);
            }

            // Check for duplicate name
            if (name && name.trim() !== existingSalesModel.name) {
                const nameExists = await this.model.findFirst({
                    where: { name: name.trim(), deletedAt: null },
                });
                if (nameExists) {
                    return this.handleError(next, 'Sales model name already exists', 422);
                }
            }

            const updatedSalesModel = await this.model.update({
                where: { id },
                data: {
                    name: name?.trim() ?? existingSalesModel.name,
                    ownershipType: ownershipType ?? existingSalesModel.ownershipType,
                    minInvestmentLakhs: minInvestmentLakhs !== undefined ? parseFloat(minInvestmentLakhs) : existingSalesModel.minInvestmentLakhs,
                    buybackTerms: buybackTerms?.trim() ?? existingSalesModel.buybackTerms,
                    usageRights: usageRights ?? existingSalesModel.usageRights,
                    guaranteedRoiPercent: guaranteedRoiPercent !== undefined ? parseFloat(guaranteedRoiPercent) : existingSalesModel.guaranteedRoiPercent,
                    profitSharePercent: profitSharePercent !== undefined ? parseFloat(profitSharePercent) : existingSalesModel.profitSharePercent,
                },
            });

            return res.status(200).json({
                success: true,
                message: 'Sales model updated successfully',
                salesModel: { ...updatedSalesModel, _id: updatedSalesModel.id },
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
            //     if (!branchId) {
            //         return this.handleError(next, 'Admin must be associated with a branch', 400);
            //     }
            //     const branchUsers = await prisma.user.findMany({
            //         where: { branchId },
            //         select: { id: true },
            //     });
            //     const userIds = branchUsers.map(u => u.id);
            //     filters.userId = { in: userIds };
            // } 
            else if (role === 'MANAGER' || role === 'AGENT') {
                filters.userId = userId;
            } else {
                return this.handleError(next, 'Unauthorized role', 403);
            }

            const salesModel = await this.model.findFirst({
                where: filters,
            });
            if (!salesModel) {
                return this.handleError(next, 'Sales model not found or not authorized', 404);
            }

            const newStatus = !salesModel.status;

            const updatedSalesModel = await this.model.update({
                where: { id },
                data: { status: newStatus },
            });

            return res.status(200).json({
                success: true,
                message: `Sales model status updated successfully to ${newStatus ? 'Active' : 'Inactive'}`,
                salesModel: { ...updatedSalesModel, _id: updatedSalesModel.id },
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
            //     if (!branchId) {
            //         return this.handleError(next, 'Admin must be associated with a branch', 400);
            //     }
            //     const branchUsers = await prisma.user.findMany({
            //         where: { branchId },
            //         select: { id: true },
            //     });
            //     const userIds = branchUsers.map(u => u.id);
            //     filters.userId = { in: userIds };
            // } 
            else if (role === 'MANAGER' || role === 'AGENT') {
                filters.branchId = branchId;
            } else {
                return this.handleError(next, 'Unauthorized role', 403);
            }

            const salesModel = await this.model.findFirst({
                where: filters,
            });
            if (!salesModel) {
                return this.handleError(next, 'Sales model not found or not authorized', 404);
            }

            const newDeletedAt = salesModel.deletedAt ? null : new Date();

            const updatedSalesModel = await this.model.update({
                where: { id },
                data: { deletedAt: newDeletedAt },
            });

            return res.status(200).json({
                success: true,
                message: `Sales model has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
                salesModel: { ...updatedSalesModel, _id: updatedSalesModel.id },
            });
        } catch (error) {
            return this.handleError(next, error.message || 'An unexpected error occurred', 500);
        } finally {
            await prisma.$disconnect();
        }
    }
}

export default new SalesModelController();