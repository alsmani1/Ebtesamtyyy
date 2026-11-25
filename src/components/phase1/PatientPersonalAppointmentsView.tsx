"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Plus,
  RefreshCw,
  XCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { MINYA_BRANCHES } from "@/config/minya-clinic-store";
import { clinicDateISO, clinicTodayISO } from "@/lib/clinic-clock";
import {
  APPOINTMENTS_EVENT,
  APPOINTMENTS_KEY,
  appointmentStatusLabel,
  isActiveAppointment,
  isSlotTaken,
  listAppointments,
  upsertAppointment,
  type AppointmentRecord,
  type AppointmentStatus,
} from "@/lib/appointments-db";

export type PersonalPatientVisit = AppointmentRecord;

export const INITIAL_PATIENT_VISITS: PersonalPatientVisit[] = [
  {
    id: "APT-PAS-101",
    patientName: "Passant",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    doctorNameEn: "Dr. Sandy Saad",
    doctorNameAr: "د. ساندي سعد",
    serviceEn: "Step 2: Fiber Post & Core Build-Up (Tooth #36)",
    serviceAr: "الخطوة 2: دعامة وبناء السن (سن #36)",
    date: clinicDateISO(2),
    time: "05:30 PM",
    status: "CONFIRMED",
    isPast: false,
  },
  {
    id: "APT-PAS-102",
    patientName: "Passant",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    doctorNameEn: "Dr. Sandy Saad",
    doctorNameAr: "د. ساندي سعد",
    serviceEn: "Step 3: CAD/CAM Zirconia Crown Fitting (Tooth #36)",
    serviceAr: "الخطوة 3: تجربة وتركيب تاج الزيركون (سن #36)",
    date: clinicDateISO(9),
    time: "06:00 PM",
    status: "CONFIRMED",
    isPast: false,
  },
  {
    id: "APT-PAS-088",
    patientName: "Passant",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    doctorNameEn: "Dr. Feby Samer",
    doctorNameAr: "د. فيبي سامر",
    serviceEn: "Step 1: Microscopic Root Canal Therapy (Tooth #36)",
    serviceAr: "الخطوة 1: علاج الجذور والعصب بالميكروسكوب (سن #36)",
    date: clinicDateISO(-45),
    time: "04:00 PM",
    status: "COMPLETED",
    isPast: true,
  },
  {
    id: "APT-PAS-074",
    patientName: "Passant",
    branchCode: "BR-B",
    branchNameEn: "Minya – Branch B",
    branchNameAr: "المنيا – الفرع ب",
    doctorNameEn: "Dr. Ahmed Hassan",
    doctorNameAr: "د. أحمد حسن",
    serviceEn: "Comprehensive Dental Checkup & Digital X-Ray",
    serviceAr: "فحص شامل للأسنان وأشعة رقمية تشخيصية",
    date: clinicDateISO(-67),
    time: "11:30 AM",
    status: "COMPLETED",
    isPast: true,
  },
];

export const LOCAL_BOOKED_APPOINTMENTS_KEY = APPOINTMENTS_KEY;
const PASSANT_FILE_NUMBER = "EBT-PAT-0001";

const STATUS_PILL_STYLES: Record<AppointmentStatus, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  RESCHEDULED: "bg-amber-50 text-amber-700 border border-amber-200",
  ARRIVED: "bg-sky-50 text-sky-700 border border-sky-200",
  IN_CHAIR: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
  NO_SHOW: "bg-slate-100 text-slate-600 border border-slate-300",
};

function writeBookedAppointment(updated: PersonalPatientVisit): boolean {
  upsertAppointment(updated);
  return true;
}

