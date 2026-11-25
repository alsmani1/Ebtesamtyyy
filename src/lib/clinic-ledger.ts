/** Single clinic clock and the only seed for later phases. Screens still use their own lists until wired. */

import {
  clinicDateISO,
  clinicMonthKey,
  clinicThisMonthISO,
  clinicTodayISO,
} from "./clinic-clock";
import { SERVICES } from "./clinic-pricing";
import type { ServiceKey } from "./clinic-pricing";

const stepPrice = (key: ServiceKey, units = 1) => SERVICES[key].price * units;
const stepLabCost = (key: ServiceKey, units = 1) => SERVICES[key].labCost * units;
const halfStepPrice = (key: ServiceKey, units = 1) => Math.round(stepPrice(key, units) / 2);

export const CLINIC_AS_OF = clinicTodayISO();

export type BranchCode = "BR-A" | "BR-B" | "BR-C";
export type VisitStatus = "booked" | "arrived" | "completed" | "no_show" | "cancelled";

export interface LedgerPatient {
  id: string;
  nameEn: string;
  nameAr: string;
  branch: BranchCode;
  doctorId: string;
}

export interface LedgerVisit {
  id: string;
  patientId: string;
  branch: BranchCode;
  doctorId: string;
  date: string;
  status: VisitStatus;
}

export interface LedgerStep {
  id: string;
  patientId: string;
  branch: BranchCode;
  doctorId: string;
  nameEn: string;
  nameAr: string;
  price: number;
  labCost: number;
  status: "done" | "planned";
  date: string;
  serviceKey: string;
}

export interface LedgerInvoice {
  id: string;
  patientId: string;
  branch: BranchCode;
  date: string;
  discountPercent: number;
  stepIds: string[];
}

export interface LedgerPayment {
  id: string;
  invoiceId: string;
  branch: BranchCode;
  amount: number;
  date: string;
}

export interface LedgerExpense {
  id: string;
  branch: BranchCode;
  amount: number;
  date: string;
}

export interface StockItem {
  id: string;
  branch: BranchCode;
  nameEn: string;
  qty: number;
  unitCost: number;
}

export interface LabOrder {
  id: string;
  patientId: string;
  branch: BranchCode;
  cost: number;
  date: string;
}

export interface PayrollRow {
  id: string;
  branch: BranchCode;
  month: string;
  amount: number;
}

const RECIPE: Record<string, { itemId: string; qty: number }[]> = {
  rct: [{ itemId: "gutta", qty: 1 }, { itemId: "lidocaine", qty: 1 }],
  post: [{ itemId: "composite", qty: 0.3 }],
  crown: [{ itemId: "glove", qty: 2 }],
  implant: [{ itemId: "fixture", qty: 1 }, { itemId: "lidocaine", qty: 2 }],
  filling: [{ itemId: "composite", qty: 0.2 }, { itemId: "lidocaine", qty: 1 }],
  scaling: [{ itemId: "glove", qty: 2 }],
  veneer: [{ itemId: "glove", qty: 2 }],
};

export const PATIENTS: LedgerPatient[] = [
  { id: "EBT-PAT-0001", nameEn: "Passant", nameAr: "بسنت", branch: "BR-A", doctorId: "doc-sandy" },
  { id: "P-1042", nameEn: "Mohamed Ahmed Ali", nameAr: "محمد أحمد علي", branch: "BR-B", doctorId: "doc-ahmed" },
  { id: "P-1057", nameEn: "Ibrahim Yassin Shaheen", nameAr: "إبراهيم ياسين شاهين", branch: "BR-A", doctorId: "doc-feby" },
  { id: "P-0877", nameEn: "Moustafa Samy", nameAr: "مصطفى سامي", branch: "BR-B", doctorId: "doc-youssef" },
  { id: "P-0310", nameEn: "Ahmed Mohamed", nameAr: "أحمد محمد", branch: "BR-A", doctorId: "doc-feby" },
  { id: "P-1051", nameEn: "Mai Saeed", nameAr: "مي سعيد", branch: "BR-C", doctorId: "doc-nadia" },
  { id: "P-1064", nameEn: "Rana Marwan Abdelaziz", nameAr: "رنا مروان عبد العزيز", branch: "BR-A", doctorId: "doc-sandy" },
];

