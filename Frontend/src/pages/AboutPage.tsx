import React from 'react';
import {
  Building2,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Mail,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '../components/common/Button';

interface AboutPageProps {
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#12284C] via-[#1B3A6B] to-[#2E86D8] rounded-3xl text-white p-8 sm:p-14 shadow-xl relative overflow-hidden text-center space-y-4">
          <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-amber-400/30">
            About Plan Moja Company Ltd
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white max-w-3xl mx-auto leading-tight">
            "We connect, we care!"
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Pioneering digital transformation and transparency across the Tanzanian construction sector by connecting material manufacturers, certified contractors, and property builders directly.
          </p>
        </div>
      </section>

      {/* Origin & Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Transforming How Tanzania Builds
              </h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Ujenzi Link is a zero-commission construction marketplace and directory designed to connect clients, contractors, suppliers, skilled tradespeople, and other construction professionals directly within one interconnected platform.
            </p>

            <p className="text-sm text-slate-700 leading-relaxed">
              The platform enables users to easily find verified suppliers, skilled personnel, contractors, and construction services based on their location, including those available near their premises, neighbourhood, or street. Ujenzi Link promotes direct engagement and transparent trade, allowing users to communicate, negotiate prices, and agree on terms directly with service providers without intermediary commissions.
            </p>

            <p className="text-sm text-slate-700 leading-relaxed">
              Our purpose is to make construction procurement and access to skilled services faster, more transparent, more affordable, and locally accessible, while creating greater opportunities for construction businesses and skilled professionals to connect directly with customers.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1B3A6B] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Direct Factory & Depot Access</h4>
                  <p className="text-xs text-slate-500">
                    Connect straight with cement mills, steel rebar distributors, and stone quarries.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1B3A6B] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Ward & Street-Level Geo Precision</h4>
                  <p className="text-xs text-slate-500">
                    Filter supplies down to your specific Tanzanian district to slash logistics and haulage costs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-[#1B3A6B] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero Middleman Surcharges</h4>
                  <p className="text-xs text-slate-500">
                    We never take a cut of your materials or labor transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
                alt="Construction in Tanzania"
                className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3] border border-slate-200"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-200 max-w-xs hidden sm:block">
                <div className="text-xs font-bold text-[#1B3A6B] uppercase tracking-wider">Ujenzi Link Pledge</div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  100% Transparency for Contractors & Homebuilders.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8B5E3C] block mb-1">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Our Core Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1B3A6B] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Integrity & Quality First</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We champion suppliers and contractors complying with TBS and CRB standards to safeguard Tanzanian infrastructure.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#8B5E3C] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Affordable Construction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By enabling direct contact between buyers and suppliers, we reduce material markups so everyone can benefit from our commitment: "We connect, we care!".
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Local Empowerment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From national cement factories to skilled local masons in Kinondoni and Arusha, we empower African artisans to grow their businesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Moja Physical Office Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E86D8]">
                Corporate Headquarters
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                Plan Moja Company Ltd
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Visit our offices for corporate partnership inquiries, supplier verification audits, or advertising sponsorships.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#2E86D8] shrink-0" />
                  <span>Mwenge, Kinondoni, Dar es Salaam</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-[#2E86D8] shrink-0" />
                  <span>P.O. Box 33165, Dar es Salaam</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-[#2E86D8] shrink-0" />
                  <a href="mailto:planmoja2026@gmail.com" className="hover:underline text-[#2E86D8]">
                    planmoja2026@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-[#8B5E3C] shrink-0" />
                  <span>Registered in the United Republic of Tanzania</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('contact')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Contact Our Team
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('listings')}
              >
                Explore Marketplace
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
