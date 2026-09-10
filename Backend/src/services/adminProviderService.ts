import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { ImageKitService } from './imagekitService';

// Create admin client for auth operations
const adminAuthClient = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

const imageKitService = new ImageKitService();

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
    let query = serviceRoleClient
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
    const { data: providers, error } = await serviceRoleClient
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
    const { data: provider, error: fetchError } = await serviceRoleClient
      .from('provider_profiles')
      .select('user_id, business_name')
      .eq('user_id', providerId)
      .single();

    if (fetchError || !provider) {
      throw new Error('Provider not found');
    }

    const { data: updated, error: updateError } = await serviceRoleClient
      .from('provider_profiles')
      .update({ is_verified: true, updated_at: new Date().toISOString() })
      .eq('user_id', providerId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to approve provider: ${updateError?.message}`);
    }

    await this.logAdminAction(adminId, 'approve_provider', 'provider_profiles', providerId, `Approved provider: ${provider.business_name}`);

    return updated;
  }

  async deactivateProvider(providerId: string, adminId: string) {
    const { data: provider, error: fetchError } = await serviceRoleClient
      .from('provider_profiles')
      .select('id, business_name, user_id')
      .eq('id', providerId)
      .single();

    if (fetchError || !provider) {
      throw new Error('Provider not found');
    }

    const { data: updated, error: updateError } = await serviceRoleClient
      .from('provider_profiles')
      .update({ is_verified: false, updated_at: new Date().toISOString() })
      .eq('id', providerId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to revoke provider verification: ${updateError?.message}`);
    }

    await this.logAdminAction(adminId, 'revoke_provider_verification', 'provider_profiles', providerId, `Revoked verification for provider: ${provider.business_name}`);

    return updated;
  }

  async deleteProvider(providerId: string, adminId: string) {
    console.log('=== DELETE PROVIDER DEBUG ===');
    console.log('Attempting to delete provider with ID:', providerId);
    console.log('Provider ID type:', typeof providerId);
    console.log('Provider ID length:', providerId.length);

    // Let's see ALL providers in the database to understand the structure
    const { data: allProviders, error: allProvidersError } = await serviceRoleClient
      .from('provider_profiles')
      .select('user_id, business_name')
      .limit(20);

    console.log('ALL providers in database:', allProviders);
    console.log('Number of providers:', allProviders?.length);
    console.log('All providers error:', allProvidersError);

    // The provider_profiles table uses user_id as the primary key, not id
    const { data: provider, error: fetchError } = await serviceRoleClient
      .from('provider_profiles')
      .select('user_id, business_name, logo_file_id')
      .eq('user_id', providerId)
      .single();

    console.log('Search by user_id result:', provider, 'Error:', fetchError);

    if (fetchError || !provider) {
      console.error('=== PROVIDER NOT FOUND ===');
      console.error('Searched ID:', providerId);
      console.error('Error:', fetchError);
      console.error('Available provider user_ids:', allProviders?.map(p => ({ user_id: p.user_id, name: p.business_name })));
      throw new Error('Provider not found');
    }

    console.log('Found provider:', provider);

    // Fetch all listings for this provider to delete their images
    const { data: listings, error: listingsError } = await serviceRoleClient
      .from('listings')
      .select('id, listing_images (file_id)')
      .eq('provider_id', provider.user_id);

    if (!listingsError && listings) {
      console.log('Found listings to delete:', listings.length);

      // Collect all image file IDs from listings
      const imageFileIds: string[] = [];
      listings.forEach((listing: any) => {
        if (listing.listing_images && Array.isArray(listing.listing_images)) {
          listing.listing_images.forEach((img: any) => {
            if (img.file_id) {
              imageFileIds.push(img.file_id);
            }
          });
        }
      });

      // Delete images from ImageKit
      if (imageFileIds.length > 0) {
        console.log('Deleting images from ImageKit:', imageFileIds);
        await imageKitService.deleteFiles(imageFileIds);
      }

      // Delete listing images from database
      const listingIds = listings.map((l: any) => l.id);
      if (listingIds.length > 0) {
        await serviceRoleClient
          .from('listing_images')
          .delete()
          .in('listing_id', listingIds);
      }

      // Delete listings from database
      await serviceRoleClient
        .from('listings')
        .delete()
        .eq('provider_id', provider.user_id);
    }

    // Delete provider logo from ImageKit if it exists
    if (provider.logo_file_id) {
      console.log('Deleting provider logo from ImageKit:', provider.logo_file_id);
      await imageKitService.deleteFile(provider.logo_file_id);
    }

    // Delete provider profile from database
    const { error: deleteProfileError } = await serviceRoleClient
      .from('provider_profiles')
      .delete()
      .eq('user_id', provider.user_id);

    if (deleteProfileError) {
      throw new Error(`Failed to delete provider profile: ${deleteProfileError.message}`);
    }

    // Delete user account from database
    if (provider.user_id) {
      console.log('Deleting user from database:', provider.user_id);
      await serviceRoleClient
        .from('users')
        .delete()
        .eq('id', provider.user_id);

      // Delete user from Supabase auth
      try {
        console.log('Deleting user from Supabase auth:', provider.user_id);
        const { error: authDeleteError } = await adminAuthClient.auth.admin.deleteUser(
          provider.user_id
        );

        if (authDeleteError) {
          console.error('Failed to delete user from auth:', authDeleteError);
          // Don't throw error here, as the database deletion was successful
        } else {
          console.log('Successfully deleted user from Supabase auth');
        }
      } catch (authError) {
        console.error('Error deleting user from auth:', authError);
        // Don't throw error here, as the database deletion was successful
      }
    }

    await this.logAdminAction(adminId, 'delete_provider', 'provider_profiles', provider.user_id, `Deleted provider entirely: ${provider.business_name}`);

    return { success: true, message: 'Provider deleted successfully' };
  }

  async getProviderById(providerId: string) {
    const { data: provider, error } = await serviceRoleClient
      .from('provider_profiles')
      .select(`
        *,
        users (*),
        locations (*)
      `)
      .eq('user_id', providerId)
      .single();

    if (error || !provider) {
      throw new Error('Provider not found');
    }

    return provider;
  }

  async getProviderListings(providerId: string) {
    const { data: listings, error } = await serviceRoleClient
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
    const { error } = await serviceRoleClient
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
