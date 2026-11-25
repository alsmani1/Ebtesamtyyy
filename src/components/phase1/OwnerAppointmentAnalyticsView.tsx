"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Calendar, CheckCircle2, UserX, XCircle, Building2, Filter } from "lucide-react";
import { clinicMonthStartISO, clinicTodayISO } from "@/lib/clinic-clock";

interface BranchDoctorAppointmentStat {
  id: string;
  branchCode: "BR-A" | "BR-B" | "BR-C";
  branchNameEn: string;
  branchNameAr: string;
  doctorNameEn: string;
  doctorNameAr: string;
  total: number;
  completed: number;
  noShows: number;
  cancelled: number;
}

const BASE_STATS: BranchDoctorAppointmentStat[] = [
  {
    id: "stat-1",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    doctorNameEn: "Dr. Sandy Saad",
    doctorNameAr: "د. ساندي سعد",
    total: 84,
    completed: 74,
    noShows: 4,
    cancelled: 6,
  },
  {
    id: "stat-2",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    doctorNameEn: "Dr. Feby Samer",
    doctorNameAr: "د. فيبي سامر",
    total: 68,
    completed: 61,
    noShows: 3,
    cancelled: 4,
  },
  {
    id: "stat-3",
    branchCode: "BR-B",
    branchNameEn: "Minya – Branch B",
    branchNameAr: "المنيا – الفرع ب",
    doctorNameEn: "Dr. Ahmed Hassan",
    doctorNameAr: "د. أحمد حسن",
    total: 76,
    completed: 66,
    noShows: 5,
    cancelled: 5,
  },
  {
    id: "stat-4",
    branchCode: "BR-B",
    branchNameEn: "Minya – Branch B",
    branchNameAr: "المنيا – الفرع ب",
    doctorNameEn: "Dr. Youssef El-Mansy",
    doctorNameAr: "د. يوسف المنسي",
    total: 62,
    completed: 54,
    noShows: 3,
    cancelled: 5,
  },
  {
    id: "stat-5",
    branchCode: "BR-C",
    branchNameEn: "Minya – Branch C",
    branchNameAr: "المنيا – الفرع ج",
    doctorNameEn: "Dr. Nadia El-Hariry",
    doctorNameAr: "د. نادية الحريري",
    total: 58,
    completed: 52,
    noShows: 2,
    cancelled: 4,
  },
];

const PERIOD_MULTIPLIER: Record<"today" | "week" | "month" | "custom", number> = {
  today: 0.08,
  week: 0.28,
  month: 1,
  custom: 0.65,
};

