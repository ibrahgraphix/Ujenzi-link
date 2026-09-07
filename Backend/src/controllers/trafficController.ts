import { Request, Response } from 'express';
import { TrafficService } from '../services/trafficService';
import { AppError } from '../middleware';
import { AuthRequest, UserRole } from '../models';

const trafficService = new TrafficService();

export class TrafficController {
  trackPageVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageUrl } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      if (!pageUrl) {
        throw new AppError(400, 'pageUrl is required');
      }

      const visit = await trafficService.trackPageVisit(ipAddress, pageUrl);

      res.status(200).json({
        status: 'success',
        data: { visit }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  trackListingVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      if (!listingId) {
        throw new AppError(400, 'listingId is required');
      }

      const visit = await trafficService.trackListingVisit(ipAddress, listingId);

      res.status(200).json({
        status: 'success',
        data: { visit }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  trackProviderVisit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      if (!providerId) {
        throw new AppError(400, 'providerId is required');
      }

      // Note: providerId should be the user_id from provider_profiles table
      const visit = await trafficService.trackProviderVisit(ipAddress, providerId);

      res.status(200).json({
        status: 'success',
        data: { visit }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getTrafficStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can view traffic stats
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view traffic statistics');
      }

      const stats = await trafficService.getTrafficStats();

      res.status(200).json({
        status: 'success',
        data: { stats }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getListingTraffic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;

      if (!listingId) {
        throw new AppError(400, 'listingId is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins and the listing owner can view traffic stats
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.PROVIDER) {
        throw new AppError(403, 'Only admins and providers can view listing traffic statistics');
      }

      const traffic = await trafficService.getListingTraffic(listingId);

      res.status(200).json({
        status: 'success',
        data: { traffic }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getProviderTraffic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;

      if (!providerId) {
        throw new AppError(400, 'providerId is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins and the provider can view traffic stats
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.PROVIDER) {
        throw new AppError(403, 'Only admins and providers can view provider traffic statistics');
      }

      const traffic = await trafficService.getProviderTraffic(providerId);

      res.status(200).json({
        status: 'success',
        data: { traffic }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
