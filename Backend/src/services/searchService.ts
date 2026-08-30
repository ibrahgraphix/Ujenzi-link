import { supabase } from '../config';

export class SearchService {
  async searchListings(filters: {
    keyword?: string;
    categoryId?: string;
    region?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      keyword,
      categoryId,
      region,
      district,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = filters;

    // Build query
    let query = supabase
      .from('listings')
      .select(`
        *,
        categories (*),
        locations (*),
        provider_profiles (
          *,
          users (*)
        ),
        listing_images (*)
      `, { count: 'exact' });

    // Filter by keyword (title or description)
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    // Filter by category
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Filter by location (region/district)
    if (region || district) {
      // Join with locations table to filter
      if (district) {
        query = query.eq('locations.district', district);
      } else if (region) {
        query = query.eq('locations.region', region);
      }
    }

    // Filter by price range
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    // Only show active listings
    query = query.eq('status', 'active');

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: listings, error, count } = await query;

    if (error) {
      throw new Error(`Failed to search listings: ${error.message}`);
    }

    return {
      listings: listings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getRegions() {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('region')
      .order('region');

    if (error) {
      throw new Error(`Failed to fetch regions: ${error.message}`);
    }

    // Get unique regions
    const regions = [...new Set(locations.map(loc => loc.region).filter(Boolean))];

    return regions;
  }

  async getDistrictsByRegion(region: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('district')
      .eq('region', region)
      .order('district');

    if (error) {
      throw new Error(`Failed to fetch districts: ${error.message}`);
    }

    // Get unique districts
    const districts = [...new Set(locations.map(loc => loc.district).filter(Boolean))];

    return districts;
  }

  async getWardsByDistrict(region: string, district: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('ward')
      .eq('region', region)
      .eq('district', district)
      .order('ward');

    if (error) {
      throw new Error(`Failed to fetch wards: ${error.message}`);
    }

    // Get unique wards
    const wards = [...new Set(locations.map(loc => loc.ward).filter(Boolean))];

    return wards;
  }

  async getStreetsByWard(region: string, district: string, ward: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('street')
      .eq('region', region)
      .eq('district', district)
      .eq('ward', ward)
      .order('street');

    if (error) {
      throw new Error(`Failed to fetch streets: ${error.message}`);
    }

    // Get unique streets
    const streets = [...new Set(locations.map(loc => loc.street).filter(Boolean))];

    return streets;
  }

  async getLocationHierarchy() {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .order('region, district, ward, street');

    if (error) {
      throw new Error(`Failed to fetch location hierarchy: ${error.message}`);
    }

    // Build hierarchy structure
    const hierarchy: Record<string, Record<string, Record<string, string[]>>> = {};

    locations.forEach(loc => {
      if (!loc.region) return;

      if (!hierarchy[loc.region]) {
        hierarchy[loc.region] = {};
      }

      if (loc.district) {
        if (!hierarchy[loc.region][loc.district]) {
          hierarchy[loc.region][loc.district] = {};
        }

        if (loc.ward) {
          if (!hierarchy[loc.region][loc.district][loc.ward]) {
            hierarchy[loc.region][loc.district][loc.ward] = [];
          }

          if (loc.street) {
            hierarchy[loc.region][loc.district][loc.ward].push(loc.street);
          }
        }
      }
    });

    return hierarchy;
  }
}
