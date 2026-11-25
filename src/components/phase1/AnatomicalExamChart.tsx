'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { clinicDateISO, clinicTodayISO } from '@/lib/clinic-clock';
import { SERVICES } from '@/lib/clinic-pricing';
import { getPatientById } from '@/lib/patients-db';
import {
  Clock,
  Sparkles,
  Crown,
  Layers,
  Activity,
  Heart,
  Scissors,
  Grid,
  Search,
  Eye,
  RotateCcw,
  FileText,
  CheckCircle2,
  Upload,
  Camera,
  Plus,
  Send,
} from 'lucide-react';

export const PENDING_CLINICAL_CHARGES_KEY = 'ebtesamty_pending_clinical_charges_v1';
export const PENDING_CLINICAL_CHARGES_EVENT = 'ebtesamty-pending-clinical-charges-sync';

export interface PendingClinicalChargeHandoff {
  id: string;
  patientId?: string;
  patientNameEn: string;
  patientNameAr: string;
  doctorNameEn: string;
  doctorNameAr: string;
  proceduresSummaryEn: string;
  proceduresSummaryAr: string;
  totalAmountEgp: number;
  createdAt: string;
  status: 'PENDING_BILLING' | 'INVOICED';
}

export const STANDARD_MINYA_PROCEDURES = [
  {
    id: 'proc-consult',
    labelEn: `Dental Consultation & Exam – ${SERVICES.consult.price.toLocaleString()} EGP`,
    nameEn: 'Dental Consultation & Exam',
    nameAr: 'كشف واستشارة أسنان',
    priceEgp: SERVICES.consult.price,
  },
  {
    id: 'proc-filling',
    labelEn: `Composite Filling – ${SERVICES.filling.price.toLocaleString()} EGP`,
    nameEn: 'Composite Filling',
    nameAr: 'حشو تجميلي بالليزر',
    priceEgp: SERVICES.filling.price,
  },
  {
    id: 'proc-scaling',
    labelEn: `Ultrasonic Scaling & Polishing – ${SERVICES.scaling.price.toLocaleString()} EGP`,
    nameEn: 'Ultrasonic Scaling & Polishing',
    nameAr: 'تنظيف الجير وتلميع الأسنان',
    priceEgp: SERVICES.scaling.price,
  },
  {
    id: 'proc-extraction',
    labelEn: `Simple Tooth Extraction – ${SERVICES.extraction.price.toLocaleString()} EGP`,
    nameEn: 'Simple Tooth Extraction',
    nameAr: 'خلع سن بسيط',
    priceEgp: SERVICES.extraction.price,
  },
  {
    id: 'proc-rct',
    labelEn: `Root Canal Therapy – ${SERVICES.rct.price.toLocaleString()} EGP`,
    nameEn: 'Root Canal Therapy',
    nameAr: 'علاج الجذور (حشو عصب)',
    priceEgp: SERVICES.rct.price,
  },
  {
    id: 'proc-veneer',
    labelEn: `Porcelain Veneer (Per Tooth) – ${SERVICES.veneer.price.toLocaleString()} EGP`,
    nameEn: 'Porcelain Veneer',
    nameAr: 'عدسات الفينير التجميلية',
    priceEgp: SERVICES.veneer.price,
  },
  {
    id: 'proc-crown',
    labelEn: `Zirconia Crown – ${SERVICES.crown.price.toLocaleString()} EGP`,
    nameEn: 'Zirconia Crown',
    nameAr: 'تاج زيركون للأسنان',
    priceEgp: SERVICES.crown.price,
  },
  {
    id: 'proc-ortho',
    labelEn: `Orthodontic Braces (Full Arch) – ${SERVICES.braces.price.toLocaleString()} EGP`,
    nameEn: 'Orthodontic Braces (Full Arch)',
    nameAr: 'تقويم الأسنان (فك كامل)',
    priceEgp: SERVICES.braces.price,
  },
  {
    id: 'proc-implant',
    labelEn: `Dental Implant – ${SERVICES.implant.price.toLocaleString()} EGP`,
    nameEn: 'Dental Implant',
    nameAr: 'زراعة الأسنان الفورية',
    priceEgp: SERVICES.implant.price,
  },
  {
    id: 'proc-pediatric',
    labelEn: `Pediatric Dental Visit – ${SERVICES.pediatric.price.toLocaleString()} EGP`,
    nameEn: 'Pediatric Dental Visit',
    nameAr: 'كشف وعلاج أسنان الأطفال',
    priceEgp: SERVICES.pediatric.price,
  },
];

interface ToothClinicalRecord {
  fdi: string;
  quadLabel: string;
  status: 'HEALTHY' | 'COMPLETED_BROWN' | 'IN_PROGRESS_CYAN' | 'FOLLOW_UP_BLUE';
  procedureEn: string;
  procedureAr: string;
  costEgp: number;
  visitDate: string;
}

