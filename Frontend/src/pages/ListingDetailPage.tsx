import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  Building,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Truck,
  Package,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Star,
} from 'lucide-react';
import { Listing, Provider } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { ProviderTypeBadge, VerifiedBadge } from '../components/common/Badge';
import { ListingCard } from '../components/common/ListingCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ListingDetailPageProps {
  listingId: string;
  onBack: () => void;
  onSelectListing: (listing: Listing) => void;
  onSelectProvider: (provider: Provider) => void;
  onOpenInquiry: (listing: Listing, provider?: Provider) => void;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({
  listingId,
  onBack,
  onSelectListing,
  onSelectProvider,
  onOpenInquiry,
}) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const { success, info } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadListingDetails = async () => {
      setIsLoading(true);
      const current = await api.getListingById(listingId);
      if (current) {
        setListing(current);
        const [prov, allListings] = await Promise.all([
          api.getProviderById(current.providerId),
          api.getListings({ category: current.category }),
        ]);
        setProvider(prov);
        setRelatedListings(allListings.filter((l) => l.id !== current.id).slice(0, 3));
      }
      setIsLoading(false);
    };
    loadListingDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [listingId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#2E86D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading building material details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-sm text-slate-500">The requested material or service may have been unlisted or removed.</p>
        <Button variant="primary" onClick={onBack}>
          Back to Listings
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: listing.currency || 'TZS',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Listing URL copied to your clipboard!');
    }
  };

  const handleWhatsApp = () => {
    const rawNum = provider?.whatsapp || '255755890123';
    const cleanNum = rawNum.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Habari ${listing.providerName},\nI found your listing on *Ujenzi Link* (Plan Moja Company Ltd):\n\n*Item:* ${listing.title}\n*Price:* ${formatPrice(listing.price)} / ${listing.unit}\n\nI would like to inquire about delivery to my site and availability.`
    );
    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    const phone = provider?.phone || '+255755890123';
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const favorited = isFavorite(listing.id);
  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1B3A6B] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(listing.id)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              favorited
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{favorited ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Hero Grid: Gallery & Purchase Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-[#1B3A6B]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {listing.category}
              </span>
            </div>
            {listing.isVerified && (
              <div className="absolute top-4 right-4">
                <VerifiedBadge size="md" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#2E86D8] scale-95 shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Location Hierarchy Box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MapPin className="w-4 h-4 text-[#2E86D8]" />
              <span>Material / Service Location in Tanzania</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Country: {listing.location.country}</span>
              <span className="text-slate-400">›</span>
              <span className="bg-blue-50 text-[#1B3A6B] px-2.5 py-1 rounded-lg font-bold">Region: {listing.location.region}</span>
              {listing.location.district && (
                <>
                  <span className="text-slate-400">›</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">District: {listing.location.district}</span>
                </>
              )}
              {listing.location.ward && (
                <>
                  <span className="text-slate-400">›</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Ward: {listing.location.ward}</span>
                </>
              )}
              {listing.location.street && (
                <>
                  <span className="text-slate-400">›</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Street: {listing.location.street}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Listing Details & Direct Contact */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <ProviderTypeBadge type={listing.providerType} size="sm" />
                <span className="text-xs text-slate-500 font-medium">
                  Listed {listing.createdAt}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading leading-snug mb-3">
                {listing.title}
              </h1>

              {/* Price card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100">
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Direct Supplier Price</div>
                <div className="text-2xl sm:text-3xl font-black text-[#1B3A6B] mt-0.5">
                  {formatPrice(listing.price)}
                  <span className="text-sm font-normal text-slate-600 ml-2">/ {listing.unit}</span>
                </div>
              </div>
            </div>

            {/* Quick logistical specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Package className="w-3.5 h-3.5 text-[#1B3A6B]" />
                  <span>Min. Order Quantity</span>
                </div>
                <div className="font-bold text-slate-800">{listing.minOrderQuantity || '1 Unit'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Truck className="w-3.5 h-3.5 text-[#2E86D8]" />
                  <span>Site Delivery</span>
                </div>
                <div className="font-bold text-slate-800">
                  {listing.deliveryAvailable ? 'Available on request' : 'Self Pickup'}
                </div>
              </div>
            </div>

            {/* Direct Connect Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => onOpenInquiry(listing, provider || undefined)}
                leftIcon={<MessageSquare className="w-5 h-5" />}
              >
                Request Quote / Inquire Now
              </Button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleWhatsApp}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCall}
                  className="py-3 px-4 rounded-xl bg-white border-2 border-slate-300 hover:border-[#1B3A6B] text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#1B3A6B]" />
                  <span>Call Phone</span>
                </button>
              </div>
            </div>

            {/* Supplier Profile Card Mini */}
            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Offered By
                </span>
                {provider && (
                  <button
                    onClick={() => onSelectProvider(provider)}
                    className="text-xs text-[#2E86D8] hover:text-[#1B3A6B] font-bold flex items-center gap-1"
                  >
                    <span>View Full Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div
                onClick={() => provider && onSelectProvider(provider)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-[#2E86D8] cursor-pointer transition-colors"
              >
                <img
                  src={provider?.logo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=150&q=80'}
                  alt={listing.providerName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {listing.providerName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {provider?.businessName || listing.providerType}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Partner
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-600 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {provider?.rating || 4.9}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safe deal notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Safety Tip:</strong> Inspect building materials upon site delivery before settling payment with the supplier.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Material Overview & Application
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </div>

        {listing.specifications && Object.keys(listing.specifications).length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Technical Specifications & TBS Standards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(listing.specifications).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="font-bold text-slate-900 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related listings */}
      {relatedListings.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">
              Similar Materials & Services
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedListings.map((rel) => (
              <ListingCard
                key={rel.id}
                listing={rel}
                onSelect={onSelectListing}
                onContactSupplier={onOpenInquiry}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
