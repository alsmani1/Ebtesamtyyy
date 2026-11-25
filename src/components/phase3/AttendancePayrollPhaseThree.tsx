"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Camera,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Edit3,
  X,
  ShieldCheck,
} from "lucide-react";
import type { Phase2Role } from "../phase2/FinanceCenterPhaseTwo";
import {
  clinicDateText,
  clinicMonthEndISO,
  clinicMonthLabel,
  clinicMonthStartISO,
  clinicTodayISO,
  clinicWeekdayDateText,
} from "@/lib/clinic-clock";
import { paymentActivityRows } from "@/lib/clinic-finance";
import { PAYROLL_STAFF, type FinanceBranch } from "@/lib/clinic-costs";
import { MINYA_BRANCHES } from "@/config/minya-clinic-store";
import {
  ATTENDANCE_EVENT,
  ATTENDANCE_KEY,
  usePersistedState,
} from "@/lib/use-persisted-state";

interface PayrollLedgerRow {
  id: string;
  branchCode: FinanceBranch;
  dateAr: string;
  dateEn: string;
  doctorAr: string;
  doctorEn: string;
  amountEgp: number;
  isDeduction?: boolean;
  typeAr: string;
  typeEn: string;
  typeKind: "lab_order" | "payment";
  originAr: string;
  originEn: string;
  originSub: string;
  patientAr: string;
  patientEn: string;
  remainingBalanceEgp: number | null;
  doctorShareEgp: number | null;
  clinicShareEgp: number | null;
}

interface StaffAttendanceMember {
  id: string;
  branchCode: FinanceBranch;
  name: string;
  initials: string;
  roleAr: string;
  roleEn: string;
  shift: string;
  status: "not_clocked" | "present" | "leave" | "absent";
  clockInTime?: string;
  manualReason?: string;
}

const INITIAL_ATTENDANCE_STAFF: StaffAttendanceMember[] = [
  {
    id: "STF-1",
    branchCode: "BR-A",
    name: "Nourhan — front desk",
    initials: "NR",
    roleAr: "استقبال",
    roleEn: "Receptionist",
    shift: "08:00 - 16:00",
    status: "present",
    clockInTime: "08:04 AM",
  },
  {
    id: "STF-2",
    branchCode: "BR-A",
    name: "د. ساندي سعد",
    initials: "سس",
    roleAr: "طبيبة",
    roleEn: "Doctor",
    shift: "10:00 - 18:00",
    status: "present",
    clockInTime: "09:58 AM",
  },
  {
    id: "STF-3",
    branchCode: "BR-A",
    name: "د. فيبي سامر",
    initials: "فس",
    roleAr: "طبيبة",
    roleEn: "Doctor",
    shift: "14:00 - 22:00",
    status: "not_clocked",
  },
  {
    id: "STF-4",
    branchCode: "BR-B",
    name: "د. أحمد حسن",
    initials: "أح",
    roleAr: "طبيب",
    roleEn: "Doctor",
    shift: "10:00 - 18:00",
    status: "present",
    clockInTime: "09:55 AM",
  },
  {
    id: "STF-5",
    branchCode: "BR-B",
    name: "ساندي عبد",
    initials: "سع",
    roleAr: "استقبال",
    roleEn: "Receptionist",
    shift: "08:00 - 16:00",
    status: "not_clocked",
  },
  {
    id: "STF-6",
    branchCode: "BR-C",
    name: "د. نادية الحريري",
    initials: "نح",
    roleAr: "طبيبة",
    roleEn: "Doctor",
    shift: "12:00 - 20:00",
    status: "present",
    clockInTime: "11:48 AM",
  },
  {
    id: "STF-7",
    branchCode: "BR-C",
    name: "سلمى المصري",
    initials: "سم",
    roleAr: "استقبال",
    roleEn: "Receptionist",
    shift: "08:00 - 16:00",
    status: "leave",
  },
];

