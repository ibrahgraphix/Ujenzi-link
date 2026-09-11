import { supabase } from '../config';

export class AnalyticsService {
  async trackVisit(data: {
    sessionId: string;
    pagePath: string;
    referrer?: string;
    userId?: string;
    viewedRegion?: string;
    viewedDistrict?: string;
  }) {
    const { sessionId, pagePath, referrer, userId, viewedRegion, viewedDistrict } = data;

    const { error } = await supabase
      .from('site_visits')
      .insert({
        id: crypto.randomUUID(),
        session_id: sessionId,
        page_path: pagePath,
        referrer,
        user_id: userId,
        viewed_region: viewedRegion ?? null,
        viewed_district: viewedDistrict ?? null,
        created_at: new Date().toISOString()
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
      dateFilter = `AND created_at >= '${startDate}' AND created_at <= '${endDate}'`;
    } else if (startDate) {
      dateFilter = `AND created_at >= '${startDate}'`;
    } else if (endDate) {
      dateFilter = `AND created_at <= '${endDate}'`;
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
      pageViewsQuery = pageViewsQuery.gte('created_at', startDate);
    }

    if (endDate) {
      pageViewsQuery = pageViewsQuery.lte('created_at', endDate);
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
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
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

  async getRegionalVisitCounts(filters: {
    startDate?: string;
    endDate?: string;
    region?: string;
    sortBy?: 'total_visits' | 'unique_visitors';
  }) {
    const { startDate, endDate, region, sortBy = 'total_visits' } = filters;

    // regional_visit_counts is a view; we filter on the underlying site_visits columns
    // by querying it directly and applying Supabase filters.
    // Note: view columns are viewed_region, viewed_district, total_visits, unique_visitors
    let query = supabase
      .from('regional_visit_counts')
      .select('viewed_region, viewed_district, total_visits, unique_visitors')
      .order(sortBy, { ascending: false });

    if (region) {
      query = query.eq('viewed_region', region);
    }

    // The view groups raw rows; date filtering must be done on site_visits.
    // Since PostgREST can't push date filters into a view that doesn't expose
    // created_at, we fall back to querying site_visits directly for date-scoped results.
    if (startDate || endDate) {
      let rawQuery = supabase
        .from('site_visits')
        .select('viewed_region, viewed_district, session_id')
        .not('viewed_region', 'is', null);

      if (startDate) rawQuery = rawQuery.gte('created_at', startDate);
      if (endDate)   rawQuery = rawQuery.lte('created_at', endDate);
      if (region)    rawQuery = rawQuery.eq('viewed_region', region);

      const { data: rows, error } = await rawQuery;
      if (error) throw new Error(`Failed to fetch regional visits: ${error.message}`);

      // Aggregate in memory
      const map = new Map<string, { region: string; district: string | null; sessions: Set<string>; total: number }>();
      for (const row of rows ?? []) {
        const key = `${row.viewed_region}|||${row.viewed_district ?? ''}`;
        if (!map.has(key)) {
          map.set(key, { region: row.viewed_region, district: row.viewed_district ?? null, sessions: new Set(), total: 0 });
        }
        const entry = map.get(key)!;
        entry.total += 1;
        if (row.session_id) entry.sessions.add(row.session_id);
      }

      const result = Array.from(map.values()).map(e => ({
        region: e.region,
        district: e.district,
        total_visits: e.total,
        unique_visitors: e.sessions.size,
      }));

      result.sort((a, b) =>
        sortBy === 'unique_visitors'
          ? b.unique_visitors - a.unique_visitors
          : b.total_visits - a.total_visits
      );

      return result;
    }

    // No date filter — use the pre-built view directly, normalise column names
    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch regional visits: ${error.message}`);
    return (data ?? []).map((row: any) => ({
      region: row.viewed_region,
      district: row.viewed_district,
      total_visits: row.total_visits,
      unique_visitors: row.unique_visitors,
    }));
  }
}
