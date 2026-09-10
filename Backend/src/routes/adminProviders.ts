import { Router } from 'express';
import { AdminProviderController } from '../controllers/adminProviderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const adminProviderController = new AdminProviderController();

// Admin-only routes for provider management
router.get('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminProviderController.getAllProviders));
router.get('/pending', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminProviderController.getPendingProviders));
router.post('/:providerId/approve', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminProviderController.approveProvider));
router.delete('/:providerId', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminProviderController.deleteProvider));
router.get('/:providerId/full-profile', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminProviderController.getProviderFullProfile));

export default router;
