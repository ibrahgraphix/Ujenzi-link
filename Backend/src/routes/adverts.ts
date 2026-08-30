import { Router } from 'express';
import { AdvertController } from '../controllers/advertController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const advertController = new AdvertController();

// Public routes
router.get('/active', asyncHandler(advertController.getActiveAdverts));

// Admin-only routes
router.get('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(advertController.getAllAdverts));
router.post('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(advertController.createAdvert));
router.put('/:advertId', authenticate, authorize(UserRole.ADMIN), asyncHandler(advertController.updateAdvert));
router.delete('/:advertId', authenticate, authorize(UserRole.ADMIN), asyncHandler(advertController.deleteAdvert));

export default router;
