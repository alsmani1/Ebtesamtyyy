/**
 * Deterministic 12-month clinic ledger. Invoices are priced from the shared
 * service catalogue, payments are individual rows, and every KPI / chart /
 * table value in the app is an aggregation over these rows.
 */

import {
  clinicDateISO,
  clinicMonthEndISO,
  clinicMonthKey,
  clinicMonthStartISO,
  clinicThisMonthISO,
  clinicTodayISO,
} from './clinic-clock';
import { expensesForMonth, PAYROLL_STAFF, SEED_EXPENSES, FinanceBranch } from './clinic-costs';
import {
  roundEgp,
  serviceMaterialCost,
  SERVICE_KEYS,
  SERVICES,
  ServiceKey,
} from './clinic-pricing';

export type PaymentMethod = 'cash' | 'instapay' | 'visa';
export type InvoiceStatus = 'paid' | 'partial' | 'unpaid';

export interface LedgerLine {
  serviceKey: ServiceKey;
  nameEn: string;
  nameAr: string;
  price: number;
  qty: number;
}

export interface LedgerInstallment {
  id: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'due' | 'overdue';
}

export interface LedgerInvoice {
  id: string;
  patientId: string;
  patientNameEn: string;
  patientNameAr: string;
  initialsEn: string;
  initialsAr: string;
  avatarBg: string;
  branch: FinanceBranch;
  doctorId: string;
  doctorEn: string;
  doctorAr: string;
  doctorColor: string;
  date: string;
  discountPercent: number;
  insuranceCoverPercent: number;
  lines: LedgerLine[];
  total: number;
  paid: number;
  status: InvoiceStatus;
  method: PaymentMethod | 'none';
  installments?: LedgerInstallment[];
}

export interface LedgerPayment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: PaymentMethod;
}

export interface UiInvoiceRecord {
  id: string;
  patientId?: string;
  patientNameAr: string;
  patientNameEn: string;
  initialsAr: string;
  initialsEn: string;
  avatarBg: string;
  branch: FinanceBranch;
  treatmentAr: string;
  treatmentEn: string;
  doctorAr: string;
  doctorEn: string;
  doctorColor: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethodAr: string;
  paymentMethodEn: string;
  methodType: PaymentMethod | 'none';
  status: InvoiceStatus;
  installments?: LedgerInstallment[];
  discountPercent?: number;
}

const TODAY = clinicTodayISO();

const DOCTORS: Record<
  string,
  {
    id: string;
    en: string;
    ar: string;
    branch: FinanceBranch;
    color: string;
    sharePercent: number;
  }
> = {
  'doc-sandy': { id: 'doc-sandy', en: 'Dr. Sandy Saad', ar: 'د. ساندي سعد', branch: 'BR-A', color: 'text-emerald-600', sharePercent: 35 },
  'doc-feby': { id: 'doc-feby', en: 'Dr. Feby Samer', ar: 'د. فيبي سامر', branch: 'BR-A', color: 'text-emerald-600', sharePercent: 35 },
  'doc-ahmed': { id: 'doc-ahmed', en: 'Dr. Ahmed Hassan', ar: 'د. أحمد حسن', branch: 'BR-B', color: 'text-blue-600', sharePercent: 35 },
  'doc-youssef': { id: 'doc-youssef', en: 'Dr. Youssef El-Mansy', ar: 'د. يوسف المنسي', branch: 'BR-B', color: 'text-blue-600', sharePercent: 35 },
  'doc-nadia': { id: 'doc-nadia', en: 'Dr. Nadia El-Hariry', ar: 'د. نادية الحريري', branch: 'BR-C', color: 'text-rose-600', sharePercent: 35 },
};

interface PatientSeed {
  id: string;
  en: string;
  ar: string;
  initialsEn: string;
  initialsAr: string;
  branch: FinanceBranch;
  doctorId: string;
}

