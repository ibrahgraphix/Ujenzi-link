import { Advert } from '../types';
import { MOCK_ADVERTS } from '../data/mockData';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_adverts_v1';

function mapBackendAdvert(ad: any): Advert {
  return {
    id: ad.id || `ad-${Date.now()}`,
    title: ad.title || 'Advert',
    subtitle: ad.subtitle || 'Special Offer',
    sponsorName: ad.sponsorName || ad.sponsor_name || 'Ujenzi Partner',
    bannerUrl: ad.bannerUrl || ad.image_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80',
    targetUrl: ad.targetUrl || ad.link_url || '#',
    phoneNumber: ad.phoneNumber || ad.phone_number || '+255 755 000 111',
    whatsapp: ad.whatsapp || '255755000111',
    category: ad.category || 'General',
    position: ad.position || 'hero',
    startDate: ad.startDate || ad.starts_at || new Date().toISOString(),
    endDate: ad.endDate || ad.ends_at || new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: ad.isActive ?? ad.is_active ?? true,
    impressions: ad.impressions || 1500,
    clicks: ad.clicks || 120,
    ctaText: ad.ctaText || 'Learn More',
  };
}

export async function getAdverts(): Promise<Advert[]> {
  try {
    const res = await apiClient.get<any[]>('/api/adverts/active');
    if (res && Array.isArray(res) && res.length > 0) {
      return res.map(mapBackendAdvert);
    }
  } catch (err) {
    console.warn('Failed to fetch active adverts from API, using fallback:', err);
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) return JSON.parse(item);
  } catch {
    // fallback
  }

  return MOCK_ADVERTS;
}

export async function getAllAdvertsAdmin(): Promise<Advert[]> {
  try {
    const res = await apiClient.get<any[]>('/api/adverts');
    if (res && Array.isArray(res)) {
      return res.map(mapBackendAdvert);
    }
  } catch (err) {
    console.warn('Failed to fetch all adverts via admin API, using fallback:', err);
  }
  return getAdverts();
}

export async function createAdvert(advertData: Omit<Advert, 'id'>): Promise<Advert> {
  try {
    const payload = {
      title: advertData.title,
      image_url: advertData.bannerUrl,
      link_url: advertData.targetUrl || '#',
      is_active: advertData.isActive ?? true,
      starts_at: advertData.startDate || new Date().toISOString(),
      ends_at: advertData.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    };
    const res = await apiClient.post('/api/adverts', payload);
    if (res) return mapBackendAdvert(res);
  } catch (err) {
    console.warn('Failed to create advert via API, updating locally:', err);
  }

  const newAd: Advert = {
    ...advertData,
    id: `ad-${Date.now()}`,
  };

  const adverts = await getAdverts();
  adverts.unshift(newAd);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adverts));
  return newAd;
}

export async function updateAdvert(id: string, advertData: Partial<Advert>): Promise<Advert> {
  try {
    const payload = {
      title: advertData.title,
      image_url: advertData.bannerUrl,
      link_url: advertData.targetUrl,
      is_active: advertData.isActive,
    };
    const res = await apiClient.put(`/api/adverts/${id}`, payload);
    if (res) return mapBackendAdvert(res);
  } catch (err) {
    console.warn(`Failed to update advert ${id} via API, updating locally:`, err);
  }

  const adverts = await getAdverts();
  const idx = adverts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    adverts[idx] = { ...adverts[idx], ...advertData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adverts));
    return adverts[idx];
  }
  return { id, title: 'Updated Advert', ...advertData } as Advert;
}

export async function deleteAdvert(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/api/adverts/${id}`);
    return true;
  } catch (err) {
    console.warn(`Failed to delete advert ${id} via API, updating locally:`, err);
  }

  const adverts = await getAdverts();
  const filtered = adverts.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