export const STEPS: LedgerStep[] = [
  { id: "s1", patientId: "EBT-PAT-0001", branch: "BR-A", doctorId: "doc-sandy", nameEn: "Root canal #36", nameAr: "حشو عصب #36", price: stepPrice("rct"), labCost: stepLabCost("rct"), status: "done", date: clinicThisMonthISO(3), serviceKey: "rct" },
  { id: "s2", patientId: "EBT-PAT-0001", branch: "BR-A", doctorId: "doc-sandy", nameEn: "Post and core #36", nameAr: "دعامة #36", price: stepPrice("post"), labCost: stepLabCost("post"), status: "done", date: clinicThisMonthISO(1), serviceKey: "post" },
  { id: "s3", patientId: "EBT-PAT-0001", branch: "BR-A", doctorId: "doc-sandy", nameEn: "Zirconia crown #36", nameAr: "تاج زيركون #36", price: stepPrice("crown"), labCost: stepLabCost("crown"), status: "planned", date: clinicDateISO(7), serviceKey: "crown" },
  { id: "s4", patientId: "P-1042", branch: "BR-B", doctorId: "doc-ahmed", nameEn: "Implant surgery #46", nameAr: "جراحة زراعة #46", price: stepPrice("implant"), labCost: stepLabCost("implant"), status: "done", date: clinicThisMonthISO(17), serviceKey: "implant" },
  { id: "s5", patientId: "P-1042", branch: "BR-B", doctorId: "doc-ahmed", nameEn: "Implant review #46", nameAr: "مراجعة زراعة #46", price: 0, labCost: 0, status: "done", date: clinicThisMonthISO(2), serviceKey: "scaling" },
  { id: "s6", patientId: "P-1042", branch: "BR-B", doctorId: "doc-ahmed", nameEn: "Zirconia crown #46", nameAr: "تاج زيركون #46", price: stepPrice("crown"), labCost: stepLabCost("crown"), status: "planned", date: clinicDateISO(9), serviceKey: "crown" },
  { id: "s7", patientId: "P-1057", branch: "BR-A", doctorId: "doc-feby", nameEn: "Filling #16", nameAr: "حشو #16", price: stepPrice("filling"), labCost: stepLabCost("filling"), status: "done", date: clinicThisMonthISO(9), serviceKey: "filling" },
  { id: "s8", patientId: "P-1057", branch: "BR-A", doctorId: "doc-feby", nameEn: "Filling #26", nameAr: "حشو #26", price: stepPrice("filling"), labCost: stepLabCost("filling"), status: "done", date: clinicThisMonthISO(9), serviceKey: "filling" },
  { id: "s9", patientId: "P-1057", branch: "BR-A", doctorId: "doc-feby", nameEn: "Scaling", nameAr: "تنظيف جير", price: stepPrice("scaling"), labCost: stepLabCost("scaling"), status: "done", date: clinicThisMonthISO(9), serviceKey: "scaling" },
  { id: "s10", patientId: "P-0877", branch: "BR-B", doctorId: "doc-youssef", nameEn: "Veneer prep #12–#22", nameAr: "تحضير فينير #12–#22", price: halfStepPrice("veneer", 6), labCost: 0, status: "done", date: clinicThisMonthISO(5), serviceKey: "veneer" },
  { id: "s11", patientId: "P-0877", branch: "BR-B", doctorId: "doc-youssef", nameEn: "Veneer fit #12–#22", nameAr: "تركيب فينير #12–#22", price: halfStepPrice("veneer", 6), labCost: stepLabCost("veneer", 6), status: "planned", date: clinicDateISO(11), serviceKey: "veneer" },
  { id: "s12", patientId: "P-0310", branch: "BR-A", doctorId: "doc-feby", nameEn: "Root canal #14", nameAr: "علاج جذور #14", price: stepPrice("rct"), labCost: stepLabCost("rct"), status: "done", date: clinicThisMonthISO(4), serviceKey: "rct" },
  { id: "s13", patientId: "P-0310", branch: "BR-A", doctorId: "doc-feby", nameEn: "Composite build-up #14", nameAr: "حشو تجميلي #14", price: stepPrice("filling"), labCost: stepLabCost("filling"), status: "planned", date: clinicDateISO(5), serviceKey: "filling" },
  { id: "s14", patientId: "P-1051", branch: "BR-C", doctorId: "doc-nadia", nameEn: "Scaling", nameAr: "تنظيف جير", price: stepPrice("scaling"), labCost: stepLabCost("scaling"), status: "done", date: clinicThisMonthISO(6), serviceKey: "scaling" },
  { id: "s15", patientId: "P-1051", branch: "BR-C", doctorId: "doc-nadia", nameEn: "Filling #36", nameAr: "حشو #36", price: stepPrice("filling"), labCost: stepLabCost("filling"), status: "planned", date: clinicDateISO(4), serviceKey: "filling" },
  { id: "s16", patientId: "P-1064", branch: "BR-A", doctorId: "doc-sandy", nameEn: "Crown prep #34", nameAr: "تحضير تاج #34", price: halfStepPrice("crown"), labCost: 0, status: "done", date: clinicThisMonthISO(13), serviceKey: "crown" },
  { id: "s17", patientId: "P-1064", branch: "BR-A", doctorId: "doc-sandy", nameEn: "Crown fit #34", nameAr: "تركيب تاج #34", price: halfStepPrice("crown"), labCost: stepLabCost("crown"), status: "done", date: clinicTodayISO(), serviceKey: "crown" },
];

