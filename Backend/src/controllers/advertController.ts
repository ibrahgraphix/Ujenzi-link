import { Request, Response } from 'express';
import { AdvertService } from '../services/advertService';
import { AppError } from '../middleware';
import { UserRole, AuthRequest } from '../models';

const advertService = new AdvertService();

export class AdvertController {
  getActiveAdverts = async (req: Request, res: Response): Promise<void> => {
    try {
      const adverts = await advertService.getActiveAdverts();

      res.status(200).json({
        status: 'success',
        data: { adverts }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getAllAdverts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { isActive, providerId, page, limit } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can access this endpoint
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can view all adverts');
      }

      const results = await advertService.getAllAdverts({
        isActive: isActive ? isActive === 'true' : undefined,
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

  createAdvert = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, imageUrl, imageFileId, linkUrl, isActive, isPaid, priceAmount, startsAt, endsAt, providerId } = req.body;

      if (!title || !imageUrl || !linkUrl || !startsAt || !endsAt) {
        throw new AppError(400, 'Missing required fields: title, imageUrl, linkUrl, startsAt, endsAt');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can create adverts
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can create adverts');
      }

      const advert = await advertService.createAdvert({
        title,
        imageUrl,
        imageFileId,
        linkUrl,
        isActive: isActive !== undefined ? isActive : true,
        isPaid: isPaid !== undefined ? isPaid : false,
        priceAmount: priceAmount !== undefined ? Number(priceAmount) : undefined,
        startsAt,
        endsAt,
        providerId
      }, req.user.userId);

      res.status(201).json({
        status: 'success',
        message: 'Advert created successfully',
        data: { advert }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  updateAdvert = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { advertId } = req.params;
      const { title, imageUrl, imageFileId, linkUrl, isActive, isPaid, priceAmount, startsAt, endsAt, providerId } = req.body;

      if (!advertId) {
        throw new AppError(400, 'Advert ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can update adverts
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can update adverts');
      }

      const advert = await advertService.updateAdvert(
        advertId,
        {
          title,
          imageUrl,
          imageFileId,
          linkUrl,
          isActive,
          isPaid,
          priceAmount: priceAmount !== undefined ? Number(priceAmount) : undefined,
          startsAt,
          endsAt,
          providerId
        },
        req.user.userId
      );

      res.status(200).json({
        status: 'success',
        message: 'Advert updated successfully',
        data: { advert }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  deleteAdvert = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { advertId } = req.params;

      if (!advertId) {
        throw new AppError(400, 'Advert ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only admins can delete adverts
      if (req.user.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Only admins can delete adverts');
      }

      const result = await advertService.deleteAdvert(advertId, req.user.userId);

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
}
