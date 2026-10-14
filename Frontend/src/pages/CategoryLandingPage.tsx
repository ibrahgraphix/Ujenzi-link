import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import { Listing, Category } from '../types';
import { getListings } from '../services/listingsService';
import { getCategories } from '../services/categoriesService';
import { getRegions } from '../services/locationsService';
import { ListingCard } from '../components/common/ListingCard';
import { Seo } from '../components/common/Seo';
import { Button } from '../components/common/Button';
import { generateListingAltText } from '../utils/altText';
import { useInquiry } from '../App';
import { createSlugWithId, generateListingSlug, getShortId } from '../utils/slug';

export const CategoryLandingPage: React.FC = () => {
  const { categorySlug = '', regionSlug } = useParams<{ categorySlug: string; regionSlug?: string }>();
  const navigate = useNavigate();
  const { open: openInquiry } = useInquiry();

  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSelectListing = (listing: Listing) => {
    const slug = createSlugWithId(
      generateListingSlug(listing.title, listing.location?.region || ''),
      getShortId(listing.id)
    );
    navigate(`/listings/${slug}`, { state: { listingId: listing.id } });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const allCats = await getCategories();
      setCategories(allCats);

      const matchedCategory = allCats.find(
        (c) => c.slug === categorySlug || c.name.toLowerCase() === categorySlug.toLowerCase()
      );
      setCategory(matchedCategory || null);

      if (matchedCategory) {
        const filters: any = { category: matchedCategory.name };
        if (regionSlug) {
          filters.region = regionSlug.replace(/-/g, ' ');
        }
        const listingsData = await getListings(filters);
        setListings(listingsData);
      }

      const regs = await getRegions();
      setRegions(regs);

      setIsLoading(false);
    };

    loadData();
  }, [categorySlug, regionSlug]);

  const shouldNoindex = !isLoading && listings.length === 0;

  const getSeoTitle = () => {
    if (!category) return 'Category Not Found';
    if (regionSlug) {
      const regionName = regionSlug.replace(/-/g, ' ');
      return `${category.name} in ${regionName} | Ujenzi Link`;
    }
    return `${category.name} Suppliers & Materials | Ujenzi Link`;
  };

  const getSeoDescription = () => {
    if (!category) return 'Category not found.';
    if (regionSlug) {
      const regionName = regionSlug.replace(/-/g, ' ');
      return `Find ${category.name.toLowerCase()} in ${regionName}, Tanzania. Verified suppliers, competitive prices, and direct delivery to your construction site.`;
    }
    return `Browse ${category.name.toLowerCase()} from verified suppliers across Tanzania. Compare prices, check availability, and connect directly with suppliers.`;
  };

  const getCanonicalPath = () => {
    if (regionSlug) return `/category/${categorySlug}/${regionSlug}`;
    return `/category/${categorySlug}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#2E86D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <>
        <Seo title="Category Not Found" description="The requested category does not exist." canonicalPath="/materials" noindex />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Category Not Found</h1>
          <Button variant="primary" onClick={() => navigate('/materials')}>Browse All Categories</Button>
        </div>
      </>
    );
  }

  const regionName = regionSlug ? regionSlug.replace(/-/g, ' ') : null;

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
            {regionName ? `${category.name} in ${regionName}` : category.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {regionName
              ? `Find verified ${category.name.toLowerCase()} suppliers in ${regionName}, Tanzania. Direct factory and depot prices with site delivery available.`
              : category.description}
          </p>
        </div>

        {/* Listings */}
        {listings.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Available {category.name} ({listings.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={handleSelectListing}
                  onContactSupplier={(l) => openInquiry(l)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-slate-600 mb-4">
              No {category.name.toLowerCase()} currently available{regionName ? ` in ${regionName}` : ''}.
            </p>
            <Button variant="outline" onClick={() => navigate('/materials')}>Browse All Listings</Button>
          </div>
        )}

        {/* Related Regions */}
        {!regionSlug && regions.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{category.name} by Region</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {regions.slice(0, 8).map((region) => {
                const slug = region.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Link
                    key={region}
                    to={`/category/${categorySlug}/${slug}`}
                    className="text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-[#2E86D8] hover:text-[#1B3A6B] text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#2E86D8] shrink-0" />
                    {region}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Related Categories */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Related Categories</h3>
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