export const VISITS: LedgerVisit[] = [
  { id: "v1", patientId: "EBT-PAT-0001", branch: "BR-A", doctorId: "doc-sandy", date: clinicTodayISO(), status: "arrived" },
  { id: "v2", patientId: "P-1064", branch: "BR-A", doctorId: "doc-sandy", date: clinicTodayISO(), status: "completed" },
  { id: "v3", patientId: "P-1057", branch: "BR-A", doctorId: "doc-feby", date: clinicTodayISO(), status: "booked" },
  { id: "v4", patientId: "P-0310", branch: "BR-A", doctorId: "doc-feby", date: clinicTodayISO(), status: "no_show" },
  { id: "v5", patientId: "P-1042", branch: "BR-B", doctorId: "doc-ahmed", date: clinicTodayISO(), status: "booked" },
  { id: "v6", patientId: "P-0877", branch: "BR-B", doctorId: "doc-youssef", date: clinicTodayISO(), status: "arrived" },
  { id: "v7", patientId: "P-1051", branch: "BR-C", doctorId: "doc-nadia", date: clinicTodayISO(), status: "booked" },
  { id: "v8", patientId: "EBT-PAT-0001", branch: "BR-A", doctorId: "doc-sandy", date: clinicThisMonthISO(3), status: "completed" },
  { id: "v9", patientId: "P-1042", branch: "BR-B", doctorId: "doc-ahmed", date: clinicThisMonthISO(2), status: "completed" },
  { id: "v10", patientId: "P-1051", branch: "BR-C", doctorId: "doc-nadia", date: clinicThisMonthISO(7), status: "no_show" },
];

export const INVOICES: LedgerInvoice[] = [
  { id: "INV-680", patientId: "EBT-PAT-0001", branch: "BR-A", date: clinicThisMonthISO(1), discountPercent: 0, stepIds: ["s1", "s2"] },
  { id: "INV-312", patientId: "P-1042", branch: "BR-B", date: clinicThisMonthISO(2), discountPercent: 0, stepIds: ["s4"] },
  { id: "INV-140", patientId: "P-1057", branch: "BR-A", date: clinicThisMonthISO(9), discountPercent: 0, stepIds: ["s7", "s8", "s9"] },
  { id: "INV-220", patientId: "P-0877", branch: "BR-B", date: clinicThisMonthISO(5), discountPercent: 0, stepIds: ["s10"] },
  { id: "INV-230", patientId: "P-0310", branch: "BR-A", date: clinicThisMonthISO(4), discountPercent: 0, stepIds: ["s12"] },
  { id: "INV-510", patientId: "P-1051", branch: "BR-C", date: clinicThisMonthISO(6), discountPercent: 0, stepIds: ["s14"] },
  { id: "INV-311", patientId: "P-1064", branch: "BR-A", date: clinicTodayISO(), discountPercent: 0, stepIds: ["s16", "s17"] },
];

const PAYMENT_SHARE: Record<string, number> = {
  "INV-680": 0.1,
  "INV-312": 0.6,
  "INV-140": 1,
  "INV-220": 0.15,
  "INV-311": 1,
};

