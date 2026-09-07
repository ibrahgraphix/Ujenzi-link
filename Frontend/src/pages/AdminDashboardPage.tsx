import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Package,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Clock,
  Activity,
  RefreshCw,
  Building2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Provider, Listing, Advert } from '../types';
import { getProviders, verifyProvider } from '../services/providersService';
import { getListings, deleteListing } from '../services/listingsService';
import { getAllAdvertsAdmin, createAdvert, updateAdvert, deleteAdvert } from '../services/advertsService';
import { getAdminAnalytics, AdminAnalytics } from '../services/adminAnalyticsService';
import { getTrafficStats, TrafficStats } from '../services/trafficService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ImageUpload } from '../components/common/ImageUpload';
import { ProviderTypeBadge, VerifiedBadge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { UploadedImage } from '../services/uploadService';
import { cardImageUrl, logoImageUrl } from '../utils/imagekit';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onSelectListing: (listing: Listing) => void;
  onSelectProvider: (provider: Provider) => void;
}

const COLORS = ['#1B3A6B', '#2E86D8', '#8B5E3C', '#10B981', '#F59E0B', '#6366F1'];

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function activityIcon(type: string) {
  if (type === 'inquiry') return <MessageSquare className="w-3.5 h-3.5 text-[#2E86D8]" />;
  if (type === 'listing') return <Package className="w-3.5 h-3.5 text-emerald-500" />;
  return <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onSelectListing,
  onSelectProvider,
}) => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'analytics' | 'providers' | 'listings' | 'adverts'>('analytics');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // New Advert Modal State
  const [isAdvertModalOpen, setIsAdvertModalOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adSubtitle, setAdSubtitle] = useState('');
  const [adImage, setAdImage] = useState<UploadedImage | null>(null);
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adPosition, setAdPosition] = useState<'hero' | 'sidebar' | 'footer'>('hero');
  const [adIsPaid, setAdIsPaid] = useState(false);
  const [adPriceAmount, setAdPriceAmount] = useState('');
  const [adStartDate, setAdStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [adEndDate, setAdEndDate] = useState('2026-12-31');

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const [data, traffic] = await Promise.all([
      getAdminAnalytics(),
      getTrafficStats()
    ]);
    setAnalytics(data);
    setTrafficStats(traffic);
    setAnalyticsLoading(false);
  }, []);

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    const [allProv, allListings, allAds] = await Promise.all([
      getProviders(),
      getListings(),
      getAllAdvertsAdmin(),
    ]);
    setProviders(allProv);
    setListings(allListings);
    setAdverts(allAds);
    setIsLoading(false);
    // Load analytics in parallel
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleVerification = async (provider: Provider) => {
    const newStatus = !provider.isVerified;
    await verifyProvider(provider.id, newStatus);
    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, isVerified: newStatus } : p))
    );
    success(`${provider.name} verification status is now ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}.`);
    loadAnalytics();
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Delete this listing from the marketplace?')) {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      success('Listing removed.');
      loadAnalytics();
    }
  };

  const handleToggleAdvert = async (ad: Advert) => {
    const updated = await updateAdvert(ad.id, { isActive: !ad.isActive });
    setAdverts((prev) => prev.map((a) => (a.id === ad.id ? updated : a)));
    success(`Advert "${ad.title}" is now ${!ad.isActive ? 'Active' : 'Paused'}.`);
  };

  const handleDeleteAdvert = async (id: string) => {
    if (!window.confirm('Delete this advert campaign?')) return;
    await deleteAdvert(id);
    setAdverts((prev) => prev.filter((a) => a.id !== id));
    success('Advert campaign deleted.');
  };

  const handleCreateAdvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle) {
      error('Please provide an advert title.');
      return;
    }
    if (!adImage?.url) {
      error('Please upload a banner image.');
      return;
    }
    try {
      const newAd = await createAdvert({
        title: adTitle,
        subtitle: adSubtitle,
        bannerUrl: adImage.url,
        bannerFileId: adImage.fileId,
        targetUrl: adLinkUrl || '/contact',
        position: adPosition,
        isActive: true,
        isPaid: adIsPaid,
        priceAmount: adPriceAmount ? Number(adPriceAmount) : undefined,
        sponsorName: 'Plan Moja Featured Partner',
        startDate: adStartDate,
        endDate: adEndDate,
        impressions: 0,
        clicks: 0,
      });
      setAdverts((prev) => [newAd, ...prev]);
      setIsAdvertModalOpen(false);
      setAdTitle('');
      setAdSubtitle('');
      setAdImage(null);
      setAdLinkUrl('');
      setAdIsPaid(false);
      setAdPriceAmount('');
      setAdStartDate(new Date().toISOString().split('T')[0]);
      setAdEndDate('2026-12-31');
      success('Banner advert campaign launched successfully!');
    } catch (err: any) {
      error(`Failed to create advert: ${err?.message || 'Unknown error'}`);
    }
  };

  // Derived analytics values with fallbacks
  const kpis = analytics?.kpis;
  const monthlyData = analytics?.monthlyData || [];
  const categoryDistribution = analytics?.categoryDistribution || [];
  const recentActivity = analytics?.recentActivity || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Ribbon */}
      <div className="bg-gradient-to-r from-[#12284C] via-[#1B3A6B] to-[#12284C] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Central Control Console
            </span>
            <span className="text-xs text-slate-300">Plan Moja Company Ltd</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
            Ujenzi Link Platform Administration
          </h1>
          {analytics?.generatedAt && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Data refreshed {formatRelativeTime(analytics.generatedAt)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="sm"
            onClick={() => loadAnalytics()}
            leftIcon={<RefreshCw className={`w-4 h-4 ${analyticsLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
          <Button
            variant="white"
            size="sm"
            onClick={() => setActiveTab('adverts')}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Manage Adverts
          </Button>
          <Button
            variant="bronze"
            size="sm"
            onClick={() => setIsAdvertModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Banner Campaign
          </Button>
        </div>
      </div>

      {/* KPI Metrics — from real DB */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Suppliers</span>
            <Users className="w-4 h-4 text-[#2E86D8]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis?.totalProviders ?? providers.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {kpis?.verifiedProviders ?? providers.filter((p) => p.isVerified).length} Verified by Ujenzi Link
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Listings</span>
            <Package className="w-4 h-4 text-[#1B3A6B]" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis?.totalListings ?? listings.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across {categoryDistribution.length || '—'} categories
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Inquiries</span>
            <MessageSquare className="w-4 h-4 text-[#8B5E3C]" />
          </div>
          <div className="text-2xl font-black text-[#1B3A6B]">
            {kpis?.totalInquiries ?? '—'}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Free / Direct Deal</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Page Visits</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {trafficStats?.totalPageVisits ?? '—'}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            {trafficStats?.uniqueVisitors ?? '—'} Unique Visitors
          </div>
        </div>

        <div
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 hover:shadow-md transition-all"
          onClick={() => setActiveTab('adverts')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveTab('adverts')}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Adverts</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis?.totalActiveAdverts ?? adverts.filter((a) => a.isActive).length}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Click to manage campaigns →</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analytics & Trends</span>
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'providers'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Supplier Verification ({providers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Moderation & Listings ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('adverts')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'adverts'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Advert Banners ({adverts.length})</span>
        </button>
      </div>

      {/* Tab 1: Real Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {analyticsLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Refreshing analytics from database...
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Monthly Chart */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Monthly Inquiries & Listing Growth
                </h3>
                <p className="text-xs text-slate-500">
                  Direct connections facilitated across Tanzania — last 6 months.
                </p>
              </div>

              <div className="h-72 w-full">
                {monthlyData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    {analyticsLoading ? 'Loading...' : 'No data yet — activity will appear here as users engage.'}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderRadius: '12px',
                          color: '#FFF',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="inquiries" fill="#1B3A6B" radius={[6, 6, 0, 0]} name="Inquiries" />
                      <Bar dataKey="listings" fill="#2E86D8" radius={[6, 6, 0, 0]} name="New Listings" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Categories Pie Chart */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Listings by Category</h3>
                <p className="text-xs text-slate-500">Active catalog distribution from DB.</p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                {categoryDistribution.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center">
                    {analyticsLoading ? 'Loading...' : 'No category data yet.'}
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution.slice(0, 6)}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryDistribution.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-1.5 pt-2">
                {categoryDistribution.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="truncate max-w-[120px]">{c.name}</span>
                    </span>
                    <span className="font-bold text-slate-900">{c.value} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1B3A6B]" />
                  Recent Platform Activity
                </h3>
                <p className="text-xs text-slate-500">Live feed from admin actions, inquiries, and new listings.</p>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">
                {analyticsLoading ? 'Loading activity...' : 'No recent activity recorded yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {activityIcon(act.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-700 font-medium truncate">{act.description}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(act.timestamp)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                      act.type === 'inquiry'
                        ? 'bg-blue-50 text-[#1B3A6B]'
                        : act.type === 'listing'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {act.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Providers Verification */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supplier & Contractor Verification Desk
              </h3>
              <p className="text-xs text-slate-500">
                Audit credentials, trade licenses (CRB / TBS), and toggle platform verification badges.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Provider / Business</th>
                  <th className="py-3 px-4">Role Type</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <img
                        src={logoImageUrl(p.logo)}
                        alt={p.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div>{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{p.businessName}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <ProviderTypeBadge type={p.providerType} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{p.location.region}</td>
                    <td className="py-3.5 px-4">
                      {p.isVerified ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleVerification(p)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          p.isVerified
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {p.isVerified ? 'Revoke' : 'Approve & Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Moderation & Listings */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Material Listings</h3>
              <p className="text-xs text-slate-500">Monitor pricing integrity and content quality.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Material / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <img
                        src={l.images[0]}
                        alt={l.title}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                      />
                      <span className="truncate max-w-[200px]">{l.title}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{l.category}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{l.providerName}</td>
                    <td className="py-3.5 px-4 font-bold text-[#1B3A6B]">
                      {l.price.toLocaleString()} TZS / {l.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{l.location.region}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteListing(l.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Adverts Management */}
      {activeTab === 'adverts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Banner Campaigns</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAdvertModalOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Add Campaign
            </Button>
          </div>

          {adverts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No advert campaigns yet.</p>
              <p className="text-xs text-slate-500 mt-1">Create your first promotional banner to get started.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setIsAdvertModalOpen(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Create Banner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adverts.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={cardImageUrl(ad.bannerUrl)}
                      alt={ad.title}
                      className="w-24 h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase bg-blue-50 text-[#1B3A6B] px-2 py-0.5 rounded-full">
                          {ad.position}
                        </span>
                        {ad.isActive ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Paused
                          </span>
                        )}
                        {ad.isPaid && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{ad.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ad.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-400">
                      Sponsor: {ad.sponsorName}
                      {ad.priceAmount != null ? ` • ${ad.priceAmount.toLocaleString()} TZS` : ''}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAdvert(ad)}
                        className="font-bold text-[#2E86D8] hover:text-[#1B3A6B]"
                      >
                        {ad.isActive ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAdvert(ad.id)}
                        className="font-bold text-rose-400 hover:text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Advert Modal */}
      <Modal
        isOpen={isAdvertModalOpen}
        onClose={() => setIsAdvertModalOpen(false)}
        title="Create Promotional Banner Advert"
        subtitle="Place featured partner advertising across the Ujenzi Link marketplace."
      >
        <form onSubmit={handleCreateAdvert} className="space-y-4">
          <Input
            label="Banner Headline *"
            placeholder="e.g. 15% Off Cement Bulk Orders This Month"
            value={adTitle}
            onChange={(e) => setAdTitle(e.target.value)}
            required
          />

          <Input
            label="Subtitle / Description"
            placeholder="e.g. Plan Moja direct manufacturer promotion with free site delivery."
            value={adSubtitle}
            onChange={(e) => setAdSubtitle(e.target.value)}
          />

          <ImageUpload
            label="Banner Image *"
            folderType="adverts"
            value={adImage}
            onChange={(val) => setAdImage(val as UploadedImage | null)}
            hint="Upload a promotional banner image (1200px max, auto-compressed)."
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Placement
              </label>
              <select
                value={adPosition}
                onChange={(e) => setAdPosition(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
              >
                <option value="hero">Hero Top Banner</option>
                <option value="sidebar">Sidebar Placement</option>
                <option value="footer">Footer Placement</option>
              </select>
            </div>
            <Input
              label="Target Link"
              placeholder="/contact or https://..."
              value={adLinkUrl}
              onChange={(e) => setAdLinkUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={adStartDate}
              onChange={(e) => setAdStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={adEndDate}
              onChange={(e) => setAdEndDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={adIsPaid}
                onChange={(e) => setAdIsPaid(e.target.checked)}
                className="rounded border-slate-300 text-[#1B3A6B] focus:ring-[#1B3A6B]"
              />
              Mark as paid (billing ready)
            </label>
            <Input
              label="Price Amount (TZS)"
              type="number"
              min="0"
              placeholder="e.g. 50000"
              value={adPriceAmount}
              onChange={(e) => setAdPriceAmount(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsAdvertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Launch Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
