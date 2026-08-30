import { supabase } from '../config';
import { Inquiry, InquiryStatus, UserRole } from '../models';

export class InquiryService {
  async createInquiry(data: {
    buyerId: string;
    providerId: string;
    listingId: string;
    message: string;
  }) {
    const { buyerId, providerId, listingId, message } = data;

    // Verify listing exists and belongs to the provider
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, provider_id, status')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new Error('Listing not found');
    }

    if (listing.provider_id !== providerId) {
      throw new Error('Listing does not belong to the specified provider');
    }

    if (listing.status !== 'active') {
      throw new Error('Cannot inquire on inactive listings');
    }

    // Create inquiry
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        id: crypto.randomUUID(),
        buyer_id: buyerId,
        provider_id: providerId,
        listing_id: listingId,
        message,
        status: InquiryStatus.NEW,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        listings (*),
        provider_profiles (
          *,
          users (*)
        ),
        buyer_profiles (
          *,
          users (*)
        )
      `)
      .single();

    if (error || !inquiry) {
      throw new Error(`Failed to create inquiry: ${error?.message}`);
    }

    return inquiry;
  }

  async getProviderInquiries(providerId: string, filters?: {
    status?: InquiryStatus;
    listingId?: string;
  }) {
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        listings (*),
        buyer_profiles (
          *,
          users (*)
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.listingId) {
      query = query.eq('listing_id', filters.listingId);
    }

    const { data: inquiries, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch inquiries: ${error.message}`);
    }

    return inquiries || [];
  }

  async getBuyerInquiries(buyerId: string) {
    const { data: inquiries, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        listings (*),
        provider_profiles (
          *,
          users (*)
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch buyer inquiries: ${error.message}`);
    }

    return inquiries || [];
  }

  async getInquiryById(inquiryId: string) {
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select(`
        *,
        listings (*),
        provider_profiles (
          *,
          users (*)
        ),
        buyer_profiles (
          *,
          users (*)
        )
      `)
      .eq('id', inquiryId)
      .single();

    if (error || !inquiry) {
      throw new Error('Inquiry not found');
    }

    return inquiry;
  }

  async updateInquiryStatus(inquiryId: string, providerId: string, status: InquiryStatus) {
    // Verify inquiry exists and belongs to the provider
    const { data: existingInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();

    if (fetchError || !existingInquiry) {
      throw new Error('Inquiry not found');
    }

    if (existingInquiry.provider_id !== providerId) {
      throw new Error('You can only update inquiries for your listings');
    }

    // Update inquiry status
    const { data: inquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .select(`
        *,
        listings (*),
        buyer_profiles (
          *,
          users (*)
        )
      `)
      .single();

    if (updateError || !inquiry) {
      throw new Error(`Failed to update inquiry: ${updateError?.message}`);
    }

    return inquiry;
  }

  async deleteInquiry(inquiryId: string, userId: string, userRole: UserRole) {
    // Get existing inquiry
    const { data: existingInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();

    if (fetchError || !existingInquiry) {
      throw new Error('Inquiry not found');
    }

    // Check permissions: buyers can delete their own inquiries, providers can delete inquiries for their listings, admins can delete any
    if (userRole === UserRole.BUYER && existingInquiry.buyer_id !== userId) {
      throw new Error('You can only delete your own inquiries');
    }

    if (userRole === UserRole.PROVIDER && existingInquiry.provider_id !== userId) {
      throw new Error('You can only delete inquiries for your listings');
    }

    // Delete inquiry
    const { error: deleteError } = await supabase
      .from('inquiries')
      .delete()
      .eq('id', inquiryId);

    if (deleteError) {
      throw new Error(`Failed to delete inquiry: ${deleteError.message}`);
    }

    return { message: 'Inquiry deleted successfully' };
  }
}
