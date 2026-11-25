'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'planned' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled = false,
      icon,
      leftIcon,
      rightIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-bold rounded-full border transition-all duration-150 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs min-h-[34px]',
      md: 'px-5 py-2 text-[13px] min-h-[40px]',
      lg: 'px-6 py-2.5 text-sm min-h-[46px]',
    };

    const variantStyles = {
      primary:
        'bg-[#0B2528] text-white border-[#0B2528] hover:bg-[#13393E] shadow-[0_4px_14px_rgba(11,37,40,0.16)]',
      secondary:
        'bg-[#F9F5EB] text-[#0B2528] border-[#C8A96E]/50 hover:bg-[#F3EBDD] hover:border-[#C8A96E]',
      outline:
        'bg-white text-[#0B2528] border-slate-200/90 hover:border-[#C8A96E] hover:bg-[#F7F6F2]',
      success:
        'bg-[#10B981] text-white border-[#10B981] hover:bg-[#059669] shadow-[0_4px_14px_rgba(16,185,129,0.22)]',
      warning:
        'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A] hover:bg-[#FEF3C7]',
      planned:
        'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE] hover:bg-[#EDE9FE]',
      danger:
        'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3] hover:bg-[#FFE4E6]',
      ghost:
        'bg-transparent text-[#0B2528] border-transparent hover:bg-slate-100/80',
    };
    const resolvedLeftIcon = leftIcon || icon;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          resolvedLeftIcon
        )}
        <span className="min-w-0">{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
