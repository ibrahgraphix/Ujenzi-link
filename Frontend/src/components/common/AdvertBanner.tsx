import React from 'react';
import { Sparkles, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { Advert } from '../../types';
import { Button } from './Button';
import { detailImageUrl, cardImageUrl } from '../../utils/imagekit';

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B3A6B] via-[#12284C] to-[#2E86D8] p-3 text-white shadow-md cursor-pointer group flex items-center justify-between gap-3 border border-white/10"
      >
        {advert.bannerUrl && (
          <img
            src={cardImageUrl(advert.bannerUrl)}
            alt={advert.title}
            className="w-16 h-12 rounded-xl object-cover shrink-0 border border-white/20"
          />
        )}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Promoted
          </div>
          <h4 className="font-bold text-xs text-white truncate group-hover:underline">
            {advert.title}
          </h4>
          {advert.subtitle && (
            <p className="text-[11px] text-blue-100/80 truncate">{advert.subtitle}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1">
          {advert.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="WhatsApp Sponsor"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          <Button size="xs" variant="white" onClick={handleAction}>
            {advert.ctaText || 'View'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl my-6 transition-all hover:border-amber-400/40">
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Left / Top Banner Text Details */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 z-10 bg-gradient-to-br from-[#12284C] via-[#1B3A6B] to-slate-950">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> Featured Partner Offer
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white font-heading leading-tight">
              {advert.title}
            </h3>

            {advert.subtitle && (
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-xl">
                {advert.subtitle}
              </p>
            )}

            <div className="text-xs text-blue-200 font-medium">
              Sponsored by <span className="text-amber-300 font-bold">{advert.sponsorName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {advert.whatsapp && (
              <button
                onClick={handleWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Direct</span>
              </button>
            )}

            {advert.phoneNumber && (
              <button
                onClick={handleCall}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
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
              {advert.ctaText || 'Claim Offer'}
            </Button>
          </div>
        </div>

        {/* Right / Banner Main Prominent Image */}
        {advert.bannerUrl && (
          <div className="lg:w-1/2 min-h-[220px] sm:min-h-[280px] relative overflow-hidden bg-slate-900 group cursor-pointer" onClick={handleAction}>
            <img
              src={detailImageUrl(advert.bannerUrl)}
              alt={advert.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#12284C] lg:via-transparent lg:to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};