const PATIENTS: PatientSeed[] = [
  { id: 'EBT-PAT-0001', en: 'Passant', ar: 'بسنت', initialsEn: 'PA', initialsAr: 'بس', branch: 'BR-A', doctorId: 'doc-sandy' },
  { id: 'P-1042', en: 'Mohamed Ahmed Ali', ar: 'محمد أحمد علي', initialsEn: 'MA', initialsAr: 'مح', branch: 'BR-B', doctorId: 'doc-ahmed' },
  { id: 'P-1057', en: 'Ibrahim Yassin Shaheen', ar: 'إبراهيم ياسين شاهين', initialsEn: 'IY', initialsAr: 'إي', branch: 'BR-A', doctorId: 'doc-feby' },
  { id: 'P-0877', en: 'Moustafa Samy', ar: 'مصطفى سامي', initialsEn: 'MS', initialsAr: 'مص', branch: 'BR-B', doctorId: 'doc-youssef' },
  { id: 'P-0310', en: 'Ahmed Mohamed', ar: 'أحمد محمد', initialsEn: 'AM', initialsAr: 'أم', branch: 'BR-A', doctorId: 'doc-feby' },
  { id: 'P-1051', en: 'Mai Saeed Abdelrahman', ar: 'مي سعيد عبد الرحمن', initialsEn: 'MS', initialsAr: 'مس', branch: 'BR-C', doctorId: 'doc-nadia' },
  { id: 'P-1064', en: 'Rana Marwan Abdelaziz', ar: 'رنا مروان عبد العزيز', initialsEn: 'RA', initialsAr: 'رن', branch: 'BR-A', doctorId: 'doc-sandy' },
  { id: 'P-2001', en: 'Mona Tarek Hassan', ar: 'منى طارق حسن', initialsEn: 'MT', initialsAr: 'مط', branch: 'BR-A', doctorId: 'doc-sandy' },
  { id: 'P-2002', en: 'Amr Mostafa El-Naggar', ar: 'عمرو مصطفى النجار', initialsEn: 'AN', initialsAr: 'عم', branch: 'BR-A', doctorId: 'doc-feby' },
  { id: 'P-2003', en: 'Omar Omar Hassan', ar: 'عمر عمر حسن', initialsEn: 'OH', initialsAr: 'عح', branch: 'BR-A', doctorId: 'doc-feby' },
  { id: 'P-2004', en: 'Youssef Hesham Hamdy', ar: 'يوسف هشام حمدي', initialsEn: 'YH', initialsAr: 'يه', branch: 'BR-B', doctorId: 'doc-youssef' },
  { id: 'P-2005', en: 'Mariam Hossam Morsy', ar: 'مريم حسام مرسي', initialsEn: 'MM', initialsAr: 'مم', branch: 'BR-C', doctorId: 'doc-nadia' },
  { id: 'P-2006', en: 'Mariam Mahmoud Adel', ar: 'مريم محمود عادل', initialsEn: 'MA', initialsAr: 'مأ', branch: 'BR-C', doctorId: 'doc-nadia' },
  { id: 'P-2007', en: 'Dina Sameh Fawzy', ar: 'دينا سامح فوزي', initialsEn: 'DF', initialsAr: 'دف', branch: 'BR-C', doctorId: 'doc-nadia' },
  { id: 'P-2008', en: 'Jana Sherif Abdullah', ar: 'جنى شريف عبد الله', initialsEn: 'JA', initialsAr: 'جش', branch: 'BR-B', doctorId: 'doc-youssef' },
  { id: 'P-2009', en: 'Hossam Waleed Fathy', ar: 'حسام وليد فتحي', initialsEn: 'HF', initialsAr: 'حف', branch: 'BR-B', doctorId: 'doc-ahmed' },
  { id: 'P-2010', en: 'Ahmed Saeed', ar: 'أحمد سعيد', initialsEn: 'AS', initialsAr: 'أس', branch: 'BR-A', doctorId: 'doc-sandy' },
  { id: 'P-2011', en: 'Nour Shaheen', ar: 'نور شاهين', initialsEn: 'NS', initialsAr: 'نش', branch: 'BR-B', doctorId: 'doc-ahmed' },
  { id: 'P-2012', en: 'Salma Adel', ar: 'سلمى عادل', initialsEn: 'SA', initialsAr: 'سل', branch: 'BR-A', doctorId: 'doc-feby' },
  { id: 'P-2013', en: 'Khaled Mostafa', ar: 'خالد مصطفى', initialsEn: 'KM', initialsAr: 'خم', branch: 'BR-C', doctorId: 'doc-nadia' },
  { id: 'P-2014', en: 'Heba Tarek', ar: 'هبة طارق', initialsEn: 'HT', initialsAr: 'هط', branch: 'BR-B', doctorId: 'doc-youssef' },
  { id: 'P-2015', en: 'Tamer Fathy', ar: 'تامر فتحي', initialsEn: 'TF', initialsAr: 'تف', branch: 'BR-A', doctorId: 'doc-sandy' },
];

const AVATAR_COLORS = ['bg-teal-600', 'bg-blue-700', 'bg-emerald-600', 'bg-amber-700', 'bg-pink-600', 'bg-violet-600', 'bg-sky-600', 'bg-rose-600'];

const SERVICE_WEIGHTS: [ServiceKey, number][] = [
  ['consult', 25],
  ['filling', 20],
  ['scaling', 15],
  ['extraction', 8],
  ['rct', 12],
  ['whitening', 6],
  ['crown', 6],
  ['veneer', 2],
  ['implant', 2],
  ['braces', 1],
  ['pediatric', 3],
];

const METHOD_WEIGHTS: [PaymentMethod, number][] = [
  ['cash', 52],
  ['instapay', 28],
  ['visa', 20],
];

const METHOD_LABELS: Record<PaymentMethod, { en: string; ar: string }> = {
  cash: { en: 'Cash', ar: 'نقدي' },
  instapay: { en: 'InstaPay', ar: 'إنستاباي' },
  visa: { en: 'Visa', ar: 'فيزا' },
};

const INVOICES_PER_MONTH = 63;
const MONTH_SPAN = 12;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted<T>(rand: () => number, entries: [T, number][]): T {
  const total = entries.reduce((sum, entry) => sum + entry[1], 0);
  let roll = rand() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1]?.[0] as T;
}

