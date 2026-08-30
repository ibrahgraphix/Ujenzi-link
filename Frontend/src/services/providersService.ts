import { Provider, ProviderType } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_providers_v1';

function mapBackendProvider(p: any): Provider {
  const user = p.users || {};
  return {
    id: p.id || `prov-${Date.now()}`,
    name: user.name || p.name || p.business_name || 'Supplier',
    businessName: p.business_name || p.businessName || 'Business Name',
    providerType: (p.provider_type as ProviderType) || p.providerType || 'Retailer/Supplier',
    logo: p.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80',
    coverImage: p.coverImage || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    phone: user.phone || p.phone || '+255 700 000 000',
    whatsapp: p.whatsapp || user.phone || '255700000000',
    email: user.email || p.email || 'info@provider.tz',
    location: p.locations || p.location || { country: 'Tanzania', region: 'Dar es Salaam' },
    address: p.address || 'Dar es Salaam, Tanzania',
    bio: p.description || p.bio || 'Quality construction material supplier in Tanzania.',
    isVerified: p.is_verified ?? p.isVerified ?? false,
    verificationDate: p.verificationDate || p.updated_at,
    rating: p.rating ?? 5.0,
    reviewsCount: p.reviewsCount ?? 0,
    yearsInBusiness: p.yearsInBusiness || 1,
    specialties: p.specialties || ['Construction Materials'],
    joinedDate: p.created_at || p.joinedDate || new Date().toISOString().split('T')[0],
    status: p.is_verified ? 'active' : p.status || 'pending',
  };
}

export async function getProviders(type?: string): Promise<Provider[]> {
  try {
    const res = await apiClient.get<any[]>('/api/admin/providers');
    const items = Array.isArray(res) ? res : (res as any)?.providers || (res as any)?.data || [];
    if (Array.isArray(items)) {
      const mapped = items.map(mapBackendProvider);
      if (type && type !== 'all') {
        return mapped.filter((p) => p.providerType === type);
      }
      return mapped;
    }
  } catch (err) {
    console.warn('Failed to fetch providers from API:', err);
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const stored: Provider[] = JSON.parse(item);
      if (type && type !== 'all') {
        return stored.filter((p) => p.providerType === type);
      }
      return stored;
    }
  } catch {
    // fallback
  }

  return [];
}

export async function getProviderById(id: string): Promise<Provider | null> {
  try {
    const res = await apiClient.get<any>(`/api/admin/providers/${id}/full-profile`);
    if (res) {
      return mapBackendProvider(res.provider || res);
    }
  } catch (err) {
    console.warn(`Failed to fetch provider ${id} full profile from API:`, err);
  }

  const providers = await getProviders();
  return providers.find((p) => p.id === id) || null;
}

export async function saveProvider(providerData: Partial<Provider> & { id?: string }): Promise<Provider> {
  const providers = await getProviders();
  if (providerData.id) {
    const idx = providers.findIndex((p) => p.id === providerData.id);
    if (idx !== -1) {
      providers[idx] = { ...providers[idx], ...providerData } as Provider;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
      return providers[idx];
    }
  }

  const newProvider: Provider = {
    id: providerData.id || `prov-${Date.now()}`,
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
  return newProvider;
}

export async function verifyProvider(id: string, isVerified: boolean): Promise<boolean> {
  const providers = await getProviders();
  const idx = providers.findIndex((p) => p.id === id);
  if (idx !== -1) {
    providers[idx].isVerified = isVerified;
    providers[idx].status = isVerified ? 'active' : 'pending';
    if (isVerified && !providers[idx].verificationDate) {
      providers[idx].verificationDate = new Date().toISOString().split('T')[0];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
    return true;
  }
  return false;
}
