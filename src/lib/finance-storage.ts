import { currentMonthInvoiceSeed, type UiInvoiceRecord } from './clinic-finance';
import { listPatients } from './patients-db';

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
