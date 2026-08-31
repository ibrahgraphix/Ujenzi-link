import { Router } from 'express';
import { ListingController } from '../controllers/listingController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';
import { asyncHandler } from '../middleware';

const router = Router();
const listingController = new ListingController();

// Public listings search (no auth required) - must come before :listingId route
router.get('/', asyncHandler(listingController.getAllListings));

// Public routes
router.get('/:listingId', asyncHandler(listingController.getListingById));

// Protected routes (provider and admin)
router.post('/', authenticate, authorize(UserRole.PROVIDER, UserRole.ADMIN), asyncHandler(listingController.createListing));
router.put('/:listingId', authenticate, authorize(UserRole.PROVIDER, UserRole.ADMIN), asyncHandler(listingController.updateListing));
router.delete('/:listingId', authenticate, authorize(UserRole.PROVIDER, UserRole.ADMIN), asyncHandler(listingController.deleteListing));

// Provider-specific routes
router.get('/provider/:providerId', authenticate, authorize(UserRole.PROVIDER, UserRole.ADMIN), asyncHandler(listingController.getProviderListings));

export default router;
