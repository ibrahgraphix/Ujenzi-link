import React, { Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { InquiryModal } from './components/common/InquiryModal';
import { Listing, Provider } from './types';
import { trackPageVisit } from './services/trafficService';

// Lazy-loaded heavy pages
const HomePage = React.lazy(() =>
  import('./pages/HomePage').then(m => ({ default: m.HomePage }))
);
const ListingsPage = React.lazy(() =>
  import('./pages/ListingsPage').then(m => ({ default: m.ListingsPage }))
);
const ListingDetailPage = React.lazy(() =>
  import('./pages/ListingDetailPage').then(m => ({ default: m.ListingDetailPage }))
);
const ProvidersDirectoryPage = React.lazy(() =>
  import('./pages/ProvidersDirectoryPage').then(m => ({ default: m.ProvidersDirectoryPage }))
);
const ProviderProfilePage = React.lazy(() =>
  import('./pages/ProviderProfilePage').then(m => ({ default: m.ProviderProfilePage }))
);
const AuthPage = React.lazy(() =>
  import('./pages/AuthPage').then(m => ({ default: m.AuthPage }))
);
const BuyerDashboardPage = React.lazy(() =>
  import('./pages/BuyerDashboardPage').then(m => ({ default: m.BuyerDashboardPage }))
);
const ProviderDashboardPage = React.lazy(() =>
  import('./pages/ProviderDashboardPage').then(m => ({ default: m.ProviderDashboardPage }))
);
const AdminDashboardPage = React.lazy(() =>
  import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage }))
);
const AboutPage = React.lazy(() =>
  import('./pages/AboutPage').then(m => ({ default: m.AboutPage }))
);
const ContactPage = React.lazy(() =>
  import('./pages/ContactPage').then(m => ({ default: m.ContactPage }))
);
const TermsPage = React.lazy(() =>
  import('./pages/TermsPage').then(m => ({ default: m.TermsPage }))
);
const SetNewPasswordPage = React.lazy(() =>
  import('./pages/SetNewPasswordPage').then(m => ({ default: m.SetNewPasswordPage }))
);
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
);
const CategoryLandingPage = React.lazy(() =>
  import('./pages/CategoryLandingPage').then(m => ({ default: m.CategoryLandingPage }))
);
const RegionLandingPage = React.lazy(() =>
  import('./pages/RegionLandingPage').then(m => ({ default: m.RegionLandingPage }))
);

// ─── Route Guards ────────────────────────────────────────────────────────────

const RequireAuth: React.FC<{
  children: React.ReactNode;
  allowedTypes?: string[];
}> = ({ children, allowedTypes }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedTypes && user && !allowedTypes.includes(user.accountType)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const RequireAdminPasswordChange: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  if (user?.accountType === 'admin' && user?.mustChangePassword) {
    return <Navigate to="/set-new-password" replace />;
  }
  return <>{children}</>;
};

// ─── Scroll to top + traffic tracking on every route change ──────────────────

const RouteEffects: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageVisit(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
};

// ─── Inquiry modal global state (context-free, lifted here) ──────────────────

type InquiryState = {
  isOpen: boolean;
  listing?: Listing;
  provider?: Provider;
};

const InquiryContext = React.createContext<{
  open: (listing?: Listing, provider?: Provider) => void;
}>({ open: () => {} });

export const useInquiry = () => React.useContext(InquiryContext);

// ─── Suspense fallback ────────────────────────────────────────────────────────

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#2E86D8] border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── Main routed app (inside BrowserRouter) ───────────────────────────────────

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inquiryModal, setInquiryModal] = React.useState<InquiryState>({
    isOpen: false,
  });

  const openInquiry = React.useCallback(
    (listing?: Listing, provider?: Provider) => {
      setInquiryModal({ isOpen: true, listing, provider });
    },
    []
  );

  // Listen for password-change-required event
  useEffect(() => {
    const handler = () => navigate('/set-new-password', { replace: true });
    window.addEventListener('ujenzi:password_change_required', handler);
    return () => window.removeEventListener('ujenzi:password_change_required', handler);
  }, [navigate]);

  return (
    <InquiryContext.Provider value={{ open: openInquiry }}>
      <RouteEffects />
      <Routes>
        {/* ── Dedicated full-screen route (no nav/footer) ── */}
        <Route
          path="/set-new-password"
          element={
            <RequireAuth allowedTypes={['admin']}>
              <Suspense fallback={<PageLoader />}>
                <SetNewPasswordPage />
              </Suspense>
            </RequireAuth>
          }
        />

        {/* ── Standard layout (navbar + footer) ── */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-[#2E86D8]/20 selection:text-[#1B3A6B]">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />

                    {/* Materials & Services */}
                    <Route path="/materials" element={<ListingsPage />} />
                    <Route path="/listings" element={<Navigate to="/materials" replace />} />
                    <Route path="/listings/:slugId" element={<ListingDetailPage />} />

                    {/* Suppliers & Contractors */}
                    <Route path="/suppliers" element={<ProvidersDirectoryPage />} />
                    <Route path="/providers" element={<Navigate to="/suppliers" replace />} />
                    <Route path="/suppliers/:slugId" element={<ProviderProfilePage />} />
                    <Route path="/providers/:slugId" element={<ProviderProfilePage />} />

                    {/* SEO landing pages */}
                    <Route path="/category/:categorySlug" element={<CategoryLandingPage />} />
                    <Route path="/region/:regionSlug" element={<RegionLandingPage />} />

                    {/* Auth */}
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/signup/supplier" element={<AuthPage />} />

                    {/* Dashboards (protected) */}
                    <Route
                      path="/dashboard"
                      element={
                        <RequireAuth allowedTypes={['buyer']}>
                          <RequireAdminPasswordChange>
                            <BuyerDashboardPage />
                          </RequireAdminPasswordChange>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/provider/dashboard"
                      element={
                        <RequireAuth allowedTypes={['provider']}>
                          <RequireAdminPasswordChange>
                            <ProviderDashboardPage />
                          </RequireAdminPasswordChange>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <RequireAuth allowedTypes={['admin']}>
                          <RequireAdminPasswordChange>
                            <AdminDashboardPage />
                          </RequireAdminPasswordChange>
                        </RequireAuth>
                      }
                    />

                    {/* Static pages */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>

      {/* Global inquiry modal */}
      <InquiryModal
        isOpen={inquiryModal.isOpen}
        onClose={() => setInquiryModal({ isOpen: false })}
        listing={inquiryModal.listing}
        provider={inquiryModal.provider}
      />
    </InquiryContext.Provider>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
