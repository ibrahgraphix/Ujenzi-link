import React from 'react';
import { Sparkles, Phone, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import { Advert } from '../../types';
import { Button } from './Button';

interface AdvertBannerProps {
  advert: Advert;
  onNavigate?: (url: string) => void;
  compact?: boolean;
}

export const AdvertBanner: React.FC<AdvertBannerProps> = ({
  advert,
  onNavigate,
  compact = false,
}) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!advert.whatsapp) return;
    const num = advert.whatsapp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Habari, I saw your promotion on Ujenzi Link: ${advert.title}`);
    window.open(`https://wa.me/${num}?text=${text}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (advert.phoneNumber) {
      window.location.href = `tel:${advert.phoneNumber.replace(/\s+/g, '')}`;
    }
  };

  const handleAction = () => {
    if (advert.targetUrl && onNavigate) {
      onNavigate(advert.targetUrl);
    } else if (advert.whatsapp) {
      const num = advert.whatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${num}`, '_blank');
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleAction}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B3A6B] to-[#2E86D8] p-4 text-white shadow-md cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Promoted
            </div>
            <h4 className="font-bold text-sm text-white group-hover:underline">
              {advert.title}
            </h4>
            {advert.subtitle && (
              <p className="text-xs text-blue-100 line-clamp-1">{advert.subtitle}</p>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            {advert.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="WhatsApp Sponsor"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            <Button size="sm" variant="white" onClick={handleAction}>
              {advert.ctaText || 'View'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl my-6">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={advert.bannerUrl}
          alt={advert.title}
          className="w-full h-full object-cover opacity-25 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12284C] via-[#1B3A6B]/90 to-[#2E86D8]/60" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Featured Partner Offer
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-heading leading-tight">
            {advert.title}
          </h3>

          {advert.subtitle && (
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              {advert.subtitle}
            </p>
          )}

          <div className="text-xs text-blue-200 font-medium">
            Sponsored by <span className="text-white font-bold">{advert.sponsorName}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0 w-full md:w-auto">
          {advert.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </button>
          )}

          {advert.phoneNumber && (
            <button
              onClick={handleCall}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Direct</span>
            </button>
          )}

          <Button
            variant="bronze"
            size="md"
            onClick={handleAction}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {advert.ctaText || 'Learn More'}
          </Button>
        </div>
      </div>
    </div>
  );
};
