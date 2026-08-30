import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

// Protected routes (examples for testing auth)
router.get('/me', authenticate, asyncHandler(async (req: any, res: any) => {
  res.json({ user: req.user });
}));

router.get('/admin-only', authenticate, authorize(UserRole.ADMIN), asyncHandler(async (req: any, res: any) => {
  res.json({ message: 'Admin access granted' });
}));

export default router;
