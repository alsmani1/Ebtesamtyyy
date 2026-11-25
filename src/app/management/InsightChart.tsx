'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function InsightChart({
  title,
  rows,
  empty,
  mode = 'bar',
}: {
  title: string;
  rows: { label: string; value: number }[];
  empty: string;
  mode?: 'bar' | 'line' | 'donut' | 'pie';
}) {
  const [chosen, setChosen] = useState<number | null>(null);
  const maximum = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((s, r) => s + r.value, 0);
  const coordinates = rows.map((r, i) => ({
    x: 45 + (i * 610) / Math.max(1, rows.length - 1),
    y: 210 - (r.value / maximum) * 160,
  }));
  const curve = coordinates
    .map((point, i) => {
      if (!i) return `M${point.x},${point.y}`;
      const previous = coordinates[i - 1];
      const middle = (previous.x + point.x) / 2;
      return `C${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <figure className="surface-card">
      <figcaption className="text-base font-extrabold text-[#0B2528] mb-4">{title}</figcaption>
      {!rows.length ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <>
          {mode === 'line' ? (
            <svg viewBox="0 0 700 260" role="img" aria-label={title} className="w-full">
              <defs>
                <linearGradient id="insight-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M45 35V210H670" fill="none" stroke="#E2E8F0" />
              {coordinates.length > 1 && (
                <path
                  d={`${curve} L ${coordinates[coordinates.length - 1].x},210 L ${
                    coordinates[0].x
                  },210 Z`}
                  fill="url(#insight-area-grad)"
                />
              )}
              <path d={curve} fill="none" stroke="#0D9488" strokeWidth="4" strokeLinecap="round" />
              {rows.map((r, i) => (
                <g key={r.label} onMouseEnter={() => setChosen(i)}>
                  <circle
                    cx={45 + (i * 610) / Math.max(1, rows.length - 1)}
                    cy={210 - (r.value / maximum) * 160}
                    r="6"
                    fill="#0B2528"
                    stroke="#C8A96E"
                    strokeWidth="2"
                  >
                    <title>{r.label + ' · ' + r.value}</title>
                  </circle>
                  {(i === 0 || i === rows.length - 1) && (
                    <text
                      x={45 + (i * 610) / Math.max(1, rows.length - 1)}
                      y="240"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#64748B"
                    >
                      {r.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          ) : mode === 'donut' || mode === 'pie' ? (
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-52" role="img" aria-label={title}>
                {rows.map((r, i) => {
                  const before = rows.slice(0, i).reduce((s, r) => s + r.value, 0);
                  return (
                    <circle
                      key={r.label}
                      cx="100"
                      cy="100"
                      r={mode === 'pie' ? 35 : 70}
                      fill="none"
                      stroke={['#0B2528', '#0D9488', '#C8A96E', '#2DD4BF', '#64748B'][i % 5]}
                      strokeWidth={mode === 'pie' ? 70 : 26}
                      pathLength="100"
                      strokeDasharray={`${total ? (r.value / total) * 100 : 0} 100`}
                      strokeDashoffset={total ? (-before / total) * 100 : 0}
                      transform="rotate(-90 100 100)"
                    >
                      <title>{r.label + ' · ' + r.value}</title>
                    </circle>
                  );
                })}
                {mode !== 'pie' && (
                  <text
                    x="100"
                    y="108"
                    textAnchor="middle"
                    fontSize="22"
                    fontWeight="800"
                    fill="#0B2528"
                  >
                    {total.toLocaleString()}
                  </text>
                )}
              </svg>
            </div>
          ) : (
            rows.map((r, i) => (
              <button
                key={r.label}
                className="block w-full text-start py-2"
                onClick={() => setChosen(chosen === i ? null : i)}
                aria-pressed={chosen === i}
              >
                <span className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[#0B2528]">{r.label}</span>
                  <b className="tabular-nums text-[#0B2528]">{r.value.toLocaleString()}</b>
                </span>
                <span className="block h-3.5 rounded-full bg-[#F7F6F2] overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#0B2528] to-[#0D9488]"
                    style={{ width: (100 * r.value) / maximum + '%' }}
                  />
                </span>
              </button>
            ))
          )}
          {chosen !== null && rows[chosen] && (
            <p
              role="status"
              className="rounded-2xl bg-[#F9F5EB] border border-[#C8A96E]/40 p-3 text-xs font-extrabold text-[#0B2528] mt-3"
            >
              {rows[chosen].label} · {rows[chosen].value.toLocaleString()}
            </p>
          )}
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-bold text-slate-500">
              {documentLabel()}
            </summary>
            <table className="workflow-table">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th>{r.label}</th>
                    <td className="tabular-nums">{r.value.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </figure>
  );
}

function documentLabel() {
  return 'Data / البيانات';
}

export function BranchComparison({
  rows,
  ar,
}: {
  rows: {
    branch: { id: string; name: string };
    issued: number;
    paid: number;
    due: number;
    expenses: number;
    visits: number;
  }[];
  ar: boolean;
}) {
  const params = useSearchParams();
  const drill = (branchId: string) => {
    const query = new URLSearchParams(params.toString());
    query.set('view', 'finance');
    query.set('branchId', branchId);
    return '/management?' + query.toString();
  };
  const [metric, setMetric] = useState<'paid' | 'issued' | 'due' | 'expenses' | 'visits'>('paid');
  const [chartMode, setChartMode] = useState<'donut' | 'line' | 'bar'>('donut');
  const labels = {
    paid: ar ? 'التحصيل (ج.م)' : 'Collections (EGP)',
    issued: ar ? 'الفواتير (ج.م)' : 'Invoiced (EGP)',
    due: ar ? 'المتبقي (ج.م)' : 'Outstanding (EGP)',
    expenses: ar ? 'المصروفات (ج.م)' : 'Expenses (EGP)',
    visits: ar ? 'المواعيد' : 'Appointments',
  };
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-xs font-bold text-[#0B2528] flex items-center gap-2">
          <span>{ar ? 'مقياس المقارنة' : 'Compare metric'}</span>
          <select
            className="field"
            value={metric}
            onChange={(e) => setMetric(e.target.value as typeof metric)}
          >
            {Object.entries(labels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="inline-flex p-1 rounded-full bg-white border border-slate-200/80 gap-1">
          <button
            className={`px-3.5 py-1.5 text-xs rounded-full font-extrabold transition-all ${
              chartMode === 'donut' ? 'bg-[#0B2528] text-white' : 'text-slate-600'
            }`}
            onClick={() => setChartMode('donut')}
          >
            {ar ? 'دائري (Pie)' : 'Donut / Pie'}
          </button>
          <button
            className={`px-3.5 py-1.5 text-xs rounded-full font-extrabold transition-all ${
              chartMode === 'line' ? 'bg-[#0B2528] text-white' : 'text-slate-600'
            }`}
            onClick={() => setChartMode('line')}
          >
            {ar ? 'منحنى (Curve)' : 'Curve / Line'}
          </button>
          <button
            className={`px-3.5 py-1.5 text-xs rounded-full font-extrabold transition-all ${
              chartMode === 'bar' ? 'bg-[#0B2528] text-white' : 'text-slate-600'
            }`}
            onClick={() => setChartMode('bar')}
          >
            {ar ? 'أعمدة (Bar)' : 'Bar'}
          </button>
        </div>
      </div>
      <InsightChart
        mode={chartMode}
        title={labels[metric]}
        empty={ar ? 'لا توجد بيانات' : 'No records'}
        rows={rows.map((r) => ({
          label: r.branch.name,
          value: r[metric] / (metric === 'visits' ? 1 : 100),
        }))}
      />
      <div className="flex flex-wrap gap-3">
        {rows.map((r) => (
          <a className="secondary-button" key={r.branch.id} href={drill(r.branch.id)}>
            {r.branch.name} →
          </a>
        ))}
      </div>
    </section>
  );
}
