import {
  Listing,
  Provider,
  Category,
  Inquiry,
  Advert,
  User,
  Review,
  TrafficStats,
  LocationHierarchy,
} from '../types';
import {
  MOCK_LISTINGS,
  MOCK_PROVIDERS,
  MOCK_CATEGORIES,
  MOCK_ADVERTS,
  MOCK_USERS,
  MOCK_INQUIRIES,
  MOCK_REVIEWS,
  MOCK_TRAFFIC_STATS,
} from '../data/mockData';

const STORAGE_KEYS = {
  LISTINGS: 'ujenzi_listings_v1',
  PROVIDERS: 'ujenzi_providers_v1',
  CATEGORIES: 'ujenzi_categories_v1',
  ADVERTS: 'ujenzi_adverts_v1',
  USERS: 'ujenzi_users_v1',
  INQUIRIES: 'ujenzi_inquiries_v1',
  REVIEWS: 'ujenzi_reviews_v1',
  FAVORITES: 'ujenzi_favorites_v1',
};

function getFromStorage<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save data to ${key}`, err);
  }
}

export interface ListingFilterParams {
  query?: string;
  category?: string;
  region?: string;
  district?: string;
  ward?: string;
  providerType?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
  providerId?: string;
}

export const api = {
  // --- Listings ---
  async getListings(params?: ListingFilterParams): Promise<Listing[]> {
    const allListings = getFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, MOCK_LISTINGS);
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

    if (params.ward && params.ward !== 'all') {
      result = result.filter(
        (l) => l.location.ward && l.location.ward.toLowerCase() === params.ward!.toLowerCase()
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

    // Sorting
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
  },

  async getListingById(id: string): Promise<Listing | null> {
    const listings = getFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, MOCK_LISTINGS);
    return listings.find((l) => l.id === id) || null;
  },

  async saveListing(listingData: Partial<Listing> & { id?: string }): Promise<Listing> {
    const listings = getFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, MOCK_LISTINGS);
    if (listingData.id) {
      const idx = listings.findIndex((l) => l.id === listingData.id);
      if (idx !== -1) {
        listings[idx] = { ...listings[idx], ...listingData } as Listing;
        saveToStorage(STORAGE_KEYS.LISTINGS, listings);
        return listings[idx];
      }
    }

    const newListing: Listing = {
      id: `list-${Date.now()}`,
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
      reviewsCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      status: listingData.status || 'active',
      isFeatured: listingData.isFeatured || false,
      tags: listingData.tags || [],
      minOrderQuantity: listingData.minOrderQuantity || '1 Unit',
      deliveryAvailable: listingData.deliveryAvailable ?? true,
      specifications: listingData.specifications || {},
    };

    listings.unshift(newListing);
    saveToStorage(STORAGE_KEYS.LISTINGS, listings);
    return newListing;
  },

  async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviewsCount' | 'status'> & { id?: string }): Promise<Listing> {
    return this.saveListing(listingData);
  },

  async updateListing(id: string, listingData: Partial<Listing>): Promise<Listing> {
    return this.saveListing({ ...listingData, id });
  },

  async deleteListing(id: string): Promise<boolean> {
    const listings = getFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, MOCK_LISTINGS);
    const filtered = listings.filter((l) => l.id !== id);
    saveToStorage(STORAGE_KEYS.LISTINGS, filtered);
    return true;
  },

  // --- Providers ---
  async getProviders(type?: string): Promise<Provider[]> {
    const providers = getFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
    if (type && type !== 'all') {
      return providers.filter((p) => p.providerType === type);
    }
    return providers;
  },

  async getProviderById(id: string): Promise<Provider | null> {
    const providers = getFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
    return providers.find((p) => p.id === id) || null;
  },

  async saveProvider(providerData: Partial<Provider> & { id?: string }): Promise<Provider> {
    const providers = getFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
    if (providerData.id) {
      const idx = providers.findIndex((p) => p.id === providerData.id);
      if (idx !== -1) {
        providers[idx] = { ...providers[idx], ...providerData } as Provider;
        saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
        return providers[idx];
      }
    }

    const newProvider: Provider = {
      id: `prov-${Date.now()}`,
      name: providerData.name || 'New Supplier',
      businessName: providerData.businessName || 'Business Name',
      providerType: providerData.providerType || 'Retailer/Supplier',
      logo: providerData.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80',
      phone: providerData.phone || '+255 700 000 000',
      whatsapp: providerData.whatsapp || '+255700000000',
      email: providerData.email || 'info@provider.tz',
      location: providerData.location || { country: 'Tanzania', region: 'Dar es Salaam' },
      address: providerData.address || 'Dar es Salaam, Tanzania',
      bio: providerData.bio || 'Quality construction material supplier in Tanzania.',
      isVerified: false,
      rating: 5.0,
      reviewsCount: 0,
      yearsInBusiness: providerData.yearsInBusiness || 1,
      specialties: providerData.specialties || ['Building Materials'],
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    providers.unshift(newProvider);
    saveToStorage(STORAGE_KEYS.PROVIDERS, providers);
    return newProvider;
  },

  async verifyProvider(id: string, isVerified: boolean): Promise<boolean> {
    const providers = getFromStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, MOCK_PROVIDERS);
    const idx = providers.findIndex((p) => p.id === id);
    if (idx !== -1) {
      providers[idx].isVerified = isVerified;
      providers[idx].status = isVerified ? 'active' : 'pending';
      if (isVerified && !providers[idx].verificationDate) {
        providers[idx].verificationDate = new Date().toISOString().split('T')[0];
      }
      saveToStorage(STORAGE_KEYS.PROVIDERS, providers);

      // Also update isVerified on their listings
      const listings = getFromStorage<Listing[]>(STORAGE_KEYS.LISTINGS, MOCK_LISTINGS);
      const updatedListings = listings.map((l) =>
        l.providerId === id ? { ...l, isVerified } : l
      );
      saveToStorage(STORAGE_KEYS.LISTINGS, updatedListings);

      return true;
    }
    return false;
  },

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES);
  },

  async saveCategory(category: Category): Promise<Category> {
    const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES);
    const idx = categories.findIndex((c) => c.id === category.id);
    if (idx !== -1) {
      categories[idx] = category;
    } else {
      categories.push(category);
    }
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const categories = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES);
    const filtered = categories.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, filtered);
    return true;
  },

  // --- Inquiries ---
  async getInquiries(userId?: string, role?: 'buyer' | 'provider' | 'admin'): Promise<Inquiry[]> {
    const inquiries = getFromStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, MOCK_INQUIRIES);
    if (!userId || role === 'admin') return inquiries;
    if (role === 'buyer') {
      return inquiries.filter((inq) => inq.buyerId === userId);
    }
    if (role === 'provider') {
      return inquiries.filter((inq) => inq.providerId === userId || inq.providerId === 'prov-plan-moja-contractors');
    }
    return inquiries;
  },

  async createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
    const inquiries = getFromStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, MOCK_INQUIRIES);
    const newInquiry: Inquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    inquiries.unshift(newInquiry);
    saveToStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: Inquiry['status'], replyNotes?: string): Promise<boolean> {
    const inquiries = getFromStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES, MOCK_INQUIRIES);
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inquiries[idx].status = status;
      if (replyNotes !== undefined) {
        inquiries[idx].replyNotes = replyNotes;
      }
      saveToStorage(STORAGE_KEYS.INQUIRIES, inquiries);
      return true;
    }
    return false;
  },

  // --- Adverts ---
  async getAdverts(): Promise<Advert[]> {
    return getFromStorage<Advert[]>(STORAGE_KEYS.ADVERTS, MOCK_ADVERTS);
  },

  async saveAdvert(advert: Advert): Promise<Advert> {
    const adverts = getFromStorage<Advert[]>(STORAGE_KEYS.ADVERTS, MOCK_ADVERTS);
    const idx = adverts.findIndex((a) => a.id === advert.id);
    if (idx !== -1) {
      adverts[idx] = advert;
    } else {
      adverts.unshift(advert);
    }
    saveToStorage(STORAGE_KEYS.ADVERTS, adverts);
    return advert;
  },

  async createAdvert(advertData: Omit<Advert, 'id'>): Promise<Advert> {
    const newAd: Advert = {
      ...advertData,
      id: `ad-${Date.now()}`,
    };
    return this.saveAdvert(newAd);
  },

  async updateAdvert(id: string, advertData: Partial<Advert>): Promise<Advert> {
    const adverts = getFromStorage<Advert[]>(STORAGE_KEYS.ADVERTS, MOCK_ADVERTS);
    const idx = adverts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      adverts[idx] = { ...adverts[idx], ...advertData };
      saveToStorage(STORAGE_KEYS.ADVERTS, adverts);
      return adverts[idx];
    }
    return this.saveAdvert({ ...advertData, id } as Advert);
  },

  async deleteAdvert(id: string): Promise<boolean> {
    const adverts = getFromStorage<Advert[]>(STORAGE_KEYS.ADVERTS, MOCK_ADVERTS);
    const filtered = adverts.filter((a) => a.id !== id);
    saveToStorage(STORAGE_KEYS.ADVERTS, filtered);
    return true;
  },

  // --- Reviews ---
  async getReviews(providerId?: string): Promise<Review[]> {
    const reviews = getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
    if (providerId) {
      return reviews.filter((r) => r.providerId === providerId);
    }
    return reviews;
  },

  async addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
    const reviews = getFromStorage<Review[]>(STORAGE_KEYS.REVIEWS, MOCK_REVIEWS);
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    reviews.unshift(newRev);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
    return newRev;
  },

  // --- Users & Favorites ---
  async getUsers(): Promise<User[]> {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
  },

  async getFavorites(userId: string): Promise<string[]> {
    const favMap = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {
      'user-buyer-1': ['list-twiga-extra-425', 'list-plan-moja-construction'],
    });
    return favMap[userId] || [];
  },

  async toggleFavorite(userId: string, listingId: string): Promise<string[]> {
    const favMap = getFromStorage<Record<string, string[]>>(STORAGE_KEYS.FAVORITES, {
      'user-buyer-1': ['list-twiga-extra-425', 'list-plan-moja-construction'],
    });
    const current = favMap[userId] || [];
    const exists = current.includes(listingId);
    const updated = exists ? current.filter((id) => id !== listingId) : [...current, listingId];
    favMap[userId] = updated;
    saveToStorage(STORAGE_KEYS.FAVORITES, favMap);
    return updated;
  },

  async getTrafficStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TrafficStats[]> {
    if (period === 'weekly') {
      return [
        { date: 'Week 1', visits: 12400, searches: 28500, inquiries: 1240 },
        { date: 'Week 2', visits: 15800, searches: 34100, inquiries: 1690 },
        { date: 'Week 3', visits: 19400, searches: 42000, inquiries: 2150 },
        { date: 'Week 4', visits: 23600, searches: 51200, inquiries: 2840 },
      ];
    }
    if (period === 'monthly') {
      return [
        { date: 'Oct', visits: 48000, searches: 98000, inquiries: 4900 },
        { date: 'Nov', visits: 59000, searches: 124000, inquiries: 6200 },
        { date: 'Dec', visits: 51000, searches: 110000, inquiries: 5400 },
        { date: 'Jan', visits: 68000, searches: 148000, inquiries: 7900 },
        { date: 'Feb', visits: 82000, searches: 182000, inquiries: 9800 },
        { date: 'Mar', visits: 96000, searches: 215000, inquiries: 11400 },
      ];
    }
    return MOCK_TRAFFIC_STATS;
  },
};