export const EXPENSES: LedgerExpense[] = [
  { id: "ex-a", branch: "BR-A", amount: 8000, date: clinicThisMonthISO(10) },
  { id: "ex-b", branch: "BR-B", amount: 6500, date: clinicThisMonthISO(10) },
  { id: "ex-c", branch: "BR-C", amount: 4000, date: clinicThisMonthISO(10) },
];

export const STOCK: StockItem[] = [
  { id: "composite", branch: "BR-A", nameEn: "Composite A2", qty: 12, unitCost: 400 },
  { id: "lidocaine", branch: "BR-A", nameEn: "Lidocaine", qty: 40, unitCost: 25 },
  { id: "gutta", branch: "BR-A", nameEn: "Gutta percha", qty: 20, unitCost: 80 },
  { id: "fixture", branch: "BR-B", nameEn: "Titanium fixture", qty: 6, unitCost: 2000 },
  { id: "glove", branch: "BR-C", nameEn: "Latex gloves", qty: 100, unitCost: 5 },
];

export const LAB_ORDERS: LabOrder[] = [
  { id: "L-311", patientId: "P-1064", branch: "BR-A", cost: 900, date: clinicThisMonthISO(3) },
  { id: "L-220", patientId: "P-0877", branch: "BR-B", cost: 2800, date: clinicThisMonthISO(4) },
  { id: "L-36", patientId: "EBT-PAT-0001", branch: "BR-A", cost: 700, date: clinicTodayISO() },
];

export const PAYROLL: PayrollRow[] = [
  { id: "pr-a", branch: "BR-A", month: clinicMonthKey(), amount: 12000 },
  { id: "pr-b", branch: "BR-B", month: clinicMonthKey(), amount: 11000 },
  { id: "pr-c", branch: "BR-C", month: clinicMonthKey(), amount: 6000 },
];

const stepById = new Map(STEPS.map((s) => [s.id, s]));
const stockById = new Map(STOCK.map((s) => [s.id, s]));

/** Recorded collection per invoice, expressed as a share of the invoice total. */
export const PAYMENTS: LedgerPayment[] = INVOICES.flatMap((invoice) => {
  const share = PAYMENT_SHARE[invoice.id];
  if (!share) return [];
  return [
    {
      id: `pay-${invoice.id.replace("INV-", "")}`,
      invoiceId: invoice.id,
      branch: invoice.branch,
      amount: Math.round(invoiceTotal(invoice) * share),
      date: invoice.date,
    },
  ];
});

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function invoiceGross(invoice: LedgerInvoice): number {
  return invoice.stepIds.reduce((sum, id) => sum + (stepById.get(id)?.price || 0), 0);
}

export function invoiceTotal(invoice: LedgerInvoice): number {
  const gross = invoiceGross(invoice);
  return Math.round(gross * (1 - invoice.discountPercent / 100));
}

export function invoicePaid(invoiceId: string, payments = PAYMENTS): number {
  return payments.filter((p) => p.invoiceId === invoiceId).reduce((sum, p) => sum + p.amount, 0);
}

export function invoiceBalance(invoice: LedgerInvoice, payments = PAYMENTS): number {
  return Math.max(0, invoiceTotal(invoice) - invoicePaid(invoice.id, payments));
}

export function stepMaterialCost(step: LedgerStep): number {
  const lines = RECIPE[step.serviceKey] || [];
  return lines.reduce((sum, line) => sum + line.qty * (stockById.get(line.itemId)?.unitCost || 0), 0);
}

export function stepDoctorShare(step: LedgerStep): number {
  const net = Math.max(0, step.price - stepMaterialCost(step) - step.labCost);
  const pct = SERVICES[step.serviceKey as ServiceKey].doctorSharePercent;
  return Math.round((net * pct) / 100);
}

export function planProgress(patientId: string): { done: number; total: number; pct: number; fee: number } {
  const steps = STEPS.filter((s) => s.patientId === patientId);
  const done = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  const fee = steps.reduce((sum, s) => sum + s.price, 0);
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, fee };
}

export interface BranchMetrics {
  collectedToday: number;
  collectedMonth: number;
  invoicedMonth: number;
  arrears: number;
  materialCost: number;
  labCost: number;
  doctorShare: number;
  expenses: number;
  payroll: number;
  costs: number;
  profit: number;
  appointmentsToday: number;
  noShowRate: number;
  completionRate: number;
  activePatients: number;
  stockValue: number;
}

