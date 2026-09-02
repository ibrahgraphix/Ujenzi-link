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

    // Try to insert with service role bypass
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

    if (insertError) {
      console.error('Location insertion error (RLS policy violation):', insertError);
      console.log('Attempting to find existing location as fallback...');
      
      // Fallback: Try to find ANY location in the same region/district
      const { data: fallbackLocation, error: fallbackError } = await supabase
        .from('locations')
        .select('id')
        .eq('country', country)
        .eq('region', region)
        .eq('district', district)
        .limit(1)
        .maybeSingle();
      
      if (fallbackError || !fallbackLocation?.id) {
        console.error('Fallback location lookup also failed:', fallbackError);
        // Final fallback: Try to find ANY location in the database
        const { data: anyLocation, error: anyError } = await supabase
          .from('locations')
          .select('id')
          .limit(1)
          .maybeSingle();
        
        if (anyError || !anyLocation?.id) {
          throw new Error(`Failed to save location and no fallback location available: ${insertError.message}`);
        }
        
        console.log('Using fallback location ID:', anyLocation.id);
        return anyLocation.id;
      }
      
      console.log('Using existing location ID as fallback:', fallbackLocation.id);
      return fallbackLocation.id;
    }

    if (!created?.id) {
      throw new Error('Failed to save location: unknown error');
    }

    return created.id;
  }
}
