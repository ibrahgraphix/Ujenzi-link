import { supabase } from '../config';
import { Advert } from '../models';
import { ImageKitService } from './imagekitService';

const imageKitService = new ImageKitService();

function normalizeDbTime(t?: string | null): string | null {
  if (!t || typeof t !== 'string' || !t.trim()) return null;
  const clean = t.trim();
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hh = match24[1].padStart(2, '0');
    const mm = match24[2];
    const ss = match24[3] || '00';
    return `${hh}:${mm}:${ss}`;
  }
  const match12 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (match12) {
    let hh = parseInt(match12[1], 10);
    const mm = match12[2];
    const ss = match12[3] || '00';
    const isPm = match12[4].toLowerCase() === 'pm';
    if (isPm && hh < 12) hh += 12;
    if (!isPm && hh === 12) hh = 0;
    return `${String(hh).padStart(2, '0')}:${mm}:${ss}`;
  }
  return clean;
}

export class AdvertService {
  async getActiveAdverts() {
    try {
      const { data: adverts, error } = await supabase
        .from('adverts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active adverts from Supabase:', error.message);
        return [];
      }

      return adverts || [];
    } catch (err: any) {
      console.error('Exception fetching active adverts:', err?.message || err);
      return [];
    }
  }

  async getAllAdverts(filters: {
    isActive?: boolean;
    providerId?: string;
    page?: number;
    limit?: number;
  }) {
    const { isActive, providerId, page = 1, limit = 20 } = filters;

    let query = supabase
      .from('adverts')
      .select('*', { count: 'exact' });

    // Filter by active status
    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    // Filter by provider
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by created_at (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: adverts, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch adverts: ${error.message}`);
    }

    return {
      adverts: adverts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async createAdvert(data: {
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl: string;
    imageFileId?: string;
    linkUrl?: string;
    phoneNumber?: string;
    email?: string;
    contactPhone?: string;
    contactEmail?: string;
    startTime?: string;
    endTime?: string;
    isActive: boolean;
    isPaid?: boolean;
    priceAmount?: number;
    startsAt: string;
    endsAt: string;
    providerId?: string;
  }, adminId: string) {
    const { title, subtitle, description, imageUrl, imageFileId, linkUrl, phoneNumber, email, contactPhone, contactEmail, startTime, endTime, isActive, isPaid, priceAmount, startsAt, endsAt, providerId } = data;

    const finalContactPhone = contactPhone || phoneNumber || null;
    const finalContactEmail = contactEmail || email || null;

    const { data: advert, error } = await supabase
      .from('adverts')
      .insert({
        id: crypto.randomUUID(),
        title,
        subtitle: subtitle || null,
        description: description || null,
        image_url: imageUrl,
        image_file_id: imageFileId || null,
        link_url: linkUrl || null,
        phone_number: finalContactPhone,
        email: finalContactEmail,
        contact_phone: finalContactPhone,
        contact_email: finalContactEmail,
        start_time: normalizeDbTime(startTime),
        end_time: normalizeDbTime(endTime),
        is_active: isActive,
        is_paid: isPaid ?? false,
        price_amount: priceAmount ?? null,
        starts_at: startsAt,
        ends_at: endsAt,
        provider_id: providerId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !advert) {
      throw new Error(`Failed to create advert: ${error?.message}`);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'create_advert', 'adverts', advert.id, `Created advert: ${title}`);

    return advert;
  }

  async updateAdvert(advertId: string, data: {
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    imageFileId?: string;
    linkUrl?: string;
    phoneNumber?: string;
    email?: string;
    contactPhone?: string;
    contactEmail?: string;
    startTime?: string;
    endTime?: string;
    isActive?: boolean;
    isPaid?: boolean;
    priceAmount?: number;
    startsAt?: string;
    endsAt?: string;
    providerId?: string;
  }, adminId: string) {
    const { title, subtitle, description, imageUrl, imageFileId, linkUrl, phoneNumber, email, contactPhone, contactEmail, startTime, endTime, isActive, isPaid, priceAmount, startsAt, endsAt, providerId } = data;

    const { data: existing, error: fetchError } = await supabase
      .from('adverts')
      .select('image_file_id')
      .eq('id', advertId)
      .single();

    if (fetchError || !existing) {
      throw new Error('Advert not found');
    }

    const updatePayload: Record<string, unknown> = {};

    if (title !== undefined) updatePayload.title = title;
    if (subtitle !== undefined) updatePayload.subtitle = subtitle;
    if (description !== undefined) updatePayload.description = description;
    if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
    if (imageFileId !== undefined) updatePayload.image_file_id = imageFileId;
    if (linkUrl !== undefined) updatePayload.link_url = linkUrl;
    if (phoneNumber !== undefined || contactPhone !== undefined) {
      const p = contactPhone !== undefined ? contactPhone : phoneNumber;
      updatePayload.phone_number = p || null;
      updatePayload.contact_phone = p || null;
    }
    if (email !== undefined || contactEmail !== undefined) {
      const em = contactEmail !== undefined ? contactEmail : email;
      updatePayload.email = em || null;
      updatePayload.contact_email = em || null;
    }
    if (startTime !== undefined) updatePayload.start_time = normalizeDbTime(startTime);
    if (endTime !== undefined) updatePayload.end_time = normalizeDbTime(endTime);
    if (isActive !== undefined) updatePayload.is_active = isActive;
    if (isPaid !== undefined) updatePayload.is_paid = isPaid;
    if (priceAmount !== undefined) updatePayload.price_amount = priceAmount;
    if (startsAt !== undefined) updatePayload.starts_at = startsAt;
    if (endsAt !== undefined) updatePayload.ends_at = endsAt;
    if (providerId !== undefined) updatePayload.provider_id = providerId;

    const { data: advert, error } = await supabase
      .from('adverts')
      .update(updatePayload)
      .eq('id', advertId)
      .select()
      .single();

    if (error || !advert) {
      throw new Error(`Failed to update advert: ${error?.message}`);
    }

    if (
      imageFileId !== undefined &&
      existing.image_file_id &&
      existing.image_file_id !== imageFileId
    ) {
      await imageKitService.deleteFile(existing.image_file_id);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'update_advert', 'adverts', advertId, `Updated advert: ${title}`);

    return advert;
  }

  async deleteAdvert(advertId: string, adminId: string) {
    // Get advert details before deletion for logging
    const { data: advert, error: fetchError } = await supabase
      .from('adverts')
      .select('title, image_file_id')
      .eq('id', advertId)
      .single();

    if (fetchError || !advert) {
      throw new Error('Advert not found');
    }

    const { error: deleteError } = await supabase
      .from('adverts')
      .delete()
      .eq('id', advertId);

    if (deleteError) {
      throw new Error(`Failed to delete advert: ${deleteError.message}`);
    }

    if (advert.image_file_id) {
      await imageKitService.deleteFile(advert.image_file_id);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'delete_advert', 'adverts', advertId, `Deleted advert: ${advert.title}`);

    return { message: 'Advert deleted successfully' };
  }

  private async logAdminAction(adminId: string, action: string, targetTable: string, targetId: string, details?: string) {
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        id: crypto.randomUUID(),
        admin_id: adminId,
        action,
        target_table: targetTable,
        target_id: targetId,
        details,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Failed to log admin action: ${error.message}`);
    }
  }
}
