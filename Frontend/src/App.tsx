import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { ProvidersDirectoryPage } from './pages/ProvidersDirectoryPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { AuthPage } from './pages/AuthPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { SetNewPasswordPage } from './pages/SetNewPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CategoryLandingPage } from './pages/CategoryLandingPage';
import { RegionLandingPage } from './pages/RegionLandingPage';
import { InquiryModal } from './components/common/InquiryModal';
import { Listing, Provider, User } from './types';
import { trackPageVisit } from './services/trafficService';

// Code splitting for dashboard pages (lazy load these heavy pages)
const LazyBuyerDashboardPage = React.lazy(() => import('./pages/BuyerDashboardPage').then(m => ({ default: m.BuyerDashboardPage })));
const LazyProviderDashboardPage = React.lazy(() => import('./pages/ProviderDashboardPage').then(m => ({ default: m.ProviderDashboardPage })));
const LazyAdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

const MainApp: React.FC = () => {
  const { user } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providersRefreshKey, setProvidersRefreshKey] = useState<number>(0);

  useEffect(() => {
    trackPageVisit(`/${currentPage}`);
  }, [currentPage]);

  // Guard: if admin has mustChangePassword, lock navigation to set-new-password screen
  useEffect(() => {
    if (user?.accountType === 'admin' && user?.mustChangePassword) {
      if (currentPage !== 'set-new-password') {
        setCurrentPage('set-new-password');
      }
    }
  }, [user, currentPage]);

  // Global listener for PASSWORD_CHANGE_REQUIRED error from any admin API call
  useEffect(() => {
    const handlePasswordChangeRequired = () => {
      setCurrentPage('set-new-password');
    };
    window.addEventListener('ujenzi:password_change_required', handlePasswordChangeRequired);
    return () => {
      window.removeEventListener('ujenzi:password_change_required', handlePasswordChangeRequired);
    };
  }, []);

  // Inquiry Modal Global State
  const [inquiryModal, setInquiryModal] = useState<{
    isOpen: boolean;
    listing?: Listing;
    provider?: Provider;
  }>({
    isOpen: false,
  });

  const handleNavigate = (page: string, params: Record<string, any> = {}) => {
    // If admin must change password, prevent navigation away from set-new-password
    if (user?.accountType === 'admin' && user?.mustChangePassword && page !== 'set-new-password' && page !== 'auth') {
      setCurrentPage('set-new-password');
      return;
    }

    setCurrentPage(page);
    setPageParams(params);

    if (page === 'listing-detail' && params.listingId) {
      setSelectedListingId(params.listingId);
    } else if (page !== 'listing-detail') {
      setSelectedListingId(null);
    }

    if (page === 'provider-profile' && params.providerId) {
      setSelectedProviderId(params.providerId);
    } else if (page !== 'provider-profile') {
      setSelectedProviderId(null);
      setSelectedProvider(null);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectListing = (listing: Listing) => {
    setSelectedListingId(listing.id);
    setCurrentPage('listing-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProviderId(provider.id);
    setSelectedProvider(provider);
    setCurrentPage('provider-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refreshProviders = () => {
    setProvidersRefreshKey((prev: number) => prev + 1);
  };

  const handleOpenInquiry = (listing?: Listing, provider?: Provider) => {
    setInquiryModal({
      isOpen: true,
      listing,
      provider,
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing: Listing) => handleOpenInquiry(listing)}
          />
        );

      case 'listings':
        return (
          <ListingsPage
            initialQuery={pageParams.query}
            initialCategory={pageParams.category}
            initialRegion={pageParams.region}
            initialDistrict={pageParams.district}
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing: Listing) => handleOpenInquiry(listing)}
            onNavigate={handleNavigate}
          />
        );

      case 'listing-detail':
        return selectedListingId ? (
          <ListingDetailPage
            listingId={selectedListingId}
            onBack={() => handleNavigate('listings')}
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing?: Listing, provider?: Provider) => handleOpenInquiry(listing, provider)}
          />
        ) : (
          <ListingsPage
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing: Listing) => handleOpenInquiry(listing)}
            onNavigate={handleNavigate}
          />
        );

      case 'providers':
        return (
          <ProvidersDirectoryPage
            initialType={pageParams.type}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing?: Listing, provider?: Provider) => handleOpenInquiry(listing, provider)}
            refreshKey={providersRefreshKey}
          />
        );

      case 'provider-profile':
        return selectedProviderId ? (
          <ProviderProfilePage
            providerId={selectedProviderId}
            initialProvider={selectedProvider}
            onBack={() => handleNavigate('providers')}
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing?: Listing, provider?: Provider) => handleOpenInquiry(listing, provider)}
            onNavigate={handleNavigate}
          />
        ) : (
          <ProvidersDirectoryPage
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing?: Listing, provider?: Provider) => handleOpenInquiry(listing, provider)}
          />
        );

      case 'auth':
        return (
          <AuthPage
            initialMode={pageParams.mode}
            initialType={pageParams.initialType}
            onSuccess={(loggedInUser?: User) => {
              const activeUser = loggedInUser || user;
              if (activeUser?.accountType === 'admin') {
                if (activeUser?.mustChangePassword) {
                  handleNavigate('set-new-password');
                } else {
                  handleNavigate('admin-dashboard');
                }
              } else if (activeUser?.accountType === 'provider') {
                handleNavigate('provider-dashboard');
              } else {
                handleNavigate('home');
              }
            }}
          />
        );

      case 'set-new-password':
        return (
          <SetNewPasswordPage
            onSuccess={() => handleNavigate('admin-dashboard')}
          />
        );

      case 'buyer-dashboard':
        return (
          <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center">Loading...</div>}>
            <LazyBuyerDashboardPage
              initialTab={pageParams.tab}
              onNavigate={handleNavigate}
              onSelectListing={handleSelectListing}
              onOpenInquiry={(listing: Listing) => handleOpenInquiry(listing)}
            />
          </Suspense>
        );

      case 'provider-dashboard':
        return (
          <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center">Loading...</div>}>
            <LazyProviderDashboardPage
              initialAction={pageParams.action}
              initialTab={pageParams.tab}
              onNavigate={handleNavigate}
              onSelectListing={handleSelectListing}
              onSelectProvider={handleSelectProvider}
            />
          </Suspense>
        );

      case 'admin-dashboard':
        return (
          <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center">Loading...</div>}>
            <LazyAdminDashboardPage
              onNavigate={handleNavigate}
              onSelectListing={handleSelectListing}
              onSelectProvider={handleSelectProvider}
              onRefreshProviders={refreshProviders}
            />
          </Suspense>
        );

      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage />;

      case 'terms':
        return <TermsPage onBack={() => handleNavigate('home')} />;

      case 'not-found':
        return <NotFoundPage onNavigate={handleNavigate} />;

      case 'category-landing':
        return (
          <CategoryLandingPage
            categorySlug={pageParams.categorySlug}
            regionSlug={pageParams.regionSlug}
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing: Listing) => handleOpenInquiry(listing)}
          />
        );

      case 'region-landing':
        return (
          <RegionLandingPage
            regionSlug={pageParams.regionSlug}
            categorySlug={pageParams.categorySlug}
            onNavigate={handleNavigate}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing?: Listing, provider?: Provider) => handleOpenInquiry(listing, provider)}
          />
        );

      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing: Listing) => handleOpenInquiry(listing)}
          />
        );
    }
  };

  // Dedicated screen with no navbar/footer/sidebar for admin forced password change
  if (currentPage === 'set-new-password') {
    return (
      <main className="min-h-screen">
        <SetNewPasswordPage onSuccess={() => handleNavigate('admin-dashboard')} />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-[#2E86D8]/20 selection:text-[#1B3A6B]">
      {/* Header Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Interactive Direct Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModal.isOpen}
        onClose={() => setInquiryModal({ isOpen: false })}
        listing={inquiryModal.listing}
        provider={inquiryModal.provider}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
