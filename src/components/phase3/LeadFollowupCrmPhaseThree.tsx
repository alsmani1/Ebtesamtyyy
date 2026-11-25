"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import type { Phase2Role } from "../phase2/FinanceCenterPhaseTwo";
import { clinicDateISO, clinicMonthLabel, clinicTodayISO } from "@/lib/clinic-clock";
import { SERVICES } from "@/lib/clinic-pricing";
import { MINYA_BRANCHES } from "@/config/minya-clinic-store";
import type { FinanceBranch } from "@/lib/clinic-costs";

export type LeadStage =
  | "new"
  | "contacted"
  | "interested"
  | "quote_sent"
  | "booked"
  | "converted"
  | "not_interested";

export type LossReason =
  | "Price"
  | "No reply"
  | "Too far"
  | "“I’ll think about it”";

interface CrmLeadRecord {
  id: string;
  branchCode: FinanceBranch;
  nameAr: string;
  nameEn: string;
  initialsAr: string;
  initialsEn: string;
  avatarBg: string;
  sourceAr: string;
  sourceEn: string;
  phone: string;
  ownerAr: string;
  ownerEn: string;
  stage: LeadStage;
  dueLabelAr: string;
  dueLabelEn: string;
  dueDate: string;
  isDueToday?: boolean;
  dealSizeEgp: number;
  lastInteractionAr: string;
  lastInteractionEn: string;
  lossReason?: LossReason;
  serviceInterestAr: string;
  serviceInterestEn: string;
}

