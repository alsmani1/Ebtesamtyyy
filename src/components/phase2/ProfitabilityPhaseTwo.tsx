"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Printer,
  Calendar,
  TrendingUp,
  CheckCircle2,
  MinusCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Lock,
} from "lucide-react";
import type { Phase2Role } from "./FinanceCenterPhaseTwo";
import { useSharedExpenses } from "./OwnerExpensesPage";
import { useUnifiedFinance } from "@/lib/unified-finance-store";
import {
  clinicDateText,
  clinicMonthKey,
  clinicMonthLabel,
  clinicMonthStartISO,
  clinicTodayISO,
} from "@/lib/clinic-clock";
import { financeKpis, monthlyPerformance, serviceProfitRows } from "@/lib/clinic-finance";
import { MATERIAL_UNIT_COST, SERVICES } from "@/lib/clinic-pricing";
import { INITIAL_INVENTORY_ITEMS } from "./InventorySuppliesPhaseTwo";
import {
  INITIAL_LAB_ORDERS,
  type LabOrderRecord,
} from "./LabManagementPhaseTwo";
import { LAB_ORDERS_KEY, readLocalJson } from "@/lib/use-persisted-state";
import { MINYA_BRANCHES } from "@/config/minya-clinic-store";
import type { FinanceBranch } from "@/lib/clinic-costs";

