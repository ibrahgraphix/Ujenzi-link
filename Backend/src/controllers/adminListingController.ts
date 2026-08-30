import { Response } from 'express';
import { AdminListingService } from '../services/adminListingService';
import { AppError } from '../middleware';
import { ListingStatus, UserRole, AuthRequest } from '../models';

const adminListingService = new AdminListingService();

export class AdminListingController {
  getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, categoryId, providerId, adminCreated, page, limit } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view all listings');
      }

      const results = await adminListingService.getAllListings({
        status: status as ListingStatus,
        categoryId: categoryId as string,
        providerId: providerId as string,
        adminCreated: adminCreated ? adminCreated === 'true' : undefined,
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

  getPendingListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view pending listings');
      }

      const listings = await adminListingService.getPendingListings();

      res.status(200).json({
        status: 'success',
        data: { listings }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  approveListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;

      if (!listingId) {
        throw new AppError(400, 'Listing ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can approve listings');
      }

      const listing = await adminListingService.approveListing(listingId, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'Listing approved and is now active',
        data: { listing }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  rejectListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;

      if (!listingId) {
        throw new AppError(400, 'Listing ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can reject listings');
      }

      const listing = await adminListingService.rejectListing(listingId, req.user.userId);

      res.status(200).json({
        status: 'success',
        message: 'Listing rejected and marked inactive',
        data: { listing }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  changeListingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;
      const { status } = req.body;

      if (!listingId) {
        throw new AppError(400, 'Listing ID is required');
      }

      if (!status) {
        throw new AppError(400, 'Status is required');
      }

      if (!Object.values(ListingStatus).includes(status)) {
        throw new AppError(400, 'Invalid status value');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can change listing status');
      }

      const listing = await adminListingService.changeListingStatus(
        listingId,
        status,
        req.user.userId
      );

      res.status(200).json({
        status: 'success',
        message: 'Listing status updated successfully',
        data: { listing }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