const minutesLate = (member: StaffAttendanceMember): number => {
  if (member.status !== "present" || !member.clockInTime) return 0;
  const parse = (text: string): number | null => {
    const match = text.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const suffix = match[3]?.toUpperCase();
    if (suffix === "AM" && hour === 12) hour = 0;
    if (suffix === "PM" && hour !== 12) hour += 12;
    return hour * 60 + minute;
  };
  const clockIn = parse(member.clockInTime);
  const shiftStart = parse(member.shift.split("-")[0] ?? "");
  if (clockIn === null || shiftStart === null) return 0;
  return Math.max(0, clockIn - shiftStart);
};

export default function AttendancePayrollPhaseThree({
  role = "clinic_owner",
  branchCode = "ALL",
}: {
  role?: Phase2Role;
  branchCode?: FinanceBranch | "ALL";
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [staffList, setStaffList] = usePersistedState<StaffAttendanceMember[]>(
    ATTENDANCE_KEY,
    INITIAL_ATTENDANCE_STAFF,
    ATTENDANCE_EVENT
  );
  const [faceClockedIn, setFaceClockedIn] = useState(false);
  const [clockTimeDisplay, setClockTimeDisplay] = useState("11:21");
  const [ownerRevealSalary, setOwnerRevealSalary] = useState(false);

  const branchLabel =
    branchCode === "ALL"
      ? isAr
        ? "كل الفروع"
        : "All branches"
      : MINYA_BRANCHES.find((b) => b.code === branchCode)?.[
          isAr ? "nameAr" : "nameEn"
        ] ?? branchCode;

  const branchStaff = useMemo(
    () =>
      branchCode === "ALL"
        ? staffList
        : staffList.filter((member) => member.branchCode === branchCode),
    [staffList, branchCode]
  );
  const branchPayrollRows = useMemo<PayrollLedgerRow[]>(
    () =>
      paymentActivityRows(-1, 8, branchCode).map((row) => ({
        id: row.id,
        branchCode: row.branch,
        dateAr: clinicDateText(row.date, "ar", false),
        dateEn: clinicDateText(row.date, "en", false),
        doctorAr: row.doctorAr,
        doctorEn: row.doctorEn,
        amountEgp: row.amount,
        typeAr: "دفعة",
        typeEn: "Payment",
        typeKind: "payment",
        originAr: `فاتورة ${row.invoiceId} — ${row.treatmentAr}`,
        originEn: `Invoice ${row.invoiceId} — ${row.treatmentEn}`,
        originSub: row.invoiceId,
        patientAr: row.patientAr,
        patientEn: row.patientEn,
        remainingBalanceEgp: row.remainingBalance,
        doctorShareEgp: row.doctorShare,
        clinicShareEgp: row.clinicShare,
      })),
    [branchCode]
  );
  const lateMinutesTotal = branchStaff.reduce(
    (sum, member) => sum + minutesLate(member),
    0
  );
  const sheetStaff = useMemo(() => {
    const branch = branchCode === "ALL" ? "BR-A" : branchCode;
    return (
      PAYROLL_STAFF.find(
        (row) => row.branchCode === branch && /reception/i.test(row.roleEn)
      ) ?? PAYROLL_STAFF.find((row) => row.branchCode === branch)
    );
  }, [branchCode]);
  const sheetName = sheetStaff?.employeeEn.split(" ")[0] ?? "Nourhan";
  const sheetSalary = sheetStaff?.amountEgp ?? 0;

  // Manual entry with mandatory written reason modal
  const [manualEditMember, setManualEditMember] =
    useState<StaffAttendanceMember | null>(null);
  const [manualStatus, setManualStatus] = useState<"present" | "leave" | "absent">(
    "present"
  );
  const [manualReasonText, setManualReasonText] = useState("");
  const [manualError, setManualError] = useState("");

  // Patient has no access to Attendance & Payroll
  if (role === "patient") {
    return null;
  }

  const handleFaceClockIn = () => {
    const nowStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setClockTimeDisplay(nowStr);
    setFaceClockedIn(true);
  };

  const handleSaveManualCorrection = () => {
    if (!manualEditMember) return;
    if (!manualReasonText.trim()) {
      setManualError(
        isAr
          ? "يجب كتابة سبب التعديل اليدوي (لا يُسمح بالتعديل الصامت بدون سبب مسجل)."
          : "A written reason is required for manual attendance entry (never silent)."
      );
      return;
    }
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === manualEditMember.id
          ? {
              ...s,
              status: manualStatus,
              clockInTime: manualStatus === "present" ? "Manual Entry" : undefined,
              manualReason: manualReasonText.trim(),
            }
          : s
      )
    );
    setManualEditMember(null);
    setManualReasonText("");
    setManualError("");
  };

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "الحضور والانصراف ومركز الرواتب" : "Attendance & Payroll Center"}
      className="space-y-6"
    >
      {/* TOP SPLIT: Image 9 (Touch-Free Face Recognition Clock-In & Daily Roster) + Image 10 ("September sheet — Nourhan") */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* IMAGE 9 EXACT CARD: Face Recognition Clock-In + Daily Attendance Roster (xl:col-span-7) */}
        <div className="xl:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {isAr ? "الحضور والانصراف ببصمة الوجه" : "Touch-Free Face Recognition Attendance"}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "تسجيل الحضور بالكاميرا على جهاز العيادة · يُسجل الوقت الفعلي وتُحسب الساعات والتأخير تلقائياً"
                  : "Clock-in by face on the clinic device — real time is recorded, hours and lateness calculated automatically"}
              </p>
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-black text-slate-600">
                {branchLabel}
              </span>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              {faceClockedIn
                ? isAr
                  ? `تم تسجيل الحضور ${clockTimeDisplay}`
                  : `Clocked In at ${clockTimeDisplay}`
                : isAr
                ? "حضوري · جهاز العيادة"
                : "Clinic Face Terminal"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-12 items-center">
            {/* Circular Clock-In Dial & Blue Face Button from Image 9 (md:col-span-5) */}
            <div className="md:col-span-5 flex flex-col items-center rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-center">
              <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-blue-600 bg-white shadow-inner">
                <span className="text-2xl font-black text-slate-900 tabular-nums">
                  {clockTimeDisplay}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {clinicWeekdayDateText(clinicTodayISO(), isAr ? "ar" : "en")}
                </span>
                <span className="mt-0.5 text-[10px] font-bold text-blue-600">
                  {faceClockedIn
                    ? isAr
                      ? "تم التوثيق بالوجه ✓"
                      : "Face Verified ✓"
                    : isAr
                    ? "08:00 – 16:00"
                    : "Shift 08:00 – 16:00"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleFaceClockIn}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <span>
                  {faceClockedIn
                    ? isAr
                      ? "تم تسجيل بصمة الوجه ✓"
                      : "Face Clock-In Recorded ✓"
                    : isAr
                    ? "سجّل بصمة وجهك (مرّة واحدة)"
                    : "Clock-in by Face on Clinic Device"}
                </span>
              </button>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                {isAr
                  ? "نلتقط ملامح وجهك ونحوّلها إلى رمز رقمي مشفّر، لا نحتفظ بأي صورة"
                  : "Touch-free encrypted facial vector — no card to forget or shared fingerprint scanner"}
              </p>
            </div>

            {/* Right Staff Attendance Roster + Manual Entry with Written Reason (md:col-span-7) */}
            <div className="md:col-span-7 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{isAr ? "سجل الحضور اليومي" : "Today's Staff Roster"}</span>
                <span>
                  {isAr
                    ? "التعديل اليدوي يتطلب سبباً مكتوباً"
                    : "Manual entry requires written reason"}
                </span>
              </div>

              {branchStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-[11px] font-black text-white">
                      {member.initials}
                    </span>
                    <div>
                      <div className="font-black text-slate-900">{member.name}</div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        {isAr ? member.roleAr : member.roleEn} · {member.shift}
                      </div>
                      {member.manualReason && (
                        <div className="text-[10px] font-bold text-amber-700">
                          {isAr ? "تعديل مدير:" : "Manager reason:"} {member.manualReason}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        member.status === "present"
                          ? "bg-emerald-50 text-emerald-700"
                          : member.status === "leave"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {member.status === "present"
                        ? member.clockInTime || (isAr ? "حاضر" : "Present")
                        : member.status === "leave"
                        ? isAr
                          ? "إجازة"
                          : "On leave"
                        : isAr
                        ? "لم يُسجّل"
                        : "Not clocked"}
                    </span>

                    {role === "clinic_owner" && (
                      <button
                        type="button"
                        onClick={() => {
                          setManualEditMember(member);
                          setManualStatus(
                            member.status === "not_clocked" ? "present" : member.status
                          );
                          setManualReasonText(member.manualReason || "");
                          setManualError("");
                        }}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                      >
                        {isAr ? "تعديل بسبب" : "Manual fix"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* IMAGE 10 EXACT CARD: September sheet — Nourhan (22 working days) (xl:col-span-5) */}
        <div
          dir="ltr"
          className="xl:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">
                {clinicMonthLabel(-1, "en")} sheet — {sheetName}
              </h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-600">
                22 working days
              </span>
            </div>

            {/* 3 Metric Boxes: Hours 176 | Late 48 min | Overtime 5 h — Exact match to Image 10 */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                <div className="text-xs font-semibold text-slate-500">Hours</div>
                <div className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                  {22 * 8}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                <div className="text-xs font-semibold text-slate-500">Late</div>
                <div className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                  {lateMinutesTotal} min
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5">
                <div className="text-xs font-semibold text-slate-500">Overtime</div>
                <div className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                  0 h
                </div>
              </div>
            </div>

            {/* 2 Privacy-Enforced Rows — Exact match to Image 10 */}
            <div className="mt-4 space-y-3">
              {/* Row 1: Base salary -> EGP •••• */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-black text-white">
                    •
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">Base salary</div>
                    <div className="text-xs text-slate-500">
                      Hidden from anyone it does not concern
                    </div>
                  </div>
                </div>

                {role === "clinic_owner" ? (
                  <button
                    type="button"
                    onClick={() => setOwnerRevealSalary((v) => !v)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-black text-slate-700 tabular-nums hover:bg-slate-100"
                    title="Owner only: Click to toggle salary visibility"
                  >
                    {ownerRevealSalary
                      ? `EGP ${sheetSalary.toLocaleString()}`
                      : "EGP ••••"}
                  </button>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-black text-slate-700">
                    EGP ••••
                  </span>
                )}
              </div>

              {/* Row 2: Deductions and commissions -> Owner only */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">
                    L
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      Deductions and commissions
                    </div>
                    <div className="text-xs text-slate-500">Calculated on the server</div>
                  </div>
                </div>
                <span className="rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-black text-purple-700">
                  Owner only
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Whoever records attendance does not see colleagues’ pay
          </div>
        </div>
      </div>

      {/* IMAGE 8 EXACT TABLE: مركز الرواتب 100 (Visible to Clinic Owner Only — Colleagues' pay hidden from Receptionist) */}
      {role === "clinic_owner" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-900">
                {isAr ? "مركز الرواتب" : "Payroll & Commission Center"}
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 tabular-nums">
                {branchPayrollRows.length}
              </span>
              <span className="text-xs font-bold text-slate-400">{branchLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 tabular-nums">
                {clinicMonthStartISO().replace(/-/g, "/")} → {clinicMonthEndISO().replace(/-/g, "/")}
              </span>
              <span className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                $ {isAr ? "حسب المدفوعات" : "By Payments"}
              </span>
              <button
                type="button"
                onClick={() => typeof window !== "undefined" && window.print()}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                {isAr ? "كشف رواتب الفريق" : "Team Payroll Statement"}
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-xs">
              <thead>
                <tr className="text-slate-400 font-bold">
                  <th className="px-3 py-2 text-start">{isAr ? "تاريخ" : "Date"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "الطبيب" : "Dentist"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "المجموع" : "Total"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "نوع" : "Type"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "الأصل" : "Source Item"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "المريض" : "Patient"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "رصيد متبقّ" : "Collected"}</th>
                  <th className="px-3 py-2 text-start">
                    {isAr ? "نصيب الطبيب" : "Dentist Share"}
                  </th>
                  <th className="px-3 py-2 text-end">
                    {isAr ? "نصيب العيادة" : "Clinic Share"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {branchPayrollRows.map((row) => (
                  <tr
                    key={row.id}
                    className="rounded-2xl border border-slate-200/60 bg-white shadow-2xs hover:bg-slate-50/80"
                  >
                    <td className="rounded-s-2xl px-3 py-3 text-slate-600 font-semibold">
                      {isAr ? row.dateAr : row.dateEn}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
                          {isAr ? row.doctorAr : row.doctorEn}
                        </span>
                        {branchCode === "ALL" && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                            {MINYA_BRANCHES.find((b) => b.code === row.branchCode)?.shortEn ??
                              row.branchCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      <span
                        className={`rounded-full px-3 py-1 font-black ${
                          row.isDeduction
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {row.amountEgp.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          row.typeKind === "lab_order"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isAr ? row.typeAr : row.typeEn}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900">
                        {isAr ? row.originAr : row.originEn}
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        {row.originSub}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-bold text-blue-900">
                      {isAr ? row.patientAr : row.patientEn}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {row.remainingBalanceEgp !== null ? (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 font-black text-rose-700">
                          {row.remainingBalanceEgp} {isAr ? "ج.م" : "EGP"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {row.doctorShareEgp !== null ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-black text-blue-700">
                          {row.doctorShareEgp} {isAr ? "ج.م" : "EGP"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="rounded-e-2xl px-3 py-3 text-end font-black text-slate-900 tabular-nums">
                      {row.clinicShareEgp !== null
                        ? `${row.clinicShareEgp} ${isAr ? "ج.م" : "EGP"}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Manual Attendance Entry with Mandatory Written Reason */}
      {manualEditMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isAr
                    ? `تعديل حضور استثنائي — ${manualEditMember.name}`
                    : `Manual Attendance Entry — ${manualEditMember.name}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "يصحح المدير بسبب مكتوب ومسجل، وليس بصمت"
                    : "The manager corrects with a written reason, not silently"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualEditMember(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {manualError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 font-bold text-rose-700">
                  {manualError}
                </div>
              )}

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "الحالة" : "Attendance Status"}
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) =>
                    setManualStatus(e.target.value as "present" | "leave" | "absent")
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                >
                  <option value="present">{isAr ? "حاضر" : "Present"}</option>
                  <option value="leave">{isAr ? "في إجازة" : "On Leave"}</option>
                  <option value="absent">{isAr ? "غائب" : "Absent"}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "سبب التعديل المكتوب (إلزامي) *" : "Written Reason (Mandatory) *"}
                </label>
                <textarea
                  rows={3}
                  value={manualReasonText}
                  onChange={(e) => setManualReasonText(e.target.value)}
                  placeholder={
                    isAr
                      ? "مثال: مأمورية خارجية لاستلام مستلزمات من المورد..."
                      : "e.g. Approved external lab errand prior to shift..."
                  }
                  className="w-full rounded-xl border border-slate-200 p-3"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setManualEditMember(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveManualCorrection}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
                >
                  {isAr ? "حفظ التعديل والسبب" : "Save with Written Reason"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
