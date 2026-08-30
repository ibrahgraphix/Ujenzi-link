import { supabase } from '../config';
import { Advert } from '../models';

export class AdvertService {
  async getActiveAdverts() {
    const now = new Date().toISOString();

    const { data: adverts, error } = await supabase
      .from('adverts')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
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
    linkUrl: string;
    isActive: boolean;
    startsAt: string;
    endsAt: string;
    providerId?: string;
  }, adminId: string) {
    const { title, imageUrl, linkUrl, isActive, startsAt, endsAt, providerId } = data;

    const { data: advert, error } = await supabase
      .from('adverts')
      .insert({
        id: crypto.randomUUID(),
        title,
        image_url: imageUrl,
        link_url: linkUrl,
        is_active: isActive,
        starts_at: startsAt,
        ends_at: endsAt,
        provider_id: providerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
    linkUrl?: string;
    isActive?: boolean;
    startsAt?: string;
    endsAt?: string;
    providerId?: string;
  }, adminId: string) {
    const { title, imageUrl, linkUrl, isActive, startsAt, endsAt, providerId } = data;

    const { data: advert, error } = await supabase
      .from('adverts')
      .update({
        title,
        image_url: imageUrl,
        link_url: linkUrl,
        is_active: isActive,
        starts_at: startsAt,
        ends_at: endsAt,
        provider_id: providerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', advertId)
      .select()
      .single();

    if (error || !advert) {
      throw new Error(`Failed to update advert: ${error?.message}`);
    }

    // Log admin action
    await this.logAdminAction(adminId, 'update_advert', 'adverts', advertId, `Updated advert: ${title}`);

    return advert;
  }

  async deleteAdvert(advertId: string, adminId: string) {
    // Get advert details before deletion for logging
    const { data: advert, error: fetchError } = await supabase
      .from('adverts')
      .select('title')
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
