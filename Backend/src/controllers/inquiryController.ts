import { Request, Response } from 'express';
import { InquiryService } from '../services/inquiryService';
import { AppError } from '../middleware';
import { InquiryStatus, UserRole, AuthRequest } from '../models';

const inquiryService = new InquiryService();

export class InquiryController {
  createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { listingId, providerId, message } = req.body;

      if (!listingId || !providerId || !message) {
        throw new AppError(400, 'Missing required fields: listingId, providerId, message');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only buyers can create inquiries
      if (req.user.role !== UserRole.BUYER) {
        throw new AppError(403, 'Only buyers can submit inquiries');
      }

      const inquiry = await inquiryService.createInquiry({
        buyerId: req.user.userId,
        providerId,
        listingId,
        message
      });

      res.status(201).json({
        status: 'success',
        message: 'Inquiry submitted successfully',
        data: { inquiry }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getProviderInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status, listingId } = req.query;

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only providers can view their received inquiries
      if (req.user.role !== UserRole.PROVIDER) {
        throw new AppError(403, 'Only providers can view received inquiries');
      }

      const inquiries = await inquiryService.getProviderInquiries(req.user.userId, {
        status: status as InquiryStatus,
        listingId: listingId as string
      });

      res.status(200).json({
        status: 'success',
        data: { inquiries }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getBuyerInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only buyers can view their sent inquiries
      if (req.user.role !== UserRole.BUYER) {
        throw new AppError(403, 'Only buyers can view their sent inquiries');
      }

      const inquiries = await inquiryService.getBuyerInquiries(req.user.userId);

      res.status(200).json({
        status: 'success',
        data: { inquiries }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  getInquiryById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { inquiryId } = req.params;

      if (!inquiryId) {
        throw new AppError(400, 'Inquiry ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const inquiry = await inquiryService.getInquiryById(inquiryId);

      // Check permissions: buyers can view their own inquiries, providers can view inquiries for their listings
      if (req.user.role === UserRole.BUYER && inquiry.buyer_id !== req.user.userId) {
        throw new AppError(403, 'You can only view your own inquiries');
      }

      if (req.user.role === UserRole.PROVIDER && inquiry.provider_id !== req.user.userId) {
        throw new AppError(403, 'You can only view inquiries for your listings');
      }

      res.status(200).json({
        status: 'success',
        data: { inquiry }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  updateInquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { inquiryId } = req.params;
      const { status } = req.body;

      if (!inquiryId) {
        throw new AppError(400, 'Inquiry ID is required');
      }

      if (!status) {
        throw new AppError(400, 'Status is required');
      }

      if (!Object.values(InquiryStatus).includes(status)) {
        throw new AppError(400, 'Invalid status value');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      // Only providers can update inquiry status
      if (req.user.role !== UserRole.PROVIDER) {
        throw new AppError(403, 'Only providers can update inquiry status');
      }

      const inquiry = await inquiryService.updateInquiryStatus(
        inquiryId,
        req.user.userId,
        status
      );

      res.status(200).json({
        status: 'success',
        message: 'Inquiry status updated successfully',
        data: { inquiry }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(400, error.message);
      }
      throw error;
    }
  };

  deleteInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { inquiryId } = req.params;

      if (!inquiryId) {
        throw new AppError(400, 'Inquiry ID is required');
      }

      if (!req.user) {
        throw new AppError(401, 'User not authenticated');
      }

      const result = await inquiryService.deleteInquiry(
        inquiryId,
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
}
