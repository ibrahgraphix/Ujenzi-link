import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  ShieldCheck,
  Star,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Share2,
  PlusCircle,
} from 'lucide-react';
import { Provider, Listing, Review } from '../types';
import { getProviderById } from '../services/providersService';
import { getListings } from '../services/listingsService';
import { getReviews, addReview } from '../services/reviewsService';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/common/ListingCard';
import { ProviderTypeBadge, VerifiedBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { logoImageUrl } from '../utils/imagekit';

interface ProviderProfilePageProps {
  providerId: string;
  onBack: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenInquiry: (listing?: Listing, provider?: Provider) => void;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const ProviderProfilePage: React.FC<ProviderProfilePageProps> = ({
  providerId,
  onBack,
  onSelectListing,
  onOpenInquiry,
  onNavigate,
}) => {
  const { success, error } = useToast();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewLocation, setReviewLocation] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewProjectType, setReviewProjectType] = useState('');

  useEffect(() => {
    const loadProvider = async () => {
      setIsLoading(true);
      const prov = await getProviderById(providerId);
      if (prov) {
        setProvider(prov);
        const [provListings, provReviews] = await Promise.all([
          getListings({ providerId: prov.id }),
          getReviews(prov.id),
        ]);
        setListings(provListings);
        setReviews(provReviews);
      }
      setIsLoading(false);
    };
    loadProvider();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#2E86D8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading supplier shopfront profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Provider Profile Not Found</h2>
        <Button variant="primary" onClick={onBack}>
          Back
        </Button>
      </div>
    );
  }

  const handleWhatsApp = () => {
    const cleanNum = provider.whatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Habari ${provider.name},\nI saw your profile on *Ujenzi Link* (Plan Moja Company Ltd) and would like to inquire about your building supplies and contracting services.`
    );
    window.open(`https://wa.me/${cleanNum}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${provider.phone.replace(/\s+/g, '')}`;
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      error('Please provide your name and review comments.');
      return;
    }

    const newRev = await addReview({
      providerId: provider.id,
      authorName: reviewName,
      authorLocation: reviewLocation || 'Tanzania',
      rating: reviewRating,
      comment: reviewComment,
      projectType: reviewProjectType || 'Construction Site',
    });

    setReviews((prev) => [newRev, ...prev]);
    setIsReviewModalOpen(false);
    setReviewComment('');
    success('Thank you! Your verified client review has been posted.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1B3A6B] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Provider Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Cover banner */}
        <div className="h-40 sm:h-52 bg-gradient-to-r from-[#12284C] via-[#1B3A6B] to-[#2E86D8] relative p-6">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-black/30 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
              Member since {provider.joinedDate ? provider.joinedDate.split('T')[0] : ''}
            </span>
          </div>
        </div>

        {/* Profile Content Details */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={logoImageUrl(provider.logo)}
                alt={provider.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white shrink-0 -mt-12 sm:-mt-14"
              />
              <div className="pt-2 sm:pt-4">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <ProviderTypeBadge type={provider.providerType} size="sm" />
                  {provider.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  {provider.name}
                </h1>
                {provider.businessName &&
                  provider.businessName.trim().toLowerCase() !== provider.name.trim().toLowerCase() && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      {provider.businessName}
                    </p>
                  )}
              </div>
            </div>

            {/* Direct Connect Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto pt-2 sm:pt-4">
              <button
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCall}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:border-[#1B3A6B] text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#1B3A6B]" />
                <span>Call</span>
              </button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#2E86D8] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Physical Location</div>
                <div className="text-slate-500 mt-0.5">{provider.address}</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">Direct Email</div>
                <div className="text-slate-500 mt-0.5 truncate">{provider.email}</div>
              </div>
            </div>
          </div>

          {/* Bio & Specialties */}
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
                About The Supplier / Contractor
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                {provider.bio}
              </p>
            </div>

            {provider.specialties && provider.specialties.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Specialties & Key Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 rounded-full bg-blue-50 text-[#1B3A6B] text-xs font-semibold border border-blue-100"
                    >
                      ✓ {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Listings / Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">
              Active Catalog & Materials ({listings.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct inventory available for dispatch from {provider.name}.
            </p>
          </div>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            This provider currently has no active public listings. Contact them directly using the button above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={onSelectListing}
                onContactSupplier={(l) => onOpenInquiry(l, provider)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">
              Client Feedback & Recommendations
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{provider.rating} out of 5</span>
              <span className="text-xs text-slate-500">({reviews.length} reviews)</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReviewModalOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Write Client Review
          </Button>
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No reviews written yet. Be the first to review {provider.name}!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1B3A6B] text-white text-xs font-bold flex items-center justify-center">
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{rev.authorName}</div>
                      {rev.authorLocation && (
                        <div className="text-[10px] text-slate-500">{rev.authorLocation}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[11px] text-slate-400 ml-1">{rev.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                {rev.projectType && (
                  <div className="text-[10px] text-[#2E86D8] font-semibold">
                    Project Scope: {rev.projectType}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review ${provider.name}`}
        subtitle="Share your experience working with this supplier or contractor."
      >
        <form onSubmit={handleAddReview} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Your Full Name *"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="e.g. Baraka Mrope"
              required
            />
            <Input
              label="Your Location"
              value={reviewLocation}
              onChange={(e) => setReviewLocation(e.target.value)}
              placeholder="e.g. Mikocheni, Dar es Salaam"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Rating
              </label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
              >
                <option value={5}>5 Stars - Excellent Quality & Prompt</option>
                <option value={4}>4 Stars - Very Good</option>
                <option value={3}>3 Stars - Satisfactory</option>
                <option value={2}>2 Stars - Subpar</option>
                <option value={1}>1 Star - Poor</option>
              </select>
            </div>
            <Input
              label="Project Type"
              value={reviewProjectType}
              onChange={(e) => setReviewProjectType(e.target.value)}
              placeholder="e.g. 4-Storey Slab Concrete / Villa Roofing"
            />
          </div>

          <Textarea
            label="Review & Feedback *"
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Describe product quality, delivery speed, invoice accuracy, or workmanship..."
            required
          />

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
