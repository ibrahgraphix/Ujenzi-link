import React, { useState, useEffect } from 'react';
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
import { InquiryModal } from './components/common/InquiryModal';
import { Listing, Provider } from './types';
import { trackVisit } from './services/trafficService';

const MainApp: React.FC = () => {
  const { user } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  useEffect(() => {
    trackVisit(`/${currentPage}`);
  }, [currentPage]);

  // Inquiry Modal Global State
  const [inquiryModal, setInquiryModal] = useState<{
    isOpen: boolean;
    listing?: Listing;
    provider?: Provider;
  }>({
    isOpen: false,
  });

  const handleNavigate = (page: string, params: Record<string, any> = {}) => {
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
    setCurrentPage('provider-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            onOpenInquiry={(listing) => handleOpenInquiry(listing)}
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
            onOpenInquiry={(listing) => handleOpenInquiry(listing)}
            onNavigate={handleNavigate}
          />
        );

      case 'listing-detail':
        return selectedListingId ? (
          <ListingDetailPage
            listingId={selectedListingId}
            onBack={() => handleNavigate('listings')}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing, provider) => handleOpenInquiry(listing, provider)}
          />
        ) : (
          <ListingsPage
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing) => handleOpenInquiry(listing)}
            onNavigate={handleNavigate}
          />
        );

      case 'providers':
        return (
          <ProvidersDirectoryPage
            initialType={pageParams.type}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing, provider) => handleOpenInquiry(listing, provider)}
          />
        );

      case 'provider-profile':
        return selectedProviderId ? (
          <ProviderProfilePage
            providerId={selectedProviderId}
            onBack={() => handleNavigate('providers')}
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing, provider) => handleOpenInquiry(listing, provider)}
            onNavigate={handleNavigate}
          />
        ) : (
          <ProvidersDirectoryPage
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing, provider) => handleOpenInquiry(listing, provider)}
          />
        );

      case 'auth':
        return (
          <AuthPage
            initialMode={pageParams.mode}
            initialType={pageParams.initialType}
            onSuccess={() => {
              if (user?.accountType === 'provider') {
                handleNavigate('provider-dashboard');
              } else if (user?.accountType === 'admin') {
                handleNavigate('admin-dashboard');
              } else {
                handleNavigate('home');
              }
            }}
          />
        );

      case 'buyer-dashboard':
        return (
          <BuyerDashboardPage
            initialTab={pageParams.tab}
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onOpenInquiry={(listing) => handleOpenInquiry(listing)}
          />
        );

      case 'provider-dashboard':
        return (
          <ProviderDashboardPage
            initialAction={pageParams.action}
            initialTab={pageParams.tab}
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
          />
        );

      case 'admin-dashboard':
        return (
          <AdminDashboardPage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
          />
        );

      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage />;

      case 'terms':
        return <TermsPage onBack={() => handleNavigate('home')} />;

      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProvider={handleSelectProvider}
            onOpenInquiry={(listing) => handleOpenInquiry(listing)}
          />
        );
    }
  };

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
