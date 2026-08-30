import { Request, Response } from 'express';
import { AdminUserService } from '../services/adminUserService';
import { AppError } from '../middleware';
import { UserRole, AuthRequest } from '../models';

const adminUserService = new AdminUserService();

export class AdminUserController {
  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { role, search, page, limit } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view all users');
      }

      const results = await adminUserService.getAllUsers({
        role: role as UserRole,
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
      });

      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new AppError(400, 'User ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can deactivate users
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can deactivate users');
      }

      const user = await adminUserService.deactivateUser(userId, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'User deactivated successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  reactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        throw new AppError(400, 'User ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can reactivate users
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can reactivate users');
      }

      const user = await adminUserService.reactivateUser(userId, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'User reactivated successfully',
        data: { user }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
