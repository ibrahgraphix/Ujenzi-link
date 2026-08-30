export type AccountType = 'buyer' | 'provider' | 'admin';

export type BuyerRole = 'Customer' | 'Client' | 'Developer' | 'Homeowner';

export type ProviderType =
  | 'Manufacturer/Wholesaler'
  | 'Retailer/Supplier'
  | 'Contractor'
  | 'Consultant'
  | 'Freelancer'
  | 'Technician'
  | 'Casual Labourer';

export interface LocationHierarchy {
  country: string;
  region: string;
  district?: string;
  ward?: string;
  street?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: AccountType;
  buyerRole?: BuyerRole;
  providerType?: ProviderType;
  businessName?: string;
  location: LocationHierarchy;
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  unit: string;
  description: string;
  images: string[];
  location: LocationHierarchy;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  status: 'active' | 'inactive' | 'draft';
  isFeatured?: boolean;
  tags?: string[];
  minOrderQuantity?: string;
  deliveryAvailable?: boolean;
  specifications?: Record<string, string>;
}

export interface Provider {
  id: string;
  name: string;
  businessName: string;
  providerType: ProviderType;
  logo: string;
  coverImage?: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: LocationHierarchy;
  address: string;
  bio: string;
  isVerified: boolean;
  verificationDate?: string;
  rating: number;
  reviewsCount: number;
  yearsInBusiness: number;
  specialties: string[];
  joinedDate: string;
  status: 'active' | 'pending' | 'suspended';
}

export interface Inquiry {
  id: string;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  providerId: string;
  providerName: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  message: string;
  quantity?: string;
  createdAt: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  replyNotes?: string;
}

export interface Advert {
  id: string;
  title: string;
  subtitle?: string;
  sponsorName: string;
  bannerUrl: string;
  targetUrl?: string;
  phoneNumber?: string;
  whatsapp?: string;
  category?: string;
  position: 'hero' | 'sidebar' | 'featured_section' | 'banner';
  startDate: string;
  endDate: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  ctaText?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  itemCount: number;
  imageUrl: string;
  popular: boolean;
}

export interface Review {
  id: string;
  providerId: string;
  listingId?: string;
  authorName: string;
  authorLocation?: string;
  rating: number;
  comment: string;
  date: string;
  projectType?: string;
}

export interface TrafficStats {
  date: string;
  visits: number;
  searches: number;
  inquiries: number;
}
