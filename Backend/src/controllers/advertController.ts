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
      const b = req.body || {};
      const title = b.title;
      const subtitle = b.subtitle || null;
      const description = b.description || null;
      const imageUrl = b.imageUrl || b.image_url;
      const imageFileId = b.imageFileId || b.image_file_id || null;
      const linkUrl = b.linkUrl || b.link_url || null;
      const contactPhone = b.contactPhone || b.contact_phone || b.phoneNumber || b.phone_number || b.whatsapp || null;
      const contactEmail = b.contactEmail || b.contact_email || b.email || null;
      const startTime = b.startTime || b.start_time || null;
      const endTime = b.endTime || b.end_time || null;
      const isActive = b.isActive !== undefined ? b.isActive : (b.is_active !== undefined ? b.is_active : true);
      const isPaid = b.isPaid !== undefined ? b.isPaid : (b.is_paid !== undefined ? b.is_paid : false);
      const priceAmount = b.priceAmount !== undefined ? Number(b.priceAmount) : (b.price_amount !== undefined ? Number(b.price_amount) : undefined);
      const startsAt = b.startsAt || b.starts_at;
      const endsAt = b.endsAt || b.ends_at;
      const providerId = b.providerId || b.provider_id || null;

      if (!title || !imageUrl || !startsAt || !endsAt) {
        throw new AppError(400, 'Missing required fields: title, imageUrl, startsAt, endsAt');
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
        subtitle,
        description,
        imageUrl,
        imageFileId,
        linkUrl,
        phoneNumber: contactPhone,
        email: contactEmail,
        contactPhone,
        contactEmail,
        startTime,
        endTime,
        isActive,
        isPaid,
        priceAmount,
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
      const b = req.body || {};

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

      const contactPhone = b.contactPhone !== undefined ? b.contactPhone : (b.contact_phone !== undefined ? b.contact_phone : (b.phoneNumber !== undefined ? b.phoneNumber : (b.phone_number !== undefined ? b.phone_number : b.whatsapp)));
      const contactEmail = b.contactEmail !== undefined ? b.contactEmail : (b.contact_email !== undefined ? b.contact_email : b.email);

      const advert = await advertService.updateAdvert(
        advertId,
        {
          title: b.title,
          subtitle: b.subtitle,
          description: b.description,
          imageUrl: b.imageUrl || b.image_url,
          imageFileId: b.imageFileId || b.image_file_id,
          linkUrl: b.linkUrl || b.link_url,
          phoneNumber: contactPhone,
          email: contactEmail,
          contactPhone,
          contactEmail,
          startTime: b.startTime || b.start_time,
          endTime: b.endTime || b.end_time,
          isActive: b.isActive !== undefined ? b.isActive : b.is_active,
          isPaid: b.isPaid !== undefined ? b.isPaid : b.is_paid,
          priceAmount: b.priceAmount !== undefined ? Number(b.priceAmount) : (b.price_amount !== undefined ? Number(b.price_amount) : undefined),
          startsAt: b.startsAt || b.starts_at,
          endsAt: b.endsAt || b.ends_at,
          providerId: b.providerId || b.provider_id
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
