import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Public route for tracking visits
router.post('/track', asyncHandler(analyticsController.trackVisit));

// Admin-only routes for analytics
router.get('/traffic-summary', authenticate, authorize(UserRole.ADMIN), asyncHandler(analyticsController.getTrafficSummary));
router.get('/traffic-stats', authenticate, authorize(UserRole.ADMIN), asyncHandler(analyticsController.getTrafficStats));
router.get('/top-pages', authenticate, authorize(UserRole.ADMIN), asyncHandler(analyticsController.getTopPages));
router.get('/regional-visits', authenticate, authorize(UserRole.ADMIN), asyncHandler(analyticsController.getRegionalVisits));

export default router;
