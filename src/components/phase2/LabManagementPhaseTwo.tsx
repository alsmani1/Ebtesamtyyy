"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  X,
  CalendarCheck,
} from "lucide-react";
import type { Phase2Role } from "./FinanceCenterPhaseTwo";
import { clinicDateISO } from "@/lib/clinic-clock";
import { SERVICES } from "@/lib/clinic-pricing";
import type { FinanceBranch } from "@/lib/clinic-costs";
import { MINYA_BRANCHES } from "@/config/minya-clinic-store";
import {
  LAB_ORDERS_EVENT,
  LAB_ORDERS_KEY,
  usePersistedState,
} from "@/lib/use-persisted-state";

export type LabOrderStatus = "sent" | "in_progress" | "ready" | "received";

const LAB_STATUS_LABEL: Record<LabOrderStatus, { ar: string; en: string }> = {
  sent: { ar: "تم الإرسال", en: "Sent" },
  in_progress: { ar: "قيد التنفيذ", en: "In progress" },
  ready: { ar: "جاهز", en: "Ready" },
  received: { ar: "تم الإبلاغ", en: "Notified" },
};

export interface LabOrderRecord {
  id: string;
  branchCode: FinanceBranch;
  patientNameAr: string;
  patientNameEn: string;
  itemSummaryAr: string;
  itemSummaryEn: string;
  tooth: string;
  shade: string;
  isUrgent?: boolean;
  dueDate: string;
  isOverdue?: boolean;
  status: LabOrderStatus;
  labNameAr: string;
  labNameEn: string;
  doctorNameAr: string;
  doctorNameEn: string;
  labCostEgp: number;
  fittingBooked?: boolean;
  courierTimestamp?: string;
}

