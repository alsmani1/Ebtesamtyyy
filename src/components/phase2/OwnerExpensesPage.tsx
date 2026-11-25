"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, X, Lock, Wallet, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import type { Phase2Role } from "./FinanceCenterPhaseTwo";
import {
  clinicMonthEndISO,
  clinicMonthKey,
  clinicMonthStartISO,
  clinicTodayISO,
} from "@/lib/clinic-clock";
import {
  EXPENSE_CATEGORIES,
  SEED_EXPENSES,
  SHARED_EXPENSES_EVENT,
  SHARED_EXPENSES_KEY,
  type ExpenseCategory,
  type ExpenseLedgerEntry,
  type FinanceBranch,
} from "@/lib/clinic-costs";

export { EXPENSE_CATEGORIES, SHARED_EXPENSES_EVENT, SHARED_EXPENSES_KEY };
export type { ExpenseCategory, ExpenseLedgerEntry };

const BRANCHES = [
  { code: "BR-A" as const, en: "Minya – Branch A", ar: "المنيا – الفرع أ" },
  { code: "BR-B" as const, en: "Minya – Branch B", ar: "المنيا – الفرع ب" },
  { code: "BR-C" as const, en: "Minya – Branch C", ar: "المنيا – الفرع ج" },
];

const MONTH_OFFSETS = [-3, -2, -1, 0];
const MONTHS = MONTH_OFFSETS.map((offset) => clinicMonthKey(offset));
const REF_MONTH = clinicMonthKey();

