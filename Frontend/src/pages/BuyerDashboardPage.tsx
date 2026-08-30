import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  Phone,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Listing, Inquiry } from '../types';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/common/ListingCard';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

interface BuyerDashboardPageProps {
  initialTab?: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenInquiry: (listing: Listing) => void;
}

export const BuyerDashboardPage: React.FC<BuyerDashboardPageProps> = ({
  initialTab = 'favorites',
  onNavigate,
  onSelectListing,
  onOpenInquiry,
}) => {
  const { user, favorites, toggleFavorite } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [allListings, allInquiries] = await Promise.all([
        api.getListings(),
        api.getInquiries(),
      ]);

      setFavoriteListings(allListings.filter((l) => favorites.includes(l.id)));
      setInquiries(allInquiries);
      setIsLoading(false);
    };
    load();
  }, [favorites]);

  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
    success('Removed from saved listings.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Ribbon */}
      <div className="bg-gradient-to-r from-[#12284C] to-[#1B3A6B] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {user?.name}
              </h1>
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Buyer
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {user?.buyerRole || 'Property Developer'} • {user?.location?.region || 'Dar es Salaam'}
            </p>
          </div>
        </div>

        <Button
          variant="white"
          size="sm"
          onClick={() => onNavigate('listings')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Explore Building Materials
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Listings ({favoriteListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'inquiries'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Sent Quotation Requests ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Saved Listings */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favoriteListings.length === 0 ? (
            <EmptyState
              title="No saved building materials yet"
              description="Browse the marketplace and click the heart icon on any cement, steel, or equipment listing to save it here."
              actionText="Browse Marketplace"
              onAction={() => onNavigate('listings')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteListings.map((listing) => (
                <div key={listing.id} className="relative group">
                  <ListingCard
                    listing={listing}
                    onSelect={onSelectListing}
                    onContactSupplier={onOpenInquiry}
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(listing.id, e)}
                    className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full shadow-md transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <EmptyState
              title="No inquiries sent yet"
              description="When you request a quotation or material delivery inquiry, your conversation logs will appear here."
              actionText="Find Suppliers"
              onAction={() => onNavigate('listings')}
            />
          ) : (
            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#1B3A6B] bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {inquiry.listingTitle || 'General Material Inquiry'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {inquiry.createdAt}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inquiry.status === 'Responded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        Status: {inquiry.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      "{inquiry.message}"
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Delivery Target: <strong>{inquiry.targetLocation || 'Dar es Salaam'}</strong></span>
                      {inquiry.quantityNeeded && <span>Quantity: <strong>{inquiry.quantityNeeded}</strong></span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const clean = (inquiry.phone || '255755890123').replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${clean}?text=Following up on my Ujenzi Link inquiry`, '_blank');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Follow-up</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
