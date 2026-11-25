'use client';

import {TranslatedText} from '@/components/TranslatedText';


import React, { useState } from 'react';

// ============================================================================
// 1. MULTI-SERIES TIME-SERIES / GROUPED BAR & LINE CHART
//    Used in:
//    - Owner / Executive (/management): Invoiced vs. Collected vs. Expenses over time
//    - Finance (/billing): Monthly / Period Revenue vs. Collections vs. Expenses
// ============================================================================

export interface TimeSeriesPoint {
  label: string;
  invoicedEgp: number;
  collectedEgp: number;
  expensesEgp: number;
}

interface TimeSeriesComparisonChartProps {
  title: string;
  subtitle?: string;
  data: TimeSeriesPoint[];
  currencyLabel?: string;
}

export function TimeSeriesComparisonChart({
  title,
  subtitle,
  data,
  currencyLabel = 'EGP',
}: TimeSeriesComparisonChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<{
    invoiced: boolean;
    collected: boolean;
    expenses: boolean;
  }>({
    invoiced: true,
    collected: true,
    expenses: true,
  });

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#DDE5E1] p-6 text-center text-xs text-slate-500"> <TranslatedText text="No time-series financial data available for the selected filter." /> </div>
    );
  }

  const maxValue = Math.max(
    1000,
    ...data.flatMap((d) => [
      visibleSeries.invoiced ? d.invoicedEgp : 0,
      visibleSeries.collected ? d.collectedEgp : 0,
      visibleSeries.expenses ? d.expensesEgp : 0,
    ])
  );

  const toggleSeries = (key: 'invoiced' | 'collected' | 'expenses') => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5E1] p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#102A5E]"><TranslatedText text={String(title)}/></h3>
          {subtitle && <p className="text-xs text-[#526574] mt-0.5"><TranslatedText text={String(subtitle)}/></p>}
        </div>

        {/* Interactive Series Legend Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => toggleSeries('invoiced')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              visibleSeries.invoiced
                ? 'bg-[#102A5E]/10 border-[#102A5E]/30 text-[#102A5E]'
                : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-[#102A5E]" />
            <span><TranslatedText text="Invoiced (" /><TranslatedText text={String(currencyLabel)}/>)</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSeries('collected')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              visibleSeries.collected
                ? 'bg-[#4169E1]/10 border-[#4169E1]/30 text-[#4169E1]'
                : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4169E1]" />
            <span><TranslatedText text="Collected (" /><TranslatedText text={String(currencyLabel)}/>)</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSeries('expenses')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              visibleSeries.expenses
                ? 'bg-[#D58B57]/15 border-[#D58B57]/40 text-[#8A5300]'
                : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D58B57]" />
            <span><TranslatedText text="Expenses (" /><TranslatedText text={String(currencyLabel)}/>)</span>
          </button>
        </div>
      </div>

      {/* Hover Tooltip Readout Banner */}
      <div className="min-h-[34px] px-3.5 py-2 rounded-xl bg-[#F7FAFF] border border-[#DDE5E1] flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums">
        {hoveredIdx !== null && data[hoveredIdx] ? (
          <>
            <span className="font-bold text-[#102A5E]"><TranslatedText text={String(data[hoveredIdx].label)}/></span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#102A5E]"> <TranslatedText text="Invoiced:" /> <strong>{data[hoveredIdx].invoicedEgp.toLocaleString()} <TranslatedText text={String(currencyLabel)}/></strong>
              </span>
              <span className="text-[#4169E1]"> <TranslatedText text="Collected:" /> <strong>{data[hoveredIdx].collectedEgp.toLocaleString()} <TranslatedText text={String(currencyLabel)}/></strong>
              </span>
              <span className="text-[#8A5300]"> <TranslatedText text="Expenses:" /> <strong>{data[hoveredIdx].expensesEgp.toLocaleString()} <TranslatedText text={String(currencyLabel)}/></strong>
              </span>
              <span className="font-bold text-emerald-800"> <TranslatedText text="Net Cashflow:" />{' '}
                {(data[hoveredIdx].collectedEgp - data[hoveredIdx].expensesEgp).toLocaleString()} <TranslatedText text={String(currencyLabel)}/>
              </span>
            </div>
          </>
        ) : (
          <span className="text-xs text-[#526574]"> <TranslatedText text="Hover or focus on any period bar group below to inspect exact EGP Invoiced, Collected, Expenses, and Net Cashflow." /> </span>
        )}
      </div>

      {/* SVG Grouped Bar Chart */}
      <div className="relative pt-2">
        <svg
          role="img"
          aria-label={title}
          viewBox="0 0 720 220"
          className="w-full h-52 overflow-visible"
        >
          <desc>{subtitle || title}</desc>
          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = 180 - ratio * 150;
            const val = Math.round(maxValue * ratio);
            return (
              <g key={idx}>
                <line
                  x1={56}
                  y1={y}
                  x2={705}
                  y2={y}
                  stroke="#E6ECE9"
                  strokeDasharray={ratio === 0 ? undefined : '4 4'}
                  strokeWidth={1}
                />
                <text
                  x={50}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-xs font-mono"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Bar Groups */}
          {data.map((point, idx) => {
            const groupWidth = 640 / Math.max(1, data.length);
            const groupX = 64 + idx * groupWidth;
            const barWidth = Math.min(20, Math.max(10, Math.floor(groupWidth / 4.2)));

            const invH = visibleSeries.invoiced ? Math.max(3, (point.invoicedEgp / maxValue) * 150) : 0;
            const colH = visibleSeries.collected ? Math.max(3, (point.collectedEgp / maxValue) * 150) : 0;
            const expH = visibleSeries.expenses ? Math.max(3, (point.expensesEgp / maxValue) * 150) : 0;

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={point.label}
                tabIndex={0}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onFocus={() => setHoveredIdx(idx)}
                onBlur={() => setHoveredIdx(null)}
                className="cursor-pointer focus:outline-none"
              >
                {/* Hover highlight backdrop */}
                {isHovered && (
                  <rect
                    x={groupX - 6}
                    y={24}
                    width={barWidth * 3 + 20}
                    height={160}
                    rx={8}
                    fill="#EFF5FF"
                    opacity={0.45}
                  />
                )}

                {/* Invoiced Bar */}
                {visibleSeries.invoiced && (
                  <rect
                    x={groupX}
                    y={180 - invH}
                    width={barWidth}
                    height={invH}
                    rx={3}
                    fill="#102A5E"
                  />
                )}

                {/* Collected Bar */}
                {visibleSeries.collected && (
                  <rect
                    x={groupX + barWidth + 4}
                    y={180 - colH}
                    width={barWidth}
                    height={colH}
                    rx={3}
                    fill="#4169E1"
                  />
                )}

                {/* Expenses Bar */}
                {visibleSeries.expenses && (
                  <rect
                    x={groupX + (barWidth + 4) * 2}
                    y={180 - expH}
                    width={barWidth}
                    height={expH}
                    rx={3}
                    fill="#D58B57"
                  />
                )}

                {/* X-Axis Label */}
                <text
                  x={groupX + barWidth * 1.5 + 2}
                  y={198}
                  textAnchor="middle"
                  className={`text-xs font-semibold ${
                    isHovered ? 'fill-[#102A5E] font-bold' : 'fill-slate-500'
                  }`}
                >
                  <TranslatedText text={String(point.label)}/>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// 2. INTERACTIVE DONUT BREAKDOWN CHART
//    Used in:
//    - Finance (/billing): Collections by Payment Method (Cash, Card, InstaPay, Fawry)
//    - CRM (/crm): Inquiry Sources Breakdown (Website, Phone, WhatsApp, Walk-In)
//    - Executive (/management): Appointment Attendance Status Breakdown
// ============================================================================

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
   formattedValue?: string;
}

interface DonutBreakdownChartProps {
  title: string;
  subtitle?: string;
  centerLabel: string;
  centerValue: string;
  slices: DonutSlice[];
  unitSuffix?: string;
}

export function DonutBreakdownChart({
  title,
  subtitle,
  centerLabel,
  centerValue,
  slices,
  unitSuffix = '',
}: DonutBreakdownChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const total = slices.reduce((sum, s) => sum + Math.max(0, s.value), 0);

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5E1] p-5 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-[#102A5E]"><TranslatedText text={String(title)}/></h3>
        {subtitle && <p className="text-xs text-[#526574] mt-0.5"><TranslatedText text={String(subtitle)}/></p>}
      </div>

      {total === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400"> <TranslatedText text="No recorded values in this period." /> </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* SVG Donut */}
          <div className="sm:col-span-5 flex justify-center">
            <svg
              role="img"
              aria-label={title}
              viewBox="0 0 160 160"
              className="w-36 h-36"
            >
              <circle
                cx={80}
                cy={80}
                r={radius}
                fill="transparent"
                stroke="#F1F5F3"
                strokeWidth={22}
              />
              {slices.map((slice) => {
                if (slice.value <= 0) return null;
                const fraction = slice.value / total;
                const dashArray = `${fraction * circumference} ${circumference}`;
                const dashOffset = -cumulativeFraction * circumference;
                cumulativeFraction += fraction;
                const isHovered = activeId === slice.id;

                return (
                  <circle
                    key={slice.id}
                    cx={80}
                    cy={80}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? 26 : 22}
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 80 80)"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setActiveId(slice.id)}
                    onMouseLeave={() => setActiveId(null)}
                  />
                );
              })}
              <text
                x={80}
                y={75}
                textAnchor="middle"
                className="fill-slate-400 text-xs font-bold uppercase"
              >
                {centerLabel}
              </text>
              <text
                x={80}
                y={93}
                textAnchor="middle"
                className="fill-[#102A5E] text-xs font-extrabold font-mono"
              >
                {centerValue}
              </text>
            </svg>
          </div>

          {/* Interactive Legend with Exact Amounts & Percentages */}
          <div className="sm:col-span-7 space-y-2">
            {slices.map((slice) => {
              const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
              const isHovered = activeId === slice.id;
              return (
                <div
                  key={slice.id}
                  onMouseEnter={() => setActiveId(slice.id)}
                  onMouseLeave={() => setActiveId(null)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors cursor-pointer tabular-nums ${
                    isHovered
                      ? 'bg-[#EFF5FF]/60 border-[#4169E1]'
                      : 'bg-[#F7FAFF] border-transparent hover:border-[#DDE5E1]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="font-semibold text-[#102A5E] truncate"><TranslatedText text={String(slice.label)}/></span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-[#102A5E]">
                      {slice.formattedValue ?? `${slice.value.toLocaleString()}${unitSuffix ? ` ${unitSuffix}` : ''}`}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDE5E1] text-xs font-mono font-bold text-[#4169E1]">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. 4-STAGE CONVERSION FUNNEL CHART
//    Used in:
//    - CRM (/crm): Inquiry Received -> Contacted -> Booking Confirmed -> Visit Attended
//    - Executive (/management): Patient Acquisition & Attendance Funnel
// ============================================================================

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  helperText: string;
  color: string;
}

interface ConversionFunnelChartProps {
  title: string;
  subtitle?: string;
  stages: FunnelStage[];
}

export function ConversionFunnelChart({ title, subtitle, stages }: ConversionFunnelChartProps) {
  const topCount = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5E1] p-5 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#102A5E]"><TranslatedText text={String(title)}/></h3>
          {subtitle && <p className="text-xs text-[#526574] mt-0.5"><TranslatedText text={String(subtitle)}/></p>}
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-[#EFF5FF] text-[#4169E1] text-xs font-bold"> <TranslatedText text="Stage-to-Stage Attribution" /> </span>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const widthPct = Math.max(12, Math.round((stage.count / topCount) * 100));
          const prevCount = idx > 0 ? stages[idx - 1].count : stage.count;
          const stepConversion =
            idx === 0
              ? '100% Entry'
              : prevCount > 0
              ? `${Math.min(100, Math.round((stage.count / prevCount) * 100))}% of prior stage`
              : 'No prior stage baseline';

          return (
            <div key={stage.id} className="p-3 rounded-xl bg-[#F7FAFF] border border-[#DDE5E1] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#102A5E] text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-[#102A5E]"><TranslatedText text={String(stage.label)}/></span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-sm font-extrabold text-[#102A5E]">{stage.count}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-[#DDE5E1] text-xs font-mono font-semibold text-[#4169E1]">
                    <TranslatedText text={stepConversion}/>
                  </span>
                </div>
              </div>

              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#DDE5E1]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                />
              </div>

              <div className="text-xs text-[#526574]"><TranslatedText text={String(stage.helperText)}/></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 4. OUTSTANDING RECEIVABLES AGING BUCKET CHART
//    Used in:
//    - Finance (/billing): 0-30 Days, 31-60 Days, 61-90+ Days Receivable Aging
// ============================================================================

export interface AgingBucket {
  bucket: string;
  amountEgp: number;
  invoiceCount: number;
  severity: 'normal' | 'warning' | 'critical';
}

export function AgingBalancesChart({ buckets }: { buckets: AgingBucket[] }) {
  const maxAmt = Math.max(500, ...buckets.map((b) => b.amountEgp));
  const totalAging = buckets.reduce((s, b) => s + b.amountEgp, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#DDE5E1] p-5 shadow-2xs space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#102A5E]"> <TranslatedText text="Outstanding Patient Balances &amp; Receivables Aging" /> </h3>
          <p className="text-xs text-[#526574] mt-0.5"> <TranslatedText text="Unpaid invoice balances grouped by days since invoice issuance" /> </p>
        </div>
        <div className="text-right tabular-nums">
          <span className="text-xs font-bold uppercase text-slate-400 block"><TranslatedText text="Total Receivables" /></span>
          <span className="text-sm font-extrabold text-[#102A5E]">
            {totalAging.toLocaleString()} <TranslatedText text="EGP" /> </span>
        </div>
      </div>

      <div className="space-y-3">
        {buckets.map((b) => {
          const pct = Math.min(100, Math.round((b.amountEgp / maxAmt) * 100));
          const barColor =
            b.severity === 'critical'
              ? '#B42318'
              : b.severity === 'warning'
              ? '#D58B57'
              : '#4169E1';

          return (
            <div key={b.bucket} className="p-3 rounded-xl bg-[#F7FAFF] border border-[#DDE5E1] space-y-1.5">
              <div className="flex items-center justify-between text-xs tabular-nums">
                <span className="font-bold text-[#102A5E]">{b.bucket}</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#102A5E]">
                    {b.amountEgp.toLocaleString()} <TranslatedText text="EGP" /> </span>
                  <span className="text-xs text-[#526574]">
                    ({b.invoiceCount} <TranslatedText text={String(b.invoiceCount === 1 ? 'invoice' : 'invoices')}/>)
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#DDE5E1]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(4, pct)}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. CIRCULAR GAUGE CHART (Matching Image 1: BDENTIST Clinical KPIs)
//    Used for: On-time rate (92.4%), Re-treatment rate (2.9%), Chair utilization
// ============================================================================

export function CircularGaugeChart({
  label,
  value,
  max = 100,
  unit = '%',
  color = '#BCE636',
  trackColor = '#F1F5F3',
  size = 110,
  strokeWidth = 14,
}: {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
  trackColor?: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, value / max));
  const dashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className="animate-gauge-sweep transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider"><TranslatedText text={String(label)}/></span>
          <span className="text-base font-extrabold text-slate-900 tabular-nums">
            {value}
            <span className="text-xs font-semibold text-slate-500"><TranslatedText text={String(unit)}/></span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. SPLINE CASHFLOW / TREND CHART (Matching Image 5: Zendenta & Image 3: Nexoria)
//    Used for: Cashflow, Invoiced Revenue, Net Performance
// ============================================================================

export interface SplinePoint {
  label: string;
  value: number;
}

export function SplineCashflowChart({
  title,
  subtitle,
  data,
  kpiValue,
  kpiBadge,
  currency = 'EGP',
}: {
  title: string;
  subtitle?: string;
  data: SplinePoint[];
  kpiValue?: string;
  kpiBadge?: string;
  currency?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(100, ...data.map((d) => d.value));
  const minVal = 0;

  const stepX = (width - paddingX * 2) / Math.max(1, data.length - 1);
  const coords = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal || 1)) * (height - paddingY * 2);
    return { x, y, label: d.label, value: d.value };
  });

  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-5 sm:p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400"><TranslatedText text={String(title)}/></span>
          {kpiValue && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {kpiValue} <span className="text-xs font-semibold text-slate-500"><TranslatedText text={String(currency)}/></span>
              </span>
              {kpiBadge && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <TranslatedText text={String(kpiBadge)}/>
                </span>
              )}
            </div>
          )}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5"><TranslatedText text={String(subtitle)}/></p>}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4169E1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4169E1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Area Fill with enter animation */}
          <path d={areaD} fill="url(#splineGradient)" className="animate-chart-area" />

          {/* Spline Line with stroke draw animation */}
          <path d={pathD} fill="none" stroke="#4169E1" strokeWidth={3} strokeLinecap="round" className="animate-chart-line" />

          {/* Points & Interactive Tooltips */}
          {coords.map((pt, i) => {
            const isHov = hoveredIdx === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHov ? 7 : 4}
                  fill={isHov ? '#102A5E' : '#FFFFFF'}
                  stroke="#4169E1"
                  strokeWidth={isHov ? 3 : 2}
                  className="transition-all duration-200"
                />
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-400"
                >
                  <TranslatedText text={String(pt.label)}/>
                </text>
                {isHov && (
                  <g>
                    <rect
                      x={pt.x - 38}
                      y={pt.y - 32}
                      width={76}
                      height={24}
                      rx={6}
                      fill="#0c2438"
                      className="drop-shadow-md"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 16}
                      textAnchor="middle"
                      className="fill-white text-xs font-bold tabular-nums"
                    >
                      {pt.value.toLocaleString()} <TranslatedText text={String(currency)}/>
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// 7. PASTEL KPI METRIC CARD (Matching Image 2: Purchasing & Inventory)
// ============================================================================

export function PastelKpiCard({
  count,
  label,
  variant,
  subtext,
  value,
  title,
  color,
  subtitle,
}: {
  count?: number | string;
  label?: string;
  variant?: 'rose' | 'amber' | 'mint' | 'coral' | 'cream' | 'pistachio' | 'lavender';
  subtext?: string;
  value?: number | string;
  title?: string;
  color?: string;
  subtitle?: string;
}) {
  const colorMap: Record<string, string> = {
    rose: 'bg-[#FFF0F2] text-[#B42318] border-[#FFE2E6]',
    amber: 'bg-[#FFF6EB] text-[#C96A12] border-[#FCE6CE]',
    mint: 'bg-[#EBF9F1] text-[#2446A6] border-[#D4F3E2]',
    coral: 'bg-[#FFF2EE] text-[#D5573B] border-[#FEE1D8]',
    cream: 'bg-[#FFF9EA] text-[#8A5300] border-[#FDEFC9]',
    pistachio: 'bg-[#F2FAF4] text-[#146C43] border-[#DCF2E4]',
    lavender: 'bg-[#F9F0FF] text-[#6941A5] border-[#EEDBFD]',
  };

  const chosenKey = (variant || color || 'mint').toLowerCase();
  const style = colorMap[chosenKey] || colorMap.mint;
  const displayVal = count !== undefined ? count : value ?? '';
  const displayLabel = label !== undefined ? label : title ?? '';
  const displaySubtext = subtext !== undefined ? subtext : subtitle;

  return (
    <div className={`p-4 sm:p-5 rounded-[22px] border ${style} flex items-center justify-between gap-3 shadow-xs hover:scale-[1.02] transition-transform`}>
      <span className="text-3xl sm:text-4xl font-black tabular-nums">{displayVal}</span>
      <div className="text-right">
        <span className="text-xs font-extrabold uppercase tracking-wide block leading-tight text-slate-800">
          {displayLabel}
        </span>
        {displaySubtext && <span className="text-xs text-slate-500 font-medium block mt-0.5">{displaySubtext}</span>}
      </div>
    </div>
  );
}