export const INITIAL_LAB_ORDERS: LabOrderRecord[] = [
  {
    id: "L-318",
    branchCode: "BR-A",
    patientNameAr: "عمرو يوسف مرسي",
    patientNameEn: "Amr Youssef Morsy",
    itemSummaryAr: "تاج زيركون",
    itemSummaryEn: "Zirconia Crown",
    tooth: "47",
    shade: "A2",
    dueDate: clinicDateISO(1),
    status: "sent",
    labNameAr: "معمل الأطلس للتركيبات",
    labNameEn: "Atlas Dental Lab",
    doctorNameAr: "د. فيبي سامر",
    doctorNameEn: "Dr. Feby Samer",
    labCostEgp: 900,
  },
  {
    id: "L-319",
    branchCode: "BR-A",
    patientNameAr: "سارة كريم عبد الله",
    patientNameEn: "Sara Karim Abdullah",
    itemSummaryAr: "جسر 3 وحدات",
    itemSummaryEn: "3-Unit Bridge",
    tooth: "46",
    shade: "A2",
    dueDate: clinicDateISO(4),
    status: "sent",
    labNameAr: "معمل الأطلس للتركيبات",
    labNameEn: "Atlas Dental Lab",
    doctorNameAr: "د. ساندي سعد",
    doctorNameEn: "Dr. Sandy Saad",
    labCostEgp: 2400,
  },
  {
    id: "L-320",
    branchCode: "BR-A",
    patientNameAr: "عمرو مروان صبري",
    patientNameEn: "Amr Marwan Sabry",
    itemSummaryAr: "تاج ستانلس",
    itemSummaryEn: "Stainless Crown",
    tooth: "26",
    shade: "—",
    dueDate: clinicDateISO(2),
    status: "sent",
    labNameAr: "معمل الأطلس للتركيبات",
    labNameEn: "Atlas Dental Lab",
    doctorNameAr: "د. فيبي سامر",
    doctorNameEn: "Dr. Feby Samer",
    labCostEgp: 450,
  },
  {
    id: "L-321",
    branchCode: "BR-A",
    patientNameAr: "حسام أحمد إبراهيم",
    patientNameEn: "Hossam Ahmed Ibrahim",
    itemSummaryAr: "جسر 3 وحدات",
    itemSummaryEn: "3-Unit Bridge",
    tooth: "27",
    shade: "A1",
    isUrgent: true,
    dueDate: clinicDateISO(1),
    status: "in_progress",
    labNameAr: "معمل كراون تك",
    labNameEn: "CrownTech Lab",
    doctorNameAr: "د. ساندي سعد",
    doctorNameEn: "Dr. Sandy Saad",
    labCostEgp: 2550,
  },
  {
    id: "L-322",
    branchCode: "BR-B",
    patientNameAr: "يوسف ياسين علي",
    patientNameEn: "Youssef Yassin Ali",
    itemSummaryAr: "تاج زيركون",
    itemSummaryEn: "Zirconia Crown",
    tooth: "12",
    shade: "A3",
    dueDate: clinicDateISO(3),
    status: "in_progress",
    labNameAr: "معمل الأطلس للتركيبات",
    labNameEn: "Atlas Dental Lab",
    doctorNameAr: "د. أحمد حسن",
    doctorNameEn: "Dr. Ahmed Hassan",
    labCostEgp: 900,
  },
  {
    id: "L-323",
    branchCode: "BR-A",
    patientNameAr: "أسماء مروان عبد العزيز",
    patientNameEn: "Asmaa Marwan Abdelaziz",
    itemSummaryAr: "تاج بورسلين",
    itemSummaryEn: "Porcelain Crown",
    tooth: "22",
    shade: "A2",
    dueDate: clinicDateISO(2),
    status: "in_progress",
    labNameAr: "معمل كراون تك",
    labNameEn: "CrownTech Lab",
    doctorNameAr: "د. فيبي سامر",
    doctorNameEn: "Dr. Feby Samer",
    labCostEgp: 750,
  },
  {
    id: "L-302",
    branchCode: "BR-B",
    patientNameAr: "محمود أحمد إبراهيم",
    patientNameEn: "Mahmoud Ahmed Ibrahim",
    itemSummaryAr: "تاج زيركون",
    itemSummaryEn: "Zirconia Crown",
    tooth: "47",
    shade: "A3.5",
    dueDate: clinicDateISO(-2),
    isOverdue: true,
    status: "in_progress",
    labNameAr: "لاب ديزاين",
    labNameEn: "Lab Design",
    doctorNameAr: "د. يوسف المنسي",
    doctorNameEn: "Dr. Youssef El-Mansy",
    labCostEgp: 900,
  },
  {
    id: "L-311",
    branchCode: "BR-A",
    patientNameAr: "رنا مروان عبد العزيز",
    patientNameEn: "Rana Marwan Abdelaziz",
    itemSummaryAr: "تاج بورسلين",
    itemSummaryEn: "Porcelain Crown",
    tooth: "34",
    shade: "A3",
    dueDate: clinicDateISO(0),
    status: "ready",
    labNameAr: "لاب ديزاين",
    labNameEn: "Lab Design",
    doctorNameAr: "د. ساندي سعد",
    doctorNameEn: "Dr. Sandy Saad",
    labCostEgp: 800,
    fittingBooked: true,
  },
  {
    id: "L-312",
    branchCode: "BR-C",
    patientNameAr: "ليلى حسين كمال",
    patientNameEn: "Laila Hussein",
    itemSummaryAr: "فينير تجميلي",
    itemSummaryEn: "Veneers",
    tooth: "11-21",
    shade: "BL2",
    dueDate: clinicDateISO(-5),
    status: "received",
    labNameAr: "معمل النور",
    labNameEn: "Al Nour Lab",
    doctorNameAr: "د. نادية الحريري",
    doctorNameEn: "Dr. Nadia El-Hariry",
    labCostEgp: 1800,
    fittingBooked: true,
  },
];

