'use client';

import React from 'react';

/* ============================================================================
   MICRO-WIDGET 1: Radial Progress Ring (Financial Progress, Occupancy, Timers)
   ============================================================================ */
export function RadialProgressRing({
  percentage,
  size = 156,
  strokeWidth = 14,
  primaryColor = '#0B2528',
  secondaryColor = '#C8A96E',
  trackColor = '#ECEAE2',
  centerLabel,
  centerSublabel,
  centerCaption,
  dualRing = false,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  trackColor?: string;
  centerLabel?: React.ReactNode;
  centerSublabel?: React.ReactNode;
  centerCaption?: React.ReactNode;
  dualRing?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const innerRadius = radius - strokeWidth - 4;
  const innerCircumference = 2 * Math.PI * Math.max(10, innerRadius);
  const innerOffset = innerCircumference - (Math.min(100, clamped * 0.85) / 100) * innerCircumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Secondary Accent Arc (e.g. Champagne Gold remaining half) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
          opacity={0.85}
        />
        {/* Primary Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        {dualRing && innerRadius > 14 && (
          <>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              fill="none"
              stroke={trackColor}
              strokeWidth={strokeWidth * 0.6}
              opacity={0.4}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              fill="none"
              stroke={secondaryColor}
              strokeWidth={strokeWidth * 0.6}
              strokeDasharray={innerCircumference}
              strokeDashoffset={innerOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        {centerLabel && (
          <span className="text-2xl font-extrabold tracking-tight tabular-nums leading-none">{centerLabel}</span>
        )}
        {centerSublabel && <span className="text-xs font-bold mt-1 leading-tight">{centerSublabel}</span>}
        {centerCaption && (
          <span className="text-[10px] text-slate-500 mt-0.5 tabular-nums leading-tight">{centerCaption}</span>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   MICRO-WIDGET 2: Loyalty Arc Gauge (Activity Rings matching Patient Mockup)
   ============================================================================ */
export function LoyaltyArcGauge({
  points = 320,
  maxPoints = 500,
  label = 'pts',
  subtitle = 'Gauge',
  footerLabel = 'Activity Rings',
}: {
  points?: number;
  maxPoints?: number;
  label?: string;
  subtitle?: string;
  footerLabel?: string;
}) {
  const pct = Math.min(100, Math.round((points / maxPoints) * 100));
  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg viewBox="0 0 180 150" className="w-44 h-36">
        {/* Outer Track Arc */}
        <path
          d="M 24 126 A 72 72 0 1 1 156 126"
          fill="none"
          stroke="#E6E4DD"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* Outer Gold + Emerald Progress Arc */}
        <path
          d="M 24 126 A 72 72 0 1 1 156 126"
          fill="none"
          stroke="#0B2528"
          strokeWidth="11"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${pct} 100`}
        />
        {/* Inner Champagne Gold Ring */}
        <path
          d="M 38 120 A 56 56 0 1 1 142 120"
          fill="none"
          stroke="#C8A96E"
          strokeWidth="8"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="74 100"
        />
        {/* Innermost Emerald Ring */}
        <path
          d="M 50 114 A 42 42 0 1 1 130 114"
          fill="none"
          stroke="#14B8A6"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="62 100"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 text-center">
        <div className="text-2xl font-extrabold text-[#0B2528] tabular-nums leading-none">
          {points} <span className="text-sm font-bold">{label}</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 mt-1">{subtitle}</span>
        <span className="text-[10px] font-bold text-slate-400 mt-3 leading-tight max-w-[80px]">{footerLabel}</span>
      </div>
    </div>
  );
}

/* ============================================================================
   MICRO-WIDGET 3: Glowing Pill Toggle Switch
   ============================================================================ */
export function PillToggleSwitch({
  checked,
  onChange,
  label,
  icon,
  dark = false,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  dark?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={`flex items-center justify-between gap-3 py-2.5 px-3.5 rounded-2xl cursor-pointer select-none transition-all ${
        dark
          ? 'bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-slate-200'
          : 'bg-[#F7F6F2] hover:bg-[#F0EFEA] border border-slate-200/70 text-[#0B2528]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-2.5 text-xs font-bold min-w-0">
        {icon && <span className={dark ? 'text-[#14B8A6]' : 'text-[#C8A96E]'}>{icon}</span>}
        {label && <span className="truncate">{label}</span>}
      </div>
      <div
        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
          checked
            ? dark
              ? 'bg-[#14B8A6] shadow-[0_0_12px_rgba(20,184,166,0.45)]'
              : 'bg-[#0B2528] shadow-[0_0_10px_rgba(11,37,40,0.25)]'
            : dark
            ? 'bg-slate-700'
            : 'bg-slate-300'
        }`}
      >
        <span
          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
            checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
}

/* ============================================================================
   MICRO-WIDGET 4: Animated Floating Pill Tab Switcher
   ============================================================================ */
export function FloatingPillTabs({
  tabs,
  activeTab,
  onChange,
  dark = false,
  className = '',
}: {
  tabs: Array<{ id: string; label: React.ReactNode; icon?: React.ReactNode; count?: number | string }>;
  activeTab: string;
  onChange: (id: string) => void;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-full border ${
        dark
          ? 'bg-slate-900/90 border-slate-800 text-slate-300'
          : 'bg-white/90 border-slate-200/80 shadow-[0_2px_12px_rgba(11,37,40,0.04)]'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 ${
              active
                ? dark
                  ? 'bg-[#14B8A6] text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.35)]'
                  : 'bg-[#0B2528] text-white shadow-sm'
                : dark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-[#0B2528] hover:bg-[#F7F6F2]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tabular-nums ${
                  active
                    ? 'bg-white/20 text-current'
                    : dark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-[#F7F6F2] text-[#0B2528]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   MICRO-WIDGET 5: Proportional Horizontal Stacked Status Bar
   ============================================================================ */
export function ProportionalStatusBar({
  segments,
}: {
  segments: Array<{ label: string; value: number; displayValue?: string; color: string }>;
}) {
  const total = Math.max(
    1,
    segments.reduce((acc, s) => acc + Math.max(1, s.value), 0)
  );
  return (
    <div className="space-y-4">
      <div className="w-full h-7 rounded-2xl overflow-hidden flex bg-slate-100 p-0.5 gap-0.5">
        {segments.map((seg, i) => {
          const widthPct = Math.max(8, Math.round((Math.max(1, seg.value) / total) * 100));
          return (
            <div
              key={i}
              style={{ width: `${widthPct}%`, backgroundColor: seg.color }}
              className="h-full first:rounded-s-xl last:rounded-e-xl transition-all duration-500"
              title={`${seg.label}: ${seg.displayValue || `${seg.value}%`}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments.map((seg, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="truncate">{seg.label}</span>
            </div>
            <div className="text-base font-extrabold text-[#0B2528] tabular-nums ps-4">
              {seg.displayValue || `${seg.value}%`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   UNIVERSAL SUB-PAGE CANVAS (<VisualSubPageCanvas />)
   ============================================================================ */
export function VisualSubPageCanvas({
  title,
  subtitle,
  badge,
  actions,
  kpis,
  filterBar,
  children,
  dark = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  kpis?: Array<{
    label: React.ReactNode;
    value: React.ReactNode;
    sublabel?: React.ReactNode;
    tone?: 'emerald' | 'gold' | 'teal' | 'rose';
    onClick?: () => void;
  }>;
  filterBar?: React.ReactNode;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 ${
        dark ? 'text-slate-100' : 'text-[#0B2528]'
      }`}
    >
      {/* Top Header Strip */}
      <header
        className={`rounded-3xl p-6 border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
          dark
            ? 'bg-slate-900/85 border-slate-800 shadow-xl'
            : 'bg-white border-slate-200/70 shadow-[0_2px_12px_rgba(11,37,40,0.04)]'
        }`}
      >
        <div className="space-y-1">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9F5EB] text-[#0B2528] border border-[#C8A96E]/40 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#C8A96E]" />
              <span>{badge}</span>
            </div>
          )}
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-[#0B2528]'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-xs sm:text-sm max-w-2xl ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
      </header>

      {/* Visual KPI Strip */}
      {kpis && kpis.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, kpis.length)} gap-4`}>
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              onClick={kpi.onClick}
              className={`bento-card rounded-3xl p-5 border flex items-center justify-between gap-4 ${
                kpi.onClick ? 'cursor-pointer' : ''
              } ${
                dark
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-white border-slate-200/70 shadow-[0_2px_12px_rgba(11,37,40,0.04)]'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <span className={`text-xs font-bold uppercase tracking-wider block ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {kpi.label}
                </span>
                <strong
                  className={`text-2xl font-extrabold tabular-nums block truncate ${
                    dark ? 'text-white' : 'text-[#0B2528]'
                  }`}
                >
                  {kpi.value}
                </strong>
                {kpi.sublabel && (
                  <span className="text-[11px] font-semibold text-[#C8A96E] block truncate">{kpi.sublabel}</span>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-xs ${
                  kpi.tone === 'gold'
                    ? 'bg-[#F9F5EB] text-[#C8A96E] border border-[#C8A96E]/30'
                    : kpi.tone === 'rose'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-[#E6F0EE] text-[#0B2528] border border-[#0B2528]/10'
                }`}
              >
                ●
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Filter Pill Bar */}
      {filterBar && <div>{filterBar}</div>}

      {/* Bento Content Grid */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export default VisualSubPageCanvas;
