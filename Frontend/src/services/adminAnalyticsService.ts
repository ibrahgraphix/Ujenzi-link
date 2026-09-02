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
