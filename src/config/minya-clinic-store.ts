import {
  currentMonthSeedTotals,
  financeKpis,
} from "@/lib/clinic-finance";
import { SHARED_INVOICES_STORAGE_KEY } from "@/lib/finance-storage";
import { branchMetrics as ledgerBranchMetrics, clinicMetrics as ledgerClinicMetrics } from "@/lib/clinic-ledger";
import type { FinanceBranch } from "@/lib/clinic-costs";
import {
  findPatientByEmail,
  findPatientByFullName,
  findPatientByPhone,
  getPatientById,
  getPatientByPortalLink,
} from "@/lib/patients-db";

export type MinyaBranchCode = "ALL" | "BR-A" | "BR-B" | "BR-C";

export interface MinyaBranchConfig {
  code: "BR-A" | "BR-B" | "BR-C";
  nameEn: string;
  nameAr: string;
  shortEn: string;
  shortAr: string;
  cityEn: string;
  cityAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  whatsapp: string;
  doctors: {
    id: string;
    nameEn: string;
    nameAr: string;
    specialtyEn: string;
    specialtyAr: string;
    email: string;
  }[];
  receptionist: {
    id: string;
    nameEn: string;
    nameAr: string;
    email: string;
  };
  metrics: {
    todayRevenueEgp: number;
    monthlyCollectedEgp: number;
    monthlyInvoicedEgp: number;
    monthlyCostsEgp: number;
    monthlyNetProfitEgp: number;
    outstandingArrearsEgp: number;
    insuranceReceivablesEgp: number;
    activePatientsCount: number;
    todayAppointmentsCount: number;
    noShowRatePercent: number;
    completionRatePercent: number;
  };
}

function branchMetrics(code: FinanceBranch): MinyaBranchConfig["metrics"] {
  const kpis = financeKpis(code);
  const ledger = ledgerBranchMetrics(code);
  return {
    todayRevenueEgp: kpis.todayCollected,
    monthlyCollectedEgp: kpis.monthCollected,
    monthlyInvoicedEgp: kpis.monthInvoiced,
    monthlyCostsEgp: kpis.costs,
    monthlyNetProfitEgp: kpis.netProfit,
    outstandingArrearsEgp: kpis.arrears,
    insuranceReceivablesEgp: kpis.insuranceReceivables,
    activePatientsCount: kpis.activePatients,
    todayAppointmentsCount: kpis.todayInvoices,
    noShowRatePercent: ledger.noShowRate,
    completionRatePercent: ledger.completionRate,
  };
}

