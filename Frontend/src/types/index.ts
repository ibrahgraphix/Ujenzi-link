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

export type AvailabilityStatus = 'available' | 'occupied' | 'busy_and_occupied' | 'occupied_but_available';

export type TradeCategory =
  | 'registered_civil_building_contractor'
  | 'registered_em_contractor'
  | 'specialized_works'
  | 'general_supply_services'
  | 'construction_company'
  | 'specialized_material_supply';

export const TRADE_CATEGORY_OPTIONS: { label: string; value: TradeCategory }[] = [
  { label: 'Registered civil and building contractor', value: 'registered_civil_building_contractor' },
  { label: 'Registered E&M contractor', value: 'registered_em_contractor' },
  { label: 'Specialized works', value: 'specialized_works' },
  { label: 'General supply and services', value: 'general_supply_services' },
  { label: 'Construction company', value: 'construction_company' },
  { label: 'Specialized Material supply', value: 'specialized_material_supply' },
];

export interface LocationHierarchy {
  country: string;
  region: string;
  district?: string;
  county?: string;
  ward?: string;
  street?: string;
}

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  accountType: AccountType;
  buyerRole?: BuyerRole;
  buyerType?: 'customer' | 'client';
  institutionName?: string;
  projectName?: string;
  projectDescription?: string;
  providerType?: ProviderType;
  tradeCategory?: TradeCategory | string;
  businessName?: string;
  description?: string;
  availabilityStatus?: AvailabilityStatus;
  location: LocationHierarchy;
  avatar?: string;
  isVerified?: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface StoredImage {
  url: string;
  fileId?: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  categoryId?: string;
  price: number;
  currency: string;
  unit: string;
  description: string;
  images: string[];
  imageItems?: StoredImage[];
  location: LocationHierarchy;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerType: ProviderType;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  status: 'active' | 'inactive' | 'draft' | 'pending_review';
  isFeatured?: boolean;
  tags?: string[];
  minOrderQuantity?: string;
  deliveryAvailable?: boolean;
  specifications?: Record<string, string>;
}

export interface Provider {
  id: string;
  name: string;
  fullName?: string;
  businessName: string;
  providerType: ProviderType;
  tradeCategory?: TradeCategory | string;
  logo: string;
  logoFileId?: string;
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
  availabilityStatus?: AvailabilityStatus;
}

export interface Inquiry {
  id: string;
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerWhatsapp?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  message: string;
  targetLocation?: string;
  quantity?: string;
  createdAt: string;
  status: 'new' | 'pending' | 'responded' | 'closed';
  replyNotes?: string;
}

export interface Advert {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  sponsorName: string;
  bannerUrl: string;
  bannerFileId?: string;
  targetUrl?: string;
  phoneNumber?: string;
  email?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  category?: string;
  position: 'hero' | 'sidebar' | 'featured_section' | 'banner';
  startDate: string;
  endDate: string;
  startTime?: string;   // Partner working hours start e.g. '08:00'
  endTime?: string;     // Partner working hours end e.g. '17:00'
  isActive: boolean;
  isPaid?: boolean;
  priceAmount?: number;
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
