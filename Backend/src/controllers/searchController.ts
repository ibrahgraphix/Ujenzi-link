import { Request, Response } from 'express';
import { SearchService } from '../services/searchService';
import { AppError } from '../middleware';

const searchService = new SearchService();

export class SearchController {
  searchListings = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        keyword,
        categoryId,
        region,
        district,
        minPrice,
        maxPrice,
        page,
        limit
      } = req.query;

      const results = await searchService.searchListings({
        keyword: keyword as string,
        categoryId: categoryId as string,
        region: region as string,
        district: district as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20
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

      const wards = await searchService.getWardsByDistrict(region, district);

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

      const streets = await searchService.getStreetsByWard(region, district, ward);

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
