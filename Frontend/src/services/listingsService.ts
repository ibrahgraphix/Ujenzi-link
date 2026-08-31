import { Listing, ProviderType } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_listings_v1';

export interface ListingFilterParams {
  query?: string;
  category?: string;
  region?: string;
  county?: string;
  district?: string;
  ward?: string;
  providerType?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
  providerId?: string;
}

export function mapBackendListing(item: any): Listing {
  const imageItems = Array.isArray(item.listing_images)
    ? item.listing_images
        .map((img: any) => ({
          url: img.image_url || img.url,
          fileId: img.file_id || img.fileId,
        }))
        .filter((img: { url?: string }) => Boolean(img.url))
    : [];

  const images = imageItems.length > 0
    ? imageItems.map((img: { url: string }) => img.url)
    : Array.isArray(item.images)
      ? item.images
      : ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'];

  const categoryName = item.categories?.name || item.category || 'Building Materials';

  const providerProfile = item.provider_profiles || item.provider || {};
  const providerUser = providerProfile.users || {};

  return {
    id: item.id || `list-${Date.now()}`,
    title: item.title || 'Untitled Material/Service',
    category: categoryName,
    price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
    currency: item.currency || 'TZS',
    unit: item.price_unit || item.unit || 'Unit',
    description: item.description || '',
    images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'],
    imageItems: imageItems.length > 0 ? imageItems : undefined,
    location: item.locations
      ? {
          country: item.locations.country || 'Tanzania',
          region: item.locations.region || '',
          county: item.locations.county || '',
          district: item.locations.district || '',
          ward: item.locations.ward || '',
          street: item.locations.street || '',
        }
      : item.location || {
          country: 'Tanzania',
          region: item.region || 'Dar es Salaam',
          district: item.district || 'Kinondoni',
        },
    providerId: item.provider_id || item.providerId || providerProfile.id || 'prov-demo',
    providerName: providerProfile.business_name || providerUser.name || item.providerName || 'Local Supplier',
    providerType: (providerProfile.provider_type as ProviderType) || item.providerType || 'Retailer/Supplier',
    isVerified: providerProfile.is_verified ?? item.isVerified ?? false,
    rating: item.rating ?? 5.0,
    reviewsCount: item.reviewsCount ?? 0,
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    status: item.status || 'active',
    isFeatured: item.isFeatured ?? item.created_by_admin ?? item.admin_created ?? false,
    tags: item.tags || [],
    minOrderQuantity: item.minOrderQuantity || '1 Unit',
    deliveryAvailable: item.deliveryAvailable ?? true,
    specifications: item.specifications || {},
  };
}

