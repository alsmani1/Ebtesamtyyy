'use client';

import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'teal' | 'planned';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className = '',
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs font-bold gap-1.5',
    md: 'px-3 py-1 text-xs font-bold gap-1.5',
  };

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    info: 'bg-[#E6F0EE] text-[#0B2528] border border-[#0B2528]/15',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200/80',
    planned: 'bg-[#F9F5EB] text-[#85652B] border border-[#C8A96E]/45',
  };

  const dotColors = {
    success: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]',
    warning: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]',
    danger: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]',
    info: 'bg-[#14B8A6] shadow-[0_0_6px_rgba(20,184,166,0.7)]',
    neutral: 'bg-slate-400',
    teal: 'bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.7)]',
    planned: 'bg-[#C8A96E] shadow-[0_0_6px_rgba(200,169,110,0.7)]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
}
