import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { AppError } from '../middleware';
import { UserRole, AuthRequest } from '../models';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  trackVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, pagePath, referrer, userId } = req.body;

      if (!sessionId || !pagePath) {
        throw new AppError(400, 'Missing required fields: sessionId, pagePath');
      }

      const result = await analyticsService.trackVisit({
        sessionId,
        pagePath,
        referrer,
        userId
      });

      res.status(200).json({
        status: 'success',
        message: result.message
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getTrafficSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view traffic summary');
      }

      const trafficData = await analyticsService.getTrafficSummary({
        startDate: startDate as string,
        endDate: endDate as string
      });

      res.status(200).json({
        status: 'success',
        data: { trafficData }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getTrafficStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view traffic stats');
      }

      const stats = await analyticsService.getTrafficStats({
        startDate: startDate as string,
        endDate: endDate as string
      });

      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getTopPages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, limit } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view top pages');
      }

      const topPages = await analyticsService.getTopPages({
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : 10
      });

      res.status(200).json({
        status: 'success',
        data: { topPages }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };
}