const UPPER_TEETH = [
  { fdi: '18', q: '8R', type: 'molar' },
  { fdi: '17', q: '7R', type: 'molar' },
  { fdi: '16', q: '6R', type: 'molar' },
  { fdi: '15', q: '5R', type: 'premolar' },
  { fdi: '14', q: '4R', type: 'premolar' },
  { fdi: '13', q: '3R', type: 'canine' },
  { fdi: '12', q: '2R', type: 'incisor' },
  { fdi: '11', q: '1R', type: 'incisor' },
  { fdi: '21', q: '1L', type: 'incisor' },
  { fdi: '22', q: '2L', type: 'incisor' },
  { fdi: '23', q: '3L', type: 'canine' },
  { fdi: '24', q: '4L', type: 'premolar' },
  { fdi: '25', q: '5L', type: 'premolar' },
  { fdi: '26', q: '6L', type: 'molar' },
  { fdi: '27', q: '7L', type: 'molar' },
  { fdi: '28', q: '8L', type: 'molar' },
];

const LOWER_TEETH = [
  { fdi: '48', q: '8R', type: 'molar' },
  { fdi: '47', q: '7R', type: 'molar' },
  { fdi: '46', q: '6R', type: 'molar' },
  { fdi: '45', q: '5R', type: 'premolar' },
  { fdi: '44', q: '4R', type: 'premolar' },
  { fdi: '43', q: '3R', type: 'canine' },
  { fdi: '42', q: '2R', type: 'incisor' },
  { fdi: '41', q: '1R', type: 'incisor' },
  { fdi: '31', q: '1L', type: 'incisor' },
  { fdi: '32', q: '2L', type: 'incisor' },
  { fdi: '33', q: '3L', type: 'canine' },
  { fdi: '34', q: '4L', type: 'premolar' },
  { fdi: '35', q: '5L', type: 'premolar' },
  { fdi: '36', q: '6L', type: 'molar' },
  { fdi: '37', q: '7L', type: 'molar' },
  { fdi: '38', q: '8L', type: 'molar' },
];

const PEDIATRIC_UPPER = [
  { fdi: '55', q: 'E-R', type: 'molar' },
  { fdi: '54', q: 'D-R', type: 'molar' },
  { fdi: '53', q: 'C-R', type: 'canine' },
  { fdi: '52', q: 'B-R', type: 'incisor' },
  { fdi: '51', q: 'A-R', type: 'incisor' },
  { fdi: '61', q: 'A-L', type: 'incisor' },
  { fdi: '62', q: 'B-L', type: 'incisor' },
  { fdi: '63', q: 'C-L', type: 'canine' },
  { fdi: '64', q: 'D-L', type: 'molar' },
  { fdi: '65', q: 'E-L', type: 'molar' },
];

const PEDIATRIC_LOWER = [
  { fdi: '85', q: 'E-R', type: 'molar' },
  { fdi: '84', q: 'D-R', type: 'molar' },
  { fdi: '83', q: 'C-R', type: 'canine' },
  { fdi: '82', q: 'B-R', type: 'incisor' },
  { fdi: '81', q: 'A-R', type: 'incisor' },
  { fdi: '71', q: 'A-L', type: 'incisor' },
  { fdi: '72', q: 'B-L', type: 'incisor' },
  { fdi: '73', q: 'C-L', type: 'canine' },
  { fdi: '74', q: 'D-L', type: 'molar' },
  { fdi: '75', q: 'E-L', type: 'molar' },
];

