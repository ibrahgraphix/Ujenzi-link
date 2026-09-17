import { supabase } from '../config';

export class TrafficService {
  async trackPageVisit(ipAddress: string, pageUrl: string) {
    try {
      const { data, error } = await supabase
        .from('site_visits')
        .insert({
          id: crypto.randomUUID(),
          session_id: ipAddress || 'anonymous',
          page_path: pageUrl,
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error recording page visit in site_visits:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error tracking page visit:', error);
      return null;
    }
  }

  async trackListingVisit(ipAddress: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('site_visits')
        .insert({
          id: crypto.randomUUID(),
          session_id: ipAddress || 'anonymous',
          page_path: `/listings/${listingId}`,
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error recording listing visit in site_visits:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error tracking listing visit:', error);
      return null;
    }
  }

  async trackProviderVisit(ipAddress: string, providerId: string) {
    try {
      const { data, error } = await supabase
        .from('site_visits')
        .insert({
          id: crypto.randomUUID(),
          session_id: ipAddress || 'anonymous',
          page_path: `/providers/${providerId}`,
          created_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error recording provider visit in site_visits:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error tracking provider visit:', error);
      return null;
    }
  }

  async getTrafficStats() {
    try {
      const { count: totalVisits } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true });

      const { data: recentVisits } = await supabase
        .from('site_visits')
        .select('session_id, page_path')
        .order('created_at', { ascending: false })
        .limit(1000);

      const uniqueVisitors = new Set(recentVisits?.map(pv => pv.session_id).filter(Boolean)).size;
      const totalListingVisits = recentVisits?.filter(pv => pv.page_path?.includes('/listing')).length || 0;
      const totalProviderVisits = recentVisits?.filter(pv => pv.page_path?.includes('/provider')).length || 0;

      return {
        totalPageVisits: totalVisits || 0,
        totalListingVisits,
        totalProviderVisits,
        uniqueVisitors: uniqueVisitors || 1,
        totalPages: totalVisits || 0,
        totalListings: totalListingVisits,
        totalProviders: totalProviderVisits
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
        .from('site_visits')
        .select('*')
        .ilike('page_path', `%${listingId}%`);

      if (error) {
        console.error('Failed to get listing traffic:', error.message);
        return { totalVisits: 0, uniqueVisitors: 0, visitDetails: [] };
      }

      const totalVisits = visits?.length || 0;
      const uniqueVisitors = new Set(visits?.map(v => v.session_id).filter(Boolean)).size;

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
        .from('site_visits')
        .select('*')
        .ilike('page_path', `%${providerId}%`);

      if (error) {
        console.error('Failed to get provider traffic:', error.message);
        return { totalVisits: 0, uniqueVisitors: 0, visitDetails: [] };
      }

      const totalVisits = visits?.length || 0;
      const uniqueVisitors = new Set(visits?.map(v => v.session_id).filter(Boolean)).size;

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
