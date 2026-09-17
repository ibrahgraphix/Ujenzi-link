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

export const ProviderTypeBadge: React.FC<{ type: ProviderType | string; size?: 'xs' | 'sm' | 'md' }> = ({
  type,
  size = 'sm',
}) => {
  const displayLabels: Record<string, string> = {
    manufacturer_wholesaler: 'Manufacturer / Wholesaler',
    retailer_supplier: 'Retailer / Supplier',
    contractor: 'Contractor',
    consultant: 'Consultant',
    freelancer: 'Freelancer',
    technician: 'Technician',
    casual_labourer: 'Casual Labourer',
  };

  const displayText = displayLabels[type] || type;

  let variant: 'navy' | 'blue' | 'bronze' | 'green' | 'amber' | 'slate' = 'navy';

  const normalized = (type || '').toLowerCase();
  if (normalized.includes('manufacturer') || normalized.includes('wholesaler')) variant = 'navy';
  else if (normalized.includes('contractor')) variant = 'bronze';
  else if (normalized.includes('consultant')) variant = 'blue';
  else if (normalized.includes('retailer') || normalized.includes('supplier')) variant = 'green';
  else if (normalized.includes('technician') || normalized.includes('freelancer')) variant = 'amber';
  else variant = 'slate';

  return (
    <Badge variant={variant} size={size}>
      {displayText}
    </Badge>
  );
};

export const TradeCategoryBadge: React.FC<{ category?: string; size?: 'xs' | 'sm' | 'md' }> = ({
  category,
  size = 'sm',
}) => {
  if (!category) return null;

  const labels: Record<string, string> = {
    registered_civil_building_contractor: 'Civil & Building Contractor',
    registered_em_contractor: 'E&M Contractor',
    specialized_works: 'Specialized Works',
    general_supply_services: 'General Supply & Services',
    construction_company: 'Construction Company',
    specialized_material_supply: 'Specialized Material Supply',
  };

  const displayText = labels[category] || category.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800 ${
        size === 'xs' ? 'px-2 py-0.5 text-[10px]' : size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      title={`Trade Category: ${displayText}`}
    >
      <Sparkles className={size === 'xs' ? 'w-2.5 h-2.5 text-indigo-500' : 'w-3 h-3 text-indigo-500'} />
      <span>{displayText}</span>
    </span>
  );
};
