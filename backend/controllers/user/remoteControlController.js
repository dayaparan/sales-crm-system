import { PrismaClient } from '@prisma/client';
import BaseController from '../BaseController.js';
import { emitToUser, disconnectUser, isUserOnline } from '../../socket.js';

const prisma = new PrismaClient();

class RemoteControlController extends BaseController {
  constructor() {
    super();
    this.getOnlineUsers = this.getOnlineUsers.bind(this);
    this.forceLogout = this.forceLogout.bind(this);
    this.lockAccount = this.lockAccount.bind(this);
    this.unlockAccount = this.unlockAccount.bind(this);
    this.requestLocation = this.requestLocation.bind(this);
    this.pushConfig = this.pushConfig.bind(this);
    this.getCommandHistory = this.getCommandHistory.bind(this);
  }

  /**
   * Validate that the requesting user has admin/manager privileges
   * and the target user exists and is subordinate.
   */
  async _validateAccess(req, targetId) {
    const { id: issuerId, role: issuerRole, branchId: issuerBranchId } = req.user;

    if (issuerRole === 'AGENT') {
      return { error: 'Access denied', status: 403 };
    }

    if (issuerId === targetId) {
      return { error: 'Cannot issue remote commands to yourself', status: 400 };
    }

    const target = await prisma.user.findFirst({
      where: { id: targetId, deletedAt: null },
      select: { id: true, name: true, email: true, role: true, status: true, branchId: true },
    });

    if (!target) {
      return { error: 'Target user not found', status: 404 };
    }

    // Managers can only control agents in their branch
    if (issuerRole === 'MANAGER') {
      if (target.role !== 'AGENT') {
        return { error: 'Managers can only control agents', status: 403 };
      }
      if (issuerBranchId && target.branchId !== issuerBranchId) {
        return { error: 'Target agent is not in your branch', status: 403 };
      }
    }

    return { target };
  }

  /**
   * Log a remote command in the database.
   */
  async _logCommand(issuedById, targetId, command, payload, status) {
    return prisma.remoteCommand.create({
      data: {
        issuedById,
        targetId,
        command,
        payload,
        status,
        executedAt: status === 'DELIVERED' || status === 'ACKNOWLEDGED' ? new Date() : null,
      },
    });
  }

  /**
   * GET /remote-control/online-users
   * List users with their online status.
   */
  async getOnlineUsers(req, res, next) {
    try {
      const { role: userRole, branchId: userBranchId, id: userId } = req.user;

      if (userRole === 'AGENT') {
        return this.handleError(next, 'Access denied', 403);
      }

      const filters = { deletedAt: null, id: { not: userId } };

      if (userRole === 'MANAGER') {
        filters.role = 'AGENT';
        if (userBranchId) {
          filters.branchId = userBranchId;
        }
      }

      const users = await prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profile: true,
          branchId: true,
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { name: 'asc' },
      });

      const usersWithStatus = users.map((user) => ({
        ...user,
        _id: user.id,
        isOnline: isUserOnline(user.id),
      }));

      return res.status(200).json({
        success: true,
        users: usersWithStatus,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to fetch online users', 500);
    }
  }

