import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'blue' | 'bronze' | 'outline' | 'ghost' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#1B3A6B] hover:bg-[#12284C] text-white shadow-sm hover:shadow focus:ring-[#1B3A6B]/50 active:scale-[0.99]',
    blue:
      'bg-[#2E86D8] hover:bg-[#1F72C0] text-white shadow-sm hover:shadow focus:ring-[#2E86D8]/50 active:scale-[0.99]',
    bronze:
      'bg-[#8B5E3C] hover:bg-[#6E492E] text-white shadow-sm hover:shadow focus:ring-[#8B5E3C]/50 active:scale-[0.99]',
    outline:
      'border-2 border-slate-300 hover:border-[#1B3A6B] bg-white text-slate-700 hover:text-[#1B3A6B] focus:ring-slate-400 active:scale-[0.99]',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 active:scale-[0.99]',
    white:
      'bg-white hover:bg-slate-50 text-[#1B3A6B] shadow-md hover:shadow-lg focus:ring-white/50 active:scale-[0.99]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
