import { Inquiry } from '../types';
import apiClient from './apiClient';

const STORAGE_KEY = 'ujenzi_inquiries_v1';

function mapBackendInquiry(item: any): Inquiry {
  let mappedStatus: Inquiry['status'] = 'new';
  if (item.status === 'responded') mappedStatus = 'responded';
  else if (item.status === 'closed') mappedStatus = 'closed';
  else if (item.status === 'pending') mappedStatus = 'pending';
  else mappedStatus = 'new';

  const buyerUser = item.buyer_profiles?.users || item.buyerUser || {};
  const buyerName = buyerUser.full_name || buyerUser.name || item.buyerName || 'Buyer';
  const buyerPhone = buyerUser.phone || item.buyerPhone || '+255 700 000 000';
  const buyerEmail = buyerUser.email || item.buyerEmail || 'buyer@ujenzilink.co.tz';

  const providerUser = item.provider_profiles?.users || item.providerUser || {};
  const providerPhone = providerUser.phone || item.providerPhone || '+255 700 000 000';
  const providerWhatsapp = providerPhone.replace(/[^0-9]/g, '');

  return {
    id: item.id || `inq-${Date.now()}`,
    listingId: item.listing_id || item.listingId,
    listingTitle: item.listings?.title || item.listingTitle || 'Construction Material Inquiry',
    listingImage: item.listings?.listing_images?.[0]?.image_url || item.listingImage,
    providerId: item.provider_id || item.providerId || 'prov-demo',
    providerName: item.provider_profiles?.business_name || item.providerName || 'Supplier',
    providerPhone: providerPhone,
    providerWhatsapp: providerWhatsapp,
    buyerId: item.buyer_id || item.buyerId || 'buyer-demo',
    buyerName: buyerName,
    buyerPhone: buyerPhone,
    buyerEmail: buyerEmail,
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
    return [];
  } catch (err) {
    console.error(`Failed to fetch inquiries for role ${role} from API:`, err);
    return [];
  }
}

export async function createInquiry(data: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<Inquiry> {
  const payload = {
    providerId: data.providerId,
    listingId: data.listingId,
    message: data.message,
  };
  console.log('Sending inquiry payload:', payload);
  console.log('Full data received:', data);

  try {
    const res = await apiClient.post('/api/inquiries', payload);
    console.log('Inquiry API response:', res);
    if (res && res.data && res.data.inquiry) {
      return mapBackendInquiry(res.data.inquiry);
    } else if (res && res.inquiry) {
      return mapBackendInquiry(res.inquiry);
    } else if (res) {
      return mapBackendInquiry(res);
    }
    throw new Error('Unexpected API response format');
  } catch (err) {
    console.error('Failed to submit inquiry via API:', err);
    throw err;
  }
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry['status'],
  replyNotes?: string
): Promise<boolean> {
  try {
    await apiClient.put(`/api/inquiries/${id}/status`, {
      status,
      replyNotes,
    });
    return true;
  } catch (err) {
    console.error(`Failed to update inquiry status ${id} via API:`, err);
    throw err;
  }
}