export function readSharedExpenses(): ExpenseLedgerEntry[] {
  if (typeof window === "undefined") return SEED_EXPENSES;
  try {
    const raw = window.localStorage.getItem(SHARED_EXPENSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SEED_EXPENSES;
}

export function useSharedExpenses() {
  const [entries, setEntriesState] = useState<ExpenseLedgerEntry[]>(() => SEED_EXPENSES);

  useEffect(() => {
    setEntriesState(readSharedExpenses());
    const sync = () => setEntriesState(readSharedExpenses());
    window.addEventListener("storage", sync);
    window.addEventListener(SHARED_EXPENSES_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SHARED_EXPENSES_EVENT, sync);
    };
  }, []);

  const setEntries = (next: ExpenseLedgerEntry[]) => {
    setEntriesState(next);
    try {
      window.localStorage.setItem(SHARED_EXPENSES_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(SHARED_EXPENSES_EVENT));
    } catch {}
  };

  return { entries, setEntries };
}

const fmt = (n: number) => n.toLocaleString();

export default function OwnerExpensesPage({
  role = "clinic_owner",
  branchCode = "ALL",
}: {
  role?: Phase2Role;
  branchCode?: FinanceBranch | "ALL";
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const { entries, setEntries } = useSharedExpenses();

  const [branchFilter, setBranchFilter] = useState<"ALL" | "BR-A" | "BR-B" | "BR-C">(
    branchCode
  );
  const scopedToBranch = branchCode !== "ALL";
  useEffect(() => {
    setBranchFilter(branchCode);
  }, [branchCode]);
  const [period, setPeriod] = useState<"this_month" | "last_month" | "quarter" | "custom">(
    "this_month"
  );
  const [fromDate, setFromDate] = useState(clinicMonthStartISO(-1));
  const [toDate, setToDate] = useState(clinicTodayISO());
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | ExpenseCategory>("ALL");
  const [showModal, setShowModal] = useState(false);

  const [fDate, setFDate] = useState(clinicTodayISO());
  const [fBranch, setFBranch] = useState<"BR-A" | "BR-B" | "BR-C">(
    branchCode === "ALL" ? "BR-A" : branchCode
  );
  const [fCategory, setFCategory] = useState<ExpenseCategory>("Dental Materials & Supplies");
  const [fDesc, setFDesc] = useState("");
  const [fAmount, setFAmount] = useState("");
  const [fMethod, setFMethod] = useState<ExpenseLedgerEntry["paymentMethod"]>("Cash");

  const periodRange = (p: typeof period): [string, string] => {
    if (p === "this_month") return [clinicMonthStartISO(), clinicTodayISO()];
    if (p === "last_month") return [clinicMonthStartISO(-1), clinicMonthEndISO(-1)];
    if (p === "quarter") return [clinicMonthStartISO(-2), clinicTodayISO()];
    return [fromDate, toDate];
  };

  const inRange = (e: ExpenseLedgerEntry, [a, b]: [string, string]) => e.date >= a && e.date <= b;
  const matchesBranchCat = (e: ExpenseLedgerEntry) =>
    (branchFilter === "ALL" || e.branchCode === branchFilter) &&
    (categoryFilter === "ALL" || e.category === categoryFilter);

  const filtered = useMemo(
    () =>
      entries
        .filter((e) => inRange(e, periodRange(period)) && matchesBranchCat(e))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, period, fromDate, toDate, branchFilter, categoryFilter]
  );

  // Hard RBAC: Clinic Owner only
  if (role !== "clinic_owner") {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center space-y-2">
        <Lock className="mx-auto h-8 w-8 text-rose-600" />
        <h2 className="text-xl font-black text-slate-900">
          {isAr ? "صفحة المصروفات للمالك فقط" : "Expenses — Clinic Owner Only"}
        </h2>
      </div>
    );
  }

  const total = filtered.reduce((s, e) => s + e.amountEgp, 0);
  const fixedTotal = filtered
    .filter((e) => EXPENSE_CATEGORIES.find((c) => c.id === e.category)?.fixed)
    .reduce((s, e) => s + e.amountEgp, 0);
  const fixedPct = total ? Math.round((fixedTotal / total) * 100) : 0;

  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    ...c,
    value: filtered.filter((e) => e.category === c.id).reduce((s, e) => s + e.amountEgp, 0),
  }));
  const topCat = [...byCategory].sort((a, b) => b.value - a.value)[0];

  // Month-over-month on selected branch/category filters
  const monthTotal = (m: string) =>
    entries
      .filter((e) => e.date.startsWith(m) && matchesBranchCat(e))
      .reduce((s, e) => s + e.amountEgp, 0);
  const monthTrend = MONTHS.map((m) => ({ m, value: monthTotal(m) }));
  const curIdx = period === "last_month" ? 2 : 3;
  const momPct =
    monthTrend[curIdx - 1].value > 0
      ? Math.round(
          ((monthTrend[curIdx].value - monthTrend[curIdx - 1].value) /
            monthTrend[curIdx - 1].value) *
            100
        )
      : 0;
  const maxMonth = Math.max(...monthTrend.map((x) => x.value), 1);

  const byBranch = (scopedToBranch
    ? BRANCHES.filter((b) => b.code === branchCode)
    : BRANCHES
  ).map((b) => ({
    ...b,
    value: entries
      .filter(
        (e) =>
          e.branchCode === b.code &&
          inRange(e, periodRange(period)) &&
          (categoryFilter === "ALL" || e.category === categoryFilter)
      )
      .reduce((s, e) => s + e.amountEgp, 0),
  }));
  const maxBranch = Math.max(...byBranch.map((b) => b.value), 1);
  const maxCat = Math.max(...byCategory.map((c) => c.value), 1);

  const catColors = [
    "bg-slate-600",
    "bg-rose-500",
    "bg-amber-500",
    "bg-purple-600",
    "bg-sky-500",
    "bg-emerald-600",
  ];

  const monthLabel = (m: string) =>
    new Date(`${m}-01`).toLocaleString(isAr ? "ar-EG" : "en-US", { month: "short" });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(fAmount);
    if (!amt || amt <= 0 || !fDesc.trim()) return;
    if (branchCode !== "ALL" && fBranch !== branchCode) return;
    const entry: ExpenseLedgerEntry = {
      id: `EXP-${Date.now()}`,
      date: fDate,
      branchCode: fBranch,
      category: fCategory,
      description: fDesc.trim(),
      amountEgp: Math.round(amt),
      paymentMethod: fMethod,
    };
    setEntries([entry, ...entries]);
    setFDesc("");
    setFAmount("");
    setShowModal(false);
  };

  const branchName = (c: string) => {
    const b = BRANCHES.find((x) => x.code === c);
    return b ? (isAr ? b.ar : b.en) : c;
  };

  return (
    <section dir={isAr ? "rtl" : "ltr"} className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{isAr ? "المصروفات" : "Expenses"}</h2>
            <p className="text-xs font-semibold text-slate-500">
              {isAr
                ? "للمالك فقط · يؤثر مباشرة على صافي الربح"
                : "Clinic Owner only · feeds Net Profit in Profitability"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFBranch(branchCode === "ALL" ? "BR-A" : branchCode);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F2926] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#153D42] active:scale-95"
          >
            <Plus className="h-4 w-4 text-[#C8A96E]" />
            {isAr ? "تسجيل مصروف جديد" : "+ Record New Expense"}
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <label className="space-y-1 font-bold text-slate-600">
            <span>{isAr ? "الفرع" : "Minya Branch"}</span>
            <select
              value={branchFilter}
              disabled={scopedToBranch}
              onChange={(e) => setBranchFilter(e.target.value as typeof branchFilter)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-bold text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
            >
              {!scopedToBranch && (
                <option value="ALL">{isAr ? "كل الفروع" : "All Branches"}</option>
              )}
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {isAr ? b.ar : b.en}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 font-bold text-slate-600">
            <span>{isAr ? "الفترة" : "Date Range / Month"}</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="this_month">{isAr ? "هذا الشهر" : "This Month"}</option>
              <option value="last_month">{isAr ? "الشهر الماضي" : "Last Month"}</option>
              <option value="quarter">{isAr ? "ربع سنوي" : "Quarter"}</option>
              <option value="custom">{isAr ? "نطاق مخصص" : "Custom Range"}</option>
            </select>
          </label>
          <label className="space-y-1 font-bold text-slate-600 sm:col-span-2 lg:col-span-2">
            <span>{isAr ? "فئة المصروف" : "Expense Category"}</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="ALL">{isAr ? "كل الفئات" : "All Categories"}</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {isAr ? c.ar : c.id}
                </option>
              ))}
            </select>
          </label>
          {period === "custom" && (
            <>
              <label className="space-y-1 font-bold text-slate-600">
                <span>{isAr ? "من" : "From"}</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-bold"
                />
              </label>
              <label className="space-y-1 font-bold text-slate-600">
                <span>{isAr ? "إلى" : "To"}</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-bold"
                />
              </label>
            </>
          )}
        </div>

        {/* KPI Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "إجمالي المصروفات" : "Total Expenses"}</span>
              <Wallet className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
              {fmt(total)} <span className="text-xs text-slate-400">EGP</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "ثابتة مقابل متغيرة" : "Fixed vs. Variable Costs"}</span>
              <PieChart className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 text-2xl font-black text-slate-900 tabular-nums">
              {fixedPct}% / {total ? 100 - fixedPct : 0}%
            </div>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="bg-[#0F2926]" style={{ width: `${fixedPct}%` }} />
              <div className="bg-[#C8A96E]" style={{ width: `${total ? 100 - fixedPct : 0}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 p-4">
            <div className="text-xs font-bold text-slate-500">
              {isAr ? "أعلى فئة مصروف" : "Highest Expense Category"}
            </div>
            <div className="mt-3 text-base font-black text-slate-900">
              {topCat && topCat.value > 0 ? (isAr ? topCat.ar : topCat.id) : "—"}
            </div>
            <div className="text-xs font-bold text-slate-500 tabular-nums">
              {topCat ? fmt(topCat.value) : 0} EGP
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "التغير الشهري" : "Month-over-Month Change"}</span>
              {momPct > 0 ? (
                <TrendingUp className="h-4 w-4 text-rose-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <div
              className={`mt-3 text-2xl font-black tabular-nums ${
                momPct > 0 ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              {momPct > 0 ? "▲ +" : momPct < 0 ? "▼ " : ""}
              {momPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h3 className="text-sm font-black text-slate-900">
            {isAr ? "اتجاه المصروفات الشهري" : "Monthly Expense Trend"}
          </h3>
          <div className="mt-5 grid h-44 grid-cols-4 items-end gap-3">
            {monthTrend.map((x) => (
              <div key={x.m} className="flex h-full flex-col items-center justify-end gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                  {Math.round(x.value / 1000)}k
                </span>
                <div
                  style={{ height: `${Math.max(8, (x.value / maxMonth) * 100)}%` }}
                  className={`w-full max-w-[40px] rounded-t-xl ${
                    x.m === REF_MONTH ? "bg-[#0F2926]" : "bg-[#0F2926]/35"
                  }`}
                />
                <span className="text-[11px] font-bold text-slate-500">{monthLabel(x.m)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h3 className="text-sm font-black text-slate-900">
            {isAr ? "التوزيع حسب الفئة" : "Expense Breakdown by Category"}
          </h3>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {byCategory.map((c, i) => (
              <div
                key={c.id}
                className={catColors[i]}
                style={{ width: `${total ? (c.value / total) * 100 : 0}%` }}
                title={c.id}
              />
            ))}
          </div>
          <div className="mt-4 space-y-2.5 text-xs">
            {byCategory.map((c, i) => (
              <div key={c.id}>
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${catColors[i]}`} />
                    {isAr ? c.ar : c.id}
                  </span>
                  <span className="tabular-nums">
                    {fmt(c.value)}{" "}
                    <span className="text-slate-400">
                      {total ? Math.round((c.value / total) * 100) : 0}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full ${catColors[i]}`}
                    style={{ width: `${(c.value / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md">
          <h3 className="text-sm font-black text-slate-900">
            {isAr ? "مقارنة الفروع" : "Branch-to-Branch Comparison"}
          </h3>
          <div className="mt-5 space-y-4">
            {byBranch.map((b) => (
              <div key={b.code}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{isAr ? b.ar : b.en}</span>
                  <span className="tabular-nums">{fmt(b.value)} EGP</span>
                </div>
                <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#0F2926]"
                    style={{ width: `${(b.value / maxBranch) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900">
            {isAr ? "سجل المصروفات" : "Expense Ledger"}
          </h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 tabular-nums">
            {filtered.length} {isAr ? "حركة" : "entries"}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-2 text-start">{isAr ? "التاريخ" : "Date"}</th>
                <th className="py-2 text-start">{isAr ? "الفرع" : "Branch"}</th>
                <th className="py-2 text-start">{isAr ? "الفئة" : "Category"}</th>
                <th className="py-2 text-start">{isAr ? "المورد / الوصف" : "Vendor / Description"}</th>
                <th className="py-2 text-start">{isAr ? "طريقة الدفع" : "Payment Method"}</th>
                <th className="py-2 text-end">{isAr ? "المبلغ (ج.م)" : "Amount (EGP)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70">
                  <td className="py-3 text-slate-500">{e.date}</td>
                  <td className="py-3 font-semibold text-slate-700">{branchName(e.branchCode)}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700">
                      {isAr ? EXPENSE_CATEGORIES.find((c) => c.id === e.category)?.ar : e.category}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-800">{e.description}</td>
                  <td className="py-3 text-slate-600">{e.paymentMethod}</td>
                  <td className="py-3 text-end font-black text-slate-900">{fmt(e.amountEgp)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center font-bold text-slate-400">
                    {isAr ? "لا توجد مصروفات في هذه الفترة" : "No expenses for the selected filters"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "تسجيل مصروف جديد" : "Record New Expense"}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Close">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1 font-bold text-slate-700">
                <span>{isAr ? "التاريخ" : "Date"}</span>
                <input
                  type="date"
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                />
              </label>
              <label className="space-y-1 font-bold text-slate-700">
                <span>{isAr ? "الفرع" : "Branch"}</span>
                <select
                  value={fBranch}
                  disabled={scopedToBranch}
                  onChange={(e) => setFBranch(e.target.value as typeof fBranch)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {isAr ? b.ar : b.en}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 font-bold text-slate-700">
                <span>{isAr ? "الفئة" : "Category"}</span>
                <select
                  value={fCategory}
                  onChange={(e) => setFCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isAr ? c.ar : c.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 font-bold text-slate-700">
                <span>{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                <select
                  value={fMethod}
                  onChange={(e) => setFMethod(e.target.value as typeof fMethod)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                >
                  <option value="Cash">{isAr ? "نقدي" : "Cash"}</option>
                  <option value="Bank Transfer">{isAr ? "تحويل بنكي" : "Bank Transfer"}</option>
                  <option value="InstaPay">{isAr ? "إنستاباي" : "InstaPay"}</option>
                  <option value="Card">{isAr ? "بطاقة بنكية" : "Card"}</option>
                </select>
              </label>
              <label className="col-span-2 space-y-1 font-bold text-slate-700">
                <span>{isAr ? "المورد / الوصف" : "Vendor / Description"}</span>
                <input
                  type="text"
                  required
                  value={fDesc}
                  onChange={(e) => setFDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                />
              </label>
              <label className="col-span-2 space-y-1 font-bold text-slate-700">
                <span>{isAr ? "المبلغ (ج.م)" : "Amount (EGP)"}</span>
                <input
                  type="number"
                  min={1}
                  required
                  value={fAmount}
                  onChange={(e) => setFAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-black tabular-nums"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0F2926] px-5 py-2 text-xs font-extrabold text-white"
              >
                {isAr ? "حفظ المصروف" : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
