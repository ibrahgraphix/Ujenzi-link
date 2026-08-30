import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware';
import { AuthService } from '../services/authService';
import { AppError } from '../middleware';
import { AuthRequest } from '../models';
import { Response } from 'express';

const router = Router();
const authService = new AuthService();

// GET /api/buyer/profile — get own buyer profile (buyer_type, institution fields, etc.)
router.get('/profile', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');

  try {
    const profile = await authService.getBuyerProfile(req.user.userId);
    res.json({ status: 'success', data: { profile } });
  } catch (error) {
    if (error instanceof Error) throw new AppError(404, error.message);
    throw error;
  }
}));

// PUT /api/buyer/profile — update client-only fields (institution_name, project_name, project_description)
router.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');

  const { institutionName, projectName, projectDescription } = req.body;

  try {
    const updated = await authService.updateBuyerProfile(req.user.userId, {
      institutionName,
      projectName,
      projectDescription,
    });
    res.json({ status: 'success', message: 'Profile updated', data: { profile: updated } });
  } catch (error) {
    if (error instanceof Error) throw new AppError(400, error.message);
    throw error;
  }
}));

export default router;
