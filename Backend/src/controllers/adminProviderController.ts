import { Request, Response } from 'express';
import { AdminProviderService } from '../services/adminProviderService';
import { AppError } from '../middleware';
import { UserRole, AuthRequest } from '../models';

const adminProviderService = new AdminProviderService();

export class AdminProviderController {
  getAllProviders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { providerType, search, isVerified, page, limit } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view all providers');
      }

      const results = await adminProviderService.getAllProviders({
        providerType: providerType as string,
        search: search as string,
        isVerified: isVerified ? isVerified === 'true' : undefined,
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

  getProviderFullProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;

      if (!providerId) {
        throw new AppError(400, 'Provider ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view provider full profiles');
      }

      const profile = await adminProviderService.getProviderFullProfile(providerId);

      res.status(200).json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getPendingProviders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view pending providers');
      }

      const providers = await adminProviderService.getPendingProviders();

      res.status(200).json({
        status: 'success',
        data: { providers }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  approveProvider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;

      if (!providerId) {
        throw new AppError(400, 'Provider ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can approve providers');
      }

      const provider = await adminProviderService.approveProvider(providerId, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'Provider approved successfully',
        data: { provider }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  deactivateProvider = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;

      if (!providerId) {
        throw new AppError(400, 'Provider ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can deactivate providers');
      }

      const provider = await adminProviderService.deactivateProvider(providerId, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'Provider deactivated successfully',
        data: { provider }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
