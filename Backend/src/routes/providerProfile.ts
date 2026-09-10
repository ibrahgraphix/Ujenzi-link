import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware';
import { AuthRequest, UserRole, AvailabilityStatus } from '../models';
import { Response } from 'express';
import { ProviderProfileService } from '../services/providerProfileService';
import { AdminProviderService } from '../services/adminProviderService';

const router = Router();
const providerProfileService = new ProviderProfileService();
const adminProviderService = new AdminProviderService();

// Public route to get all providers (for customer/client view)
router.get('/all', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { providerType, search, isVerified, page, limit } = req.query;

  const results = await adminProviderService.getAllProviders({
    providerType: providerType as string,
    search: search as string,
    isVerified: isVerified ? isVerified === 'true' : undefined,
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20
  });

  res.json({ status: 'success', data: results });
}));

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

router.put('/profile/availability', authenticate, authorize(UserRole.PROVIDER), asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');

  const { availabilityStatus } = req.body;
  if (!availabilityStatus) {
    throw new AppError(400, 'availabilityStatus is required');
  }

  // Validate the availability status
  const validStatuses: AvailabilityStatus[] = ['available', 'occupied', 'busy_and_occupied', 'occupied_but_available'];
  if (!validStatuses.includes(availabilityStatus as AvailabilityStatus)) {
    throw new AppError(400, 'Invalid availability status');
  }

  const updated = await providerProfileService.updateProviderAvailabilityStatus(req.user.userId, availabilityStatus as AvailabilityStatus);
  res.json({ status: 'success', message: 'Availability status updated', data: { profile: updated } });
}));

export default router;
