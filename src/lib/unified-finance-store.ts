'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SHARED_EXPENSES_EVENT,
  SHARED_EXPENSES_KEY,
  ExpenseLedgerEntry,
  expensesForMonth,
} from '@/lib/clinic-costs';
import {
  CURRENT_MONTH_KEY,
  CURRENT_SEED_PAID,
  currentMonthInvoiceSeed,
  financeKpis,
} from '@/lib/clinic-finance';
import { SHARED_INVOICES_EVENT, SHARED_INVOICES_STORAGE_KEY } from '@/lib/finance-storage';

export { SHARED_INVOICES_EVENT, SHARED_INVOICES_STORAGE_KEY };

export interface InstallmentItem {
  id: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'due' | 'overdue';
}

export interface InvoiceRecord {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  initialsAr: string;
  initialsEn: string;
  avatarBg: string;
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
  methodType: 'instapay' | 'cash' | 'visa' | 'split' | 'none';
  status: 'partial' | 'paid' | 'unpaid';
  installments?: InstallmentItem[];
  discountPercent?: number;
  discountGivenBy?: string;
  discountReason?: string;
  paidOnline?: boolean;
  paidAt?: string;
}

/** Current-month invoices generated from the deterministic clinic ledger. */
export const INITIAL_INVOICES: InvoiceRecord[] = currentMonthInvoiceSeed() as InvoiceRecord[];

export const INITIAL_SEED_PAID = CURRENT_SEED_PAID;

/**
 * Universal Unified Finance Store
 * Synchronizes Invoices, Patient Balances, Payments, Collections, Costs, and Net Profit
 * across Patient, Receptionist, and Owner portals in real-time.
 */
