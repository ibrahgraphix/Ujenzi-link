import { Router } from 'express';
import { AdminUserController } from '../controllers/adminUserController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const adminUserController = new AdminUserController();

// Admin-only routes for user management
router.get('/', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminUserController.getAllUsers));
router.put('/:userId/deactivate', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminUserController.deactivateUser));
router.put('/:userId/reactivate', authenticate, authorize(UserRole.ADMIN), asyncHandler(adminUserController.reactivateUser));

export default router;
