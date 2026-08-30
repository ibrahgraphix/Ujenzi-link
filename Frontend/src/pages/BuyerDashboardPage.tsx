import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Trash2,
  ArrowRight,
  Briefcase,
  Building2,
  Edit2,
  Save,
  X,
  Home,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Listing, Inquiry } from '../types';
import { getInquiries } from '../services/inquiriesService';
import { getListings } from '../services/listingsService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ListingCard } from '../components/common/ListingCard';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import apiClient from '../services/apiClient';

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
  const { user, favorites, toggleFavorite, updateUser } = useAuth();
  const { success, error } = useToast();

  const isClient = user?.buyerType === 'client';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Client project edit state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editInstitution, setEditInstitution] = useState(user?.institutionName || '');
  const [editProjectName, setEditProjectName] = useState(user?.projectName || '');
  const [editProjectDesc, setEditProjectDesc] = useState(user?.projectDescription || '');
  const [isSavingProject, setIsSavingProject] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [allListings, allInquiries] = await Promise.all([
        getListings(),
        getInquiries(),
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

  const handleSaveProject = async () => {
    setIsSavingProject(true);
    try {
      await apiClient.put('/api/buyer/profile', {
        institutionName: editInstitution,
        projectName: editProjectName,
        projectDescription: editProjectDesc,
      });
      updateUser({
        institutionName: editInstitution,
        projectName: editProjectName,
        projectDescription: editProjectDesc,
      });
      setIsEditingProject(false);
      success('Project details updated successfully.');
    } catch (err: any) {
      error(err?.message || 'Failed to update project details.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const tabs = [
    { id: 'favorites', label: `Saved Listings (${favoriteListings.length})`, icon: Heart },
    { id: 'inquiries', label: `Sent Inquiries (${inquiries.length})`, icon: MessageSquare },
    ...(isClient ? [{ id: 'project', label: 'Project Details', icon: Briefcase }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Ribbon */}
      <div className="bg-gradient-to-r from-[#12284C] to-[#1B3A6B] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            {isClient ? (
              <Briefcase className="w-8 h-8 text-amber-300" />
            ) : (
              <Home className="w-8 h-8 text-blue-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {user?.name}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isClient
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                  : 'bg-white/20 text-white'
              }`}>
                {isClient ? 'Client' : 'Customer'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {isClient && user?.institutionName
                ? `${user.institutionName} • ${user?.location?.region || 'Tanzania'}`
                : user?.location?.region || 'Tanzania'}
            </p>
            {isClient && user?.projectName && (
              <p className="text-xs text-amber-300 mt-0.5 font-semibold">
                📋 {user.projectName}
              </p>
            )}
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
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Saved Listings */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favoriteListings.length === 0 ? (
            <EmptyState
              title="No saved building materials yet"
              description="Browse the marketplace and click the heart icon on any listing to save it here."
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

      {/* Tab: Sent Inquiries */}
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
                      <span className="text-[11px] text-slate-400">{inquiry.createdAt}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inquiry.status === 'contacted'
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
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const clean = (inquiry.buyerPhone || '255755890123').replace(/[^0-9]/g, '');
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

      {/* Tab: Project Details (Client only) */}
      {activeTab === 'project' && isClient && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#8B5E3C]" />
                  Institution & Project Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used to help suppliers understand your procurement context.
                </p>
              </div>
              {!isEditingProject ? (
                <button
                  onClick={() => {
                    setEditInstitution(user?.institutionName || '');
                    setEditProjectName(user?.projectName || '');
                    setEditProjectDesc(user?.projectDescription || '');
                    setIsEditingProject(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2E86D8] hover:text-[#1B3A6B] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingProject(false)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            <div className="p-6">
              {!isEditingProject ? (
                <div className="space-y-5">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Institution / Organization
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {user?.institutionName || (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Project Name
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {user?.projectName || (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Project Description
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed">
                      {user?.projectDescription || (
                        <span className="text-slate-400 italic">No description provided</span>
                      )}
                    </div>
                  </div>

                  {!user?.institutionName && !user?.projectName && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700">
                      <strong>Tip:</strong> Adding your institution and project details helps suppliers
                      provide more accurate quotes and understand your procurement needs.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Institution / Organization Name"
                    type="text"
                    placeholder="e.g. Tanzania Roads Authority"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                  />
                  <Input
                    label="Project Name"
                    type="text"
                    placeholder="e.g. Dodoma Road Expansion Phase II"
                    value={editProjectName}
                    onChange={(e) => setEditProjectName(e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Project Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the project scope, material requirements, timeline..."
                      value={editProjectDesc}
                      onChange={(e) => setEditProjectDesc(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium resize-none focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProject(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveProject}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      {isSavingProject ? 'Saving...' : 'Save Details'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
