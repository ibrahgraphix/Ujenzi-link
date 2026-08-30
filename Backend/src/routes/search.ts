import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { asyncHandler } from '../middleware';

const router = Router();
const searchController = new SearchController();

// Public search routes
router.get('/listings', asyncHandler(searchController.searchListings));

// Location hierarchy routes (public)
router.get('/locations/regions', asyncHandler(searchController.getRegions));
router.get('/locations/regions/:region/districts', asyncHandler(searchController.getDistrictsByRegion));
router.get('/locations/regions/:region/districts/:district/wards', asyncHandler(searchController.getWardsByDistrict));
router.get('/locations/regions/:region/districts/:district/wards/:ward/streets', asyncHandler(searchController.getStreetsByWard));
router.get('/locations/hierarchy', asyncHandler(searchController.getLocationHierarchy));

export default router;
