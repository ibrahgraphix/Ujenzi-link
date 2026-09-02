import { supabase } from '../config';
import { Advert } from '../models';
import { ImageKitService } from './imagekitService';

const imageKitService = new ImageKitService();

export class AdvertService {
  async getActiveAdverts() {
    const { data: adverts, error } = await supabase
      .from('adverts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active adverts: ${error.message}`);
    }

    return adverts || [];
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
    imageUrl: string;
    imageFileId?: string;
    linkUrl: string;
    isActive: boolean;
    isPaid?: boolean;
    priceAmount?: number;
    startsAt: string;
    endsAt: string;
    providerId?: string;
  }, adminId: string) {
    const { title, imageUrl, imageFileId, linkUrl, isActive, isPaid, priceAmount, startsAt, endsAt, providerId } = data;

    const { data: advert, error } = await supabase
      .from('adverts')
      .insert({
        id: crypto.randomUUID(),
        title,
        image_url: imageUrl,
        image_file_id: imageFileId || null,
        link_url: linkUrl,
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
    imageUrl?: string;
    imageFileId?: string;
    linkUrl?: string;
    isActive?: boolean;
    isPaid?: boolean;
    priceAmount?: number;
    startsAt?: string;
    endsAt?: string;
    providerId?: string;
  }, adminId: string) {
    const { title, imageUrl, imageFileId, linkUrl, isActive, isPaid, priceAmount, startsAt, endsAt, providerId } = data;

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
    if (imageUrl !== undefined) updatePayload.image_url = imageUrl;
    if (imageFileId !== undefined) updatePayload.image_file_id = imageFileId;
    if (linkUrl !== undefined) updatePayload.link_url = linkUrl;
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
