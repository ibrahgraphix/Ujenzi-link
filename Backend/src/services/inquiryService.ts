import { supabase } from '../config';
import { Inquiry, InquiryStatus, UserRole } from '../models';

export class InquiryService {
  async createInquiry(data: {
    buyerId: string;
    providerId: string;
    listingId: string | null;
    message: string;
  }) {
    const { buyerId, providerId, listingId, message } = data;
    console.log('Creating inquiry with data:', { buyerId, providerId, listingId, message });

    // If listingId is provided, verify listing exists and belongs to the provider
    if (listingId) {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, provider_id, status')
        .eq('id', listingId)
        .single();

      console.log('Listing check:', { listing, listingError });

      if (listingError || !listing) {
        throw new Error('Listing not found');
      }

      if (listing.provider_id !== providerId) {
        throw new Error('Listing does not belong to the specified provider');
      }

      if (listing.status !== 'active') {
        throw new Error('Cannot inquire on inactive listings');
      }
    }

    // Create inquiry - don't require buyer_profiles in initial insert
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        id: crypto.randomUUID(),
        buyer_id: buyerId,
        provider_id: providerId,
        listing_id: listingId,
        message,
        status: InquiryStatus.NEW,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        listings (*),
        provider_profiles (
          *,
          users (*)
        )
      `)
      .single();

    console.log('Inquiry creation result:', { inquiry, error });

    if (error || !inquiry) {
      throw new Error(`Failed to create inquiry: ${error?.message}`);
    }

    return inquiry;
  }

  async createGuestInquiry(data: {
    buyerId: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string | null;
    providerId: string;
    listingId: string | null;
    listingTitle: string | null;
    listingImage: string | null;
    message: string;
    quantity: string | null;
  }) {
    const { buyerId, buyerName, buyerPhone, buyerEmail, providerId, listingId, listingTitle, listingImage, message, quantity } = data;
    console.log('Creating guest inquiry with data:', { buyerId, buyerName, buyerPhone, providerId, listingId });

    // If listingId is provided, verify listing exists and belongs to the provider
    if (listingId) {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, provider_id, status')
        .eq('id', listingId)
        .single();

      console.log('Listing check:', { listing, listingError });

      if (listingError || !listing) {
        throw new Error('Listing not found');
      }

      if (listing.provider_id !== providerId) {
        throw new Error('Listing does not belong to the specified provider');
      }

      if (listing.status !== 'active') {
        throw new Error('Cannot inquire on inactive listings');
      }
    }

    // Create guest inquiry with buyer details in the message or in custom fields
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        id: crypto.randomUUID(),
        buyer_id: buyerId,
        provider_id: providerId,
        listing_id: listingId,
        message: `${message}\n\n--- Guest Buyer Details ---\nName: ${buyerName}\nPhone: ${buyerPhone}\nEmail: ${buyerEmail || 'Not provided'}\nQuantity: ${quantity || 'Not specified'}`,
        status: InquiryStatus.NEW,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        listings (*),
        provider_profiles (
          *,
          users (*)
        )
      `)
      .single();

    console.log('Guest inquiry creation result:', { inquiry, error });

    if (error || !inquiry) {
      throw new Error(`Failed to create guest inquiry: ${error?.message}`);
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
        provider_profiles (
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

    if (!inquiries || inquiries.length === 0) {
      return [];
    }

    // Enrich inquiries with buyer user & profile info
    const buyerIds = [...new Set(inquiries.map(i => i.buyer_id))];
    const { data: buyers } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role')
      .in('id', buyerIds);

    const { data: buyerProfiles } = await supabase
      .from('buyer_profiles')
      .select('user_id, buyer_type, institution_name, project_name, project_description')
      .in('user_id', buyerIds);

    const buyerMap = new Map(buyers?.map(b => [b.id, b]) || []);
    const profileMap = new Map(buyerProfiles?.map(bp => [bp.user_id, bp]) || []);

    return inquiries.map(inq => {
      const user = buyerMap.get(inq.buyer_id);
      const profile = profileMap.get(inq.buyer_id);
      return {
        ...inq,
        buyer_profiles: {
          ...profile,
          users: user
        }
      };
    });
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
        )
      `)
      .eq('id', inquiryId)
      .single();

    if (error || !inquiry) {
      throw new Error('Inquiry not found');
    }

    const { data: buyerUser } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role')
      .eq('id', inquiry.buyer_id)
      .single();

    const { data: buyerProfile } = await supabase
      .from('buyer_profiles')
      .select('user_id, buyer_type, institution_name, project_name, project_description')
      .eq('user_id', inquiry.buyer_id)
      .maybeSingle();

    return {
      ...inquiry,
      buyer_profiles: {
        ...buyerProfile,
        users: buyerUser
      }
    };
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

    // Update inquiry status without updated_at column
    const { data: inquiry, error: updateError } = await supabase
      .from('inquiries')
      .update({
        status
      })
      .eq('id', inquiryId)
      .select(`
        *,
        listings (*),
        provider_profiles (
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
