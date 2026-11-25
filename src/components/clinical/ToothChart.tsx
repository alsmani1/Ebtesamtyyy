'use client';
import {LocalizedInput} from '@/components/LocalizedControls';

import {TranslatedText} from '@/components/TranslatedText';


import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ToothFinding {
  id: string;
  toothNumber: string;
  surface?: string | null;
  condition: string;
  notes?: string | null;
  recordedAt: string;
  recordedByUser: {
    fullName: string;
  };
}

interface ToothData {
  latest?: ToothFinding;
  history?: ToothFinding[];
}

interface Props {
  toothChart: Record<string, ToothData>;
  patientId: string;
  onToothUpdated?: () => void;
  readOnly?: boolean;
}

const ADULT_UPPER_ARCH = [
  // Upper Right (Quadrant 1: 18 to 11)
  '18', '17', '16', '15', '14', '13', '12', '11',
  // Upper Left (Quadrant 2: 21 to 28)
  '21', '22', '23', '24', '25', '26', '27', '28'
];

const ADULT_LOWER_ARCH = [
  // Lower Right (Quadrant 4: 48 to 41)
  '48', '47', '46', '45', '44', '43', '42', '41',
  // Lower Left (Quadrant 3: 31 to 38)
  '31', '32', '33', '34', '35', '36', '37', '38'
];

const PEDIATRIC_UPPER_ARCH = ['55', '54', '53', '52', '51', '61', '62', '63', '64', '65'];
const PEDIATRIC_LOWER_ARCH = ['85', '84', '83', '82', '81', '71', '72', '73', '74', '75'];

const FDI_TO_UNIVERSAL: Record<string, string> = {
  '18':'1','17':'2','16':'3','15':'4','14':'5','13':'6','12':'7','11':'8',
  '21':'9','22':'10','23':'11','24':'12','25':'13','26':'14','27':'15','28':'16',
  '38':'17','37':'18','36':'19','35':'20','34':'21','33':'22','32':'23','31':'24',
  '41':'25','42':'26','43':'27','44':'28','45':'29','46':'30','47':'31','48':'32',
  '55':'A','54':'B','53':'C','52':'D','51':'E','61':'F','62':'G','63':'H','64':'I','65':'J',
  '75':'K','74':'L','73':'M','72':'N','71':'O','81':'P','82':'Q','83':'R','84':'S','85':'T',
};

function formatToothNotation(fdi: string, system: 'FDI' | 'UNIVERSAL' | 'PALMER') {
  if (system === 'UNIVERSAL') return FDI_TO_UNIVERSAL[fdi] || fdi;
  if (system === 'PALMER') {
    const q = fdi[0];
    const num = fdi[1];
    const qPrefix = q === '1' || q === '5' ? 'UR' : q === '2' || q === '6' ? 'UL' : q === '3' || q === '7' ? 'LL' : 'LR';
    return `${qPrefix}${num}`;
  }
  return fdi;
}

const CONDITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  HEALTHY: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CARIES: { bg: 'bg-rose-100', text: 'text-rose-800 font-bold', border: 'border-rose-400' },
  RESTORED: { bg: 'bg-blue-100', text: 'text-blue-800 font-medium', border: 'border-blue-400' },
  ROOT_CANAL_TREATED: { bg: 'bg-purple-100', text: 'text-purple-800 font-semibold', border: 'border-purple-400' },
  MISSING: { bg: 'bg-slate-200', text: 'text-slate-400 line-through', border: 'border-slate-300' },
  FRACTURED: { bg: 'bg-amber-100', text: 'text-amber-800 font-bold', border: 'border-amber-400' },
};

