import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const dashboardController = new DashboardController();

// Admin-only route for dashboard overview
router.get('/overview', authenticate, authorize(UserRole.ADMIN), asyncHandler(dashboardController.getDashboardOverview));

export default router;
