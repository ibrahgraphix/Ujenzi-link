import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck, ArrowUpRight, Heart } from 'lucide-react';
import { MOCK_CATEGORIES } from '../../data/mockData';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#12284C] text-slate-300 border-t border-slate-800">
      {/* Top Banner highlight */}
      <div className="bg-[#1B3A6B] py-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
              Plan Moja Company Ltd
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              "Build Quality For Less"
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Connecting contractors, developers, and homeowners with trusted direct manufacturers and certified artisans across Tanzania.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('auth', { initialType: 'provider' })}
              className="px-5 py-3 rounded-xl bg-[#8B5E3C] hover:bg-[#6E492E] text-white font-semibold text-sm shadow-md transition-colors"
            >
              List Your Supplies Free
            </button>
            <button
              onClick={() => onNavigate('listings')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-colors"
            >
              Find Materials
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E86D8] to-[#1B3A6B] flex items-center justify-center text-white shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                Ujenzi<span className="text-[#2E86D8]">Link</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              A digital directory and direct connection platform by Plan Moja Company Ltd. We bridge the gap between building material suppliers, certified contractors, technicians, and property developers.
            </p>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Direct Connection Marketplace</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Ujenzi Link does not process payments or collect commissions. You contact suppliers and negotiate directly.
              </p>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#2E86D8] pl-2.5">
              Popular Materials
            </h4>
            <ul className="space-y-2 text-xs">
              {MOCK_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate('listings', { category: cat.name })}
                    className="hover:text-[#2E86D8] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Services & Roles */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#8B5E3C] pl-2.5">
              Services & Trades
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('providers', { type: 'Contractor' })}
                  className="hover:text-[#2E86D8] transition-colors"
                >
                  Registered Contractors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('providers', { type: 'Consultant' })}
                  className="hover:text-[#2E86D8] transition-colors"
                >
                  Consulting Engineers & BOQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('providers', { type: 'Technician' })}
                  className="hover:text-[#2E86D8] transition-colors"
                >
                  Certified Electricians & Plumbers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('providers', { type: 'Casual Labourer' })}
                  className="hover:text-[#2E86D8] transition-colors"
                >
                  Masons & Tiling Squads
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('providers', { type: 'Manufacturer/Wholesaler' })}
                  className="hover:text-[#2E86D8] transition-colors"
                >
                  Cement & Steel Mills
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('listings', { category: 'Equipment & Plant Hire' })}
                  className="hover:text-[#2E86D8] transition-colors"
                >
                  Heavy Plant & Mixer Hire
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Plan Moja Office */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#2E86D8] pl-2.5">
              Tanzania Headquarters
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2E86D8] shrink-0 mt-0.5" />
                <span>
                  Plot 42, Old Bagamoyo Road, TPDC Area, Mikocheni B, Dar es Salaam
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#2E86D8] shrink-0" />
                <a href="tel:+255755890123" className="hover:text-white transition-colors">
                  +255 755 890 123
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2E86D8] shrink-0" />
                <a href="mailto:info@planmoja.com" className="hover:text-white transition-colors">
                  info@planmoja.com
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-1 text-[11px]">
              <div>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white underline text-slate-400"
                >
                  Terms of Use & Privacy Policy
                </button>
              </div>
              <div>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className="hover:text-white text-slate-500 text-[10px]"
                >
                  Admin Portal Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-200">Plan Moja Company Ltd</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-white">
              About
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-white">
              Contact
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-white">
              Safety Guidelines
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
