import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Building2,
  Phone,
  MessageSquare,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { Provider, ProviderType } from '../types';
import { api } from '../services/api';
import { ProviderTypeBadge, VerifiedBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TANZANIA_LOCATIONS } from '../data/mockData';

interface ProvidersDirectoryPageProps {
  initialType?: string;
  onSelectProvider: (provider: Provider) => void;
  onOpenInquiry: (listing?: any, provider?: Provider) => void;
}

const PROVIDER_ROLES: { label: string; value: ProviderType | 'all' }[] = [
  { label: 'All Trades & Suppliers', value: 'all' },
  { label: 'Manufacturers / Mills', value: 'Manufacturer/Wholesaler' },
  { label: 'Retailers / Depots', value: 'Retailer/Supplier' },
  { label: 'Civil & Building Contractors', value: 'Contractor' },
  { label: 'Consultants & Engineers', value: 'Consultant' },
  { label: 'Electricians & Technicians', value: 'Technician' },
  { label: 'Masons & Site Artisans', value: 'Casual Labourer' },
];

export const ProvidersDirectoryPage: React.FC<ProvidersDirectoryPageProps> = ({
  initialType = 'all',
  onSelectProvider,
  onOpenInquiry,
}) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const all = await api.getProviders();
      setProviders(all);
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredProviders = providers.filter((p) => {
    if (selectedType !== 'all' && p.providerType !== selectedType) return false;
    if (selectedRegion && p.location.region.toLowerCase() !== selectedRegion.toLowerCase()) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.businessName.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block">
          Directory of Building Professionals
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Verified Construction Suppliers & Contractors in Tanzania
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Find verified manufacturers, hardware shops, CRB contractors, structural engineers, electricians, and experienced site artisans.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search provider by name, specialization, or trade..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2E86D8]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
            >
              {PROVIDER_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
            >
              <option value="">All Tanzania Regions</option>
              {TANZANIA_LOCATIONS.regions.map((reg) => (
                <option key={reg.name} value={reg.name}>
                  {reg.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Provider Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-[#2E86D8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading verified providers...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-sm font-bold text-slate-700">No providers matched your filter criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try switching to "All Trades & Suppliers" or clearing the region.</p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedRegion('');
              setQuery('');
            }}
            className="mt-4 px-4 py-2 bg-[#1B3A6B] text-white text-xs font-semibold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => onSelectProvider(provider)}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#1B3A6B] hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <ProviderTypeBadge type={provider.providerType} size="xs" />
                      {provider.isVerified && <VerifiedBadge size="sm" showText={false} />}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 truncate hover:text-[#1B3A6B]">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{provider.businessName}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {provider.bio}
                </p>

                {provider.specialties && provider.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.specialties.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{provider.rating}</span>
                    <span className="font-normal text-slate-400">({provider.reviewsCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 truncate max-w-[150px]">
                    <MapPin className="w-3.5 h-3.5 text-[#2E86D8] shrink-0" />
                    <span className="truncate">{provider.location.region}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInquiry(undefined, provider);
                    }}
                    className="py-2 px-3 bg-[#1B3A6B] hover:bg-[#12284C] text-white text-xs font-semibold rounded-xl text-center transition-colors"
                  >
                    Inquire
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProvider(provider);
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl text-center transition-colors"
                  >
                    View Catalog
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
