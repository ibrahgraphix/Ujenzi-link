import { Listing, Provider } from '../types';
import apiClient from './apiClient';
import { mapBackendListing } from './listingsService';

function mapBackendProvider(p: any): Provider {
  const user = p.users || {};
  return {
    id: p.id,
    name: user.name || p.business_name || 'Supplier',
    businessName: p.business_name || 'Business Name',
    providerType: p.provider_type || 'Retailer/Supplier',
    logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80',
    phone: user.phone || '+255 700 000 000',
    whatsapp: user.phone || '255700000000',
    email: user.email || 'info@provider.tz',
    location: p.locations || { country: 'Tanzania', region: 'Dar es Salaam' },
    address: 'Tanzania',
    bio: p.description || '',
    isVerified: p.is_verified ?? false,
    rating: 5.0,
    reviewsCount: 0,
    yearsInBusiness: 1,
    specialties: ['Construction Materials'],
    joinedDate: p.created_at || new Date().toISOString().split('T')[0],
    status: p.is_verified ? 'active' : 'pending',
  };
}

export async function getPendingProviders(): Promise<Provider[]> {
  try {
    const res = await apiClient.get<{ providers: any[] }>('/api/admin/providers/pending');
    const items = res?.providers || [];
    return items.map(mapBackendProvider);
  } catch (err) {
    console.warn('Failed to fetch pending providers:', err);
    return [];
  }
}

export async function approveProvider(providerId: string): Promise<void> {
  await apiClient.post(`/api/admin/providers/${providerId}/approve`);
}

export async function deactivateProvider(providerId: string): Promise<void> {
  await apiClient.post(`/api/admin/providers/${providerId}/deactivate`);
}

export async function getPendingListings(): Promise<Listing[]> {
  try {
    const res = await apiClient.get<{ listings: any[] }>('/api/admin/listings/pending');
    const items = res?.listings || [];
    return items.map(mapBackendListing);
  } catch (err) {
    console.warn('Failed to fetch pending listings:', err);
    return [];
  }
}

export async function approveListing(listingId: string): Promise<void> {
  await apiClient.post(`/api/admin/listings/${listingId}/approve`);
}

export async function rejectListing(listingId: string): Promise<void> {
  await apiClient.post(`/api/admin/listings/${listingId}/reject`);
}
