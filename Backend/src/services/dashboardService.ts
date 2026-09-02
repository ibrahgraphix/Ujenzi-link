import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { UserRole } from '../models';

// Dedicated service-role client for admin analytics & dashboard counts (bypasses RLS)
const serviceRoleClient = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': config.supabaseSecretKey,
      'Authorization': `Bearer ${config.supabaseSecretKey}`
    }
  }
});

export class DashboardService {
  async getDashboardOverview() {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()).toISOString();

    // Get total users by role
    const { data: usersByRole, error: usersError } = await serviceRoleClient
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
    const { data: providersByType, error: providersError } = await serviceRoleClient
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
    const { data: listingsByStatus, error: listingsError } = await serviceRoleClient
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
    const { data: inquiriesByStatus, error: inquiriesError } = await serviceRoleClient
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
    const { data: activeAdverts, error: advertsError } = await serviceRoleClient
      .from('adverts')
      .select('id')
      .eq('is_active', true);

    if (advertsError) {
      throw new Error(`Failed to fetch adverts: ${advertsError.message}`);
    }

    const totalActiveAdverts = activeAdverts?.length || 0;

    // Get today's visit count
    const { count: todayVisits } = await serviceRoleClient
      .from('site_visits')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', todayStart);

    // Get this week's visit count
    const { count: weekVisits } = await serviceRoleClient
      .from('site_visits')
      .select('id', { count: 'exact', head: true })
      .gte('visited_at', weekStart);

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

  async getAdminAnalytics() {
    // --- KPI Counts via serviceRoleClient (bypassing RLS) ---
    const [
      { count: totalProviders },
      { data: verifiedProviders },
      { count: totalListings },
      { count: totalInquiries },
      { count: totalActiveAdverts },
      { count: totalUsers },
    ] = await Promise.all([
      serviceRoleClient.from('provider_profiles').select('user_id', { count: 'exact', head: true }),
      serviceRoleClient.from('provider_profiles').select('user_id').eq('is_verified', true),
      serviceRoleClient.from('listings').select('id', { count: 'exact', head: true }),
      serviceRoleClient.from('inquiries').select('id', { count: 'exact', head: true }),
      serviceRoleClient.from('adverts').select('id', { count: 'exact', head: true }).eq('is_active', true),
      serviceRoleClient.from('users').select('id', { count: 'exact', head: true }),
    ]);

    // --- Category distribution (categories with item counts) ---
    const { data: catData } = await serviceRoleClient
      .from('categories')
      .select('name, id')
      .order('name');

    const catCounts: Record<string, number> = {};
    if (catData && catData.length > 0) {
      const { data: listingCats } = await serviceRoleClient
        .from('listings')
        .select('category_id');
      listingCats?.forEach((l: any) => {
        if (l.category_id) {
          catCounts[l.category_id] = (catCounts[l.category_id] || 0) + 1;
        }
      });
    }

    const categoryDistribution = (catData || []).map((c: any) => ({
      name: c.name,
      value: catCounts[c.id] || 0,
    })).filter((c: any) => c.value > 0).sort((a: any, b: any) => b.value - a.value);

    // --- Monthly inquiries & listings for last 6 months ---
    const now = new Date();
    const monthlyData: { month: string; inquiries: number; listings: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const label = d.toLocaleString('en-US', { month: 'short' });

      const [{ count: inqCount }, { count: listCount }] = await Promise.all([
        serviceRoleClient.from('inquiries').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
        serviceRoleClient.from('listings').select('id', { count: 'exact', head: true })
          .gte('created_at', start).lte('created_at', end),
      ]);
      monthlyData.push({ month: label, inquiries: inqCount || 0, listings: listCount || 0 });
    }

    // --- Recent Activity from admin_logs + inquiries + listings ---
    let adminLogs: any[] = [];
    try {
      const { data } = await serviceRoleClient
        .from('admin_logs')
        .select('id, action, target_table, details, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      adminLogs = data || [];
    } catch (e) {
      console.warn('admin_logs fetch warning:', e);
    }

    const { data: recentInquiries } = await serviceRoleClient
      .from('inquiries')
      .select('id, message, created_at, listing_id')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentListings } = await serviceRoleClient
      .from('listings')
      .select('id, title, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5);

    // Merge into unified activity feed
    const activity: { type: string; description: string; timestamp: string }[] = [];

    adminLogs.forEach((log: any) => {
      activity.push({
        type: 'admin',
        description: log.details || `${log.action} on ${log.target_table}`,
        timestamp: log.created_at || new Date().toISOString(),
      });
    });
    (recentInquiries || []).forEach((inq: any) => {
      activity.push({
        type: 'inquiry',
        description: `New inquiry: "${(inq.message || '').slice(0, 60)}..."`,
        timestamp: inq.created_at || new Date().toISOString(),
      });
    });
    (recentListings || []).forEach((lst: any) => {
      activity.push({
        type: 'listing',
        description: `Listing ${lst.status === 'active' ? 'published' : 'updated'}: "${lst.title}"`,
        timestamp: lst.created_at || new Date().toISOString(),
      });
    });

    // Sort by recency
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentActivity = activity.slice(0, 10);

    return {
      kpis: {
        totalProviders: totalProviders || 0,
        verifiedProviders: (verifiedProviders || []).length,
        totalListings: totalListings || 0,
        totalInquiries: totalInquiries || 0,
        totalActiveAdverts: totalActiveAdverts || 0,
        totalUsers: totalUsers || 0,
      },
      monthlyData,
      categoryDistribution,
      recentActivity,
      generatedAt: new Date().toISOString(),
    };
  }
}
