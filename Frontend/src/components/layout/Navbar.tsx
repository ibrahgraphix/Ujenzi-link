import React, { useState } from 'react';
import {
  Menu,
  X,
  Building2,
  Search,
  PlusCircle,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  HardHat,
  ChevronDown,
  Heart,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenSearch,
}) => {
  const { user, isAuthenticated, logout, favorites } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (page: string, params?: Record<string, any>) => {
    onNavigate(page, params);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const getDashboardTarget = () => {
    if (!user) return 'auth';
    if (user.accountType === 'admin') return 'admin-dashboard';
    if (user.accountType === 'provider') return 'provider-dashboard';
    return 'buyer-dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-[#1B3A6B] text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">Plan Moja Company Ltd:</span>
            <span className="hidden sm:inline text-slate-200">"We connect, we care!"</span>
            <span className="text-slate-300">| Direct Construction Marketplace</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNav('contact')}
              className="text-slate-300 hover:text-white transition-colors hidden md:inline text-[11px]"
            >
              Need Help? Call +255 767 856 452
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
              <img
                src="/logo.jpeg"
                alt="Ujenzi Link Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1B3A6B] font-heading">
                  Ujenzi<span className="text-[#2E86D8]">Link</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide">
                by Plan Moja • <span className="text-[#8B5E3C] font-semibold">We connect, we care!</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPage === 'home'
                  ? 'text-[#1B3A6B] bg-slate-100'
                  : 'text-slate-600 hover:text-[#1B3A6B] hover:bg-slate-50'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('listings')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPage === 'listings'
                  ? 'text-[#1B3A6B] bg-slate-100'
                  : 'text-slate-600 hover:text-[#1B3A6B] hover:bg-slate-50'
                }`}
            >
              Materials & Services
            </button>
            <button
              onClick={() => handleNav('providers')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPage === 'providers'
                  ? 'text-[#1B3A6B] bg-slate-100'
                  : 'text-slate-600 hover:text-[#1B3A6B] hover:bg-slate-50'
                }`}
            >
              Suppliers & Contractors
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPage === 'about'
                  ? 'text-[#1B3A6B] bg-slate-100'
                  : 'text-slate-600 hover:text-[#1B3A6B] hover:bg-slate-50'
                }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${currentPage === 'contact'
                  ? 'text-[#1B3A6B] bg-slate-100'
                  : 'text-slate-600 hover:text-[#1B3A6B] hover:bg-slate-50'
                }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Search trigger */}
            <button
              onClick={() => handleNav('listings')}
              className="p-2.5 rounded-xl text-slate-500 hover:text-[#1B3A6B] hover:bg-slate-100 transition-colors"
              title="Search marketplace"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Saved favorites shortcut for buyers */}
            {user?.accountType === 'buyer' && (
              <button
                onClick={() => handleNav('buyer-dashboard', { tab: 'favorites' })}
                className="relative p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Saved Listings"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}

            {/* Post Listing CTA / Register CTA */}
            {user?.accountType === 'provider' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNav('provider-dashboard', { action: 'add-listing' })}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Post Listing
              </Button>
            ) : user?.accountType === 'admin' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNav('admin-dashboard')}
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                Admin Control
              </Button>
            ) : (
              <Button
                variant="bronze"
                size="sm"
                onClick={() => handleNav('auth', { initialType: 'provider' })}
                leftIcon={<Store className="w-4 h-4" />}
              >
                Register as Supplier
              </Button>
            )}

            {/* User Profile / Dashboard Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B3A6B] to-[#2E86D8] text-white font-bold text-sm flex items-center justify-center border border-slate-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-[#2E86D8] font-semibold uppercase">
                      {user.accountType}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3A6B] to-[#2E86D8] text-white font-bold text-lg flex items-center justify-center shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                        <div className="mt-1">
                          <span className="text-[10px] font-semibold bg-blue-50 text-[#1B3A6B] px-2 py-0.5 rounded-full border border-blue-200">
                            {user.accountType === 'provider' ? user.providerType : user.accountType === 'admin' ? 'System Admin' : user.buyerRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNav(getDashboardTarget())}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#2E86D8]" />
                        <span>My Dashboard</span>
                      </button>

                      {user.accountType === 'buyer' && (
                        <button
                          onClick={() => handleNav('buyer-dashboard', { tab: 'inquiries' })}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <HardHat className="w-4 h-4 text-[#8B5E3C]" />
                          <span>Sent Quotes & Inquiries</span>
                        </button>
                      )}

                      {user.accountType === 'provider' && (
                        <button
                          onClick={() => handleNav('provider-dashboard', { tab: 'listings' })}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>Manage Catalog</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('auth', { mode: 'login' })}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleNav('auth', { mode: 'signup' })}
                >
                  Join Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => handleNav('listings')}
              className="p-2 text-slate-600 hover:text-[#1B3A6B]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#1B3A6B] hover:bg-slate-100 rounded-xl"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl max-h-[80vh] overflow-y-auto">
          {/* User info if logged in */}
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3A6B] to-[#2E86D8] text-white font-bold text-lg flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-[#2E86D8] font-semibold uppercase">{user.accountType}</div>
                </div>
              </div>
              <button
                onClick={() => handleNav(getDashboardTarget())}
                className="px-3 py-1.5 bg-[#1B3A6B] text-white text-xs font-semibold rounded-lg"
              >
                Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNav('auth', { mode: 'login' })}
                fullWidth
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNav('auth', { mode: 'signup' })}
                fullWidth
              >
                Register
              </Button>
            </div>
          )}

          {/* Links */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('listings')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Materials & Building Services</span>
              <span className="text-xs bg-blue-50 text-[#2E86D8] px-2 py-0.5 rounded-full font-bold">100+</span>
            </button>
            <button
              onClick={() => handleNav('providers')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Suppliers & Verified Contractors
            </button>
            <button
              onClick={() => handleNav('about')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              About Plan Moja Company Ltd
            </button>
            <button
              onClick={() => handleNav('contact')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Contact & Support
            </button>
          </div>

          {/* Call to action */}
          <div className="pt-2 border-t border-slate-100">
            {user?.accountType === 'provider' ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => handleNav('provider-dashboard', { action: 'add-listing' })}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Post New Material / Service
              </Button>
            ) : (
              <Button
                variant="bronze"
                fullWidth
                onClick={() => handleNav('auth', { initialType: 'provider' })}
                leftIcon={<Store className="w-4 h-4" />}
              >
                Register as Supplier / Contractor
              </Button>
            )}
          </div>

          {isAuthenticated && (
            <div className="pt-2">
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full py-2 text-center text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