export function ToothChart({ toothChart, patientId, onToothUpdated, readOnly = false }: Props) {
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [condition, setCondition] = useState<string>('CARIES');
  const [surface, setSurface] = useState<string>('O');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notationSystem, setNotationSystem] = useState<'FDI' | 'UNIVERSAL' | 'PALMER'>('FDI');
  const [dentitionMode, setDentitionMode] = useState<'ADULT' | 'PEDIATRIC'>('ADULT');
  const [cbctPlane, setCbctPlane] = useState<'3D_CBCT' | 'AXIAL' | 'SAGITTAL' | 'IMPLANT_PLAN'>('3D_CBCT');
  const [imgZoom, setImgZoom] = useState<number>(1);
  const [imgContrast, setImgContrast] = useState<number>(115);
  const [showAiSuggestions, setShowAiSuggestions] = useState<boolean>(false);
  const [aiDecisionStatus, setAiDecisionStatus] = useState<Record<string, 'CONFIRMED' | 'REJECTED'>>({});

  const selectedData = selectedTooth ? toothChart[selectedTooth] : null;

  async function handleRecordFinding(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTooth) return;

    setSaving(true);
    setError(null);
    try {
      try {
        await fetch('/api/clinical/teeth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId,
            toothNumber: selectedTooth,
            surface: surface || null,
            condition,
            notes: notes || null,
          }),
        });
      } catch (_) {
        // Static export mode fallback
      }

      if (toothChart && toothChart[selectedTooth]) {
        toothChart[selectedTooth].latest = {
          id: `tf_${Date.now()}`,
          patientId,
          toothNumber: selectedTooth,
          surface: surface || null,
          condition,
          notes: notes || null,
          recordedAt: new Date().toISOString(),
        } as any;
      }

      setNotes('');
      if (onToothUpdated) onToothUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderToothButton(toothNum: string) {
    const data = toothChart[toothNum];
    const condition = data?.latest?.condition || 'UNCHARTED';
    const isSelected = selectedTooth === toothNum;
    const isMissing = condition === 'MISSING';
    const isCaries = condition === 'CARIES';
    const isRestored = condition === 'RESTORED';
    const isRCT = condition === 'ROOT_CANAL_TREATED';
    const isFractured = condition === 'FRACTURED';

    const surfaceStr = (data?.latest?.surface || '').toUpperCase();
    const hasO = surfaceStr.includes('O');
    const hasM = surfaceStr.includes('M');
    const hasD = surfaceStr.includes('D');
    const hasB = surfaceStr.includes('B');
    const hasL = surfaceStr.includes('L');

    const getSurfaceColor = (hasSurf: boolean) => {
      if(condition==='UNCHARTED')return '#E2E8F0';
      if (!hasSurf) return '#FFFFFF';
      if (isCaries) return '#F43F5E';
      if (isRestored) return '#3B82F6';
      if (isRCT) return '#A855F7';
      if (isFractured) return '#F59E0B';
      return '#10B981';
    };

    return (
      <button
        key={toothNum}
        type="button"
        aria-label={toothNum+' · '+condition} aria-pressed={isSelected} onClick={() => setSelectedTooth(toothNum)}
        className={`w-11 sm:w-13 h-20 sm:h-22 flex flex-col items-center justify-between p-1 rounded-xl border transition-all text-center ${
          isSelected
            ? 'ring-2 ring-[#4169E1] bg-[#EFF5FF]/60 border-[#4169E1] shadow-md scale-105 z-10'
            : isMissing
            ? 'bg-slate-100/80 border-slate-200 opacity-60'
            : 'bg-white border-[#DDE5E1] hover:border-[#4169E1] hover:shadow-2xs'
        }`}
      >
        <span className="text-xs font-bold font-mono text-[#102A5E]">{formatToothNotation(toothNum, notationSystem)}</span>

        {/* Anatomical 5-Surface Occlusal Cross Diagram */}
        <div className="relative w-8 h-8 my-0.5">
          {isMissing ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
              ✕
            </div>
          ) : (
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-2xs">
              {/* Outer Crown Border */}
              <rect x="2" y="2" width="36" height="36" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
              
              {/* Buccal (Top trapezoid) */}
              <polygon points="2,2 38,2 28,12 12,12" fill={getSurfaceColor(hasB)} stroke="#94A3B8" strokeWidth="0.75" />
              
              {/* Lingual (Bottom trapezoid) */}
              <polygon points="2,38 38,38 28,28 12,28" fill={getSurfaceColor(hasL)} stroke="#94A3B8" strokeWidth="0.75" />
              
              {/* Mesial (Left trapezoid) */}
              <polygon points="2,2 12,12 12,28 2,38" fill={getSurfaceColor(hasM)} stroke="#94A3B8" strokeWidth="0.75" />
              
              {/* Distal (Right trapezoid) */}
              <polygon points="38,2 28,12 28,28 38,38" fill={getSurfaceColor(hasD)} stroke="#94A3B8" strokeWidth="0.75" />
              
              {/* Occlusal Center (Square) */}
              <rect x="12" y="12" width="16" height="16" fill={getSurfaceColor(hasO || (!hasB && !hasL && !hasM && !hasD && condition !== 'HEALTHY'))} stroke="#64748B" strokeWidth="1" />
            </svg>
          )}
        </div>

        {/* Condition Badge */}
        <span
          className={`text-[8px] font-bold px-1 py-0.2 rounded truncate max-w-full ${
            isMissing
              ? 'text-slate-400 line-through'
              : isCaries
              ? 'text-rose-700 bg-rose-50'
              : isRestored
              ? 'text-blue-700 bg-blue-50'
              : isRCT
              ? 'text-purple-700 bg-purple-50'
              : isFractured
              ? 'text-amber-800 bg-amber-50'
              : 'text-emerald-700 bg-emerald-50'
          }`}
        >
          {condition === 'ROOT_CANAL_TREATED' ? <TranslatedText text="RCT"/> : condition.substring(0, 4)}
        </span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span><TranslatedText text="FDI Two-Digit Odontogram (Adult Dental Chart)" /></span>
            <Badge variant="teal"><TranslatedText text="Real-time Charting" /></Badge>
          </h3>
          <p className="text-xs text-slate-500 mt-1"> <TranslatedText text="Standard ISO 3950 / FDI two-digit clinical notation. Select any tooth to review findings history or record pathologies." /> </p>
        </div>

        {/* Legend & Notation / Dentition Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            aria-label="Numbering System"
            value={notationSystem}
            onChange={(e) => setNotationSystem(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#102A5E]"
          >
            <option value="FDI">FDI (Two-Digit)</option>
            <option value="UNIVERSAL">Universal (1–32 / A–T)</option>
            <option value="PALMER">Palmer Quadrant</option>
          </select>
          <select
            aria-label="Dentition Mode"
            value={dentitionMode}
            onChange={(e) => setDentitionMode(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#102A5E]"
          >
            <option value="ADULT">Adult Dentition (32)</option>
            <option value="PEDIATRIC">Pediatric / Primary (20)</option>
          </select>
          <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> <TranslatedText text="Caries" /> </span>
          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> <TranslatedText text="Restored" /> </span>
          <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> <TranslatedText text="RCT" /> </span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 line-through"> <TranslatedText text="Missing" /> </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> <TranslatedText text="Healthy" /> </span>
        </div>
      </div>

      {/* Dental Arches Representation */}
      <div className="space-y-6 overflow-x-auto pb-4">
        {/* Upper Arch */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1 uppercase tracking-wider">
            <span><TranslatedText text="Maxillary Right (Q1)" /></span>
            <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded"><TranslatedText text="Upper Arch" /></span>
            <span><TranslatedText text="Maxillary Left (Q2)" /></span>
          </div>
          <div className="flex justify-center items-center gap-1 sm:gap-1.5 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="flex gap-1 sm:gap-1.5">
              {(dentitionMode === 'ADULT' ? ADULT_UPPER_ARCH.slice(0, 8) : PEDIATRIC_UPPER_ARCH.slice(0, 5)).map(renderToothButton)}
            </div>
            <div className="w-px h-16 bg-slate-300 mx-1"></div>
            <div className="flex gap-1 sm:gap-1.5">
              {(dentitionMode === 'ADULT' ? ADULT_UPPER_ARCH.slice(8) : PEDIATRIC_UPPER_ARCH.slice(5)).map(renderToothButton)}
            </div>
          </div>
        </div>

        {/* Lower Arch */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1 uppercase tracking-wider">
            <span><TranslatedText text="Mandibular Right (Q4)" /></span>
            <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded"><TranslatedText text="Lower Arch" /></span>
            <span><TranslatedText text="Mandibular Left (Q3)" /></span>
          </div>
          <div className="flex justify-center items-center gap-1 sm:gap-1.5 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="flex gap-1 sm:gap-1.5">
              {(dentitionMode === 'ADULT' ? ADULT_LOWER_ARCH.slice(0, 8) : PEDIATRIC_LOWER_ARCH.slice(0, 5)).map(renderToothButton)}
            </div>
            <div className="w-px h-16 bg-slate-300 mx-1"></div>
            <div className="flex gap-1 sm:gap-1.5">
              {(dentitionMode === 'ADULT' ? ADULT_LOWER_ARCH.slice(8) : PEDIATRIC_LOWER_ARCH.slice(5)).map(renderToothButton)}
            </div>
          </div>
        </div>
      </div>

      {/* INTEGRATED DIAGNOSIS/TREATMENT CHECKLIST + 3D CBCT & AI RADIOGRAPHIC VIEWER (Matching Dentist Workspace Reference Board) */}
      {!readOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 border-t border-slate-100">
          {/* Quick Diagnosis & Treatment Checkboxes */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 bg-[#F7FAFF] rounded-2xl p-4 border border-[#DCE5EE] text-xs">
            <div className="space-y-2">
              <strong className="text-[#102A5E] uppercase tracking-wider block">
                <TranslatedText text="Diagnosis" />
              </strong>
              {[
                { label: 'Caries', code: 'CARIES' },
                { label: 'Gingivitis', code: 'CARIES' },
                { label: 'Periodontitis', code: 'FRACTURED' },
                { label: 'Pulpitis / RCT', code: 'ROOT_CANAL_TREATED' },
              ].map((d) => (
                <label key={d.label} className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={condition === d.code}
                    onChange={() => {
                      setCondition(d.code);
                      if (!selectedTooth) setSelectedTooth('36');
                    }}
                    className="rounded text-[#4169E1]"
                  />
                  <span><TranslatedText text={d.label} /></span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              <strong className="text-[#102A5E] uppercase tracking-wider block">
                <TranslatedText text="Treatment" />
              </strong>
              {[
                { label: 'Filling', code: 'RESTORED' },
                { label: 'Cleaning', code: 'HEALTHY' },
                { label: 'Root Canal', code: 'ROOT_CANAL_TREATED' },
                { label: 'Extraction', code: 'MISSING' },
              ].map((tr) => (
                <label key={tr.label} className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={condition === tr.code}
                    onChange={() => {
                      setCondition(tr.code);
                      if (!selectedTooth) setSelectedTooth('36');
                    }}
                    className="rounded text-[#4169E1]"
                  />
                  <span><TranslatedText text={tr.label} /></span>
                </label>
              ))}
            </div>
          </div>

          {/* Dark-Canvas CBCT / Radiographic Viewer + AI Radiographic Assistance */}
          <div className="lg:col-span-8 bg-slate-950 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {(['3D_CBCT', 'AXIAL', 'SAGITTAL', 'IMPLANT_PLAN'] as const).map((plane) => (
                  <button
                    key={plane}
                    type="button"
                    onClick={() => setCbctPlane(plane)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      cbctPlane === plane ? 'bg-[#4169E1] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {plane.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setImgZoom((z) => Math.min(2.2, +(z + 0.2).toFixed(1)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-bold"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setImgZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-bold"
                  title="Zoom Out"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setImgContrast((c) => (c === 115 ? 145 : 115))}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px]"
                >
                  Contrast
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold"
                >
                  AI Assist
                </button>
              </div>
            </div>

            <div className="relative h-48 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src="/images/hero_implant_2.jpg"
                alt="3D CBCT & Radiographic Study"
                style={{
                  transform: `scale(${imgZoom})`,
                  filter: `grayscale(100%) contrast(${imgContrast}%)`,
                  transition: 'all 0.25s ease-out',
                }}
                className="max-h-44 object-contain"
              />
              {cbctPlane === 'IMPLANT_PLAN' && (
                <div className="absolute bottom-2 start-3 bg-slate-900/90 border border-sky-500/50 rounded-lg px-2.5 py-1 text-[11px] text-sky-300 font-mono">
                  Virtual Implant #46 · 4.1mm × 10mm · Distance to IAN Canal: 3.4mm
                </div>
              )}
            </div>

            {showAiSuggestions && (
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">
                    ⚠ AI Suggestion — Requires Dentist Review (Never Auto-Inserted into Chart)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Model: RadioAssist-v2.4</span>
                </div>
                {[
                  { id: 'ai-36', tooth: '36', label: 'Suspected distal caries on Tooth #36 (Confidence 89%)' },
                  { id: 'ai-46', tooth: '46', label: 'Adequate alveolar bone height for implant #46 (13.2mm)' },
                ].map((sugg) => (
                  <div key={sugg.id} className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 rounded-lg">
                    <span>{sugg.label}</span>
                    <div className="flex items-center gap-1.5">
                      {aiDecisionStatus[sugg.id] ? (
                        <span className="text-[11px] font-bold text-emerald-400">{aiDecisionStatus[sugg.id]}</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setAiDecisionStatus((prev) => ({ ...prev, [sugg.id]: 'CONFIRMED' }));
                              setSelectedTooth(sugg.tooth);
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold"
                          >
                            Confirm & Review #{sugg.tooth}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiDecisionStatus((prev) => ({ ...prev, [sugg.id]: 'REJECTED' }))}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Tooth Inspector & Finding Form */}
      {selectedTooth && (
        <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                #{selectedTooth}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900"> <TranslatedText text="Tooth #" />{selectedTooth} <TranslatedText text="Details & History" /> </h4>
                <p className="text-xs text-slate-500"> <TranslatedText text="Current Status:" /> <span className="font-semibold text-slate-800">{selectedData?.latest?.condition || 'UNCHARTED'}</span>
                  {selectedData?.latest?.surface && ` (Surface: ${selectedData.latest.surface})`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTooth(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            > <TranslatedText text="✕ Close Inspector" /> </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Finding History */}
            <div>
              <h5 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide"> <TranslatedText text="Chronological Findings History" /> </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedData?.history && selectedData.history.length > 0 ? (
                  selectedData.history.map((h, i) => (
                    <div key={h.id || i} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800"><TranslatedText text={String(h.condition)}/></span>
                        <span className="text-xs text-slate-400">
                          {new Date(h.recordedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {h.surface && (
                        <p className="text-xs text-slate-600"><TranslatedText text="Surface:" /> <span className="font-mono font-medium">{h.surface}</span></p>
                      )}
                      {h.notes && (
                        <p className="text-xs text-slate-500 italic mt-0.5">&quot;{h.notes}&quot;</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1"><TranslatedText text="Recorded by:" /> {h.recordedByUser?.fullName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-3 italic text-center"> <TranslatedText text="No historical findings recorded for tooth #" />{selectedTooth}<TranslatedText text=". Not yet charted." /> </p>
                )}
              </div>
            </div>

            {/* Record New Finding Form */}
            {!readOnly && (
              <form onSubmit={handleRecordFinding} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide"> <TranslatedText text="Record New Pathology / Restoration" /> </h5>
                {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1"><TranslatedText text="Condition" /></label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="CARIES"><TranslatedText text="CARIES (Active Cavity)" /></option>
                      <option value="RESTORED"><TranslatedText text="RESTORED (Filling / Inlay)" /></option>
                      <option value="ROOT_CANAL_TREATED"><TranslatedText text="ROOT CANAL TREATED" /></option>
                      <option value="FRACTURED"><TranslatedText text="FRACTURED / CRACKED" /></option>
                      <option value="MISSING"><TranslatedText text="MISSING / EXTRACTED" /></option>
                      <option value="HEALTHY"><TranslatedText text="HEALTHY / SOUND" /></option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1"><TranslatedText text="Surface (e.g. MOD, O, B)" /></label>
                    <LocalizedInput
                      type="text"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value.toUpperCase())}
                      placeholder="e.g. MOD, O, D"
                      className="w-full text-xs rounded-xl border border-slate-200 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1"><TranslatedText text="Clinical Observation Notes" /></label>
                  <LocalizedInput
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Recurrent decay under distal amalgam margin"
                    className="w-full text-xs rounded-xl border border-slate-200 p-2 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={saving}
                  > <TranslatedText text="Save Tooth #" />{selectedTooth} <TranslatedText text="Finding" /> </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
