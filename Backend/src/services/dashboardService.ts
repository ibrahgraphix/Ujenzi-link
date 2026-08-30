import { supabase } from '../config';
import { UserRole, ProviderType, ListingStatus, InquiryStatus } from '../models';

export class DashboardService {
  async getDashboardOverview() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()).toISOString();

    // Get total users by role
    const { data: usersByRole, error: usersError } = await supabase
      .from('users')
      .select('role');

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const totalUsers = usersByRole?.length || 0;
    const totalBuyers = usersByRole?.filter(u => u.role === UserRole.BUYER).length || 0;
    const totalProviders = usersByRole?.filter(u => u.role === UserRole.PROVIDER).length || 0;
    const totalAdmins = usersByRole?.filter(u => u.role === UserRole.ADMIN).length || 0;

    // Get providers by type
    const { data: providersByType, error: providersError } = await supabase
      .from('provider_profiles')
      .select('provider_type');

    if (providersError) {
      throw new Error(`Failed to fetch provider types: ${providersError.message}`);
    }

    const providerTypeBreakdown: Record<string, number> = {};
    providersByType?.forEach(p => {
      const type = p.provider_type;
      providerTypeBreakdown[type] = (providerTypeBreakdown[type] || 0) + 1;
    });

    // Get listings by status
    const { data: listingsByStatus, error: listingsError } = await supabase
      .from('listings')
      .select('status');

    if (listingsError) {
      throw new Error(`Failed to fetch listings: ${listingsError.message}`);
    }

    const totalListings = listingsByStatus?.length || 0;
    const listingStatusBreakdown: Record<string, number> = {};
    listingsByStatus?.forEach(l => {
      const status = l.status;
      listingStatusBreakdown[status] = (listingStatusBreakdown[status] || 0) + 1;
    });

    // Get inquiries by status
    const { data: inquiriesByStatus, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('status');

    if (inquiriesError) {
      throw new Error(`Failed to fetch inquiries: ${inquiriesError.message}`);
    }

    const totalInquiries = inquiriesByStatus?.length || 0;
    const inquiryStatusBreakdown: Record<string, number> = {};
    inquiriesByStatus?.forEach(i => {
      const status = i.status;
      inquiryStatusBreakdown[status] = (inquiryStatusBreakdown[status] || 0) + 1;
    });

    // Get active adverts
    const now = new Date().toISOString();
    const { data: activeAdverts, error: advertsError } = await supabase
      .from('adverts')
      .select('id')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now);

    if (advertsError) {
      throw new Error(`Failed to fetch adverts: ${advertsError.message}`);
    }

    const totalActiveAdverts = activeAdverts?.length || 0;

    // Get today's visit count
    const { count: todayVisits, error: todayVisitsError } = await supabase
      .from('site_visits')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', todayStart);

    if (todayVisitsError) {
      throw new Error(`Failed to fetch today's visits: ${todayVisitsError.message}`);
    }

    // Get this week's visit count
    const { count: weekVisits, error: weekVisitsError } = await supabase
      .from('site_visits')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', weekStart);

    if (weekVisitsError) {
      throw new Error(`Failed to fetch week's visits: ${weekVisitsError.message}`);
    }

    return {
      users: {
        total: totalUsers,
        buyers: totalBuyers,
        providers: totalProviders,
        admins: totalAdmins
      },
      providers: {
        total: totalProviders,
        byType: providerTypeBreakdown
      },
      listings: {
        total: totalListings,
        byStatus: listingStatusBreakdown
      },
      inquiries: {
        total: totalInquiries,
        byStatus: inquiryStatusBreakdown
      },
      adverts: {
        totalActive: totalActiveAdverts
      },
      visits: {
        today: todayVisits || 0,
        thisWeek: weekVisits || 0
      },
      generatedAt: new Date().toISOString()
    };
  }
}
