"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Shield,
  Plus,
  Download,
  Search,
  Filter,
  Wallet,
  Edit3,
  MoreHorizontal,
  X,
  Calendar,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  AlertTriangle,
  FileText,
  Sparkles,
  Check,
  UserCheck,
  Receipt,
} from "lucide-react";

import {
  PENDING_CLINICAL_CHARGES_KEY,
  PENDING_CLINICAL_CHARGES_EVENT,
  PendingClinicalChargeHandoff,
} from "../phase1/AnatomicalExamChart";
import { clinicDateISO, clinicMonthKey, clinicTodayISO } from "@/lib/clinic-clock";
import {
  currentMonthInvoiceSeed,
  currentMonthSeedTotals,
  doctorPerformance,
  financeKpis,
} from "@/lib/clinic-finance";
import { EXPENSE_CATEGORIES, PAYROLL_STAFF, expensesForMonth } from "@/lib/clinic-costs";
import type { FinanceBranch } from "@/lib/clinic-costs";
import {
  SHARED_INVOICES_EVENT,
  SHARED_INVOICES_STORAGE_KEY,
  listSharedInvoices,
  unpaidInvoiceInstallments,
  type SharedInvoiceRecord as InvoiceRecord,
} from "@/lib/finance-storage";
import { listPatients } from "@/lib/patients-db";
import {
  sendInvoiceCreatedNotification,
  sendPaymentReceivedNotification,
} from "@/lib/notifications-db";
import { SERVICES } from "@/lib/clinic-pricing";

export type Phase2Role = "clinic_owner" | "doctor" | "receptionist" | "patient";

interface ExpenseRow {
  id: string;
  letter: string;
  avatarBg: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  amount: number;
  supplier?: string;
}

const EXPENSE_ROW_META: Record<
  string,
  {
    letter: string;
    avatarBg: string;
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    supplier?: string;
  }
> = {
  Rent: {
    letter: "R",
    avatarBg: "bg-slate-600",
    titleEn: "Rent",
    titleAr: "إيجار العيادة",
    subtitleEn: "Fixed · all branches",
    subtitleAr: "ثابت · كل الفروع",
  },
  "Staff Salaries": {
    letter: "S",
    avatarBg: "bg-slate-600",
    titleEn: "Salaries",
    titleAr: "رواتب الفريق",
    subtitleEn: `Fixed · ${PAYROLL_STAFF.length} staff`,
    subtitleAr: `ثابت · ${PAYROLL_STAFF.length} موظفين`,
  },
  "Dental Materials & Supplies": {
    letter: "M",
    avatarBg: "bg-amber-500",
    titleEn: "Materials & supplies",
    titleAr: "خامات ومستلزمات",
    subtitleEn: "Variable · into inventory",
    subtitleAr: "متغير · مضاف للمخزن تلقائياً",
    supplier: "Al Sharq supplier",
  },
  "Lab Vendor Fees": {
    letter: "L",
    avatarBg: "bg-indigo-600",
    titleEn: "Lab vendor fees",
    titleAr: "رسوم المعامل",
    subtitleEn: "Variable · per case",
    subtitleAr: "متغير · لكل حالة",
    supplier: "Al Nour Lab / Atlas Dental Lab",
  },
  "Utilities & Maintenance": {
    letter: "U",
    avatarBg: "bg-teal-600",
    titleEn: "Utilities & maintenance",
    titleAr: "مرافق وصيانة",
    subtitleEn: "Fixed · electricity & service",
    subtitleAr: "ثابت · كهرباء وصيانة",
  },
  "Petty Cash": {
    letter: "P",
    avatarBg: "bg-purple-600",
    titleEn: "Petty cash",
    titleAr: "مصروفات نثرية يومية",
    subtitleEn: "Variable · daily small transactions",
    subtitleAr: "متغير · حركات يومية صغيرة",
  },
};

function expenseRowsForMonth(): ExpenseRow[] {
  const entries = expensesForMonth(clinicMonthKey());
  return EXPENSE_CATEGORIES.map((category) => {
    const meta = EXPENSE_ROW_META[category.id];
    const rows = entries.filter((entry) => entry.category === category.id);
    return {
      id: `EXP-${category.id}`,
      letter: meta.letter,
      avatarBg: meta.avatarBg,
      titleEn: meta.titleEn,
      titleAr: meta.titleAr,
      subtitleEn: meta.subtitleEn,
      subtitleAr: meta.subtitleAr,
      supplier: meta.supplier,
      amount: rows.reduce((sum, entry) => sum + entry.amountEgp, 0),
    };
  }).filter((row) => row.amount > 0);
}

const INITIAL_EXPENSES: ExpenseRow[] = expenseRowsForMonth();

