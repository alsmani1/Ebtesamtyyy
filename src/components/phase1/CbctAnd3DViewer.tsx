'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { clinicDateISO } from '@/lib/clinic-clock';
import {
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Ruler,
  Crosshair,
  Sun,
  Maximize2,
  Play,
  SkipBack,
  SkipForward,
  CheckCircle2,
  Sparkles,
  Download,
  Layers,
} from 'lucide-react';

export function CbctAnd3DViewer({
  role = 'DENTIST',
  patientName = 'Ahmed Mohamed',
  studyDate = clinicDateISO(-159),
}: {
  role?: 'OWNER_ADMIN' | 'DENTIST' | 'RECEPTIONIST' | 'PATIENT';
  patientName?: string;
  studyDate?: string;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);

  // Enforce RBAC permissions from the 18-feature matrix:
  // - X-ray and CBCT viewer: Owner (View-Only), Doctor (Full diagnostic & annotations), Receptionist (Upload-Only), Patient (View Own + download/share)
  // - X-ray AI: Owner (Owner Toggle), Doctor (Full automated caries/pathology detection), Receptionist (None), Patient (None - requires doctor explanation)
  const canAnnotate = role === 'DENTIST';
  const canUseAi = role === 'DENTIST' || role === 'OWNER_ADMIN';

  const [viewerTab, setViewerTab] = useState<'cbct' | 'model3d' | 'xray2d'>('cbct');
  const [cbctMode, setCbctMode] = useState<'reading' | 'implant' | 'ortho'>('reading');
  const [activeTool, setActiveTool] = useState<'crosshair' | 'ruler' | 'window' | 'zoom' | 'pan'>('ruler');
  const [axialSlice, setAxialSlice] = useState<number>(129);
  const [coronalSlice, setCoronalSlice] = useState<number>(177);
  const [zoomPct, setZoomPct] = useState<number>(100);
  const [windowWidth, setWindowWidth] = useState<number>(2500);
  const [windowLevel, setWindowLevel] = useState<number>(600);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Interactive Ruler Measurements in mm
  const [measurements, setMeasurements] = useState([
    { id: 'm-1', plane: 'AXIAL', label: '3.47 mm', x: 53, y: 36, desc: 'Bucco-lingual ridge width' },
    { id: 'm-2', plane: 'AXIAL', label: '2.85 mm', x: 43, y: 24, desc: 'Cortical plate thickness' },
    { id: 'm-3', plane: 'CORONAL', label: '11.40 mm', x: 59, y: 44, desc: 'Crest to IAN canal height' },
  ]);

  // Auto-Detected AI Tooth Map Suggestions (Kept as suggestion until doctor approves)
  const [aiSuggestions, setAiSuggestions] = useState([
    {
      id: 'ai-21',
      tooth: '21',
      findingEn: 'Auto-detected tooth map #21: Periapical bone density normal, root length 13.4 mm',
      findingAr: 'خريطة الأسنان المكتشفة تلقائياً (#21): كثافة العظم طبيعية وطول الجذر 13.4 مم',
      status: 'SUGGESTED' as 'SUGGESTED' | 'APPROVED' | 'DISMISSED',
    },
    {
      id: 'ai-36',
      tooth: '36',
      findingEn: 'Implant site #36: Available bone width 3.47 mm · Safe distance to nerve canal',
      findingAr: 'موقع الزراعة (#36): عرض العظم المتاح 3.47 مم · مسافة آمنة عن قناة العصب',
      status: 'SUGGESTED' as 'SUGGESTED' | 'APPROVED' | 'DISMISSED',
    },
  ]);

  // Image 15: 3D Model Orientation State (Front | Back | Right | Left | Top | Bottom | Mesh)
  const [modelViewPreset, setModelViewPreset] = useState<
    'Front' | 'Back' | 'Right' | 'Left' | 'Top' | 'Bottom' | 'Mesh'
  >('Front');
  const [modelZoom, setModelZoom] = useState<number>(100);

  const get3DTransform = () => {
    switch (modelViewPreset) {
      case 'Back':
        return `scale(${modelZoom / 100}) rotateY(180deg)`;
      case 'Right':
        return `scale(${modelZoom / 100}) perspective(800px) rotateY(-28deg) rotateX(6deg)`;
      case 'Left':
        return `scale(${modelZoom / 100}) perspective(800px) rotateY(28deg) rotateX(6deg)`;
      case 'Top':
        return `scale(${modelZoom / 100}) perspective(800px) rotateX(38deg)`;
      case 'Bottom':
        return `scale(${modelZoom / 100}) perspective(800px) rotateX(-38deg)`;
      default:
        return `scale(${modelZoom / 100})`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher Bar: Full Dual-Plane CBCT Viewer vs 3D Intraoral Model & 2D X-Rays */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setViewerTab('cbct')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              viewerTab === 'cbct'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {c('Full Dual-Plane CBCT Viewer (Axial / Coronal)', 'عارض الأشعة المقطعية CBCT الكامل')}
          </button>
          <button
            type="button"
            onClick={() => setViewerTab('model3d')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              viewerTab === 'model3d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {c('3D Intraoral Model & Mesh Viewer', 'عارض المجسمات ثلاثية الأبعاد 3D')}
          </button>
          <button
            type="button"
            onClick={() => setViewerTab('xray2d')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              viewerTab === 'xray2d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {c('2D Panoramic & Periapical X-Rays', 'الأشعة الثنائية 2D والبانوراما')}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <span>PT: {patientName}</span>
          <span>·</span>
          <span>DATE: {studyDate}</span>
          {role === 'DENTIST' && (
            <label className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-sans font-extrabold cursor-pointer">
              + {c('Upload Diagnostic X-Ray / CBCT', 'رفع أشعة تشخيصية / CBCT')}
              <input type="file" className="hidden" accept="image/*,.dcm" />
            </label>
          )}
          {role === 'PATIENT' && (
            <>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-sans font-bold">
                {c('View & Download Only', 'للعرض والتحميل فقط')}
              </span>
              <a
                href="/images/hero_implant_2.jpg"
                download={`Ebtesamty-Scan-${patientName}.jpg`}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold"
              >
                {c('Download Scan ↓', 'تحميل الأشعة ↓')}
              </a>
            </>
          )}
          {role === 'OWNER_ADMIN' && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-sans font-bold">
              View-Only QA
            </span>
          )}
        </div>
      </div>

      {/* ====================================================================
          IMAGES 13 & 14: FULL DUAL-VIEWPORT DARK MEDICAL CBCT VIEWER
         ==================================================================== */}
      {viewerTab === 'cbct' && (
        <section className="rounded-3xl bg-[#0B0E14] text-slate-200 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Top DICOM Clinical Toolbar matching Image 14 */}
          <div className="px-4 py-2.5 bg-[#121722] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              {[
                { id: 'reading', labelAr: 'قراءة', labelEn: 'Reading' },
                { id: 'implant', labelAr: 'زراعة', labelEn: 'Implant' },
                { id: 'ortho', labelAr: 'تقويم وعرض', labelEn: 'Ortho & 3D' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCbctMode(m.id as any)}
                  className={`px-3 py-1 rounded-lg font-extrabold transition-colors ${
                    cbctMode === m.id
                      ? 'bg-slate-700 text-white border border-slate-500'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {isAr ? m.labelAr : m.labelEn}
                </button>
              ))}

              <span className="h-4 w-px bg-slate-700 mx-1" />

              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold">
                {c('Bone Window', 'عظم')}
              </span>

              {canUseAi && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{c('Auto-Tooth Map: #21', 'خريطة السن التلقائية: 21')}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>CBCT · MAXILLOFACIAL</span>
              <span>ID: 3</span>
              <span>{studyDate}</span>
            </div>
          </div>

          {/* Center Body: Left Vertical DICOM Tool Rail + Dual Viewport (AXIAL + CORONAL) */}
          <div className="flex flex-col lg:flex-row min-h-[480px]">
            {/* Left Vertical DICOM Tool Rail matching Image 14 */}
            <div className="flex lg:flex-col items-center gap-2 p-2.5 bg-[#0F131C] border-b lg:border-b-0 lg:border-e border-slate-800 shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 hidden lg:block">
                NAVIGATE
              </span>
              {[
                { id: 'crosshair', icon: Crosshair, title: 'Crosshair Slice Locator' },
                { id: 'pan', icon: Move, title: 'Pan Viewport' },
                { id: 'zoom', icon: ZoomIn, title: 'Zoom Image' },
                { id: 'window', icon: Sun, title: 'Window / Contrast Adjustment' },
                { id: 'ruler', icon: Ruler, title: 'Measure Length & Width (mm)' },
              ].map((tool) => {
                const Icon = tool.icon;
                const active = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    title={tool.title}
                    onClick={() => setActiveTool(tool.id as any)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}

              <button
                type="button"
                title="Add Implant Bone Measurement (mm)"
                disabled={!canAnnotate}
                onClick={() => {
                  const nextMm = (3.1 + Math.random() * 1.4).toFixed(2);
                  setMeasurements([
                    ...measurements,
                    {
                      id: `m-${Date.now()}`,
                      plane: 'AXIAL',
                      label: `${nextMm} mm`,
                      x: 48,
                      y: 46,
                      desc: 'Measured ridge width',
                    },
                  ]);
                }}
                className="w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-black disabled:opacity-40"
              >
                +
              </button>

              <button
                type="button"
                title="Reset View"
                onClick={() => {
                  setZoomPct(100);
                  setWindowWidth(2500);
                  setWindowLevel(600);
                }}
                className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white flex items-center justify-center"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Dual Viewport Split: AXIAL (Left) + CORONAL (Right) matching Images 13 & 14 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-slate-800 bg-black">
              {/* LEFT VIEWPORT: AXIAL PLANE (Image 13 & 14 Left) */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setCrosshairPos({ x, y });
                }}
                className="relative h-[440px] flex items-center justify-center overflow-hidden select-none cursor-crosshair bg-black"
              >
                {/* Top Overlay Labels */}
                <div className="absolute top-3 start-3 text-[11px] font-mono text-amber-400 font-bold z-20">
                  AXIAL
                </div>
                <div className="absolute top-3 end-3 text-[11px] font-mono text-slate-300 z-20">
                  {axialSlice} / 256
                </div>

                {/* Circular FOV Axial Mandibular Bone Slice SVG matching Image 13 */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-[360px] h-[360px] transition-transform duration-150"
                  style={{
                    transform: `scale(${zoomPct / 100})`,
                    filter: `contrast(${Math.round(windowWidth / 20)}%) brightness(${Math.round(
                      windowLevel / 6
                    )}%)`,
                  }}
                >
                  <defs>
                    <radialGradient id="cbct-fov-bg" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#333842" />
                      <stop offset="85%" stopColor="#262A32" />
                      <stop offset="100%" stopColor="#1A1D24" />
                    </radialGradient>
                  </defs>

                  {/* Circular CBCT Field of View (FOV) */}
                  <circle cx="200" cy="200" r="185" fill="url(#cbct-fov-bg)" />

                  {/* High-Density Cortical & Trabecular Mandibular Arch */}
                  <path
                    d="M 48 165 C 72 88, 152 80, 210 135 C 255 180, 285 265, 315 350 L 280 362 C 252 282, 224 202, 184 162 C 142 120, 82 125, 44 190 Z"
                    fill="#D4D8DF"
                    stroke="#F1F5F9"
                    strokeWidth="5"
                    opacity="0.92"
                  />

                  {/* Internal Trabecular Bone Chambers & Tooth Root Sockets */}
                  {[
                    { cx: 95, cy: 118, r: 9 },
                    { cx: 132, cy: 115, r: 10 },
                    { cx: 168, cy: 125, r: 11 },
                    { cx: 235, cy: 205, r: 12 },
                    { cx: 258, cy: 252, r: 13 },
                    { cx: 280, cy: 302, r: 13 },
                  ].map((s, idx) => (
                    <circle
                      key={idx}
                      cx={s.cx}
                      cy={s.cy}
                      r={s.r}
                      fill="#64748B"
                      stroke="#E2E8F0"
                      strokeWidth="2.5"
                    />
                  ))}

                  {/* Prepared Osteotomy / Implant Site with Yellow Millimeter Callouts (Image 13) */}
                  <ellipse
                    cx="208"
                    cy="158"
                    rx="14"
                    ry="18"
                    fill="#3F444E"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                  <circle cx="208" cy="158" r="2.5" fill="#F59E0B" />
                  <text
                    x="208"
                    y="145"
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    3.47
                  </text>
                  <text
                    x="174"
                    y="108"
                    fill="#F59E0B"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    2.85
                  </text>
                  <text
                    x="226"
                    y="174"
                    fill="#F59E0B"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    3.62
                  </text>

                  {/* Interactive Dashed Blue/Cyan Crosshair Guides matching Images 13 & 14 */}
                  <line
                    x1="0"
                    y1={crosshairPos.y * 4}
                    x2="400"
                    y2={crosshairPos.y * 4}
                    stroke="#38BDF8"
                    strokeWidth="1"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                  <line
                    x1={crosshairPos.x * 4}
                    y1="0"
                    x2={crosshairPos.x * 4}
                    y2="400"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                </svg>

                {/* Bottom-Left Window/Zoom Readout & Bottom-Right 20 mm Scale Bar */}
                <div className="absolute bottom-3 start-3 text-[10px] font-mono text-slate-400">
                  W {windowWidth}/{windowLevel} · Z {zoomPct}%
                </div>
                <div className="absolute bottom-3 end-4 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white font-bold">20 mm</span>
                  <div className="w-24 h-1.5 border-x border-b border-white" />
                </div>
              </div>

              {/* RIGHT VIEWPORT: CORONAL PLANE (Image 14 Right) */}
              <div className="relative h-[440px] flex items-center justify-center overflow-hidden select-none bg-black">
                <div className="absolute top-3 start-3 text-[11px] font-mono text-amber-400 font-bold z-20">
                  CORONAL
                </div>
                <div className="absolute top-3 end-3 text-[11px] font-mono text-slate-300 z-20">
                  {coronalSlice} / 352
                </div>

                {/* Coronal Bone & Implant/Crown Radiograph Slice SVG matching Image 14 Right */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-[360px] h-[360px] transition-transform duration-150"
                  style={{
                    transform: `scale(${zoomPct / 100})`,
                    filter: `contrast(${Math.round(windowWidth / 20)}%) brightness(${Math.round(
                      windowLevel / 6
                    )}%)`,
                  }}
                >
                  {/* Soft Tissue Background Band */}
                  <path
                    d="M 10 100 L 390 108 L 390 295 C 330 330, 240 340, 10 295 Z"
                    fill="#2B303A"
                  />

                  {/* Dense Alveolar Bone Cross-Section */}
                  <path
                    d="M 215 170 C 202 170, 198 215, 202 275 C 205 315, 222 332, 240 326 C 258 320, 265 280, 260 225 C 255 182, 232 170, 215 170 Z"
                    fill="#D8DEE6"
                    stroke="#F8FAFC"
                    strokeWidth="3"
                  />
                  {/* Trabecular Marrow Spaces */}
                  <circle cx="228" cy="245" r="8" fill="#525B6C" />
                  <circle cx="232" cy="272" r="10" fill="#475061" />

                  {/* Radiopaque Crown & Post/Abutment with Metallic Artifact Glow */}
                  <path
                    d="M 200 115 C 200 95, 255 95, 255 115 C 255 135, 245 148, 228 148 C 210 148, 200 135, 200 115 Z"
                    fill="#FFFFFF"
                  />
                  <rect x="220" y="145" width="16" height="32" rx="3" fill="#FFFFFF" />

                  {/* Yellow Crestal Measurement Callout matching Image 14 */}
                  <line x1="212" y1="166" x2="244" y2="166" stroke="#F59E0B" strokeWidth="2" />
                  <text
                    x="228"
                    y="161"
                    textAnchor="middle"
                    fill="#F59E0B"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    3.85 mm
                  </text>

                  {/* Dashed Yellow & Blue Crosshair Guides */}
                  <line
                    x1="0"
                    y1="205"
                    x2="400"
                    y2="205"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    strokeDasharray="5 4"
                    opacity="0.75"
                  />
                  <line
                    x1="196"
                    y1="0"
                    x2="196"
                    y2="400"
                    stroke="#3B82F6"
                    strokeWidth="1"
                    strokeDasharray="5 4"
                    opacity="0.85"
                  />
                </svg>

                <div className="absolute bottom-3 start-3 text-[10px] font-mono text-slate-400">
                  W {windowWidth}/{windowLevel} · Z {zoomPct}%
                </div>
                <div className="absolute bottom-3 end-4 flex flex-col items-center">
                  <span className="text-[10px] font-mono text-white font-bold">20 mm</span>
                  <div className="w-24 h-1.5 border-x border-b border-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Slice Scrubber & Window/Contrast Sliders matching Image 14 */}
          <div className="px-4 py-3 bg-[#121722] border-t border-slate-800 space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAxialSlice((s) => Math.max(1, s - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAxialSlice((s) => (s >= 256 ? 1 : s + 5))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAxialSlice((s) => Math.min(256, s + 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="font-mono text-xs text-slate-300 shrink-0">
                {c('Axial', 'محوري')} {axialSlice} / 256
              </span>

              <input
                type="range"
                min={1}
                max={256}
                value={axialSlice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAxialSlice(val);
                  setCoronalSlice(Math.min(352, Math.round(val * 1.35)));
                }}
                aria-label="CBCT Slice Scrubber"
                className="flex-1 accent-blue-500 cursor-pointer h-1.5 rounded-lg bg-slate-800"
              />

              {/* Window / Contrast & Zoom Quick Controls */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>Contrast</span>
                  <input
                    type="range"
                    min={1200}
                    max={3500}
                    value={windowWidth}
                    onChange={(e) => setWindowWidth(Number(e.target.value))}
                    className="w-20 accent-amber-400"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>Zoom</span>
                  <input
                    type="range"
                    min={80}
                    max={180}
                    value={zoomPct}
                    onChange={(e) => setZoomPct(Number(e.target.value))}
                    className="w-20 accent-blue-400"
                  />
                </label>
              </div>
            </div>

            {/* Bottom DICOM Telemetry Strip matching Image 14 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span>ZOOM {zoomPct}%</span>
                <span>
                  W {windowWidth} / {windowLevel}
                </span>
                <span>THK 0.20 mm</span>
                <span>
                  POS {crosshairPos.x}.0, {crosshairPos.y}.0, {(axialSlice * 0.2).toFixed(1)}
                </span>
                <span>HU -1000</span>
                <span className="text-blue-400 uppercase">{activeTool}</span>
              </div>
              <span>
                {measurements.map((m) => `${m.plane}: ${m.label}`).join(' · ')}
              </span>
            </div>
          </div>

          {/* Auto-Detected Tooth Map Suggestion Bar (Kept as suggestion until doctor approves) */}
          {canUseAi && (
            <div className="p-4 bg-slate-900/95 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {c(
                      'Tooth map detected automatically — kept as a suggestion until you approve it',
                      'خريطة الأسنان المكتشفة تلقائياً — تظل كمقترح حتى تعتمدها بنفسك'
                    )}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {aiSuggestions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-slate-200 font-semibold">
                      {isAr ? s.findingAr : s.findingEn}
                    </span>
                    {s.status === 'SUGGESTED' ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setAiSuggestions((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, status: 'APPROVED' } : x
                              )
                            )
                          }
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold"
                        >
                          {c('Approve', 'اعتماد')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAiSuggestions((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, status: 'DISMISSED' } : x
                              )
                            )
                          }
                          className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                          s.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {s.status === 'APPROVED' ? c('Approved ✓', 'تم الاعتماد ✓') : c('Dismissed', 'مرفوض')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ====================================================================
          IMAGE 15: 3D INTRAORAL MODEL & MESH VIEWER (Front | Back | Right | Left | Top | Bottom | Mesh)
         ==================================================================== */}
      {viewerTab === 'model3d' && (
        <section className="rounded-3xl bg-[#0B101B] text-white border border-slate-800 p-6 shadow-2xl space-y-6 min-h-[520px] flex flex-col justify-between">
          {/* Top Floating Camera Orientation Buttons matching Image 15 */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(['Front', 'Back', 'Right', 'Left', 'Top', 'Bottom', 'Mesh'] as const).map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setModelViewPreset(preset)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
                    modelViewPreset === preset
                      ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_16px_rgba(37,99,235,0.45)]'
                      : 'bg-[#171E2E] text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              )
            )}
          </div>

          {/* Center Interactive 3D Shaded Intraoral Dental Arch & Implant Abutment Model matching Image 15 */}
          <div className="flex-1 flex items-center justify-center py-6 overflow-hidden">
            <div
              className="transition-all duration-500 ease-out"
              style={{ transform: get3DTransform() }}
            >
              <svg
                viewBox="0 0 640 340"
                className="w-full max-w-[560px] drop-shadow-[0_25px_45px_rgba(0,0,0,0.75)]"
                role="img"
                aria-label="3D Intraoral Dental Arch Model"
              >
                <defs>
                  <linearGradient id="gingiva-pink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5A99E" />
                    <stop offset="50%" stopColor="#D99488" />
                    <stop offset="100%" stopColor="#C47D72" />
                  </linearGradient>
                  <linearGradient id="enamel-3d" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FAF8F5" />
                    <stop offset="70%" stopColor="#E8E4DC" />
                    <stop offset="100%" stopColor="#CFC9BE" />
                  </linearGradient>
                </defs>

                {/* Upper Gingiva Mesh */}
                <path
                  d="M 110 115 C 145 55, 225 42, 340 48 C 460 52, 520 75, 535 125 C 510 142, 420 145, 340 142 C 250 140, 175 145, 110 115 Z"
                  fill={modelViewPreset === 'Mesh' ? 'none' : 'url(#gingiva-pink)'}
                  stroke={modelViewPreset === 'Mesh' ? '#38BDF8' : '#D48C80'}
                  strokeWidth={modelViewPreset === 'Mesh' ? '1.8' : '2'}
                />

                {/* Posterior Right Cylindrical Implant Scan Body / Abutment matching Image 15 */}
                <rect
                  x="132"
                  y="112"
                  width="22"
                  height="52"
                  rx="4"
                  transform="rotate(14 143 138)"
                  fill={modelViewPreset === 'Mesh' ? 'none' : '#E2CBC7'}
                  stroke={modelViewPreset === 'Mesh' ? '#38BDF8' : '#C8ABA6'}
                  strokeWidth="2"
                />

                {/* Upper Anatomical Anterior & Premolar Crowns */}
                {[
                  { x: 202, y: 112, w: 46, h: 66, r: 16 },
                  { x: 250, y: 108, w: 52, h: 72, r: 18 },
                  { x: 304, y: 102, w: 64, h: 80, r: 20 },
                  { x: 370, y: 104, w: 62, h: 78, r: 20 },
                  { x: 434, y: 112, w: 48, h: 70, r: 17 },
                  { x: 484, y: 120, w: 40, h: 62, r: 14 },
                ].map((t, i) => (
                  <rect
                    key={`u-${i}`}
                    x={t.x}
                    y={t.y}
                    width={t.w}
                    height={t.h}
                    rx={t.r}
                    fill={modelViewPreset === 'Mesh' ? 'none' : 'url(#enamel-3d)'}
                    stroke={modelViewPreset === 'Mesh' ? '#38BDF8' : '#D6D1C7'}
                    strokeWidth="2"
                  />
                ))}

                {/* Lower Anatomical Crowns in Occlusion */}
                {[
                  { x: 162, y: 175, w: 48, h: 62, r: 16 },
                  { x: 245, y: 178, w: 46, h: 60, r: 15 },
                  { x: 294, y: 180, w: 46, h: 62, r: 15 },
                  { x: 343, y: 180, w: 46, h: 62, r: 15 },
                  { x: 392, y: 178, w: 46, h: 60, r: 15 },
                  { x: 441, y: 176, w: 44, h: 58, r: 14 },
                  { x: 487, y: 174, w: 36, h: 54, r: 12 },
                ].map((t, i) => (
                  <rect
                    key={`l-${i}`}
                    x={t.x}
                    y={t.y}
                    width={t.w}
                    height={t.h}
                    rx={t.r}
                    fill={modelViewPreset === 'Mesh' ? 'none' : 'url(#enamel-3d)'}
                    stroke={modelViewPreset === 'Mesh' ? '#2DD4BF' : '#CCC6BA'}
                    strokeWidth="2"
                  />
                ))}

                {/* Lower Gingiva Ridge */}
                <path
                  d="M 105 245 C 165 215, 255 225, 355 228 C 445 228, 495 220, 520 245 C 500 285, 425 298, 335 296 C 225 294, 145 282, 105 245 Z"
                  fill={modelViewPreset === 'Mesh' ? 'none' : 'url(#gingiva-pink)'}
                  stroke={modelViewPreset === 'Mesh' ? '#2DD4BF' : '#C98276'}
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Bottom 3D Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>
              {c(
                `Active Orientation: ${modelViewPreset} · Linked to Patient Record (${patientName})`,
                `زاوية العرض الحالية: ${modelViewPreset} · مرتبط بملف المريض (${patientName})`
              )}
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <span>Zoom</span>
                <input
                  type="range"
                  min={75}
                  max={145}
                  value={modelZoom}
                  onChange={(e) => setModelZoom(Number(e.target.value))}
                  className="w-28 accent-blue-500"
                />
              </label>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          2D REGULAR X-RAYS WITH ZOOM & PAN
         ==================================================================== */}
      {viewerTab === 'xray2d' && (
        <section className="rounded-3xl bg-[#0B101B] text-white border border-slate-800 p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold">
                {c('2D Digital Panoramic & Periapical Radiograph Viewer', 'عارض الأشعة الرقمية 2D والبانوراما')}
              </h3>
              <p className="text-xs text-slate-400">
                {c(
                  'Zoom and pan on regular X-rays without exporting · Linked directly to patient record',
                  'تكبير وتحريك الأشعة لقراءة التفاصيل الدقيقة دون الحاجة لبرامج خارجية'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomPct((z) => Math.min(180, z + 15))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold"
              >
                + Zoom In
              </button>
              <button
                type="button"
                onClick={() => setZoomPct((z) => Math.max(80, z - 15))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold"
              >
                − Zoom Out
              </button>
            </div>
          </div>
          <div className="h-80 rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
            <img
              src="/images/hero_implant_2.jpg"
              alt="2D Panoramic X-Ray"
              style={{ transform: `scale(${zoomPct / 100})`, transition: 'transform 0.2s ease' }}
              className="max-h-72 object-contain filter grayscale contrast-125"
            />
          </div>
        </section>
      )}
    </div>
  );
}
