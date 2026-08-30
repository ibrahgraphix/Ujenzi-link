import { supabase } from '../config';
import { Listing, ListingImage, ListingStatus, UserRole } from '../models';

export class ListingService {
  async getListingById(listingId: string) {
    const { data: listing, error } = await supabase
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
      .eq('id', listingId)
      .single();

    if (error || !listing) {
      throw new Error('Listing not found');
    }

    return listing;
  }

  async createListing(data: {
    providerId: string;
    categoryId: string;
    title: string;
    description: string;
    price: number;
    unit?: string;
    locationId: string;
    adminCreated?: boolean;
    imageUrls?: string[];
  }) {
    const {
      providerId,
      categoryId,
      title,
      description,
      price,
      unit,
      locationId,
      adminCreated = false,
      imageUrls = []
    } = data;

    // Verify provider exists
    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      throw new Error('Provider not found');
    }

    // Create listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        id: crypto.randomUUID(),
        provider_id: providerId,
        category_id: categoryId,
        title,
        description,
        price,
        unit,
        location_id: locationId,
        status: ListingStatus.ACTIVE,
        admin_created: adminCreated,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (listingError || !listing) {
      throw new Error(`Failed to create listing: ${listingError?.message}`);
    }

    // Add images if provided
    if (imageUrls.length > 0) {
      const images = imageUrls.map((url, index) => ({
        id: crypto.randomUUID(),
        listing_id: listing.id,
        image_url: url,
        display_order: index + 1,
        created_at: new Date().toISOString()
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(images);

      if (imagesError) {
        throw new Error(`Listing created but failed to add images: ${imagesError.message}`);
      }
    }

    return listing;
  }

  async updateListing(listingId: string, userId: string, userRole: UserRole, data: {
    categoryId?: string;
    title?: string;
    description?: string;
    price?: number;
    unit?: string;
    locationId?: string;
    status?: ListingStatus;
    imageUrls?: string[];
  }) {
    const {
      categoryId,
      title,
      description,
      price,
      unit,
      locationId,
      status,
      imageUrls
    } = data;

    // Get existing listing
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      throw new Error('Listing not found');
    }

    // Check permissions: providers can only edit their own listings, admins can edit any
    if (userRole === UserRole.PROVIDER && existingListing.provider_id !== userId) {
      throw new Error('You can only edit your own listings');
    }

    // Update listing
    const { data: listing, error: updateError } = await supabase
      .from('listings')
      .update({
        category_id: categoryId,
        title,
        description,
        price,
        unit,
        location_id: locationId,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId)
      .select()
      .single();

    if (updateError || !listing) {
      throw new Error(`Failed to update listing: ${updateError?.message}`);
    }

    // Update images if provided
    if (imageUrls !== undefined) {
      // Delete existing images
      await supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', listingId);

      // Add new images
      if (imageUrls.length > 0) {
        const images = imageUrls.map((url, index) => ({
          id: crypto.randomUUID(),
          listing_id: listingId,
          image_url: url,
          display_order: index + 1,
          created_at: new Date().toISOString()
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(images);

        if (imagesError) {
          throw new Error(`Listing updated but failed to update images: ${imagesError.message}`);
        }
      }
    }

    return listing;
  }

  async deleteListing(listingId: string, userId: string, userRole: UserRole) {
    // Get existing listing
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      throw new Error('Listing not found');
    }

    // Check permissions: providers can only delete their own listings, admins can delete any
    if (userRole === UserRole.PROVIDER && existingListing.provider_id !== userId) {
      throw new Error('You can only delete your own listings');
    }

    // Delete listing images first
    await supabase
      .from('listing_images')
      .delete()
      .eq('listing_id', listingId);

    // Delete listing
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (deleteError) {
      throw new Error(`Failed to delete listing: ${deleteError.message}`);
    }

    return { message: 'Listing deleted successfully' };
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

    return listings;
  }
}