export default function FinanceCenterPhaseTwo({
  role = "clinic_owner",
  doctorNameFilter,
  patientFileNumber,
  branchCode = "ALL",
}: {
  role?: Phase2Role;
  doctorNameFilter?: string;
  patientFileNumber?: string;
  branchCode?: FinanceBranch | "ALL";
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [activeSubTab, setActiveSubTab] = useState<
    "invoices" | "ready_to_collect" | "cash_closing" | "doctor_accounts"
  >(role === "doctor" ? "doctor_accounts" : "invoices");

  const [invoices, setInvoicesState] = useState<InvoiceRecord[]>(listSharedInvoices);
  const [pendingClinicalCharges, setPendingClinicalCharges] = useState<
    PendingClinicalChargeHandoff[]
  >([]);

  useEffect(() => {
    const handleSync = () => {
      setInvoicesState(listSharedInvoices());
      try {
        const savedCharges = window.localStorage.getItem(PENDING_CLINICAL_CHARGES_KEY);
        const parsedCharges = savedCharges ? JSON.parse(savedCharges) : [];
        if (Array.isArray(parsedCharges)) setPendingClinicalCharges(parsedCharges);
      } catch {}
    };
    handleSync();
    window.addEventListener("storage", handleSync);
    window.addEventListener(SHARED_INVOICES_EVENT, handleSync);
    window.addEventListener(PENDING_CLINICAL_CHARGES_EVENT, handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SHARED_INVOICES_EVENT, handleSync);
      window.removeEventListener(PENDING_CLINICAL_CHARGES_EVENT, handleSync);
    };
  }, []);

  const handleInvoicePendingClinicalCharge = (charge: PendingClinicalChargeHandoff) => {
    const newInv: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      patientId: charge.patientId,
      patientNameAr: charge.patientNameAr || charge.patientNameEn,
      patientNameEn: charge.patientNameEn,
      initialsAr: "بس",
      initialsEn: "PA",
      avatarBg: "bg-teal-600",
      branch: branchCode === "ALL" ? "BR-A" : branchCode,
      treatmentAr: charge.proceduresSummaryAr,
      treatmentEn: charge.proceduresSummaryEn,
      doctorAr: charge.doctorNameAr,
      doctorEn: charge.doctorNameEn,
      doctorColor: "text-blue-600",
      date: clinicTodayISO(),
      totalAmount: charge.totalAmountEgp,
      paidAmount: 0,
      paymentMethodAr: "—",
      paymentMethodEn: "—",
      methodType: "none",
      status: "unpaid",
    };

    const issuedAt = new Date();
    const savedInvoices = setInvoices((prev) => [newInv, ...prev]);
    if (!savedInvoices) return;

    const updatedCharges = pendingClinicalCharges.map((c) =>
      c.id === charge.id ? { ...c, status: "INVOICED" as const } : c
    );
    setPendingClinicalCharges(updatedCharges);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(PENDING_CLINICAL_CHARGES_KEY, JSON.stringify(updatedCharges));
        window.dispatchEvent(new Event(PENDING_CLINICAL_CHARGES_EVENT));
      } catch {}
    }
    sendInvoiceCreatedNotification(newInv, issuedAt);
  };

  const setInvoices = (
    updater: React.SetStateAction<InvoiceRecord[]>
  ): InvoiceRecord[] | null => {
    const next = typeof updater === "function" ? updater(listSharedInvoices()) : updater;
    try {
      window.localStorage.setItem(SHARED_INVOICES_STORAGE_KEY, JSON.stringify(next));
      setInvoicesState(next);
      window.dispatchEvent(new Event(SHARED_INVOICES_EVENT));
      return next;
    } catch {
      return null;
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");

  // Multi-method Split Payment Modal state
  const [payingInvoice, setPayingInvoice] = useState<InvoiceRecord | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [receptionPaymentNotice, setReceptionPaymentNotice] = useState<string | null>(null);

  // 1-Click Treatment Plan to Invoice & Server Discount Cap state
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [selectedPlanPatientId, setSelectedPlanPatientId] = useState("");
  const planPatients = listPatients().filter(
    (patient) => branchCode === "ALL" || patient.branchCode === branchCode
  );
  const selectedPlanPatient = planPatients.find(
    (patient) => patient.id === selectedPlanPatientId
  ) || planPatients[0];
  const [selectedPlanService, setSelectedPlanService] = useState("زراعة سن + تاج زيركون (Dental Implant + Zirconia Crown)");
  const [selectedPlanPrice, setSelectedPlanPrice] = useState(SERVICES.implant.price);
  const [selectedStaff, setSelectedStaff] = useState<"team" | "nourhan">("nourhan");
  const [attemptedDiscount, setAttemptedDiscount] = useState<number>(10);
  const [discountReason, setDiscountReason] = useState("خصم عائلي للمريض");
  const [installmentCount, setInstallmentCount] = useState<number>(2);

  // Expenses state
  const [, setExpenses] = useState<ExpenseRow[]>(INITIAL_EXPENSES);
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseSupplier, setNewExpenseSupplier] = useState("Al Sharq supplier");

  // Audit Log Drawer
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditEntries, setAuditEntries] = useState([
    {
      id: "AUD-1",
      time: "10:42 AM",
      actor: "نورهان (الاستقبال)",
      actionAr: "محاولة خصم 20% على فاتورة INV-964 — تم الرفض من الخادم (الحد الأقصى 15%)",
      actionEn: "Attempted 20% discount on INV-964 — Rejected by server (Personal cap 15%)",
      status: "rejected",
    },
    {
      id: "AUD-2",
      time: "10:15 AM",
      actor: "د. أحمد الشريف",
      actionAr: "تحويل خطة العلاج إلى فاتورة INV-680 بضغطة واحدة مع جدول أقساط",
      actionEn: "One-click invoice INV-680 created from Treatment Plan with installment schedule",
      status: "verified",
    },
    {
      id: "AUD-3",
      time: "09:50 AM",
      actor: "نورهان (الاستقبال)",
      actionAr: "تحصيل دفعة مركبة (نقدي + إنستاباي) على فاتورة INV-847",
      actionEn: "Collected split payment (Cash + InstaPay) on INV-847",
      status: "verified",
    },
  ]);

  const clinicCap = 10;
  const nourhanCap = 15;
  const activeCap = selectedStaff === "nourhan" ? nourhanCap : clinicCap;
  const isDiscountRejected = attemptedDiscount > activeCap;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (role !== "patient" && branchCode !== "ALL" && inv.branch !== branchCode) return false;
      if (role === "doctor" && doctorNameFilter) {
        if (
          !inv.doctorAr.includes(doctorNameFilter) &&
          !inv.doctorEn.toLowerCase().includes(doctorNameFilter.toLowerCase())
        ) {
          return false;
        }
      }
      if (role === "patient" && (!patientFileNumber || inv.patientId !== patientFileNumber)) {
        return false;
      }
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (activeSubTab === "ready_to_collect" && inv.status === "paid") return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        inv.id.toLowerCase().includes(q) ||
        inv.patientNameAr.includes(q) ||
        inv.patientNameEn.toLowerCase().includes(q) ||
        inv.treatmentAr.includes(q) ||
        inv.treatmentEn.toLowerCase().includes(q)
      );
    });
  }, [invoices, branchCode, role, doctorNameFilter, patientFileNumber, statusFilter, activeSubTab, searchQuery]);

  const kpis = useMemo(() => financeKpis(branchCode), [branchCode]);
  const branchSeed = useMemo(() => currentMonthInvoiceSeed(branchCode), [branchCode]);
  // A receptionist/doctor only works their assigned branch; the owner can still pick "ALL".
  const scopedInvoices = useMemo(
    () =>
      branchCode === "ALL"
        ? invoices
        : invoices.filter((inv) => inv.branch === branchCode),
    [invoices, branchCode]
  );

  // Session deltas: anything collected or invoiced through this screen on top of the branch ledger seed.
  const { paidDelta, arrearsDelta, cashCollected, instapayCollected, visaCollected } = useMemo(() => {
    let totalPaid = 0;
    let totalUnpaid = 0;
    let cash = 0;
    let instapay = 0;
    let visa = 0;
    const seedTotals = currentMonthSeedTotals(branchCode);

    for (const inv of scopedInvoices) {
      const paid = Number(inv.paidAmount) || 0;
      const total = Number(inv.totalAmount) || 0;
      totalPaid += paid;
      totalUnpaid += Math.max(0, total - paid);

      const init = branchSeed.find((i) => i.id === inv.id);
      const added = Math.max(0, paid - (init?.paidAmount ?? 0));
      if (added > 0) {
        if (inv.methodType === "instapay") instapay += added;
        else if (inv.methodType === "visa") visa += added;
        else cash += added;
      }
    }

    return {
      paidDelta: Math.max(0, totalPaid - seedTotals.paid),
      arrearsDelta: totalUnpaid - seedTotals.unpaid,
      cashCollected: cash,
      instapayCollected: instapay,
      visaCollected: visa,
    };
  }, [scopedInvoices, branchSeed, branchCode]);

  const dynamicTodayRevenue = kpis.todayCollected + paidDelta;
  const dynamicCollectedThisMonth = kpis.monthCollected + paidDelta;
  const dynamicOutstandingArrears = Math.max(0, kpis.arrears + arrearsDelta);
  const dynamicInsuranceReceivables = kpis.insuranceReceivables;
  const totalInvoicesCount =
    kpis.lifetimeInvoices + Math.max(0, scopedInvoices.length - branchSeed.length);

  const dynamicCashInDrawer = kpis.methodMix.cash + cashCollected;
  const dynamicInstaPay = kpis.methodMix.instapay + instapayCollected;
  const dynamicCardTerminal = kpis.methodMix.visa + visaCollected;
  const instapayTransfers = scopedInvoices.filter(
    (inv) => inv.methodType === "instapay" && inv.date.startsWith(clinicMonthKey())
  ).length;

  const handleOpenSplitPayment = (inv: InvoiceRecord) => {
    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
    setPayingInvoice(inv);
    setCashAmount(Math.round(remaining / 2));
    setCardAmount(remaining - Math.round(remaining / 2));
    setTransferAmount(0);
  };

  const handleConfirmSplitPayment = () => {
    if (!payingInvoice) return;
    const currentInvoice = listSharedInvoices().find((item) => item.id === payingInvoice.id);
    if (!currentInvoice) return;
    const added = Number(cashAmount || 0) + Number(cardAmount || 0) + Number(transferAmount || 0);
    const creditedAmount = Math.min(
      currentInvoice.totalAmount,
      currentInvoice.paidAmount + added
    ) - currentInvoice.paidAmount;
    if (creditedAmount <= 0) return;

    const methodsUsedAr: string[] = [];
    const methodsUsedEn: string[] = [];
    if (cashAmount > 0) {
      methodsUsedAr.push("نقدي");
      methodsUsedEn.push("Cash");
    }
    if (cardAmount > 0) {
      methodsUsedAr.push("فيزا");
      methodsUsedEn.push("Card");
    }
    if (transferAmount > 0) {
      methodsUsedAr.push("إنستاباي");
      methodsUsedEn.push("InstaPay");
    }

    const paidAt = new Date();
    const savedInvoices = setInvoices((prev) =>
      prev.map((item) => {
        if (item.id !== payingInvoice.id) return item;
        const newPaid = Math.min(item.totalAmount, item.paidAmount + added);
        const newStatus: "paid" | "partial" | "unpaid" =
          newPaid >= item.totalAmount ? "paid" : newPaid > 0 ? "partial" : "unpaid";
        const updatedInstallments = item.installments?.map((inst, idx) => {
          let cumBefore = 0;
          for (let k = 0; k < idx; k++) cumBefore += item.installments![k].amount;
          if (newPaid >= cumBefore + inst.amount) return { ...inst, status: "paid" as const };
          if (newPaid > cumBefore) return { ...inst, status: "due" as const };
          return inst;
        });
        return {
          ...item,
          paidAmount: newPaid,
          status: newStatus,
          paymentMethodAr: methodsUsedAr.join(" + "),
          paymentMethodEn: methodsUsedEn.join(" + "),
          methodType:
            methodsUsedAr.length > 1
              ? "split"
              : cashAmount > 0
              ? "cash"
              : cardAmount > 0
              ? "visa"
              : "instapay",
          installments: updatedInstallments || item.installments,
        };
      })
    );
    if (!savedInvoices) return;
    const updatedInvoice = savedInvoices.find((item) => item.id === payingInvoice.id);
    if (!updatedInvoice) return;

    sendPaymentReceivedNotification(
      updatedInvoice,
      creditedAmount,
      methodsUsedEn.join(" + "),
      methodsUsedAr.join(" + "),
      paidAt
    );
    setReceptionPaymentNotice(
      isAr
        ? `تم تحصيل ${creditedAmount.toLocaleString()} ج.م بنجاح على الفاتورة ${payingInvoice.id} عبر (${methodsUsedAr.join(" + ")}). تم تحديث الخزينة وإيرادات اليوم تلقائياً.`
        : `Successfully collected EGP ${creditedAmount.toLocaleString()} for ${payingInvoice.id} via ${methodsUsedEn.join(" + ")}. Drawer and Today's Revenue updated.`
    );
    setPayingInvoice(null);
  };

  const handleCreateInvoiceFromPlan = () => {
    if (isDiscountRejected) {
      setAuditEntries((prev) => [
        {
          id: `AUD-${Date.now()}`,
          time: "الآن",
          actor: selectedStaff === "nourhan" ? "نورهان — الاستقبال" : "موظف الاستقبال",
          actionAr: `رفض الخادم خصم ${attemptedDiscount}% (تجاوز الحد المسموح ${activeCap}%)`,
          actionEn: `Server rejected ${attemptedDiscount}% discount (Exceeds ${activeCap}% cap)`,
          status: "rejected",
        },
        ...prev,
      ]);
      return;
    }

    if (!selectedPlanPatient) return;
    const netTotal = Math.round(selectedPlanPrice * (1 - attemptedDiscount / 100));
    const perInstallment = Math.round(netTotal / Math.max(1, installmentCount));
    const newInv: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      patientId: selectedPlanPatient.id,
      patientNameAr: selectedPlanPatient.fullNameAr || selectedPlanPatient.fullName,
      patientNameEn: selectedPlanPatient.fullName,
      initialsAr: selectedPlanPatient.initialsAr,
      initialsEn: selectedPlanPatient.initials,
      avatarBg: selectedPlanPatient.avatarColor,
      branch: selectedPlanPatient.branchCode,
      treatmentAr: selectedPlanService,
      treatmentEn: selectedPlanService,
      doctorAr: selectedPlanPatient.primaryDoctorAr || "",
      doctorEn: selectedPlanPatient.primaryDoctorEn || "",
      doctorColor: "text-blue-600",
      date: clinicTodayISO(),
      totalAmount: netTotal,
      paidAmount: perInstallment,
      paymentMethodAr: "نقدي + إنستاباي",
      paymentMethodEn: "Cash + InstaPay",
      methodType: "split",
      status: installmentCount > 1 ? "partial" : "paid",
      discountPercent: attemptedDiscount,
      discountGivenBy: selectedStaff === "nourhan" ? "Nourhan — front desk" : "Clinic staff",
      discountReason,
      installments: Array.from({ length: installmentCount }).map((_, idx) => ({
        id: `INST-NEW-${idx + 1}`,
        dueDate: idx === 0 ? clinicTodayISO() : clinicDateISO(7 + idx),
        amount: idx === installmentCount - 1 ? netTotal - perInstallment * (installmentCount - 1) : perInstallment,
        status: idx === 0 ? "paid" : "due",
      })),
    };

    const issuedAt = new Date();
    const savedInvoices = setInvoices((prev) => [newInv, ...prev]);
    if (!savedInvoices) return;

    setShowNewInvoiceModal(false);
    sendInvoiceCreatedNotification(newInv, issuedAt);
    if (newInv.paidAmount > 0) {
      sendPaymentReceivedNotification(
        newInv,
        newInv.paidAmount,
        newInv.paymentMethodEn,
        newInv.paymentMethodAr,
        issuedAt
      );
    }
  };

  const handleAddExpense = () => {
    const val = Number(newExpenseAmount);
    if (!newExpenseTitle.trim() || !val || val <= 0) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: `EXP-${Date.now()}`,
        letter: newExpenseTitle.trim().charAt(0).toUpperCase() || "E",
        avatarBg: "bg-teal-600",
        titleEn: newExpenseTitle.trim(),
        titleAr: newExpenseTitle.trim(),
        subtitleEn: `Variable · ${newExpenseSupplier}`,
        subtitleAr: `متغير · ${newExpenseSupplier}`,
        amount: val,
        supplier: newExpenseSupplier,
      },
    ]);
    setNewExpenseTitle("");
    setNewExpenseAmount("");
  };

  // Patient Installment Payment Modal State
  const [patientPayAmount, setPatientPayAmount] = useState<number>(200);
  const [patientPayMethod, setPatientPayMethod] = useState<
    "Card / Visa / Mastercard" | "InstaPay" | "Fawry / Mobile Wallet"
  >("Card / Visa / Mastercard");
  const [patientPaymentSuccessMsg, setPatientPaymentSuccessMsg] = useState<string | null>(null);

  const handleOpenPatientInstallmentModal = (inv: InvoiceRecord) => {
    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
    const nextInst = unpaidInvoiceInstallments(inv)[0]?.amount;
    setPayingInvoice(inv);
    setPatientPayAmount(nextInst && nextInst <= remaining ? nextInst : remaining);
  };

  const handleConfirmPatientInstallmentPayment = () => {
    if (!payingInvoice) return;
    const currentInvoice = listSharedInvoices().find((item) => item.id === payingInvoice.id);
    if (!currentInvoice) return;
    const added = Math.max(0, Number(patientPayAmount || 0));
    const creditedAmount = Math.min(
      currentInvoice.totalAmount,
      currentInvoice.paidAmount + added
    ) - currentInvoice.paidAmount;
    if (creditedAmount <= 0) return;
    const methodAr =
      patientPayMethod === "InstaPay"
        ? "إنستاباي"
        : patientPayMethod === "Fawry / Mobile Wallet"
        ? "فوري / محفظة"
        : "بطاقة فيزا / ماستركارد";

    const paidAt = new Date();
    const savedInvoices = setInvoices((prev) =>
      prev.map((item) => {
        if (item.id !== payingInvoice.id) return item;
        const newPaid = Math.min(item.totalAmount, item.paidAmount + added);
        const newStatus: "paid" | "partial" | "unpaid" =
          newPaid >= item.totalAmount ? "paid" : newPaid > 0 ? "partial" : "unpaid";
        return {
          ...item,
          paidAmount: newPaid,
          status: newStatus,
          paymentMethodEn: patientPayMethod,
          paymentMethodAr: methodAr,
          methodType: patientPayMethod === "InstaPay" ? "instapay" : "visa",
        };
      })
    );
    if (!savedInvoices) return;
    const updatedInvoice = savedInvoices.find((item) => item.id === payingInvoice.id);
    if (!updatedInvoice) return;

    sendPaymentReceivedNotification(
      updatedInvoice,
      creditedAmount,
      patientPayMethod,
      methodAr,
      paidAt
    );
    setPatientPaymentSuccessMsg(
      isAr
        ? `تم سداد ${creditedAmount.toLocaleString()} ج.م بنجاح على الفاتورة ${payingInvoice.id} عبر (${methodAr}).`
        : `Successfully paid EGP ${creditedAmount.toLocaleString()} toward ${payingInvoice.id} (${payingInvoice.treatmentEn}) via ${patientPayMethod}.`
    );
    setPayingInvoice(null);
  };

  if (role === "patient") {
    const patientInvoicesList = filteredInvoices;
    const dynamicBalanceDue = patientInvoicesList.reduce(
      (sum, inv) => sum + Math.max(0, inv.totalAmount - inv.paidAmount),
      0
    );

    return (
      <section
        dir={isAr ? "rtl" : "ltr"}
        aria-label={isAr ? "المحفظة المالية والأقساط" : "Patient Financial Wallet & Installments"}
        className="space-y-6"
      >
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <Wallet className="h-3.5 w-3.5" />
                {isAr ? "المحفظة المالية والأقساط" : "Financial Wallet & Installment Schedule"}
              </span>
              <h2 className="mt-1 text-xl font-black text-slate-900">
                {isAr ? "فواتيرك وجدول الأقساط" : "Your Invoices & Installment Schedule"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-4 py-1.5 text-xs font-black tabular-nums ${
                  dynamicBalanceDue === 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {dynamicBalanceDue === 0
                  ? isAr
                    ? `خالص السداد ✓ (${dynamicBalanceDue.toLocaleString()} ج.م)`
                    : `All Settled ✓ (EGP ${dynamicBalanceDue.toLocaleString()})`
                  : isAr
                  ? `مدين بـ ${dynamicBalanceDue.toLocaleString()} ج.م`
                  : `Balance Due: EGP ${dynamicBalanceDue.toLocaleString()}`}
              </span>
            </div>
          </div>

          {patientPaymentSuccessMsg && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{patientPaymentSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setPatientPaymentSuccessMsg(null)}
                className="text-emerald-700 hover:underline"
              >
                ✕
              </button>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {patientInvoicesList.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-500">
                {isAr
                  ? "لا توجد فواتير مرتبطة بملفك حتى الآن."
                  : "No invoices are linked to your file yet."}
              </p>
            )}
            {patientInvoicesList.map((inv) => {
              const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
              const unpaidInstallments = unpaidInvoiceInstallments(inv);
              return (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-3.5 transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {isAr ? inv.treatmentAr : inv.treatmentEn}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        {inv.id} · {inv.date} · {isAr ? inv.doctorAr : inv.doctorEn}
                      </div>
                      {unpaidInstallments.map((installment) => (
                        <div key={installment.id} className="mt-1 text-xs font-semibold text-amber-700 tabular-nums">
                          {isAr
                            ? `قسط مستحق ${installment.amount.toLocaleString()} ج.م · ${installment.dueDate}`
                            : `Installment due: EGP ${installment.amount.toLocaleString()} · ${installment.dueDate}`}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-end tabular-nums">
                      <div className="text-sm font-black text-slate-900">
                        {inv.totalAmount.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          inv.status === "paid" ? "text-emerald-600" : "text-amber-700"
                        }`}
                      >
                        {isAr
                          ? `مدفوع ${inv.paidAmount.toLocaleString()} · متبقي ${remaining.toLocaleString()}`
                          : `Paid ${inv.paidAmount.toLocaleString()} · Remaining ${remaining.toLocaleString()}`}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        inv.status === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : inv.status === "partial"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      ●{" "}
                      {inv.status === "paid"
                        ? isAr
                          ? "مدفوعة"
                          : "Paid"
                        : inv.status === "partial"
                        ? isAr
                          ? "جزئي"
                          : "Partial"
                        : isAr
                        ? "غير مدفوعة"
                        : "Unpaid"}
                    </span>

                    {inv.status !== "paid" && (
                      <button
                        type="button"
                        onClick={() => handleOpenPatientInstallmentModal(inv)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
                      >
                        {isAr ? "دفع القسط" : "Pay Installment"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* WORKING INSTALLMENT PAYMENT MODAL FOR PATIENT */}
        {payingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isAr
                      ? `سداد قسط الفاتورة — ${payingInvoice.id}`
                      : `Pay Installment — ${payingInvoice.id}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? payingInvoice.treatmentAr : payingInvoice.treatmentEn}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Invoice Summary Breakdown */}
              <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50 p-3.5 text-center text-xs tabular-nums">
                <div>
                  <div className="text-slate-400 font-bold">
                    {isAr ? "الإجمالي" : "Total Amount"}
                  </div>
                  <div className="mt-1 font-black text-slate-900">
                    EGP {payingInvoice.totalAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold">
                    {isAr ? "المدفوع" : "Paid Amount"}
                  </div>
                  <div className="mt-1 font-black text-emerald-700">
                    EGP {payingInvoice.paidAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold">
                    {isAr ? "المتبقي" : "Remaining"}
                  </div>
                  <div className="mt-1 font-black text-rose-600">
                    EGP{" "}
                    {Math.max(
                      0,
                      payingInvoice.totalAmount - payingInvoice.paidAmount
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "مبلغ السداد (ج.م)" : "Payment Amount (EGP)"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, payingInvoice.totalAmount - payingInvoice.paidAmount)}
                    value={patientPayAmount}
                    onChange={(e) => setPatientPayAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-black text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "طريقة الدفع" : "Payment Method"}
                  </label>
                  <select
                    value={patientPayMethod}
                    onChange={(e) =>
                      setPatientPayMethod(
                        e.target.value as
                          | "Card / Visa / Mastercard"
                          | "InstaPay"
                          | "Fawry / Mobile Wallet"
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Card / Visa / Mastercard">
                      Card / Visa / Mastercard
                    </option>
                    <option value="InstaPay">InstaPay</option>
                    <option value="Fawry / Mobile Wallet">
                      Fawry / Mobile Wallet
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPatientInstallmentPayment}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-sm hover:bg-blue-700"
                >
                  {isAr ? "تأكيد الدفع" : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "المركز المالي" : "Finance Center"}
      className="space-y-6"
    >
      {/* MAIN FINANCE CENTER CARD — Exact match to Image 1 & Image 2 */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isAr ? "المركز المالي" : "Finance Center"}
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {role === "doctor"
                ? isAr
                  ? "عرض عمولات الطبيب فقط"
                  : "Doctor Commission View"
                : role === "receptionist"
                ? isAr
                  ? "إصدار الفواتير، تحصيل الأقساط، وتقفيل الخزنة"
                  : "Front-Desk Invoicing, Installment Collection & Cash Closing"
                : isAr
                ? "الفواتير والمدفوعات وحسابات الأطباء والتأمين"
                : "Invoices, Installments, Arrears & Doctor Accounts"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {role === "clinic_owner" && (
              <button
                type="button"
                onClick={() => setShowAuditModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
              >
                <Shield className="h-4 w-4 text-slate-500" />
                {isAr ? "سجل التدقيق" : "Audit Log"}
              </button>
            )}

            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-slate-500" />
              {isAr ? "تصدير PDF" : "Export PDF"}
            </button>

            {role === "receptionist" && (
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {isAr ? "فاتورة جديدة" : "New Invoice"}
              </button>
            )}
          </div>
        </div>

        {receptionPaymentNotice && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{receptionPaymentNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setReceptionPaymentNotice(null)}
              className="text-emerald-700 hover:underline shrink-0 ms-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* 4 Top Summary KPI Cards — Exact match to Image 1 & Image 2 */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: إيرادات اليوم */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-blue-50/40 to-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "إيرادات اليوم" : "Today's Revenue"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">
                {dynamicTodayRevenue.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
          </div>

          {/* Card 2: محصل هذا الشهر */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-emerald-50/40 to-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "محصل هذا الشهر" : "Collected This Month"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">
                {dynamicCollectedThisMonth.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
          </div>

          {/* Card 3: مبالغ مستحقة */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-amber-50/40 to-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "مبالغ مستحقة" : "Outstanding Arrears"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">
                {dynamicOutstandingArrears.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
          </div>

          {/* Card 4: على شركات التأمين */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/60 to-white p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{isAr ? "على شركات التأمين" : "Insurance Receivables"}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Shield className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-2xl font-black text-slate-900">
                {dynamicInsuranceReceivables.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">{isAr ? "ج.م" : "EGP"}</span>
            </div>
          </div>
        </div>

        {/* 4 Sub-Tabs Bar — Exact match to Image 1 */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {role !== "doctor" && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("invoices")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeSubTab === "invoices"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{isAr ? "الفواتير" : "Invoices"}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                      activeSubTab === "invoices"
                        ? "bg-blue-500 text-white"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {totalInvoicesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("ready_to_collect")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeSubTab === "ready_to_collect"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{isAr ? "جاهز للتحصيل (الأقدم أولاً)" : "Ready to Collect (Oldest First)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab("cash_closing")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeSubTab === "cash_closing"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{isAr ? "تقفيل الخزنة" : "Cash Closing"}</span>
                </button>
              </>
            )}

            {role !== "receptionist" && (
              <button
                type="button"
                onClick={() => setActiveSubTab("doctor_accounts")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeSubTab === "doctor_accounts"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{isAr ? "حسابات الأطباء" : "Dentist Accounts"}</span>
              </button>
            )}
          </div>

          <div className="text-xs font-bold tabular-nums">
            <span className="text-slate-500">{isAr ? `${totalInvoicesCount} فاتورة · ` : `${totalInvoicesCount} invoices · `}</span>
            <span className="text-rose-600">
              {isAr ? `مستحق ${dynamicOutstandingArrears.toLocaleString()} ج.م` : `Due EGP ${dynamicOutstandingArrears.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Pending Clinical Charges Ready to Invoice (Sent from /doctor/exam-room — Receptionist creates invoices) */}
        {role === "receptionist" &&
          pendingClinicalCharges.filter((c) => c.status === "PENDING_BILLING").length > 0 && (
            <div className="mt-5 rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-black text-blue-950">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>
                    {isAr
                      ? `إجراءات إكلينيكية واردة من غرفة الكشف جاهزة لإصدار الفاتورة (${
                          pendingClinicalCharges.filter((c) => c.status === "PENDING_BILLING")
                            .length
                        })`
                      : `Pending Clinical Charges Ready to Invoice (${
                          pendingClinicalCharges.filter((c) => c.status === "PENDING_BILLING")
                            .length
                        })`}
                  </span>
                </div>
                <span className="rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-black text-white">
                  {isAr ? "وارد من الطبيب" : "Sent from Dentist Exam Room"}
                </span>
              </div>

              <div className="space-y-2">
                {pendingClinicalCharges
                  .filter((c) => c.status === "PENDING_BILLING")
                  .map((chg) => (
                    <div
                      key={chg.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-white px-4 py-3 text-xs"
                    >
                      <div>
                        <div className="font-black text-slate-900">
                          {isAr ? chg.patientNameAr : chg.patientNameEn} ·{" "}
                          <span className="text-blue-700">
                            {isAr ? chg.doctorNameAr : chg.doctorNameEn}
                          </span>
                        </div>
                        <div className="mt-0.5 text-slate-600 font-semibold">
                          {isAr ? chg.proceduresSummaryAr : chg.proceduresSummaryEn}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900 tabular-nums">
                          EGP {chg.totalAmountEgp.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInvoicePendingClinicalCharge(chg)}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 font-black text-white shadow-xs transition active:scale-95"
                        >
                          {isAr
                            ? "إصدار الفاتورة والتحصيل ✓"
                            : "Generate Invoice & Collect ✓"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Filter & Search Row — Exact match to Image 1 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr ? "اسم المريض أو رقم الفاتورة" : "Search patient name or invoice #..."
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 ps-10 pe-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label={isAr ? "فلتر حالة الفواتير" : "Filter invoice status"}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "paid" | "partial" | "unpaid")
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              <option value="all">{isAr ? "كل الفواتير" : "All Invoices"}</option>
              <option value="paid">{isAr ? "مدفوعة" : "Paid"}</option>
              <option value="partial">{isAr ? "جزئي (أقساط)" : "Partial (Installments)"}</option>
              <option value="unpaid">{isAr ? "غير مدفوعة (متأخرات)" : "Unpaid (Arrears)"}</option>
            </select>

            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
              {isAr ? "كل الفترات" : "All Periods"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              {isAr ? "فلاتر إضافية" : "More Filters"}
            </span>
          </div>
        </div>

        {/* Sub-Tab Content: Cash Closing */}
        {activeSubTab === "cash_closing" ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">
                {isAr ? "نقدي بالدرج (Cash)" : "Cash in Drawer"}
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tabular-nums">
                {dynamicCashInDrawer.toLocaleString()} {isAr ? "ج.م" : "EGP"}
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-semibold">
                {isAr ? "مطابق لرصيد الفواتير النقدية" : "Matches cash invoices"}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">
                {isAr ? "إنستاباي وتحويلات (InstaPay)" : "InstaPay & Transfers"}
              </div>
              <div className="mt-2 text-2xl font-black text-blue-600 tabular-nums">
                {dynamicInstaPay.toLocaleString()} {isAr ? "ج.م" : "EGP"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {isAr ? `${instapayTransfers} معاملة محققة` : `${instapayTransfers} verified transfers`}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-xs font-bold text-slate-500">
                {isAr ? "بطاقات بنكية (Visa / MasterCard)" : "Card Terminal (POS)"}
              </div>
              <div className="mt-2 text-2xl font-black text-purple-600 tabular-nums">
                {dynamicCardTerminal.toLocaleString()} {isAr ? "ج.م" : "EGP"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {isAr ? "تقفيل ماكينة الدفع مطابق" : "POS settlement matched"}
              </div>
            </div>
          </div>
        ) : activeSubTab === "doctor_accounts" ? (
          <div className="mt-5 space-y-3">
            {doctorPerformance().map((doc) => (
              <div
                key={doc.doctorId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4"
              >
                <div>
                  <div className="font-black text-slate-900">
                    {isAr ? doc.nameAr : doc.nameEn}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isAr
                      ? `نسبة التحصيل ${doc.collectionRatePercent}% من ${doc.collected.toLocaleString()} ج.م محصلة`
                      : `${doc.collectionRatePercent}% collected of EGP ${doc.collected.toLocaleString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-6 tabular-nums">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? "عدد الحالات" : "Cases"}
                    </div>
                    <div className="font-bold text-slate-700">{doc.cases}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? "إجمالي الفواتير" : "Gross Invoiced"}
                    </div>
                    <div className="font-bold text-slate-700">
                      {doc.invoiced.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">
                      {isAr ? "مستحق الطبيب الصافي" : "Net Doctor Payout"}
                    </div>
                    <div className="text-base font-black text-blue-600">
                      {doc.payout.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Invoices & Arrears Table — Exact match to Image 1 */
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[880px] border-separate border-spacing-y-2 text-xs">
              <thead>
                <tr className="text-slate-400 font-bold">
                  <th className="px-3 py-2 text-start">{isAr ? "رقم الفاتورة" : "Invoice #"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "المريض" : "Patient"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "العلاج" : "Treatment"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "الطبيب" : "Dentist"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "طريقة الدفع" : "Payment Method"}</th>
                  <th className="px-3 py-2 text-start">{isAr ? "الحالة" : "Status"}</th>
                  {role === "receptionist" && (
                    <th className="px-3 py-2 text-end">{isAr ? "إجراءات" : "Actions"}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="rounded-2xl border border-slate-200/60 bg-white shadow-2xs transition hover:bg-slate-50/80"
                  >
                    <td className="rounded-s-2xl px-3 py-3 font-black text-blue-600 tabular-nums">
                      {inv.id}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white ${inv.avatarBg}`}
                        >
                          {isAr ? inv.initialsAr : inv.initialsEn}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">
                            {isAr ? inv.patientNameAr : inv.patientNameEn}
                          </div>
                          {inv.installments && inv.installments.length > 0 && (
                            <div className="text-[11px] font-semibold text-amber-700">
                              {isAr
                                ? `${inv.installments.length} أقساط مجدولة`
                                : `${inv.installments.length} scheduled installments`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-700">
                      {isAr ? inv.treatmentAr : inv.treatmentEn}
                      {inv.discountPercent ? (
                        <span className="ms-1.5 inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          -{inv.discountPercent}% ({inv.discountGivenBy})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-700">
                      <span className={inv.doctorColor}>● </span>
                      {isAr ? inv.doctorAr : inv.doctorEn}
                    </td>
                    <td className="px-3 py-3 text-slate-500 tabular-nums">{inv.date}</td>
                    <td className="px-3 py-3 tabular-nums">
                      <div className="font-black text-slate-900">
                        {inv.totalAmount.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                      </div>
                      {inv.status === "partial" && (
                        <div className="text-[11px] font-bold text-amber-600">
                          {isAr ? `مدفوع ${inv.paidAmount}` : `Paid ${inv.paidAmount}`}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        {inv.methodType === "cash" && "$ "}
                        {isAr ? inv.paymentMethodAr : inv.paymentMethodEn}
                      </span>
                    </td>
                    <td className={`px-3 py-3 ${role !== "receptionist" ? "rounded-e-2xl" : ""}`}>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : inv.status === "partial"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        ●{" "}
                        {inv.status === "paid"
                          ? isAr
                            ? "مدفوعة"
                            : "Paid"
                          : inv.status === "partial"
                          ? isAr
                            ? "جزئي"
                            : "Partial"
                          : isAr
                          ? "غير مدفوعة"
                          : "Unpaid"}
                      </span>
                    </td>
                    {role === "receptionist" && (
                      <td className="rounded-e-2xl px-3 py-3 text-end">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenSplitPayment(inv)}
                            title={
                              isAr
                                ? "تحصيل دفعة (نقدي / كارت / تحويل في نفس العملية)"
                                : "Collect Split Payment (Cash / Card / Transfer)"
                            }
                            className="rounded-lg border border-slate-200 p-1.5 text-emerald-600 transition hover:bg-emerald-50"
                          >
                            <Wallet className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSplitPayment(inv)}
                            className="rounded-lg border border-slate-200 p-1.5 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-100"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOWER ROW: Discount Cap Policy (All Expenses moved to dedicated /owner/expenses page) */}
      {role !== "doctor" && (
        <div className="grid grid-cols-1 gap-6">
          {/* IMAGE 3 EXACT CARD: Discount cap */}
          <div
            dir={isAr ? "rtl" : "ltr"}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">
                {isAr ? "سقف الخصومات" : "Discount cap"}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? "سقف الخصومات المعتمد من الخادم" : "Server-enforced limits"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Row 1: Clinic cap -> 10% */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    C
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr ? "سقف العيادة العام" : "Clinic cap"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? "لجميع أعضاء الفريق" : "For the whole team"}
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-black text-blue-700 tabular-nums">
                  10%
                </span>
              </div>

              {/* Row 2: Nourhan — front desk -> 15% */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white">
                    M
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr ? "نورهان — مكتب الاستقبال" : "Nourhan — front desk"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? "سقف شخصي أعلى" : "Higher personal cap"}
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-black text-purple-700 tabular-nums">
                  15%
                </span>
              </div>

              {/* Row 3: Attempted discount -> Rejected / Approved */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-black text-white">
                    ✕
                  </span>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr
                        ? `محاولة خصم ${attemptedDiscount}%`
                        : `Attempted ${attemptedDiscount}% discount`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isDiscountRejected
                        ? isAr
                          ? "من المتصفح — تم الرفض من الخادم"
                          : "From the browser — rejected by the server"
                        : isAr
                        ? `معتمد ضمن سقف ${
                            selectedStaff === "nourhan" ? "نورهان (15%)" : "العيادة (10%)"
                          }`
                        : `Approved under ${
                            selectedStaff === "nourhan" ? "Nourhan (15%)" : "Clinic cap (10%)"
                          }`}
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-3.5 py-1 text-xs font-black ${
                    isDiscountRejected
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isDiscountRejected
                    ? isAr
                      ? "مرفوض"
                      : "Rejected"
                    : isAr
                    ? "مقبول"
                    : "Approved"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                {isAr
                  ? "يتم التحقق من سقف الخصم على الخادم تلقائياً — مهما أرسلت الشاشة"
                  : "The cap is enforced on the server — whatever the screen sends"}
              </span>
              {role === "receptionist" && (
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(true)}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {isAr
                    ? "اختبار الخصم وإصدار فاتورة بضغطة واحدة ←"
                    : "Test discount & 1-click invoice →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Multi-Method Split Payment & Installment Schedule */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isAr
                    ? `تحصيل دفعة مركبة — ${payingInvoice.id}`
                    : `Multiple Payment Methods — ${payingInvoice.id}`}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "نقدي، بطاقة بنكية، وتحويل إنستاباي في نفس العملية"
                    : "Cash, card and transfer in the same transaction"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    {isAr ? payingInvoice.patientNameAr : payingInvoice.patientNameEn}
                  </div>
                  <div className="text-slate-500">
                    {isAr ? payingInvoice.treatmentAr : payingInvoice.treatmentEn}
                  </div>
                </div>
                <div className="text-end tabular-nums">
                  <div className="font-black text-slate-900">
                    {isAr ? "الإجمالي:" : "Total:"} {payingInvoice.totalAmount} EGP
                  </div>
                  <div className="font-bold text-rose-600">
                    {isAr ? "المتبقي:" : "Remaining:"}{" "}
                    {Math.max(0, payingInvoice.totalAmount - payingInvoice.paidAmount)} EGP
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">
                  {isAr ? "توزيع سريع:" : "Quick fill:"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!payingInvoice) return;
                    const rem = Math.max(0, payingInvoice.totalAmount - payingInvoice.paidAmount);
                    setCashAmount(rem);
                    setCardAmount(0);
                    setTransferAmount(0);
                  }}
                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 hover:bg-emerald-100"
                >
                  {isAr ? "كامل المبلغ نقدي" : "100% Cash"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!payingInvoice) return;
                    const rem = Math.max(0, payingInvoice.totalAmount - payingInvoice.paidAmount);
                    setCashAmount(0);
                    setCardAmount(0);
                    setTransferAmount(rem);
                  }}
                  className="rounded-lg bg-purple-50 px-2.5 py-1 text-[11px] font-extrabold text-purple-800 hover:bg-purple-100"
                >
                  {isAr ? "كامل المبلغ إنستاباي" : "100% InstaPay"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!payingInvoice) return;
                    const rem = Math.max(0, payingInvoice.totalAmount - payingInvoice.paidAmount);
                    setCashAmount(0);
                    setCardAmount(rem);
                    setTransferAmount(0);
                  }}
                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-800 hover:bg-blue-100"
                >
                  {isAr ? "كامل المبلغ بطاقة" : "100% Card"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                    {isAr ? "نقدي (Cash)" : "Cash (EGP)"}
                  </label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                    {isAr ? "بطاقة (Card)" : "Card (EGP)"}
                  </label>
                  <input
                    type="number"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-purple-600" />
                    {isAr ? "تحويل (InstaPay)" : "Transfer (EGP)"}
                  </label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSplitPayment}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {isAr ? "تأكيد التحصيل" : "Confirm Split Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: 1-Click Invoice from Treatment Plan + Server Discount Cap + Installments */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isAr
                    ? "فاتورة من خطة العلاج بضغطة واحدة"
                    : "An Invoice from the Treatment Plan in One Click"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr
                    ? "بدون إدخال مزدوج مع التحقق الخادمي من سقف الخصم وجدولة الأقساط"
                    : "No double entry — server calculates amounts and enforces discount caps"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "المريض (خطة علاج معتمدة)" : "Patient (Approved Plan)"}
                  </label>
                  <select
                    value={selectedPlanPatient?.id || ""}
                    onChange={(e) => setSelectedPlanPatientId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                  >
                    {planPatients.length === 0 && (
                      <option value="">{isAr ? "لا يوجد مرضى مسجلون" : "No registered patients"}</option>
                    )}
                    {planPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {isAr ? patient.fullNameAr || patient.fullName : patient.fullName} · {patient.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "الخدمة من خطة العلاج" : "Treatment Plan Item"}
                  </label>
                  <input
                    type="text"
                    value={selectedPlanService}
                    onChange={(e) => setSelectedPlanService(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "السعر الأساسي" : "Plan Amount (EGP)"}
                  </label>
                  <input
                    type="number"
                    value={selectedPlanPrice}
                    onChange={(e) => setSelectedPlanPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "مانح الخصم" : "Discount Given By"}
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value as "team" | "nourhan")}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  >
                    <option value="team">Clinic Team (10% cap)</option>
                    <option value="nourhan">Nourhan — front desk (15% cap)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "نسبة الخصم %" : "Discount %"}
                  </label>
                  <input
                    type="number"
                    value={attemptedDiscount}
                    onChange={(e) => setAttemptedDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "سبب الخصم (يسجل في التدقيق)" : "Discount Reason (Logged)"}
                  </label>
                  <input
                    type="text"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">
                    {isAr ? "عدد الأقساط المجدولة" : "Installments Schedule"}
                  </label>
                  <select
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-bold"
                  >
                    <option value={1}>1 (Full payment today)</option>
                    <option value={2}>2 Installments (50% / 50%)</option>
                    <option value={3}>3 Monthly Installments</option>
                  </select>
                </div>
              </div>

              {isDiscountRejected ? (
                <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>
                      Attempted {attemptedDiscount}% discount — Rejected by server (Cap is{" "}
                      {activeCap}%)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttemptedDiscount(activeCap)}
                    className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-black text-rose-700 shadow-2xs"
                  >
                    Set to {activeCap}%
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                  <span className="font-bold">
                    Server validated ({attemptedDiscount}% by{" "}
                    {selectedStaff === "nourhan" ? "Nourhan" : "Team"})
                  </span>
                  <span className="font-black tabular-nums">
                    Net: EGP{" "}
                    {Math.round(selectedPlanPrice * (1 - attemptedDiscount / 100)).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleCreateInvoiceFromPlan}
                  disabled={!selectedPlanPatient}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAr ? "إصدار الفاتورة وجدولة الأقساط" : "Create Invoice & Installments"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Financial Audit Log */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  {isAr ? "سجل التدقيق المالي والخصومات" : "Financial & Discount Cap Audit Log"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              {auditEntries.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5"
                >
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span>{a.actor}</span>
                    <span className="text-slate-400 tabular-nums">{a.time}</span>
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {isAr ? a.actionAr : a.actionEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