export function useUnifiedFinance() {
  const [invoices, setInvoicesState] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [expenses, setExpensesState] = useState<ExpenseLedgerEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const readInvoices = () => {
      try {
        const saved = window.localStorage.getItem(SHARED_INVOICES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInvoicesState(parsed);
            return;
          }
        }
        window.localStorage.setItem(SHARED_INVOICES_STORAGE_KEY, JSON.stringify(INITIAL_INVOICES));
        setInvoicesState(INITIAL_INVOICES);
      } catch {
        // Fallback to initial
      }
    };

    const readExpenses = () => {
      try {
        const saved = window.localStorage.getItem(SHARED_EXPENSES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setExpensesState(parsed);
          }
        }
      } catch {
        // Fallback
      }
    };

    readInvoices();
    readExpenses();

    const handleInvoiceSync = () => readInvoices();
    const handleExpenseSync = () => readExpenses();

    window.addEventListener(SHARED_INVOICES_EVENT, handleInvoiceSync);
    window.addEventListener(SHARED_EXPENSES_EVENT, handleExpenseSync);
    window.addEventListener('storage', handleInvoiceSync);

    return () => {
      window.removeEventListener(SHARED_INVOICES_EVENT, handleInvoiceSync);
      window.removeEventListener(SHARED_EXPENSES_EVENT, handleExpenseSync);
      window.removeEventListener('storage', handleInvoiceSync);
    };
  }, []);

  const saveInvoices = useCallback((updater: InvoiceRecord[] | ((prev: InvoiceRecord[]) => InvoiceRecord[])) => {
    setInvoicesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(SHARED_INVOICES_STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(SHARED_INVOICES_EVENT));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const payInvoice = useCallback((
    invoiceId: string,
    amount: number,
    method: 'InstaPay' | 'Cash' | 'Visa' | 'Fawry' = 'InstaPay',
    paidBy: 'patient' | 'receptionist' = 'patient'
  ) => {
    saveInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = Math.min(inv.totalAmount, inv.paidAmount + Math.max(0, amount));
        const isFullyPaid = newPaid >= inv.totalAmount;
        const newStatus: 'paid' | 'partial' | 'unpaid' = isFullyPaid ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

        const updatedInstallments = inv.installments?.map((inst) => {
          if (isFullyPaid) return { ...inst, status: 'paid' as const };
          return inst;
        });

        const methodMap: Record<string, { ar: string; en: string; type: InvoiceRecord['methodType'] }> = {
          InstaPay: { ar: 'إنستاباي (أونلاين)', en: 'InstaPay (Online)', type: 'instapay' },
          Visa: { ar: 'بطاقة فيزا / ماستركارد', en: 'Visa / Mastercard', type: 'visa' },
          Cash: { ar: 'نقدي (العيادة)', en: 'Cash (Clinic)', type: 'cash' },
          Fawry: { ar: 'فوري / محفظة إلكترونية', en: 'Fawry / E-Wallet', type: 'visa' },
        };

        const chosenMethod = methodMap[method] || methodMap.InstaPay;

        return {
          ...inv,
          paidAmount: newPaid,
          status: newStatus,
          paymentMethodAr: chosenMethod.ar,
          paymentMethodEn: chosenMethod.en,
          methodType: chosenMethod.type,
          installments: updatedInstallments,
          paidOnline: paidBy === 'patient',
          paidAt: new Date().toISOString(),
        };
      })
    );
  }, [saveInvoices]);

  // Compute live aggregates across all connected pages
  const stats = useMemo(() => {
    const ledger = financeKpis();
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const delta = Math.max(0, totalCollected - CURRENT_SEED_PAID);
    const totalArrears = invoices.reduce(
      (sum, inv) => sum + Math.max(0, (inv.totalAmount || 0) - (inv.paidAmount || 0)),
      0
    );

    const seededExpenses = expensesForMonth(CURRENT_MONTH_KEY);
    const totalExpenses = expenses.length
      ? expenses.reduce((sum, exp) => sum + (exp.amountEgp || 0), 0)
      : seededExpenses.reduce((sum, exp) => sum + exp.amountEgp, 0);
    const netProfit = totalCollected - totalExpenses;

    const clinicCollected = ledger.monthCollected + delta;
    const clinicArrears = Math.max(0, ledger.arrears - delta);
    const clinicNetProfit = clinicCollected - ledger.costs;
    const clinicTodayRevenue = ledger.todayCollected + delta;

    const paidInvoicesCount = invoices.filter((i) => i.status === 'paid').length;
    const unpaidInvoicesCount = invoices.filter((i) => i.status !== 'paid').length;

    return {
      totalInvoiced,
      totalCollected,
      totalArrears,
      totalExpenses,
      netProfit,
      delta,
      clinicCollected,
      clinicArrears,
      clinicNetProfit,
      clinicTodayRevenue,
      paidInvoicesCount,
      unpaidInvoicesCount,
      totalInvoicesCount: invoices.length,
      todayCollected: ledger.todayCollected + delta,
    };
  }, [invoices, expenses]);

  // Helper to query balance for Passant or any patient
  const getPatientBalance = useCallback((patientQuery: string = 'Passant') => {
    const q = patientQuery.toLowerCase();
    const patientInvs = invoices.filter(
      (inv) =>
        inv.patientNameEn.toLowerCase().includes(q) ||
        inv.patientNameAr.includes(patientQuery) ||
        inv.patientNameEn.includes('EBT-PAT-0001') ||
        inv.id === 'INV-680' ||
        inv.id === 'INV-964'
    );
    const totalDue = patientInvs.reduce(
      (sum, inv) => sum + Math.max(0, inv.totalAmount - inv.paidAmount),
      0
    );
    const totalInvoiced = patientInvs.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = patientInvs.reduce((sum, inv) => sum + inv.paidAmount, 0);
    return {
      invoices: patientInvs,
      totalDue,
      totalInvoiced,
      totalPaid,
      settledPct: totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 100,
    };
  }, [invoices]);

  return {
    invoices,
    stats,
    saveInvoices,
    payInvoice,
    getPatientBalance,
  };
}
