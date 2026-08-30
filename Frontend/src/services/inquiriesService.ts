import { Inquiry } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_inquiries_v1';

function mapBackendInquiry(item: any): Inquiry {
  let mappedStatus: Inquiry['status'] = 'pending';
  if (item.status === 'responded' || item.status === 'contacted') mappedStatus = 'contacted';
  else if (item.status === 'closed' || item.status === 'completed') mappedStatus = 'completed';
  else if (item.status === 'cancelled') mappedStatus = 'cancelled';
  else mappedStatus = 'pending';

  return {
    id: item.id || `inq-${Date.now()}`,
    listingId: item.listing_id || item.listingId,
    listingTitle: item.listings?.title || item.listingTitle || 'Construction Material Inquiry',
    listingImage: item.listings?.listing_images?.[0]?.image_url || item.listingImage,
    providerId: item.provider_id || item.providerId || 'prov-demo',
    providerName: item.provider_profiles?.business_name || item.providerName || 'Supplier',
    buyerId: item.buyer_id || item.buyerId || 'buyer-demo',
    buyerName: item.buyers?.users?.name || item.buyerName || 'Buyer Name',
    buyerPhone: item.buyers?.users?.phone || item.buyerPhone || '+255 700 000 000',
    buyerEmail: item.buyers?.users?.email || item.buyerEmail || 'buyer@ujenzilink.co.tz',
    message: item.message || '',
    quantity: item.quantity || '1 Unit',
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    status: mappedStatus,
    replyNotes: item.replyNotes || item.reply_notes,
  };
}

export async function getInquiries(userId?: string, role?: 'buyer' | 'provider' | 'admin'): Promise<Inquiry[]> {
  try {
    let res: any;
    if (role === 'buyer') {
      res = await apiClient.get('/api/inquiries/my-inquiries');
    } else if (role === 'provider') {
      res = await apiClient.get('/api/inquiries/received');
    }
    const items = Array.isArray(res) ? res : res?.inquiries || res?.data || [];
    if (Array.isArray(items)) {
      return items.map(mapBackendInquiry);
    }
  } catch (err) {
    console.warn(`Failed to fetch inquiries for role ${role} from API:`, err);
  }

  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item) {
      const stored: Inquiry[] = JSON.parse(item);
      if (!userId || role === 'admin') return stored;
      if (role === 'buyer') return stored.filter((i) => i.buyerId === userId);
      if (role === 'provider') return stored.filter((i) => i.providerId === userId);
      return stored;
    }
  } catch {
    // fallback
  }

  return [];
}

export async function createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
  try {
    const payload = {
      providerId: data.providerId,
      listingId: data.listingId,
      message: data.message,
    };
    const res = await apiClient.post('/api/inquiries', payload);
    if (res) {
      return mapBackendInquiry(res);
    }
  } catch (err) {
    console.warn('Failed to submit inquiry via API, updating locally:', err);
  }

  const all = await getInquiries();
  const newInquiry: Inquiry = {
    ...data,
    id: `inq-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  all.unshift(newInquiry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newInquiry;
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry['status'],
  replyNotes?: string
): Promise<boolean> {
  try {
    let backendStatus = 'new';
    if (status === 'contacted') backendStatus = 'responded';
    else if (status === 'completed') backendStatus = 'closed';

    await apiClient.put(`/api/inquiries/${id}/status`, {
      status: backendStatus,
      replyNotes,
    });
    return true;
  } catch (err) {
    console.warn(`Failed to update inquiry status ${id} via API, updating locally:`, err);
  }

  const all = await getInquiries();
  const idx = all.findIndex((i) => i.id === id);
  if (idx !== -1) {
    all[idx].status = status;
    if (replyNotes !== undefined) {
      all[idx].replyNotes = replyNotes;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  }
  return false;
}
