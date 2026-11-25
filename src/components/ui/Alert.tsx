'use client';
import {TranslatedText} from '@/components/TranslatedText';


import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
}

export function Alert({
  title,
  children,
  variant = 'info',
  className = '',
}: AlertProps) {
  const variantConfig = {
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
      titleColor: 'text-sky-950 font-bold',
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      titleColor: 'text-amber-950 font-bold',
    },
    danger: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      titleColor: 'text-rose-950 font-bold',
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      titleColor: 'text-emerald-950 font-bold',
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed ${config.container} ${className}`}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="space-y-1">
        {title && <h4 className={`text-sm ${config.titleColor}`}><TranslatedText text={String(title)}/></h4>}
        <div className="text-xs leading-normal opacity-90">{children}</div>
      </div>
    </div>
  );
}
