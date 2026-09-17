import { Provider, ProviderType, AvailabilityStatus } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_providers_v1';

function mapBackendProvider(p: any): Provider {
  // Supabase may return users as object or single-element array depending on join type
  const user = Array.isArray(p.users) ? (p.users[0] || {}) : (p.users || {});
  
  // Full name used during registration
  const registeredFullName =
    user.full_name ||
    user.fullName ||
    user.name ||
    p.full_name ||
    p.name ||
    '';

  const businessName = p.business_name || p.businessName || user.business_name || '';

  return {
    id: p.user_id || p.id || user.id || `prov-${Date.now()}`,
    name: registeredFullName || businessName || 'Supplier',
    fullName: registeredFullName,
    businessName: businessName,
    providerType: (p.provider_type as ProviderType) || p.providerType || user.provider_type || 'Retailer/Supplier',
    tradeCategory: p.trade_category || p.tradeCategory || user.trade_category || user.tradeCategory || undefined,
    logo: p.logo || p.logo_url || user.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80',
    logoFileId: p.logo_file_id || p.logoFileId || user.logo_file_id,
    coverImage: p.coverImage || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    phone: user.phone || p.phone || '+255 700 000 000',
    whatsapp: p.whatsapp || user.phone || p.phone || '255700000000',
    email: user.email || p.email || 'info@provider.tz',
    location: p.locations || p.location || user.location || { country: 'Tanzania', region: '' },
    address: p.address || '',
    bio: p.description || p.bio || user.description || 'Quality construction material supplier in Tanzania.',
    isVerified: p.is_verified ?? p.isVerified ?? false,
    verificationDate: p.verificationDate || p.updated_at,
    rating: 0,
    reviewsCount: 0,
    yearsInBusiness: p.yearsInBusiness || 1,
    specialties: p.specialties || ['Construction Materials'],
    joinedDate: (p.created_at || p.joinedDate || new Date().toISOString()).split('T')[0],
    status: p.is_verified ? 'active' : p.status || 'pending',
    availabilityStatus: p.availability_status as AvailabilityStatus,
  };
}


export async function getProviders(type?: string): Promise<Provider[]> {
  try {
    console.log('Fetching providers from public endpoint');
    // Try public endpoint first for customer/client views
    const res = await apiClient.get<any>('/api/provider/all', { cache: 'no-store' });
    console.log('Provider API response:', res);
    const items = Array.isArray(res) ? res : (res as any)?.providers || (res as any)?.data?.providers || [];
    console.log('Extracted provider items:', items);
    if (Array.isArray(items)) {
      const mapped = items.map(mapBackendProvider);
      console.log('Mapped providers:', mapped);
      if (type && type !== 'all') {
        return mapped.filter((p) => p.providerType === type);
      }
      return mapped;
    }
  } catch (err) {
    console.warn('Failed to fetch providers from public API, trying admin endpoint:', err);
    try {
      // Fallback to admin endpoint (requires auth)
      const res = await apiClient.get<any>('/api/admin/providers', { cache: 'no-store' });
      console.log('Admin provider API response:', res);
      const items = Array.isArray(res) ? res : (res as any)?.providers || (res as any)?.data?.providers || [];
      console.log('Extracted admin provider items:', items);
      if (Array.isArray(items)) {
        const mapped = items.map(mapBackendProvider);
        console.log('Mapped admin providers:', mapped);
        if (type && type !== 'all') {
          return mapped.filter((p) => p.providerType === type);
        }
        return mapped;
      }
    } catch (adminErr) {
      console.error('Failed to fetch providers from admin API:', adminErr);
    }
  }

  return [];
}

export async function getProviderById(id: string): Promise<Provider | null> {
  try {
    // Try public endpoint first so any user/provider can view the shopfront profile without 403
    const res = await apiClient.get<any>(`/api/provider/${id}`);
    console.log('Individual provider API response:', res);
    if (res?.provider || res?.data?.provider) {
      return mapBackendProvider(res.provider || res.data.provider);
    }
  } catch (err) {
    console.warn(`Failed to fetch provider ${id} from public endpoint, trying fallback:`, err);
  }

  try {
    const res = await apiClient.get<any>(`/api/admin/providers/${id}/full-profile`);
    console.log('Admin provider full profile response:', res);
    if (res) {
      return mapBackendProvider(res.provider || res);
    }
  } catch (err) {
    console.warn(`Failed to fetch provider ${id} full profile from admin API:`, err);
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
    location: providerData.location || { country: 'Tanzania', region: 'Dar es Salaam', district: 'Kinondoni' },
    address: providerData.address || 'Dar es Salaam, Tanzania',
    bio: providerData.bio || 'Quality construction material supplier in Tanzania.',
    isVerified: false,
    rating: 0,
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
  try {
    if (isVerified) {
      await apiClient.post(`/api/admin/providers/${id}/approve`);
      return true;
    }
  } catch (err) {
    console.warn(`Failed to verify provider ${id} via API:`, err);
  }

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

export async function updateProviderLogo(
  logo: string,
  logoFileId?: string
): Promise<Provider | null> {
  try {
    const res = await apiClient.put<{ profile: any }>('/api/provider/profile/logo', {
      logo,
      logoFileId,
    });
    if (res?.profile) {
      return mapBackendProvider(res.profile);
    }
  } catch (err) {
    console.warn('Failed to update provider logo via API:', err);
    throw err;
  }
  return null;
}

export async function updateProviderAvailabilityStatus(
  availabilityStatus: AvailabilityStatus
): Promise<Provider | null> {
  try {
    const res = await apiClient.put<{ profile: any }>('/api/provider/profile/availability', {
      availabilityStatus,
    });
    if (res?.profile) {
      return mapBackendProvider(res.profile);
    }
  } catch (err) {
    console.warn('Failed to update provider availability status via API:', err);
    throw err;
  }
  return null;
}

export async function updateProviderBio(bio: string): Promise<Provider | null> {
  try {
    const res = await apiClient.put<{ profile: any }>('/api/provider/profile/bio', {
      bio,
    });
    if (res?.profile) {
      return mapBackendProvider(res.profile);
    }
  } catch (err) {
    console.warn('Failed to update provider bio via API:', err);
    throw err;
  }
  return null;
}

export async function updateProviderTradeCategory(tradeCategory: string): Promise<Provider | null> {
  try {
    const res = await apiClient.put<{ profile: any }>('/api/provider/profile/trade-category', {
      tradeCategory,
    });
    if (res?.profile) {
      return mapBackendProvider(res.profile);
    }
  } catch (err) {
    console.warn('Failed to update trade category via API:', err);
    throw err;
  }
  return null;
}

export async function updateProviderLocation(location: any): Promise<Provider | null> {
  try {
    const res = await apiClient.put<{ profile: any }>('/api/provider/profile/location', {
      location,
    });
    if (res?.profile) {
      return mapBackendProvider(res.profile);
    }
  } catch (err) {
    console.warn('Failed to update provider location via API:', err);
    throw err;
  }
  return null;
}

