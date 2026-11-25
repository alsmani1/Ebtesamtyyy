'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { clinicDateISO, clinicTodayISO } from '@/lib/clinic-clock';
import { patientFinance } from '@/lib/clinic-finance';
import { SERVICES } from '@/lib/clinic-pricing';
import {
  Search,
  QrCode,
  Printer,
  Edit3,
  Plus,
  FileText,
  Users,
  CheckCircle2,
  Camera,
  Calendar,
  Pill,
  FlaskConical,
  CreditCard,
  RefreshCw,
  Copy,
  Download,
  Share2,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  X,
  Upload,
} from 'lucide-react';
import {
  addFamilyMember,
  enrollPatient,
  getPatientById,
  listPatients,
  PATIENTS_DB_EVENT,
  seedPatients,
  type PatientBranchCode,
  type PatientRecord,
} from '@/lib/patients-db';

export interface PatientRecordItem {
  id: string;
  fullName: string;
  fullNameAr?: string;
  phone: string;
  code: string;
  shortCode: string;
  age: number;
  gender: string;
  doctorName: string;
  balanceEgp: number;
  totalSpentEgp: number;
  visitsCount: number;
  insurance: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  familyGroup?: string;
  familyMembers?: Array<{ name: string; relation: string; code: string }>;
  avatarColor: string;
  initials: string;
  initialsAr: string;
}

const ledgerMoney = (patientId: string) => {
  const finance = patientFinance(patientId);
  return { balanceEgp: -finance.totalDue, totalSpentEgp: finance.totalPaid };
};

const patientWalletSeed = (patient: PatientRecordItem) =>
  patientFinance(patient.code)
    .invoices.slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
    .map((invoice) => ({
      id: invoice.id,
      procedureEn: invoice.lines.map((line) => line.nameEn).join(' + '),
      procedureAr: invoice.lines.map((line) => line.nameAr).join(' + '),
      date: invoice.date,
      amountEgp: invoice.total,
      paidEgp: invoice.paid,
      status: invoice.paid >= invoice.total ? 'PAID' : 'UNPAID',
    }));

const shortCodeFor = (code: string) => {
  const digits = code.replace(/\D/g, '');
  return (digits.slice(-2) || '00').padStart(2, '0');
};

function registryToRecord(patient: PatientRecord): PatientRecordItem {
  return {
    id: patient.id,
    fullName: patient.fullName,
    fullNameAr: patient.fullNameAr,
    phone: patient.phone,
    code: patient.id,
    shortCode: shortCodeFor(patient.id),
    age: patient.age ?? 0,
    gender: patient.gender || 'Female',
    doctorName: patient.primaryDoctorEn || 'Dr. Sandy Saad',
    ...ledgerMoney(patient.id),
    visitsCount: patient.visitsCount,
    insurance: patient.insurance || 'None',
    allergies: [...patient.allergies],
    chronicConditions: [...patient.chronicConditions],
    medications: [...patient.medications],
    familyGroup: patient.familyGroup,
    familyMembers: patient.familyMembers?.map((member) => ({ ...member })),
    avatarColor: patient.avatarColor,
    initials: patient.initials,
    initialsAr: patient.initialsAr,
  };
}

const patientDirectory = () => listPatients().map(registryToRecord);
const seedDirectory = () => seedPatients().map(registryToRecord);

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-blue-100 text-blue-900 px-1 py-0.2 rounded-md font-extrabold">
        {match}
      </mark>
      {after}
    </>
  );
}

/* ============================================================================
   IMAGE 3: INSTANT TYPEAHEAD PATIENT SEARCH (By Name, Phone, or Automatic Code)
   ============================================================================ */
