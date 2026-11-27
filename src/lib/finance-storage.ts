import { currentMonthInvoiceSeed, type UiInvoiceRecord } from './clinic-finance';
import { listAppointments } from './appointments-db';
import { clinicMonthKey, clinicTodayISO } from './clinic-clock';
import type { ExpenseLedgerEntry, FinanceBranch } from './clinic-costs';
import { listPatients } from './patients-db';

export const DOCTOR_SALARY_RATE = 0.4;

export const SHARED_INVOICES_STORAGE_KEY = 'ebtesamty_shared_invoices_v5';
export const SHARED_INVOICES_EVENT = 'ebtesamty-shared-invoices-sync';

export type SharedInvoiceRecord = Omit<UiInvoiceRecord, 'methodType'> & {
  methodType: UiInvoiceRecord['methodType'] | 'split';
  discountGivenBy?: string;
  discountReason?: string;
};

export function listSharedInvoices(): SharedInvoiceRecord[] {
  let invoices: SharedInvoiceRecord[] = currentMonthInvoiceSeed();
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(SHARED_INVOICES_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) invoices = parsed;
      }
    } catch {}
  }
  const patients = listPatients();
  return invoices.map((invoice) => {
    if (invoice.patientId) return invoice;
    const matches = patients.filter((patient) => {
      if (patient.branchCode !== invoice.branch) return false;
      const names = [patient.fullName, patient.fullNameAr];
      if (patient.fullNameAr) {
        names.push(`${patient.fullName} (${patient.fullNameAr})`);
        names.push(`${patient.fullNameAr} (${patient.fullName})`);
      }
      return names.some((name) => {
        if (!name) return false;
        const normalized = name.trim().toLowerCase();
        return normalized === invoice.patientNameEn.trim().toLowerCase() ||
          normalized === invoice.patientNameAr.trim().toLowerCase();
      });
    });
    return matches.length === 1 ? { ...invoice, patientId: matches[0].id } : invoice;
  });
}

export function sharedPatientFinance(patientId?: string) {
  const invoices = listSharedInvoices().filter(
    (invoice) => Boolean(patientId) && invoice.patientId === patientId
  );
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const totalDue = invoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.totalAmount - invoice.paidAmount),
    0
  );
  return {
    invoices,
    totalInvoiced,
    totalPaid,
    totalDue,
    settledPct: totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 100,
  };
}

export function unpaidInvoiceInstallments(invoice: SharedInvoiceRecord) {
  let paidRemaining = invoice.paidAmount;
  return (invoice.installments ?? []).map((installment) => {
    const amount = Math.max(0, installment.amount - paidRemaining);
    paidRemaining = Math.max(0, paidRemaining - installment.amount);
    return { ...installment, amount };
  }).filter((installment) => installment.amount > 0);
}

export interface DoctorSalaryRow {
  doctorEn: string;
  doctorAr: string;
  branch: FinanceBranch;
  completedAppointments: number;
  invoiceCount: number;
  totalInvoicedEgp: number;
  salaryEgp: number;
  latestInvoiceDate: string;
}

export function computeDoctorSalaryRows(
  branch: FinanceBranch | 'ALL' = 'ALL'
): DoctorSalaryRow[] {
  const invoices = listSharedInvoices().filter(
    (inv) => branch === 'ALL' || inv.branch === branch
  );
  const allAppointments = listAppointments().filter(
    (appt) => branch === 'ALL' || appt.branchCode === branch
  );
  const completed = allAppointments.filter((appt) => appt.status === 'COMPLETED');

  // Track patients who have a non-completed appointment with a doctor and NO completed one
  const completedKeys = new Set<string>();
  const nonCompletedKeys = new Set<string>();
  const norm = (s?: string) => (s || '').trim().toLowerCase();

  for (const appt of allAppointments) {
    const doc = norm(appt.doctorNameEn);
    const idKey = appt.patientId ? `${appt.branchCode}:${doc}:id:${norm(appt.patientId)}` : '';
    const nameKey = appt.patientName ? `${appt.branchCode}:${doc}:name:${norm(appt.patientName)}` : '';
    if (appt.status === 'COMPLETED') {
      if (idKey) completedKeys.add(idKey);
      if (nameKey) completedKeys.add(nameKey);
    } else {
      if (idKey) nonCompletedKeys.add(idKey);
      if (nameKey) nonCompletedKeys.add(nameKey);
    }
  }

  const map = new Map<string, DoctorSalaryRow>();
  for (const appt of completed) {
    const key = `${appt.branchCode}:${appt.doctorNameEn}`;
    const existing = map.get(key);
    if (existing) {
      existing.completedAppointments += 1;
      if (appt.date && appt.date > existing.latestInvoiceDate) {
        existing.latestInvoiceDate = appt.date;
      }
    } else {
      map.set(key, {
        doctorEn: appt.doctorNameEn,
        doctorAr: appt.doctorNameAr,
        branch: appt.branchCode,
        completedAppointments: 1,
        invoiceCount: 0,
        totalInvoicedEgp: 0,
        salaryEgp: 0,
        latestInvoiceDate: appt.date || clinicTodayISO(),
      });
    }
  }

  for (const inv of invoices) {
    const key = `${inv.branch}:${inv.doctorEn}`;
    const row = map.get(key);
    // Only count invoices for doctors with completed appointments, and skip any invoice
    // tied to a confirmed/arrived/cancelled/no-show appointment that is not completed.
    if (!row || row.completedAppointments === 0) continue;
    const doc = norm(inv.doctorEn);
    const idKey = inv.patientId ? `${inv.branch}:${doc}:id:${norm(inv.patientId)}` : '';
    const nameKey = inv.patientNameEn ? `${inv.branch}:${doc}:name:${norm(inv.patientNameEn)}` : '';
    const hasUncompletedOnly =
      (idKey && nonCompletedKeys.has(idKey) && !completedKeys.has(idKey)) ||
      (nameKey && nonCompletedKeys.has(nameKey) && !completedKeys.has(nameKey));
    if (hasUncompletedOnly) continue;

    row.invoiceCount += 1;
    row.totalInvoicedEgp += inv.totalAmount;
    if (inv.date > row.latestInvoiceDate) row.latestInvoiceDate = inv.date;
  }

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      salaryEgp: Math.round(row.totalInvoicedEgp * DOCTOR_SALARY_RATE),
    }))
    .sort((a, b) => b.salaryEgp - a.salaryEgp || b.completedAppointments - a.completedAppointments);
}

export function doctorSalaryExpenseEntries(
  branch: FinanceBranch | 'ALL' = 'ALL'
): ExpenseLedgerEntry[] {
  const monthKey = clinicMonthKey();
  return computeDoctorSalaryRows(branch)
    .filter((row) => row.salaryEgp > 0)
    .map((row) => ({
      id: `DOC-SAL-${monthKey}-${row.branch}-${row.doctorEn.replace(/[^A-Za-z0-9]/g, '')}`,
      date: row.latestInvoiceDate || clinicTodayISO(),
      branchCode: row.branch,
      category: 'Staff Salaries',
      description: `Doctor Salary (40% of ${row.invoiceCount} invoices) — ${row.doctorEn}`,
      amountEgp: row.salaryEgp,
      paymentMethod: 'Bank Transfer',
    }));
}
