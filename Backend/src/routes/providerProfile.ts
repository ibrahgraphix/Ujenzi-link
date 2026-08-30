import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware';
import { AuthRequest, UserRole } from '../models';
import { Response } from 'express';
import { ProviderProfileService } from '../services/providerProfileService';

const router = Router();
const providerProfileService = new ProviderProfileService();

router.get('/profile', authenticate, authorize(UserRole.PROVIDER), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');

  const profile = await providerProfileService.getProviderProfileByUserId(req.user.userId);
  res.json({ status: 'success', data: { profile } });
}));

router.put('/profile/logo', authenticate, authorize(UserRole.PROVIDER), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');

  const { logo, logoFileId } = req.body;
  if (!logo) {
    throw new AppError(400, 'logo URL is required');
  }

  const updated = await providerProfileService.updateProviderLogo(req.user.userId, logo, logoFileId);
  res.json({ status: 'success', message: 'Logo updated', data: { profile: updated } });
}));

export default router;