export function InstantPatientSearch({
  onSelectPatient,
  selectedPatientId,
}: {
  onSelectPatient?: (patient: PatientRecordItem) => void;
  selectedPatientId?: string;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [query, setQuery] = useState('Mo');
  const [patients, setPatients] = useState<PatientRecordItem[]>(() => seedDirectory());
  const [showFamilyModal, setShowFamilyModal] = useState<PatientRecordItem | null>(null);
  const [newChildName, setNewChildName] = useState('');
  const [newChildRelation, setNewChildRelation] = useState('Child');

  useEffect(() => {
    const refresh = () => setPatients(patientDirectory());
    refresh();
    window.addEventListener(PATIENTS_DB_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(PATIENTS_DB_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const filtered = patients.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      (p.fullNameAr || '').toLowerCase().includes(q) ||
      p.phone.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
      p.code.toLowerCase().includes(q) ||
      p.shortCode.includes(q)
    );
  });

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFamilyModal || !newChildName.trim()) return;
    addFamilyMember(showFamilyModal.id, {
      name: newChildName.trim(),
      relation: newChildRelation,
    });
    setPatients(patientDirectory());
    setNewChildName('');
    setShowFamilyModal(null);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-extrabold text-slate-900">
          {c('Search', 'بحث فوري عن المريض (بالاسم أو الهاتف أو الكود التلقائي)')}
        </h3>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          {c('Auto-Code System: P-XXXX', 'ترقيم تلقائي لكل مريض')}
        </span>
      </div>

      {/* Blue-ringed instant search input matching Image 3 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={c('Search by name, phone or code (e.g. Mo, 0100, P-1042)...', 'ابحث بالاسم أو رقم الهاتف أو الكود...')}
          aria-label="Instant patient search by name, phone or code"
          className="w-full px-5 py-3.5 rounded-2xl bg-white border-2 border-blue-600 text-slate-900 font-bold text-sm shadow-[0_0_0_4px_rgba(37,99,235,0.08)] focus:outline-none"
        />
        <Search className="w-4 h-4 text-blue-600 absolute end-4 top-1/2 -translate-y-1/2" />
      </div>

      {/* Instant Results List matching Image 3 */}
      <div className="space-y-2.5">
        {filtered.slice(0, 5).map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPatient?.(p)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full ${p.avatarColor} text-white font-extrabold text-sm flex items-center justify-center shrink-0`}
                >
                  {isAr ? p.initialsAr : p.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {highlightMatch(isAr && p.fullNameAr ? p.fullNameAr : p.fullName, query)}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    <bdi>{highlightMatch(p.phone, query)}</bdi> ·{' '}
                    <span>{highlightMatch(p.code, query)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {p.familyGroup && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFamilyModal(p);
                    }}
                    className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-bold transition-colors"
                  >
                    {c('Family', 'عائلة مرتبطة')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFamilyModal(p);
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline px-2 py-1"
                  title={c('Link family member', 'ربط أفراد العائلة')}
                >
                  + {c('Link Family', 'ربط عائلة')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        {c(
          'Results appear as you type — by name, phone or code',
          'تظهر النتائج فوراً أثناء الكتابة — بالاسم أو رقم الهاتف أو الكود التلقائي'
        )}
      </p>

      {/* Family Linking Modal ("Link family members: A mother books for her children from the same place") */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-extrabold text-slate-900">
                  {c('Linked Family Members', 'أفراد العائلة المرتبطون بنفس الهاتف')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowFamilyModal(null)}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {c(
                `Primary Household File: ${showFamilyModal.fullName} (${showFamilyModal.phone}). Book or manage children and family members from one place.`,
                `الملف العائلي الرئيسي: ${showFamilyModal.fullNameAr || showFamilyModal.fullName} (${showFamilyModal.phone}). يمكن للأم الحجز لأطفالها من نفس المكان.`
              )}
            </p>

            <div className="space-y-2">
              {(showFamilyModal.familyMembers || []).map((fm, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 block">{fm.name}</strong>
                    <span className="text-slate-500">{fm.relation}</span>
                  </div>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {fm.code}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddFamilyMember} className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                {c('Link New Child / Family Member', 'إضافة طفل أو فرد عائلة جديد')}
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder={c('Full name of child or relative...', 'اسم الطفل أو فرد العائلة...')}
                  className="field w-full mt-1"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                {c('Relationship', 'صلة القرابة')}
                <select
                  value={newChildRelation}
                  onChange={(e) => setNewChildRelation(e.target.value)}
                  className="field w-full mt-1"
                >
                  <option value="Child (Son/Daughter)">{c('Child (Son / Daughter)', 'طفل (ابن / ابنة)')}</option>
                  <option value="Spouse">{c('Spouse', 'زوج / زوجة')}</option>
                  <option value="Parent">{c('Parent', 'والد / والدة')}</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFamilyModal(null)}
                  className="secondary-button text-xs py-2 px-4"
                >
                  {c('Close', 'إغلاق')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold"
                >
                  {c('Link & Generate Auto-Code', 'ربط وإصدار كود تلقائي')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function QuickPatientRegistration({
  open,
  onClose,
  onCreated,
  branchCode,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (patientId: string) => void;
  branchCode: PatientBranchCode;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setFullName('');
    setPhone('');
    setEmail('');
    setDob('');
    setGender('');
    setError('');
  }, [open]);

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError(c('Enter the patient’s name and phone number.', 'أدخل اسم المريض ورقم الهاتف.'));
      return;
    }
    const result = enrollPatient({
      fullName,
      phone,
      email: email.trim() || undefined,
      dob: dob || undefined,
      gender: gender || undefined,
      branchCode,
      source: 'staff',
    });
    onCreated(result.patient.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={c('Add Patient', 'إضافة مريض')}
        dir={isAr ? 'rtl' : 'ltr'}
        className="menu-enter max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">{c('Add Patient', 'إضافة مريض')}</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {c(`Reception registration · Branch ${branchCode}`, `تسجيل الاستقبال · الفرع ${branchCode}`)}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={c('Close', 'إغلاق')} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            {c('Full name', 'الاسم الكامل')}
            <input autoFocus required value={fullName} onChange={(event) => setFullName(event.target.value)} className="field mt-1.5 w-full" placeholder={c('Patient full name', 'اسم المريض بالكامل')} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              {c('Phone number', 'رقم الهاتف')}
              <input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="field mt-1.5 w-full" placeholder="01xxxxxxxxx" />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              {c('Date of birth', 'تاريخ الميلاد')}
              <input type="date" value={dob} onChange={(event) => setDob(event.target.value)} className="field mt-1.5 w-full" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              {c('Gender', 'النوع')}
              <select value={gender} onChange={(event) => setGender(event.target.value as 'Male' | 'Female' | '')} className="field mt-1.5 w-full">
                <option value="">{c('Select gender', 'اختر النوع')}</option>
                <option value="Female">{c('Female', 'أنثى')}</option>
                <option value="Male">{c('Male', 'ذكر')}</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              {c('Email (optional)', 'البريد الإلكتروني (اختياري)')}
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field mt-1.5 w-full" placeholder="patient@example.com" />
            </label>
          </div>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="secondary-button">{c('Cancel', 'إلغاء')}</button>
            <button type="submit" className="primary-button"><UserPlus className="h-4 w-4" />{c('Save Patient', 'حفظ المريض')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
   IMAGES 1 & 2: THE PATIENT'S FULL HISTORY ON ONE SCREEN + QR CARD MODAL
   ============================================================================ */
export function UnifiedPatientFileView({
  role = 'OWNER_ADMIN',
  initialPatient,
  initialPatientId,
  startWithNewPatient = false,
  branchCode = 'BR-A',
  onOpenExamChart,
  onOpenCbctViewer,
}: {
  role?: 'OWNER_ADMIN' | 'DENTIST' | 'RECEPTIONIST' | 'PATIENT';
  initialPatient?: PatientRecordItem;
  initialPatientId?: string;
  startWithNewPatient?: boolean;
  branchCode?: PatientBranchCode;
  onOpenExamChart?: () => void;
  onOpenCbctViewer?: () => void;
}) {
  const { locale } = useLanguage();
  const router = useRouter();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);

  // Enforce RBAC permissions from the user's 18-feature matrix:
  // - Receptionist: Demographic + Financial Wallet + Upload-Only Scans (No clinical exam chart / clinical notes)
  // - Doctor: Full Clinical (Allergy alert up front, medical history, notes, Rx, odontogram, CBCT, labs — NO financial wallet or invoice buttons)
  // - Clinic Owner: Full administrative & audit + View-Only QA on exam chart & CBCT
  // - Patient: View Own (Profile, visit history, simplified treatment plan, own scans, QR pass)
  const isReceptionist = role === 'RECEPTIONIST';
  const isDentist = role === 'DENTIST';
  const isOwner = role === 'OWNER_ADMIN';
  const isPatient = role === 'PATIENT';

  const directory = patientDirectory();
  const resolvedDefaultPatient =
    initialPatient ||
    (initialPatientId
      ? directory.find(
          (p) =>
            p.id.toLowerCase() === initialPatientId.toLowerCase() ||
            p.code.toLowerCase() === initialPatientId.toLowerCase()
        )
      : undefined) ||
    (isDentist ? directory[0] : directory[1]);

  const [selectedPatient, setSelectedPatient] = useState<PatientRecordItem>(
    resolvedDefaultPatient
  );
  const [registrationOpen, setRegistrationOpen] = useState(startWithNewPatient);

  useEffect(() => {
    if (startWithNewPatient) setRegistrationOpen(true);
  }, [startWithNewPatient]);

  const handlePatientCreated = (patientId: string) => {
    const created = patientDirectory().find((patient) => patient.id === patientId);
    if (created) setSelectedPatient(created);
  };

  const closeRegistration = () => {
    setRegistrationOpen(false);
    if (startWithNewPatient) router.replace(window.location.pathname, { scroll: false });
  };

  useEffect(() => {
    if (initialPatientId) {
      const found = patientDirectory().find(
        (p) =>
          p.id.toLowerCase() === initialPatientId.toLowerCase() ||
          p.code.toLowerCase() === initialPatientId.toLowerCase()
      );
      if (found) setSelectedPatient(found);
    }
  }, [initialPatientId]);

  const hideFinancialWallet = isDentist || isOwner;

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'activity'
    | 'chart'
    | 'medical'
    | 'consents'
    | 'xrays'
    | 'photos'
    | 'rx'
    | 'lab'
    | 'wallet'
  >(hideFinancialWallet ? 'overview' : 'wallet');

  const [showQrPassModal, setShowQrPassModal] = useState(false);
  const [qrCodeToken, setQrCodeToken] = useState('EBT-QR-5589-ACTIVE');
  const [qrCopied, setQrCopied] = useState(false);
  const [chronicInput, setChronicInput] = useState('');
  const [medInput, setMedInput] = useState('');
  const [medicalNotes, setMedicalNotes] = useState(
    'Important pre-treatment note: Verify penicillin allergy alternative (Clindamycin 300mg) before surgical extraction or root canal therapy.'
  );

  // Wallet invoices seeded from the finance ledger for the selected patient
  const [walletInvoices, setWalletInvoices] = useState(() =>
    patientWalletSeed(resolvedDefaultPatient)
  );

  useEffect(() => {
    setWalletInvoices(patientWalletSeed(selectedPatient));
  }, [selectedPatient.id, selectedPatient.code]);

  // Every visit history with date, tooth, and what was done
  const isPassantFile = selectedPatient.id === 'EBT-PAT-0001';
  const visitHistory: Array<{
    id: string;
    date: string;
    tooth: string;
    procedureEn: string;
    procedureAr: string;
    doctor: string;
    notes: string;
  }> = isPassantFile ? [
    {
      id: 'v-1',
      date: clinicDateISO(-47),
      tooth: 'Full Arch',
      procedureEn: 'In-office laser teeth whitening & fluoride desensitizing gel',
      procedureAr: 'تبييض أسنان بالليزر مع جل الفلورايد لتقليل الحساسية',
      doctor: 'Dr. Ahmed El-Sherif',
      notes: 'Shade improved from A3 to B1. Post-op instructions given.',
    },
    {
      id: 'v-2',
      date: clinicDateISO(-55),
      tooth: '#38',
      procedureEn: 'Atraumatic extraction of impacted lower left third molar #38',
      procedureAr: 'خلع جراحي لضرس العقل السفلي الأيسر #38',
      doctor: 'Dr. Sandy Saad',
      notes: 'Local anesthesia Mepivacaine 3% plain. Sutured with 3-0 Vicryl.',
    },
    {
      id: 'v-3',
      date: clinicDateISO(-61),
      tooth: '#16',
      procedureEn: 'Class II MOD Nanohybrid Composite Filling (Shade A2)',
      procedureAr: 'حشو تجميلي ضوئي للضرس العلوي الأيمن #16',
      doctor: 'Dr. Sandy Saad',
      notes: 'Rubber dam isolation, sectional matrix, occlusal adjustment verified.',
    },
    {
      id: 'v-4',
      date: clinicDateISO(-62),
      tooth: '#26',
      procedureEn: 'Zirconia Crown Cementation on endodontically treated #26',
      procedureAr: 'تثبيت تاج زيركون نهائي على الضرس #26',
      doctor: 'Dr. Ahmed El-Sherif',
      notes: 'Marginal fit verified on periapical radiograph. Cemented with resin cement.',
    },
  ] : [];

  // Tooth-linked X-rays & Before/After Photos
  const [toothAttachments, setToothAttachments] = useState([
    {
      id: 'att-1',
      category: 'BEFORE_AFTER',
      tooth: '#11–#21',
      visitDate: clinicDateISO(-47),
      titleEn: 'Anterior Smile Makeover & Whitening (Before vs After)',
      titleAr: 'صورة قبل وبعد تجميل وتبييض الأسنان الأمامية',
      beforeLabel: 'Before: Shade A3.5 & incisal wear',
      afterLabel: 'After: Shade B1 ceramic veneer & polish',
      imageUrl: '/images/hero_smile_3.jpg',
    },
    {
      id: 'att-2',
      category: 'XRAY_CBCT',
      tooth: '#36',
      visitDate: clinicDateISO(-61),
      titleEn: 'Periapical & CBCT Cross-Section — Molar #36',
      titleAr: 'أشعة مقطعية وبانوراما مرتبطة بالضرس #36',
      beforeLabel: 'Pre-op periapical radiolucency',
      afterLabel: 'Post-obturation dense root canal fill',
      imageUrl: '/images/hero_implant_2.jpg',
    },
  ]);

  const tabs = [
    { id: 'overview', labelEn: 'Overview', labelAr: 'نظرة عامة', show: true },
    { id: 'activity', labelEn: 'Visit History', labelAr: 'النشاط', show: true },
    { id: 'chart', labelEn: 'Dental Chart', labelAr: 'المخطط السنّي', show: !isReceptionist },
    { id: 'medical', labelEn: 'Medical Record', labelAr: 'السجل الطبي', show: !isReceptionist },
    { id: 'consents', labelEn: 'Consents & Forms', labelAr: 'الإقرارات والاستبيانات', show: true },
    { id: 'xrays', labelEn: 'X-Rays & 3D', labelAr: 'الأشعة و 3D', show: true },
    { id: 'photos', labelEn: 'Patient Photos', labelAr: 'صور المريض', show: true },
    { id: 'rx', labelEn: 'Prescriptions', labelAr: 'الروشتات', show: !isReceptionist },
    { id: 'lab', labelEn: 'Lab Orders', labelAr: 'المعمل', show: true },
    {
      id: 'wallet',
      labelEn: 'Financial Wallet',
      labelAr: 'المحفظة المالية',
      count: walletInvoices.length,
      show: !hideFinancialWallet,
    },
  ].filter((t) => t.show);

  return (
    <div className="space-y-6">
      {isReceptionist && (
        <QuickPatientRegistration
          open={registrationOpen}
          onClose={closeRegistration}
          onCreated={handlePatientCreated}
          branchCode={branchCode}
        />
      )}

      {/* 1. Instant Search Bar (Shown for Staff: Owner, Doctor, Receptionist) */}
      {!isPatient && (
        <InstantPatientSearch
          selectedPatientId={selectedPatient.id}
          onSelectPatient={(p) => setSelectedPatient(p)}
        />
      )}

      {/* 2. UNIFIED PATIENT PROFILE HEADER CARD (Exact match to Images 1 & 2) */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Patient Identity & Automatic Code */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full ${selectedPatient.avatarColor} text-white font-extrabold text-xl flex items-center justify-center shadow-sm shrink-0`}
            >
              {isAr ? selectedPatient.initialsAr : selectedPatient.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {isAr && selectedPatient.fullNameAr
                    ? selectedPatient.fullNameAr
                    : selectedPatient.fullName}
                </h2>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold font-mono">
                  {c(`Code ${selectedPatient.shortCode}`, `كود ${selectedPatient.shortCode}`)} (
                  {selectedPatient.code})
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  + {c('Add tag', 'أضف علامة')}
                </span>
                {getPatientById(selectedPatient.id)?.duplicatePhone && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
                    {c(
                      'Duplicate phone on file — verify identity',
                      'رقم هاتف مكرر في الملف — تحقق من الهوية'
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span>
                  {selectedPatient.age
                    ? `${selectedPatient.age} ${c('yrs', 'سنة')}`
                    : c('Age not recorded', 'العمر غير مسجل')}
                  {' - '}
                  {selectedPatient.gender === 'Male' ? c('Male', 'ذكر') : c('Female', 'أنثى')}
                </span>
                <span>•</span>
                <span className="font-mono font-bold text-slate-700">
                  <bdi>{selectedPatient.phone}</bdi>
                </span>
                <span>•</span>
                <span className="text-blue-700 font-bold">{selectedPatient.doctorName}</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons matching Images 1 & 2 (No + Invoice button for Dentist or Owner) */}
          <div className="flex flex-wrap items-center gap-2">
            {isReceptionist && (
              <button
                type="button"
                onClick={() => setRegistrationOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#0B2528] hover:bg-[#13393E] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{c('Add Patient', 'إضافة مريض')}</span>
              </button>
            )}

            {!hideFinancialWallet && (
              <button
                type="button"
                onClick={() => {
                  const newInv = {
                    id: `INV-${Date.now()}`,
                    procedureEn: 'Clinical Consultation & Panoramic Follow-up',
                    procedureAr: 'استشارة ومتابعة إكلينيكية',
                    date: clinicTodayISO(),
                    amountEgp: SERVICES.consult.price,
                    paidEgp: 0,
                    status: 'UNPAID',
                  };
                  setWalletInvoices([newInv, ...walletInvoices]);
                  setActiveTab('wallet');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{c('Invoice', 'فاتورة')}</span>
              </button>
            )}

            {isDentist && (
              <Link
                href={`/doctor/exam-room?patientId=${encodeURIComponent(
                  selectedPatient.code
                )}&patientName=${encodeURIComponent(selectedPatient.fullName)}`}
                onClick={() => {
                  if (onOpenExamChart) onOpenExamChart();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Stethoscope className="w-4 h-4 text-white" />
                <span>{c('Start Exam', 'بدء كشف')}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setShowQrPassModal(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-slate-800 border border-slate-200 text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>{c('QR Card', 'بطاقة QR')}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>{c('Print File', 'طباعة الملف')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>{c('Edit', 'تعديل')}</span>
            </button>
          </div>
        </div>

        {/* Summary Strip inside Header Card (Clinical/Admin-Only for Dentist & Owner; Financial + Visits for Receptionist/Patient) */}
        <div
          className={`grid grid-cols-2 ${
            hideFinancialWallet ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
          } divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-slate-100 border-t border-slate-100 pt-4 text-center`}
        >
          {!hideFinancialWallet && (
            <>
              <div className="p-2">
                <span className="text-xs text-slate-400 font-bold block">
                  {c('Current Balance', 'الرصيد الحالي')}
                </span>
                <strong
                  className={`text-lg font-black tabular-nums mt-0.5 block ${
                    selectedPatient.balanceEgp < 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {selectedPatient.balanceEgp.toLocaleString()} {c('EGP', 'ج.م')}
                </strong>
              </div>
              <div className="p-2">
                <span className="text-xs text-slate-400 font-bold block">
                  {c('Total Spent', 'إجمالي الإنفاق')}
                </span>
                <strong className="text-lg font-black text-slate-900 tabular-nums mt-0.5 block">
                  {selectedPatient.totalSpentEgp.toLocaleString()} {c('EGP', 'ج.م')}
                </strong>
              </div>
            </>
          )}
          <div className="p-2">
            <span className="text-xs text-slate-400 font-bold block">
              {c('Number of Visits', 'عدد الزيارات')}
            </span>
            <strong className="text-lg font-black text-slate-900 tabular-nums mt-0.5 block">
              {selectedPatient.visitsCount} {c('visits', 'زيارة')}
            </strong>
          </div>
          <div className="p-2">
            <span className="text-xs text-slate-400 font-bold block">
              {c('Insurance', 'التأمين')}
            </span>
            <strong className="text-lg font-black text-slate-900 mt-0.5 block">
              {selectedPatient.insurance === 'None' ? c('None', 'لا يوجد') : selectedPatient.insurance}
            </strong>
          </div>
          {hideFinancialWallet && (
            <div className="p-2">
              <span className="text-xs text-slate-400 font-bold block">
                {c('Treating Doctor', 'الطبيب المعالج')}
              </span>
              <strong className="text-lg font-black text-blue-700 mt-0.5 block">
                {selectedPatient.doctorName}
              </strong>
            </div>
          )}
        </div>

        {/* 10-Tab Horizontal Navigation Bar matching Image 1 */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3 pb-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black tabular-nums">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          TAB CONTENT PANELS
         ==================================================================== */}

      {/* TAB 10: FINANCIAL WALLET (Hidden for Dentist and Owner — lives on Patient Portal / Reception POS) */}
      {activeTab === 'wallet' && !hideFinancialWallet && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-extrabold text-slate-900">
                {c('Financial Wallet', 'المحفظة المالية')}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedPatient.balanceEgp < 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold tabular-nums">
                  {c(
                    `Debit ${Math.abs(selectedPatient.balanceEgp).toLocaleString()} EGP`,
                    `مدين بـ ${Math.abs(selectedPatient.balanceEgp).toLocaleString()} ج.م`
                  )}
                </span>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                {c('Account Statement', 'كشف حساب')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const newInv = {
                    id: `INV-${Date.now()}`,
                    procedureEn: 'Composite Filling · Tooth #16',
                    procedureAr: 'حشو تجميلي · سن 16',
                    date: clinicTodayISO(),
                    amountEgp: SERVICES.filling.price,
                    paidEgp: 0,
                    status: 'UNPAID',
                  };
                  setWalletInvoices([newInv, ...walletInvoices]);
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold"
              >
                + {c('Invoice', 'فاتورة')}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {walletInvoices.map((inv) => {
              const isPaid = inv.status === 'PAID';
              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 bg-white flex flex-wrap items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900 block">
                        {isAr ? inv.procedureAr : inv.procedureEn}
                      </strong>
                      <span className="text-xs font-mono text-slate-400">
                        {inv.id} · {inv.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-end">
                      <strong className="text-base font-black text-slate-900 tabular-nums block">
                        {inv.amountEgp.toLocaleString()} {c('EGP', 'ج.م')}
                      </strong>
                      {!isPaid && (
                        <span className="text-[11px] font-bold text-amber-600 block">
                          {c(`Paid ${inv.paidEgp}`, `مدفوع ${inv.paidEgp}`)}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPaid ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span>{isPaid ? c('Paid', 'مدفوعة') : c('Unpaid', 'غير مدفوعة')}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setWalletInvoices((prev) =>
                          prev.map((item) =>
                            item.id === inv.id
                              ? { ...item, status: 'PAID', paidEgp: item.amountEgp }
                              : item
                          )
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs font-extrabold text-slate-800 transition-colors"
                    >
                      {c('Pay', 'دفع')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 1: OVERVIEW & MEDICAL HISTORY (Exact match to Image 2 desktop screen) */}
      {(activeTab === 'overview' || activeTab === 'medical') && (
        <div className="space-y-5">
          {/* 2-Column Personal & Clinical Data Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">
                {c('Personal & Demographic Data', 'البيانات الشخصية')}
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  [c('Full Name', 'الاسم الكامل'), isAr && selectedPatient.fullNameAr ? selectedPatient.fullNameAr : selectedPatient.fullName],
                  [c('Phone Number', 'رقم الهاتف'), selectedPatient.phone],
                  [c('Automatic Code', 'الكود التلقائي'), `${selectedPatient.code} (#${selectedPatient.shortCode})`],
                  [c('Age', 'العمر'), `${selectedPatient.age} ${c('years', 'سنة')}`],
                  [c('Gender', 'الجنس'), selectedPatient.gender === 'Male' ? c('Male', 'ذكر') : c('Female', 'أنثى')],
                  [c('Last Visit', 'آخر زيارة'), clinicDateISO(-47)],
                ].map(([label, val]) => (
                  <div key={label} className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">{label}</span>
                    <strong className="text-slate-900 font-extrabold">{val}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5">
                {hideFinancialWallet
                  ? c('Clinical Care Summary', 'الملخص الإكلينيكي والطبي')
                  : c('Clinical & Financial Summary', 'البيانات الطبية والمالية')}
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  [c('Treating Doctor', 'الطبيب المعالج'), selectedPatient.doctorName],
                  [c('Insurance Company', 'شركة التأمين'), selectedPatient.insurance === 'None' ? c('None', 'لا يوجد') : selectedPatient.insurance],
                  [c('Drug Allergies', 'الحساسية'), selectedPatient.allergies.join(', ')],
                  ...(!hideFinancialWallet
                    ? [[c('Current Balance', 'الرصيد'), `${selectedPatient.balanceEgp.toLocaleString()} EGP`]]
                    : [[c('Chronic Conditions', 'الأمراض المزمنة'), selectedPatient.chronicConditions.join(', ')]]),
                  [c('Family Linked', 'ربط العائلة'), selectedPatient.familyGroup || c('Individual File', 'ملف فردي')],
                ].map(([label, val]) => (
                  <div key={label} className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">{label}</span>
                    <strong className="text-slate-900 font-extrabold">{val}</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Medical History & Contraindicated Medications Card (Image 2 bottom panel) */}
          {!isReceptionist && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <span>
                    {c(
                      'Medical History & Medications (Contraindication Check)',
                      'السجل الطبي والأدوية الحالية (فحص موانع الاستعمال قبل كتابة الروشتة)'
                    )}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    {c('Chronic Illnesses', 'الأمراض المزمنة')}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedPatient.chronicConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chronicInput}
                      onChange={(e) => setChronicInput(e.target.value)}
                      placeholder={c('e.g., Diabetes, Hypertension...', 'مثال: سكري، ضغط...')}
                      className="field flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!chronicInput.trim()) return;
                        setSelectedPatient({
                          ...selectedPatient,
                          chronicConditions: [
                            ...selectedPatient.chronicConditions.filter((x) => x !== 'None'),
                            chronicInput.trim(),
                          ],
                        });
                        setChronicInput('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-700 block">
                    {c('Current Medications', 'الأدوية الحالية')}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedPatient.medications.map((med, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={medInput}
                      onChange={(e) => setMedInput(e.target.value)}
                      placeholder={c('e.g., Aspirin, Concor...', 'مثال: أسبرين...')}
                      className="field flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!medInput.trim()) return;
                        setSelectedPatient({
                          ...selectedPatient,
                          medications: [
                            ...selectedPatient.medications.filter((x) => x !== 'None'),
                            medInput.trim(),
                          ],
                        });
                        setMedInput('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-800 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1.5">
                  {c('Important Medical Notes Before Treatment', 'ملاحظات طبية مهمة قبل العلاج')}
                </label>
                <textarea
                  rows={2}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="field w-full text-xs"
                />
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB 2: EVERY VISIT WITH ITS DATE AND WHAT WAS DONE */}
      {activeTab === 'activity' && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            {c(
              'Every Visit With Its Date and What Was Done',
              'سجل جميع الزيارات بالتاريخ وما تم إجراؤه بالتفصيل'
            )}
          </h3>
          <div className="space-y-3">
            {visitHistory.length === 0 && (
              <p className="text-xs font-bold text-slate-500">
                {c(
                  'No clinical visits are recorded for this patient yet.',
                  'لا توجد زيارات إكلينيكية مسجلة لهذا المريض حتى الآن.'
                )}
              </p>
            )}
            {visitHistory.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-mono font-bold">
                      {v.date}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-extrabold">
                      Tooth {v.tooth}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{v.doctor}</span>
                  </div>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {isAr ? v.procedureAr : v.procedureEn}
                  </strong>
                  {!isReceptionist && <p className="text-xs text-slate-600">{v.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 6 & 7: ATTACHMENTS — X-RAYS AND BEFORE/AFTER PHOTOS LINKED TO TOOTH & VISIT */}
      {(activeTab === 'photos' || activeTab === 'xrays') && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {c(
                  'Attachments: X-Rays, 3D Scans & Before/After Photos (Linked to Tooth & Visit)',
                  'المرفقات: الأشعة وصور قبل وبعد مرتبطة بالسن والزيارة'
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {isReceptionist
                  ? c(
                      'Receptionist Upload-Only Mode: Attach scans directly to patient profile',
                      'وضع الاستقبال (رفع فقط): إرفاق الأشعة والصور مباشرة بملف المريض'
                    )
                  : c(
                      'Images are linked to the tooth and the visit, not scattered in a folder',
                      'الصور والأشعة مربوطة برقم السن وتاريخ الزيارة مباشرة'
                    )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isReceptionist && onOpenCbctViewer && (
                <button
                  type="button"
                  onClick={onOpenCbctViewer}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold"
                >
                  {c('Open Full CBCT & 3D Viewer', 'فتح عارض الأشعة المقطعية CBCT و 3D')}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setToothAttachments([
                    {
                      id: `att-${Date.now()}`,
                      category: 'BEFORE_AFTER',
                      tooth: '#26',
                      visitDate: new Date().toISOString().slice(0, 10),
                      titleEn: 'Zirconia Crown #26 — Before & After Cementation',
                      titleAr: 'تاج زيركون للضرس #26 — صورة قبل وبعد التركيب',
                      beforeLabel: 'Before: Core build-up preparation',
                      afterLabel: 'After: Final monolithic Zirconia crown',
                      imageUrl: '/images/hero_smile_3.jpg',
                    },
                    ...toothAttachments,
                  ]);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{c('Upload Scan / Photo to Tooth', 'رفع أشعة / صورة مرتبطة بالسن')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toothAttachments.map((att) => (
              <div
                key={att.id}
                className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-mono text-xs font-extrabold">
                    Tooth {att.tooth}
                  </span>
                  <span className="text-xs font-mono text-slate-500">Visit: {att.visitDate}</span>
                </div>
                <strong className="text-sm font-extrabold text-slate-900 block">
                  {isAr ? att.titleAr : att.titleEn}
                </strong>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black relative">
                    <img
                      src={att.imageUrl}
                      alt={att.beforeLabel}
                      className="w-full h-32 object-cover filter contrast-110"
                    />
                    <span className="absolute bottom-1.5 start-1.5 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold">
                      {att.beforeLabel}
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-emerald-400 bg-black relative">
                    <img
                      src={att.imageUrl}
                      alt={att.afterLabel}
                      className="w-full h-32 object-cover"
                    />
                    <span className="absolute bottom-1.5 start-1.5 px-2 py-0.5 rounded bg-emerald-700/90 text-white text-[10px] font-bold">
                      {att.afterLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OTHER TABS (Chart, Consents, Rx, Lab) */}
      {['chart', 'consents', 'rx', 'lab'].includes(activeTab) && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {activeTab === 'chart'
                ? c('Interactive Anatomical Dental Chart', 'المخطط السني التشريحي')
                : activeTab === 'rx'
                ? c('Electronic Prescriptions (Allergy-Checked)', 'الروشتات الطبية الإلكترونية')
                : activeTab === 'lab'
                ? c('Prosthetic Lab Orders Linked to Patient', 'طلبات المعمل المرتبطة بالمريض')
                : c('Digital Consents & Medical Questionnaires', 'الإقرارات والاستبيانات الطبية')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {c(
                'All records are synchronized with the patient file since day one.',
                'جميع السجلات مرتبطة بملف المريض منذ اليوم الأول.'
              )}
            </p>
          </div>
          {activeTab === 'chart' && onOpenExamChart && (
            <button
              type="button"
              onClick={onOpenExamChart}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold"
            >
              {c('Focus Full Exam Room Chart ↓', 'الانتقال إلى غرفة الكشف والمخطط ↓')}
            </button>
          )}
        </section>
      )}

      {/* ====================================================================
          IMAGE 2: PATIENT QR CARD MODAL (Print, Download, Copy, WhatsApp, Revoke)
         ==================================================================== */}
      {showQrPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {c('Patient QR Card', 'بطاقة QR للمريض')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrPassModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scannable High-Contrast QR Matrix matching Image 2 */}
            <div className="w-48 h-48 mx-auto rounded-2xl bg-white border-2 border-slate-200 p-3 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-950">
                <rect x="8" y="8" width="26" height="26" fill="none" stroke="#0F172A" strokeWidth="6" />
                <rect x="16" y="16" width="10" height="10" />
                <rect x="66" y="8" width="26" height="26" fill="none" stroke="#0F172A" strokeWidth="6" />
                <rect x="74" y="16" width="10" height="10" />
                <rect x="8" y="66" width="26" height="26" fill="none" stroke="#0F172A" strokeWidth="6" />
                <rect x="16" y="74" width="10" height="10" />
                <rect x="42" y="12" width="6" height="6" />
                <rect x="52" y="18" width="6" height="12" />
                <rect x="42" y="36" width="16" height="6" />
                <rect x="14" y="44" width="18" height="6" />
                <rect x="44" y="46" width="12" height="12" />
                <rect x="64" y="42" width="8" height="18" />
                <rect x="78" y="48" width="12" height="6" />
                <rect x="42" y="66" width="8" height="18" />
                <rect x="56" y="72" width="16" height="8" />
                <rect x="76" y="66" width="12" height="12" />
                <rect x="64" y="84" width="24" height="6" />
              </svg>
            </div>

            <div>
              <h4 className="text-lg font-extrabold text-slate-900">
                {isAr && selectedPatient.fullNameAr
                  ? selectedPatient.fullNameAr
                  : selectedPatient.fullName}
              </h4>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {c(`Code ${selectedPatient.shortCode}`, `كود ${selectedPatient.shortCode}`)} ·{' '}
                {qrCodeToken}
              </p>
            </div>

            {/* 4 Action Links: Print, Download, Copy Link, Send WhatsApp */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 text-slate-700"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>{c('Print', 'طباعة')}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 text-slate-700"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>{c('Download', 'تنزيل')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `${window.location.origin}/portal?qr=${qrCodeToken}`
                  );
                  setQrCopied(true);
                  setTimeout(() => setQrCopied(false), 2000);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 text-slate-700"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{qrCopied ? c('Copied!', 'تم النسخ') : c('Copy Link', 'نسخ الرابط')}</span>
              </button>
              <a
                href={`https://wa.me/2${selectedPatient.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(
                  `Your Ebtisama Clinic Digital Patient QR Pass: ${qrCodeToken}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-emerald-50 text-emerald-700"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>{c('Send', 'إرسال')}</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {c(
                'Anyone scanning this code opens the patient portal pass immediately — treat it like a key.',
                'من يمسح هذا الكود يفتح ملف المريض فوراً بلا كلمة مرور — تعامل معه كمفتاح.'
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                setQrCodeToken(`EBT-QR-${Math.floor(1000 + Math.random() * 9000)}-NEW`)
              }
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {c('Revoke Card & Issue New Code', 'إبطال البطاقة وإصدار كود جديد')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
