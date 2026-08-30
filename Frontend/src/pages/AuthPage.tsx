import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  HardHat,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AccountType, ProviderType, BuyerRole } from '../types';
import { useToast } from '../context/ToastContext';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
  initialType?: AccountType;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  initialType = 'buyer',
  onSuccess,
}) => {
  const { login, signup, loginAs } = useAuth();
  const { success, error } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [accountType, setAccountType] = useState<AccountType>(initialType);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [providerType, setProviderType] = useState<ProviderType>('Retailer/Supplier');
  const [buyerRole, setBuyerRole] = useState<BuyerRole>('Homeowner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please provide both email and password.');
      return;
    }

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) {
        success('Welcome back to Ujenzi Link!');
        onSuccess();
      } else {
        error('Invalid login credentials. Try using one of the demo logins below.');
      }
    } else {
      if (!name) {
        error('Please provide your name.');
        return;
      }
      const ok = await signup({
        name,
        email,
        phone,
        accountType,
        businessName: accountType === 'provider' ? businessName || name : undefined,
        providerType: accountType === 'provider' ? providerType : undefined,
        buyerRole: accountType === 'buyer' ? buyerRole : undefined,
        location: { country: 'Tanzania', region: 'Dar es Salaam', district: 'Kinondoni' },
      });

      if (ok) {
        success('Account created successfully! Welcome to Ujenzi Link.');
        onSuccess();
      }
    }
  };

  const handleDemoClick = (role: 'buyer' | 'provider' | 'admin') => {
    loginAs(role);
    success(`Signed in as Demo ${role.toUpperCase()}`);
    onSuccess();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#12284C] to-[#1B3A6B] text-white p-6 sm:p-8 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 text-white">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
            {mode === 'login' ? 'Sign In to Ujenzi Link' : 'Join Plan Moja Construction Portal'}
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            "Build Quality For Less" — Direct Tanzanian Marketplace
          </p>

          {/* Quick Demo Switcher Strip */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Demo 1-Click Login:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoClick('buyer')}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/30 text-white font-semibold transition-colors"
              >
                Buyer (Amina)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('provider')}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/30 text-white font-semibold transition-colors"
              >
                Supplier (David)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/30 text-white font-semibold transition-colors"
              >
                Admin (CMS)
              </button>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-xs font-bold text-slate-600 bg-slate-50">
          <button
            onClick={() => setMode('login')}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-[#1B3A6B] text-[#1B3A6B] bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-[#1B3A6B] text-[#1B3A6B] bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {mode === 'signup' && (
            <>
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setAccountType('buyer')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                      accountType === 'buyer'
                        ? 'border-[#1B3A6B] bg-blue-50/50 text-[#1B3A6B]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mb-1 text-[#2E86D8]" />
                    <span className="text-xs font-bold">Buyer / Client</span>
                    <span className="text-[10px] text-slate-400">Developer, Site Owner</span>
                  </div>

                  <div
                    onClick={() => setAccountType('provider')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                      accountType === 'provider'
                        ? 'border-[#1B3A6B] bg-blue-50/50 text-[#1B3A6B]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <HardHat className="w-5 h-5 mb-1 text-[#8B5E3C]" />
                    <span className="text-xs font-bold">Supplier / Contractor</span>
                    <span className="text-[10px] text-slate-400">Shop, Mill, Artisan</span>
                  </div>
                </div>
              </div>

              <Input
                label="Full Name *"
                type="text"
                placeholder="e.g. Salim Rashid"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {accountType === 'provider' && (
                <>
                  <Input
                    label="Business or Brand Name *"
                    type="text"
                    placeholder="e.g. Kariakoo Hardware Depot Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Your Trade / Supplier Role *
                    </label>
                    <select
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value as ProviderType)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                    >
                      <option value="Manufacturer/Wholesaler">Manufacturer / Wholesaler</option>
                      <option value="Retailer/Supplier">Retailer / Hardware Store</option>
                      <option value="Contractor">Registered Building Contractor (CRB)</option>
                      <option value="Consultant">Consultant / Structural Engineer / Architect</option>
                      <option value="Freelancer">Freelance Builder / Supervisor</option>
                      <option value="Technician">Certified Electrician / Plumber</option>
                      <option value="Casual Labourer">Mason / Tiler / Site Labour</option>
                    </select>
                  </div>
                </>
              )}

              {accountType === 'buyer' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Primary Activity
                  </label>
                  <select
                    value={buyerRole}
                    onChange={(e) => setBuyerRole(e.target.value as BuyerRole)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                  >
                    <option value="Homeowner">Homeowner / Private Builder</option>
                    <option value="Property Developer">Commercial Property Developer</option>
                    <option value="Contractor Sourcing">Contractor Sourcing Materials</option>
                    <option value="Site Engineer">Site Engineer / Project Manager</option>
                  </select>
                </div>
              )}

              <Input
                label="Phone Number / WhatsApp *"
                type="tel"
                placeholder="+255 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}

          <Input
            label="Email Address *"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password *"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {mode === 'login' ? 'Sign In' : 'Create Free Account'}
          </Button>

          <div className="text-center pt-2 text-xs text-slate-500">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#2E86D8] font-bold hover:underline"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#2E86D8] font-bold hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
