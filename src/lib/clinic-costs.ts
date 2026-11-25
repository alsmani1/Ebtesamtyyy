/**
 * Recorded cost inputs (the only EGP values that are entered rather than derived):
 * expense ledger entries and staff payroll rows. Every cost total shown in the app
 * is a sum of these rows.
 */

import { clinicMonthDayISO, clinicMonthKey } from './clinic-clock';

export const SHARED_EXPENSES_KEY = 'ebtesamty_shared_expenses_v4';
export const SHARED_EXPENSES_EVENT = 'ebtesamty-shared-expenses-sync';

export type FinanceBranch = 'BR-A' | 'BR-B' | 'BR-C';

export type ExpenseCategory =
  | 'Rent'
  | 'Staff Salaries'
  | 'Dental Materials & Supplies'
  | 'Lab Vendor Fees'
  | 'Utilities & Maintenance'
  | 'Petty Cash';

export interface ExpenseLedgerEntry {
  id: string;
  date: string;
  branchCode: FinanceBranch;
  category: ExpenseCategory;
  description: string;
  amountEgp: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'InstaPay' | 'Card';
}

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; ar: string; fixed: boolean }[] = [
  { id: 'Rent', ar: 'الإيجار', fixed: true },
  { id: 'Staff Salaries', ar: 'رواتب الفريق', fixed: true },
  { id: 'Dental Materials & Supplies', ar: 'خامات ومستلزمات الأسنان', fixed: false },
  { id: 'Lab Vendor Fees', ar: 'رسوم المعامل', fixed: false },
  { id: 'Utilities & Maintenance', ar: 'مرافق وصيانة', fixed: true },
  { id: 'Petty Cash', ar: 'مصروفات نثرية', fixed: false },
];

export const COST_MONTH_SPAN = 12;

const BASE_BY_BRANCH: Record<FinanceBranch, number[]> = {
  // [Rent, Staff Salaries, Materials, Lab, Utilities, Petty]
  'BR-A': [3500, 9000, 2000, 1200, 800, 500],
  'BR-B': [3200, 8000, 1800, 1000, 700, 450],
  'BR-C': [2500, 6000, 1200, 600, 500, 300],
};

const VENDORS: Record<ExpenseCategory, string> = {
  Rent: 'Monthly clinic rent',
  'Staff Salaries': 'Payroll — dentists & reception',
  'Dental Materials & Supplies': 'Al Sharq supplier',
  'Lab Vendor Fees': 'Al Nour Lab / Atlas Dental Lab',
  'Utilities & Maintenance': 'Electricity, water & equipment service',
  'Petty Cash': 'Daily small transactions',
};

const METHODS: Record<ExpenseCategory, ExpenseLedgerEntry['paymentMethod']> = {
  Rent: 'Bank Transfer',
  'Staff Salaries': 'Bank Transfer',
  'Dental Materials & Supplies': 'InstaPay',
  'Lab Vendor Fees': 'Bank Transfer',
  'Utilities & Maintenance': 'Card',
  'Petty Cash': 'Cash',
};

export function buildSeedExpenses(): ExpenseLedgerEntry[] {
  const rows: ExpenseLedgerEntry[] = [];
  for (let offset = -(COST_MONTH_SPAN - 1); offset <= 0; offset += 1) {
    const month = clinicMonthKey(offset);
    (Object.keys(BASE_BY_BRANCH) as FinanceBranch[]).forEach((branch) => {
      EXPENSE_CATEGORIES.forEach((category, index) => {
        const drift = category.fixed ? 1 : 1 + ((((offset + COST_MONTH_SPAN) * 7 + index * 3) % 5) / 25);
        rows.push({
          id: `EXP-${month}-${branch}-${index}`,
          date: clinicMonthDayISO(3 + index * 3, offset),
          branchCode: branch,
          category: category.id,
          description: VENDORS[category.id],
          amountEgp: Math.round((BASE_BY_BRANCH[branch][index] ?? 0) * drift),
          paymentMethod: METHODS[category.id],
        });
      });
    });
  }
  return rows;
}