  /**
   * POST /remote-control/force-logout/:id
   * Force disconnect a user from all sessions.
   */
  async forceLogout(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const validation = await this._validateAccess(req, targetId);
      if (validation.error) {
        return this.handleError(next, validation.error, validation.status);
      }

      disconnectUser(targetId);

      await this._logCommand(req.user.id, targetId, 'FORCE_LOGOUT', null, 'DELIVERED');

      return res.status(200).json({
        success: true,
        message: `User "${validation.target.name}" has been forcefully logged out`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to force logout user', 500);
    }
  }

  /**
   * POST /remote-control/lock-account/:id
   * Deactivate a user's account and disconnect them.
   */
  async lockAccount(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const validation = await this._validateAccess(req, targetId);
      if (validation.error) {
        return this.handleError(next, validation.error, validation.status);
      }

      if (!validation.target.status) {
        return this.handleError(next, 'Account is already locked', 400);
      }

      await prisma.user.update({
        where: { id: targetId },
        data: { status: false },
      });

      // Notify and disconnect
      emitToUser(targetId, 'remote:account-locked', {
        message: 'Your account has been locked by an administrator.',
      });
      disconnectUser(targetId);

      await this._logCommand(req.user.id, targetId, 'LOCK_ACCOUNT', null, 'DELIVERED');

      return res.status(200).json({
        success: true,
        message: `Account for "${validation.target.name}" has been locked`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to lock account', 500);
    }
  }

  /**
   * POST /remote-control/unlock-account/:id
   * Reactivate a user's account.
   */
  async unlockAccount(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const validation = await this._validateAccess(req, targetId);
      if (validation.error) {
        return this.handleError(next, validation.error, validation.status);
      }

      if (validation.target.status) {
        return this.handleError(next, 'Account is already active', 400);
      }

      await prisma.user.update({
        where: { id: targetId },
        data: { status: true },
      });

      await this._logCommand(req.user.id, targetId, 'UNLOCK_ACCOUNT', null, 'DELIVERED');

      return res.status(200).json({
        success: true,
        message: `Account for "${validation.target.name}" has been unlocked`,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to unlock account', 500);
    }
  }

  /**
   * POST /remote-control/request-location/:id
   * Request a real-time location update from an agent.
   */
  async requestLocation(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const validation = await this._validateAccess(req, targetId);
      if (validation.error) {
        return this.handleError(next, validation.error, validation.status);
      }

      const online = isUserOnline(targetId);
      if (!online) {
        await this._logCommand(req.user.id, targetId, 'REQUEST_LOCATION', null, 'FAILED');
        return this.handleError(next, 'User is currently offline', 400);
      }

      const delivered = emitToUser(targetId, 'remote:request-location', {
        requestedBy: req.user.id,
        message: 'Your location has been requested by management.',
      });

      const status = delivered ? 'DELIVERED' : 'FAILED';
      await this._logCommand(req.user.id, targetId, 'REQUEST_LOCATION', null, status);

      return res.status(200).json({
        success: true,
        message: delivered
          ? `Location request sent to "${validation.target.name}"`
          : 'Failed to deliver location request',
        delivered,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to request location', 500);
    }
  }

  /**
   * POST /remote-control/push-config/:id
   * Push configuration changes to an agent's client.
   */
  async pushConfig(req, res, next) {
    try {
      const { id: targetId } = req.params;
      const { config } = req.body;

      if (!config || typeof config !== 'object') {
        return this.handleError(next, 'Config object is required', 400);
      }

      const validation = await this._validateAccess(req, targetId);
      if (validation.error) {
        return this.handleError(next, validation.error, validation.status);
      }

      const online = isUserOnline(targetId);
      const delivered = online
        ? emitToUser(targetId, 'remote:push-config', {
            requestedBy: req.user.id,
            config,
          })
        : false;

      const status = delivered ? 'DELIVERED' : 'PENDING';
      await this._logCommand(req.user.id, targetId, 'PUSH_CONFIG', config, status);

      return res.status(200).json({
        success: true,
        message: delivered
          ? `Configuration pushed to "${validation.target.name}"`
          : `Configuration queued for "${validation.target.name}" (currently offline)`,
        delivered,
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to push config', 500);
    }
  }

  /**
   * GET /remote-control/history
   * Get command history with pagination.
   */
  async getCommandHistory(req, res, next) {
    try {
      const { role: userRole, id: userId, branchId: userBranchId } = req.user;
      let { page = 1, limit = 20, command, targetId } = req.query;

      if (userRole === 'AGENT') {
        return this.handleError(next, 'Access denied', 403);
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skipNum = (pageNum - 1) * limitNum;

      const filters = {};

      // Managers only see their own issued commands
      if (userRole === 'MANAGER') {
        filters.issuedById = userId;
      }

      if (command) {
        filters.command = command;
      }

      if (targetId) {
        filters.targetId = targetId;
      }

      const [totalItems, commands] = await Promise.all([
        prisma.remoteCommand.count({ where: filters }),
        prisma.remoteCommand.findMany({
          where: filters,
          select: {
            id: true,
            command: true,
            payload: true,
            status: true,
            response: true,
            executedAt: true,
            createdAt: true,
            issuedBy: { select: { id: true, name: true, email: true, role: true } },
            target: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: skipNum,
          take: limitNum,
        }),
      ]);

      return res.status(200).json({
        success: true,
        commands,
        pagination: {
          currentPage: pageNum,
          pageSize: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
        },
      });
    } catch (error) {
      return this.handleError(next, error.message || 'Failed to fetch command history', 500);
    }
  }
}

export default new RemoteControlController();