export default function LabManagementPhaseTwo({
  role = "clinic_owner",
  branchCode = "ALL",
  initialStatusFilter = "all",
}: {
  role?: Phase2Role;
  branchCode?: FinanceBranch | "ALL";
  initialStatusFilter?: "all" | LabOrderStatus;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [orders, setOrders] = usePersistedState<LabOrderRecord[]>(
    LAB_ORDERS_KEY,
    INITIAL_LAB_ORDERS,
    LAB_ORDERS_EVENT
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LabOrderStatus>(
    initialStatusFilter
  );
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Interactive Toggle for Image 14 ("Deduct lab cost before the dentist's percentage")
  const [deductLabBeforeDentistPct, setDeductLabBeforeDentistPct] = useState(true);

  // New Lab Order Form State
  const [newPatientName, setNewPatientName] = useState("محمد أحمد");
  const [newWorkType, setNewWorkType] = useState("تاج زيركون");
  const [newTooth, setNewTooth] = useState("36");
  const [newShade, setNewShade] = useState("A2");
  const [newLabName, setNewLabName] = useState("معمل النور (Al Nour Lab)");
  const [newInstructions, setNewInstructions] = useState("حواف عنقية دقيقة مع مرفق صور القياس");
  const [newDueDate, setNewDueDate] = useState(clinicDateISO(7));
  const [newBranchCode, setNewBranchCode] = useState<FinanceBranch>(
    branchCode === "ALL" ? "BR-A" : branchCode
  );

  // Fitting appointment guard alert
  const [fittingGuardMessage, setFittingGuardMessage] = useState<string | null>(null);

  const branchLabel = (code: FinanceBranch) => {
    const found = MINYA_BRANCHES.find((b) => b.code === code);
    return found ? (isAr ? found.nameAr : found.nameEn) : code;
  };

  const branchOrders = useMemo(
    () =>
      branchCode === "ALL"
        ? orders
        : orders.filter((ord) => ord.branchCode === branchCode),
    [orders, branchCode]
  );

  const filteredOrders = useMemo(() => {
    return branchOrders.filter((ord) => {
      if (statusFilter === "ready") {
        if (ord.status !== "ready" && ord.status !== "received") return false;
      } else if (statusFilter !== "all" && ord.status !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ord.patientNameAr.includes(q) ||
        ord.patientNameEn.toLowerCase().includes(q) ||
        ord.itemSummaryAr.includes(q) ||
        ord.itemSummaryEn.toLowerCase().includes(q) ||
        ord.labNameAr.includes(q) ||
        ord.tooth.includes(q)
      );
    });
  }, [branchOrders, statusFilter, searchQuery]);

  const trackingOrders = useMemo(
    () =>
      [...branchOrders]
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 3),
    [branchOrders]
  );
  const lateOrdersCount = branchOrders.filter((ord) => ord.isOverdue).length;

  // Case Calculation Math (Image 14) — Zirconia crown case, all figures from the shared price list
  const casePrice = SERVICES.crown.price;
  const labCost = SERVICES.crown.labCost;
  const dentistPct = SERVICES.crown.doctorSharePercent;
  const dentistShare = deductLabBeforeDentistPct
    ? Math.round(((casePrice - labCost) * dentistPct) / 100)
    : Math.round((casePrice * dentistPct) / 100);
  const clinicProfitFromCase = casePrice - labCost - dentistShare;

  const handleStatusChange = (orderId: string, nextStatus: LabOrderStatus) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: nextStatus,
              isOverdue: nextStatus === "ready" || nextStatus === "received" ? false : o.isOverdue,
              courierTimestamp:
                nextStatus === "sent"
                  ? `Courier Picked Up · ${nowTime}`
                  : nextStatus === "ready"
                  ? `Arrived at Clinic · ${nowTime}`
                  : nextStatus === "received"
                  ? `Patient Notified · ${nowTime}`
                  : o.courierTimestamp,
            }
          : o
      )
    );
  };

  const handleBookFittingVisit = (order: LabOrderRecord) => {
    if (order.status !== "ready" && order.status !== "received") {
      setFittingGuardMessage(
        isAr
          ? `تنبيه: لا يمكن إبلاغ المريض أو حجز جلسة التركيب (${order.patientNameAr}) قبل وصول العمل من المعمل!`
          : `Guard: Cannot notify patient or book fitting visit for ${order.patientNameEn} before the lab case arrives at the clinic!`
      );
      return;
    }
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              fittingBooked: true,
              status: "received",
              courierTimestamp: `Patient Notified · ${nowTime}`,
            }
          : o
      )
    );
    setFittingGuardMessage(
      isAr
        ? `تم إبلاغ المريض (${order.patientNameAr}) بوصول التركيبة وحجز موعد جلسة التركيب بنجاح.`
        : `Notified ${order.patientNameEn} that lab case arrived and booked fitting visit.`
    );
  };

  const handleCreateLabOrder = () => {
    if (!newPatientName.trim() || !newTooth.trim()) return;
    const branchDoctor =
      MINYA_BRANCHES.find((b) => b.code === newBranchCode)?.doctors[0];
    const created: LabOrderRecord = {
      id: `L-${Math.floor(330 + Math.random() * 60)}`,
      branchCode: newBranchCode,
      patientNameAr: newPatientName.trim(),
      patientNameEn: newPatientName.trim(),
      itemSummaryAr: newWorkType,
      itemSummaryEn: newWorkType,
      tooth: newTooth,
      shade: newShade,
      dueDate: newDueDate,
      status: "sent",
      labNameAr: newLabName,
      labNameEn: newLabName,
      doctorNameAr: branchDoctor?.nameAr ?? "د. ساندي سعد",
      doctorNameEn: branchDoctor?.nameEn ?? "Dr. Sandy Saad",
      labCostEgp: 900,
    };
    setOrders((prev) => [created, ...prev]);
    setShowNewOrderModal(false);
  };

  // Patient Status View (Simplified Prosthetics Tracker e.g. "Crown ready")
  if (role === "patient") {
    return (
      <section
        dir={isAr ? "rtl" : "ltr"}
        aria-label={isAr ? "متابعة تركيبات المعمل" : "Patient Lab Prosthetics Status"}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FlaskConical className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "حالة تركيبة الأسنان بالمعمل" : "Your Dental Lab Prosthetics Status"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "لا يتم تحديد جلسة التركيب إلا بعد جاهزية واستلام العمل من المعمل"
                  : "Fitting appointments are scheduled automatically once your crown/veneer arrives"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black text-emerald-700">
            ● {isAr ? "تاج زيركون جاهز للتركيب (Crown Ready)" : "Zirconia Crown Ready to Fit"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
            <div className="font-black text-emerald-950">
              #L-311 {isAr ? "تاج بورسلين / فينير" : "Porcelain Crown / Veneers"}
            </div>
            <div className="mt-1 text-emerald-700 font-semibold">
              {isAr ? "الحالة: جاهز في العيادة لجلستك القادمة" : "Status: Ready at clinic for fitting"}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="font-bold text-slate-700">{isAr ? "السن واللون" : "Tooth & Shade"}</div>
            <div className="mt-1 font-black text-slate-900">Tooth #34 · Shade A2</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div className="font-bold text-slate-700">
              {isAr ? "موعد جلسة التركيب" : "Fitting Appointment"}
            </div>
            <div className="mt-1 font-black text-blue-600">
              {isAr ? "مؤكد مع د. ساندي سعد" : "Confirmed with Dr. Sandy Saad"}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "طلبات المعمل" : "Lab Management"}
      className="space-y-6"
    >
      {/* MAIN LAB ORDERS TABLE CARD — Exact match to Image 12 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isAr ? "طلبات المعمل" : "Lab Orders"}
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 tabular-nums">
              {branchOrders.length}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {branchCode === "ALL"
                ? isAr
                  ? "كل الفروع"
                  : "All branches"
                : branchLabel(branchCode)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700">
              <LayoutGrid className="h-4 w-4 text-slate-400" />
              {isAr ? "اللوحة" : "Board"}
            </span>

            {role !== "receptionist" && (
              <button
                type="button"
                onClick={() => {
                  setNewBranchCode(branchCode === "ALL" ? "BR-A" : branchCode);
                  setShowNewOrderModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {isAr ? "طلب جديد" : "New Lab Order"}
              </button>
            )}
          </div>
        </div>

        {fittingGuardMessage && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-xs font-bold text-blue-900">
            <span>{fittingGuardMessage}</span>
            <button
              type="button"
              onClick={() => setFittingGuardMessage(null)}
              className="text-blue-600 hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Filter Row — Exact match to Image 12 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[230px] flex-1">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "بحث بالمريض، السن، أو المعمل..." : "Search patient, tooth or lab..."}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 ps-10 pe-4 text-xs font-medium text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700">
              ‹ {isAr ? "كل الفترات" : "All Periods"} ›
            </span>

            <select
              aria-label={isAr ? "حالة طلب المعمل" : "Lab Order Status"}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | LabOrderStatus)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700"
            >
              <option value="all">{isAr ? "الحالة (الكل)" : "Status (All)"}</option>
              <option value="sent">{isAr ? "تم الطلب (Sent)" : "Sent"}</option>
              <option value="in_progress">{isAr ? "قيد التنفيذ (In progress)" : "In progress"}</option>
              <option value="ready">{isAr ? "جاهز للاستلام (Ready)" : "Ready"}</option>
              <option value="received">{isAr ? "تم التسليم (Received)" : "Received"}</option>
            </select>

            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              {isAr ? "فلاتر إضافية" : "More Filters"}
            </span>
          </div>
        </div>

        {/* Lab Orders Table — Exact match to Image 12 */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[880px] border-separate border-spacing-y-2 text-xs">
            <thead>
              <tr className="text-slate-400 font-bold">
                <th className="px-3 py-2 text-start">{isAr ? "المريض" : "Patient"}</th>
                <th className="px-3 py-2 text-start">{isAr ? "بند المعمل" : "Lab Item"}</th>
                <th className="px-3 py-2 text-start">{isAr ? "تاريخ الاستحقاق" : "Due Date"}</th>
                <th className="px-3 py-2 text-start">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-3 py-2 text-start">{isAr ? "المعمل" : "Lab"}</th>
                <th className="px-3 py-2 text-start">{isAr ? "الطبيب" : "Dentist"}</th>
                <th className="px-3 py-2 text-end">{isAr ? "موعد التركيب" : "Fitting Visit"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="rounded-2xl border border-slate-200/60 bg-white shadow-2xs transition hover:bg-slate-50/80"
                >
                  <td className="rounded-s-2xl px-3 py-3 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{isAr ? ord.patientNameAr : ord.patientNameEn}</span>
                      {branchCode === "ALL" && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                          {branchLabel(ord.branchCode)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-900">
                        {isAr ? ord.itemSummaryAr : ord.itemSummaryEn}
                      </span>
                      {ord.isUrgent && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600">
                          ● {isAr ? "عاجل" : "Urgent"}
                        </span>
                      )}
                      <span className="text-slate-400">
                        · {isAr ? `سن ${ord.tooth}` : `Tooth ${ord.tooth}`}
                        {ord.shade !== "—" ? (isAr ? ` · لون ${ord.shade}` : ` · Shade ${ord.shade}`) : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    <span
                      className={`font-bold ${
                        ord.isOverdue ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {ord.isOverdue && "▲ "}
                      {ord.dueDate}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      aria-label={isAr ? "تحديث حالة الطلب" : "Update status"}
                      value={ord.status}
                      onChange={(e) =>
                        handleStatusChange(ord.id, e.target.value as LabOrderStatus)
                      }
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                        ord.status === "sent"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : ord.status === "in_progress"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : ord.status === "ready"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      <option value="sent">
                        ● {isAr ? "تم الإرسال للمعمل (Sent to Lab)" : "Sent to Lab"}
                      </option>
                      <option value="in_progress">
                        ● {isAr ? "قيد التنفيذ بالمعمل" : "In Progress"}
                      </option>
                      <option value="ready">
                        ● {isAr ? "وصل العيادة (Arrived at Clinic)" : "Arrived at Clinic"}
                      </option>
                      <option value="received">
                        ● {isAr ? "تم إبلاغ المريض (Patient Notified)" : "Patient Notified"}
                      </option>
                    </select>
                    {ord.courierTimestamp && (
                      <div className="mt-1 text-[10px] font-semibold text-slate-500 tabular-nums">
                        {ord.courierTimestamp}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-600">
                    {isAr ? ord.labNameAr : ord.labNameEn}
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-700">
                    {isAr ? ord.doctorNameAr : ord.doctorNameEn}
                  </td>
                  <td className="rounded-e-2xl px-3 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => handleBookFittingVisit(ord)}
                      className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-[11px] font-bold transition ${
                        ord.fittingBooked
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : ord.status === "ready" || ord.status === "received"
                          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {ord.fittingBooked
                        ? isAr
                          ? "تم إبلاغ المريض وحجز التركيب ✓"
                          : "Patient Notified & Fitting Booked ✓"
                        : isAr
                        ? "إبلاغ المريض لحجز التركيب"
                        : "Notify Patient to Book Fitting"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOWER SPLIT ROW: Image 13 ("Order tracking · 1 late") & Image 14 ("Lab cost in the case calculation") */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* IMAGE 13 EXACT CARD: Order tracking (1 late) */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">
              {isAr ? "تتبع طلبات المعمل" : "Order tracking"}
            </h3>
            <span
              className={`rounded-full border px-3.5 py-1 text-xs font-black ${
                lateOrdersCount > 0
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {lateOrdersCount > 0
                ? isAr
                  ? `${lateOrdersCount} متأخر`
                  : `${lateOrdersCount} late`
                : isAr
                ? "لا تأخير"
                : "On time"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {trackingOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs font-semibold text-slate-500">
                {isAr ? "لا توجد طلبات معمل لهذا الفرع" : "No lab orders for this branch"}
              </div>
            ) : (
              trackingOrders.map((ord) => {
                const late = Boolean(ord.isOverdue);
                const ready = ord.status === "ready" || ord.status === "received";
                const chipClass = late
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : ord.status === "in_progress"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : ord.status === "sent"
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700";
                const circleClass = late
                  ? "bg-rose-500"
                  : ready
                  ? "bg-emerald-600"
                  : ord.status === "in_progress"
                  ? "bg-amber-500"
                  : "bg-blue-600";
                return (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${circleClass}`}
                      >
                        {late ? "!" : ready ? "✓" : ord.id.slice(-1)}
                      </span>
                      <div>
                        <div className="text-sm font-black text-slate-900">
                          {`#${ord.id} ${isAr ? ord.itemSummaryAr : ord.itemSummaryEn} · ${
                            isAr ? ord.patientNameAr : ord.patientNameEn
                          }`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {isAr
                            ? `${ord.labNameAr} · ${late ? "كان مستحقاً" : "مستحق"} ${ord.dueDate}`
                            : `${ord.labNameEn} · ${late ? "was due" : "due"} ${ord.dueDate}`}
                          {branchCode === "ALL" ? ` · ${branchLabel(ord.branchCode)}` : ""}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-3.5 py-1 text-xs font-black ${chipClass}`}
                    >
                      {late
                        ? isAr
                          ? "متأخر"
                          : "Late"
                        : isAr
                        ? LAB_STATUS_LABEL[ord.status].ar
                        : LAB_STATUS_LABEL[ord.status].en}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 text-xs text-slate-500">
            {isAr
              ? "أي طلب يتجاوز موعد استحقاقه يظهر على لوحة التحكم قبل حضور المريض"
              : "Anything past due shows on the dashboard before the patient arrives"}
          </div>
        </div>

        {/* IMAGE 14 EXACT CARD: Lab cost in the case calculation (Visible to Owner & Doctor) */}
        {role !== "receptionist" ? (
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "تكلفة المعمل في حساب الحالة" : "Lab cost in the case calculation"}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {isAr ? "معمل النور · الحساب" : "Al Nour Lab · Account"}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {/* Row 1 */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                    S
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr ? "سعر الحالة" : "Case price"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? "تاج زيركون" : "Zirconia crown"}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 tabular-nums">
                  {casePrice.toLocaleString()}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">
                    L
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr ? "تكلفة المعمل" : "Lab cost"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? "معمل النور" : "Al Nour Lab"}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 tabular-nums">
                  −{labCost.toLocaleString()}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-black text-white">
                    D
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr ? `نسبة الطبيب ${dentistPct}%` : `Dentist share ${dentistPct}%`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {deductLabBeforeDentistPct
                        ? isAr
                          ? "بعد خصم تكلفة المعمل"
                          : "After deducting the lab"
                        : isAr
                        ? "قبل خصم تكلفة المعمل"
                        : "Before deducting the lab"}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 tabular-nums">
                  −{dentistShare.toLocaleString()}
                </span>
              </div>

              {/* Interactive Toggle Row */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {isAr
                      ? "خصم تكلفة المعمل قبل حساب نسبة الطبيب"
                      : "Deduct lab cost before the dentist's percentage"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isAr ? "حسب الاتفاق المعتمد" : "As you have agreed"}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={deductLabBeforeDentistPct}
                  onClick={() => setDeductLabBeforeDentistPct((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    deductLabBeforeDentistPct ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                      deductLabBeforeDentistPct ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Summary Bar */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-blue-50/70 px-4 py-3.5">
              <span className="text-xs font-black text-slate-800">
                {isAr ? "صافي ربح العيادة من الحالة" : "Clinic profit from the case"}
              </span>
              <span className="text-base font-black text-blue-600 tabular-nums">
                {isAr
                  ? `${clinicProfitFromCase.toLocaleString()} ج.م`
                  : `EGP ${clinicProfitFromCase.toLocaleString()}`}
              </span>
            </div>
          </div>
        ) : (
          /* Receptionist sees Courier Pickup/Delivery Timestamp Logger & Fitting Readiness Card instead of Owner Profit Calculation */
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-black text-slate-900">
              {isAr
                ? "تسجيل استلام/تسليم المندوب وإبلاغ المريض بموعد التركيب"
                : "Courier Pickup/Delivery Log & Patient Fitting Notification"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {isAr
                ? "سجّل وقت استلام المندوب أو وصول التركيبة للعيادة، ثم اضغط إبلاغ المريض لحجز جلسة التركيب."
                : "Log courier pickup/delivery timestamps and notify the patient to book their fitting visit once arrived."}
            </p>
            <div className="mt-4 space-y-2.5 text-xs">
              {branchOrders.slice(0, 4).map((o) => (
                <div
                  key={o.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      #{o.id} · {isAr ? o.patientNameAr : o.patientNameEn} ·{" "}
                      {isAr ? o.itemSummaryAr : o.itemSummaryEn}
                    </div>
                    <div className="text-slate-500">
                      {isAr ? o.labNameAr : o.labNameEn} · {o.dueDate}
                      {o.courierTimestamp ? ` · ${o.courierTimestamp}` : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(o.id, "sent")}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-bold text-blue-700 hover:bg-blue-100"
                    >
                      {isAr ? "تسليم للمندوب" : "Log Courier Pickup"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(o.id, "ready")}
                      className="rounded-xl bg-emerald-600 px-2.5 py-1.5 font-bold text-white hover:bg-emerald-700"
                    >
                      {isAr ? "وصل العيادة" : "Arrived at Clinic"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBookFittingVisit(o)}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100"
                    >
                      {isAr ? "إبلاغ المريض للتركيب" : "Notify Patient to Book Fitting"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: New Lab Order with Tooth, Work Type, Shade, Instructions & Photo Attachments */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isAr ? "أمر شغل معمل جديد ببياناته الكاملة" : "An Order with All Its Details"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "السن، نوع التركيبة، اللون، التعليمات، ومرفقات الصور والقياسات"
                    : "Tooth, type of work, shade, instructions, and photo/measurement attachments"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "المريض" : "Patient"}
                  </label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "نوع التركيبة" : "Type of Work"}
                  </label>
                  <select
                    value={newWorkType}
                    onChange={(e) => setNewWorkType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  >
                    <option value="تاج زيركون">تاج زيركون (Zirconia Crown)</option>
                    <option value="جسر 3 وحدات">جسر 3 وحدات (3-Unit Bridge)</option>
                    <option value="فينير تجميلي">فينير تجميلي (Porcelain Veneer)</option>
                    <option value="طقم متحرك جزئي">طقم متحرك جزئي (Partial Denture)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "رقم السن (FDI)" : "Tooth #"}
                  </label>
                  <input
                    type="text"
                    value={newTooth}
                    onChange={(e) => setNewTooth(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "درجة اللون (Shade)" : "Vita Shade"}
                  </label>
                  <select
                    value={newShade}
                    onChange={(e) => setNewShade(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A3">A3</option>
                    <option value="A3.5">A3.5</option>
                    <option value="BL2">BL2 (Bleach)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "تاريخ الاستحقاق" : "Due Date"}
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "الفرع" : "Branch"}
                </label>
                <select
                  value={newBranchCode}
                  disabled={branchCode !== "ALL"}
                  onChange={(e) => setNewBranchCode(e.target.value as FinanceBranch)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {MINYA_BRANCHES.filter((b) => b.code !== "ALL").map((b) => (
                    <option key={b.code} value={b.code}>
                      {isAr ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "المعمل" : "Dental Lab"}
                </label>
                <input
                  type="text"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "تعليمات الطبيب ومرفقات الصور والقياسات" : "Instructions & Photo Attachments"}
                </label>
                <textarea
                  rows={2}
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-slate-600">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span>
                    {isAr
                      ? "تم إرفاق صورة اللون وملف المسح الرقمي (STL / Shade Photo)"
                      : "Shade photo & intraoral scan measurements attached"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleCreateLabOrder}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {isAr ? "إرسال الطلب للمعمل" : "Send Order to Lab"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
