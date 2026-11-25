'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface DrawerTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface FrostedSlideOverDrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  iconBadge?: React.ReactNode;
  tabs?: DrawerTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  dark?: boolean;
  maxWidth?: string;
  ariaLabel?: string;
}

export function FrostedSlideOverDrawer({
  open,
  onClose,
  title,
  subtitle,
  iconBadge,
  tabs,
  activeTab,
  onTabChange,
  footer,
  children,
  dark = false,
  maxWidth = 'max-w-xl',
  ariaLabel,
}: FrostedSlideOverDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-auto">
      {/* Subtle contextual backdrop so parent workspace remains visible */}
      <div
        className="fixed inset-0 bg-[#0B2528]/20 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Sheet */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : ariaLabel || 'Detail Drawer'}
        className={`fixed inset-y-3 right-3 rtl:right-auto rtl:left-3 w-[calc(100vw-1.5rem)] ${maxWidth} rounded-3xl backdrop-blur-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-200 ${
          dark
            ? 'bg-slate-900/95 border border-slate-700/80 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.65)]'
            : 'bg-white/95 border border-white/70 text-[#0B2528] shadow-[0_24px_60px_rgba(11,37,40,0.18)]'
        }`}
      >
        {/* Sticky Header */}
        <header
          className={`px-6 py-5 border-b flex flex-col gap-3 shrink-0 ${
            dark ? 'border-slate-800/90 bg-slate-900/60' : 'border-slate-200/70 bg-white/60'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {iconBadge && (
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
                    dark
                      ? 'bg-[#14B8A6]/15 text-[#14B8A6] border border-[#14B8A6]/30'
                      : 'bg-[#0B2528] text-[#C8A96E] shadow-xs'
                  }`}
                >
                  {iconBadge}
                </div>
              )}
              <div className="min-w-0">
                <h2
                  className={`text-lg font-extrabold tracking-tight truncate ${
                    dark ? 'text-white' : 'text-[#0B2528]'
                  }`}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className={`text-xs mt-0.5 truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 ${
                dark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-[#F7F6F2] text-slate-500 hover:bg-slate-200/70 hover:text-[#0B2528]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Optional Internal Pill Tabs */}
          {tabs && tabs.length > 0 && (
            <div
              className={`flex flex-wrap items-center gap-1.5 p-1 rounded-full ${
                dark ? 'bg-slate-950/80 border border-slate-800' : 'bg-[#F7F6F2] border border-slate-200/70'
              }`}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                      isActive
                        ? dark
                          ? 'bg-[#14B8A6] text-slate-950 shadow-xs'
                          : 'bg-[#0B2528] text-white shadow-xs'
                        : dark
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 hover:text-[#0B2528]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-current'
                            : dark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-white text-[#0B2528]'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">{children}</div>

        {/* Sticky Bottom Action Bar */}
        {footer && (
          <footer
            className={`px-6 py-4 border-t shrink-0 ${
              dark ? 'border-slate-800/90 bg-slate-900/90' : 'border-slate-200/70 bg-white/90'
            }`}
          >
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}

export default FrostedSlideOverDrawer;