export default function ProfitabilityPhaseTwo({
  role = "clinic_owner",
  branchCode = "ALL",
}: {
  role?: Phase2Role;
  branchCode?: FinanceBranch | "ALL";
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const branchLabel =
    branchCode === "ALL"
      ? isAr
        ? "كل الفروع"
        : "All branches"
      : MINYA_BRANCHES.find((b) => b.code === branchCode)?.[
          isAr ? "nameAr" : "nameEn"
        ] ?? branchCode;

  const activeDoctor = MINYA_BRANCHES.find((b) => b.code === branchCode)?.doctors[0];
  const statementDoctor =
    branchCode === "ALL"
      ? isAr
        ? "كل الأطباء"
        : "All dentists"
      : (isAr ? activeDoctor?.nameAr : activeDoctor?.nameEn) ?? branchLabel;

  const sixMonthPerformance = monthlyPerformance(6, branchCode).map((month, index) => ({
    collected: month.collected,
    costs: month.costs,
    profit: month.profit,
    monthAr: clinicMonthLabel(index - 5, "ar"),
    monthEn: clinicMonthLabel(index - 5, "en"),
  }));
  const expiringSoonStockValue = INITIAL_INVENTORY_ITEMS.filter(
    (item) =>
      item.isExpiringSoon && (branchCode === "ALL" || item.branchCode === branchCode)
  ).reduce((sum, item) => sum + item.valueEgp, 0);
  const overdueLabOrders = readLocalJson<LabOrderRecord[]>(
    LAB_ORDERS_KEY,
    INITIAL_LAB_ORDERS
  ).filter(
    (ord) =>
      ord.isOverdue && (branchCode === "ALL" || ord.branchCode === branchCode)
  ).length;

  // Owner-recorded expenses (from /owner/expenses) reduce Net Profit for the current month
  const { entries: sharedExpenseEntries } = useSharedExpenses();
  const { stats: financeStats } = useUnifiedFinance();
  const recordedExtraExpenses = sharedExpenseEntries
    .filter(
      (e) =>
        /^EXP-\d{13}$/.test(e.id) &&
        e.date.startsWith(clinicMonthKey()) &&
        (branchCode === "ALL" || e.branchCode === branchCode)
    )
    .reduce((s, e) => s + e.amountEgp, 0);
  const kpis = financeKpis(branchCode);
  const serviceRows = serviceProfitRows(0, branchCode);
  const totalCostsValue = kpis.costs + recordedExtraExpenses;
  const branchDelta = branchCode === "ALL" ? financeStats.delta : 0;
  const liveCollectedRevenue = kpis.monthCollected + branchDelta;
  const netProfitValue = liveCollectedRevenue - totalCostsValue;
  const profitMarginPct = liveCollectedRevenue
    ? Math.round((netProfitValue / liveCollectedRevenue) * 100)
    : 0;
  const materialsAndLab = kpis.materialsPurchased + kpis.labFees;
  const operatingExpenses = Math.max(0, kpis.costs - kpis.payroll - materialsAndLab);
  const costShare = (value: number) =>
    liveCollectedRevenue ? Math.max(0, Math.round((value / liveCollectedRevenue) * 100)) : 0;
  const sixMonthCollected = sixMonthPerformance.reduce((sum, m) => sum + m.collected, 0);
  const sixMonthAverage = Math.round(sixMonthCollected / Math.max(1, sixMonthPerformance.length));
  const bestMonth = sixMonthPerformance.reduce(
    (best, m) => (m.collected > best.collected ? m : best),
    sixMonthPerformance[0] ?? { collected: 0, monthAr: "", monthEn: "", costs: 0, profit: 0 }
  );
  const breakEvenMonthly = Math.round(
    sixMonthPerformance.reduce((sum, m) => sum + m.costs, 0) / Math.max(1, sixMonthPerformance.length)
  );
  const prevMonth = sixMonthPerformance[sixMonthPerformance.length - 2];
  const currentMonth = sixMonthPerformance[sixMonthPerformance.length - 1];
  const pctChange = (cur: number, prev: number) =>
    prev ? Math.round(((cur - prev) / Math.abs(prev)) * 100) : 0;
  const profitChangePct = pctChange(currentMonth?.profit ?? 0, prevMonth?.profit ?? 0);
  const collectedChangePct = pctChange(currentMonth?.collected ?? 0, prevMonth?.collected ?? 0);
  const costsChangePct = pctChange(currentMonth?.costs ?? 0, prevMonth?.costs ?? 0);
  const chartMax = Math.max(
    1,
    ...sixMonthPerformance.flatMap((m) => [m.collected, m.costs, Math.abs(m.profit)])
  );
  const [activeTab, setActiveTab] = useState<
    "summary" | "income_statement" | "costs" | "services_doctors" | "expenses" | "payroll"
  >("summary");
  const [chartSeries, setChartSeries] = useState<"collected" | "costs" | "profit">("collected");
  const [showAllServiceBreakdown, setShowAllServiceBreakdown] = useState(false);

  // Interactive Doctor Pay Rule Calculator (Image 6)
  const [implantPrice, setImplantPrice] = useState(SERVICES.implant.price);
  const [fixtureCost, setFixtureCost] = useState(MATERIAL_UNIT_COST.fixture);
  const [implantPercentage, setImplantPercentage] = useState(45);
  const [shareCap, setShareCap] = useState(
    Math.round((SERVICES.implant.price - MATERIAL_UNIT_COST.fixture) * 0.4)
  );

  // Export Toast Feedback (Image 7)
  const [exportedReportMsg, setExportedReportMsg] = useState<string | null>(null);

  // Strictly enforce RBAC: Profit and Profitability is Owner-only
  if (role !== "clinic_owner") {
    return null;
  }

  const netBeforePct = Math.max(0, implantPrice - fixtureCost);
  const rawDoctorShare = Math.round((netBeforePct * implantPercentage) / 100);
  const finalDoctorShare = Math.min(shareCap, rawDoctorShare);

  const handleExportReport = (reportTitle: string, format: string) => {
    setExportedReportMsg(`${reportTitle} (${format})`);
    if (format === "Print" && typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "الأرباح والربحية" : "Profit and Profitability"}
      className="space-y-6"
    >
      {/* MAIN PROFITABILITY DASHBOARD — Exact match to Image 5 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isAr ? "الأرباح والربحية" : "Profit & Profitability"}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {isAr
                ? `${clinicDateText(clinicMonthStartISO(), "ar")} – ${clinicDateText(clinicTodayISO(), "ar")}`
                : `${clinicDateText(clinicMonthStartISO(), "en")} – ${clinicDateText(clinicTodayISO(), "en")}`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              {isAr ? "طباعة" : "Print"}
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{branchLabel}</span>
            </div>
          </div>
        </div>

        {/* 6 Sub-Tabs Bar — Exact match to Image 5 */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
          {[
            { id: "summary", labelAr: "الملخّص", labelEn: "Summary" },
            { id: "income_statement", labelAr: "قائمة الدخل", labelEn: "Income Statement" },
            { id: "costs", labelAr: "التكاليف", labelEn: "Costs" },
            { id: "services_doctors", labelAr: "الخدمات والأطباء", labelEn: "Services & Doctors" },
            { id: "expenses", labelAr: "المصروفات", labelEn: "Expenses" },
            { id: "payroll", labelAr: "الرواتب", labelEn: "Payroll" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* 4 Top KPI Cards — Exact match to Image 5 */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* KPI 1: Net profit (collected − recorded costs) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "صافي الربح" : "Net Profit"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-emerald-700">{netProfitValue.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">
                {isAr ? `هامش ${profitMarginPct}%` : `Margin ${profitMarginPct}%`}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 tabular-nums ${
                  profitChangePct >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {profitChangePct >= 0 ? "▲" : "▼"} {Math.abs(profitChangePct)}%
              </span>
            </div>
          </div>

          {/* KPI 2: Collected revenue (ledger payments) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "الإيراد المحصّل" : "Collected Revenue"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">{liveCollectedRevenue.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">
                {isAr
                  ? `تحصيل ${kpis.collectionRatePercent}% من فواتير الفترة`
                  : `${kpis.collectionRatePercent}% collected of period`}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 tabular-nums ${
                  collectedChangePct >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {collectedChangePct >= 0 ? "▲" : "▼"} {Math.abs(collectedChangePct)}%
              </span>
            </div>
          </div>

          {/* KPI 3: Total costs (sum of recorded expenses) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "إجمالي التكاليف" : "Total Costs"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <MinusCircle className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">{totalCostsValue.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">
                {isAr ? `${costShare(totalCostsValue)}% من الإيراد` : `${costShare(totalCostsValue)}% of revenue`}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 tabular-nums ${
                  costsChangePct <= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {costsChangePct >= 0 ? "▲" : "▼"} {Math.abs(costsChangePct)}%
              </span>
            </div>
          </div>

          {/* KPI 4: Patient arrears from open invoice balances */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "مستحقات عند المرضى" : "Patient Arrears"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">{kpis.arrears.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">
                {isAr
                  ? `${kpis.debtorsCount} مريضاً · منها ${kpis.insuranceReceivables.toLocaleString()} تأمين`
                  : `${kpis.debtorsCount} patients · ${kpis.insuranceReceivables.toLocaleString()} insurance`}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW SPLIT: "أين ذهب الإيراد" & "الأداء الشهري آخر 6 شهور" — Exact match to Image 5 */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card Left (in RTL right): Where the revenue went */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "أين ذهب الإيراد" : "Where the Revenue Went"}
              </h3>
              <span className="text-xs font-bold text-slate-400 tabular-nums">
                {liveCollectedRevenue.toLocaleString()} {isAr ? "ج.م" : "EGP"}
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-amber-500" style={{ width: `${costShare(materialsAndLab)}%` }} />
              <div className="h-full bg-rose-500" style={{ width: `${costShare(kpis.payroll)}%` }} />
              <div className="h-full bg-purple-600" style={{ width: `${costShare(operatingExpenses)}%` }} />
              <div
                className="h-full bg-emerald-600"
                style={{ width: `${Math.max(0, profitMarginPct)}%` }}
              />
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span>
                    {isAr
                      ? "خامات ومعامل (مشتريات مسجلة)"
                      : "Materials & lab purchases (recorded)"}
                  </span>
                </div>
                <div className="font-black text-slate-900 tabular-nums">
                  {materialsAndLab.toLocaleString()}{" "}
                  <span className="text-slate-400 font-semibold">{costShare(materialsAndLab)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span>
                    {isAr ? "رواتب الفريق (مسجلة)" : "Team salaries (recorded)"}
                  </span>
                </div>
                <div className="font-black text-slate-900 tabular-nums">
                  {kpis.payroll.toLocaleString()}{" "}
                  <span className="text-slate-400 font-semibold">{costShare(kpis.payroll)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                  <span>{isAr ? "مصروفات التشغيل" : "Operating expenses"}</span>
                </div>
                <div className="font-black text-slate-900 tabular-nums">
                  {operatingExpenses.toLocaleString()}{" "}
                  <span className="text-slate-400 font-semibold">{costShare(operatingExpenses)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                <div className="flex items-center gap-2 font-black text-emerald-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span>{isAr ? "صافي الربح" : "Net Profit"}</span>
                </div>
                <div className="font-black text-emerald-700 tabular-nums">
                  {netProfitValue.toLocaleString()}{" "}
                  <span className="text-emerald-600 font-bold">{profitMarginPct}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-3 text-[11px] font-semibold text-slate-400 tabular-nums">
              <span>
                {isAr
                  ? `نقطة التعادل ${breakEvenMonthly.toLocaleString()} شهرياً · متوسط الفاتورة ${kpis.monthAverageInvoice.toLocaleString()}`
                  : `Break-even ${breakEvenMonthly.toLocaleString()}/mo · Avg invoice ${kpis.monthAverageInvoice.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Card Right: Monthly performance — last 6 months */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isAr ? "الأداء الشهري" : "Monthly Performance"}{" "}
                  <span className="text-xs font-semibold text-slate-400">
                    {isAr ? "آخر 6 شهور" : "Last 6 months"}
                  </span>
                </h3>
                <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-2xl font-black text-slate-900">{sixMonthCollected.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">
                  {isAr
                    ? `متوسط ${sixMonthAverage.toLocaleString()} شهرياً · الأفضل ${bestMonth.monthAr}`
                    : `Avg ${sixMonthAverage.toLocaleString()}/mo · Best ${bestMonth.monthEn}`}
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartSeries("collected")}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    chartSeries === "collected"
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isAr ? "المحصّل" : "Collected"}
                </button>
                <button
                  type="button"
                  onClick={() => setChartSeries("costs")}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    chartSeries === "costs"
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isAr ? "التكاليف" : "Costs"}
                </button>
                <button
                  type="button"
                  onClick={() => setChartSeries("profit")}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    chartSeries === "profit"
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isAr ? "صافي الربح" : "Net Profit"}
                </button>
              </div>
            </div>

            {/* 6-Month Bar Chart */}
            <div className="mt-5 grid grid-cols-6 items-end gap-3 pt-4 h-36">
              {sixMonthPerformance.map((m, idx) => {
                const value =
                  chartSeries === "collected"
                    ? m.collected
                    : chartSeries === "costs"
                    ? m.costs
                    : m.profit;
                const heightPct = Math.max(18, Math.round((Math.abs(value) / chartMax) * 100));
                const isLast = idx === sixMonthPerformance.length - 1;
                return (
                  <div key={m.monthEn} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                      {Math.round(value / 1000)}k
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[34px] rounded-t-xl transition-all ${
                        isLast ? "bg-blue-600" : "bg-blue-300/80 hover:bg-blue-400"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-500">
                      {isAr ? m.monthAr : m.monthEn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW SPLIT: "أعلى الخدمات ربحاً" & "يحتاج انتباهك" — Exact match to Image 5 */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card: أعلى الخدمات ربحاً */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "أعلى الخدمات ربحاً" : "Most Profitable Services"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAllServiceBreakdown((prev) => !prev)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {showAllServiceBreakdown
                  ? isAr
                    ? "عرض المختصر"
                    : "Compact View"
                  : isAr
                  ? "كل الخدمات (بعد الخامات والمعمل ونسبة الطبيب) ←"
                  : "All Services (After materials, lab & doctor pay) →"}
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="py-2 text-start">{isAr ? "الخدمة" : "Service"}</th>
                    <th className="py-2 text-start">{isAr ? "الإيراد" : "Revenue"}</th>
                    {showAllServiceBreakdown && (
                      <>
                        <th className="py-2 text-start">{isAr ? "خامات+معمل" : "Mat+Lab"}</th>
                        <th className="py-2 text-start">{isAr ? "نسبة الطبيب" : "Dentist"}</th>
                      </>
                    )}
                    <th className="py-2 text-start">{isAr ? "الربح" : "Profit"}</th>
                    <th className="py-2 text-end">{isAr ? "الهامش" : "Margin"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {(showAllServiceBreakdown
                    ? [...serviceRows].sort((a, b) => b.netProfit - a.netProfit)
                    : [...serviceRows].sort((a, b) => b.netProfit - a.netProfit).slice(0, 3)
                  ).map((srv) => (
                    <tr key={srv.serviceKey} className="hover:bg-slate-50/70">
                      <td className="py-3 font-bold text-slate-900">
                        {isAr ? srv.nameAr : srv.nameEn}{" "}
                        <span className="text-slate-400 font-semibold">×{srv.count}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {srv.revenue.toLocaleString()}
                      </td>
                      {showAllServiceBreakdown && (
                        <>
                          <td className="py-3 text-rose-600">
                            −{(srv.materialsCost + srv.labCost).toLocaleString()}
                          </td>
                          <td className="py-3 text-purple-700">
                            −{srv.doctorPay.toLocaleString()}
                          </td>
                        </>
                      )}
                      <td className="py-3 font-black text-emerald-700">
                        {srv.netProfit.toLocaleString()}
                      </td>
                      <td className="py-3 text-end">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-black text-emerald-700">
                          {srv.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: يحتاج انتباهك */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-900">
                {isAr ? "يحتاج انتباهك" : "Needs Your Attention"}
              </h3>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>
                    {isAr
                      ? "مستحقات أقدم من 90 يوماً"
                      : "Arrears older than 90 days"}
                  </span>
                </div>
                <span className="font-black text-slate-900 tabular-nums">
                  {kpis.aging.d90plus.toLocaleString()}{" "}
                  <span className="text-slate-400 font-semibold">{isAr ? "ج.م" : "EGP"}</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>
                    {isAr
                      ? "طلبات معمل تجاوزت موعدها ولم تُسلَّم"
                      : "Overdue lab orders not yet delivered"}
                  </span>
                </div>
                <span className="font-black text-slate-900 tabular-nums">
                  {isAr ? `${overdueLabOrders} طلبات` : `${overdueLabOrders} orders`}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>
                    {isAr
                      ? "أصناف تنتهي صلاحيتها خلال 60 يوماً"
                      : "Inventory items expiring within 60 days"}
                  </span>
                </div>
                <span className="font-black text-slate-900 tabular-nums">
                  {expiringSoonStockValue.toLocaleString()}{" "}
                  <span className="text-slate-400 font-semibold">{isAr ? "ج.م" : "EGP"}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SPLIT ROW: Image 6 ("Pay rule — Dr. Ahmed") & Image 7 ("Reports you export and print") */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* IMAGE 6 EXACT CARD: Pay rule — Dr. Ahmed */}
        <div
          dir="ltr"
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Pay rule — Dr. Ahmed</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              <Lock className="h-3 w-3" />
              Frozen on the invoice
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Row 1: Base percentage -> 40% */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  %
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">Base percentage</div>
                  <div className="text-xs text-slate-500">On the invoice net</div>
                </div>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-black text-blue-700 tabular-nums">
                40%
              </span>
            </div>

            {/* Row 2: Implants -> 45% */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">
                  I
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">Implants</div>
                  <div className="text-xs text-slate-500">
                    Fixture cost deducted before the percentage
                  </div>
                </div>
              </div>
              <span className="rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-black text-purple-700 tabular-nums">
                {implantPercentage}%
              </span>
            </div>

            {/* Row 3: Share cap */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-black text-white">
                  S
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">Share cap</div>
                  <div className="text-xs text-slate-500">Per case</div>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-black text-slate-700 tabular-nums">
                EGP {shareCap.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bottom Calculation Summary Bar — Exact match to Image 6 */}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-blue-50/70 px-4 py-3.5">
            <span className="text-xs font-black text-slate-800 tabular-nums">
              Implant {implantPrice.toLocaleString()} – fixture {fixtureCost.toLocaleString()} →{" "}
              {implantPercentage}%
            </span>
            <span className="text-base font-black text-blue-600 tabular-nums">
              EGP {finalDoctorShare.toLocaleString()}
            </span>
          </div>
        </div>

        {/* IMAGE 7 EXACT CARD: Reports you export and print */}
        <div
          dir="ltr"
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Reports you export and print</h3>
            {exportedReportMsg && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Exported: {exportedReportMsg}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {/* Row 1: Dentist statement -> PDF | Excel */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  S
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">Dentist statement</div>
                  <div className="text-xs text-slate-500">
                    {clinicMonthLabel(-1, "en")} · {statementDoctor}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportReport("Dentist statement", "PDF")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExportReport("Dentist statement", "Excel")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Excel
                </button>
              </div>
            </div>

            {/* Row 2: Service profitability -> PDF | Print */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                  W
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">Service profitability</div>
                  <div className="text-xs text-slate-500">Last 3 months</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportReport("Service profitability", "PDF")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExportReport("Service profitability", "Print")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Print
                </button>
              </div>
            </div>

            {/* Row 3: Daily report -> Print (blue button) */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">
                  D
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">Daily report</div>
                  <div className="text-xs text-slate-500">Today — close your day with it</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleExportReport("Daily report", "Print")}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
