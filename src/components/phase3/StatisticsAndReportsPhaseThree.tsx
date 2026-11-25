"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  BarChart3,
  Printer,
  Download,
  RefreshCw,
  Pin,
  Plus,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  Lock,
} from "lucide-react";
import type { Phase2Role } from "../phase2/FinanceCenterPhaseTwo";
import { getMinyaBranchMetrics, MINYA_BRANCHES } from "@/config/minya-clinic-store";
import { clinicDateISO, clinicDateText, clinicMonthStartISO, clinicTodayISO } from "@/lib/clinic-clock";
import {
  branchPatientStats,
  doctorPerformance,
  financeKpis,
  monthPerformance,
  paymentsBetween,
  serviceProfitRows,
} from "@/lib/clinic-finance";
import type { FinanceBranch } from "@/lib/clinic-costs";
import { listPatients } from "@/lib/patients-db";
import { INITIAL_LAB_ORDERS, type LabOrderRecord } from "../phase2/LabManagementPhaseTwo";
import { INITIAL_INVENTORY_ITEMS } from "../phase2/InventorySuppliesPhaseTwo";
import { INITIAL_CRM_LEADS } from "./LeadFollowupCrmPhaseThree";
import {
  INVENTORY_ITEMS_KEY,
  LAB_ORDERS_KEY,
  readLocalJson,
} from "@/lib/use-persisted-state";

interface CustomPinnedIndicator {
  id: string;
  titleAr: string;
  titleEn: string;
  valueDisplay: string;
  conditionAr: string;
  conditionEn: string;
  isFinancial: boolean;
}

