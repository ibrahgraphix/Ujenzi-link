import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Building2,
  HardHat,
  Truck,
  Phone,
  MessageSquare,
  ArrowRight,
  Layers,
  Trees,
  Home,
  Wrench,
  Zap,
  Palette,
  Compass,
  Users,
  CheckCircle2,
  Star,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Listing, Provider, Category, Advert } from '../types';
import { api } from '../services/api';
import { ListingCard } from '../components/common/ListingCard';
import { Button } from '../components/common/Button';
import { AdvertBanner } from '../components/common/AdvertBanner';
import { TANZANIA_LOCATIONS } from '../data/mockData';
import { VerifiedBadge, ProviderTypeBadge } from '../components/common/Badge';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onSelectListing: (listing: Listing) => void;
  onSelectProvider: (provider: Provider) => void;
  onOpenInquiry: (listing: Listing) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectListing,
  onSelectProvider,
  onOpenInquiry,
}) => {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroAdvert, setHeroAdvert] = useState<Advert | null>(null);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      const [allListings, allProviders, allCats, allAds] = await Promise.all([
        api.getListings(),
        api.getProviders(),
        api.getCategories(),
        api.getAdverts(),
      ]);

      setFeaturedListings(allListings.slice(0, 6));
      setProviders(allProviders.slice(0, 4));
      setCategories(allCats);
      const activeAd = allAds.find((a) => a.isActive && a.position === 'hero') || allAds[0] || null;
      setHeroAdvert(activeAd);
    };
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('listings', {
      query: searchQuery,
      region: selectedRegion || undefined,
      district: selectedDistrict || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-6 h-6 text-[#1B3A6B]" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-[#1B3A6B]" />;
      case 'Trees': return <Trees className="w-6 h-6 text-[#8B5E3C]" />;
      case 'Home': return <Home className="w-6 h-6 text-[#2E86D8]" />;
      case 'Wrench': return <Wrench className="w-6 h-6 text-[#2E86D8]" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-500" />;
      case 'Palette': return <Palette className="w-6 h-6 text-rose-500" />;
      case 'Truck': return <Truck className="w-6 h-6 text-slate-700" />;
      case 'HardHat': return <HardHat className="w-6 h-6 text-[#8B5E3C]" />;
      case 'Compass': return <Compass className="w-6 h-6 text-[#1B3A6B]" />;
      case 'Users': return <Users className="w-6 h-6 text-emerald-600" />;
      default: return <Layers className="w-6 h-6 text-[#1B3A6B]" />;
    }
  };

  const regionData = TANZANIA_LOCATIONS.regions.find((r) => r.name === selectedRegion);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#12284C] via-[#1B3A6B] to-[#12284C] text-white pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2E86D8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8B5E3C]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Tagline / Company Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-blue-200">
              Plan Moja Company Ltd • <strong className="text-amber-300">"Build Quality For Less"</strong>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-tight">
            Connect Directly with Verified Construction Suppliers Across Tanzania
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Find cement, TMT steel, roofing sheets, heavy equipment, registered contractors, consulting engineers, and skilled artisans in your district. Zero broker markups.
          </p>

          {/* Prominent Search Bar Container */}
          <div className="pt-4 max-w-4xl mx-auto text-left">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-slate-200 text-slate-800 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Term */}
                <div className="md:col-span-5 relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    What do you need?
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Dangote Cement, 12mm Rebar, Contractor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
                    />
                  </div>
                </div>

                {/* Region */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Region
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-[#2E86D8] absolute left-3 pointer-events-none" />
                    <select
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedDistrict('');
                      }}
                      className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20 bg-white"
                    >
                      <option value="">All Regions</option>
                      {TANZANIA_LOCATIONS.regions.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* District */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedRegion}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{selectedRegion ? 'All Districts' : 'Select Region'}</option>
                    {regionData?.districts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="md:col-span-2 pt-2 md:pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold">Trending:</span>
                {['Cement 42.5R', '12mm Steel Rebar', 'Roofing Tiles', 'Civil Contractor', 'Architects'].map((pill) => (
                  <button
                    type="button"
                    key={pill}
                    onClick={() => {
                      setSearchQuery(pill);
                      onNavigate('listings', { query: pill });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#2E86D8]/10 hover:text-[#1B3A6B] text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Trust stats counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-center">
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-white font-heading">500+</div>
              <div className="text-xs text-blue-200 font-medium">Verified Suppliers</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-white font-heading">100%</div>
              <div className="text-xs text-blue-200 font-medium">Direct Supplier Rates</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-white font-heading">6+</div>
              <div className="text-xs text-blue-200 font-medium">Major Regions</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <div className="text-xl sm:text-2xl font-black text-white font-heading">0%</div>
              <div className="text-xs text-blue-200 font-medium">Middleman Fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
            Simple 4-Step Connection
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            How Ujenzi Link Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            No complicated middlemen or payment escrows. Search what you need, find nearby suppliers, and deal directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#1B3A6B] text-white font-black text-lg flex items-center justify-center mb-4 shadow-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Search Material or Trade</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Type what you need: bulk cement, deformed rebar, stone-coated roofing, or certified contractors.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#2E86D8] text-white font-black text-lg flex items-center justify-center mb-4 shadow-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Filter by Local Location</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select your Region, District, Ward, and Street to find suppliers located close to your site.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-[#8B5E3C] text-white font-black text-lg flex items-center justify-center mb-4 shadow-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Direct Phone & WhatsApp</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Call suppliers immediately, send an inquiry with BOQ specs, or chat directly via WhatsApp.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative flex flex-col items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-lg flex items-center justify-center mb-4 shadow-sm">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">Build Quality For Less</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive direct site delivery, negotiate wholesale discounts, and achieve superior construction.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROMOTIONAL ADVERT */}
      {heroAdvert && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdvertBanner
            advert={heroAdvert}
            onNavigate={(url) => onNavigate('contact')}
          />
        </section>
      )}

      {/* 4. FEATURED CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
              Explore Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Popular Building Categories
            </h2>
          </div>
          <button
            onClick={() => onNavigate('listings')}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#1B3A6B] hover:text-[#2E86D8] transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onNavigate('listings', { category: category.name })}
              className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-[#2E86D8] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getCategoryIcon(category.iconName)}
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {category.itemCount}+
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1B3A6B] transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2E86D8] group-hover:translate-x-1 transition-transform">
                <span>Browse listings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED LISTINGS / MATERIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
              Direct From Suppliers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Featured Materials & Services
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('listings')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Marketplace
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={onSelectListing}
              onContactSupplier={onOpenInquiry}
            />
          ))}
        </div>
      </section>

      {/* 6. VERIFIED SUPPLIERS & CONTRACTORS CAROUSEL/SHOWCASE */}
      <section className="bg-slate-100/70 py-12 sm:py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B5E3C] block mb-1">
              Vetted & Trusted
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Featured Verified Partners
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Browse profiles, verified registrations, reviews, and active product catalogs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => onSelectProvider(provider)}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#1B3A6B] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate hover:text-[#1B3A6B]">
                        {provider.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{provider.businessName}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <ProviderTypeBadge type={provider.providerType} size="xs" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {provider.bio}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{provider.rating}</span>
                      <span>({provider.reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#2E86D8]" />
                      <span>{provider.location.region}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProvider(provider);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-[#1B3A6B] text-slate-800 hover:text-white rounded-xl text-xs font-semibold transition-colors text-center"
                  >
                    View Profile & Catalog
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('providers')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse All Providers & Craftsmen
            </Button>
          </div>
        </div>
      </section>

      {/* 7. SUPPLIER ONBOARDING CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B3A6B] via-[#12284C] to-[#8B5E3C] text-white p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-400/30">
                Are You A Supplier, Contractor, or Artisan?
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white leading-tight">
                Grow Your Construction Business with Ujenzi Link
              </h2>
              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Reach thousands of active property developers, building engineers, and homeowners across Dar es Salaam, Arusha, Dodoma, and beyond. Create your digital shopfront in minutes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free Product Listings</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct Customer Contacts</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Transaction Cuts</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Button
                variant="white"
                size="lg"
                onClick={() => onNavigate('auth', { initialType: 'provider' })}
                leftIcon={<HardHat className="w-5 h-5 text-[#1B3A6B]" />}
              >
                Register Your Business Free
              </Button>
              <button
                onClick={() => onNavigate('about')}
                className="text-center text-xs text-blue-200 hover:text-white py-2 underline"
              >
                Learn more about Plan Moja Company Ltd
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
