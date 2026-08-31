import { supabase } from '../config';

export class SearchService {
  async searchListings(filters: {
    keyword?: string;
    categoryId?: string;
    region?: string;
    county?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    status?: string;
    includeAll?: boolean;
  }) {
    const {
      keyword,
      categoryId,
      region,
      county,
      district,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      status,
      includeAll = false
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

    // Filter by location hierarchy
    if (district) {
      query = query.eq('locations.district', district);
    } else if (county) {
      query = query.eq('locations.county', county);
    } else if (region) {
      query = query.eq('locations.region', region);
    }

    // Filter by price range
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice);
    }

    // Only show active listings by default (public endpoint)
    // Admin can request all statuses or specific status
    if (!includeAll) {
      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.eq('status', 'active');
      }
    }

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

    const regions = [...new Set(locations.map(loc => loc.region).filter(Boolean))];
    return regions;
  }

  async getCountiesByRegion(region: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('county')
      .eq('region', region)
      .order('county');

    if (error) {
      throw new Error(`Failed to fetch counties: ${error.message}`);
    }

    const counties = [...new Set(locations.map(loc => loc.county).filter(Boolean))];
    return counties;
  }

  async getDistrictsByCounty(region: string, county: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('district')
      .eq('region', region)
      .eq('county', county)
      .order('district');

    if (error) {
      throw new Error(`Failed to fetch districts by county: ${error.message}`);
    }

    const districts = [...new Set(locations.map(loc => loc.district).filter(Boolean))];
    return districts;
  }

  /** Legacy: districts by region only (no county). Used as fallback. */
  async getDistrictsByRegion(region: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('district')
      .eq('region', region)
      .order('district');

    if (error) {
      throw new Error(`Failed to fetch districts: ${error.message}`);
    }

    const districts = [...new Set(locations.map(loc => loc.district).filter(Boolean))];
    return districts;
  }

  async getWardsByDistrict(region: string, county: string, district: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('ward')
      .eq('region', region)
      .eq('county', county)
      .eq('district', district)
      .order('ward');

    if (error) {
      throw new Error(`Failed to fetch wards: ${error.message}`);
    }

    const wards = [...new Set(locations.map(loc => loc.ward).filter(Boolean))];
    return wards;
  }

  async getStreetsByWard(region: string, county: string, district: string, ward: string) {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('street')
      .eq('region', region)
      .eq('county', county)
      .eq('district', district)
      .eq('ward', ward)
      .order('street');

    if (error) {
      throw new Error(`Failed to fetch streets: ${error.message}`);
    }

    const streets = [...new Set(locations.map(loc => loc.street).filter(Boolean))];
    return streets;
  }

  async getLocationHierarchy() {
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .order('region, county, district, ward, street');

    if (error) {
      throw new Error(`Failed to fetch location hierarchy: ${error.message}`);
    }

    // Build hierarchy: region > county > district > ward > street[]
    const hierarchy: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {};

    locations.forEach(loc => {
      if (!loc.region) return;

      if (!hierarchy[loc.region]) {
        hierarchy[loc.region] = {};
      }

      const countyKey = loc.county || '__no_county__';
      if (!hierarchy[loc.region][countyKey]) {
        hierarchy[loc.region][countyKey] = {};
      }

      if (loc.district) {
        if (!hierarchy[loc.region][countyKey][loc.district]) {
          hierarchy[loc.region][countyKey][loc.district] = {};
        }

        if (loc.ward) {
          if (!hierarchy[loc.region][countyKey][loc.district][loc.ward]) {
            hierarchy[loc.region][countyKey][loc.district][loc.ward] = [];
          }

          if (loc.street) {
            hierarchy[loc.region][countyKey][loc.district][loc.ward].push(loc.street);
          }
        }
      }
    });

    return hierarchy;
  }
}
