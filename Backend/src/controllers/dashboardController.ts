import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { AppError } from '../middleware';
import { UserRole, AuthRequest } from '../models';

const dashboardService = new DashboardService();

export class DashboardController {
  getDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view dashboard overview');
      }

      const overview = await dashboardService.getDashboardOverview();

      res.status(200).json({
        status: 'success',
        data: overview
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };
}
