import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1B3A6B] bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block mb-1">
          Legal & Safety Framework
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Terms of Service & Marketplace Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Plan Moja Company Ltd • Last Updated: August 2026
        </p>
      </div>

      {/* Critical Platform Disclaimer Callout */}
      <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm sm:text-base">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Directory Model & Payment Disclaimer</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
          <strong>Ujenzi Link</strong> operates purely as a discovery, connection, and advertising directory for the construction industry in Tanzania. <strong>Plan Moja Company Ltd does not process financial transactions, take custody of funds, nor guarantee contract execution between independent buyers and suppliers.</strong> All pricing, payments, inspection of material quality, and delivery terms are negotiated directly between the parties.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Nature of the Service</h2>
          <p>
            Ujenzi Link provides an interactive marketplace allowing material manufacturers, hardware retailers, registered contractors, consulting engineers, technicians, and casual labourers to showcase their offerings to property developers, builders, and the general public across Tanzania.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Supplier Verification & Badges</h2>
          <p>
            The "Verified Partner" badge indicates that Plan Moja Company Ltd has conducted basic documentation checks (such as BRELA registration, CRB contractor licensing, or TBS quality certification) or physical premise confirmation. However, buyers are independently responsible for validating that materials delivered to their construction sites match the required engineering specifications.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Safe Transaction Practices</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Always request an official tax invoice (EFD receipt) where applicable.</li>
            <li>Inspect building supplies (e.g. cement bag integrity, rebar diameter via caliper, timber moisture) before unloading and final payment.</li>
            <li>For contracting and consulting services, execute written contracts specifying milestones and retention clauses.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Prohibited Content & Behavior</h2>
          <p>
            Users are strictly prohibited from posting counterfeit building materials, misleading pricing, uncertified professional claims, or engaging in fraudulent communications. Plan Moja Company Ltd reserves the right to immediately suspend or permanently terminate non-compliant accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Contact and Disputes</h2>
          <p>
            For inquiries regarding terms, moderation reports, or partner grievances, contact Plan Moja Company Ltd at <a href="mailto:safety@planmoja.com" className="text-[#2E86D8] underline">safety@planmoja.com</a> or visit our Mikocheni offices in Dar es Salaam.
          </p>
        </section>
      </div>
    </div>
  );
};
