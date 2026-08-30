import { Router } from 'express';
import { InquiryController } from '../controllers/inquiryController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const inquiryController = new InquiryController();

// Buyer routes
router.post('/', authenticate, authorize(UserRole.BUYER), asyncHandler(inquiryController.createInquiry));
router.get('/my-inquiries', authenticate, authorize(UserRole.BUYER), asyncHandler(inquiryController.getBuyerInquiries));

// Provider routes
router.get('/received', authenticate, authorize(UserRole.PROVIDER), asyncHandler(inquiryController.getProviderInquiries));
router.put('/:inquiryId/status', authenticate, authorize(UserRole.PROVIDER), asyncHandler(inquiryController.updateInquiryStatus));

// Shared routes (buyer and provider)
router.get('/:inquiryId', authenticate, authorize(UserRole.BUYER, UserRole.PROVIDER), asyncHandler(inquiryController.getInquiryById));
router.delete('/:inquiryId', authenticate, authorize(UserRole.BUYER, UserRole.PROVIDER), asyncHandler(inquiryController.deleteInquiry));

export default router;