export const MINYA_BRANCHES: MinyaBranchConfig[] = [
  {
    code: "BR-A",
    nameEn: "Minya – Branch A",
    nameAr: "المنيا – الفرع أ",
    shortEn: "Branch A (Minya Corniche)",
    shortAr: "فرع أ (كورنيش المنيا)",
    cityEn: "Minya",
    cityAr: "المنيا",
    addressEn: "Corniche El-Nile St, Minya – Branch A",
    addressAr: "شارع كورنيش النيل، المنيا – الفرع أ",
    phone: "+20 86 234 0001",
    whatsapp: "+201200054405",
    doctors: [
      {
        id: "doc-sandy",
        nameEn: "Dr. Sandy Saad",
        nameAr: "د. ساندي سعد",
        specialtyEn: "Prosthodontics & Cosmetic Dentistry",
        specialtyAr: "التركيبات الثابتة وتجميل الأسنان",
        email: "dr.sandy@ebtesamty.dev",
      },
      {
        id: "doc-feby",
        nameEn: "Dr. Feby Samer",
        nameAr: "د. فيبي سامر",
        specialtyEn: "Endodontics & Root Canal Therapy",
        specialtyAr: "علاج الجذور والعصب بالميكروسكوب",
        email: "dr.feby@ebtesamty.dev",
      },
    ],
    receptionist: {
      id: "rec-mariam",
      nameEn: "Mariam Hanna",
      nameAr: "مريم حنا",
      email: "mariam.reception@ebtesamty.dev",
    },
    metrics: branchMetrics("BR-A"),
  },
  {
    code: "BR-B",
    nameEn: "Minya – Branch B",
    nameAr: "المنيا – الفرع ب",
    shortEn: "Branch B (New Minya)",
    shortAr: "فرع ب (المنيا الجديدة)",
    cityEn: "Minya",
    cityAr: "المنيا",
    addressEn: "Central Axis, New Minya – Branch B",
    addressAr: "المحور المركزي، المنيا الجديدة – الفرع ب",
    phone: "+20 86 234 0002",
    whatsapp: "+201200054405",
    doctors: [
      {
        id: "doc-ahmed",
        nameEn: "Dr. Ahmed Hassan",
        nameAr: "د. أحمد حسن",
        specialtyEn: "Dental Implants & Oral Surgery",
        specialtyAr: "زراعة الأسنان وجراحة الفم والفكين",
        email: "dr.ahmed@ebtesamty.dev",
      },
      {
        id: "doc-youssef",
        nameEn: "Dr. Youssef El-Mansy",
        nameAr: "د. يوسف المنسي",
        specialtyEn: "Orthodontics & Clear Aligners",
        specialtyAr: "تقويم الأسنان الثابت والشفاف",
        email: "dr.youssef@ebtesamty.dev",
      },
    ],
    receptionist: {
      id: "rec-sandy",
      nameEn: "Sandy Abd",
      nameAr: "ساندي عبد",
      email: "sandy.reception@ebtesamty.dev",
    },
    metrics: branchMetrics("BR-B"),
  },
  {
    code: "BR-C",
    nameEn: "Minya – Branch C",
    nameAr: "المنيا – الفرع ج",
    shortEn: "Branch C (Taha Hussein St, Minya)",
    shortAr: "فرع ج (شارع طه حسين، المنيا)",
    cityEn: "Minya",
    cityAr: "المنيا",
    addressEn: "Taha Hussein St, Minya – Branch C",
    addressAr: "شارع طه حسين، المنيا – الفرع ج",
    phone: "+20 86 234 0003",
    whatsapp: "+201200054405",
    doctors: [
      {
        id: "doc-nadia",
        nameEn: "Dr. Nadia El-Hariry",
        nameAr: "د. نادية الحريري",
        specialtyEn: "Pediatric & Family Restorative Dentistry",
        specialtyAr: "طب أسنان الأطفال والعائلة",
        email: "dr.nadia@ebtesamty.dev",
      },
    ],
    receptionist: {
      id: "rec-salma",
      nameEn: "Salma El-Masry",
      nameAr: "سلمى المصري",
      email: "salma.reception@ebtesamty.dev",
    },
    metrics: branchMetrics("BR-C"),
  },
];

/** Collections made through the shared UI on top of the seeded ledger, scoped to one branch. */
export function getSharedPaymentsDelta(branch: FinanceBranch | "ALL" = "ALL"): { paidDelta: number; arrearsDelta: number } {
  if (typeof window === "undefined") return { paidDelta: 0, arrearsDelta: 0 };
  try {
    const saved = window.localStorage.getItem(SHARED_INVOICES_STORAGE_KEY);
    if (saved) {
      const invoices = JSON.parse(saved);
      if (Array.isArray(invoices)) {
        const scoped = invoices.filter(
          (inv: any) => branch === "ALL" || inv.branch === branch
        );
        const totalPaid = scoped.reduce(
          (sum: number, inv: any) => sum + (Number(inv.paidAmount) || 0),
          0
        );
        const totalUnpaid = scoped.reduce(
          (sum: number, inv: any) =>
            sum + Math.max(0, (Number(inv.totalAmount) || 0) - (Number(inv.paidAmount) || 0)),
          0
        );
        const seed = currentMonthSeedTotals(branch);
        return {
          paidDelta: Math.max(0, totalPaid - seed.paid),
          arrearsDelta: totalUnpaid - seed.unpaid,
        };
      }
    }
  } catch {}
  return { paidDelta: 0, arrearsDelta: 0 };
}

