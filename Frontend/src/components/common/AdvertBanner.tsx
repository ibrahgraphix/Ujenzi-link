import React, { useState } from 'react';
import { Sparkles, Phone, MessageSquare, ArrowRight, Mail, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Advert } from '../../types';
import { Button } from './Button';
import { detailImageUrl, cardImageUrl } from '../../utils/imagekit';

interface AdvertBannerProps {
  advert: Advert;
  onNavigate?: (url: string) => void;
  compact?: boolean;
}

/** Format a time string like '08:00' or '08:00:00' into '08:00 AM' display */
function formatTime(t?: string): string {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

/** Format a date string like '2026-09-17' into 'Sep 17' display */
function formatDate(d?: string): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const AdvertBanner: React.FC<AdvertBannerProps> = ({
  advert,
  onNavigate,
  compact = false,
}) => {
  const contactPhone = (advert.contactPhone || advert.phoneNumber || advert.whatsapp || '').trim();
  const rawDigits = contactPhone.replace(/[^0-9]/g, '');
  const phoneDigits = rawDigits.startsWith('0') && rawDigits.length === 10 ? `255${rawDigits.slice(1)}` : rawDigits;
  const contactEmail = (advert.contactEmail || advert.email || '').trim();

  const handleAction = () => {
    if (advert.targetUrl && advert.targetUrl !== '#' && onNavigate) {
      onNavigate(advert.targetUrl);
    } else if (phoneDigits) {
      window.open(`https://wa.me/${phoneDigits}`, '_blank');
    } else if (contactEmail) {
      window.location.href = `mailto:${contactEmail}`;
    }
  };

  const hasHours = !!(advert.startTime || advert.endTime);
  const startDate = formatDate(advert.startDate);
  const endDate = formatDate(advert.endDate);
  const hoursLabel =
    advert.startTime && advert.endTime
      ? `${startDate} ${formatTime(advert.startTime)} – ${endDate} ${formatTime(advert.endTime)}`
      : advert.startTime
      ? `Opens ${startDate} ${formatTime(advert.startTime)}`
      : `Closes ${endDate} ${formatTime(advert.endTime)}`;

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
          {advert.description && (
            <p className="text-[11px] text-blue-100/70 line-clamp-1">{advert.description}</p>
          )}
          {hasHours && (
            <p className="text-[10px] text-amber-200/80 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" /> {hoursLabel}
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          {phoneDigits ? (
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer inline-flex items-center justify-center"
              title="WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          ) : null}
          {contactPhone.trim() ? (
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          ) : null}
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Email"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          ) : null}
          {advert.targetUrl && advert.targetUrl !== '#' && (
            <Button size="sm" variant="white" onClick={handleAction}>
              {advert.ctaText || 'View'}
            </Button>
          )}
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

            {/* Description section - displayed directly on banner */}
            {advert.description && (
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed max-w-xl whitespace-pre-line">
                  {advert.description}
                </p>
              </div>
            )}

            {/* Partner working hours */}
            {hasHours && (
              <div className="flex items-center gap-2 text-xs text-amber-200/90 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Available: {hoursLabel}</span>
              </div>
            )}

            <div className="text-xs text-blue-200 font-medium">
              Sponsored by <span className="text-amber-300 font-bold">{advert.sponsorName}</span>
            </div>
          </div>

          {/* CTA / Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {phoneDigits ? (
              <a
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            ) : null}

            {contactPhone.trim() ? (
              <a
                href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call {contactPhone}</span>
              </a>
            ) : null}

            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                onClick={(e) => e.stopPropagation()}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            ) : null}

            {/* Only show Claim Offer button if there's a real targetUrl */}
            {advert.targetUrl && advert.targetUrl !== '#' && (
              <Button
                variant="bronze"
                size="md"
                onClick={handleAction}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {advert.ctaText || 'Claim Offer'}
              </Button>
            )}
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
