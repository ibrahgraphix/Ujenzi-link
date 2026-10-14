import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { Provider, Category } from '../types';
import { getProviders } from '../services/providersService';
import { getCategories } from '../services/categoriesService';
import { getRegions } from '../services/locationsService';
import { ProviderTypeBadge, VerifiedBadge } from '../components/common/Badge';
import { Seo } from '../components/common/Seo';
import { Button } from '../components/common/Button';
import { createSlugWithId, generateProviderSlug, getShortId } from '../utils/slug';
import { useInquiry } from '../App';

export const RegionLandingPage: React.FC = () => {
  const { regionSlug = '', categorySlug } = useParams<{ regionSlug: string; categorySlug?: string }>();
  const navigate = useNavigate();
  const { open: openInquiry } = useInquiry();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectProvider = (provider: Provider) => {
    const slug = createSlugWithId(
      generateProviderSlug(provider.name, provider.businessName, provider.location?.region || ''),
      getShortId(provider.id)
    );
    navigate(`/suppliers/${slug}`, { state: { providerId: provider.id } });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const regionName = regionSlug.replace(/-/g, ' ');
      const filters: any = { region: regionName };
      const providersData = await getProviders(filters);
      setProviders(providersData);

      const cats = await getCategories();
      setCategories(cats);

      const regs = await getRegions();
      setRegions(regs);

      setIsLoading(false);
    };
    loadData();
  }, [regionSlug, categorySlug]);

  const shouldNoindex = !isLoading && providers.length === 0;
  const regionName = regionSlug.replace(/-/g, ' ');

  const getSeoTitle = () => {
    if (categorySlug) return `Suppliers in ${regionName} | Ujenzi Link`;
    return `Construction Suppliers & Contractors in ${regionName} | Ujenzi Link`;
  };

  const getSeoDescription = () =>
    `Find verified construction suppliers, contractors, and service providers in ${regionName}, Tanzania. Connect directly with local businesses for materials and services.`;

  const getCanonicalPath = () => {
    if (categorySlug) return `/region/${regionSlug}/${categorySlug}`;
    return `/region/${regionSlug}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#2E86D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={getSeoTitle()}
        description={getSeoDescription()}
        canonicalPath={getCanonicalPath()}
        noindex={shouldNoindex}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
            Suppliers &amp; Contractors in {regionName}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Connect with verified construction suppliers, contractors, and service providers in {regionName}, Tanzania.
            Direct contact, competitive pricing, and reliable service for your construction projects.
          </p>
        </div>

        {/* Providers */}
        {providers.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Verified Suppliers ({providers.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => handleSelectProvider(provider)}
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
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{provider.bio}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSelectProvider(provider); }}
                      className="w-full py-2.5 px-3 bg-[#1B3A6B] hover:bg-[#12284C] text-white text-xs font-semibold rounded-xl text-center transition-colors"
                    >
                      View Profile &amp; Catalog
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-slate-600 mb-4">No suppliers currently available in {regionName}.</p>
            <Button variant="outline" onClick={() => navigate('/suppliers')}>Browse All Suppliers</Button>
          </div>
        )}

        {/* Related Regions */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Other Regions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {regions.slice(0, 8).map((region) => {
              const slug = region.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={region}
                  to={`/region/${slug}`}
                  className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#2E86D8] hover:text-[#1B3A6B] text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#2E86D8] shrink-0" />
                  {region}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Related Categories */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#2E86D8] hover:text-[#1B3A6B] text-sm font-medium transition-colors block"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
