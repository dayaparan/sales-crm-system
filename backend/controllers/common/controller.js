import { PrismaClient, Role } from '@prisma/client';
import BaseController from '../BaseController.js';

const prisma = new PrismaClient();

class Controller extends BaseController {
  constructor() {
    super();
    this.get = this.get.bind(this);
  }

  async get(req, res, next) {
    try {
      const { branchId: userBranch, role: userRole } = req.user;
      const { role, user, permission, branch, territory, branchId, paymentPlan, project, salesModel, unitType } = req.query;
      const response = {};

      if (branch) {
        response['branch'] = await prisma.branch.findMany({
          where: { status: true, deletedAt: null },
          select: { name: true, id: true },
        });
      }

      if (user) {
        // comma separated roles ko array me convert karo
        const roles = role
          .split(',')
          .map((r) => r.trim().toUpperCase())
          .map((r) => Role[r])
          .filter(Boolean);

        response['user'] = await prisma.user.findMany({
          where: {
            status: true,
            deletedAt: null,
            role: {
              in: roles,
            },
          },
          select: { id: true, name: true, role: true },
        });
      }

      if (territory) {
        response['territory'] = await prisma.territory.findMany({
          where: { status: true, deletedAt: null, branchId: branchId },
          select: { name: true, id: true },
        });
      }

      if (paymentPlan) {
        if (userRole == 'ADMIN') {
          response['paymentPlan'] = await prisma.paymentPlan.findMany({
            where: { status: true, deletedAt: null },
            select: { name: true, id: true },
          });
        } else {
          response['paymentPlan'] = await prisma.paymentPlan.findMany({
            where: { status: true, deletedAt: null, branchId: userBranch },
            select: { name: true, id: true },
          });
        }
      }

      if (project) {
        response['project'] = await prisma.project.findMany({
          where: { status: true, deletedAt: null },
          select: { name: true, id: true },
        });
      }

      if (salesModel) {
        if (userRole == 'ADMIN') {
          response['salesModel'] = await prisma.salesModel.findMany({
            where: { status: true, deletedAt: null },
            select: { name: true, id: true },
          });
        } else {
          response['salesModel'] = await prisma.salesModel.findMany({
            where: { status: true, deletedAt: null, branchId: userBranch },
            select: { name: true, id: true },
          });
        }
      }

      if (unitType) {
        if (userRole == 'ADMIN') {
          response['unitType'] = await prisma.unitType.findMany({
            where: { status: true, deletedAt: null },
            select: { name: true, id: true },
          });
        } else {
          response['unitType'] = await prisma.unitType.findMany({
            where: { status: true, deletedAt: null, branchId: userBranch },
            select: { name: true, id: true },
          });
        }
      }

      if (permission) {
        response['permission'] = [
          'create-account',
          'read-account',
          'read-all-account',
          'update-account',
          'delete-account',
          'create-role',
          'read-role',
          'read-all-role',
          'update-role',
          'delete-role',
        ];
      }

      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      return this.handleError(next, error.message || 'An unexpected error occurred', 500);
    }
  }
}

export default new Controller();
