import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Package,
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  Phone,
  CheckCircle2,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  X,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Listing, Inquiry, Provider, LocationHierarchy, Category, AvailabilityStatus, ProviderType } from '../types';
import { getListings, getProviderListings, createListing, updateListing, deleteListing } from '../services/listingsService';
import { getInquiries, updateInquiryStatus } from '../services/inquiriesService';
import { getCategories } from '../services/categoriesService';
import { getProviders, updateProviderAvailabilityStatus } from '../services/providersService';
import { Button } from '../components/common/Button';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { LocationSelector } from '../components/common/LocationSelector';
import { ImageUpload } from '../components/common/ImageUpload';
import { ProviderTypeBadge, VerifiedBadge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { UploadedImage } from '../services/uploadService';
import { updateProviderLogo } from '../services/providersService';
import { logoImageUrl, thumbnailUrl } from '../utils/imagekit';

interface ProviderDashboardPageProps {
  initialAction?: string;
  initialTab?: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onSelectListing: (listing: Listing) => void;
  onSelectProvider: (provider: Provider) => void;
}

export const ProviderDashboardPage: React.FC<ProviderDashboardPageProps> = ({
  initialAction,
  initialTab = 'listings',
  onNavigate,
  onSelectListing,
  onSelectProvider,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myProvider, setMyProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listing Modal State
  const [isListingModalOpen, setIsListingModalOpen] = useState(initialAction === 'add-listing');
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [listingTitle, setListingTitle] = useState('');
  const [listingCategory, setListingCategory] = useState<string>('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingUnit, setListingUnit] = useState('50kg Bag');
  const [listingMinOrder, setListingMinOrder] = useState('10 Bags');
  const [listingDeliveryAvailable, setListingDeliveryAvailable] = useState(true);
  const [listingDescription, setListingDescription] = useState('');
  const [listingImageItems, setListingImageItems] = useState<UploadedImage[]>([]);
  const [providerLogo, setProviderLogo] = useState<UploadedImage | null>(null);
  const [isSavingLogo, setIsSavingLogo] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [listingLocation, setListingLocation] = useState<LocationHierarchy>({
    country: 'Tanzania',
    region: '',
    district: '',
  });
  const [listingFormKey, setListingFormKey] = useState(0);

  const loadProviderData = async () => {
    setIsLoading(true);
    const [allInquiries, allCats, allProviders] = await Promise.all([
      getInquiries(user?.id, 'provider'),
      getCategories(),
      getProviders(),
    ]);

    const prov = allProviders.find((p) => p.name === user?.name || p.id === user?.id || p.id === 'prov-1') || allProviders[0];
    setMyProvider(prov);
    if (prov?.logo) {
      setProviderLogo({ url: prov.logo, fileId: prov.logoFileId || '' });
    }
    if (prov?.availabilityStatus) {
      setAvailabilityStatus(prov.availabilityStatus);
    }

    // Use user.id as providerId for backend API calls
    const providerUserId = user?.id || prov?.id;
    const providerListings = providerUserId ? await getProviderListings(providerUserId) : [];
    setMyListings(providerListings.length > 0 ? providerListings : (await getListings()).filter((l) => l.providerId === providerUserId || l.providerName === user?.name));
    setInquiries(allInquiries);
    setCategories(allCats);
    setIsLoading(false);
  };

  const loadInquiries = async () => {
    const allInquiries = await getInquiries(user?.id, 'provider');
    setInquiries(allInquiries);
  };

  const getListingStatusLabel = (status: Listing['status']) => {
    switch (status) {
      case 'active':
        return { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'pending_review':
        return { label: 'Pending Review', className: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'inactive':
        return { label: 'Inactive', className: 'bg-slate-100 text-slate-600 border-slate-200' };
      default:
        return { label: status, className: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // Helper function to check if provider type is an expert/service provider
  const isExpertProvider = (type?: ProviderType | string): boolean => {
    if (!type) return false;
    // Handle both frontend display format and backend database format
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
    const expertTypes = ['contractor', 'consultant', 'freelancer', 'technician', 'casual_labourer'];
    return expertTypes.includes(normalizedType);
  };

  const activeListingCount = myListings.filter((l) => l.status === 'active').length;
  const pendingListingCount = myListings.filter((l) => l.status === 'pending_review').length;

  useEffect(() => {
    loadProviderData();
  }, [user]);

  // Refetch inquiries when switching to inquiries tab or periodically
  useEffect(() => {
    if (activeTab === 'inquiries') {
      loadInquiries();
      const interval = setInterval(loadInquiries, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleOpenAdd = () => {
    setEditingListingId(null);
    setListingTitle('');
    setListingCategory(categories[0]?.id || '');
    setListingPrice('');
    setListingUnit('50kg Bag');
    setListingMinOrder('1 Unit');
    setListingDeliveryAvailable(true);
    setListingDescription('');
    setListingImageItems([]);
    setListingLocation({
      country: 'Tanzania',
      region: user?.location?.region || '',
      district: user?.location?.district || '',
    });
    setListingFormKey((key) => key + 1);
    setIsListingModalOpen(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListingId(listing.id);
    setListingTitle(listing.title);
    setListingCategory(listing.categoryId || '');
    setListingPrice(String(listing.price));
    setListingUnit(listing.unit);
    setListingMinOrder(listing.minOrderQuantity || '1 Unit');
    setListingDeliveryAvailable(listing.deliveryAvailable);
    setListingDescription(listing.description);
    setListingImageItems(
      listing.imageItems?.map((img) => ({ url: img.url, fileId: img.fileId || '' })) ||
        listing.images.map((url) => ({ url, fileId: '' }))
    );
    setListingLocation(listing.location);
    setListingFormKey((key) => key + 1);
    setIsListingModalOpen(true);
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this listing?')) {
      await deleteListing(id);
      setMyListings((prev) => prev.filter((l) => l.id !== id));
      success('Listing deleted successfully.');
    }
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingTitle || !listingPrice) {
      error('Please provide a title and price.');
      return;
    }

    if (!listingLocation.region || !listingLocation.district) {
      error('Please select both a region and district for your listing.');
      return;
    }

    const imgs = listingImageItems.filter((img) => img.url);

    if (imgs.length === 0) {
      error('Please upload at least one listing image.');
      return;
    }

    // Get category name from ID for display
    const categoryObj = categories.find(c => c.id === listingCategory);
    const categoryName = categoryObj?.name || listingCategory;
    const categoryId = listingCategory || categories[0]?.id;

    console.log('User ID:', user?.id);
    console.log('Provider ID:', myProvider?.id);
    console.log('Category ID:', categoryId);

    try {
      if (editingListingId) {
        const updated = await updateListing(editingListingId, {
          title: listingTitle,
          category: categoryName,
          categoryId,
          price: Number(listingPrice),
          unit: listingUnit,
          minOrderQuantity: listingMinOrder,
          deliveryAvailable: listingDeliveryAvailable,
          description: listingDescription.trim() || listingTitle,
          images: imgs.map((img) => img.url),
          imageItems: imgs,
          location: listingLocation,
        });
        setMyListings((prev) => prev.map((l) => (l.id === editingListingId ? updated : l)));
        success('Listing updated successfully.');
      } else {
        const created = await createListing({
          title: listingTitle,
          category: categoryName,
          categoryId,
          providerId: user?.id || myProvider?.id || 'prov-1',
          providerName: myProvider?.name || user?.name || 'Authorized Supplier',
          providerType: myProvider?.providerType || user?.providerType || 'Retailer/Supplier',
          price: Number(listingPrice),
          currency: 'TZS',
          unit: listingUnit,
          minOrderQuantity: listingMinOrder,
          deliveryAvailable: listingDeliveryAvailable,
          description: listingDescription.trim() || listingTitle,
          location: listingLocation,
          images: imgs.map((img) => img.url),
          imageItems: imgs,
          specifications: { 'Origin': 'Tanzania Standard', 'Condition': 'Brand New Stock' },
          isVerified: true,
        });
        setMyListings((prev) => [created, ...prev]);
        success('New listing published to Ujenzi Link marketplace!');
      }

      setIsListingModalOpen(false);
    } catch (err: any) {
      console.error('Error saving listing:', err);
      error(`Failed to save listing: ${err?.message || 'Unknown error'}. Please check your connection and try again.`);
    }
  };

  const handleInquiryStatusChange = async (inquiryId: string, newStatus: any) => {
    try {
      await updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
      );
      success(`Inquiry status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating inquiry status:', err);
      error(`Failed to update status: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSaveLogo = async () => {
    if (!providerLogo?.url) {
      error('Please upload a logo image first.');
      return;
    }
    setIsSavingLogo(true);
    try {
      const updated = await updateProviderLogo(providerLogo.url, providerLogo.fileId || undefined);
      if (updated) {
        setMyProvider(updated);
        success('Business logo updated successfully.');
      }
    } catch {
      error('Failed to update logo. Please try again.');
    } finally {
      setIsSavingLogo(false);
    }
  };

  const handleSaveAvailabilityStatus = async () => {
    setIsSavingAvailability(true);
    try {
      const updated = await updateProviderAvailabilityStatus(availabilityStatus);
      if (updated) {
        setMyProvider(updated);
        success('Availability status updated successfully.');
      }
    } catch {
      error('Failed to update availability status. Please try again.');
    } finally {
      setIsSavingAvailability(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#12284C] via-[#1B3A6B] to-[#8B5E3C] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={logoImageUrl(myProvider?.logo || providerLogo?.url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=150&q=80')}
            alt={myProvider?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {myProvider?.name || user?.name}
              </h1>
              {myProvider?.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {myProvider?.businessName} • {myProvider?.providerType || user?.providerType}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-blue-100 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-300" /> {myProvider?.location?.region || 'Dar es Salaam'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> {myProvider?.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {myProvider && (
            <Button
              variant="white"
              size="sm"
              onClick={() => onSelectProvider(myProvider)}
              leftIcon={<Store className="w-4 h-4 text-[#1B3A6B]" />}
            >
              View Public Shopfront
            </Button>
          )}
          <Button
            variant="bronze"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Post New Listing
          </Button>
        </div>
      </div>

      {/* Logo / Profile Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Business Logo</h3>
        <p className="text-xs text-slate-500 mb-4">Upload your company logo shown on your public supplier profile.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <ImageUpload
            label="Company Logo"
            folderType="providers"
            entityId={myProvider?.id}
            value={providerLogo}
            onChange={(val) => setProviderLogo(val as UploadedImage | null)}
            hint="Square or landscape logo, PNG/JPG recommended."
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveLogo}
            disabled={isSavingLogo || !providerLogo}
            className="md:mb-2"
          >
            {isSavingLogo ? 'Saving…' : 'Save Logo'}
          </Button>
        </div>
      </div>

      {/* Availability Status Settings (for expert providers) */}
      {isExpertProvider(myProvider?.providerType || user?.providerType) && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Availability Status</h3>
          <p className="text-xs text-slate-500 mb-4">Update your current work capacity to help clients know your availability.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium"
              >
                <option value="available">Available - Ready to take new projects</option>
                <option value="occupied">Occupied - Currently fully booked</option>
                <option value="busy_and_occupied">Busy & Occupied - Limited availability</option>
                <option value="occupied_but_available">Occupied but Available - Can take urgent work</option>
              </select>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAvailabilityStatus}
              disabled={isSavingAvailability}
              className="md:mb-2"
            >
              {isSavingAvailability ? 'Saving…' : 'Update Status'}
            </Button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Active Listings</div>
          <div className="text-2xl font-extrabold text-[#1B3A6B]">{activeListingCount}</div>
          {pendingListingCount > 0 && (
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              {pendingListingCount} pending review
            </div>
          )}
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Direct Inquiries</div>
          <div className="text-2xl font-extrabold text-[#2E86D8]">{inquiries.length}</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Commission Owed</div>
          <div className="text-2xl font-extrabold text-emerald-600">0 TZS (Free)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'listings'
              ? 'border-[#1B3A6B] text-[#1B3A6B] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Materials Catalog ({myListings.length})</span>
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
          <span>Client Quote Requests ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your Catalog</h3>
            <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Material / Service
            </Button>
          </div>

          {myListings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">No listings posted yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Post your building materials, cement, gravel, timber, steel rebar, or contracting trade to receive direct inquiries from site developers.
              </p>
              <Button variant="primary" size="md" onClick={handleOpenAdd}>
                Post Your First Material
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={thumbnailUrl(listing.images[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=150&q=80')}
                      alt={listing.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold bg-blue-50 text-[#1B3A6B] px-2 py-0.5 rounded-full">
                          {listing.category}
                        </span>
                        {(() => {
                          const st = getListingStatusLabel(listing.status);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.className}`}>
                              {st.label}
                            </span>
                          );
                        })()}
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {listing.location.region}
                          {listing.location.county ? `, ${listing.location.county}` : ''}
                          {listing.location.district ? `, ${listing.location.district}` : ''}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">{listing.title}</h4>
                      <div className="text-xs font-black text-[#1B3A6B] mt-1">
                        {listing.price.toLocaleString()} TZS / {listing.unit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectListing(listing)}
                      className="p-2 text-slate-500 hover:text-[#1B3A6B] hover:bg-slate-100 rounded-xl transition-colors"
                      title="View preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(listing)}
                      className="p-2 text-slate-500 hover:text-[#2E86D8] hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit listing"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Direct Inquiries from Buyers</h3>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No inquiries received yet. Keep your listings up-to-date with competitive direct rates.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{inq.buyerName}</div>
                      <div className="text-xs text-slate-500">
                        {inq.buyerPhone} • Site: {inq.targetLocation || 'Dar es Salaam'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatusChange(inq.id, e.target.value)}
                        className="text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-200 bg-slate-50"
                      >
                        <option value="new">New</option>
                        <option value="responded">Responded</option>
                        <option value="closed">Closed</option>
                      </select>
                      <span className="text-[11px] text-slate-400">{inq.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                    "{inq.message}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-[#2E86D8] font-bold">
                      Requested: {inq.listingTitle || 'General Material'}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${inq.buyerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Habari ${inq.buyerName}, this is ${myProvider?.name} from Ujenzi Link responding to your inquiry regarding ${inq.listingTitle}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${inq.buyerPhone}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1B3A6B]" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      <Modal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        title={editingListingId ? 'Edit Material / Service' : 'Post New Construction Material / Trade'}
        subtitle="Make your building supplies searchable across Tanzania's regions and districts."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveListing} className="space-y-4">
          <Input
            label="Listing Title *"
            placeholder="e.g. Dangote Portland Cement 42.5R - 50kg Bags"
            value={listingTitle}
            onChange={(e) => setListingTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={listingCategory}
                onChange={(e) => setListingCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Price (TZS) *"
                type="number"
                placeholder="21000"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                required
              />
              <Input
                label="Unit *"
                placeholder="50kg Bag"
                value={listingUnit}
                onChange={(e) => setListingUnit(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Minimum Order Quantity"
              placeholder="e.g. 50 Bags or 1 Tonne"
              value={listingMinOrder}
              onChange={(e) => setListingMinOrder(e.target.value)}
            />

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={listingDeliveryAvailable}
                  onChange={(e) => setListingDeliveryAvailable(e.target.checked)}
                  className="rounded text-[#1B3A6B] w-4 h-4"
                />
                <span>Direct Site Delivery Available</span>
              </label>
            </div>
          </div>

          {/* Location Hierarchy */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <LocationSelector
              key={listingFormKey}
              value={listingLocation}
              onChange={setListingLocation}
              compact={true}
            />
          </div>

          <ImageUpload
            label="Listing Photos *"
            folderType="listings"
            entityId={editingListingId || myProvider?.id}
            multiple
            maxFiles={6}
            value={listingImageItems}
            onChange={(val) => setListingImageItems((val as UploadedImage[]) || [])}
          />

          <Textarea
            label="Detailed Description & Application"
            rows={3}
            placeholder="Describe product quality, TBS compliance, warranty, or project suitability..."
            value={listingDescription}
            onChange={(e) => setListingDescription(e.target.value)}
          />

          <div className="pt-3 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsListingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {editingListingId ? 'Save Changes' : 'Publish Listing'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
