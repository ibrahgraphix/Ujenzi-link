// User roles enum
export enum UserRole {
  BUYER = 'buyer',
  PROVIDER = 'provider',
  ADMIN = 'admin'
}

// Buyer types enum
export enum BuyerType {
  CUSTOMER = 'customer',
  CLIENT = 'client',
  DEVELOPER = 'developer'
}

// Provider types enum
export enum ProviderType {
  MANUFACTURER_WHOLESALER = 'manufacturer_wholesaler',
  RETAILER_SUPPLIER = 'retailer_supplier',
  CONTRACTOR = 'contractor',
  CONSULTANT = 'consultant',
  FREELANCER = 'freelancer',
  TECHNICIAN = 'technician',
  CASUAL_LABOURER = 'casual_labourer'
}

// Listing status enum
export enum ListingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  PENDING_REVIEW = 'pending_review'
}

// Inquiry status enum
export enum InquiryStatus {
  NEW = 'new',
  RESPONDED = 'responded',
  CLOSED = 'closed'
}

// Database table interfaces
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface BuyerProfile {
  id: string;
  user_id: string;
  buyer_type: BuyerType;
  company_name?: string;
  institution_name?: string;
  project_name?: string;
  project_description?: string;
  created_at: string;
  updated_at: string;
}

export type AvailabilityStatus = 'available' | 'occupied' | 'busy_and_occupied' | 'occupied_but_available';

export interface ProviderProfile {
  id: string;
  user_id: string;
  provider_type: ProviderType;
  business_name: string;
  description?: string;
  location_id?: string;
  logo?: string;
  logo_file_id?: string;
  is_verified: boolean;
  availability_status?: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  country: string;
  region: string;
  county?: string;
  district: string;
  ward?: string;
  street?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  price_unit?: string;
  location_id: string;
  status: ListingStatus;
  created_by_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  file_id?: string;
  sort_order: number;
  created_at: string;
}

export interface Inquiry {
  id: string;
  buyer_id: string;
  provider_id: string;
  listing_id: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface Advert {
  id: string;
  title: string;
  image_url: string;
  image_file_id?: string;
  link_url: string;
  is_active: boolean;
  is_paid: boolean;
  price_amount?: number;
  starts_at: string;
  ends_at: string;
  provider_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteVisit {
  id: string;
  session_id: string;
  page_path: string;
  referrer?: string;
  user_id?: string;
  visited_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string;
  target_id: string;
  details?: string;
  created_at: string;
}

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Extended Request interface with auth data
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
