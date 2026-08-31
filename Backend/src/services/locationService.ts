import { supabase } from '../config';

export interface LocationInput {
  country?: string;
  region?: string;
  district?: string;
  county?: string;
  ward?: string;
  street?: string;
}

export class LocationService {
  async resolveLocationId(location?: LocationInput): Promise<string> {
    const region = location?.region?.trim();
    const district = location?.district?.trim();

    if (!region || !district) {
      throw new Error('Location information is required');
    }

    const country = location?.country?.trim() || 'Tanzania';

    let query = supabase
      .from('locations')
      .select('id')
      .eq('country', country)
      .eq('region', region)
      .eq('district', district);

    if (location?.county?.trim()) {
      query = query.eq('county', location.county.trim());
    }

    const { data: existing, error: lookupError } = await query.limit(1).maybeSingle();

    if (lookupError) {
      throw new Error(`Failed to look up location: ${lookupError.message}`);
    }

    if (existing?.id) {
      return existing.id;
    }

    const { data: created, error: insertError } = await supabase
      .from('locations')
      .insert({
        id: crypto.randomUUID(),
        country,
        region,
        district,
        county: location?.county?.trim() || null,
        ward: location?.ward?.trim() || null,
        street: location?.street?.trim() || null,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !created?.id) {
      throw new Error(`Failed to save location: ${insertError?.message || 'unknown error'}`);
    }

    return created.id;
  }
}
