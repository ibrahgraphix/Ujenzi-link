import { supabase } from '../config';

export class TrafficService {
  async trackPageVisit(ipAddress: string, pageUrl: string) {
    try {
      // Check if this IP has visited this page before
      const { data: existingVisit, error: fetchError } = await supabase
        .from('page_visits')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('page_url', pageUrl)
        .maybeSingle();

      if (fetchError && !fetchError.message.includes('No rows')) {
        console.error('Error checking existing page visit:', fetchError);
        return null;
      }

      if (existingVisit) {
        // Update existing visit count
        const { data: updatedVisit, error: updateError } = await supabase
          .from('page_visits')
          .update({
            visit_count: existingVisit.visit_count + 1,
            last_visit: new Date().toISOString()
          })
          .eq('id', existingVisit.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating page visit:', updateError);
          return null;
        }

        return updatedVisit;
      } else {
        // Create new visit record
        const { data: newVisit, error: insertError } = await supabase
          .from('page_visits')
          .insert({
            id: crypto.randomUUID(),
            ip_address: ipAddress,
            page_url: pageUrl,
            visit_count: 1,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating page visit:', insertError);
          return null;
        }

        return newVisit;
      }
    } catch (error) {
      console.error('Error tracking page visit:', error);
      return null;
    }
  }

  async trackListingVisit(ipAddress: string, listingId: string) {
    try {
      // Check if this IP has visited this listing before
      const { data: existingVisit, error: fetchError } = await supabase
        .from('listing_visits')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (fetchError && !fetchError.message.includes('No rows')) {
        console.error('Error checking existing listing visit:', fetchError);
        return null;
      }

      if (existingVisit) {
        // Update existing visit count
        const { data: updatedVisit, error: updateError } = await supabase
          .from('listing_visits')
          .update({
            visit_count: existingVisit.visit_count + 1,
            last_visit: new Date().toISOString()
          })
          .eq('id', existingVisit.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating listing visit:', updateError);
          return null;
        }

        return updatedVisit;
      } else {
        // Create new visit record
        const { data: newVisit, error: insertError } = await supabase
          .from('listing_visits')
          .insert({
            id: crypto.randomUUID(),
            listing_id: listingId,
            ip_address: ipAddress,
            visit_count: 1,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating listing visit:', insertError);
          return null;
        }

        return newVisit;
      }
    } catch (error) {
      console.error('Error tracking listing visit:', error);
      return null;
    }
  }

  async trackProviderVisit(ipAddress: string, providerId: string) {
    try {
      // Check if this IP has visited this provider before
      const { data: existingVisit, error: fetchError } = await supabase
        .from('provider_visits')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('provider_id', providerId)
        .maybeSingle();

      if (fetchError && !fetchError.message.includes('No rows')) {
        console.error('Error checking existing provider visit:', fetchError);
        return null;
      }

      if (existingVisit) {
        // Update existing visit count
        const { data: updatedVisit, error: updateError } = await supabase
          .from('provider_visits')
          .update({
            visit_count: existingVisit.visit_count + 1,
            last_visit: new Date().toISOString()
          })
          .eq('id', existingVisit.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating provider visit:', updateError);
          return null;
        }

        return updatedVisit;
      } else {
        // Create new visit record
        const { data: newVisit, error: insertError } = await supabase
          .from('provider_visits')
          .insert({
            id: crypto.randomUUID(),
            provider_id: providerId,
            ip_address: ipAddress,
            visit_count: 1,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating provider visit:', insertError);
          return null;
        }

        return newVisit;
      }
    } catch (error) {
      console.error('Error tracking provider visit:', error);
      return null;
    }
  }

  async getTrafficStats() {
    try {
      // Get total page visits
      const { data: pageVisits, error: pageError } = await supabase
        .from('page_visits')
        .select('visit_count');

      const totalPageVisits = pageVisits?.reduce((sum, pv) => sum + pv.visit_count, 0) || 0;

      // Get total listing visits
      const { data: listingVisits, error: listingError } = await supabase
        .from('listing_visits')
        .select('visit_count');

      const totalListingVisits = listingVisits?.reduce((sum, lv) => sum + lv.visit_count, 0) || 0;

      // Get total provider visits
      const { data: providerVisits, error: providerError } = await supabase
        .from('provider_visits')
        .select('visit_count');

      const totalProviderVisits = providerVisits?.reduce((sum, pv) => sum + pv.visit_count, 0) || 0;

      // Get unique IPs (approximate unique visitors)
      const { data: uniquePageIPs } = await supabase
        .from('page_visits')
        .select('ip_address');

      const uniqueVisitors = new Set(uniquePageIPs?.map(pv => pv.ip_address)).size;

      return {
        totalPageVisits,
        totalListingVisits,
        totalProviderVisits,
        uniqueVisitors,
        totalPages: pageVisits?.length || 0,
        totalListings: listingVisits?.length || 0,
        totalProviders: providerVisits?.length || 0
      };
    } catch (error) {
      console.error('Error getting traffic stats:', error);
      return {
        totalPageVisits: 0,
        totalListingVisits: 0,
        totalProviderVisits: 0,
        uniqueVisitors: 0,
        totalPages: 0,
        totalListings: 0,
        totalProviders: 0
      };
    }
  }

  async getListingTraffic(listingId: string) {
    try {
      const { data: visits, error } = await supabase
        .from('listing_visits')
        .select('*')
        .eq('listing_id', listingId);

      if (error) {
        throw new Error(`Failed to get listing traffic: ${error.message}`);
      }

      const totalVisits = visits?.reduce((sum, v) => sum + v.visit_count, 0) || 0;
      const uniqueVisitors = new Set(visits?.map(v => v.ip_address)).size;

      return {
        totalVisits,
        uniqueVisitors,
        visitDetails: visits || []
      };
    } catch (error) {
      console.error('Error getting listing traffic:', error);
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        visitDetails: []
      };
    }
  }

  async getProviderTraffic(providerId: string) {
    try {
      const { data: visits, error } = await supabase
        .from('provider_visits')
        .select('*')
        .eq('provider_id', providerId);

      if (error) {
        throw new Error(`Failed to get provider traffic: ${error.message}`);
      }

      const totalVisits = visits?.reduce((sum, v) => sum + v.visit_count, 0) || 0;
      const uniqueVisitors = new Set(visits?.map(v => v.ip_address)).size;

      return {
        totalVisits,
        uniqueVisitors,
        visitDetails: visits || []
      };
    } catch (error) {
      console.error('Error getting provider traffic:', error);
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        visitDetails: []
      };
    }
  }
}