export function AnatomicalExamChart({
  readOnly = false,
  patientName = 'Passant',
  patientNameAr = 'بسنت',
  fileNumber = 'EBT-PAT-0001',
  doctorNameEn = 'Dr. Sandy Saad',
  doctorNameAr = 'د. ساندي سعد',
}: {
  readOnly?: boolean;
  patientName?: string;
  patientNameAr?: string;
  fileNumber?: string;
  doctorNameEn?: string;
  doctorNameAr?: string;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);

  // Seeded clinical history belongs to the demo file only; every other patient
  // starts with a blank odontogram and an empty treatment plan.
  const registryPatient = getPatientById(fileNumber);
  const hasSeededHistory = fileNumber === 'EBT-PAT-0001';

  const [isPediatric, setIsPediatric] = useState(false);
  const [compareVisitsMode, setCompareVisitsMode] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState('fillings');
  const [activeStatusPaint, setActiveStatusPaint] = useState<
    'COMPLETED_BROWN' | 'IN_PROGRESS_CYAN' | 'FOLLOW_UP_BLUE'
  >('IN_PROGRESS_CYAN');
  const [selectedToothFdi, setSelectedToothFdi] = useState<string>('27');
  const [invoiceNotice, setInvoiceNotice] = useState<string | null>(null);

  // Add Procedure to Treatment Plan Builder State
  const [showAddProcedureForm, setShowAddProcedureForm] = useState(false);
  const [newVisitNum, setNewVisitNum] = useState<number>(4);
  const [newToothNum, setNewToothNum] = useState<string>('#36');
  const [newProcId, setNewProcId] = useState<string>('proc-rct');
  const [newProcStatus, setNewProcStatus] = useState<'COMPLETED' | 'BOOKED' | 'NOT_STARTED'>(
    'COMPLETED'
  );

  // Initial teeth matching Image 11 exactly:
  // - Tooth 13 (3R): Brown/Terracotta root & crown (Completed RCT/Crown)
  // - Tooth 27 (7L): Cyan crown & occlusal wheel (In-progress filling/crown)
  // - Tooth 41 (Lower 1R) & Tooth 34 (Lower 4L): Royal Blue (Planned / Needs follow-up)
  const [chartedTeeth, setChartedTeeth] = useState<Record<string, ToothClinicalRecord>>(
    hasSeededHistory
      ? {
    '13': {
      fdi: '13',
      quadLabel: '3R',
      status: 'COMPLETED_BROWN',
      procedureEn: 'Endodontic Root Canal & Post',
      procedureAr: 'علاج جذور ودعامة',
      costEgp: SERVICES.rct.price + SERVICES.post.price,
      visitDate: clinicDateISO(-14),
    },
    '27': {
      fdi: '27',
      quadLabel: '7L',
      status: 'IN_PROGRESS_CYAN',
      procedureEn: 'MOD Nanohybrid Composite Filling',
      procedureAr: 'حشو تجميلي ضوئي',
      costEgp: SERVICES.filling.price,
      visitDate: clinicTodayISO(),
    },
    '41': {
      fdi: '41',
      quadLabel: '1R',
      status: 'FOLLOW_UP_BLUE',
      procedureEn: 'Anterior Composite Restoration',
      procedureAr: 'ترميم تجميلي أمامي',
      costEgp: SERVICES.filling.price,
      visitDate: clinicTodayISO(),
    },
    '34': {
      fdi: '34',
      quadLabel: '4L',
      status: 'FOLLOW_UP_BLUE',
      procedureEn: 'Ceramic Inlay / Crown Prep',
      procedureAr: 'تحضير تاج خزفي',
      costEgp: SERVICES.crown.price,
      visitDate: clinicTodayISO(),
    },
      }
      : {}
  );

  // Treatment Plan Visits Table matching Image 12 with realistic Minya EGP prices
  const [planVisits, setPlanVisits] = useState<
    Array<{
      visit: number;
      procedureEn: string;
      procedureAr: string;
      costEgp: number;
      status: 'COMPLETED' | 'BOOKED' | 'NOT_STARTED';
    }>
  >(
    hasSeededHistory
      ? [
    {
      visit: 1,
      procedureEn: 'Composite Filling · Tooth #16',
      procedureAr: 'حشو تجميلي · سن 16',
      costEgp: SERVICES.filling.price,
      status: 'COMPLETED',
    },
    {
      visit: 2,
      procedureEn: 'Root Canal Therapy · Tooth #36',
      procedureAr: 'علاج الجذور (حشو عصب) · سن 36',
      costEgp: SERVICES.rct.price,
      status: 'BOOKED',
    },
    {
      visit: 3,
      procedureEn: 'Zirconia Crown · Tooth #26',
      procedureAr: 'تاج زيركون · سن 26',
      costEgp: SERVICES.crown.price,
      status: 'NOT_STARTED',
    },
  ]
      : []
  );

  const handleAddProcedureToPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const procObj =
      STANDARD_MINYA_PROCEDURES.find((p) => p.id === newProcId) || STANDARD_MINYA_PROCEDURES[1];
    const cleanTooth = newToothNum.replace('#', '');
    setPlanVisits((prev) => [
      ...prev,
      {
        visit: prev.length === 0 ? 1 : Number(newVisitNum) || prev.length + 1,
        procedureEn: `${procObj.nameEn} · Tooth #${cleanTooth}`,
        procedureAr: `${procObj.nameAr} · سن #${cleanTooth}`,
        costEgp: procObj.priceEgp,
        status: newProcStatus,
      },
    ]);
    setNewVisitNum((v) => v + 1);
    setShowAddProcedureForm(false);
  };

  const handleUpdateVisitStatus = (
    idx: number,
    nextStatus: 'COMPLETED' | 'BOOKED' | 'NOT_STARTED'
  ) => {
    setPlanVisits((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, status: nextStatus } : item))
    );
  };

  const handleSendProceduresToReceptionForBilling = () => {
    const billableVisits =
      planVisits.filter((v) => v.status === 'COMPLETED').length > 0
        ? planVisits.filter((v) => v.status === 'COMPLETED')
        : planVisits;
    const totalToBill = billableVisits.reduce((s, v) => s + v.costEgp, 0);
    const summaryEn = billableVisits.map((v) => v.procedureEn).join(' + ');
    const summaryAr = billableVisits.map((v) => v.procedureAr).join(' + ');

    const payload: PendingClinicalChargeHandoff = {
      id: `CHG-${Date.now()}`,
      patientId: fileNumber,
      patientNameEn: patientName,
      patientNameAr,
      doctorNameEn,
      doctorNameAr,
      proceduresSummaryEn: summaryEn,
      proceduresSummaryAr: summaryAr,
      totalAmountEgp: totalToBill,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_BILLING',
    };

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(PENDING_CLINICAL_CHARGES_KEY);
        const existing: PendingClinicalChargeHandoff[] = raw ? JSON.parse(raw) : [];
        window.localStorage.setItem(
          PENDING_CLINICAL_CHARGES_KEY,
          JSON.stringify([payload, ...existing])
        );
        window.dispatchEvent(new Event(PENDING_CLINICAL_CHARGES_EVENT));
      } catch {}
    }

    setInvoiceNotice(
      c(
        `Sent clinical procedures (${summaryEn} · Total EGP ${totalToBill.toLocaleString()}) to Reception (/reception/finance) for invoicing & collection.`,
        `تم إرسال الإجراءات الإكلينيكية (${summaryAr} · الإجمالي ${totalToBill.toLocaleString()} ج.م) إلى قسم الاستقبال (/reception/finance) لإصدار الفاتورة والتحصيل.`
      )
    );
  };

  const specialtyTools = [
    { id: 'timer', labelAr: 'مؤقت وتنبيه', labelEn: 'Timer', icon: Clock },
    { id: 'restorative', labelAr: 'ترميم', labelEn: 'Restorative', icon: Sparkles },
    { id: 'crowns', labelAr: 'تعويضات', labelEn: 'Crowns', icon: Crown },
    { id: 'fillings', labelAr: 'حشوات', labelEn: 'Fillings', icon: Layers },
    { id: 'endo', labelAr: 'علاج جذور', labelEn: 'Endo / RCT', icon: Activity },
    { id: 'perio', labelAr: 'لثة', labelEn: 'Perio', icon: Heart },
    { id: 'cosmetic', labelAr: 'تجميل', labelEn: 'Cosmetic', icon: Sparkles },
    { id: 'surgery', labelAr: 'جراحة', labelEn: 'Surgery', icon: Scissors },
    { id: 'ortho', labelAr: 'تقويم', labelEn: 'Ortho', icon: Grid },
    { id: 'diagnosis', labelAr: 'تشخيص', labelEn: 'Diagnosis', icon: Search },
    { id: 'microscope', labelAr: 'المجهر', labelEn: 'Microscope', icon: Eye },
  ];

  const handleToothClick = (fdi: string, quadLabel: string) => {
    setSelectedToothFdi(fdi);
    if (readOnly) return;

    const procBySpec: Record<string, [string, string, number]> = {
      fillings: ['Composite filling', 'حشو تجميلي', 350],
      crowns: ['Zirconia crown', 'تاج زيركون', 2400],
      endo: ['Root canal treatment', 'علاج جذور', 1800],
      surgery: ['Surgical extraction', 'خلع جراحي', 600],
      restorative: ['Core build-up & restoration', 'ترميم وبناء السن', 950],
    };
    const [pEn, pAr, cost] = procBySpec[activeSpecialty] || ['Composite filling', 'حشو تجميلي', 350];

    setChartedTeeth((prev) => {
      const existing = prev[fdi];
      if (existing && existing.status === activeStatusPaint) {
        const copy = { ...prev };
        delete copy[fdi];
        return copy;
      }
      return {
        ...prev,
        [fdi]: {
          fdi,
          quadLabel,
          status: activeStatusPaint,
          procedureEn: `${pEn} · tooth ${fdi}`,
          procedureAr: `${pAr} · سن ${fdi}`,
          costEgp: cost,
          visitDate: clinicTodayISO(),
        },
      };
    });

    // Also append to treatment plan visits table if not already present
    setPlanVisits((prev) => [
      ...prev,
      {
        visit: prev.length + 1,
        procedureEn: `${pEn} · tooth ${fdi}`,
        procedureAr: `${pAr} · سن ${fdi}`,
        costEgp: cost,
        status:
          activeStatusPaint === 'COMPLETED_BROWN'
            ? 'COMPLETED'
            : activeStatusPaint === 'IN_PROGRESS_CYAN'
            ? 'BOOKED'
            : 'NOT_STARTED',
      },
    ]);
  };

  const totalPlanCost = planVisits.reduce((sum, v) => sum + v.costEgp, 0);
  const recordedCount = Object.keys(chartedTeeth).length;

  const renderAnatomicalToothColumn = (
    tooth: { fdi: string; q: string; type: string },
    isUpper: boolean
  ) => {
    const rec = chartedTeeth[tooth.fdi];
    const isSelected = selectedToothFdi === tooth.fdi;

    const palette =
      rec?.status === 'COMPLETED_BROWN'
        ? {
            crownFill: '#B87B56',
            rootFill: '#D4A373',
            stroke: '#8D5B3C',
            wheelFill: '#C2845E',
          }
        : rec?.status === 'IN_PROGRESS_CYAN'
        ? {
            crownFill: '#38BDF8',
            rootFill: '#F3E5D0',
            stroke: '#0284C7',
            wheelFill: '#38BDF8',
          }
        : rec?.status === 'FOLLOW_UP_BLUE'
        ? {
            crownFill: '#3B82F6',
            rootFill: '#3B82F6',
            stroke: '#1D4ED8',
            wheelFill: '#3B82F6',
          }
        : {
            crownFill: '#FAF3E8',
            rootFill: '#F3E5D0',
            stroke: '#C8A97E',
            wheelFill: '#FAF3E8',
          };

    const RootAndCrownSvg = (
      <svg
        viewBox="0 0 44 76"
        className={`w-9 sm:w-11 h-16 sm:h-20 transition-transform ${
          isSelected ? 'scale-110 drop-shadow-md' : 'hover:scale-105'
        }`}
      >
        {isUpper ? (
          <>
            {/* Upper Roots pointing UP */}
            {tooth.type === 'molar' ? (
              <path
                d="M 10 44 L 8 10 C 8 6, 13 6, 15 14 L 18 36 L 22 8 C 22 4, 25 4, 26 12 L 27 36 L 31 12 C 33 6, 36 8, 35 16 L 34 44 Z"
                fill={palette.rootFill}
                stroke={palette.stroke}
                strokeWidth="1.4"
              />
            ) : (
              <path
                d="M 15 44 L 20 8 C 21 3, 24 3, 25 8 L 29 44 Z"
                fill={palette.rootFill}
                stroke={palette.stroke}
                strokeWidth="1.4"
              />
            )}
            {/* Pulp Canal Line */}
            <line
              x1="22"
              y1="14"
              x2="22"
              y2="52"
              stroke={rec ? '#FFFFFF' : '#D9B991'}
              strokeWidth="1.2"
              opacity="0.7"
            />
            {/* Upper Crown at Bottom */}
            <rect
              x="8"
              y="42"
              width="28"
              height="26"
              rx="9"
              fill={palette.crownFill}
              stroke={palette.stroke}
              strokeWidth="1.6"
            />
          </>
        ) : (
          <>
            {/* Lower Crown at Top */}
            <rect
              x="8"
              y="8"
              width="28"
              height="26"
              rx="9"
              fill={palette.crownFill}
              stroke={palette.stroke}
              strokeWidth="1.6"
            />
            {/* Lower Roots pointing DOWN */}
            {tooth.type === 'molar' ? (
              <path
                d="M 10 32 L 11 66 C 12 72, 16 70, 18 60 L 22 40 L 26 60 C 28 70, 32 72, 33 66 L 34 32 Z"
                fill={palette.rootFill}
                stroke={palette.stroke}
                strokeWidth="1.4"
              />
            ) : (
              <path
                d="M 15 32 L 20 68 C 21 73, 24 73, 25 68 L 29 32 Z"
                fill={palette.rootFill}
                stroke={palette.stroke}
                strokeWidth="1.4"
              />
            )}
            <line
              x1="22"
              y1="24"
              x2="22"
              y2="62"
              stroke={rec ? '#FFFFFF' : '#D9B991'}
              strokeWidth="1.2"
              opacity="0.7"
            />
          </>
        )}
      </svg>
    );

    const OcclusalWheelSvg = (
      <svg viewBox="0 0 36 36" className="w-7 sm:w-8 h-7 sm:h-8">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill={palette.wheelFill}
          stroke={palette.stroke}
          strokeWidth="1.5"
        />
        <line x1="7" y1="7" x2="29" y2="29" stroke={palette.stroke} strokeWidth="1.1" />
        <line x1="29" y1="7" x2="7" y2="29" stroke={palette.stroke} strokeWidth="1.1" />
        <circle
          cx="18"
          cy="18"
          r="6.5"
          fill={rec ? palette.wheelFill : '#FFFFFF'}
          stroke={palette.stroke}
          strokeWidth="1.3"
        />
      </svg>
    );

    return (
      <button
        key={tooth.fdi}
        type="button"
        onClick={() => handleToothClick(tooth.fdi, tooth.q)}
        aria-label={`Tooth ${tooth.fdi} (${tooth.q})`}
        className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all ${
          isSelected ? 'ring-2 ring-blue-600 bg-blue-50/50' : 'hover:bg-amber-100/40'
        }`}
      >
        {isUpper ? (
          <>
            {RootAndCrownSvg}
            {OcclusalWheelSvg}
            <span className="text-[11px] font-black font-mono text-slate-700 mt-0.5">
              {tooth.q}
            </span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-black font-mono text-slate-700 mb-0.5">
              {tooth.q}
            </span>
            {OcclusalWheelSvg}
            {RootAndCrownSvg}
          </>
        )}
      </button>
    );
  };

  const activeUpper = isPediatric ? PEDIATRIC_UPPER : UPPER_TEETH;
  const activeLower = isPediatric ? PEDIATRIC_LOWER : LOWER_TEETH;

  return (
    <div className="space-y-6">
      {/* ====================================================================
          IMAGE 11: INTERACTIVE ANATOMICAL EXAM ROOM & DENTAL CHART WORKBENCH
         ==================================================================== */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        {/* Top Exam Room Patient Header matching Image 11 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-extrabold text-base flex items-center justify-center shrink-0">
              {isAr
                ? registryPatient?.initialsAr || 'م'
                : registryPatient?.initials || 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">
                  {isAr ? patientNameAr : patientName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-extrabold">
                  {c('Chart', 'مخطط')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {registryPatient
                  ? c(
                      `${
                        registryPatient.gender === 'Male' ? 'Male' : 'Female'
                      } · ${
                        registryPatient.age ? `${registryPatient.age} yrs` : 'Age not recorded'
                      } · File #: ${fileNumber}`,
                      `${
                        registryPatient.gender === 'Male' ? 'ذكر' : 'أنثى'
                      } · ${
                        registryPatient.age ? `${registryPatient.age} سنة` : 'العمر غير مسجل'
                      } · رقم الملف: ${fileNumber}`
                    )
                  : c(`File #: ${fileNumber}`, `رقم الملف: ${fileNumber}`)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{c(`Visit Date: ${clinicTodayISO()}`, `موعد اليوم: ${clinicTodayISO()}`)}</span>
            </span>

            <button
              type="button"
              onClick={() => setCompareVisitsMode(!compareVisitsMode)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                compareVisitsMode
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c('Compare Across Visits', 'مقارنة الحالة عبر الزيارات')}
            </button>
          </div>
        </div>

        {/* Specialty Toolbar matching Image 11 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {specialtyTools.map((tool) => {
            const Icon = tool.icon;
            const active = activeSpecialty === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveSpecialty(tool.id)}
                className={`flex flex-col items-center justify-center min-w-[74px] py-2 px-2.5 rounded-2xl border text-xs font-extrabold transition-all active:scale-95 ${
                  active
                    ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="text-[11px] whitespace-nowrap">
                  {isAr ? tool.labelAr : tool.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Color Switcher & Pediatric Chart Toggle matching Image 11 */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-extrabold">
              • {c('Teeth', 'الأسنان')}
            </span>

            <button
              type="button"
              onClick={() => setActiveStatusPaint('COMPLETED_BROWN')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                activeStatusPaint === 'COMPLETED_BROWN'
                  ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#B87B56]" />
              <span>{c('Completed (History)', 'مكتمل (السابق)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusPaint('IN_PROGRESS_CYAN')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                activeStatusPaint === 'IN_PROGRESS_CYAN'
                  ? 'bg-sky-100 text-sky-950 border-sky-400 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>{c('In Progress (Current)', 'قيد العلاج (الحالي)')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStatusPaint('FOLLOW_UP_BLUE')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                activeStatusPaint === 'FOLLOW_UP_BLUE'
                  ? 'bg-blue-100 text-blue-950 border-blue-400 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>{c('Needs Follow-up / Planned', 'يحتاج متابعة / مخطط')}</span>
            </button>
          </div>

          {/* Pediatric Primary Teeth Toggle ("أسنان الطفل") */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPediatric(!isPediatric)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all active:scale-95 ${
                isPediatric
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'
              }`}
            >
              {isPediatric
                ? c('✓ Pediatric Primary Teeth (20)', '✓ مخطط أسنان الطفل (20)')
                : c('Pediatric Chart (أسنان الطفل)', 'أسنان الطفل')}
            </button>
          </div>
        </div>

        {/* Compare Across Visits Banner */}
        {compareVisitsMode && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs flex flex-wrap items-center justify-between gap-2">
            <strong>
              {c(
                `Visit Comparison Active: Comparing Visit 1 (${clinicDateISO(-14)}) vs Today (${clinicTodayISO()}) — Tooth #13 completed, Tooth #27 in progress.`,
                `مقارنة الحالة عبر الزيارات: مقارنة الزيارة الأولى (${clinicDateISO(-14)}) بزيارة اليوم (${clinicTodayISO()}) لعرض التقدم للمريض.`
              )}
            </strong>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-bold">
              +40% Progress
            </span>
          </div>
        )}

        {/* WARM CREAM ANATOMICAL ODONTOGRAM CANVAS (Exact match to Image 11) */}
        <div className="relative rounded-3xl bg-[#FBF6EE] border border-[#EBDCCB] p-5 overflow-x-auto">
          <div className="min-w-[820px] space-y-4">
            {/* Top Arch Header */}
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 px-4">
              <span>{c('Right', 'يمين')}</span>
              <span className="text-slate-700">{c('Upper Arch', 'الفك العلوي')}</span>
              <span>{c('Left', 'يسار')}</span>
            </div>

            {/* Upper Teeth Row */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 border-b border-[#E5D4C0] pb-3">
              {activeUpper.map((t) => renderAnatomicalToothColumn(t, true))}
            </div>

            {/* Lower Teeth Row */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 pt-1">
              {activeLower.map((t) => renderAnatomicalToothColumn(t, false))}
            </div>

            {/* Bottom Arch Footer */}
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-500 px-4">
              <span>{c('Right', 'يمين')}</span>
              <span className="text-slate-700">{c('Lower Arch', 'الفك السفلي')}</span>
              <span>{c('Left', 'يسار')}</span>
            </div>
          </div>

          {/* Floating Bottom Summary & Reception Billing Handoff Pill Bar */}
          <div className="mt-5 mx-auto max-w-xl rounded-2xl bg-white border border-slate-200/90 shadow-lg p-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 ps-2 text-xs font-extrabold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>
                {c(
                  `${planVisits.length} procedures in plan: EGP ${totalPlanCost.toLocaleString()}`,
                  `${planVisits.length} إجراء في الخطة: ${totalPlanCost.toLocaleString()} ج.م`
                )}
              </span>
            </div>

            {!readOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (planVisits.length > 0) {
                      setPlanVisits(planVisits.slice(0, -1));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{c('Undo', 'تراجع')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendProceduresToReceptionForBilling}
                  className="px-4 py-2 rounded-xl bg-[#0B2528] hover:bg-[#153D42] text-white text-xs font-extrabold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#C8A96E]" />
                  <span>
                    {c('Send to Reception for Billing', 'إرسال للاستقبال لإصدار الفاتورة')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {invoiceNotice && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{invoiceNotice}</span>
            </span>
            <button type="button" onClick={() => setInvoiceNotice(null)}>
              ✕
            </button>
          </div>
        )}
      </section>

      {/* ====================================================================
          IMAGE 12: TREATMENT PLAN BUILDER + CLINICAL-TO-RECEPTION BILLING HANDOFF
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* IMAGE 12: TREATMENT PLAN CARD */}
        <section className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-extrabold text-slate-900">
                {c('Treatment plan', 'خطة العلاج')}
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
                {c('Patient approved ✓', 'موافقة المريض ✓')}
              </span>
            </div>

            {!readOnly && (
              <button
                type="button"
                onClick={() => setShowAddProcedureForm((s) => !s)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{c('+ Add Procedure', '+ إضافة إجراء للخطة')}</span>
              </button>
            )}
          </div>

          {/* Inline [+ Add Procedure] Builder Form */}
          {!readOnly && showAddProcedureForm && (
            <form
              onSubmit={handleAddProcedureToPlan}
              className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3 text-xs"
            >
              <div className="font-black text-slate-900">
                {c(
                  'Add Procedure to Treatment Plan (Standardized Minya EGP Fee Schedule)',
                  'إضافة إجراء جديد إلى خطة العلاج (قائمة أسعار فروع المنيا المعتمدة)'
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {c('Visit #', 'رقم الزيارة')}
                  </label>
                  <select
                    value={newVisitNum}
                    onChange={(e) => setNewVisitNum(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 font-bold text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((v) => (
                      <option key={v} value={v}>
                        {c(`Visit ${v}`, `الزيارة ${v}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {c('Tooth Number', 'رقم السن')}
                  </label>
                  <select
                    value={newToothNum}
                    onChange={(e) => setNewToothNum(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 font-bold text-slate-900"
                  >
                    {[
                      '#16',
                      '#26',
                      '#36',
                      '#46',
                      '#13',
                      '#27',
                      '#34',
                      '#41',
                      '#11',
                      '#21',
                      '#38',
                      'Full Arch',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t === 'Full Arch' ? c('Full Arch', 'الفك بالكامل') : `Tooth ${t}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {c('Procedure (EGP)', 'الإجراء العلاجي')}
                  </label>
                  <select
                    value={newProcId}
                    onChange={(e) => setNewProcId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 font-bold text-slate-900"
                  >
                    {STANDARD_MINYA_PROCEDURES.map((proc) => (
                      <option key={proc.id} value={proc.id}>
                        {proc.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {c('Status', 'الحالة')}
                  </label>
                  <select
                    value={newProcStatus}
                    onChange={(e) =>
                      setNewProcStatus(
                        e.target.value as 'COMPLETED' | 'BOOKED' | 'NOT_STARTED'
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-2 font-bold text-slate-900"
                  >
                    <option value="COMPLETED">{c('Completed', 'مكتمل')}</option>
                    <option value="BOOKED">{c('In Progress', 'قيد العلاج')}</option>
                    <option value="NOT_STARTED">{c('Planned', 'مخطط')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProcedureForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-600"
                >
                  {c('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-1.5 font-extrabold text-white shadow-2xs"
                >
                  {c('Add to Treatment Plan', 'إضافة لخطة العلاج')}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-3">{c('Visit', 'الزيارة')}</th>
                  <th className="py-2.5 px-3">{c('Procedure', 'الإجراء والسن')}</th>
                  <th className="py-2.5 px-3">{c('Cost (EGP)', 'التكلفة (ج.م)')}</th>
                  <th className="py-2.5 px-3">{c('Status', 'الحالة')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planVisits.map((pv, idx) => (
                  <tr key={`${pv.visit}-${idx}`}>
                    <td className="py-3.5 px-3 font-black text-slate-900 tabular-nums">
                      {pv.visit}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {isAr ? pv.procedureAr : pv.procedureEn}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 tabular-nums">
                      {pv.costEgp.toLocaleString()} EGP
                    </td>
                    <td className="py-3.5 px-3">
                      {!readOnly ? (
                        <select
                          aria-label="Procedure Status"
                          value={pv.status}
                          onChange={(e) =>
                            handleUpdateVisitStatus(
                              idx,
                              e.target.value as 'COMPLETED' | 'BOOKED' | 'NOT_STARTED'
                            )
                          }
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                            pv.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : pv.status === 'BOOKED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="COMPLETED">{c('Completed', 'مكتمل')}</option>
                          <option value="BOOKED">{c('In Progress', 'قيد العلاج')}</option>
                          <option value="NOT_STARTED">{c('Planned', 'مخطط')}</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold inline-block ${
                            pv.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pv.status === 'BOOKED'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {pv.status === 'COMPLETED'
                            ? c('Completed', 'مكتمل')
                            : pv.status === 'BOOKED'
                            ? c('In Progress', 'قيد العلاج')
                            : c('Planned', 'مخطط')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {planVisits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-3 text-center text-xs font-bold text-slate-500">
                      {c(
                        'No procedures planned for this patient yet.',
                        'لا توجد إجراءات مخططة لهذا المريض حتى الآن.'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Total & Send to Reception for Billing Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <strong className="text-sm font-extrabold text-slate-900">
              {c('Total Approved Treatment Plan Cost', 'إجمالي تكلفة خطة العلاج المعتمدة')}
            </strong>
            <div className="flex flex-wrap items-center gap-4">
              <strong className="text-xl font-black text-blue-600 tabular-nums">
                EGP {totalPlanCost.toLocaleString()}
              </strong>
              {!readOnly && (
                <button
                  type="button"
                  onClick={handleSendProceduresToReceptionForBilling}
                  className="px-5 py-2.5 rounded-xl bg-[#0B2528] hover:bg-[#153D42] text-white text-xs font-extrabold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#C8A96E]" />
                  <span>
                    {c('Send to Reception for Billing', 'إرسال للاستقبال لإصدار الفاتورة')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* X-RAYS AND BEFORE/AFTER PHOTOS LINKED TO THE SELECTED TOOTH */}
        <section className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {c(
                  `Tooth #${selectedToothFdi} — Linked X-Rays & Before/After`,
                  `سن #${selectedToothFdi} — الأشعة وصور قبل وبعد`
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {readOnly
                  ? c(
                      'Shared by your treating doctor — View & Download Only',
                      'مشاركة من طبيبك المعالج — للعرض والتحميل فقط'
                    )
                  : c(
                      'Upload straight from the tablet in the exam room',
                      'ارفع الأشعة والصور مباشرة من التابلت في غرفة الكشف'
                    )}
              </p>
            </div>
            <Camera className="w-5 h-5 text-blue-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black relative">
              <img
                src="/images/hero_implant_2.jpg"
                alt="Tooth Periapical X-ray"
                className="w-full h-36 object-cover filter grayscale contrast-125"
              />
              <span className="absolute bottom-2 start-2 px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[10px] font-bold">
                {c(`X-Ray · Tooth #${selectedToothFdi}`, `أشعة · سن #${selectedToothFdi}`)}
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-emerald-300 bg-black relative">
              <img
                src="/images/hero_smile_3.jpg"
                alt="Before and After Photo"
                className="w-full h-36 object-cover"
              />
              <span className="absolute bottom-2 start-2 px-2.5 py-0.5 rounded-full bg-emerald-700/90 text-white text-[10px] font-bold">
                {c('Before / After Photo', 'صورة قبل وبعد')}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-semibold">
              {c(
                'Linked directly to tooth & visit — never scattered.',
                'مربوطة مباشرة بالسن والزيارة للرجوع إليها فوراً.'
              )}
            </span>
            {!readOnly ? (
              <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold cursor-pointer shrink-0">
                + {c('Upload', 'رفع صورة')}
                <input type="file" className="hidden" accept="image/*" />
              </label>
            ) : (
              <a
                href="/images/hero_implant_2.jpg"
                download={`Tooth-${selectedToothFdi}-XRay.jpg`}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-extrabold shrink-0"
              >
                {c('Download Scan', 'تحميل الأشعة')}
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
