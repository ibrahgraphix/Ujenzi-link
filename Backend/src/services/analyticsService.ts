import { supabase } from '../config';

export class AnalyticsService {
  async trackVisit(data: {
    sessionId: string;
    pagePath: string;
    referrer?: string;
    userId?: string;
  }) {
    const { sessionId, pagePath, referrer, userId } = data;

    const { error } = await supabase
      .from('site_visits')
      .insert({
        id: crypto.randomUUID(),
        session_id: sessionId,
        page_path: pagePath,
        referrer,
        user_id: userId,
        visited_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to track visit: ${error.message}`);
    }

    return { message: 'Visit tracked successfully' };
  }

  async getTrafficSummary(filters: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = filters;

    let query = supabase
      .from('daily_visit_counts')
      .select('*')
      .order('visit_date', { ascending: false });

    // Filter by date range
    if (startDate) {
      query = query.gte('visit_date', startDate);
    }

    if (endDate) {
      query = query.lte('visit_date', endDate);
    }

    const { data: trafficData, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch traffic summary: ${error.message}`);
    }

    return trafficData || [];
  }

  async getTrafficStats(filters: {
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate } = filters;

    // Build date range filter
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `AND visited_at >= '${startDate}' AND visited_at <= '${endDate}'`;
    } else if (startDate) {
      dateFilter = `AND visited_at >= '${startDate}'`;
    } else if (endDate) {
      dateFilter = `AND visited_at <= '${endDate}'`;
    }

    // Get total unique visitors (count distinct session_id)
    const { data: uniqueVisitors, error: visitorsError } = await supabase
      .rpc('get_unique_visitors', {
        start_date: startDate || null,
        end_date: endDate || null
      });

    // If RPC doesn't exist, use direct query
    let uniqueVisitorCount = 0;
    if (visitorsError) {
      const { data: visits } = await supabase
        .from('site_visits')
        .select('session_id')
        .neq('session_id', null);

      if (visits) {
        const uniqueSessions = new Set(visits.map(v => v.session_id));
        uniqueVisitorCount = uniqueSessions.size;
      }
    } else {
      uniqueVisitorCount = uniqueVisitors || 0;
    }

    // Get total page views
    let pageViewsQuery = supabase
      .from('site_visits')
      .select('id', { count: 'exact', head: true });

    if (startDate) {
      pageViewsQuery = pageViewsQuery.gte('visited_at', startDate);
    }

    if (endDate) {
      pageViewsQuery = pageViewsQuery.lte('visited_at', endDate);
    }

    const { count: pageViews, error: pageViewsError } = await pageViewsQuery;

    if (pageViewsError) {
      throw new Error(`Failed to fetch page views: ${pageViewsError.message}`);
    }

    return {
      uniqueVisitors: uniqueVisitorCount,
      pageViews: pageViews || 0,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    };
  }

  async getTopPages(filters: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const { startDate, endDate, limit = 10 } = filters;

    let query = supabase
      .from('site_visits')
      .select('page_path')
      .order('visited_at', { ascending: false });

    if (startDate) {
      query = query.gte('visited_at', startDate);
    }

    if (endDate) {
      query = query.lte('visited_at', endDate);
    }

    const { data: visits, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch top pages: ${error.message}`);
    }

    // Count page views per path
    const pageCounts = new Map<string, number>();
    visits?.forEach(visit => {
      const count = pageCounts.get(visit.page_path) || 0;
      pageCounts.set(visit.page_path, count + 1);
    });

    // Convert to array and sort
    const topPages = Array.from(pageCounts.entries())
      .map(([page_path, views]) => ({ page_path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return topPages;
  }
}