export default function StatisticsAndReportsPhaseThree({
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

  const kpis = financeKpis(branchCode);
  const branchMetrics = getMinyaBranchMetrics(branchCode);
  const patientStats = branchPatientStats(branchCode);
  const currentMonthPerf = monthPerformance(0, branchCode);
  const previousMonthPerf = monthPerformance(-1, branchCode);
  const pctChange = (cur: number, prev: number) =>
    prev ? Math.round(((cur - prev) / Math.abs(prev)) * 100) : 0;
  const collectedChangePct = pctChange(currentMonthPerf.collected, previousMonthPerf.collected);
  const profitChangePct = pctChange(currentMonthPerf.profit, previousMonthPerf.profit);
  const implantRevenue = serviceProfitRows(0, branchCode)
    .filter((row) => row.serviceKey === "implant")
    .reduce((sum, row) => sum + row.revenue, 0);
  const weekStart = clinicDateISO(-6);
  const weekPayments = paymentsBetween(weekStart, clinicTodayISO(), branchCode);
  const weekCollected = weekPayments.reduce((sum, p) => sum + p.amount, 0);
  const weekVisits = new Set(weekPayments.map((p) => p.invoiceId)).size;

  const lateLabOrders = readLocalJson<LabOrderRecord[]>(
    LAB_ORDERS_KEY,
    INITIAL_LAB_ORDERS
  ).filter(
    (ord) =>
      ord.isOverdue && (branchCode === "ALL" || ord.branchCode === branchCode)
  ).length;
  const branchInventory = readLocalJson<typeof INITIAL_INVENTORY_ITEMS>(
    INVENTORY_ITEMS_KEY,
    INITIAL_INVENTORY_ITEMS
  ).filter((item) => branchCode === "ALL" || item.branchCode === branchCode);
  const itemsToOrder = branchInventory.filter(
    (item) => item.status === "low" || item.status === "out"
  ).length;
  const branchLeads = INITIAL_CRM_LEADS.filter(
    (lead) => branchCode === "ALL" || lead.branchCode === branchCode
  );
  const leadsFollowing = branchLeads.filter(
    (lead) => lead.stage !== "converted" && lead.stage !== "not_interested"
  ).length;
  const branchPatients = listPatients().filter(
    (patient) => branchCode === "ALL" || patient.branchCode === branchCode
  );
  const ageBuckets = [
    { label: "<18", min: 0, max: 17 },
    { label: "18–27", min: 18, max: 27 },
    { label: "28–37", min: 28, max: 37 },
    { label: "38–47", min: 38, max: 47 },
    { label: "48+", min: 48, max: 200 },
  ].map((bucket) => ({
    ...bucket,
    count: branchPatients.filter(
      (patient) =>
        typeof patient.age === "number" &&
        patient.age >= bucket.min &&
        patient.age <= bucket.max
    ).length,
  }));
  const maxAgeCount = Math.max(1, ...ageBuckets.map((bucket) => bucket.count));
  const sourceCounts = [
    { name: "WhatsApp", matches: ["واتساب"], color: "bg-emerald-600" },
    { name: "Website", matches: ["الموقع"], color: "bg-blue-600" },
    { name: "Instagram", matches: ["إنستجرام"], color: "bg-purple-600" },
    { name: "Facebook", matches: ["فيسبوك"], color: "bg-sky-600" },
    { name: "Google", matches: ["جوجل"], color: "bg-amber-500" },
  ]
    .map((source) => ({
      ...source,
      count: branchLeads.filter((lead) => source.matches.includes(lead.sourceAr)).length,
    }))
    .filter((source) => source.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const maxSourceCount = Math.max(1, ...sourceCounts.map((source) => source.count));
  const completionRate = branchMetrics.completionRatePercent;
  const noShowRate = branchMetrics.noShowRatePercent;
  const retentionPct = patientStats.activePatients
    ? Math.round((patientStats.returningPatients / patientStats.activePatients) * 100)
    : 0;

  const [pinnedIndicators, setPinnedIndicators] = useState<CustomPinnedIndicator[]>(() => [
    {
      id: "IND-1",
      titleAr: "إيراد زراعة الأسنان (هذا الشهر)",
      titleEn: "Implant Revenue (This Month)",
      valueDisplay: `EGP ${implantRevenue.toLocaleString()}`,
      conditionAr: "البيانات: الفواتير · الشرط: زراعة أسنان",
      conditionEn: "Data: Invoices · Condition: Implants",
      isFinancial: true,
    },
    {
      id: "IND-2",
      titleAr: "التحصيل هذا الأسبوع",
      titleEn: "Collected (This Week)",
      valueDisplay: `EGP ${weekCollected.toLocaleString()}`,
      conditionAr: "البيانات: المدفوعات · آخر 7 أيام",
      conditionEn: "Data: Payments · Last 7 days",
      isFinancial: true,
    },
  ]);
  const [builderData, setBuilderData] = useState<"appointments" | "revenue" | "patients">(
    role === "doctor" ? "appointments" : "revenue"
  );
  const [builderPeriod, setBuilderPeriod] = useState<"today" | "week" | "month">("month");
  const [builderCondition, setBuilderCondition] = useState("completed");

  // Patient has no access to clinic statistics
  if (role === "patient") {
    return null;
  }

  const canSeeFinancialIndicators = role === "clinic_owner";

  const visiblePinnedIndicators = pinnedIndicators.filter((ind) =>
    ind.isFinancial ? canSeeFinancialIndicators : true
  );

  const handlePinCustomIndicator = () => {
    const isFin = builderData === "revenue";
    if (isFin && !canSeeFinancialIndicators) return;

    const newInd: CustomPinnedIndicator = {
      id: `IND-${Date.now()}`,
      titleAr:
        builderData === "revenue"
          ? `مؤشر الإيراد المخصص (${builderPeriod === "today" ? "اليوم" : "هذا الشهر"})`
          : builderData === "appointments"
          ? `مؤشر المواعيد المكتملة (${builderPeriod === "today" ? "اليوم" : "هذا الشهر"})`
          : "مؤشر المرضى الجدد المخصص",
      titleEn:
        builderData === "revenue"
          ? `Custom Revenue Indicator (${builderPeriod})`
          : builderData === "appointments"
          ? `Custom Completed Visits (${builderPeriod})`
          : `Custom New Patients (${builderPeriod})`,
      valueDisplay:
        builderData === "revenue"
          ? `EGP ${(builderPeriod === "today"
              ? kpis.todayCollected
              : builderPeriod === "week"
              ? weekCollected
              : kpis.monthCollected
            ).toLocaleString()}`
          : builderData === "appointments"
          ? `${builderPeriod === "today" ? kpis.todayInvoices : builderPeriod === "week" ? weekVisits : kpis.monthInvoiceCount} visits`
          : `${kpis.activePatients} patients`,
      conditionAr: `البيانات: ${builderData} · الشرط: ${builderCondition}`,
      conditionEn: `Data: ${builderData} · Condition: ${builderCondition}`,
      isFinancial: isFin,
    };

    setPinnedIndicators((prev) => [newInd, ...prev]);
  };

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "الإحصائيات والتقارير الجاهزة" : "Statistics and Ready-Made Reports"}
      className="space-y-6"
    >
      {/* MAIN STATISTICS BOARD — Exact match to Image 11 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isAr ? "الإحصائيات" : "Statistics & Analytics"}
            </h2>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-black text-teal-700">
              {branchLabel}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {isAr
                ? `هذا الشهر · ${clinicDateText(clinicMonthStartISO(), "ar", false)} – ${clinicDateText(clinicTodayISO(), "ar", false)}`
                : `This Month · ${clinicDateText(clinicMonthStartISO(), "en", false)} – ${clinicDateText(clinicTodayISO(), "en", false)}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
              {isAr ? "هذا الشهر" : "This Month"} ▾
            </span>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
              {isAr ? "كل الأطباء" : "All Dentists"} ▾
            </span>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
              {isAr ? "كل الخدمات" : "All Services"} ▾
            </span>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
              {isAr ? "كل المصادر" : "All Sources"} ▾
            </span>
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Needs Your Attention Alert Strip — Exact match to Image 11 */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 font-black text-slate-900">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {isAr ? "يحتاج انتباهك" : "Needs attention"}
          </span>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 tabular-nums">
            {isAr ? `مواعيد اليوم ${kpis.todayInvoices}` : `Today's visits ${kpis.todayInvoices}`}
          </span>

          {canSeeFinancialIndicators && (
            <>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 tabular-nums">
                {isAr
                  ? `مستحقات عند المرضى ${branchMetrics.outstandingArrearsEgp.toLocaleString()} ج.م`
                  : `Patient arrears EGP ${branchMetrics.outstandingArrearsEgp.toLocaleString()}`}
              </span>
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 tabular-nums">
                {isAr
                  ? `متأخر +90 يوم ${kpis.aging.d90plus.toLocaleString()} ج.م`
                  : `90+ days overdue EGP ${kpis.aging.d90plus.toLocaleString()}`}
              </span>
            </>
          )}

          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700 tabular-nums">
            {isAr ? `أصناف تحتاج طلباً ${itemsToOrder}` : `Items to order ${itemsToOrder}`}
          </span>

          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 tabular-nums">
            {isAr ? `طلبات معمل متأخرة ${lateLabOrders}` : `Late lab orders ${lateLabOrders}`}
          </span>

          <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-purple-700 tabular-nums">
            {isAr ? `عملاء قيد المتابعة ${leadsFollowing}` : `Leads following up ${leadsFollowing}`}
          </span>
        </div>

        {/* 11-Card KPI Grid — Exact match to Image 11 (Respecting financial permissions) */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canSeeFinancialIndicators && (
            <>
              {/* Hero 2-col Card: total invoiced revenue */}
              <div className="sm:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{isAr ? "إجمالي الإيراد المفوتر" : "Total Invoiced Revenue"}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">
                    {isAr ? "ثابت" : "Steady"}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-2xl font-black text-slate-900">{kpis.monthInvoiced.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? `${kpis.monthInvoiceCount} فاتورة · متوسط ${kpis.monthAverageInvoice.toLocaleString()} ج.م`
                    : `${kpis.monthInvoiceCount} invoices · avg EGP ${kpis.monthAverageInvoice.toLocaleString()}`}
                </p>
                <svg viewBox="0 0 320 48" className="mt-3 h-11 w-full">
                  <path
                    d="M 5 38 L 45 44 L 90 32 L 135 28 L 175 39 L 210 14 L 250 32 L 285 26 L 315 41 L 315 48 L 5 48 Z"
                    fill="rgba(37, 99, 235, 0.12)"
                  />
                  <path
                    d="M 5 38 L 45 44 L 90 32 L 135 28 L 175 39 L 210 14 L 250 32 L 285 26 L 315 41"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Card: collected revenue */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{isAr ? "المحصّل فعلياً" : "Actually Collected"}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                      collectedChangePct >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {collectedChangePct >= 0 ? "▲ +" : "▼ "}
                    {Math.abs(collectedChangePct)}%
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-2xl font-black text-slate-900">{kpis.monthCollected.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">
                    {isAr
                      ? `تحصيل فواتير الفترة ${kpis.collectionRatePercent}%`
                      : `${kpis.collectionRatePercent}% period invoice collection`}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${kpis.collectionRatePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card: net profit */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{isAr ? "صافي الربح" : "Net Profit"}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                      profitChangePct >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {profitChangePct >= 0 ? "▲ +" : "▼ "}
                    {Math.abs(profitChangePct)}%
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-2xl font-black text-slate-900">{kpis.netProfit.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAr
                    ? `هامش ${kpis.marginPercent}% · بعد كل التكاليف`
                    : `${kpis.marginPercent}% margin · after all costs`}
                </div>
              </div>
            </>
          )}

          {/* Card: completion rate */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "معدّل الإنجاز" : "Completion Rate"}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {branchLabel}
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">{completionRate}%</div>
            <div className="mt-2 text-[11px] text-slate-400">
              {isAr
                ? `${kpis.todayInvoices} موعد اليوم · حسب سجل الفرع`
                : `${kpis.todayInvoices} visits today · branch ledger`}
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal-600" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* Card: cancellations & no-shows */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "الإلغاء والتغيّب" : "Cancellations & No-Shows"}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {branchLabel}
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">{noShowRate}%</div>
            <div className="mt-2 text-[11px] text-slate-400">
              {isAr
                ? `${kpis.todayInvoices} موعد اليوم · ${noShowRate}% لم يحضر`
                : `${kpis.todayInvoices} visits today · ${noShowRate}% no-show`}
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-rose-500" style={{ width: `${noShowRate}%` }} />
            </div>
          </div>

          {/* Card: new patients */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "مرضى جدد" : "New Patients"}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 tabular-nums">
                {isAr ? `${branchPatients.length} ملف` : `${branchPatients.length} files`}
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">{patientStats.newPatients}</div>
            <div className="mt-2 text-[11px] text-slate-400">
              {isAr ? "خلال هذا الشهر" : "During this month"}
            </div>
          </div>

          {/* Card: retention rate */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "معدّل عودة المرضى" : "Patient Retention Rate"}</span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">{retentionPct}%</div>
            <div className="mt-2 text-[11px] text-slate-400">
              {isAr
                ? `${patientStats.returningPatients} عائد من ${patientStats.activePatients} نشط`
                : `${patientStats.returningPatients} returning of ${patientStats.activePatients} active`}
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-purple-600" style={{ width: `${retentionPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SPLIT ROW: Image 12 ("Ready-made reports") & Custom Pinned Indicator Builder ("Indicators you build yourself") */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* IMAGE 12 EXACT CARD: Ready-made reports */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">
              {isAr ? "التقارير الجاهزة" : "Ready-made reports"}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {isAr
                ? "أعمار المرضى، المصادر، وأداء الأطباء"
                : "Patients, sources & dentist performance"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Left Box: Patient ages bar chart (sm:col-span-5) */}
            <div className="sm:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col justify-between">
              <div className="text-xs font-bold text-slate-500">
                {isAr ? "أعمار المرضى" : "Patient ages"}
              </div>
              <div className="mt-4 grid grid-cols-5 items-end gap-2 h-28 pt-2">
                {ageBuckets.map((bar, idx) => (
                  <div
                    key={bar.label}
                    className="flex flex-col items-center justify-end h-full gap-1.5"
                  >
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                      {bar.count}
                    </span>
                    <div
                      style={{ height: `${Math.max(4, Math.round((bar.count / maxAgeCount) * 100))}%` }}
                      className={`w-full rounded-t-lg ${idx === 2 ? "bg-purple-600" : "bg-blue-500"}`}
                    />
                    <span className="text-[11px] font-semibold text-slate-400">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Where do they come from? (sm:col-span-7) */}
            <div className="sm:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-500">
                {isAr ? "من أين يأتي المرضى؟" : "Where do they come from?"}
              </div>

              {sourceCounts.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs font-semibold text-slate-400">
                  {isAr ? "لا توجد بيانات مصادر لهذا الفرع" : "No source data for this branch"}
                </div>
              )}
              {sourceCounts.map((src) => (
                <div
                  key={src.name}
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between text-xs font-black text-slate-900">
                    <span>{src.name}</span>
                    <span className="tabular-nums">{src.count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${src.color}`}
                      style={{ width: `${Math.round((src.count / maxSourceCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: Dentist performance — Exact match to Image 12 */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-500">
              {isAr ? "أداء الأطباء" : "Dentist performance"}
            </div>
            <div className="mt-2.5 space-y-2.5">
              {doctorPerformance(0, branchCode).map((doc, idx) => (
                <div
                  key={doc.doctorId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
                        ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-amber-500", "bg-rose-500"][idx % 5]
                      }`}
                    >
                      {(isAr ? doc.nameAr : doc.nameEn).replace("Dr. ", "").charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        {isAr ? doc.nameAr : doc.nameEn}
                      </div>
                      <div className="text-xs text-slate-500">
                        {isAr
                          ? `${doc.cases} حالة · تحصيل ${doc.collectionRatePercent}%`
                          : `${doc.cases} cases · ${doc.collectionRatePercent}% collected`}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900 tabular-nums">
                    {canSeeFinancialIndicators
                      ? `EGP ${doc.invoiced.toLocaleString()}`
                      : `${doc.cases} ${isAr ? "حالة" : "cases"}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CUSTOM INDICATOR BUILDER CARD: "Indicators you build yourself" */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isAr
                    ? "مؤشرات تبنيها بنفسك وتثبّتها على شاشتك"
                    : "Indicators You Build Yourself & Pin to Screen"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "اختر البيانات، الفترة، والشرط — يحترم صلاحياتك ولا يعرض مؤشراً مالياً لغير المصرح لهم"
                    : "Choose the data, period and condition — respects permissions automatically"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Pin className="h-3.5 w-3.5" />
                {visiblePinnedIndicators.length}
              </span>
            </div>

            {/* Builder Form */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-600">
                  {isAr ? "1. اختر البيانات" : "1. Choose Data"}
                </label>
                <select
                  value={builderData}
                  onChange={(e) =>
                    setBuilderData(
                      e.target.value as "appointments" | "revenue" | "patients"
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
                >
                  {canSeeFinancialIndicators && (
                    <option value="revenue">
                      {isAr ? "الإيرادات والفواتير" : "Revenue & Invoices"}
                    </option>
                  )}
                  <option value="appointments">
                    {isAr ? "المواعيد والزيارات" : "Appointments & Visits"}
                  </option>
                  <option value="patients">
                    {isAr ? "المرضى الجدد" : "New Patients"}
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600">
                  {isAr ? "2. اختر الفترة" : "2. Choose Period"}
                </label>
                <select
                  value={builderPeriod}
                  onChange={(e) =>
                    setBuilderPeriod(e.target.value as "today" | "week" | "month")
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
                >
                  <option value="today">{isAr ? "اليوم" : "Today"}</option>
                  <option value="week">{isAr ? "هذا الأسبوع" : "This Week"}</option>
                  <option value="month">{isAr ? "هذا الشهر" : "This Month"}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-600">
                  {isAr ? "3. اختر الشرط" : "3. Condition"}
                </label>
                <select
                  value={builderCondition}
                  onChange={(e) => setBuilderCondition(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
                >
                  <option value="completed">
                    {isAr ? "مكتمل / محصّل" : "Completed / Collected"}
                  </option>
                  <option value="whatsapp">
                    {isAr ? "المصدر: واتساب" : "Source: WhatsApp"}
                  </option>
                  <option value="implants">
                    {isAr ? "الخدمة: زراعة أسنان" : "Service: Implants"}
                  </option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePinCustomIndicator}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
            >
              <Pin className="h-3.5 w-3.5" />
              {isAr ? "تثبيت المؤشر على شاشتي" : "Pin Indicator to My Screen"}
            </button>

            {/* Pinned Indicators List */}
            <div className="mt-5 space-y-2.5">
              {visiblePinnedIndicators.map((ind) => (
                <div
                  key={ind.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                >
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      {isAr ? ind.titleAr : ind.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isAr ? ind.conditionAr : ind.conditionEn}
                    </div>
                  </div>
                  <span className="text-sm font-black text-blue-600 tabular-nums">
                    {ind.valueDisplay}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {isAr
                ? "يحترم صلاحياتك: لا يظهر أي مؤشر مالي لمن لا يملك صلاحية الشاشة المالية"
                : "Respects your permissions: A financial indicator does not show for anyone without its screen"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
