import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

const prisma = new PrismaClient();

class LeadController extends BaseController {
  constructor() {
    super();
    this.model = prisma.lead;
    this.get = this.get.bind(this);
    this.insert = this.insert.bind(this);
    this.info = this.info.bind(this);
    this.update = this.update.bind(this);
    this.status = this.status.bind(this);
    this.priority = this.priority.bind(this);
    this.delete = this.delete.bind(this);
    this.closing = this.closing.bind(this);
    this.feedBack = this.feedBack.bind(this);
    this.inquiry = this.inquiry.bind(this);
    this.timeLineInsert = this.timeLineInsert.bind(this);
    this.csv = this.csv.bind(this);
  }

  async get(req, res, next) {
    try {
      let { isDeleted, page = 1, limit = 10, startDate, endDate, priority, branchId: filterBranchId } = req.query;
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

      // Validate priority
      const validPriorities = ['HOT', 'WARM', 'COLD']; // Adjust based on LeadPriority enum
      if (priority && !validPriorities.includes(priority)) {
        return this.handleError(next, `Invalid priority value. Must be one of: ${validPriorities.join(', ')}`, 400);
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
      if (priority) { filters.priority = priority; }
      if (filterBranchId) { filters.branchId = filterBranchId; }

      // Role-based user filtering
      if (role === 'ADMIN') {
        // ADMIN can access any lead, no additional filters needed
      } else if (role === 'MANAGER' || role === 'AGENT') {
        if (!branchId) {
          return this.handleError(next, 'User must be associated with a branch', 400);
        }
        filters.branchId = branchId; // Restrict to leads in user's branch
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      // Common select clause
      // Base select without branch
      const baseSelect = {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        alternatePhone: true,
        territory: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        unitType: { select: { id: true, name: true } },
        salesModel: { select: { id: true, name: true } },
        paymentPlan: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        referred: { select: { id: true, name: true, email: true } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            branchId: true,
          },
        },
        leadSource: true,
        leadScore: true,
        aiScoreComponents: true,
        status: true,
        priority: true,
        lastContactDate: true,
        nextFollowUpDate: true,
        preferredChannel: true,
        campaignEventTag: true,
        timeframe: true,
        budgetRange: true,
        purpose: true,
        kycComplete: true,
        creditScore: true,
        occupation: true,
        notes: true,
        referredby: true,
        dob: true,
        anniversary: true,
        investmentModel: true,
        createdAt: true,
        deletedAt: true,
        leadTimelines: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            createdById: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        leadClosing: {
          select: {
            id: true,
            projectId: true,
            salePrice: true,
            commission: true,
            closingDate: true,
            docs: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        clientFeedbacks: {
          select: {
            id: true,
            professionalism: true,
            communication: true,
            marketKnowledge: true,
            comments: true,
            createdAt: true,
            updatedAt: true,
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
            user: {
              select: {
                ...baseSelect.user.select,
                branch: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          };


      // Execute queries concurrently
      const [totalItems, leads] = await Promise.all([
        prisma.lead.count({ where: filters }),
        prisma.lead.findMany({
          where: filters,
          select,
          orderBy: { createdAt: 'desc' },
          skip: skipNum,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        leads: leads.map((lead) => ({
          ...lead,
          _id: lead.id,
        })),
        pagination: {
          currentPage: pageNum,
          pageSize: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching leads:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async insert(req, res, next) {
    try {
      const { firstName, lastName, email, phone, interestedProject, alternatePhone, project, unitType, salesModel, paymentPlan, estimatedInvestment, leadSource, leadScore, aiScoreComponents, status, priority, assignedToId, territory, lastContactDate, nextFollowUpDate, preferredChannel, campaignEventTag, timeframe, budgetRange, purpose, kycComplete, creditScore, occupation, notes, referredby, dob, anniversary, investmentModel, branchId: bodyBranchId } = req.body;
      let { id: userId, role, branchId } = req.user || {};

      if (role === 'ADMIN' && !bodyBranchId) {
        return this.handleError(next, 'BranchId is required', 422);
      }

      if (role === 'ADMIN') {
        branchId = bodyBranchId;
      }

      // Map payload field names to model field names
      const projectId = project;
      const unitTypeId = unitType;
      const salesModelId = salesModel;
      const paymentPlanId = paymentPlan;
      const territoryId = territory;

      // Validate required fields
      const requiredFields = [
        { key: 'firstName', value: firstName },
        { key: 'lastName', value: lastName },
        { key: 'email', value: email },
        { key: 'phone', value: phone },
        { key: 'projectId', value: projectId },
        { key: 'unitTypeId', value: unitTypeId },
        { key: 'salesModelId', value: salesModelId },
        { key: 'paymentPlanId', value: paymentPlanId },
        { key: 'estimatedInvestment', value: estimatedInvestment },
        { key: 'leadSource', value: leadSource },
        { key: 'preferredChannel', value: preferredChannel },
        { key: 'timeframe', value: timeframe },
        { key: 'budgetRange', value: budgetRange },
        { key: 'occupation', value: occupation },
        { key: 'assignedToId', value: assignedToId },
        { key: 'territoryId', value: territoryId },
      ];
      for (const { key, value } of requiredFields) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return this.handleError(next, `${key} is required`, 400);
        }
      }

      const calculatedPriority = leadScore >= 80 ? 'HOT' : leadScore >= 50 ? 'WARM' : 'COLD';

      // Use Prisma transaction to create Lead and LeadTimeline atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create the lead
        const lead = await tx.lead.create({
          data: {
            userId,
            branchId,
            territoryId,
            projectId,
            unitTypeId,
            salesModelId,
            paymentPlanId,
            assignedToId,
            referredby: referredby || null,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            interestedProject: interestedProject?.trim() || null,
            alternatePhone: alternatePhone?.trim() || null,
            estimatedInvestment: parseFloat(estimatedInvestment),
            leadSource,
            leadScore: parseInt(leadScore) || 50,
            aiScoreComponents: aiScoreComponents || null,
            status: status || 'NEW',
            priority: priority || calculatedPriority,
            lastContactDate: lastContactDate ? new Date(lastContactDate) : null,
            nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
            preferredChannel,
            campaignEventTag: campaignEventTag?.trim() || null,
            timeframe,
            budgetRange,
            purpose: purpose || [],
            kycComplete: kycComplete || false,
            creditScore: creditScore !== undefined ? parseInt(creditScore) : null,
            occupation,
            notes: notes?.trim() || null,
            dob: dob ? new Date(dob) : null,
            anniversary: anniversary ? new Date(anniversary) : null,
            investmentModel: investmentModel || null,
          },
        });

        // Create the LeadTimeline entry using the lead's ID
        await tx.leadTimeline.create({
          data: {
            leadId: lead.id,
            title: 'Lead Created',
            description: `Lead created for ${firstName} ${lastName} with email ${email}`,
            createdById: userId || null,
          },
        });

        return lead; // Return the lead for response
      });

      return res.status(201).json({
        success: true,
        message: 'Lead and timeline created successfully',
      });

    } catch (error) {
      console.log(error.message);
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

      const lead = await prisma.lead.findFirst({
        where: filters,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          alternatePhone: true,
          branchId: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          territory: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          unitType: { select: { id: true, name: true } },
          salesModel: { select: { id: true, name: true } },
          paymentPlan: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          referred: { select: { id: true, name: true, email: true } },
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
                },
              },
            },
          },
          leadSource: true,
          leadScore: true,
          aiScoreComponents: true,
          status: true,
          priority: true,
          lastContactDate: true,
          nextFollowUpDate: true,
          estimatedInvestment: true,
          preferredChannel: true,
          campaignEventTag: true,
          timeframe: true,
          budgetRange: true,
          purpose: true,
          kycComplete: true,
          creditScore: true,
          occupation: true,
          notes: true,
          referredby: true,
          dob: true,
          anniversary: true,
          investmentModel: true,
          createdAt: true,
          deletedAt: true,
          leadTimelines: {
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
              createdById: true,
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!lead) {
        return this.handleError(next, 'Lead not found', 404);
      }

      if (!lead.branchId) {
        return this.handleError(next, 'Branch Not Attach To Lead', 404);
      }

      if (lead.branchId != branchId && role != 'ADMIN') {
        return this.handleError(next, 'Unauthorized access', 403);
      }

      return res.status(200).json({
        success: true,
        lead: { ...lead, _id: lead.id },
      });
    } catch (error) {
      console.error('Error fetching lead:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async update(req, res, next) {
    try {
      const { firstName, lastName, email, phone, interestedProject, alternatePhone, project, unitType, salesModel, paymentPlan, estimatedInvestment, leadSource, leadScore, aiScoreComponents, status, priority, assignedToId, territory, lastContactDate, nextFollowUpDate, preferredChannel, campaignEventTag, timeframe, budgetRange, purpose, kycComplete, creditScore, occupation, notes, referredby, dob, anniversary, investmentModel, branchId: bodyBranchId } = req.body;
      const { id } = req.params;
      let { id: userId, role, branchId } = req.user || {};

      if (role === 'ADMIN' && !bodyBranchId) {
        return this.handleError(next, 'BranchId is required', 422);
      }

      if (role === 'ADMIN') {
        branchId = bodyBranchId;
      }

      // Map payload field names to model field names
      const projectId = project;
      const unitTypeId = unitType;
      const salesModelId = salesModel;
      const paymentPlanId = paymentPlan;
      const territoryId = territory;

      const calculatedPriority = leadScore >= 80 ? 'HOT' : leadScore >= 50 ? 'WARM' : 'COLD';

      // Use Prisma transaction to update Lead and create LeadTimeline atomically
      const updatedLead = await prisma.$transaction(async (tx) => {
        // Update the lead
        const lead = await tx.lead.update({
          where: { id },
          data: {
            userId,
            branchId,
            territoryId: territoryId ?? undefined,
            projectId: projectId ?? undefined,
            unitTypeId: unitTypeId ?? undefined,
            salesModelId: salesModelId ?? undefined,
            paymentPlanId: paymentPlanId ?? undefined,
            assignedToId: assignedToId ?? undefined,
            referredby: referredby || null,
            firstName: firstName?.trim() ?? undefined,
            lastName: lastName?.trim() ?? undefined,
            email: email?.trim() ?? undefined,
            phone: phone?.trim() ?? undefined,
            interestedProject: interestedProject?.trim() || null,
            alternatePhone: alternatePhone?.trim() || null,
            estimatedInvestment: estimatedInvestment !== undefined ? parseFloat(estimatedInvestment) : undefined,
            leadSource: leadSource ?? undefined,
            leadScore: leadScore !== undefined ? parseInt(leadScore) : undefined,
            aiScoreComponents: aiScoreComponents || null,
            status: status ?? undefined,
            priority: priority || calculatedPriority,
            lastContactDate: lastContactDate ? new Date(lastContactDate) : null,
            nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
            preferredChannel: preferredChannel ?? undefined,
            campaignEventTag: campaignEventTag?.trim() || null,
            timeframe: timeframe ?? undefined,
            budgetRange: budgetRange ?? undefined,
            purpose: purpose ?? undefined,
            kycComplete: kycComplete ?? undefined,
            creditScore: creditScore !== undefined ? parseInt(creditScore) : null,
            occupation: occupation ?? undefined,
            notes: notes?.trim() || null,
            dob: dob ? new Date(dob) : null,
            anniversary: anniversary ? new Date(anniversary) : null,
            investmentModel: investmentModel || null,
          },
        });

        // Create the LeadTimeline entry
        await tx.leadTimeline.create({
          data: {
            leadId: id,
            title: 'Lead Updated',
            description: `Lead updated for ${firstName?.trim() || lead.firstName} ${lastName?.trim() || lead.lastName} with email ${email?.trim() || lead.email}`,
            createdById: userId || null,
          },
        });

        return lead;
      });

      return res.status(200).json({
        success: true,
        message: 'Lead updated successfully',
        lead: { ...updatedLead, _id: updatedLead.id },
      });
    } catch (error) {
      console.error('Error updating lead:', error.message);
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
        // Only fetch projects for the current manager
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      const lead = await this.model.findFirst({
        where: filters,
      });
      if (!lead) {
        return this.handleError(next, 'Lead not found or not authorized', 404);
      }

      // Define status transition (example, adjust based on LeadStatus enum values)
      const statusOrder = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
      const currentIndex = statusOrder.indexOf(lead.status);
      const newStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : lead.status;

      const updatedLead = await this.model.update({
        where: { id },
        data: { status: newStatus },
      });

      return res.status(200).json({
        success: true,
        message: `Lead status updated successfully to ${newStatus}`,
        lead: { ...updatedLead, _id: updatedLead.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async priority(req, res, next) {
    try {
      const { id } = req.params;
      const { id: userId, role, branchId } = req.user || {};
      const { priority } = req.body;

      // Validate user authentication
      if (!userId || !role) {
        return this.handleError(next, 'User not authenticated', 401);
      }

      // Allowed priorities
      const allowedPriorities = ['HOT', 'WARM', 'COLD'];
      if (!allowedPriorities.includes(priority)) {
        return this.handleError(next, 'Invalid priority value', 400);
      }

      // Build filters for access check
      const filters = { id, deletedAt: null };
      if (role === 'ADMIN') {
        // No extra filter
      } else if (role === 'MANAGER' || role === 'AGENT') {
        filters.branchId = branchId;
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      // Find lead
      const lead = await this.model.findFirst({ where: filters });
      if (!lead) {
        return this.handleError(next, 'Lead not found or not authorized', 404);
      }

      // Update priority
      const updatedLead = await this.model.update({
        where: { id },
        data: { priority },
      });

      return res.status(200).json({
        success: true,
        message: `Lead priority updated successfully to ${priority}`,
        lead: { ...updatedLead, _id: updatedLead.id },
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
        // Only fetch projects for the current manager
        // filters.branchId = branchId;
        return this.handleError(next, 'Unauthorized role', 403);
      } else {
        return this.handleError(next, 'Unauthorized role', 403);
      }

      const lead = await this.model.findFirst({
        where: filters,
      });
      if (!lead) {
        return this.handleError(next, 'Lead not found or not authorized', 404);
      }

      const newDeletedAt = lead.deletedAt ? null : new Date();

      const updatedLead = await this.model.update({
        where: { id },
        data: { deletedAt: newDeletedAt },
      });

      return res.status(200).json({
        success: true,
        message: `Lead has been ${newDeletedAt ? 'deleted' : 'restored'} successfully`,
        lead: { ...updatedLead, _id: updatedLead.id },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async closing(req, res, next) {
    try {
      const { project, salePrice, commission, closingDate } = req.body;
      const { id: leadId } = req.params;
      const { id: userId } = req.user || {};

      // Validate required fields
      const requiredFields = [
        { key: 'leadId', value: leadId },
        { key: 'project', value: project },
        { key: 'salePrice', value: salePrice },
        { key: 'commission', value: commission },
      ];
      for (const { key, value } of requiredFields) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return this.handleError(next, `${key} is required`, 400);
        }
      }

      // Map project to projectId
      const projectId = project;

      // Handle file uploads for docs
      let docs = null;
      if (req.files && req.files.length > 0) {
        const uploadedPaths = await this.handleFileUploads(req.files, `closing/docs`);
        const docPaths = uploadedPaths
          .filter(upload => upload.fieldname === 'doc')
          .map(upload => upload.path);
        docs = docPaths.length > 0 ? docPaths : null;
      }

      // Prisma transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create LeadClosing entry
        const leadClosing = await tx.leadClosing.create({
          data: {
            leadId,
            projectId,
            salePrice: parseFloat(salePrice),
            commission: parseFloat(commission),
            closingDate: closingDate ? new Date(closingDate) : null,
            docs,
          },
        });

        // 2. Update lead status -> CLOSED_WON
        await tx.lead.update({
          where: { id: leadId },
          data: { status: 'CLOSED_WON' },
        });

        // 3. Add LeadTimeline entry
        await tx.leadTimeline.create({
          data: {
            leadId,
            title: 'Lead Closed',
            description: `Lead closed with sale price ${salePrice} and commission ${commission} for project ${projectId}`,
            createdById: userId || null,
          },
        });

        return leadClosing;
      });

      return res.status(201).json({
        success: true,
        message: 'Lead closing, status update and timeline created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error creating lead closing:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async feedBack(req, res, next) {
    try {
      const { professionalism, communication, marketKnowledge, comments } = req.body;
      const { id: leadId } = req.params;
      const { id: userId } = req.user || {};

      // Validate required fields
      const requiredFields = [
        { key: 'leadId', value: leadId },
        { key: 'professionalism', value: professionalism },
        { key: 'communication', value: communication },
        { key: 'marketKnowledge', value: marketKnowledge },
      ];
      for (const { key, value } of requiredFields) {
        if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
          return this.handleError(next, `${key} is required`, 400);
        }
      }

      // Validate rating ranges (assuming 1-5 scale, adjust as needed)
      const ratings = [
        { key: 'professionalism', value: parseInt(professionalism) },
        { key: 'communication', value: parseInt(communication) },
        { key: 'marketKnowledge', value: parseInt(marketKnowledge) },
      ];
      for (const { key, value } of ratings) {
        if (value < 1 || value > 5) {
          return this.handleError(next, `${key} must be between 1 and 5`, 400);
        }
      }

      // Use Prisma transaction to create ClientFeedback and LeadTimeline atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create the ClientFeedback entry
        const feedback = await tx.clientFeedback.create({
          data: {
            leadId,
            professionalism: parseInt(professionalism),
            communication: parseInt(communication),
            marketKnowledge: parseInt(marketKnowledge),
            comments: comments?.trim() || null,
          },
        });

        // Create the LeadTimeline entry
        await tx.leadTimeline.create({
          data: {
            leadId,
            title: 'Client Feedback Added',
            description: `Feedback received: Professionalism ${professionalism}, Communication ${communication}, Market Knowledge ${marketKnowledge}${comments ? `, Comments: ${comments}` : ''}`,
            createdById: userId || null,
          },
        });

        return feedback;
      });

      return res.status(201).json({
        success: true,
        message: 'Client feedback and timeline created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error creating client feedback:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async inquiry(req, res, next) {
    try {
      const { name, email, type, budget, details, leadId } = req.body;
      const { id: userId } = req.user || {};

      // Validate required fields
      const requiredFields = [
        { key: 'name', value: name },
        { key: 'email', value: email },
        { key: 'type', value: type },
        { key: 'budget', value: budget },
      ];
      for (const { key, value } of requiredFields) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return this.handleError(next, `${key} is required`, 400);
        }
      }

      // Use Prisma transaction to create Inquiry and optional LeadTimeline atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create the Inquiry entry
        const inquiry = await tx.inquiry.create({
          data: {
            name: name.trim(),
            email: email.trim(),
            type: type.trim(),
            budget: budget.trim(),
            details: details?.trim() || null,
          },
        });

        // // Create a LeadTimeline entry if leadId is provided
        // if (leadId) {
        //   await tx.leadTimeline.create({
        //     data: {
        //       leadId,
        //       title: 'Inquiry Added',
        //       description: `Inquiry received from ${name} (${email}) for type ${type} with budget ${budget}${details ? `, Details: ${details}` : ''}`,
        //       createdById: userId || null,
        //     },
        //   });
        // }

        return inquiry;
      });

      return res.status(201).json({
        success: true,
        message: leadId ? 'Inquiry and timeline created successfully' : 'Inquiry created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error creating inquiry:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async timeLineInsert(req, res, next) {
    try {
      const { title, description } = req.body;
      const { id: leadId } = req.params;
      const { id: userId } = req.user || {};

      // Validate required fields
      const requiredFields = [
        { key: 'title', value: title },
        { key: 'description', value: description },
        { key: 'leadId', value: leadId },
      ];
      for (const { key, value } of requiredFields) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return this.handleError(next, `${key} is required`, 400);
        }
      }

      // Insert timeline
      const result = await this.insertLeadTimeline({
        leadId,
        title,
        description,
        createdById: userId,
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating lead timeline:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

  async csv(req, res, next) {
    try {
      // Log request details for debugging
      // console.log('Request file:', req.file);
      // console.log('Request files:', req.files);
      // console.log('Request body:', req.body);

      // Validate that a file is uploaded
      if (!req.file) {
        return this.handleError(next, 'No file uploaded. Please upload a CSV file with field name "file".', 400);
      }

      // Validate that the file is a CSV
      if (!req.file.mimetype.includes('csv')) {
        return this.handleError(next, 'Only CSV files are allowed', 400);
      }

      console.log('File received:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const { id: userId, role, branchId: userBranchId } = req.user || {};
      const results = [];

      // Parse the CSV file from memory (Buffer)
      await new Promise((resolve, reject) => {
        const stream = Readable.from(req.file.buffer); // Convert Buffer to Readable stream
        stream
          .pipe(csvParser())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      // Fetch default values for required fields
      const defaultTerritory = await prisma.territory.findFirst({ select: { id: true } });
      const defaultProject = await prisma.project.findFirst({ select: { id: true } });
      const defaultUnitType = await prisma.unitType.findFirst({ select: { id: true } });
      const defaultSalesModel = await prisma.salesModel.findFirst({ select: { id: true } });
      const defaultPaymentPlan = await prisma.paymentPlan.findFirst({ select: { id: true } });
      const defaultUser = await prisma.user.findFirst({ select: { id: true } });

      if (!defaultTerritory || !defaultProject || !defaultUnitType || !defaultSalesModel || !defaultPaymentPlan || !defaultUser) {
        throw new Error('Missing default records for required fields (territory, project, unitType, salesModel, paymentPlan, or user).');
      }

      // Process each row in the CSV
      const leads = await prisma.$transaction(async (tx) => {
        const createdLeads = [];

        for (const row of results) {
          const {
            firstName,
            lastName,
            email,
            phone,
            branch_code,
          } = row;

          // Validate required fields
          const requiredFields = [
            { key: 'firstName', value: firstName },
            { key: 'lastName', value: lastName },
            { key: 'email', value: email },
            { key: 'phone', value: phone },
            { key: 'branch_code', value: branch_code },
          ];

          for (const { key, value } of requiredFields) {
            if (!value || (typeof value === 'string' && !value.trim())) {
              throw new Error(`${key} is required for lead: ${firstName || 'Unknown'} ${lastName || 'Unknown'}`);
            }
          }

          // Validate branch_code and fetch branchId
          const branch = await tx.branch.findFirst({
            where: { code: branch_code.trim() },
            select: { id: true },
          });

          if (!branch) {
            throw new Error(`Invalid branch_code: ${branch_code} for lead: ${firstName} ${lastName}`);
          }

          const branchId = role === 'ADMIN' ? branch.id : userBranchId;

          // Clean phone number by removing '+' sign
          const cleanedPhone = phone?.trim().replace(/\+/g, '') || '';

          // Create the lead with required fields and defaults for others
          const lead = await tx.lead.create({
            data: {
              userId,
              branchId,
              territoryId: defaultTerritory.id,
              projectId: defaultProject.id,
              unitTypeId: defaultUnitType.id,
              salesModelId: defaultSalesModel.id,
              paymentPlanId: defaultPaymentPlan.id,
              assignedToId: defaultUser.id,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              phone: cleanedPhone,
              estimatedInvestment: 0, // Required, using minimal default
              leadSource: 'UNKNOWN', // Example enum value; adjust based on LeadSource enum
              preferredChannel: 'UNKNOWN', // Example enum value; adjust based on PreferredChannel enum
              timeframe: 'UNKNOWN', // Example enum value; adjust based on Timeframe enum
              budgetRange: 'UNKNOWN', // Example enum value; adjust based on BudgetRange enum
              occupation: 'UNKNOWN', // Example enum value; adjust based on Occupation enum
              interestedProject: null,
              alternatePhone: null,
              leadScore: 50, // Default from schema
              aiScoreComponents: null,
              status: 'NEW', // Default from schema
              priority: 'COLD', // Default from schema
              lastContactDate: null,
              nextFollowUpDate: null,
              campaignEventTag: null,
              purpose: [], // Default from schema
              kycComplete: false, // Default from schema
              creditScore: null,
              notes: null,
              referredby: null,
              dob: null,
              anniversary: null,
              investmentModel: null,
            },
          });

          // Create the LeadTimeline entry
          await tx.leadTimeline.create({
            data: {
              leadId: lead.id,
              title: 'Lead Created',
              description: `Lead created for ${firstName} ${lastName} with email ${email}`,
              createdById: userId || null,
            },
          });

          createdLeads.push(lead);
        }

        return createdLeads;
      });

      return res.status(201).json({
        success: true,
        message: `${leads.length} lead(s) and timeline(s) created successfully`,
      });
    } catch (error) {
      console.error('Error:', error.message);
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    } finally {
      await prisma.$disconnect();
    }
  }

}

export default new LeadController();