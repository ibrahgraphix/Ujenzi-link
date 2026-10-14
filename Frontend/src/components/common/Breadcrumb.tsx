import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-600 mb-4" aria-label="Breadcrumb">
      <button
        onClick={items[0].onClick}
        className="flex items-center gap-1 hover:text-[#2E86D8] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>
      {items.slice(1).map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-[#2E86D8] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-[#2E86D8] transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
