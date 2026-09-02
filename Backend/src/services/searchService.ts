import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

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

export class SearchService {
  async searchListings(params: {
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
    console.log('searchListings called with params:', params);
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
    } = params;

    // Build query
    let query = serviceRoleClient
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

    console.log('Search query results:', { listingsCount: listings?.length, count, error });

    if (error) {
      console.error('Search query error:', error);
      throw new Error(`Failed to search listings: ${error.message}`);
    }

    const result = {
      listings: listings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    console.log('Returning search results:', result);
    return result;
  }

  async getRegions() {
    const { data: locations, error } = await serviceRoleClient
      .from('locations')
      .select('region')
      .order('region');

    if (error) {
      throw new Error(`Failed to fetch regions: ${error.message}`);
    }

    const regions = [...new Set(locations.map((loc: any) => loc.region))];
    return regions;
  }

  async getDistrictsByRegion(region: string) {
    const { data: locations, error } = await serviceRoleClient
      .from('locations')
      .select('district')
      .eq('region', region)
      .order('district');

    if (error) {
      throw new Error(`Failed to fetch districts: ${error.message}`);
    }

    const districts = [...new Set(locations.map((loc: any) => loc.district))];
    return districts;
  }

  async getCountiesByRegion(region: string) {
    const { data: locations, error } = await serviceRoleClient
      .from('locations')
      .select('county')
      .eq('region', region)
      .not('county', 'is', null)
      .order('county');

    if (error) {
      throw new Error(`Failed to fetch counties: ${error.message}`);
    }

    const counties = [...new Set(locations.map((loc: any) => loc.county))];
    return counties;
  }

  async getWardsByCounty(region: string, county: string) {
    const { data: locations, error } = await serviceRoleClient
      .from('locations')
      .select('ward')
      .eq('region', region)
      .eq('county', county)
      .not('ward', 'is', null)
      .order('ward');

    if (error) {
      throw new Error(`Failed to fetch wards: ${error.message}`);
    }

    const wards = [...new Set(locations.map((loc: any) => loc.ward))];
    return wards;
  }

  async getStreetsByWard(region: string, county: string, ward: string) {
    const { data: locations, error } = await serviceRoleClient
      .from('locations')
      .select('street')
      .eq('region', region)
      .eq('county', county)
      .eq('ward', ward)
      .not('street', 'is', null)
      .order('street');

    if (error) {
      throw new Error(`Failed to fetch streets: ${error.message}`);
    }

    const streets = [...new Set(locations.map((loc: any) => loc.street))];
    return streets;
  }

  async getAllLocations() {
    const { data: locations, error } = await serviceRoleClient
      .from('locations')
      .select('*')
      .order('region');

    if (error) {
      throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    return locations || [];
  }

  async getLocationHierarchy() {
    const { data: locations, error } = await serviceRoleClient
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