export const SEED_EXPENSES: ExpenseLedgerEntry[] = buildSeedExpenses();

export function expensesForMonth(month: string): ExpenseLedgerEntry[] {
  return SEED_EXPENSES.filter((entry) => entry.date.startsWith(month));
}

export function supplierPurchases(supplier: string, year: string): ExpenseLedgerEntry[] {
  return SEED_EXPENSES.filter(
    (entry) =>
      entry.category === 'Dental Materials & Supplies' &&
      entry.date.startsWith(year) &&
      entry.description === supplier
  );
}

export interface PayrollStaffRow {
  id: string;
  branchCode: FinanceBranch;
  employeeEn: string;
  employeeAr: string;
  roleEn: string;
  roleAr: string;
  amountEgp: number;
  doctorId?: string;
}

export const PAYROLL_STAFF: PayrollStaffRow[] = [
  { id: 'pr-sandy', branchCode: 'BR-A', employeeEn: 'Dr. Sandy Saad', employeeAr: 'د. ساندي سعد', roleEn: 'Prosthodontist', roleAr: 'أخصائية تركيبات', amountEgp: 4500, doctorId: 'doc-sandy' },
  { id: 'pr-feby', branchCode: 'BR-A', employeeEn: 'Dr. Feby Samer', employeeAr: 'د. فيبي سامر', roleEn: 'Endodontist', roleAr: 'أخصائية جذور', amountEgp: 3000, doctorId: 'doc-feby' },
  { id: 'pr-mariam', branchCode: 'BR-A', employeeEn: 'Mariam Hanna', employeeAr: 'مريم حنا', roleEn: 'Receptionist', roleAr: 'استقبال', amountEgp: 1500 },
  { id: 'pr-nourhan', branchCode: 'BR-A', employeeEn: 'Nourhan Adel', employeeAr: 'نورهان عادل', roleEn: 'Front Desk', roleAr: 'استقبال', amountEgp: 1500 },
  { id: 'pr-ahmed', branchCode: 'BR-B', employeeEn: 'Dr. Ahmed Hassan', employeeAr: 'د. أحمد حسن', roleEn: 'Implantologist', roleAr: 'أخصائي زراعة', amountEgp: 4000, doctorId: 'doc-ahmed' },
  { id: 'pr-youssef', branchCode: 'BR-B', employeeEn: 'Dr. Youssef El-Mansy', employeeAr: 'د. يوسف المنسي', roleEn: 'Orthodontist', roleAr: 'أخصائي تقويم', amountEgp: 2500, doctorId: 'doc-youssef' },
  { id: 'pr-sandyrec', branchCode: 'BR-B', employeeEn: 'Sandy Abd', employeeAr: 'ساندي عبد', roleEn: 'Receptionist', roleAr: 'استقبال', amountEgp: 1500 },
  { id: 'pr-nadia', branchCode: 'BR-C', employeeEn: 'Dr. Nadia El-Hariry', employeeAr: 'د. نادية الحريري', roleEn: 'Pediatric Dentist', roleAr: 'أخصائية أطفال', amountEgp: 4000, doctorId: 'doc-nadia' },
  { id: 'pr-salma', branchCode: 'BR-C', employeeEn: 'Salma El-Masry', employeeAr: 'سلمى المصري', roleEn: 'Receptionist', roleAr: 'استقبال', amountEgp: 1000 },
  { id: 'pr-hoda', branchCode: 'BR-C', employeeEn: 'Hoda Kamal', employeeAr: 'هدى كمال', roleEn: 'Dental Nurse', roleAr: 'مساعدة أسنان', amountEgp: 1000 },
];

export const PAYROLL_MONTHLY_TOTAL = PAYROLL_STAFF.reduce((sum, row) => sum + row.amountEgp, 0);
