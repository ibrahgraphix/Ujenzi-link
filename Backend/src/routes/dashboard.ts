import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const dashboardController = new DashboardController();

// Admin-only routes for dashboard
router.get('/overview', authenticate, authorize(UserRole.ADMIN), asyncHandler(dashboardController.getDashboardOverview));
router.get('/analytics', authenticate, authorize(UserRole.ADMIN), asyncHandler(dashboardController.getAdminAnalytics));

export default router;