function filterAndSortListingsLocally(allListings: Listing[], params?: ListingFilterParams): Listing[] {
  let result = [...allListings];
  if (!params) return result;

  if (params.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.providerName.toLowerCase().includes(q) ||
        l.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (params.category && params.category !== 'all') {
    result = result.filter((l) => l.category.toLowerCase() === params.category!.toLowerCase());
  }

  if (params.region && params.region !== 'all') {
    result = result.filter((l) => l.location.region.toLowerCase() === params.region!.toLowerCase());
  }

  if (params.district && params.district !== 'all') {
    result = result.filter(
      (l) => l.location.district && l.location.district.toLowerCase() === params.district!.toLowerCase()
    );
  }

  if (params.providerType && params.providerType !== 'all') {
    result = result.filter((l) => l.providerType === params.providerType);
  }

  if (params.providerId) {
    result = result.filter((l) => l.providerId === params.providerId);
  }

  if (params.minPrice !== undefined && params.minPrice > 0) {
    result = result.filter((l) => l.price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    result = result.filter((l) => l.price <= params.maxPrice!);
  }

  if (params.verifiedOnly) {
    result = result.filter((l) => l.isVerified);
  }

  switch (params.sortBy) {
    case 'price_low':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_high':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
      result.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return result;
}

export async function getProviderListings(providerId: string): Promise<Listing[]> {
  try {
    const res = await apiClient.get<{ listings: any[] }>(`/api/listings/provider/${providerId}`);
    const items = res?.listings || [];
    return items.map(mapBackendListing);
  } catch (err) {
    console.warn(`Failed to fetch provider listings for ${providerId}:`, err);
    return [];
  }
}

export async function getListings(params?: ListingFilterParams): Promise<Listing[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.set('keyword', params.query);
    if (params?.category && params.category !== 'all') queryParams.set('categoryId', params.category);
    if (params?.region && params.region !== 'all') queryParams.set('region', params.region);
    if (params?.district && params.district !== 'all') queryParams.set('district', params.district);
    if (params?.minPrice) queryParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params?.verifiedOnly) queryParams.set('verifiedOnly', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/search/listings?${queryString}` : '/api/search/listings';
    const res = await apiClient.get<any>(endpoint);

    const items = Array.isArray(res) ? res : res?.listings || res?.data || [];
    if (Array.isArray(items)) {
      const mapped = items.map(mapBackendListing);
      return filterAndSortListingsLocally(mapped, params);
    }
  } catch (err) {
    console.error('Failed to fetch listings from API:', err);
  }

  return [];
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const res = await apiClient.get<any>(`/api/listings/${id}`);
    if (res) {
      return mapBackendListing(res.listing || res);
    }
  } catch (err) {
    console.warn(`Failed to fetch listing ${id} from API:`, err);
  }

  const all = await getListings();
  return all.find((l) => l.id === id) || null;
}

export async function saveListing(
  listingData: Partial<Listing> & {
    id?: string;
    imageItems?: { url: string; fileId?: string }[];
  }
): Promise<Listing> {
  try {
    const images =
      listingData.imageItems ||
      listingData.images?.map((url) => ({ url })) ||
      [];

    const payload = {
      title: listingData.title,
      description: listingData.description?.trim() || listingData.title || 'No description provided',
      price: listingData.price,
      unit: listingData.unit,
      categoryId: listingData.categoryId || listingData.category,
      providerId: listingData.providerId,
      location: listingData.location,
      images,
      imageUrls: images.map((img) => img.url),
    };

    if (!payload.location?.region || !payload.location?.district) {
      throw new Error('Please select both a region and district for your listing.');
    }

    console.log('Saving listing to API:', payload);

    let res: any;
    if (listingData.id && !listingData.id.startsWith('list-demo-')) {
      res = await apiClient.put(`/api/listings/${listingData.id}`, payload);
    } else {
      res = await apiClient.post('/api/listings', payload);
    }

    console.log('API response:', res);

    if (res) return mapBackendListing(res.listing || res);
  } catch (err) {
    console.error('Failed to save listing via API:', err);
    throw err; // Re-throw to prevent silent fallback
  }

  const all = await getListings();
  if (listingData.id) {
    const idx = all.findIndex((l) => l.id === listingData.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...listingData } as Listing;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      return all[idx];
    }
  }

  const newListing: Listing = {
    id: listingData.id || `list-${Date.now()}`,
    title: listingData.title || 'Untitled Material/Service',
    category: listingData.category || 'General',
    price: Number(listingData.price) || 0,
    currency: listingData.currency || 'TZS',
    unit: listingData.unit || 'Unit',
    description: listingData.description || '',
    images: listingData.images && listingData.images.length > 0
      ? listingData.images
      : ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'],
    location: listingData.location || {
      country: 'Tanzania',
      region: 'Dar es Salaam',
      district: 'Kinondoni',
    },
    providerId: listingData.providerId || 'prov-user',
    providerName: listingData.providerName || 'Local Supplier',
    providerType: listingData.providerType || 'Retailer/Supplier',
    isVerified: listingData.isVerified || false,
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
    status: listingData.status || 'active',
    isFeatured: listingData.isFeatured || false,
    tags: listingData.tags || [],
    minOrderQuantity: listingData.minOrderQuantity || '1 Unit',
    deliveryAvailable: listingData.deliveryAvailable ?? true,
    specifications: listingData.specifications || {},
  };

  all.unshift(newListing);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newListing;
}

export async function createListing(
  listingData: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviewsCount' | 'status'> & { id?: string }
): Promise<Listing> {
  return saveListing(listingData);
}

export async function updateListing(id: string, listingData: Partial<Listing>): Promise<Listing> {
  return saveListing({ ...listingData, id });
}

export async function deleteListing(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/api/listings/${id}`);
    return true;
  } catch (err) {
    console.warn(`Failed to delete listing ${id} via API:`, err);
  }

  const all = await getListings();
  const filtered = all.filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
