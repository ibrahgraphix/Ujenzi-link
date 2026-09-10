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
  Briefcase,
  Home,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AccountType, ProviderType, AvailabilityStatus } from '../types';
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
  const { login, signup } = useAuth();
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
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('available');

  // Buyer type: 'customer' (simple buyer) or 'client' (institution/project-based)
  const [buyerType, setBuyerType] = useState<'customer' | 'client'>('customer');

  // Helper function to check if provider type is an expert/service provider
  const isExpertProvider = (type: ProviderType | string): boolean => {
    // Handle both frontend display format and backend database format
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
    const expertTypes = ['contractor', 'consultant', 'freelancer', 'technician', 'casual_labourer'];
    return expertTypes.includes(normalizedType);
  };

  // Client-only fields
  const [institutionName, setInstitutionName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

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
        error('Invalid login credentials. Please check your email and password and try again.');
      }
    } else {
      if (!name) {
        error('Please provide your name.');
        return;
      }
      if (!phone) {
        error('Please provide your phone number.');
        return;
      }
      if (accountType === 'provider' && !businessName) {
        error('Please provide your business name.');
        return;
      }
      const ok = await signup({
        name,
        email,
        phone,
        password,
        accountType,
        buyerType: accountType === 'buyer' ? buyerType : undefined,
        businessName: accountType === 'provider' ? businessName || name : undefined,
        providerType: accountType === 'provider' ? providerType : undefined,
        availabilityStatus: accountType === 'provider' && isExpertProvider(providerType) ? availabilityStatus : undefined,
        institutionName: accountType === 'buyer' && buyerType === 'client' ? institutionName : undefined,
        projectName: accountType === 'buyer' && buyerType === 'client' ? projectName : undefined,
        projectDescription: accountType === 'buyer' && buyerType === 'client' ? projectDescription : undefined,
        location: { country: 'Tanzania', region: 'Dar es Salaam', district: 'Kinondoni' },
      });

      if (ok) {
        success('Account created successfully! Welcome to Ujenzi Link.');
        onSuccess();
      }
    }
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
            {mode === 'login' ? 'Sign In to Ujenzi Link' : 'Join Ujenzi Link Portal'}
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            "We connect, we care!" — Direct Tanzanian Marketplace
          </p>
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

              {/* Buyer-specific fields */}
              {accountType === 'buyer' && (
                <div className="space-y-4">
                  {/* Customer vs Client toggle */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Buyer Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setBuyerType('customer')}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                          buyerType === 'customer'
                            ? 'border-[#2E86D8] bg-blue-50/50 text-[#1B3A6B]'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Home className="w-5 h-5 mb-1 text-[#2E86D8]" />
                        <span className="text-xs font-bold">Customer</span>
                        <span className="text-[10px] text-slate-400">Personal / Homeowner</span>
                      </div>

                      <div
                        onClick={() => setBuyerType('client')}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                          buyerType === 'client'
                            ? 'border-[#8B5E3C] bg-amber-50/50 text-[#8B5E3C]'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Briefcase className="w-5 h-5 mb-1 text-[#8B5E3C]" />
                        <span className="text-xs font-bold">Client</span>
                        <span className="text-[10px] text-slate-400">Institution / Project</span>
                      </div>
                    </div>
                  </div>

                  {/* Client-only project fields */}
                  {buyerType === 'client' && (
                    <div className="space-y-3 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                      <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        Institution & Project Details
                      </p>
                      <Input
                        label="Institution / Organization Name"
                        type="text"
                        placeholder="e.g. Tanzania Roads Authority"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                      />
                      <Input
                        label="Project Name"
                        type="text"
                        placeholder="e.g. Dodoma Road Expansion Phase II"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Project Description
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Briefly describe the project scope and material requirements..."
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium resize-none focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Provider-specific fields */}
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

                  {/* Availability Status for Expert Providers */}
                  {isExpertProvider(providerType) && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Availability Status *
                      </label>
                      <select
                        value={availabilityStatus}
                        onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                      >
                        <option value="available">Available - Ready to take new projects</option>
                        <option value="occupied">Occupied - Currently fully booked</option>
                        <option value="busy_and_occupied">Busy & Occupied - Limited availability</option>
                        <option value="occupied_but_available">Occupied but Available - Can take urgent work</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        This helps clients know your current work capacity.
                      </p>
                    </div>
                  )}
                </>
              )}

              <Input
                label="Phone Number / WhatsApp *"
                type="tel"
                placeholder="+255 7XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
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
