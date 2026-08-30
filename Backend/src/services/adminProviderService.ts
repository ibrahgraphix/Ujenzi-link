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

  async getPendingProviders() {
    const { data: providers, error } = await supabase
      .from('provider_profiles')
      .select(`
        *,
        users (*),
        locations (*)
      `)
      .eq('is_verified', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending providers: ${error.message}`);
    }

    // Exclude deactivated user accounts from pending queue
    return (providers || []).filter((p: any) => p.users?.is_active !== false);
  }

  async approveProvider(providerId: string, adminId: string) {
    const { data: provider, error: fetchError } = await supabase
      .from('provider_profiles')
      .select('id, business_name')
      .eq('id', providerId)
      .single();

    if (fetchError || !provider) {
      throw new Error('Provider not found');
    }

    const { data: updated, error: updateError } = await supabase
      .from('provider_profiles')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('id', providerId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to approve provider: ${updateError?.message}`);
    }

    await this.logAdminAction(adminId, 'approve_provider', 'provider_profiles', providerId, `Approved provider: ${provider.business_name}`);

    return updated;
  }

  async deactivateProvider(providerId: string, adminId: string) {
    const { data: provider, error: fetchError } = await supabase
      .from('provider_profiles')
      .select('id, business_name, user_id')
      .eq('id', providerId)
      .single();

    if (fetchError || !provider) {
      throw new Error('Provider not found');
    }

    const { data: updated, error: updateError } = await supabase
      .from('provider_profiles')
      .update({ is_verified: false, updated_at: new Date().toISOString() })
      .eq('id', providerId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to deactivate provider: ${updateError?.message}`);
    }

    // Deactivate the linked user account
    if (provider.user_id) {
      await supabase
        .from('users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', provider.user_id);
    }

    await this.logAdminAction(adminId, 'deactivate_provider', 'provider_profiles', providerId, `Deactivated/rejected provider: ${provider.business_name}`);

    return updated;
  }

  async getProviderById(providerId: string) {
    const { data: provider, error } = await supabase
      .from('provider_profiles')
      .select(`
        *,
        users (*),
        locations (*)
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
        pendingListings: listings.filter((l: any) => l.status === 'pending_review').length,
        inactiveListings: listings.filter((l: any) => l.status === 'inactive').length
      }
    };
  }

  private async logAdminAction(adminId: string, action: string, targetTable: string, targetId: string, details?: string) {
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        id: crypto.randomUUID(),
        admin_id: adminId,
        action,
        target_table: targetTable,
        target_id: targetId,
        details,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Failed to log admin action: ${error.message}`);
    }
  }
}