function laterDate(iso: string, days: number): string {
  const next = new Date(`${iso}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  const candidate = next.toISOString().slice(0, 10);
  return candidate > TODAY ? TODAY : candidate;
}

function invoiceTotal(lines: LedgerLine[], discountPercent: number): number {
  const gross = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  return roundEgp(gross * (1 - discountPercent / 100));
}

function statusFor(total: number, paid: number): InvoiceStatus {
  if (paid >= total) return 'paid';
  if (paid > 0) return 'partial';
  return 'unpaid';
}

function buildInvoice(
  patient: PatientSeed,
  id: string,
  date: string,
  services: ServiceKey[],
  discountPercent: number,
  insuranceCoverPercent: number,
  paidRatio: number,
  method: PaymentMethod | 'none',
  rand: () => number
): { invoice: LedgerInvoice; payments: LedgerPayment[] } {
  const doctor = DOCTORS[patient.doctorId] ?? DOCTORS['doc-sandy']!;
  const lines: LedgerLine[] = services.map((key) => {
    const def = SERVICES[key];
    return { serviceKey: key, nameEn: def.nameEn, nameAr: def.nameAr, price: def.price, qty: 1 };
  });
  const total = invoiceTotal(lines, discountPercent);
  const paid = paidRatio <= 0 ? 0 : Math.min(total, roundEgp(total * paidRatio));
  const payments: LedgerPayment[] = [];
  if (paid > 0) {
    const delay = rand() < 0.68 ? Math.floor(rand() * 4) : rand() < 0.9 ? 4 + Math.floor(rand() * 17) : 30 + Math.floor(rand() * 31);
    payments.push({
      id: `PAY-${id}`,
      invoiceId: id,
      date: laterDate(date, delay),
      amount: paid,
      method: method === 'none' ? 'cash' : method,
    });
  }
  return {
    invoice: {
      id,
      patientId: patient.id,
      patientNameEn: patient.en,
      patientNameAr: patient.ar,
      initialsEn: patient.initialsEn,
      initialsAr: patient.initialsAr,
      avatarBg: AVATAR_COLORS[hashString(patient.id) % AVATAR_COLORS.length] ?? 'bg-teal-600',
      branch: patient.branch,
      doctorId: doctor.id,
      doctorEn: doctor.en,
      doctorAr: doctor.ar,
      doctorColor: doctor.color,
      date,
      discountPercent,
      insuranceCoverPercent,
      lines,
      total,
      paid,
      status: statusFor(total, paid),
      method: paid > 0 ? method : 'none',
    },
    payments,
  };
}

function canonicalInvoices(): { invoices: LedgerInvoice[]; payments: LedgerPayment[] } {
  const list: LedgerInvoice[] = [];
  const payments: LedgerPayment[] = [];

  const installmentSchedule = (invoiceId: string, total: number, paid: number): LedgerInstallment[] => {
    const shortId = invoiceId.replace('INV-', '');
    const firstAmount = paid > 0 ? paid : roundEgp(total / 2);
    return [
      {
        id: `INST-${shortId}-1`,
        dueDate: clinicDateISO(-5),
        amount: firstAmount,
        status: paid > 0 ? 'paid' : 'overdue',
      },
      {
        id: `INST-${shortId}-2`,
        dueDate: clinicDateISO(7),
        amount: total - firstAmount,
        status: 'due',
      },
    ];
  };

  const add = (
    patientId: string,
    id: string,
    date: string,
    services: ServiceKey[],
    paid: number,
    method: PaymentMethod,
    installmentPlan = false,
    insuranceCoverPercent = 0
  ) => {
    const patient = PATIENTS.find((item) => item.id === patientId) ?? PATIENTS[0]!;
    const doctor = DOCTORS[patient.doctorId] ?? DOCTORS['doc-sandy']!;
    const lines: LedgerLine[] = services.map((key) => {
      const def = SERVICES[key];
      return { serviceKey: key, nameEn: def.nameEn, nameAr: def.nameAr, price: def.price, qty: 1 };
    });
    const total = invoiceTotal(lines, 0);
    const installments = installmentPlan ? installmentSchedule(id, total, paid) : undefined;
    list.push({
      id,
      patientId: patient.id,
      patientNameEn: patient.en,
      patientNameAr: patient.ar,
      initialsEn: patient.initialsEn,
      initialsAr: patient.initialsAr,
      avatarBg: AVATAR_COLORS[hashString(patient.id) % AVATAR_COLORS.length] ?? 'bg-teal-600',
      branch: patient.branch,
      doctorId: doctor.id,
      doctorEn: doctor.en,
      doctorAr: doctor.ar,
      doctorColor: doctor.color,
      date,
      discountPercent: 0,
      insuranceCoverPercent,
      lines,
      total,
      paid,
      status: statusFor(total, paid),
      method,
      installments,
    });
    if (paid > 0) {
      payments.push({ id: `PAY-${id}`, invoiceId: id, date, amount: paid, method });
    }
  };

  add('EBT-PAT-0001', 'INV-680', clinicThisMonthISO(9), ['filling'], 300, 'instapay', true);
  add('EBT-PAT-0001', 'INV-964', clinicThisMonthISO(9), ['crown'], 0, 'none', true);
  add('P-1042', 'INV-312', clinicThisMonthISO(10), ['implant'], 15000, 'visa');
  add('P-1057', 'INV-441', clinicThisMonthISO(11), ['rct'], 1800, 'instapay');
  add('P-1051', 'INV-720', clinicThisMonthISO(11), ['whitening'], 1000, 'cash');
  add('P-2002', 'INV-107', clinicThisMonthISO(9), ['consult'], 250, 'cash');
  add('P-2003', 'INV-562', clinicThisMonthISO(9), ['pediatric'], 350, 'instapay');
  add('P-1064', 'INV-311', TODAY, ['crown'], 3000, 'instapay', false, 40);

  return { invoices: list, payments };
}

function generateMonth(offset: number): { invoices: LedgerInvoice[]; payments: LedgerPayment[] } {
  const key = clinicMonthKey(offset);
  const rand = mulberry32(hashString(`ebtesamty-finance-${key}`));
  const invoices: LedgerInvoice[] = [];
  const payments: LedgerPayment[] = [];
  const firstRegenerated = offset === 0 ? 63 - 8 : 0;
  const count = firstRegenerated > 0 ? INVOICES_PER_MONTH - 8 : INVOICES_PER_MONTH;

  for (let index = 0; index < count; index += 1) {
    const patient = PATIENTS[Math.floor(rand() * PATIENTS.length)] ?? PATIENTS[0]!;
    const primary = pickWeighted(rand, SERVICE_WEIGHTS);
    const services: ServiceKey[] = [primary];
    if (primary === 'rct' && rand() < 0.3) services.push('post');
    if (primary !== 'implant' && primary !== 'braces' && rand() < 0.12) services.push(pickWeighted(rand, SERVICE_WEIGHTS));
    if (primary === 'veneer') services[0] = 'veneer';

    const maxDay = offset === 0 ? Math.max(1, Number(TODAY.slice(8, 10))) : 28;
    const day = 1 + Math.floor(rand() * maxDay);
    const date = `${key}-${pad2(day)}`;
    const discount = rand() < 0.06 ? 10 : rand() < 0.02 ? 15 : 0;
    const insuranceCover = rand() < 0.12 ? 40 : 0;

    const ageMonths = -offset;
    const roll = rand();
    let paidRatio = 0;
    if (ageMonths >= 6) paidRatio = roll < 0.88 ? 1 : roll < 0.96 ? 0.6 : 0;
    else if (ageMonths >= 2) paidRatio = roll < 0.78 ? 1 : roll < 0.91 ? 0.5 : 0;
    else if (ageMonths === 1) paidRatio = roll < 0.65 ? 1 : roll < 0.85 ? 0.5 : 0;
    else paidRatio = roll < 0.48 ? 1 : roll < 0.76 ? 0.5 : 0;

    const method = pickWeighted(rand, METHOD_WEIGHTS);
    const id = `INV-${key.slice(2, 4)}${key.slice(5, 7)}-${pad2(index + 1)}`;
    const built = buildInvoice(patient, id, date, services, discount, insuranceCover, paidRatio, method, rand);
    invoices.push(built.invoice);
    payments.push(...built.payments);
  }

  return { invoices, payments };
}

const canonical = canonicalInvoices();
const ALL_INVOICES: LedgerInvoice[] = [...canonical.invoices];
const ALL_PAYMENTS: LedgerPayment[] = [...canonical.payments];

for (let offset = -(MONTH_SPAN - 1); offset <= 0; offset += 1) {
  const month = generateMonth(offset);
  ALL_INVOICES.push(...month.invoices);
  ALL_PAYMENTS.push(...month.payments);
}

export const FINANCE_INVOICES = ALL_INVOICES;
export const FINANCE_PAYMENTS = ALL_PAYMENTS;

const invoiceById = new Map(ALL_INVOICES.map((invoice) => [invoice.id, invoice]));
const CURRENT_MONTH = clinicMonthKey();

function monthOf(date: string): string {
  return date.slice(0, 7);
}

function inBranch(branch: FinanceBranch | 'ALL', value: FinanceBranch): boolean {
  return branch === 'ALL' || branch === value;
}

function invoiceOf(payment: LedgerPayment): LedgerInvoice | undefined {
  return invoiceById.get(payment.invoiceId);
}

export function invoiceBalance(invoice: LedgerInvoice): number {
  return Math.max(0, invoice.total - invoice.paid);
}

export function invoiceInsuranceReceivable(invoice: LedgerInvoice): number {
  if (!invoice.insuranceCoverPercent) return 0;
  return roundEgp((invoiceBalance(invoice) * invoice.insuranceCoverPercent) / 100);
}

export interface FinanceKpis {
  todayCollected: number;
  yesterdayCollected: number;
  todayChangePercent: number;
  todayInvoices: number;
  monthCollected: number;
  monthInvoiced: number;
  monthInvoiceCount: number;
  monthAverageInvoice: number;
  collectionRatePercent: number;
  arrears: number;
  debtorsCount: number;
  insuranceReceivables: number;
  aging: { current: number; d30: number; d60: number; d90plus: number };
  methodMix: { cash: number; instapay: number; visa: number };
  costs: number;
  materialsPurchased: number;
  labFees: number;
  payroll: number;
  netProfit: number;
  marginPercent: number;
  lifetimeInvoices: number;
  activePatients: number;
}

export function financeKpis(branch: FinanceBranch | 'ALL' = 'ALL', asOf = TODAY): FinanceKpis {
  const today = asOf;
  const yesterday = new Date(`${asOf}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayIso = yesterday.toISOString().slice(0, 10);
  const month = monthOf(today);

  let todayCollected = 0;
  let yesterdayCollected = 0;
  let monthCollected = 0;
  let monthInvoiced = 0;
  let monthInvoiceCount = 0;
  let todayInvoices = 0;
  let arrears = 0;
  let insuranceReceivables = 0;
  const methodMix = { cash: 0, instapay: 0, visa: 0 };
  const aging = { current: 0, d30: 0, d60: 0, d90plus: 0 };
  const debtors = new Set<string>();
  const active = new Set<string>();

  for (const invoice of ALL_INVOICES) {
    if (!inBranch(branch, invoice.branch)) continue;
    const balance = invoiceBalance(invoice);
    if (balance > 0) {
      arrears += balance;
      insuranceReceivables += invoiceInsuranceReceivable(invoice);
      debtors.add(invoice.patientId);
      const ageDays = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${invoice.date}T00:00:00Z`)) / 86400000);
      if (ageDays <= 30) aging.current += balance;
      else if (ageDays <= 60) aging.d30 += balance;
      else if (ageDays <= 90) aging.d60 += balance;
      else aging.d90plus += balance;
    }
    if (monthOf(invoice.date) === month) {
      monthInvoiced += invoice.total;
      monthInvoiceCount += 1;
    }
    if (invoice.date === today) todayInvoices += 1;
    if (monthOf(invoice.date) >= clinicMonthKey(-3)) {
      active.add(invoice.patientId);
    }
  }

  for (const payment of ALL_PAYMENTS) {
    const invoice = invoiceOf(payment);
    if (!invoice || !inBranch(branch, invoice.branch)) continue;
    if (payment.date === today) todayCollected += payment.amount;
    if (payment.date === yesterdayIso) yesterdayCollected += payment.amount;
    if (monthOf(payment.date) === month) {
      monthCollected += payment.amount;
      methodMix[payment.method] += payment.amount;
    }
  }

  const expenses = expensesForMonth(month).filter((entry) => inBranch(branch, entry.branchCode));
  const costs = expenses.reduce((sum, entry) => sum + entry.amountEgp, 0);
  const payroll = expenses
    .filter((entry) => entry.category === 'Staff Salaries')
    .reduce((sum, entry) => sum + entry.amountEgp, 0);
  const materialsPurchased = expenses
    .filter((entry) => entry.category === 'Dental Materials & Supplies')
    .reduce((sum, entry) => sum + entry.amountEgp, 0);
  const labFees = expenses
    .filter((entry) => entry.category === 'Lab Vendor Fees')
    .reduce((sum, entry) => sum + entry.amountEgp, 0);
  const netProfit = monthCollected - costs;

  return {
    todayCollected,
    yesterdayCollected,
    todayChangePercent:
      yesterdayCollected > 0
        ? Math.round(((todayCollected - yesterdayCollected) / yesterdayCollected) * 1000) / 10
        : 0,
    todayInvoices,
    monthCollected,
    monthInvoiced,
    monthInvoiceCount,
    monthAverageInvoice: monthInvoiceCount ? roundEgp(monthInvoiced / monthInvoiceCount) : 0,
    collectionRatePercent: monthInvoiced ? Math.round((monthCollected / monthInvoiced) * 100) : 0,
    arrears,
    debtorsCount: debtors.size,
    insuranceReceivables,
    aging,
    methodMix,
    costs,
    materialsPurchased,
    labFees,
    payroll,
    netProfit,
    marginPercent: monthCollected ? Math.round((netProfit / monthCollected) * 100) : 0,
    lifetimeInvoices: ALL_INVOICES.filter((invoice) => inBranch(branch, invoice.branch)).length,
    activePatients: active.size,
  };
}

export interface MonthPerformance {
  monthKey: string;
  invoiced: number;
  collected: number;
  costs: number;
  profit: number;
  invoiceCount: number;
}

export function monthPerformance(monthOffset: number, branch: FinanceBranch | 'ALL' = 'ALL'): MonthPerformance {
  const key = clinicMonthKey(monthOffset);
  let invoiced = 0;
  let collected = 0;
  let invoiceCount = 0;
  for (const invoice of ALL_INVOICES) {
    if (!inBranch(branch, invoice.branch) || monthOf(invoice.date) !== key) continue;
    invoiced += invoice.total;
    invoiceCount += 1;
  }
  for (const payment of ALL_PAYMENTS) {
    const invoice = invoiceOf(payment);
    if (!invoice || !inBranch(branch, invoice.branch) || monthOf(payment.date) !== key) continue;
    collected += payment.amount;
  }
  const costs = expensesForMonth(key)
    .filter((entry) => inBranch(branch, entry.branchCode))
    .reduce((sum, entry) => sum + entry.amountEgp, 0);
  return { monthKey: key, invoiced, collected, costs, profit: collected - costs, invoiceCount };
}

export function monthlyPerformance(count = 6, branch: FinanceBranch | 'ALL' = 'ALL'): MonthPerformance[] {
  const rows: MonthPerformance[] = [];
  for (let offset = -(count - 1); offset <= 0; offset += 1) {
    rows.push(monthPerformance(offset, branch));
  }
  return rows;
}

export interface ProjectionMetric {
  point: number;
  low: number;
  high: number;
}

export interface MonthPerformanceProjection {
  targetMonth: string;
  method: 'mean_of_last_3_complete_months';
  historyWindow: { from: string; to: string };
  currentMonthExcluded: true;
  dataBasis: 'deterministic_clinic_ledger';
  assumptions: string[];
  metrics: {
    invoiced: ProjectionMetric;
    collected: ProjectionMetric;
    costs: ProjectionMetric;
    profit: ProjectionMetric;
  };
  sameMonthLastYear?: MonthPerformance;
}

export function projectNextMonthPerformance(
  branch: FinanceBranch | 'ALL' = 'ALL'
): MonthPerformanceProjection | null {
  const currentMonth = clinicMonthKey();
  const history = monthlyPerformance(12, branch);
  const complete = history.filter((row) => row.monthKey < currentMonth);
  if (complete.length < 3) return null;

  const recent = complete.slice(-3);
  const range = complete.slice(-6);
  const metric = (key: 'invoiced' | 'collected' | 'costs' | 'profit'): ProjectionMetric => {
    const values = range.map((row) => row[key]);
    return {
      point: Math.round(recent.reduce((sum, row) => sum + row[key], 0) / recent.length),
      low: Math.min(...values),
      high: Math.max(...values),
    };
  };
  const sameMonthLastYear = history.find((row) => row.monthKey === clinicMonthKey(-11));

  return {
    targetMonth: clinicMonthKey(1),
    method: 'mean_of_last_3_complete_months',
    historyWindow: { from: complete[0].monthKey, to: complete[complete.length - 1].monthKey },
    currentMonthExcluded: true,
    dataBasis: 'deterministic_clinic_ledger',
    assumptions: [
      'Service mix, pricing, staffing, and clinic capacity remain stable.',
      'The current partial month is excluded from the forecast baseline.',
      'Live UI payment and expense adjustments may not be included in the deterministic ledger baseline.',
    ],
    metrics: {
      invoiced: metric('invoiced'),
      collected: metric('collected'),
      costs: metric('costs'),
      profit: metric('profit'),
    },
    ...(sameMonthLastYear ? { sameMonthLastYear } : {}),
  };
}

export interface ServiceProfitRow {
  serviceKey: ServiceKey;
  nameEn: string;
  nameAr: string;
  count: number;
  revenue: number;
  materialsCost: number;
  labCost: number;
  doctorPay: number;
  netProfit: number;
  marginPercent: number;
}

export function serviceProfitRows(
  monthOffset = 0,
  branch: FinanceBranch | 'ALL' = 'ALL'
): ServiceProfitRow[] {
  const key = clinicMonthKey(monthOffset);
  const buckets = new Map<ServiceKey, ServiceProfitRow>();

  for (const invoice of ALL_INVOICES) {
    if (!inBranch(branch, invoice.branch) || monthOf(invoice.date) !== key) continue;
    const factor = 1 - invoice.discountPercent / 100;
    for (const line of invoice.lines) {
      const existing = buckets.get(line.serviceKey) ?? {
        serviceKey: line.serviceKey,
        nameEn: line.nameEn,
        nameAr: line.nameAr,
        count: 0,
        revenue: 0,
        materialsCost: 0,
        labCost: 0,
        doctorPay: 0,
        netProfit: 0,
        marginPercent: 0,
      };
      const def = SERVICES[line.serviceKey];
      const revenue = roundEgp(line.price * line.qty * factor);
      const materials = roundEgp(serviceMaterialCost(line.serviceKey) * line.qty);
      const lab = roundEgp(def.labCost * line.qty);
      existing.count += line.qty;
      existing.revenue += revenue;
      existing.materialsCost += materials;
      existing.labCost += lab;
      existing.doctorPay += roundEgp(((revenue - materials - lab) * def.doctorSharePercent) / 100);
      buckets.set(line.serviceKey, existing);
    }
  }

  return Array.from(buckets.values())
    .map((row) => {
      const netProfit = row.revenue - row.materialsCost - row.labCost - row.doctorPay;
      return {
        ...row,
        netProfit,
        marginPercent: row.revenue ? Math.round((netProfit / row.revenue) * 100) : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

export interface DoctorPerformanceRow {
  doctorId: string;
  nameEn: string;
  nameAr: string;
  color: string;
  branch: FinanceBranch;
  cases: number;
  invoiced: number;
  collected: number;
  payout: number;
  collectionRatePercent: number;
}

export function doctorPerformance(
  monthOffset = 0,
  branch: FinanceBranch | 'ALL' = 'ALL'
): DoctorPerformanceRow[] {
  const key = clinicMonthKey(monthOffset);
  const map = new Map<string, DoctorPerformanceRow>();

  for (const invoice of ALL_INVOICES) {
    if (!inBranch(branch, invoice.branch) || monthOf(invoice.date) !== key) continue;
    const doctor = DOCTORS[invoice.doctorId];
    if (!doctor) continue;
    const row = map.get(doctor.id) ?? {
      doctorId: doctor.id,
      nameEn: doctor.en,
      nameAr: doctor.ar,
      color: doctor.color,
      branch: doctor.branch,
      cases: 0,
      invoiced: 0,
      collected: 0,
      payout: 0,
      collectionRatePercent: 0,
    };
    row.cases += 1;
    row.invoiced += invoice.total;
    row.collected += invoice.paid;
    const factor = 1 - invoice.discountPercent / 100;
    row.payout += invoice.lines.reduce((sum, line) => {
      const def = SERVICES[line.serviceKey];
      const revenue = line.price * line.qty * factor;
      const materials = serviceMaterialCost(line.serviceKey) * line.qty;
      const lab = def.labCost * line.qty;
      return sum + roundEgp(((revenue - materials - lab) * def.doctorSharePercent) / 100);
    }, 0);
    map.set(doctor.id, row);
  }

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      collectionRatePercent: row.invoiced ? Math.round((row.collected / row.invoiced) * 100) : 0,
    }))
    .sort((a, b) => b.invoiced - a.invoiced);
}

export interface PaymentActivityRow {
  id: string;
  invoiceId: string;
  branch: FinanceBranch;
  date: string;
  doctorEn: string;
  doctorAr: string;
  patientEn: string;
  patientAr: string;
  treatmentEn: string;
  treatmentAr: string;
  amount: number;
  remainingBalance: number;
  doctorShare: number;
  clinicShare: number;
}

export function paymentActivityRows(
  monthOffset = 0,
  limit = 12,
  branch: FinanceBranch | 'ALL' = 'ALL'
): PaymentActivityRow[] {
  const key = clinicMonthKey(monthOffset);
  const rows: PaymentActivityRow[] = [];
  for (const payment of ALL_PAYMENTS) {
    if (monthOf(payment.date) !== key) continue;
    const invoice = invoiceOf(payment);
    if (!invoice || !inBranch(branch, invoice.branch)) continue;
    const factor = 1 - invoice.discountPercent / 100;
    const doctorShare = invoice.lines.reduce((sum, line) => {
      const def = SERVICES[line.serviceKey];
      const revenue = line.price * line.qty * factor;
      const materials = serviceMaterialCost(line.serviceKey) * line.qty;
      const lab = def.labCost * line.qty;
      return sum + roundEgp(((revenue - materials - lab) * def.doctorSharePercent) / 100);
    }, 0);
    rows.push({
      id: payment.id,
      invoiceId: invoice.id,
      branch: invoice.branch,
      date: payment.date,
      doctorEn: invoice.doctorEn,
      doctorAr: invoice.doctorAr,
      patientEn: invoice.patientNameEn,
      patientAr: invoice.patientNameAr,
      treatmentEn: invoice.lines.map((line) => line.nameEn).join(' + '),
      treatmentAr: invoice.lines.map((line) => line.nameAr).join(' + '),
      amount: payment.amount,
      remainingBalance: invoiceBalance(invoice),
      doctorShare,
      clinicShare: payment.amount - doctorShare,
    });
  }
  return rows
    .sort((a, b) => b.date.localeCompare(a.date) || a.invoiceId.localeCompare(b.invoiceId))
    .slice(0, limit);
}

export function paymentsBetween(
  fromISO: string,
  toISO: string,
  branch: FinanceBranch | 'ALL' = 'ALL'
): LedgerPayment[] {
  return ALL_PAYMENTS.filter((payment) => {
    if (payment.date < fromISO || payment.date > toISO) return false;
    const invoice = invoiceOf(payment);
    return Boolean(invoice && inBranch(branch, invoice.branch));
  });
}

export interface PatientMixStats {
  activePatients: number;
  returningPatients: number;
  newPatients: number;
}

/** Unique patients invoiced this month, split into returning and first-time. */
export function branchPatientStats(branch: FinanceBranch | 'ALL' = 'ALL'): PatientMixStats {
  const month = CURRENT_MONTH;
  const earliestInvoice = new Map<string, string>();
  const monthlyPatients = new Set<string>();

  for (const invoice of ALL_INVOICES) {
    if (!inBranch(branch, invoice.branch)) continue;
    const earliest = earliestInvoice.get(invoice.patientId);
    if (!earliest || invoice.date < earliest) {
      earliestInvoice.set(invoice.patientId, invoice.date);
    }
    if (monthOf(invoice.date) === month) {
      monthlyPatients.add(invoice.patientId);
    }
  }

  const monthStart = `${month}-01`;
  let returningPatients = 0;
  monthlyPatients.forEach((patientId) => {
    const earliest = earliestInvoice.get(patientId);
    if (earliest && earliest < monthStart) returningPatients += 1;
  });

  return {
    activePatients: monthlyPatients.size,
    returningPatients,
    newPatients: monthlyPatients.size - returningPatients,
  };
}

export interface DebtorRow {
  patientId: string;
  nameEn: string;
  nameAr: string;
  balance: number;
  oldestDays: number;
  invoicesCount: number;
}

export function debtorRows(limit = 6): DebtorRow[] {
  const map = new Map<string, DebtorRow>();
  for (const invoice of ALL_INVOICES) {
    const balance = invoiceBalance(invoice);
    if (balance <= 0) continue;
    const ageDays = Math.floor((Date.parse(`${TODAY}T00:00:00Z`) - Date.parse(`${invoice.date}T00:00:00Z`)) / 86400000);
    const row = map.get(invoice.patientId) ?? {
      patientId: invoice.patientId,
      nameEn: invoice.patientNameEn,
      nameAr: invoice.patientNameAr,
      balance: 0,
      oldestDays: 0,
      invoicesCount: 0,
    };
    row.balance += balance;
    row.oldestDays = Math.max(row.oldestDays, ageDays);
    row.invoicesCount += 1;
    map.set(invoice.patientId, row);
  }
  return Array.from(map.values())
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}

export interface PatientFinance {
  invoices: LedgerInvoice[];
  totalInvoiced: number;
  totalPaid: number;
  totalDue: number;
  settledPct: number;
}

export function patientFinance(patientQuery: string): PatientFinance {
  const query = patientQuery.trim().toLowerCase();
  const invoices = ALL_INVOICES.filter(
    (invoice) =>
      invoice.patientId.toLowerCase() === query ||
      invoice.patientNameEn.toLowerCase().includes(query) ||
      invoice.patientNameAr.includes(patientQuery.trim())
  );
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  return {
    invoices,
    totalInvoiced,
    totalPaid,
    totalDue: Math.max(0, totalInvoiced - totalPaid),
    settledPct: totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 100,
  };
}

function toUiInvoice(invoice: LedgerInvoice): UiInvoiceRecord {
  const treatmentsEn = invoice.lines.map((line) => line.nameEn).join(' + ');
  const treatmentsAr = invoice.lines.map((line) => line.nameAr).join(' + ');
  const method = invoice.method === 'none' ? 'none' : invoice.method;
  const labels = method === 'none' ? { en: '—', ar: '—' } : METHOD_LABELS[method];
  return {
    id: invoice.id,
    patientId: invoice.patientId,
    patientNameAr: invoice.patientNameAr,
    patientNameEn: invoice.patientNameEn,
    initialsAr: invoice.initialsAr,
    initialsEn: invoice.initialsEn,
    avatarBg: invoice.avatarBg,
    branch: invoice.branch,
    treatmentAr: treatmentsAr,
    treatmentEn: treatmentsEn,
    doctorAr: invoice.doctorAr,
    doctorEn: invoice.doctorEn,
    doctorColor: invoice.doctorColor,
    date: invoice.date,
    totalAmount: invoice.total,
    paidAmount: invoice.paid,
    paymentMethodAr: labels.ar,
    paymentMethodEn: labels.en,
    methodType: method,
    status: invoice.status,
    installments: invoice.installments,
    discountPercent: invoice.discountPercent || undefined,
  };
}

export function currentMonthInvoiceSeed(branch: FinanceBranch | 'ALL' = 'ALL'): UiInvoiceRecord[] {
  return ALL_INVOICES.filter(
    (invoice) =>
      monthOf(invoice.date) === CURRENT_MONTH && (branch === 'ALL' || invoice.branch === branch)
  )
    .map(toUiInvoice)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function currentMonthSeedTotals(branch: FinanceBranch | 'ALL' = 'ALL'): {
  paid: number;
  unpaid: number;
} {
  const seed = currentMonthInvoiceSeed(branch);
  return {
    paid: seed.reduce((sum, invoice) => sum + invoice.paidAmount, 0),
    unpaid: seed.reduce(
      (sum, invoice) => sum + Math.max(0, invoice.totalAmount - invoice.paidAmount),
      0
    ),
  };
}

export const CURRENT_SEED_PAID = currentMonthSeedTotals().paid;
export const CURRENT_SEED_UNPAID = currentMonthSeedTotals().unpaid;

export const CURRENT_MONTH_KEY = CURRENT_MONTH;
export const LEDGER_INVOICE_TOTAL = ALL_INVOICES.length;
export const LEDGER_SERVICE_KEYS = SERVICE_KEYS;
export const LEDGER_PAYROLL_STAFF = PAYROLL_STAFF;

export type StatsPeriod = 'today' | 'week' | 'this_month' | 'last_month' | 'all';

export interface PeriodFinanceSummary {
  invoiced: number;
  invoiceCount: number;
  averageInvoice: number;
  collected: number;
  costs: number;
  netProfit: number;
  marginPercent: number;
  collectionRatePercent: number;
}

export function periodFinanceSummary(
  period: StatsPeriod,
  branch: FinanceBranch | 'ALL' = 'ALL',
  doctorNameEn?: string
): PeriodFinanceSummary {
  const today = clinicTodayISO();
  const [from, to]: [string, string] =
    period === 'today'
      ? [today, today]
      : period === 'week'
      ? [clinicDateISO(-6), today]
      : period === 'this_month'
      ? [clinicMonthStartISO(0), today]
      : period === 'last_month'
      ? [clinicMonthStartISO(-1), clinicMonthEndISO(-1)]
      : ['2000-01-01', '2099-12-31'];

  const matchesDoctor = (docEn: string) =>
    !doctorNameEn || doctorNameEn === 'ALL' || docEn === doctorNameEn;

  let invoiced = 0;
  let invoiceCount = 0;
  for (const inv of ALL_INVOICES) {
    if (!inBranch(branch, inv.branch) || !matchesDoctor(inv.doctorEn)) continue;
    if (inv.date >= from && inv.date <= to) {
      invoiced += inv.total;
      invoiceCount += 1;
    }
  }

  let collected = 0;
  for (const pay of ALL_PAYMENTS) {
    const inv = invoiceOf(pay);
    if (!inv || !inBranch(branch, inv.branch) || !matchesDoctor(inv.doctorEn)) continue;
    if (pay.date >= from && pay.date <= to) {
      collected += pay.amount;
    }
  }

  let costs = 0;
  if (period === 'all') {
    costs = SEED_EXPENSES.filter((e) => inBranch(branch, e.branchCode)).reduce(
      (s, e) => s + e.amountEgp,
      0
    );
  } else if (period === 'last_month') {
    costs = expensesForMonth(clinicMonthKey(-1))
      .filter((e) => inBranch(branch, e.branchCode))
      .reduce((s, e) => s + e.amountEgp, 0);
  } else {
    const monthTotalCosts = expensesForMonth(clinicMonthKey(0))
      .filter((e) => inBranch(branch, e.branchCode))
      .reduce((s, e) => s + e.amountEgp, 0);
    const daysInMonth = Number(clinicMonthEndISO(0).slice(8, 10)) || 30;
    const elapsedDays = Number(today.slice(8, 10)) || 1;
    const ratio =
      period === 'today'
        ? 1 / daysInMonth
        : period === 'week'
        ? Math.min(7, elapsedDays) / daysInMonth
        : elapsedDays / daysInMonth;
    costs = roundEgp(monthTotalCosts * ratio);
  }

  const netProfit = collected - costs;
  return {
    invoiced,
    invoiceCount,
    averageInvoice: invoiceCount ? roundEgp(invoiced / invoiceCount) : 0,
    collected,
    costs,
    netProfit,
    marginPercent: collected ? Math.round((netProfit / collected) * 100) : 0,
    collectionRatePercent: invoiced ? Math.round((collected / invoiced) * 100) : 0,
  };
}
