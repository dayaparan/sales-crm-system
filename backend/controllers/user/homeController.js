import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class HomeController extends BaseController {
  constructor() {
    super();
    this.get = this.get.bind(this);
  }

  async get(req, res, next) {
    try {
      const { _id: userId, role, branchId } = req.user;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const last10Days = new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000); // 10 days ago

      // Branch condition: Admin => no filter, Non-admin => branch filter
      const branchCondition = role === 'ADMIN' ? {} : { branchId };

      // Fetch agents and their lead data
      const agents = await prisma.user.findMany({
        where: {
          status: true,
          deletedAt: null,
          ...branchCondition,
          role: { not: 'ADMIN' }, // Exclude admins from agent list
        },
        select: {
          id: true,
          name: true,
          assignedLeads: {
            where: {
              deletedAt: null,
              createdAt: {
                gte: last10Days,
                lt: today,
              },
            },
            select: {
              id: true,
              createdAt: true,
              status: true,
              estimatedInvestment: true,
              leadScore: true,
            },
          },
        },
      });

      // Process agent performance dynamically
      const agentPerformance = agents.map(agent => {
        const leads = agent.assignedLeads;
        const totalLeadsHandled = leads.length;
        const closedWonLeads = leads.filter(l => l.status === 'CLOSED_WON').length;
        const totalRevenue = leads.reduce((sum, lead) => sum + (lead.estimatedInvestment || 0), 0);
        const conversion = closedWonLeads;
        const score = leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length) : 70;

        // Generate trend data (daily performance over last 10 days)
        const trend = Array.from({ length: 10 }, (_, i) => {
          const day = new Date(today.getTime() - (9 - i) * 24 * 60 * 60 * 1000);
          const dayLeads = leads.filter(l => {
            const leadDate = new Date(l.createdAt);
            return leadDate >= day && leadDate < new Date(day.getTime() + 24 * 60 * 60 * 1000);
          });
          return dayLeads.length > 0 ? Math.min(100, 70 + Math.round(dayLeads.reduce((sum, l) => sum + l.leadScore, 0) / dayLeads.length)) : 70;
        });

        return {
          name: agent.name,
          leadsHandled: totalLeadsHandled,
          conversion,
          revenue: totalRevenue,
          score,
          trend,
        };
      });

      // Aggregate dashboard metrics
      const [totalLeadsResult, newLeadsResult, closedWonLeadsResult, revenueResult] = await Promise.all([
        prisma.lead.count({
          where: {
            deletedAt: null,
            ...branchCondition,
          },
        }),
        prisma.lead.count({
          where: {
            deletedAt: null,
            ...branchCondition,
            createdAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.lead.count({
          where: {
            deletedAt: null,
            status: 'CLOSED_WON',
            ...branchCondition,
          },
        }),
        prisma.lead.aggregate({
          where: {
            deletedAt: null,
            status: 'CLOSED_WON',
            ...branchCondition,
          },
          _sum: {
            estimatedInvestment: true,
          },
        }),
      ]);

      const totalLeads = totalLeadsResult;
      const newLeads = newLeadsResult;
      const revenueTotal = revenueResult._sum.estimatedInvestment || 0;
      const conversionRate = totalLeads > 0 ? Math.round((closedWonLeadsResult / totalLeads) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          agentPerformance,
          totalLeads,
          newLeads,
          revenueTotal,
          conversionRate,
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to fetch dashboard data', 500);
    }
  }
}

export default new HomeController();