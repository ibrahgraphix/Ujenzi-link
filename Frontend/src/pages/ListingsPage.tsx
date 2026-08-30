import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  MapPin,
  X,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  Building,
} from 'lucide-react';
import { Listing, Category, ProviderType, LocationHierarchy } from '../types';
import { getListings, ListingFilterParams } from '../services/listingsService';
import { getCategories } from '../services/categoriesService';
import { ListingCard } from '../components/common/ListingCard';
import { LocationSelector } from '../components/common/LocationSelector';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

interface ListingsPageProps {
  initialQuery?: string;
  initialCategory?: string;
  initialRegion?: string;
  initialDistrict?: string;
  onSelectListing: (listing: Listing) => void;
  onOpenInquiry: (listing: Listing) => void;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const PROVIDER_TYPES: { label: string; value: ProviderType | 'all' }[] = [
  { label: 'All Suppliers & Trades', value: 'all' },
  { label: 'Manufacturers & Mills', value: 'Manufacturer/Wholesaler' },
  { label: 'Retailers & Hardware Stores', value: 'Retailer/Supplier' },
  { label: 'Building Contractors', value: 'Contractor' },
  { label: 'Engineers & Consultants', value: 'Consultant' },
  { label: 'Electricians & Technicians', value: 'Technician' },
  { label: 'Masons & Site Labour', value: 'Casual Labourer' },
];

export const ListingsPage: React.FC<ListingsPageProps> = ({
  initialQuery = '',
  initialCategory = 'all',
  initialRegion = '',
  initialDistrict = '',
  onSelectListing,
  onOpenInquiry,
  onNavigate,
}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState<LocationHierarchy>({
    country: 'Tanzania',
    region: initialRegion,
    district: initialDistrict,
  });
  const [providerType, setProviderType] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<ListingFilterParams['sortBy']>('newest');

  // UI state
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const fetchFilteredListings = async () => {
    setIsLoading(true);
    const params: ListingFilterParams = {
      query: query || undefined,
      category: category !== 'all' ? category : undefined,
      region: location.region || undefined,
      county: location.county || undefined,
      district: location.district || undefined,
      ward: location.ward || undefined,
      providerType: providerType !== 'all' ? providerType : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      verifiedOnly: verifiedOnly || undefined,
      sortBy,
    };

    const results = await getListings(params);
    setListings(results);
    setCurrentPage(1);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFilteredListings();
  }, [query, category, location, providerType, minPrice, maxPrice, verifiedOnly, sortBy]);

  const handleResetFilters = () => {
    setQuery('');
    setCategory('all');
    setLocation({ country: 'Tanzania', region: '', district: '', ward: '', street: '' });
    setProviderType('all');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setSortBy('newest');
  };

  // Pagination slicing
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const displayedListings = listings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search materials, steel bars, cement, roofing, plumbing, contractors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#2E86D8] focus:outline-none focus:ring-4 focus:ring-[#2E86D8]/10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-between md:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2E86D8]"
              >
                <option value="newest">Latest Uploads</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated Suppliers</option>
                <option value="popular">Most Inquired</option>
              </select>
            </div>

            {/* View Layout Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layout === 'grid' ? 'bg-white shadow-xs text-[#1B3A6B]' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  layout === 'list' ? 'bg-white shadow-xs text-[#1B3A6B]' : 'text-slate-500'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile filter button trigger */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-3 py-2 bg-[#1B3A6B] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1B3A6B]" />
                <h3 className="font-bold text-slate-900 text-sm">Refine Results</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#2E86D8] hover:text-[#1B3A6B] font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Location Filter */}
            <div>
              <LocationSelector
                value={location}
                onChange={setLocation}
                showAllLevels={true}
                compact={true}
              />
            </div>

            {/* Category Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Category
              </label>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => setCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    category === 'all'
                      ? 'bg-blue-50 text-[#1B3A6B] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      category === cat.name
                        ? 'bg-blue-50 text-[#1B3A6B] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{cat.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Supplier / Provider Type */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Supplier / Provider Type
              </label>
              <div className="space-y-1">
                {PROVIDER_TYPES.map((pt) => (
                  <label
                    key={pt.value}
                    className="flex items-center gap-2 text-xs text-slate-700 hover:text-[#1B3A6B] cursor-pointer py-1"
                  >
                    <input
                      type="radio"
                      name="providerType"
                      checked={providerType === pt.value}
                      onChange={() => setProviderType(pt.value)}
                      className="text-[#1B3A6B] focus:ring-[#1B3A6B]"
                    />
                    <span>{pt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Price Range (TZS)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#2E86D8] focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-[#2E86D8] focus:outline-none"
                />
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#1B3A6B] focus:ring-[#1B3A6B] w-4 h-4"
                />
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Suppliers Only</span>
                </div>
              </label>
            </div>
          </div>
        </aside>

        {/* Listings Display Column */}
        <main className="lg:col-span-9 space-y-6">
          {/* Active Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{listings.length}</strong> items in Tanzania
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1B3A6B] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                  Category: {category}
                  <button onClick={() => setCategory('all')}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                  </button>
                </span>
              )}

              {location.region && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1B3A6B] text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                  Region: {location.region}
                  <button onClick={() => setLocation({ country: 'Tanzania', region: '' })}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                  </button>
                </span>
              )}

              {verifiedOnly && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                  Verified Only
                  <button onClick={() => setVerifiedOnly(false)}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-700" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Results Grid / List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              title="No construction materials or services matched your search"
              description="Try adjusting your keywords, expanding your region selection, or clearing price limits."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div
              className={
                layout === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {displayedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  layout={layout}
                  onSelect={onSelectListing}
                  onContactSupplier={onOpenInquiry}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === pg
                      ? 'bg-[#1B3A6B] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto p-4 sm:p-6 lg:hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
            <h3 className="font-bold text-slate-900 text-base">Filter Search Results</h3>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <LocationSelector
              value={location}
              onChange={setLocation}
              showAllLevels={true}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.itemCount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Provider Type
              </label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {PROVIDER_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#1B3A6B] w-4 h-4"
                />
                <span className="text-sm font-semibold text-slate-800">Verified Suppliers Only</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex gap-3 mt-6">
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
