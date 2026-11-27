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
  const completed = listAppointments().filter(
    (appt) =>
      appt.status === 'COMPLETED' &&
      (branch === 'ALL' || appt.branchCode === branch)
  );

  const map = new Map<string, DoctorSalaryRow>();
  for (const inv of invoices) {
    const key = `${inv.branch}:${inv.doctorEn}`;
    const row = map.get(key) ?? {
      doctorEn: inv.doctorEn,
      doctorAr: inv.doctorAr,
      branch: inv.branch,
      completedAppointments: 0,
      invoiceCount: 0,
      totalInvoicedEgp: 0,
      salaryEgp: 0,
      latestInvoiceDate: inv.date,
    };
    row.invoiceCount += 1;
    row.totalInvoicedEgp += inv.totalAmount;
    if (inv.date > row.latestInvoiceDate) row.latestInvoiceDate = inv.date;
    map.set(key, row);
  }

  for (const appt of completed) {
    const key = `${appt.branchCode}:${appt.doctorNameEn}`;
    const existing = map.get(key);
    if (existing) {
      existing.completedAppointments += 1;
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
