import { Request, Response } from 'express';
import { SearchService } from '../services/searchService';
import { AppError } from '../middleware';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const searchService = new SearchService();

// Create a dedicated service role client for public queries that bypasses RLS
const serviceRoleClient = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': config.supabaseSecretKey,
      'Authorization': `Bearer ${config.supabaseSecretKey}`
    }
  }
});

export class SearchController {
  searchListings = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        keyword,
        categoryId,
        region,
        county,
        district,
        providerType,
        minPrice,
        maxPrice,
        page,
        limit,
        status,
        includeAll
      } = req.query;

      const results = await searchService.searchListings({
        keyword: keyword as string,
        categoryId: categoryId as string,
        region: region as string,
        county: county as string,
        district: district as string,
        providerType: providerType as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        status: status as string,
        includeAll: includeAll === 'true'
      });

      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getRegions = async (req: Request, res: Response): Promise<void> => {
    try {
      const regions = await searchService.getRegions();

      res.status(200).json({
        status: 'success',
        data: { regions }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getCountiesByRegion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { region } = req.params;

      if (!region) {
        throw new AppError(400, 'Region is required');
      }

      const counties = await searchService.getCountiesByRegion(region);

      res.status(200).json({
        status: 'success',
        data: { counties }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getDistrictsByCounty = async (req: Request, res: Response): Promise<void> => {
    try {
      const { region, county } = req.params;

      if (!region || !county) {
        throw new AppError(400, 'Region and county are required');
      }

      const districts = await searchService.getDistrictsByRegion(region);

      res.status(200).json({
        status: 'success',
        data: { districts }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  /** Legacy: districts by region (no county). Kept for backward compat. */
  getDistrictsByRegion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { region } = req.params;

      if (!region) {
        throw new AppError(400, 'Region is required');
      }

      const districts = await searchService.getDistrictsByRegion(region);

      res.status(200).json({
        status: 'success',
        data: { districts }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getWardsByDistrict = async (req: Request, res: Response): Promise<void> => {
    try {
      const { region, district } = req.params;

      if (!region || !district) {
        throw new AppError(400, 'Region and district are required');
      }

      const { data: locations, error } = await serviceRoleClient
        .from('locations')
        .select('ward')
        .eq('region', region)
        .eq('district', district)
        .not('ward', 'is', null)
        .order('ward');

      if (error) {
        throw new Error(`Failed to fetch wards: ${error.message}`);
      }

      const wards = [...new Set(locations.map((loc: any) => loc.ward))];

      res.status(200).json({
        status: 'success',
        data: { wards }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getStreetsByWard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { region, district, ward } = req.params;

      if (!region || !district || !ward) {
        throw new AppError(400, 'Region, district, and ward are required');
      }

      const { data: locations, error } = await serviceRoleClient
        .from('locations')
        .select('street')
        .eq('region', region)
        .eq('district', district)
        .eq('ward', ward)
        .not('street', 'is', null)
        .order('street');

      if (error) {
        throw new Error(`Failed to fetch streets: ${error.message}`);
      }

      const streets = [...new Set(locations.map((loc: any) => loc.street))];

      res.status(200).json({
        status: 'success',
        data: { streets }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };

  getLocationHierarchy = async (req: Request, res: Response): Promise<void> => {
    try {
      const hierarchy = await searchService.getLocationHierarchy();

      res.status(200).json({
        status: 'success',
        data: { hierarchy }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(500, error.message);
      }
      throw error;
    }
  };
}
