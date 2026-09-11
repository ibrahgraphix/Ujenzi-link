import apiClient from './apiClient';

export interface AdminAnalytics {
  kpis: {
    totalProviders: number;
    verifiedProviders: number;
    totalListings: number;
    totalInquiries: number;
    totalActiveAdverts: number;
    totalUsers: number;
  };
  monthlyData: { month: string; inquiries: number; listings: number }[];
  categoryDistribution: { name: string; value: number }[];
  recentActivity: { type: string; description: string; timestamp: string }[];
  generatedAt: string;
}

export interface RegionalVisitRow {
  region: string;
  district: string | null;
  total_visits: number;
  unique_visitors: number;
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

function getOrCreateSessionId(): string {
  const KEY = 'uj_session_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/**
 * Central visit-tracking call that replaces the old /api/traffic/page approach.
 * Sends to /api/analytics/track so that viewed_region / viewed_district are persisted.
 */
export async function trackSiteVisit(options: {
  pagePath: string;
  viewedRegion?: string;
  viewedDistrict?: string;
  userId?: string;
}): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    await apiClient.post('/api/analytics/track', {
      sessionId,
      pagePath: options.pagePath,
      viewedRegion: options.viewedRegion || undefined,
      viewedDistrict: options.viewedDistrict || undefined,
      userId: options.userId || undefined,
    });
  } catch {
    // Tracking must never break the app
  }
}

export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  try {
    // apiClient auto-unwraps { status: 'success', data: ... } so we get the data object directly
    const result = await apiClient.get<AdminAnalytics>('/api/admin/dashboard/analytics');
    return result as AdminAnalytics;
  } catch (err) {
    console.warn('Failed to fetch admin analytics:', err);
    return null;
  }
}

export async function getRegionalVisitCounts(params: {
  startDate?: string;
  endDate?: string;
  region?: string;
  sortBy?: 'total_visits' | 'unique_visitors';
}): Promise<RegionalVisitRow[]> {
  try {
    const qs = new URLSearchParams();
    if (params.startDate) qs.set('startDate', params.startDate);
    if (params.endDate)   qs.set('endDate', params.endDate);
    if (params.region)    qs.set('region', params.region);
    if (params.sortBy)    qs.set('sortBy', params.sortBy);

    const res = await apiClient.get<{ regionalVisits: RegionalVisitRow[] }>(
      `/api/analytics/regional-visits?${qs.toString()}`
    );
    return (res as any)?.regionalVisits ?? [];
  } catch (err) {
    console.warn('Failed to fetch regional visits:', err);
    return [];
  }
}
