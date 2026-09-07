import apiClient from './apiClient';

export interface TrafficStats {
  totalPageVisits: number;
  totalListingVisits: number;
  totalProviderVisits: number;
  uniqueVisitors: number;
  totalPages: number;
  totalListings: number;
  totalProviders: number;
}

export interface ListingTraffic {
  totalVisits: number;
  uniqueVisitors: number;
  visitDetails: Array<{
    id: string;
    listing_id: string;
    ip_address: string;
    visit_count: number;
    first_visit: string;
    last_visit: string;
  }>;
}

export interface ProviderTraffic {
  totalVisits: number;
  uniqueVisitors: number;
  visitDetails: Array<{
    id: string;
    provider_id: string;
    ip_address: string;
    visit_count: number;
    first_visit: string;
    last_visit: string;
  }>;
}

// Get client IP address
export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'unknown';
  }
}

// Track page visit
export async function trackPageVisit(pageUrl: string): Promise<void> {
  try {
    const ipAddress = await getClientIP();
    await apiClient.post('/api/traffic/page', { pageUrl, ipAddress });
  } catch (error) {
    console.error('Failed to track page visit:', error);
    // Don't throw error - tracking shouldn't break the app
  }
}

// Track listing visit
export async function trackListingVisit(listingId: string): Promise<void> {
  try {
    const ipAddress = await getClientIP();
    await apiClient.post(`/api/traffic/listing/${listingId}`, { ipAddress });
  } catch (error) {
    console.error('Failed to track listing visit:', error);
    // Don't throw error - tracking shouldn't break the app
  }
}

// Track provider visit
export async function trackProviderVisit(providerId: string): Promise<void> {
  try {
    const ipAddress = await getClientIP();
    // Note: providerId should be the user_id from provider_profiles table
    await apiClient.post(`/api/traffic/provider/${providerId}`, { ipAddress });
  } catch (error) {
    console.error('Failed to track provider visit:', error);
    // Don't throw error - tracking shouldn't break the app
  }
}

// Get traffic stats (admin only)
export async function getTrafficStats(): Promise<TrafficStats> {
  try {
    const res = await apiClient.get('/api/traffic/stats');
    return res?.data?.stats || {
      totalPageVisits: 0,
      totalListingVisits: 0,
      totalProviderVisits: 0,
      uniqueVisitors: 0,
      totalPages: 0,
      totalListings: 0,
      totalProviders: 0
    };
  } catch (error) {
    console.error('Failed to get traffic stats:', error);
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

// Get listing traffic (admin and provider)
export async function getListingTraffic(listingId: string): Promise<ListingTraffic> {
  try {
    const res = await apiClient.get(`/api/traffic/listing/${listingId}`);
    return res?.data?.traffic || {
      totalVisits: 0,
      uniqueVisitors: 0,
      visitDetails: []
    };
  } catch (error) {
    console.error('Failed to get listing traffic:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      visitDetails: []
    };
  }
}

// Get provider traffic (admin and provider)
export async function getProviderTraffic(providerId: string): Promise<ProviderTraffic> {
  try {
    const res = await apiClient.get(`/api/traffic/provider/${providerId}`);
    return res?.data?.traffic || {
      totalVisits: 0,
      uniqueVisitors: 0,
      visitDetails: []
    };
  } catch (error) {
    console.error('Failed to get provider traffic:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      visitDetails: []
    };
  }
}