export default function PatientPersonalAppointmentsView({
  patientName = "Passant",
  patientId,
}: {
  patientName?: string;
  patientId?: string;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  // Demo seeded visits belong to Passant's file only; every other patient starts empty.
  const showSeedVisits = !patientId || patientId === PASSANT_FILE_NUMBER;
  const matchesPatient = (visit: PersonalPatientVisit) => {
    if (patientId) {
      if (visit.patientId) return visit.patientId === patientId;
      return visit.patientName.trim().toLowerCase() === patientName.trim().toLowerCase();
    }
    return visit.patientName.trim().toLowerCase() === patientName.trim().toLowerCase();
  };

  const [visits, setVisits] = useState<PersonalPatientVisit[]>(
    showSeedVisits ? INITIAL_PATIENT_VISITS : []
  );
  const [reschedulingVisit, setReschedulingVisit] =
    useState<PersonalPatientVisit | null>(null);
  const [newDate, setNewDate] = useState(clinicTodayISO());
  const [newTime, setNewTime] = useState("05:00 PM");
  const [newBranchCode, setNewBranchCode] = useState<"BR-A" | "BR-B" | "BR-C">("BR-A");
  const [cancellingVisit, setCancellingVisit] =
    useState<PersonalPatientVisit | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      const booked = listAppointments().filter(matchesPatient);
      const seeds = showSeedVisits ? INITIAL_PATIENT_VISITS : [];
      const bookedIds = new Set(booked.map((v) => v.id));
      setVisits([...booked, ...seeds.filter((seed) => !bookedIds.has(seed.id))]);
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener(APPOINTMENTS_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(APPOINTMENTS_EVENT, load);
    };
  }, [patientId, patientName, showSeedVisits]);

  const upcomingVisits = visits.filter((v) => !v.isPast && isActiveAppointment(v.status));
  const pastOrCancelledVisits = visits.filter(
    (v) => v.isPast || !isActiveAppointment(v.status)
  );

  const handleConfirmReschedule = () => {
    if (!reschedulingVisit) return;
    const branchObj =
      MINYA_BRANCHES.find((b) => b.code === newBranchCode) || MINYA_BRANCHES[0];
    // Keep the same doctor when they practice at the newly chosen branch;
    // otherwise fall back to that branch's first clinician.
    const doctor =
      branchObj.doctors.find((d) => d.nameEn === reschedulingVisit.doctorNameEn) ||
      branchObj.doctors[0];

    const isClosedFriday = new Date(`${newDate}T12:00:00Z`).getUTCDay() === 5;
    if (!newDate || newDate < clinicTodayISO() || isClosedFriday) {
      setToastMessage(
        isAr
          ? "اختر تاريخاً قادماً من السبت إلى الخميس (الجمعة إجازة)."
          : "Choose an upcoming date from Saturday to Thursday (Fridays are closed)."
      );
      return;
    }

    const conflict = isSlotTaken({
      date: newDate,
      time: newTime,
      branchCode: newBranchCode,
      doctorNameEn: doctor.nameEn,
      excludeId: reschedulingVisit.id,
    });
    if (conflict) {
      setToastMessage(
        isAr
          ? "هذا الوقت محجوز بالفعل لدى هذا الطبيب — يرجى اختيار وقت آخر."
          : "That slot is already booked with this doctor — please choose another time."
      );
      return;
    }

    const updated: PersonalPatientVisit = {
      ...reschedulingVisit,
      date: newDate,
      time: newTime,
      branchCode: branchObj.code,
      branchNameEn: branchObj.nameEn,
      branchNameAr: branchObj.nameAr,
      doctorNameEn: doctor.nameEn,
      doctorNameAr: doctor.nameAr,
      status: "RESCHEDULED",
      isPast: false,
    };
    setVisits((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    writeBookedAppointment(updated);
    setToastMessage(
      isAr
        ? `تم تعديل موعدك إلى ${newDate} الساعة ${newTime} في ${branchObj.nameAr}.`
        : `Your visit has been rescheduled to ${newDate} at ${newTime} (${branchObj.nameEn}).`
    );
    setReschedulingVisit(null);
  };

  const handleConfirmCancel = () => {
    if (!cancellingVisit) return;
    const updated: PersonalPatientVisit = {
      ...cancellingVisit,
      status: "CANCELLED",
      cancelReason: cancelReason.trim() || undefined,
    };
    setVisits((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    writeBookedAppointment(updated);
    setToastMessage(
      isAr
        ? "تم إلغاء الموعد بنجاح وإبلاغ مكتب الاستقبال."
        : "Your appointment has been cancelled and reception has been notified."
    );
    setCancellingVisit(null);
    setCancelReason("");
  };

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "مواعيدي وزياراتي الشخصية" : "My Personal Appointments & Visits"}
      className="space-y-8"
    >
      {/* Top Patient Header Bar with [+ Book New Appointment] */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-black text-blue-700">
              <Calendar className="h-3.5 w-3.5" />
              {isAr
                ? "مواعيدي الشخصية فقط — فروع المنيا (أ، ب، ج)"
                : "Personal Visits Only — Minya Branches A, B & C"}
            </span>
            <h2 className="mt-1.5 text-2xl font-black text-slate-900">
              {isAr
                ? `مواعيد وزيارات ${patientName === "Passant" ? "بسنت" : patientName}`
                : `${patientName}’s Upcoming & Past Visits`}
            </h2>
            <p className="text-sm text-slate-500">
              {isAr
                ? "استعرض مواعيدك القادمة وسجل زياراتك السابقة أو احجز موعداً جديداً في أي من فروع المنيا."
                : "View your confirmed upcoming appointments, reschedule or cancel a visit, or book a new slot across Minya Branch A, B, or C."}
            </p>
          </div>

          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? "+ حجز موعد جديد" : "+ Book New Appointment"}</span>
          </Link>
        </div>

        {toastMessage && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:underline"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 1. UPCOMING APPOINTMENTS */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900">
            {isAr ? "المواعيد القادمة" : "Upcoming Appointments"}
          </h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 tabular-nums">
            {upcomingVisits.length} {isAr ? "موعد قادم" : "Upcoming"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {upcomingVisits.map((visit) => (
            <div
              key={visit.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 shadow-2xs space-y-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0B2528] px-3 py-1 text-xs font-bold text-[#C8A96E]">
                    <MapPin className="h-3.5 w-3.5" />
                    {isAr ? visit.branchNameAr : visit.branchNameEn}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${STATUS_PILL_STYLES[visit.status]}`}
                  >
                    ● {appointmentStatusLabel(visit.status, isAr)}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900">
                  {isAr ? visit.serviceAr : visit.serviceEn}
                </h4>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    {isAr ? visit.doctorNameAr : visit.doctorNameEn}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold tabular-nums">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {visit.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 tabular-nums">
                    <Clock className="h-4 w-4" />
                    {visit.time}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-200/70 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setReschedulingVisit(visit);
                    setNewDate(visit.date);
                    setNewTime(visit.time);
                    setNewBranchCode(visit.branchCode);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-800 shadow-2xs transition hover:border-blue-600 hover:text-blue-600"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isAr ? "تأجيل / تغيير الموعد" : "Reschedule"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCancellingVisit(visit)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>{isAr ? "إلغاء الزيارة" : "Cancel Visit"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PAST VISITS HISTORY */}
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-black text-slate-900">
            {isAr ? "سجل الزيارات السابقة" : "Past Visits"}
          </h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 tabular-nums">
            {pastOrCancelledVisits.length} {isAr ? "زيارة" : "Visits"}
          </span>
        </div>

        <div className="space-y-3">
          {pastOrCancelledVisits.map((visit) => (
            <div
              key={visit.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    {isAr ? visit.branchNameAr : visit.branchNameEn}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    {visit.date} · {visit.time}
                  </span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {isAr ? visit.serviceAr : visit.serviceEn}
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {isAr ? visit.doctorNameAr : visit.doctorNameEn}
                </div>
              </div>

              <span
                className={`rounded-full px-3.5 py-1 text-xs font-black ${STATUS_PILL_STYLES[visit.status]}`}
              >
                {appointmentStatusLabel(visit.status, isAr)}
                {visit.status === "COMPLETED" ? " ✓" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: RESCHEDULE APPOINTMENT */}
      {reschedulingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "تغيير موعد الزيارة" : "Reschedule Your Appointment"}
              </h3>
              <button
                type="button"
                onClick={() => setReschedulingVisit(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "فرع المنيا" : "Minya Branch"}
                </label>
                <select
                  value={newBranchCode}
                  onChange={(e) =>
                    setNewBranchCode(e.target.value as "BR-A" | "BR-B" | "BR-C")
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                >
                  {MINYA_BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {isAr ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "التاريخ الجديد" : "New Date"}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    min={clinicTodayISO()}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "الوقت المفضل" : "Preferred Time"}
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  >
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingVisit(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReschedule}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700"
                >
                  {isAr ? "تأكيد الموعد الجديد" : "Confirm Reschedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL APPOINTMENT */}
      {cancellingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "تأكيد إلغاء الزيارة" : "Cancel Upcoming Visit"}
              </h3>
              <button
                type="button"
                onClick={() => setCancellingVisit(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                {isAr
                  ? `هل أنت متأكد من إلغاء موعد (${cancellingVisit.serviceAr}) يوم ${cancellingVisit.date}؟`
                  : `Are you sure you want to cancel "${cancellingVisit.serviceEn}" on ${cancellingVisit.date}?`}
              </p>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={isAr ? "سبب الإلغاء (اختياري)..." : "Reason for cancellation (optional)..."}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingVisit(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  {isAr ? "تراجع" : "Keep Visit"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700"
                >
                  {isAr ? "تأكيد الإلغاء" : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
