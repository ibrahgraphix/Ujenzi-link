import { supabase } from '../config';
import { ImageKitService } from './imagekitService';
import { AvailabilityStatus } from '../models';

export interface ImagePayload {
  url: string;
  fileId?: string;
}

const imageKitService = new ImageKitService();

export class ProviderProfileService {
  async getProviderProfileByUserId(userId: string) {
    const { data: profile, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      throw new Error('Provider profile not found');
    }

    return profile;
  }

  async getPublicProviderProfile(providerId: string) {
    const { data: profile, error } = await supabase
      .from('provider_profiles')
      .select(`
        *,
        users (id, name, email, phone, role),
        locations (*)
      `)
      .eq('user_id', providerId)
      .maybeSingle();

    if (error || !profile) {
      throw new Error('Provider profile not found');
    }

    return profile;
  }

  async updateProviderBio(userId: string, bio: string) {
    const { data: updated, error: updateError } = await supabase
      .from('provider_profiles')
      .update({
        description: bio,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select(`
        *,
        users (id, name, email, phone, role),
        locations (*)
      `)
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update provider profile: ${updateError?.message}`);
    }

    return updated;
  }

  async updateProviderLogo(userId: string, logo: string, logoFileId?: string) {
    const { data: existing, error: fetchError } = await supabase
      .from('provider_profiles')
      .select('user_id, logo_file_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !existing) {
      throw new Error('Provider profile not found');
    }

    const oldFileId = existing.logo_file_id as string | undefined;

    const { data: updated, error: updateError } = await supabase
      .from('provider_profiles')
      .update({
        logo,
        logo_url: logo,
        logo_file_id: logoFileId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update provider logo: ${updateError?.message}`);
    }

    if (oldFileId && oldFileId !== logoFileId) {
      await imageKitService.deleteFile(oldFileId);
    }

    return updated;
  }

  async updateProviderAvailabilityStatus(userId: string, availabilityStatus: AvailabilityStatus) {
    const { data: updated, error: updateError } = await supabase
      .from('provider_profiles')
      .update({
        availability_status: availabilityStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update availability status: ${updateError?.message}`);
    }

    return updated;
  }
}
