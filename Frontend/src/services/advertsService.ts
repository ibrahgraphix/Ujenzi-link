import { Advert } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_adverts_v1';

function mapBackendAdvert(ad: any): Advert {
  return {
    id: ad.id || `ad-${Date.now()}`,
    title: ad.title || 'Advert',
    subtitle: ad.subtitle || '',
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
    isPaid: ad.isPaid ?? ad.is_paid ?? false,
    priceAmount: ad.priceAmount ?? ad.price_amount ?? undefined,
    bannerFileId: ad.bannerFileId || ad.image_file_id,
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
    ctaText: ad.ctaText || 'Learn More',
  };
}

export async function getAdverts(): Promise<Advert[]> {
  try {
    // Backend returns { status, data: { adverts: [...] } } — apiClient unwraps to { adverts: [...] }
    const res = await apiClient.get<any>('/api/adverts/active');
    const items = Array.isArray(res) ? res : (res as any)?.adverts || [];
    return items.map(mapBackendAdvert);
  } catch (err) {
    console.warn('Failed to fetch active adverts from API:', err);
    return [];
  }
}

export async function getAllAdvertsAdmin(): Promise<Advert[]> {
  try {
    // Backend returns { status, data: { adverts: [...] } } — apiClient unwraps to { adverts: [...] }
    const res = await apiClient.get<any>('/api/adverts');
    const items = Array.isArray(res) ? res : (res as any)?.adverts || [];
    return items.map(mapBackendAdvert);
  } catch (err) {
    console.warn('Failed to fetch all adverts via admin API:', err);
    return [];
  }
}

export async function createAdvert(
  advertData: Omit<Advert, 'id'> & { bannerFileId?: string }
): Promise<Advert> {
  // Convert date-only strings (YYYY-MM-DD) to full ISO timestamps for the backend
  const toISO = (d?: string) => {
    if (!d) return new Date().toISOString();
    if (d.includes('T')) return d;
    return new Date(d + 'T00:00:00.000Z').toISOString();
  };

  const payload = {
    title: advertData.title,
    imageUrl: advertData.bannerUrl,
    imageFileId: advertData.bannerFileId,
    linkUrl: advertData.targetUrl || '/contact',
    isActive: advertData.isActive ?? true,
    isPaid: advertData.isPaid ?? false,
    priceAmount: advertData.priceAmount,
    startsAt: toISO(advertData.startDate),
    endsAt: toISO(advertData.endDate) || new Date(Date.now() + 90 * 86400000).toISOString(),
  };

  // Always try API first — no silent localStorage fallback
  const res = await apiClient.post('/api/adverts', payload);
  return mapBackendAdvert((res as any)?.advert || res);
}

export async function updateAdvert(id: string, advertData: Partial<Advert> & { bannerFileId?: string }): Promise<Advert> {
  try {
    const payload = {
      title: advertData.title,
      imageUrl: advertData.bannerUrl,
      imageFileId: advertData.bannerFileId,
      linkUrl: advertData.targetUrl,
      isActive: advertData.isActive,
      isPaid: advertData.isPaid,
      priceAmount: advertData.priceAmount,
    };
    const res = await apiClient.put(`/api/adverts/${id}`, payload);
    if (res) return mapBackendAdvert(res.advert || res);
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