export default function OwnerAppointmentAnalyticsView() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [branchFilter, setBranchFilter] = useState<"ALL" | "BR-A" | "BR-B" | "BR-C">("ALL");
  const [doctorFilter, setDoctorFilter] = useState<string>("ALL");
  const [period, setPeriod] = useState<"today" | "week" | "month" | "custom">("month");
  const [customFrom, setCustomFrom] = useState(clinicMonthStartISO());
  const [customTo, setCustomTo] = useState(clinicTodayISO());

  const availableDoctors = useMemo(() => {
    const rows =
      branchFilter === "ALL"
        ? BASE_STATS
        : BASE_STATS.filter((r) => r.branchCode === branchFilter);
    return rows.map((r) => ({ en: r.doctorNameEn, ar: r.doctorNameAr }));
  }, [branchFilter]);

  const scaledRows = useMemo(() => {
    const mult = PERIOD_MULTIPLIER[period];
    return BASE_STATS.filter((row) => {
      if (branchFilter !== "ALL" && row.branchCode !== branchFilter) return false;
      if (doctorFilter !== "ALL" && row.doctorNameEn !== doctorFilter) return false;
      return true;
    }).map((row) => {
      const completed = Math.max(1, Math.round(row.completed * mult));
      const noShows = Math.max(0, Math.round(row.noShows * mult));
      const cancelled = Math.max(0, Math.round(row.cancelled * mult));
      const total = completed + noShows + cancelled;
      return { ...row, total, completed, noShows, cancelled };
    });
  }, [branchFilter, doctorFilter, period]);

  const totals = useMemo(() => {
    const total = scaledRows.reduce((s, r) => s + r.total, 0);
    const completed = scaledRows.reduce((s, r) => s + r.completed, 0);
    const noShows = scaledRows.reduce((s, r) => s + r.noShows, 0);
    const cancelled = scaledRows.reduce((s, r) => s + r.cancelled, 0);
    const showRate = total ? Math.round((completed / total) * 100) : 0;
    const noShowPct = total ? Math.round((noShows / total) * 100) : 0;
    const cancelledPct = total ? Math.round((cancelled / total) * 100) : 0;
    return { total, completed, noShows, cancelled, showRate, noShowPct, cancelledPct };
  }, [scaledRows]);

  const branchSummary = useMemo(() => {
    const codes: Array<"BR-A" | "BR-B" | "BR-C"> = ["BR-A", "BR-B", "BR-C"];
    return codes
      .map((code) => {
        const rows = scaledRows.filter((r) => r.branchCode === code);
        if (rows.length === 0) return null;
        const total = rows.reduce((s, r) => s + r.total, 0);
        const completed = rows.reduce((s, r) => s + r.completed, 0);
        const noShows = rows.reduce((s, r) => s + r.noShows, 0);
        const cancelled = rows.reduce((s, r) => s + r.cancelled, 0);
        return {
          code,
          nameEn: rows[0].branchNameEn,
          nameAr: rows[0].branchNameAr,
          total,
          completed,
          noShows,
          cancelled,
          showPct: total ? Math.round((completed / total) * 100) : 0,
          noShowPct: total ? Math.round((noShows / total) * 100) : 0,
          cancelledPct: total ? Math.round((cancelled / total) * 100) : 0,
        };
      })
      .filter(Boolean) as Array<{
      code: string;
      nameEn: string;
      nameAr: string;
      total: number;
      completed: number;
      noShows: number;
      cancelled: number;
      showPct: number;
      noShowPct: number;
      cancelledPct: number;
    }>;
  }, [scaledRows]);

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "تحليلات المواعيد التنفيذية" : "Executive Appointment Analytics"}
      className="space-y-6"
    >
      {/* Top Filters & Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F0EE] px-3 py-1 text-xs font-extrabold text-[#0F2926]">
              <Filter className="h-3.5 w-3.5" />
              {isAr
                ? "تحليلات تنفيذية للعرض فقط — بدون حجز أو قائمة انتظار"
                : "Read-Only Executive Appointment Analytics"}
            </span>
            <h2 className="mt-1.5 text-2xl font-black text-slate-900">
              {isAr
                ? "مؤشرات وأداء المواعيد عبر فروع المنيا"
                : "Appointment Performance Across Minya Branches"}
            </h2>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-extrabold">
            {(
              [
                { id: "today", en: "Today", ar: "اليوم" },
                { id: "week", en: "This Week", ar: "هذا الأسبوع" },
                { id: "month", en: "This Month", ar: "هذا الشهر" },
                { id: "custom", en: "Custom Date Range", ar: "نطاق مخصص" },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  period === p.id
                    ? "bg-[#0F2926] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isAr ? p.ar : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Branch, Doctor & Custom Date Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <label className="space-y-1 font-bold text-slate-600">
            <span>{isAr ? "فرع المنيا" : "Minya Branch"}</span>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value as typeof branchFilter);
                setDoctorFilter("ALL");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="ALL">{isAr ? "كل فروع المنيا (أ، ب، ج)" : "All Minya Branches"}</option>
              <option value="BR-A">{isAr ? "المنيا – الفرع أ" : "Minya – Branch A"}</option>
              <option value="BR-B">{isAr ? "المنيا – الفرع ب" : "Minya – Branch B"}</option>
              <option value="BR-C">{isAr ? "المنيا – الفرع ج" : "Minya – Branch C"}</option>
            </select>
          </label>

          <label className="space-y-1 font-bold text-slate-600">
            <span>{isAr ? "الطبيب" : "Doctor"}</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-bold text-slate-800"
            >
              <option value="ALL">{isAr ? "كل الأطباء" : "All Doctors"}</option>
              {availableDoctors.map((doc) => (
                <option key={doc.en} value={doc.en}>
                  {isAr ? doc.ar : doc.en}
                </option>
              ))}
            </select>
          </label>

          {period === "custom" && (
            <>
              <label className="space-y-1 font-bold text-slate-600">
                <span>{isAr ? "من تاريخ" : "From Date"}</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-bold text-slate-800"
                />
              </label>
              <label className="space-y-1 font-bold text-slate-600">
                <span>{isAr ? "إلى تاريخ" : "To Date"}</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-bold text-slate-800"
                />
              </label>
            </>
          )}
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "إجمالي المواعيد" : "Total Appointments"}</span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-3 text-3xl font-black text-slate-900 tabular-nums">
              {totals.total}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              {isAr ? "خلال الفترة المحددة" : "For selected filters"}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>{isAr ? "نسبة الحضور والإنجاز" : "Completed / Show Rate"}</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2 tabular-nums">
              <span className="text-3xl font-black text-emerald-700">{totals.showRate}%</span>
              <span className="text-xs font-bold text-emerald-700/80">
                ({totals.completed} {isAr ? "مكتمل" : "completed"})
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-200/70">
              <div className="h-full bg-emerald-600" style={{ width: `${totals.showRate}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>{isAr ? "عدم الحضور (No-Shows)" : "No-Shows (Count & %)"}</span>
              <UserX className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2 tabular-nums">
              <span className="text-3xl font-black text-amber-700">{totals.noShows}</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                {totals.noShowPct}%
              </span>
            </div>
            <div className="mt-1 text-xs font-semibold text-amber-700/80">
              {isAr ? "من إجمالي المواعيد" : "Of scheduled visits"}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5">
            <div className="flex items-center justify-between text-xs font-bold text-rose-800">
              <span>{isAr ? "المواعيد الملغاة" : "Cancelled Appointments"}</span>
              <XCircle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2 tabular-nums">
              <span className="text-3xl font-black text-rose-700">{totals.cancelled}</span>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-800">
                {totals.cancelledPct}%
              </span>
            </div>
            <div className="mt-1 text-xs font-semibold text-rose-700/80">
              {isAr ? "إلغاء مسبق أو إعادة جدولة" : "Cancelled before visit"}
            </div>
          </div>
        </div>
      </div>

      {/* Branch Comparison Visual Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#0F2926]" />
              <span>
                {isAr
                  ? "مقارنة الحضور وعدم الحضور والإلغاء حسب الفرع"
                  : "Branch Show vs. No-Show vs. Cancelled"}
              </span>
            </h3>
          </div>

          <div className="space-y-4">
            {branchSummary.map((b) => (
              <div
                key={b.code}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span>{isAr ? b.nameAr : b.nameEn}</span>
                  <span className="tabular-nums">
                    {b.total} {isAr ? "موعد" : "visits"}
                  </span>
                </div>
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${b.showPct}%` }}
                    title={`Show: ${b.completed}`}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${b.noShowPct}%` }}
                    title={`No-Show: ${b.noShows}`}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${b.cancelledPct}%` }}
                    title={`Cancelled: ${b.cancelled}`}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold tabular-nums">
                  <span className="text-emerald-700">
                    ● {isAr ? "مكتمل:" : "Show:"} {b.completed} ({b.showPct}%)
                  </span>
                  <span className="text-amber-700">
                    ● {isAr ? "لم يحضر:" : "No-Show:"} {b.noShows} ({b.noShowPct}%)
                  </span>
                  <span className="text-rose-700">
                    ● {isAr ? "ملغى:" : "Cancelled:"} {b.cancelled} ({b.cancelledPct}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor & Branch Breakdown Read-Only Table */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">
              {isAr
                ? "تفصيل المواعيد حسب الفرع والطبيب (للقراءة فقط)"
                : "Branch & Doctor Appointment Breakdown (Read-Only)"}
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {scaledRows.length} {isAr ? "أطباء" : "doctors"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="py-2 text-start">{isAr ? "الفرع" : "Branch"}</th>
                  <th className="py-2 text-start">{isAr ? "الطبيب" : "Doctor"}</th>
                  <th className="py-2 text-center">{isAr ? "الإجمالي" : "Total"}</th>
                  <th className="py-2 text-center">{isAr ? "مكتمل" : "Show"}</th>
                  <th className="py-2 text-center">{isAr ? "عدم حضور" : "No-Show"}</th>
                  <th className="py-2 text-center">{isAr ? "ملغى" : "Cancelled"}</th>
                  <th className="py-2 text-end">{isAr ? "نسبة الحضور" : "Show Rate"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {scaledRows.map((row) => {
                  const pct = row.total ? Math.round((row.completed / row.total) * 100) : 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 font-semibold text-slate-600">
                        {isAr ? row.branchNameAr : row.branchNameEn}
                      </td>
                      <td className="py-3 font-black text-slate-900">
                        {isAr ? row.doctorNameAr : row.doctorNameEn}
                      </td>
                      <td className="py-3 text-center font-black text-slate-900">{row.total}</td>
                      <td className="py-3 text-center font-bold text-emerald-700">
                        {row.completed}
                      </td>
                      <td className="py-3 text-center font-bold text-amber-700">{row.noShows}</td>
                      <td className="py-3 text-center font-bold text-rose-700">{row.cancelled}</td>
                      <td className="py-3 text-end">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-black text-emerald-700">
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
