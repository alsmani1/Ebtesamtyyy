'use client';
import {TranslatedText} from '@/components/TranslatedText';


import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center mb-3 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800"><TranslatedText text={String(title)}/></h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed"><TranslatedText text={String(description)}/></p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
