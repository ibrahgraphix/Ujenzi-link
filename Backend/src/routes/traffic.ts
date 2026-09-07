import { Router } from 'express';
import { TrafficController } from '../controllers/trafficController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const trafficController = new TrafficController();

// Public routes (no authentication required)
router.post('/page', asyncHandler(trafficController.trackPageVisit));
router.post('/listing/:listingId', asyncHandler(trafficController.trackListingVisit));
router.post('/provider/:providerId', asyncHandler(trafficController.trackProviderVisit));

// Admin routes (authentication required)
router.get('/stats', authenticate, authorize(UserRole.ADMIN), asyncHandler(trafficController.getTrafficStats));
router.get('/listing/:listingId', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER), asyncHandler(trafficController.getListingTraffic));
router.get('/provider/:providerId', authenticate, authorize(UserRole.ADMIN, UserRole.PROVIDER), asyncHandler(trafficController.getProviderTraffic));

export default router;
