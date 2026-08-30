import { supabase } from '../config';
import { ListingStatus, UserRole } from '../models';
import { ImageKitService, ImagePayload } from './imagekitService';

const imageKitService = new ImageKitService();

function normalizeImages(
  images?: ImagePayload[],
  imageUrls?: string[]
): ImagePayload[] {
  if (images && images.length > 0) {
    return images.filter((img) => img.url);
  }
  if (imageUrls && imageUrls.length > 0) {
    return imageUrls.map((url) => ({ url }));
  }
  return [];
}

export class ListingService {
  private async getListingImageFileIds(listingId: string): Promise<string[]> {
    const { data: rows } = await supabase
      .from('listing_images')
      .select('file_id')
      .eq('listing_id', listingId);

    return (rows || [])
      .map((row) => row.file_id)
      .filter((id): id is string => Boolean(id));
  }

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
    images?: ImagePayload[];
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
      images,
      imageUrls,
    } = data;

    const normalizedImages = normalizeImages(images, imageUrls);

    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      throw new Error('Provider not found');
    }

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
        status: ListingStatus.PENDING_REVIEW,
        admin_created: adminCreated,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (listingError || !listing) {
      throw new Error(`Failed to create listing: ${listingError?.message}`);
    }

    if (normalizedImages.length > 0) {
      const rows = normalizedImages.map((img, index) => ({
        id: crypto.randomUUID(),
        listing_id: listing.id,
        image_url: img.url,
        file_id: img.fileId || null,
        display_order: index + 1,
        created_at: new Date().toISOString(),
      }));

      const { error: imagesError } = await supabase.from('listing_images').insert(rows);

      if (imagesError) {
        throw new Error(`Listing created but failed to add images: ${imagesError.message}`);
      }
    }

    return listing;
  }

  async updateListing(
    listingId: string,
    userId: string,
    userRole: UserRole,
    data: {
      categoryId?: string;
      title?: string;
      description?: string;
      price?: number;
      unit?: string;
      locationId?: string;
      status?: ListingStatus;
      images?: ImagePayload[];
      imageUrls?: string[];
    }
  ) {
    const { categoryId, title, description, price, unit, locationId, status, images, imageUrls } = data;

    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      throw new Error('Listing not found');
    }

    if (userRole === UserRole.PROVIDER && existingListing.provider_id !== userId) {
      throw new Error('You can only edit your own listings');
    }

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
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (updateError || !listing) {
      throw new Error(`Failed to update listing: ${updateError?.message}`);
    }

    if (images !== undefined || imageUrls !== undefined) {
      const normalizedImages = normalizeImages(images, imageUrls);
      const oldFileIds = await this.getListingImageFileIds(listingId);

      await supabase.from('listing_images').delete().eq('listing_id', listingId);

      if (normalizedImages.length > 0) {
        const rows = normalizedImages.map((img, index) => ({
          id: crypto.randomUUID(),
          listing_id: listingId,
          image_url: img.url,
          file_id: img.fileId || null,
          display_order: index + 1,
          created_at: new Date().toISOString(),
        }));

        const { error: imagesError } = await supabase.from('listing_images').insert(rows);

        if (imagesError) {
          throw new Error(`Listing updated but failed to update images: ${imagesError.message}`);
        }
      }

      const newFileIds = new Set(normalizedImages.map((img) => img.fileId).filter(Boolean));
      const orphanedFileIds = oldFileIds.filter((id) => !newFileIds.has(id));
      await imageKitService.deleteFiles(orphanedFileIds);
    }

    return listing;
  }

  async deleteListing(listingId: string, userId: string, userRole: UserRole) {
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      throw new Error('Listing not found');
    }

    if (userRole === UserRole.PROVIDER && existingListing.provider_id !== userId) {
      throw new Error('You can only delete your own listings');
    }

    const fileIds = await this.getListingImageFileIds(listingId);

    await supabase.from('listing_images').delete().eq('listing_id', listingId);

    const { error: deleteError } = await supabase.from('listings').delete().eq('id', listingId);

    if (deleteError) {
      throw new Error(`Failed to delete listing: ${deleteError.message}`);
    }

    await imageKitService.deleteFiles(fileIds);

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