export const INITIAL_CRM_LEADS: CrmLeadRecord[] = [
  {
    id: "LEAD-1",
    branchCode: "BR-A",
    nameAr: "سهير مجدي",
    nameEn: "Soheir Magdy",
    initialsAr: "سم",
    initialsEn: "SM",
    avatarBg: "bg-rose-600",
    sourceAr: "إنستجرام",
    sourceEn: "Instagram",
    phone: "01569248859",
    ownerAr: "نورهان (الاستقبال)",
    ownerEn: "Nourhan",
    stage: "not_interested",
    dueLabelAr: "—",
    dueLabelEn: "—",
    dueDate: "—",
    dealSizeEgp: SERVICES.whitening.price,
    lastInteractionAr: "منذ 4 أيام",
    lastInteractionEn: "4 days ago",
    lossReason: "Price",
    serviceInterestAr: "تبييض أسنان بالليزر",
    serviceInterestEn: "Laser Teeth Whitening",
  },
  {
    id: "LEAD-2",
    branchCode: "BR-B",
    nameAr: "محمد البنا",
    nameEn: "Mohamed El-Banna",
    initialsAr: "مب",
    initialsEn: "MB",
    avatarBg: "bg-emerald-600",
    sourceAr: "جوجل",
    sourceEn: "Google",
    phone: "01075839951",
    ownerAr: "د. أحمد حسن",
    ownerEn: "Dr. Ahmed Hassan",
    stage: "converted",
    dueLabelAr: "—",
    dueLabelEn: "—",
    dueDate: "—",
    dealSizeEgp: SERVICES.rct.price + SERVICES.scaling.price,
    lastInteractionAr: "منذ يومين",
    lastInteractionEn: "2 days ago",
    serviceInterestAr: "حشو عصب وجلسة تنظيف",
    serviceInterestEn: "Root Canal & Scaling",
  },
  {
    id: "LEAD-3",
    branchCode: "BR-A",
    nameAr: "ندى إسماعيل",
    nameEn: "Nada Ismail",
    initialsAr: "نإ",
    initialsEn: "NI",
    avatarBg: "bg-blue-600",
    sourceAr: "الموقع",
    sourceEn: "Website",
    phone: "01170594706",
    ownerAr: "نورهان (الاستقبال)",
    ownerEn: "Nourhan",
    stage: "interested",
    dueLabelAr: "بعد 5 أيام",
    dueLabelEn: "In 5 days",
    dueDate: clinicDateISO(5),
    dealSizeEgp: SERVICES.crown.price,
    lastInteractionAr: "منذ 3 أيام",
    lastInteractionEn: "3 days ago",
    serviceInterestAr: "تاج زيركون تجميلي",
    serviceInterestEn: "Zirconia Crown",
  },
  {
    id: "LEAD-4",
    branchCode: "BR-A",
    nameAr: "عبد الله رأفت",
    nameEn: "Abdullah Raafat",
    initialsAr: "عر",
    initialsEn: "AR",
    avatarBg: "bg-amber-600",
    sourceAr: "فيسبوك",
    sourceEn: "Facebook",
    phone: "01594447698",
    ownerAr: "نورهان (الاستقبال)",
    ownerEn: "Nourhan",
    stage: "contacted",
    dueLabelAr: "اليوم",
    dueLabelEn: "Today",
    dueDate: clinicTodayISO(),
    isDueToday: true,
    dealSizeEgp: SERVICES.consult.price + SERVICES.scaling.price,
    lastInteractionAr: "اليوم 10:15 ص",
    lastInteractionEn: "Today 10:15 AM",
    serviceInterestAr: "كشف وتنظيف الجير",
    serviceInterestEn: "Consultation & Scaling",
  },
  {
    id: "LEAD-5",
    branchCode: "BR-A",
    nameAr: "كريم فؤاد",
    nameEn: "Karim Fouad",
    initialsAr: "كف",
    initialsEn: "KF",
    avatarBg: "bg-amber-700",
    sourceAr: "الموقع",
    sourceEn: "Website",
    phone: "01587796506",
    ownerAr: "نورهان (الاستقبال)",
    ownerEn: "Nourhan",
    stage: "contacted",
    dueLabelAr: "بعد 6 أيام",
    dueLabelEn: "In 6 days",
    dueDate: clinicDateISO(6),
    dealSizeEgp: SERVICES.implant.price,
    lastInteractionAr: "منذ يومين",
    lastInteractionEn: "2 days ago",
    lossReason: "“I’ll think about it”",
    serviceInterestAr: "زراعة أسنان فورية",
    serviceInterestEn: "Immediate Dental Implant",
  },
  {
    id: "LEAD-6",
    branchCode: "BR-C",
    nameAr: "مي حسام",
    nameEn: "Mai Hossam",
    initialsAr: "مح",
    initialsEn: "MH",
    avatarBg: "bg-sky-600",
    sourceAr: "إنستجرام",
    sourceEn: "Instagram",
    phone: "01063520533",
    ownerAr: "د. نادية الحريري",
    ownerEn: "Dr. Nadia El-Hariry",
    stage: "interested",
    dueLabelAr: "اليوم",
    dueLabelEn: "Today",
    dueDate: clinicTodayISO(),
    isDueToday: true,
    dealSizeEgp: SERVICES.veneer.price * 6,
    lastInteractionAr: "منذ يوم",
    lastInteractionEn: "1 day ago",
    serviceInterestAr: "ابتسامة هوليوود (فينير)",
    serviceInterestEn: "Hollywood Smile Veneers",
  },
  {
    id: "LEAD-7",
    branchCode: "BR-A",
    nameAr: "رحمة صلاح",
    nameEn: "Rahma Salah",
    initialsAr: "رص",
    initialsEn: "RS",
    avatarBg: "bg-teal-600",
    sourceAr: "جوجل",
    sourceEn: "Google",
    phone: "01032930113",
    ownerAr: "نورهان (الاستقبال)",
    ownerEn: "Nourhan",
    stage: "booked",
    dueLabelAr: "بعد يومين",
    dueLabelEn: "In 2 days",
    dueDate: clinicDateISO(2),
    dealSizeEgp: SERVICES.braces.price,
    lastInteractionAr: "أمس",
    lastInteractionEn: "Yesterday",
    serviceInterestAr: "تقويم شفاف",
    serviceInterestEn: "Clear Aligners",
  },
  {
    id: "LEAD-8",
    branchCode: "BR-A",
    nameAr: "هاني عبد المنعم",
    nameEn: "Hany Abdelmoneim",
    initialsAr: "هع",
    initialsEn: "HA",
    avatarBg: "bg-slate-600",
    sourceAr: "الموقع",
    sourceEn: "Website",
    phone: "01043372369",
    ownerAr: "نورهان (الاستقبال)",
    ownerEn: "Nourhan",
    stage: "new",
    dueLabelAr: "غداً",
    dueLabelEn: "Tomorrow",
    dueDate: clinicDateISO(1),
    dealSizeEgp: SERVICES.implant.price,
    lastInteractionAr: "تسجيل تلقائي من الموقع",
    lastInteractionEn: "Auto-recorded from website",
    serviceInterestAr: "زراعة سن خلفي",
    serviceInterestEn: "Molar Implant",
  },
];