export function getMinyaBranchMetrics(branchCode: MinyaBranchCode = "ALL") {
  const { paidDelta, arrearsDelta } = getSharedPaymentsDelta(branchCode);

  if (branchCode !== "ALL") {
    const found = MINYA_BRANCHES.find((b) => b.code === branchCode);
    if (found) {
      return {
        ...found.metrics,
        todayRevenueEgp: found.metrics.todayRevenueEgp + paidDelta,
        monthlyCollectedEgp: found.metrics.monthlyCollectedEgp + paidDelta,
        monthlyNetProfitEgp: found.metrics.monthlyNetProfitEgp + paidDelta,
        outstandingArrearsEgp: Math.max(0, found.metrics.outstandingArrearsEgp + arrearsDelta),
      };
    }
  }

  const kpis = financeKpis("ALL");
  const ledger = ledgerClinicMetrics();
  return {
    todayRevenueEgp: kpis.todayCollected + paidDelta,
    monthlyCollectedEgp: kpis.monthCollected + paidDelta,
    monthlyInvoicedEgp: kpis.monthInvoiced,
    monthlyCostsEgp: kpis.costs,
    monthlyNetProfitEgp: kpis.netProfit + paidDelta,
    outstandingArrearsEgp: Math.max(0, kpis.arrears + arrearsDelta),
    insuranceReceivablesEgp: kpis.insuranceReceivables,
    activePatientsCount: kpis.activePatients,
    todayAppointmentsCount: kpis.todayInvoices,
    noShowRatePercent: ledger.noShowRate,
    completionRatePercent: ledger.completionRate,
  };
}

/**
 * Dynamic User Identity Resolver:
 * Removes hardcoded "Hassan" / "HE" and computes the authenticated user's real display name,
 * initials ("PA" for Passant), role, and Minya branch.
 */
export function resolveAuthenticatedIdentity(
  user?: {
    id?: string;
    fullName?: string | null;
    email?: string | null;
    roleGrants?: { role: string; branch?: { code?: string; name?: string } | null }[];
  } | null,
  fallbackRole: "clinic_owner" | "doctor" | "receptionist" | "patient" = "patient"
) {
  const email = (user?.email || "").toLowerCase();
  let fullName = (user?.fullName || "").trim();

  // Replace legacy seeded "Hassan El-Sayed" on Passant's demo account with "Passant"
  if (
    email === "hassan.patient@ebtesamty.dev" ||
    fullName === "Hassan El-Sayed" ||
    fullName === "Hassan"
  ) {
    fullName = "Passant";
  } else if (!fullName) {
    fullName =
      fallbackRole === "patient"
        ? "Passant"
        : fallbackRole === "doctor"
        ? "Dr. Sandy Saad"
        : fallbackRole === "receptionist"
        ? "Mariam Hanna"
        : "Abram";
  }

  const cleanWords = fullName
    .replace(/^Dr\.\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);

  const initials =
    cleanWords.length >= 2
      ? `${cleanWords[0][0]}${cleanWords[1][0]}`.toUpperCase()
      : cleanWords[0]
      ? cleanWords[0].slice(0, 2).toUpperCase()
      : "PA";

  const grantRole =
    fallbackRole === "clinic_owner"
      ? "OWNER_ADMIN"
      : fallbackRole === "doctor"
      ? "DENTIST"
      : fallbackRole === "receptionist"
      ? "RECEPTIONIST"
      : "PATIENT";
  const activeGrant =
    user?.roleGrants?.find((grant) => grant.role === grantRole) || user?.roleGrants?.[0];
  const rawBranchCode = (activeGrant?.branch?.code || "BR-A") as
    | "BR-A"
    | "BR-B"
    | "BR-C";
  const branchObj =
    MINYA_BRANCHES.find((b) => b.code === rawBranchCode) || MINYA_BRANCHES[0];

  const userPhone = (user as { phone?: string } | null | undefined)?.phone;
  const portalLink = (
    user as
      | { portalPatientLinks?: Array<{
          patient?: { id?: string; patientNumber?: string; fullName?: string; primaryPhone?: string };
        }> }
      | null
      | undefined
  )?.portalPatientLinks?.[0];

  const linkedPatient =
    getPatientByPortalLink(portalLink) ||
    findPatientByEmail(email) ||
    findPatientByPhone(userPhone) ||
    (fallbackRole === "patient" ? findPatientByFullName(fullName) : undefined);
  const hasUserIdentity = Boolean(email || userPhone);
  const patientRecord =
    linkedPatient ||
    (fallbackRole === "patient" && (!hasUserIdentity || email === "hassan.patient@ebtesamty.dev")
      ? getPatientById("EBT-PAT-0001")
      : undefined);

  return {
    id: user?.id || "usr_active",
    fullName,
    firstName: cleanWords[0] || fullName,
    initials,
    branchCode: branchObj.code,
    branchNameEn: branchObj.nameEn,
    branchNameAr: branchObj.nameAr,
    patientId: patientRecord?.id,
    patientNameAr: patientRecord?.fullNameAr,
  };
}
