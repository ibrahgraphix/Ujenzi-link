import React from 'react';
import { SearchX, HardHat, FileQuestion, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  variant?: 'search' | 'listings' | 'inquiries' | 'favorites';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search terms, changing filters, or clearing your location.',
  actionText,
  onAction,
  icon,
  variant = 'search',
}) => {
  const defaultIcons = {
    search: <SearchX className="w-10 h-10 text-[#2E86D8]" />,
    listings: <HardHat className="w-10 h-10 text-[#8B5E3C]" />,
    inquiries: <FileQuestion className="w-10 h-10 text-[#1B3A6B]" />,
    favorites: <SearchX className="w-10 h-10 text-rose-500" />,
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs max-w-lg mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
        {icon || defaultIcons[variant]}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction} rightIcon={<ArrowRight className="w-4 h-4" />}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
