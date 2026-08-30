import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';
import { supabase } from '../config';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

// Protected: returns full user profile from DB for session hydration
router.get('/me', authenticate, asyncHandler(async (req: any, res: any) => {
  const userId = req.user.userId;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, phone, role, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ status: 'error', message: 'User not found' });
  }

  res.json({ status: 'success', data: { user } });
}));

router.get('/admin-only', authenticate, authorize(UserRole.ADMIN), asyncHandler(async (req: any, res: any) => {
  res.json({ message: 'Admin access granted' });
}));

export default router;
