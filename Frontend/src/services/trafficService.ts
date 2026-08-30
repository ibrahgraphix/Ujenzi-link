import { TrafficStats } from '../types';
import apiClient from './apiClient';

function getSessionId(): string {
  let id = sessionStorage.getItem('ujenzi_session_id');
  if (!id) {
    id = `sess-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    sessionStorage.setItem('ujenzi_session_id', id);
  }
  return id;
}

export async function trackVisit(pagePath: string, referrer?: string): Promise<boolean> {
  try {
    await apiClient.post('/api/analytics/track', {
      session_id: getSessionId(),
      page_path: pagePath,
      referrer: referrer || document.referrer || '',
    });
    return true;
  } catch (err) {
    return false;
  }
}

export async function getDashboardOverview(): Promise<any> {
  try {
    const res = await apiClient.get('/api/admin/dashboard/overview');
    if (res) return res;
  } catch (err) {
    console.warn('Failed to fetch admin dashboard overview from API:', err);
  }

  return {
    totalUsers: 0,
    totalProviders: 0,
    totalListings: 0,
    totalInquiries: 0,
    activeAdverts: 0,
  };
}

export async function getTrafficStats(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<TrafficStats[]> {
  try {
    const res = await apiClient.get<any[]>(`/api/analytics/traffic-stats?period=${period}`);
    const items = Array.isArray(res) ? res : (res as any)?.stats || (res as any)?.data || [];
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item: any) => ({
        date: item.date || item.visited_at || 'Today',
        visits: item.visits || item.total_visits || 0,
        searches: item.searches || 0,
        inquiries: item.inquiries || 0,
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch traffic stats from API:', err);
  }

  return [];
}
