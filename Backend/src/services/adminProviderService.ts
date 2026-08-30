import { supabase } from '../config';

export class AdminProviderService {
  async getAllProviders(filters: {
    providerType?: string;
    search?: string;
    isVerified?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { providerType, search, isVerified, page = 1, limit = 20 } = filters;

    // Build query with listing counts
    let query = supabase
      .from('provider_profiles')
      .select(`
        *,
        users (*),
        locations (*),
        listings(count)
      `, { count: 'exact' });

    // Filter by provider type
    if (providerType) {
      query = query.eq('provider_type', providerType);
    }

    // Filter by verification status
    if (isVerified !== undefined) {
      query = query.eq('is_verified', isVerified);
    }

    // Search by business name or user name/email
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,users.name.ilike.%${search}%,users.email.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: providers, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }

    return {
      providers: providers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getProviderById(providerId: string) {
    const { data: provider, error } = await supabase
      .from('provider_profiles')
      .select(`
        *,
        users (*),
        locations (*),
        buyer_profiles (
          *,
          users (*)
        )
      `)
      .eq('id', providerId)
      .single();

    if (error || !provider) {
      throw new Error('Provider not found');
    }

    return provider;
  }

  async getProviderListings(providerId: string) {
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        categories (*),
        locations (*),
        listing_images (*)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch provider listings: ${error.message}`);
    }

    return listings || [];
  }

  async getProviderFullProfile(providerId: string) {
    const provider = await this.getProviderById(providerId);
    const listings = await this.getProviderListings(providerId);

    return {
      provider,
      listings,
      stats: {
        totalListings: listings.length,
        activeListings: listings.filter((l: any) => l.status === 'active').length,
        inactiveListings: listings.filter((l: any) => l.status === 'inactive').length
      }
    };
  }
}
