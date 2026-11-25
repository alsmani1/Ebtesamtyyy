'use client';

import { TranslatedText } from '@/components/TranslatedText';
import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

export type SemanticVariant =
  | 'critical'
  | 'warning'
  | 'verified'
  | 'action'
  | 'proposed'
  | 'neutral';

interface StatusTagProps {
  variant: SemanticVariant;
  label: string;
  icon?: LucideIcon | boolean;
  size?: 'sm' | 'md';
  className?: string;
  count?: number;
}

const variantStyles: Record<
  SemanticVariant,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    defaultIcon: LucideIcon;
  }
> = {
  critical: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.75)]',
    defaultIcon: AlertCircle,
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.75)]',
    defaultIcon: AlertTriangle,
  },
  verified: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.75)]',
    defaultIcon: CheckCircle2,
  },
  action: {
    bg: 'bg-[#E6F0EE]',
    text: 'text-[#0B2528]',
    border: 'border-[#0B2528]/15',
    dot: 'bg-[#14B8A6] shadow-[0_0_6px_rgba(20,184,166,0.75)]',
    defaultIcon: Info,
  },
  proposed: {
    bg: 'bg-[#F9F5EB]',
    text: 'text-[#85652B]',
    border: 'border-[#C8A96E]/50',
    dot: 'bg-[#C8A96E] shadow-[0_0_6px_rgba(200,169,110,0.75)]',
    defaultIcon: Clock,
  },
  neutral: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    defaultIcon: HelpCircle,
  },
};

export function StatusTag({
  variant,
  label,
  icon = true,
  size = 'md',
  className = '',
  count,
}: StatusTagProps) {
  const config = variantStyles[variant];
  const IconComponent = typeof icon === 'boolean' ? (icon ? config.defaultIcon : null) : icon;

  const sizeClasses =
    size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1.5 font-bold' : 'text-xs font-bold px-3 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-sans transition-colors ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      {IconComponent && typeof icon !== 'boolean' && (
        <IconComponent className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="truncate">
        <TranslatedText text={String(label)} />
      </span>
      {typeof count === 'number' && (
        <span className="ms-1 px-1.5 py-0.2 rounded-full text-xs bg-white/80 font-extrabold border border-current/20 tabular-nums">
          {count}
        </span>
      )}
    </span>
  );
}

export default StatusTag;
