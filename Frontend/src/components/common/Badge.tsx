import React from 'react';
import { ShieldCheck, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { ProviderType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'navy' | 'blue' | 'bronze' | 'green' | 'amber' | 'slate' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'navy',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs font-medium',
    sm: 'px-2.5 py-1 text-xs font-medium',
    md: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    navy: 'bg-[#1B3A6B]/10 text-[#1B3A6B] border border-[#1B3A6B]/20',
    blue: 'bg-[#2E86D8]/10 text-[#2E86D8] border border-[#2E86D8]/20',
    bronze: 'bg-[#8B5E3C]/10 text-[#8B5E3C] border border-[#8B5E3C]/20',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    outline: 'bg-transparent text-slate-600 border border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md'; showText?: boolean }> = ({
  size = 'sm',
  showText = true,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold rounded-full ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      title="Verified Ujenzi Link Supplier"
    >
      <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
      {showText && <span>Verified Supplier</span>}
    </span>
  );
};

export const ProviderTypeBadge: React.FC<{ type: ProviderType; size?: 'xs' | 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  let variant: 'navy' | 'blue' | 'bronze' | 'green' | 'amber' | 'slate' = 'navy';

  if (type === 'Manufacturer/Wholesaler') variant = 'navy';
  else if (type === 'Contractor') variant = 'bronze';
  else if (type === 'Consultant') variant = 'blue';
  else if (type === 'Retailer/Supplier') variant = 'green';
  else if (type === 'Technician' || type === 'Freelancer') variant = 'amber';
  else variant = 'slate';

  return (
    <Badge variant={variant} size={size}>
      {type}
    </Badge>
  );
};