function inBranch<T extends { branch: BranchCode }>(rows: T[], branch: BranchCode | "ALL"): T[] {
  return branch === "ALL" ? rows : rows.filter((r) => r.branch === branch);
}

export function branchMetrics(branch: BranchCode | "ALL", asOf = CLINIC_AS_OF): BranchMetrics {
  const month = monthOf(asOf);
  const invoices = inBranch(INVOICES, branch).filter((i) => monthOf(i.date) === month);
  const payments = inBranch(PAYMENTS, branch);
  const collectedMonth = payments.filter((p) => monthOf(p.date) === month).reduce((s, p) => s + p.amount, 0);
  const collectedToday = payments.filter((p) => p.date === asOf).reduce((s, p) => s + p.amount, 0);
  const invoicedMonth = invoices.reduce((s, i) => s + invoiceTotal(i), 0);
  const arrears = inBranch(INVOICES, branch).reduce((s, i) => s + invoiceBalance(i, payments), 0);
  const doneSteps = inBranch(STEPS, branch).filter((s) => s.status === "done" && monthOf(s.date) === month);
  const materialCost = doneSteps.reduce((s, step) => s + stepMaterialCost(step), 0);
  const labCost = inBranch(LAB_ORDERS, branch).filter((o) => monthOf(o.date) === month).reduce((s, o) => s + o.cost, 0);
  const doctorShare = doneSteps.reduce((s, step) => s + stepDoctorShare(step), 0);
  const expenses = inBranch(EXPENSES, branch).filter((e) => monthOf(e.date) === month).reduce((s, e) => s + e.amount, 0);
  const payroll = inBranch(PAYROLL, branch).filter((p) => p.month === month).reduce((s, p) => s + p.amount, 0);
  const costs = expenses + payroll + materialCost + labCost;
  const visits = inBranch(VISITS, branch).filter((v) => monthOf(v.date) === month && v.status !== "cancelled");
  const completed = visits.filter((v) => v.status === "completed").length;
  const noShows = visits.filter((v) => v.status === "no_show").length;
  const active = new Set<string>();
  inBranch(VISITS, branch).filter((v) => monthOf(v.date) === month).forEach((v) => active.add(v.patientId));
  inBranch(STEPS, branch).filter((s) => s.status === "planned").forEach((s) => active.add(s.patientId));
  const stockValue = inBranch(STOCK, branch).reduce((s, item) => s + item.qty * item.unitCost, 0);
  return {
    collectedToday,
    collectedMonth,
    invoicedMonth,
    arrears,
    materialCost,
    labCost,
    doctorShare,
    expenses,
    payroll,
    costs,
    profit: collectedMonth - costs,
    appointmentsToday: inBranch(VISITS, branch).filter((v) => v.date === asOf).length,
    noShowRate: completed + noShows ? Math.round((noShows / (completed + noShows)) * 100) : 0,
    completionRate: visits.length ? Math.round((completed / visits.length) * 100) : 0,
    activePatients: active.size,
    stockValue,
  };
}

export function clinicMetrics(asOf = CLINIC_AS_OF): BranchMetrics {
  const parts = (["BR-A", "BR-B", "BR-C"] as BranchCode[]).map((code) => branchMetrics(code, asOf));
  const sum = (key: keyof BranchMetrics) => parts.reduce((s, row) => s + row[key], 0);
  const visits = VISITS.filter((v) => monthOf(v.date) === monthOf(asOf) && v.status !== "cancelled");
  const completed = visits.filter((v) => v.status === "completed").length;
  const noShows = visits.filter((v) => v.status === "no_show").length;
  return {
    collectedToday: sum("collectedToday"),
    collectedMonth: sum("collectedMonth"),
    invoicedMonth: sum("invoicedMonth"),
    arrears: sum("arrears"),
    materialCost: sum("materialCost"),
    labCost: sum("labCost"),
    doctorShare: sum("doctorShare"),
    expenses: sum("expenses"),
    payroll: sum("payroll"),
    costs: sum("costs"),
    profit: sum("profit"),
    appointmentsToday: sum("appointmentsToday"),
    noShowRate: completed + noShows ? Math.round((noShows / (completed + noShows)) * 100) : 0,
    completionRate: visits.length ? Math.round((completed / visits.length) * 100) : 0,
    activePatients: sum("activePatients"),
    stockValue: sum("stockValue"),
  };
}
