import { Request, Response } from 'express';
import { ListingService } from '../services/listingService';
import { LocationService } from '../services/locationService';
import { AppError } from '../middleware';
import { ListingStatus, UserRole, AuthRequest } from '../models';

const listingService = new ListingService();
const locationService = new LocationService();

export class ListingController {
  getAllListings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, categoryId, providerId, page, limit } = req.query;

      // Use the admin listing service for consistent fetching
      const { AdminListingService } = await import('../services/adminListingService');
      const adminListingService = new AdminListingService();

      const results = await adminListingService.getAllListings({
        status: status as ListingStatus,
        categoryId: categoryId as string,
        providerId: providerId as string,
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

  getListingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;

      if (!listingId) {
        throw new AppError(400, 'Listing ID is required');
      }

      const listing = await listingService.getListingById(listingId);

      // Public endpoint: only return active listings
      if (listing.status !== ListingStatus.ACTIVE) {
        throw new AppError(404, 'Listing not found');
      }

      res.status(200).json({
        status: 'success',
        data: { listing }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(404, error.message);
      }
      throw error;
    }
  };

  createListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        providerId,
        categoryId,
        title,
        description,
        price,
        unit,
        locationId,
        location,
        images,
        imageUrls,
      } = req.body;

      if (!categoryId || !title || !description || !price) {
        throw new AppError(400, 'Missing required fields: categoryId, title, description, price');
      }

      let finalLocationId = locationId;
      if (!finalLocationId) {
        finalLocationId = await locationService.resolveLocationId(location);
      }

      // Determine providerId based on role
      let finalProviderId = providerId;
      let createdByAdmin = false;

      if (req.user?.role === UserRole.PROVIDER) {
        // Providers create listings for themselves
        finalProviderId = req.user.userId;
      } else if (req.user?.role === UserRole.ADMIN) {
        // Admins can create listings for any provider
        if (!providerId) {
          throw new AppError(400, 'providerId is required for admin-created listings');
        }
        createdByAdmin = true;
      } else {
        throw new AppError(403, 'Only providers and admins can create listings');
      }

      const listing = await listingService.createListing({
        providerId: finalProviderId,
        categoryId,
        title,
        description,
        price,
        unit,
        locationId: finalLocationId,
        createdByAdmin,
        images,
        imageUrls,
      });

      res.status(201).json({
        status: 'success',
        message: 'Listing created successfully',
        data: { listing }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;
      const {
        categoryId,
        title,
        description,
        price,
        unit,
        locationId,
        location,
        status,
        images,
        imageUrls,
      } = req.body;

      if (!listingId) {
        throw new AppError(400, 'Listing ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      let finalLocationId = locationId;
      if (!finalLocationId && location) {
        finalLocationId = await locationService.resolveLocationId(location);
      }

      const listing = await listingService.updateListing(
        listingId,
        req.user.userId,
        req.user.role,
        {
          categoryId,
          title,
          description,
          price,
          unit,
          locationId: finalLocationId,
          status,
          images,
          imageUrls,
        }
      );

      res.status(200).json({
        status: 'success',
        message: 'Listing updated successfully',
        data: { listing }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId } = req.params;

      if (!listingId) {
        throw new AppError(400, 'Listing ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const result = await listingService.deleteListing(
        listingId,
        req.user.userId,
        req.user.role
      );

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

  getProviderListings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;

      if (!providerId) {
        throw new AppError(400, 'Provider ID is required');
      }

      // Check permissions: providers can only view their own listings, admins can view any
      if (req.user?.role === UserRole.PROVIDER && providerId !== req.user.userId) {
        throw new AppError(403, 'You can only view your own listings');
      }

      const listings = await listingService.getProviderListings(providerId);

      res.status(200).json({
        status: 'success',
        data: { listings }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };
}
