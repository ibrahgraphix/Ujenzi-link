import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import { asyncHandler } from '../middleware';

const router = Router();
const searchController = new SearchController();

// Public search routes
router.get('/listings', asyncHandler(searchController.searchListings));

// Location hierarchy routes (public)
// Level 1: Regions
router.get('/locations/regions', asyncHandler(searchController.getRegions));

// Level 2: Counties by Region
router.get('/locations/regions/:region/counties', asyncHandler(searchController.getCountiesByRegion));

// Level 3: Districts by Region+County
router.get('/locations/regions/:region/counties/:county/districts', asyncHandler(searchController.getDistrictsByCounty));

// Level 4: Wards by Region+County+District
router.get('/locations/regions/:region/counties/:county/districts/:district/wards', asyncHandler(searchController.getWardsByDistrict));

// Level 5: Streets by Region+County+District+Ward
router.get('/locations/regions/:region/counties/:county/districts/:district/wards/:ward/streets', asyncHandler(searchController.getStreetsByWard));

// Legacy: districts by region only (kept for backward compat)
router.get('/locations/regions/:region/districts', asyncHandler(searchController.getDistrictsByRegion));

// Full hierarchy JSON
router.get('/locations/hierarchy', asyncHandler(searchController.getLocationHierarchy));

export default router;
