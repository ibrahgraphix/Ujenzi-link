import { Router } from 'express';
import { AdminListingController } from '../controllers/adminListingController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const adminListingController = new AdminListingController();

// Admin-only routes for listing management
router.get('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminListingController.getAllListings));
router.put('/:listingId/status', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminListingController.changeListingStatus));

export default router;