export default function LeadFollowupCrmPhaseThree({
  role = "clinic_owner",
  branchCode = "ALL",
}: {
  role?: Phase2Role;
  branchCode?: FinanceBranch | "ALL";
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [leads, setLeads] = useState<CrmLeadRecord[]>(INITIAL_CRM_LEADS);
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [topBucket, setTopBucket] = useState<"all" | "following" | "converted" | "lost">("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<CrmLeadRecord | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);

  const branchLabel = (code: FinanceBranch) =>
    MINYA_BRANCHES.find((b) => b.code === code)?.[isAr ? "nameAr" : "nameEn"] ?? code;

  const branchLeads = useMemo(
    () =>
      branchCode === "ALL"
        ? leads
        : leads.filter((lead) => lead.branchCode === branchCode),
    [leads, branchCode]
  );

  const bucketCounts = useMemo(
    () => ({
      all: branchLeads.length,
      following: branchLeads.filter(
        (l) => l.stage !== "converted" && l.stage !== "not_interested"
      ).length,
      converted: branchLeads.filter((l) => l.stage === "converted").length,
      lost: branchLeads.filter((l) => l.stage === "not_interested").length,
    }),
    [branchLeads]
  );

  const funnel = useMemo(() => {
    const has = (stages: LeadStage[]) =>
      branchLeads.filter((l) => stages.includes(l.stage)).length;
    return {
      enquiry: branchLeads.length,
      replied: has(["contacted", "interested", "quote_sent", "booked", "converted"]),
      quote: has(["quote_sent", "booked", "converted"]),
      appointment: has(["booked", "converted"]),
    };
  }, [branchLeads]);

  const lossCounts = useMemo(
    () =>
      (["Price", "No reply", "Too far", "“I’ll think about it”"] as LossReason[]).map(
        (reason) => ({
          reason,
          count: branchLeads.filter(
            (l) => l.stage === "not_interested" && l.lossReason === reason
          ).length,
        })
      ),
    [branchLeads]
  );

  // New Lead Modal form state
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadSource, setNewLeadSource] = useState("الموقع");
  const [newLeadOwner, setNewLeadOwner] = useState("نورهان (الاستقبال)");
  const [newLeadDealSize, setNewLeadDealSize] = useState(6000);
  const [newLeadBranch, setNewLeadBranch] = useState<FinanceBranch>(
    branchCode === "ALL" ? "BR-A" : branchCode
  );

  const filteredLeads = useMemo(() => {
    return branchLeads.filter((l) => {
      if (topBucket === "following" && (l.stage === "converted" || l.stage === "not_interested"))
        return false;
      if (topBucket === "converted" && l.stage !== "converted") return false;
      if (topBucket === "lost" && l.stage !== "not_interested") return false;
      if (stageFilter !== "all" && l.stage !== stageFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.nameAr.includes(q) ||
        l.nameEn.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.sourceAr.includes(q) ||
        l.sourceEn.toLowerCase().includes(q)
      );
    });
  }, [branchLeads, topBucket, stageFilter, searchQuery]);

  // Doctor & Patient do not see CRM per RBAC matrix
  if (role === "doctor" || role === "patient") {
    return null;
  }

  const handleStageUpdate = (leadId: string, nextStage: LeadStage, reason?: LossReason) => {
    setLeads((prev) =>
      prev.map((item) =>
        item.id === leadId
          ? {
              ...item,
              stage: nextStage,
              lossReason: reason ?? item.lossReason,
            }
          : item
      )
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) =>
        prev ? { ...prev, stage: nextStage, lossReason: reason ?? prev.lossReason } : null
      );
    }
  };

  const handleDeferReminder = (leadId: string, labelAr: string, labelEn: string, dateStr: string) => {
    setLeads((prev) =>
      prev.map((item) =>
        item.id === leadId
          ? {
              ...item,
              dueLabelAr: labelAr,
              dueLabelEn: labelEn,
              dueDate: dateStr,
              isDueToday: labelEn === "Today",
            }
          : item
      )
    );
  };

  const handleAddLead = () => {
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;
    const created: CrmLeadRecord = {
      id: `LEAD-${Date.now()}`,
      branchCode: newLeadBranch,
      nameAr: newLeadName.trim(),
      nameEn: newLeadName.trim(),
      initialsAr: newLeadName.trim().slice(0, 2),
      initialsEn: newLeadName.trim().slice(0, 2).toUpperCase(),
      avatarBg: "bg-blue-600",
      sourceAr: newLeadSource,
      sourceEn: newLeadSource === "الموقع" ? "Website" : newLeadSource,
      phone: newLeadPhone.trim(),
      ownerAr: newLeadOwner,
      ownerEn: newLeadOwner,
      stage: "new",
      dueLabelAr: "غداً",
      dueLabelEn: "Tomorrow",
      dueDate: clinicDateISO(1),
      dealSizeEgp: Number(newLeadDealSize) || SERVICES.crown.price,
      lastInteractionAr: "الآن",
      lastInteractionEn: "Just now",
      serviceInterestAr: "استفسار وحجز جديد",
      serviceInterestEn: "New enquiry & booking",
    };
    setLeads((prev) => [created, ...prev]);
    setNewLeadName("");
    setNewLeadPhone("");
    setShowNewLeadModal(false);
  };

  const getStageBadge = (stage: LeadStage) => {
    switch (stage) {
      case "not_interested":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "text-rose-500",
          labelAr: "غير مهتم",
          labelEn: "Not interested",
        };
      case "converted":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "text-emerald-500",
          labelAr: "تم التحويل",
          labelEn: "Converted",
        };
      case "interested":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "text-blue-500",
          labelAr: "مهتم",
          labelEn: "Interested",
        };
      case "contacted":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "text-amber-500",
          labelAr: "تم التواصل",
          labelEn: "Contacted",
        };
      case "quote_sent":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "text-purple-500",
          labelAr: "عرض السعر",
          labelEn: "Quote sent",
        };
      case "booked":
        return {
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          dot: "text-teal-500",
          labelAr: "محجوز موعد",
          labelEn: "Appointment set",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "text-slate-500",
          labelAr: "جديد",
          labelEn: "New enquiry",
        };
    }
  };

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "العملاء المتوقعون ومتابعة العملاء CRM" : "Lead Follow-up CRM"}
      className="space-y-6"
    >
      {/* MAIN CRM LEADS BOARD / TABLE CARD — Exact match to Image 1 & Image 2 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isAr ? "العملاء المتوقعون" : "Prospective Leads (CRM)"}
            </h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              {branchCode === "ALL" ? (isAr ? "كل الفروع" : "All branches") : branchLabel(branchCode)}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              {isAr
                ? "حجوزات الموقع تُسجل تلقائياً · لكل استفسار مسؤول ومرحلة"
                : "Website bookings auto-recorded · Owner & stage for every enquiry"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setViewMode((v) => (v === "table" ? "board" : "table"))}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              {viewMode === "table" ? (
                <>
                  <LayoutGrid className="h-4 w-4 text-slate-500" />
                  <span>{isAr ? "اللوحة" : "Board View"}</span>
                </>
              ) : (
                <>
                  <TableIcon className="h-4 w-4 text-slate-500" />
                  <span>{isAr ? "الجدول" : "Table View"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setNewLeadBranch(branchCode === "ALL" ? "BR-A" : branchCode);
                setShowNewLeadModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {isAr ? "عميل جديد" : "New Lead"}
            </button>
          </div>
        </div>

        {/* Status Bucket Pills & Search Row — Exact match to Image 1 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTopBucket("all")}
              className={`rounded-xl px-3.5 py-1.5 transition ${
                topBucket === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "الكل" : "All"}{" "}
              <span className="ms-1 text-blue-600 tabular-nums">{bucketCounts.all}</span>
            </button>
            <button
              type="button"
              onClick={() => setTopBucket("following")}
              className={`rounded-xl px-3.5 py-1.5 transition ${
                topBucket === "following"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "قيد المتابعة" : "Following Up"}{" "}
              <span className="ms-1 text-slate-500 tabular-nums">{bucketCounts.following}</span>
            </button>
            <button
              type="button"
              onClick={() => setTopBucket("converted")}
              className={`rounded-xl px-3.5 py-1.5 transition ${
                topBucket === "converted"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "تم التحويل" : "Converted"}{" "}
              <span className="ms-1 text-emerald-600 tabular-nums">{bucketCounts.converted}</span>
            </button>
            <button
              type="button"
              onClick={() => setTopBucket("lost")}
              className={`rounded-xl px-3.5 py-1.5 transition ${
                topBucket === "lost"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isAr ? "خسارة" : "Lost"}{" "}
              <span className="ms-1 text-rose-600 tabular-nums">{bucketCounts.lost}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[230px]">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAr ? "بحث بالاسم أو الهاتف أو العلامة..." : "Search name, phone or source..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 ps-10 pe-4 text-xs font-medium text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <select
              aria-label={isAr ? "تصفية حسب المرحلة" : "Filter by stage"}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value="all">{isAr ? "كل المراحل" : "All Stages"}</option>
              <option value="new">{isAr ? "جديد" : "New Enquiry"}</option>
              <option value="contacted">{isAr ? "تم التواصل" : "Replied / Contacted"}</option>
              <option value="interested">{isAr ? "مهتم" : "Interested"}</option>
              <option value="quote_sent">{isAr ? "عرض السعر" : "Quote Sent"}</option>
              <option value="booked">{isAr ? "محجوز موعد" : "Appointment Set"}</option>
              <option value="converted">{isAr ? "تم التحويل" : "Converted"}</option>
              <option value="not_interested">{isAr ? "غير مهتم" : "Lost / Not Interested"}</option>
            </select>
          </div>
        </div>

        {/* VIEW 1: TABLE VIEW — Exact match to Image 1 */}
        {viewMode === "table" ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[920px] border-separate border-spacing-y-2 text-xs">
              <thead>
                <tr className="text-slate-400 font-bold">
                  <th className="px-3 py-2 text-start">{isAr ? "الاسم" : "Name & Source"}</th>
                  <th className="px-3 py-2 text-start">
                    {isAr ? "تحديد هوية العميل" : "Lead Identity"}
                  </th>
                  <th className="px-3 py-2 text-start">{isAr ? "رقم الهاتف" : "Phone"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "المسؤول" : "Owner"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "المرحلة" : "Stage"}</th>
                  <th className="px-3 py-2 text-start">
                    {isAr ? "تاريخ الاستحقاق" : "Follow-up Due"}
                  </th>
                  <th className="px-3 py-2 text-start">{isAr ? "حجم الصفقة" : "Deal Size"}</th>
                  <th className="px-3 py-2 text-end">
                    {isAr ? "التفاعل الأخير" : "Last Interaction"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const badge = getStageBadge(lead.stage);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="cursor-pointer rounded-2xl border border-slate-200/60 bg-white shadow-2xs transition hover:bg-slate-50/80"
                    >
                      <td className="rounded-s-2xl px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${lead.avatarBg}`}
                          >
                            {isAr ? lead.initialsAr : lead.initialsEn}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">
                              {isAr ? lead.nameAr : lead.nameEn}
                              {branchCode === "ALL" && (
                                <span className="ms-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
                                  {branchLabel(lead.branchCode)}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">
                              {isAr ? lead.sourceAr : lead.sourceEn}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          ● ✧ {isAr ? "عميل جديد" : "New Lead"}
                        </span>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="font-bold text-slate-800">{lead.phone}</span>
                          <a
                            href={`tel:${lead.phone}`}
                            className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"
                            title={isAr ? "اتصال" : "Call"}
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/201200054405?text=${encodeURIComponent(
                              `مرحباً ${lead.nameAr}، عيادة ابتسامتي للتواصل بخصوص ${lead.serviceInterestAr}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-emerald-200 bg-emerald-50 p-1 text-emerald-600 hover:bg-emerald-100"
                            title="WhatsApp (+201200054405)"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-600">
                        {isAr ? lead.ownerAr : lead.ownerEn}
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          aria-label={isAr ? "تغيير مرحلة العميل" : "Change lead stage"}
                          value={lead.stage}
                          onChange={(e) =>
                            handleStageUpdate(lead.id, e.target.value as LeadStage)
                          }
                          className={`rounded-full border px-3 py-1 text-[11px] font-bold ${badge.bg}`}
                        >
                          <option value="new">● {isAr ? "جديد" : "New"}</option>
                          <option value="contacted">● {isAr ? "تم التواصل" : "Contacted"}</option>
                          <option value="interested">● {isAr ? "مهتم" : "Interested"}</option>
                          <option value="quote_sent">● {isAr ? "عرض السعر" : "Quote sent"}</option>
                          <option value="booked">● {isAr ? "محجوز موعد" : "Appointment set"}</option>
                          <option value="converted">● {isAr ? "تم التحويل" : "Converted"}</option>
                          <option value="not_interested">
                            ● {isAr ? "غير مهتم" : "Not interested"}
                          </option>
                        </select>
                        {lead.lossReason && lead.stage === "not_interested" && (
                          <div className="mt-1 text-[10px] font-bold text-rose-600">
                            {isAr ? "السبب:" : "Reason:"} {lead.lossReason}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        <div
                          className={`font-bold ${
                            lead.isDueToday ? "text-amber-600" : "text-slate-600"
                          }`}
                        >
                          {isAr ? lead.dueLabelAr : lead.dueLabelEn}
                        </div>
                        {lead.dueDate !== "—" && (
                          <div className="text-[11px] text-slate-400">{lead.dueDate}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 font-black text-slate-900 tabular-nums">
                        {lead.dealSizeEgp.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                      </td>
                      <td className="rounded-e-2xl px-3 py-3 text-end text-slate-500">
                        {isAr ? lead.lastInteractionAr : lead.lastInteractionEn}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW 2: KANBAN PIPELINE BOARD — Exact match to Image 2 */
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              {
                key: "new",
                titleAr: "جدد محتملون",
                titleEn: "New Enquiries",
                headerBg: "bg-blue-50 text-blue-800 border-blue-200",
                stages: ["new"] as LeadStage[],
              },
              {
                key: "qualified",
                titleAr: "مؤهلات عالية",
                titleEn: "High Qualification",
                headerBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
                stages: ["interested"] as LeadStage[],
              },
              {
                key: "discussion",
                titleAr: "قيد مناقشة",
                titleEn: "In Discussion",
                headerBg: "bg-amber-50 text-amber-800 border-amber-200",
                stages: ["contacted"] as LeadStage[],
              },
              {
                key: "quote",
                titleAr: "عرض السعر / موعد",
                titleEn: "Quote & Booked",
                headerBg: "bg-purple-50 text-purple-800 border-purple-200",
                stages: ["quote_sent", "booked"] as LeadStage[],
              },
              {
                key: "closed",
                titleAr: "مغلق / محوّل",
                titleEn: "Closed / Converted",
                headerBg: "bg-slate-100 text-slate-800 border-slate-200",
                stages: ["converted", "not_interested"] as LeadStage[],
              },
            ].map((col) => {
              const colLeads = branchLeads.filter((l) => col.stages.includes(l.stage));
              return (
                <div
                  key={col.key}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2.5"
                >
                  <div
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-black ${col.headerBg}`}
                  >
                    <span>{isAr ? col.titleAr : col.titleEn}</span>
                    <span className="tabular-nums">{colLeads.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colLeads.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => setSelectedLead(l)}
                        className="cursor-pointer rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs transition hover:border-blue-400"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {isAr ? l.nameAr : l.nameEn}
                          </span>
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white ${l.avatarBg}`}
                          >
                            {isAr ? l.initialsAr : l.initialsEn}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {isAr ? l.sourceAr : l.sourceEn} ·{" "}
                          <span className="font-bold text-slate-800 tabular-nums">
                            {l.dealSizeEgp.toLocaleString()} EGP
                          </span>
                        </div>
                        <div className="mt-1.5 text-[10px] font-semibold text-amber-700">
                          {isAr ? l.dueLabelAr : l.dueLabelEn}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* LOWER SPLIT ROW: Image 3 ("Where are we losing?") & Lead Inspector Drawer Card (Image 2 Mobile Profile) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* IMAGE 3 EXACT CARD: Where are we losing? (September) */}
        <div
          dir="ltr"
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Where are we losing?</h3>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-600">
              {clinicMonthLabel(-1, "en")}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
              {[
                { label: "Enquiry", value: funnel.enquiry, color: "bg-blue-600" },
                { label: "Replied", value: funnel.replied, color: "bg-blue-600" },
                { label: "Quote sent", value: funnel.quote, color: "bg-blue-600" },
                { label: "Appointment set", value: funnel.appointment, color: "bg-emerald-600" },
              ].map((row) => (
                <div key={row.label} className="border-b border-slate-100 py-2 last:border-0">
                  <div className="flex items-center justify-between text-sm font-black text-slate-900">
                    <span>{row.label}</span>
                    <span className="tabular-nums">{row.value}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{
                        width: `${
                          funnel.enquiry ? Math.round((row.value / funnel.enquiry) * 100) : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loss reasons pills — derived from the active branch's lost leads */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-500">Loss reasons</div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {lossCounts.map((entry, index) => {
                const styles = [
                  "border-rose-200 bg-rose-50 text-rose-700",
                  "border-amber-200 bg-amber-50 text-amber-700",
                  "border-slate-200 bg-slate-100 text-slate-700",
                  "border-purple-200 bg-purple-50 text-purple-700",
                ];
                return (
                  <span
                    key={entry.reason}
                    className={`rounded-full border px-3.5 py-1 text-xs font-black ${styles[index]}`}
                  >
                    {entry.reason} · {entry.count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* IMAGE 2 LEAD PROFILE & DEFERRED FOLLOW-UP REMINDER CARD */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
          {selectedLead ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-white ${selectedLead.avatarBg}`}
                  >
                    {isAr ? selectedLead.initialsAr : selectedLead.initialsEn}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {isAr ? selectedLead.nameAr : selectedLead.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {selectedLead.phone} · {isAr ? selectedLead.sourceAr : selectedLead.sourceEn}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {isAr ? "ملف العميل" : "Lead Profile"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                  <div className="text-slate-400 font-bold">
                    {isAr ? "المسؤول عن المتابعة" : "Assigned Owner"}
                  </div>
                  <div className="mt-1 font-black text-slate-900">
                    {isAr ? selectedLead.ownerAr : selectedLead.ownerEn}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
                  <div className="text-slate-400 font-bold">
                    {isAr ? "الخدمة المطلوبة" : "Enquired Service"}
                  </div>
                  <div className="mt-1 font-black text-slate-900">
                    {isAr ? selectedLead.serviceInterestAr : selectedLead.serviceInterestEn}
                  </div>
                </div>
              </div>

              {/* Deferred Follow-up with a Reminder ("Whoever said 'I'll think about it' is not forgotten") */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900">
                    {isAr
                      ? "المتابعة المؤجلة مع تذكير تلقائي"
                      : "Deferred Follow-up with a Reminder"}
                  </span>
                  <span className="font-bold text-amber-700">
                    {isAr ? selectedLead.dueLabelAr : selectedLead.dueLabelEn} (
                    {selectedLead.dueDate})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleDeferReminder(selectedLead.id, "غداً", "Tomorrow", clinicDateISO(1))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isAr ? "تذكير غداً" : "Tomorrow"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeferReminder(selectedLead.id, "بعد 3 أيام", "In 3 days", clinicDateISO(3))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isAr ? "بعد 3 أيام" : "In 3 days"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeferReminder(selectedLead.id, "بعد أسبوع", "In 1 week", clinicDateISO(7))
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600"
                  >
                    {isAr ? "أسبوع (“سأفكر في الأمر”)" : "1 Week (“I’ll think about it”)"}
                  </button>
                </div>
              </div>

              {/* Loss Reason Selector */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  {isAr
                    ? "تسجيل سبب عدم الإتمام (لمعالجة السبب بدل تكراره):"
                    : "Record loss reason if enquiry does not go ahead:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["Price", "No reply", "Too far", "“I’ll think about it”"] as LossReason[]
                  ).map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() =>
                        handleStageUpdate(selectedLead.id, "not_interested", reason)
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                        selectedLead.lossReason === reason
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-rose-50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  {isAr
                    ? "متابعة العميل وتذكير المؤجلين"
                    : "Lead Follow-up & Deferred Reminders"}
                </h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  WhatsApp +201200054405
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "اضغط على أي عميل من الجدول لعرض ملفه، تحديد موعد تذكير لمن قال (سأفكر في الأمر)، أو تسجيل سبب الخسارة."
                  : "Click any lead row to inspect their profile, schedule a deferred follow-up reminder, or log a loss reason."}
              </p>
              <div className="space-y-2.5">
                {branchLeads.slice(2, 5).map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 hover:bg-white"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {isAr ? l.nameAr : l.nameEn} · {isAr ? l.sourceAr : l.sourceEn}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isAr ? l.serviceInterestAr : l.serviceInterestEn}
                      </div>
                    </div>
                    <span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {isAr ? l.dueLabelAr : l.dueLabelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add New Lead */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "إضافة عميل متوقع جديد" : "Add New Prospective Lead"}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewLeadModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "اسم العميل" : "Lead Name"}
                </label>
                <input
                  type="text"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder={isAr ? "مثال: سلمى فؤاد" : "e.g. Salma Fouad"}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  placeholder="010..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "الفرع" : "Branch"}
                </label>
                <select
                  value={newLeadBranch}
                  disabled={branchCode !== "ALL"}
                  onChange={(e) => setNewLeadBranch(e.target.value as FinanceBranch)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold disabled:bg-slate-50 disabled:text-slate-500"
                >
                  {MINYA_BRANCHES.filter((b) => b.code !== "ALL").map((b) => (
                    <option key={b.code} value={b.code}>
                      {isAr ? b.nameAr : b.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "مصدر الاستفسار" : "Enquiry Source"}
                  </label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  >
                    <option value="الموقع">الموقع (Website)</option>
                    <option value="واتساب">واتساب (WhatsApp)</option>
                    <option value="إنستجرام">إنستجرام (Instagram)</option>
                    <option value="فيسبوك">فيسبوك (Facebook)</option>
                    <option value="جوجل">جوجل (Google)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "المسؤول" : "Assigned Owner"}
                  </label>
                  <input
                    type="text"
                    value={newLeadOwner}
                    onChange={(e) => setNewLeadOwner(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-700">
                  {isAr ? "حجم الصفقة المتوقع (ج.م)" : "Expected Value (EGP)"}
                </label>
                <input
                  type="number"
                  value={newLeadDealSize}
                  onChange={(e) => setNewLeadDealSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleAddLead}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {isAr ? "حفظ العميل" : "Save Lead"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
