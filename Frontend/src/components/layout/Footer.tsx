import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, MapPin, ShieldCheck, PlayCircle } from 'lucide-react';
import { getCategories } from '../../services/categoriesService';
import { getRegions } from '../../services/locationsService';
import { Category } from '../../types';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getRegions().then(setRegions).catch(console.error);
  }, []);

  return (
    <footer className="bg-[#12284C] text-slate-300 border-t border-slate-800">
      {/* Top Banner highlight */}
      <div className="bg-[#1B3A6B] py-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
              Ujenzi Link
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              "We connect, we care!"
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Powered by Plan Moja Company Ltd. Connecting contractors, developers, and homeowners
              with trusted direct manufacturers and certified artisans across Tanzania.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/signup/supplier"
              className="px-5 py-3 rounded-xl bg-[#8B5E3C] hover:bg-[#6E492E] text-white font-semibold text-sm shadow-md transition-colors"
            >
              List Your Supplies Free
            </Link>
            <Link
              to="/materials"
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-colors"
            >
              Find Materials
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E86D8] to-[#1B3A6B] flex items-center justify-center text-white shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-heading">
                Ujenzi<span className="text-[#2E86D8]">Link</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              A digital directory and direct connection platform by Ujenzi Link. We bridge the gap
              between building material suppliers, certified contractors, technicians, and property
              developers.
            </p>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Direct Connection Marketplace</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Ujenzi Link does not process payments or collect commissions. You contact suppliers
                and negotiate directly.
              </p>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#2E86D8] pl-2.5">
              Popular Materials
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 6).map(category => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="hover:text-[#2E86D8] transition-colors text-left block"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-slate-500">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Col 3: Services & Roles */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#8B5E3C] pl-2.5">
              Services &amp; Trades
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/suppliers?type=Contractor" className="hover:text-[#2E86D8] transition-colors block">
                  Registered Contractors
                </Link>
              </li>
              <li>
                <Link to="/suppliers?type=Consultant" className="hover:text-[#2E86D8] transition-colors block">
                  Consulting Engineers &amp; BOQ
                </Link>
              </li>
              <li>
                <Link to="/suppliers?type=Technician" className="hover:text-[#2E86D8] transition-colors block">
                  Certified Electricians &amp; Plumbers
                </Link>
              </li>
              <li>
                <Link to="/suppliers?type=Casual+Labourer" className="hover:text-[#2E86D8] transition-colors block">
                  Masons &amp; Tiling Squads
                </Link>
              </li>
              <li>
                <Link to="/suppliers?type=Manufacturer%2FWholesaler" className="hover:text-[#2E86D8] transition-colors block">
                  Cement &amp; Steel Mills
                </Link>
              </li>
              <li>
                <Link to="/materials?category=Equipment+%26+Plant+Hire" className="hover:text-[#2E86D8] transition-colors block">
                  Heavy Plant &amp; Mixer Hire
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Regions */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#2E86D8] pl-2.5">
              By Region
            </h4>
            <ul className="space-y-2 text-xs">
              {regions.slice(0, 8).map(region => {
                const slug = region.toLowerCase().replace(/\s+/g, '-');
                return (
                  <li key={region}>
                    <Link
                      to={`/region/${slug}`}
                      className="hover:text-[#2E86D8] transition-colors text-left block"
                    >
                      {region}
                    </Link>
                  </li>
                );
              })}
              {regions.length === 0 && <li className="text-slate-500">Loading regions...</li>}
            </ul>
          </div>

          {/* Col 5: Contact & Headquarters */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#2E86D8] pl-2.5">
              Tanzania Headquarters
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2E86D8] shrink-0 mt-0.5" />
                <span>Mwenge, Kinondoni, Dar es Salaam, P.O. Box 33165</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#2E86D8] shrink-0" />
                <a href="mailto:planmoja2026@gmail.com" className="hover:text-white transition-colors">
                  planmoja2026@gmail.com
                </a>
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Video Tutorials
              </span>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://drive.google.com/file/d/1Q9UDUjpYc5sVTiTvTp7sRUxIDTAZ0h0V/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2E86D8] text-slate-300 flex items-center gap-1.5 transition-colors group"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-[#2E86D8] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Client Tutorial</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://drive.google.com/file/d/1GnvOIl51Xph1Bq9XM-iGyzXKi9KdXrNo/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2E86D8] text-slate-300 flex items-center gap-1.5 transition-colors group"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-[#2E86D8] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Customer Tutorial</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://drive.google.com/file/d/1t3u9-RhoHlazXEVBwKBNR-2UZ99RluMd/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#8B5E3C] text-slate-300 flex items-center gap-1.5 transition-colors group"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Seller Tutorial</span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-1 text-[11px]">
              <div>
                <Link to="/terms" className="hover:text-white underline text-slate-400">
                  Terms of Use &amp; Privacy Policy
                </Link>
              </div>
              <div>
                <Link to="/admin" className="hover:text-white text-slate-500 text-[10px]">
                  Admin Portal Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()}{' '}
            <strong className="text-slate-200">Ujenzi Link</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-white">Safety Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
