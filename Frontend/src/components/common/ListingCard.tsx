import React from 'react';
import { MapPin, Heart, MessageSquare, Phone, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Listing } from '../../types';
import { ProviderTypeBadge, VerifiedBadge } from './Badge';
import { useAuth } from '../../context/AuthContext';
import { cardImageUrl } from '../../utils/imagekit';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onContactSupplier?: (listing: Listing) => void;
  layout?: 'grid' | 'list';
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onContactSupplier,
  layout = 'grid',
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const favorited = isFavorite(listing.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: listing.currency || 'TZS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContactSupplier) {
      onContactSupplier(listing);
    } else {
      onSelect(listing);
    }
  };

  const primaryImage = listing.images && listing.images.length > 0
    ? cardImageUrl(listing.images[0])
    : cardImageUrl('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80');

  if (layout === 'list') {
    return (
      <div
        onClick={() => onSelect(listing)}
        className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-200 hover:border-[#2E86D8]/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="relative sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden bg-slate-100">
          <img
            src={primaryImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              favorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
            }`}
            title={favorited ? 'Remove from saved' : 'Save listing'}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
          </button>
          <div className="absolute bottom-2 left-2">
            <span className="bg-slate-950/75 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
              {listing.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <ProviderTypeBadge type={listing.providerType} size="xs" />
              {listing.isVerified && <VerifiedBadge size="sm" showText={true} />}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1B3A6B] transition-colors line-clamp-2 mb-1.5">
              {listing.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-3">
              {listing.description}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#2E86D8] shrink-0" />
              <span className="truncate">
                {listing.location.ward ? `${listing.location.ward}, ` : ''}
                {listing.location.district ? `${listing.location.district}, ` : ''}
                {listing.location.region}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <div>
                <div className="text-xs text-slate-400 font-medium">Price / Rate</div>
                <div className="text-base sm:text-lg font-extrabold text-[#1B3A6B]">
                  {formatPrice(listing.price)}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ {listing.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleContactClick}
                  className="px-3.5 py-1.5 bg-[#2E86D8] hover:bg-[#1F72C0] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-[#2E86D8]/50 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden h-full"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            favorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={favorited ? 'Remove from saved' : 'Save listing'}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="bg-[#1B3A6B]/90 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
            {listing.category}
          </span>
        </div>

        {listing.isVerified && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-emerald-900/90 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ProviderTypeBadge type={listing.providerType} size="xs" />
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#1B3A6B] transition-colors line-clamp-2 mb-1">
            {listing.title}
          </h3>

          <div className="text-xs text-slate-500 font-medium truncate mb-2">
            By <span className="text-slate-800">{listing.providerName}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#2E86D8] shrink-0" />
            <span className="truncate">
              {listing.location.district ? `${listing.location.district}, ` : ''}
              {listing.location.region}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Price</div>
              <div className="text-sm sm:text-base font-extrabold text-[#1B3A6B]">
                {formatPrice(listing.price)}
                <span className="text-[10px] font-normal text-slate-500 block sm:inline sm:ml-1">
                  / {listing.unit}
                </span>
              </div>
            </div>

            <button
              onClick={handleContactClick}
              className="p-2 sm:px-3 sm:py-1.5 bg-[#2E86D8]/10 hover:bg-[#2E86D8] text-[#2E86D8] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Contact Supplier"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
