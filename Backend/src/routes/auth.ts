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

  const enrichedUser: Record<string, any> = { ...user };

  if (user.role === 'buyer') {
    const { data: buyerProfile } = await supabase
      .from('buyer_profiles')
      .select('buyer_type, institution_name, project_name, project_description')
      .eq('user_id', userId)
      .single();

    if (buyerProfile) {
      enrichedUser.buyer_type = buyerProfile.buyer_type;
      enrichedUser.institution_name = buyerProfile.institution_name;
      enrichedUser.project_name = buyerProfile.project_name;
      enrichedUser.project_description = buyerProfile.project_description;
    }
  }

  if (user.role === 'provider') {
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('provider_type, business_name, is_verified')
      .eq('user_id', userId)
      .single();

    if (providerProfile) {
      enrichedUser.provider_type = providerProfile.provider_type;
      enrichedUser.business_name = providerProfile.business_name;
      enrichedUser.is_verified = providerProfile.is_verified;
    }
  }

  res.json({ status: 'success', data: { user: enrichedUser } });
}));

router.get('/admin-only', authenticate, authorize(UserRole.ADMIN), asyncHandler(async (req: any, res: any) => {
  res.json({ message: 'Admin access granted' });
}));

export default router;
