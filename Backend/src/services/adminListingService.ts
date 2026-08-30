import { supabase } from '../config';
import { ListingStatus } from '../models';

export class AdminListingService {
  async getAllListings(filters: {
    status?: ListingStatus;
    categoryId?: string;
    providerId?: string;
    adminCreated?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { status, categoryId, providerId, adminCreated, page = 1, limit = 20 } = filters;

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

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by category
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Filter by provider
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    // Filter by admin_created
    if (adminCreated !== undefined) {
      query = query.eq('admin_created', adminCreated);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: listings, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch listings: ${error.message}`);
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

  async getPendingListings() {
    const { data: listings, error } = await supabase
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
      `)
      .eq('status', ListingStatus.PENDING_REVIEW)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending listings: ${error.message}`);
    }

    return listings || [];
  }

  async approveListing(listingId: string, adminId: string) {
    return this.changeListingStatus(listingId, ListingStatus.ACTIVE, adminId);
  }

  async rejectListing(listingId: string, adminId: string) {
    return this.changeListingStatus(listingId, ListingStatus.INACTIVE, adminId);
  }

  async changeListingStatus(listingId: string, status: ListingStatus, adminId: string) {
    // Check if listing exists
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      throw new Error('Listing not found');
    }

    // Update listing status
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .select()
      .single();

    if (updateError || !updatedListing) {
      throw new Error(`Failed to update listing status: ${updateError?.message}`);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'change_listing_status', 'listings', listingId, `Changed status to ${status}`);

    return updatedListing;
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
