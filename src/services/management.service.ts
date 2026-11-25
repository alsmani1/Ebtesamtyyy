import db from '../lib/db';
import { requireRole } from '../lib/rbac';
import { Role, IntakeStatus, LinkStatus, DuplicateReviewStatus, MigrationStatus } from '@prisma/client';

export interface BranchComparisonData {
  branchId: string;
  code: string;
  name: string;
  invoicedEgp: number;
  collectedEgp: number;
  appointmentsCount: number;
  patientsCount: number;
}

export interface AttendanceAnalytics {
  completed: number;
  confirmed: number;
  cancelled: number;
  noShow: number;
  total: number;
  noShowRatePct: number;
  cancellationRatePct: number;
}

export interface OperationalMetrics {
  totalPatients: number;
  pendingIntakesCount: number;
  pendingPortalLinksCount: number;
  unresolvedDuplicatesCount: number;
  legacyIncompleteCount: number;
  branches: { id: string; code: string; name: string; patientCount: number }[];
  activeStaffCount: number;
  financialTrends: { label: string; invoicedEgp: number; collectedEgp: number; expensesEgp: number }[];
  branchComparison: BranchComparisonData[];
  attendanceAnalysis: AttendanceAnalytics;
}

export async function getOperationalMetrics(
  branchId: string | null | undefined,
  actorUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
): Promise<OperationalMetrics> {
  // Authorization: BRANCH_MANAGER or OWNER_ADMIN
  requireRole(actorUser, [Role.BRANCH_MANAGER, Role.OWNER_ADMIN], branchId);

  // Where clauses based on branchId if provided
  const patientWhere = branchId ? { primaryBranchId: branchId } : {};
  const branchFilter = branchId ? { branchId } : {};

  const totalPatients = await db.patient.count({ where: patientWhere });

  const pendingIntakesCount = await db.medicalHistorySubmission.count({
    where: {
      status: IntakeStatus.PENDING_REVIEW,
      ...(branchId ? { patient: { primaryBranchId: branchId } } : {}),
    },
  });

  const pendingPortalLinksCount = await db.portalPatientLink.count({
    where: {
      status: LinkStatus.PENDING,
      ...(branchId ? { patient: { primaryBranchId: branchId } } : {}),
    },
  });

  const rawDuplicates = await db.potentialDuplicateReview.findMany({
    where: {
      status: DuplicateReviewStatus.PENDING,
      ...(branchId
        ? {
            OR: [
              { patientA: { primaryBranchId: branchId } },
              { patientB: { primaryBranchId: branchId } },
            ],
          }
        : {}),
    },
    select: { patientAId: true, patientBId: true, matchType: true },
  });
  const uniqueDuplicateKeys = new Set(
    rawDuplicates.map((d) => `${[d.patientAId, d.patientBId].sort().join('_')}::${d.matchType}`)
  );
  const unresolvedDuplicatesCount = uniqueDuplicateKeys.size;

  const legacyIncompleteCount = await db.patient.count({
    where: {
      migrationStatus: { in: [MigrationStatus.NOT_DIGITIZED, MigrationStatus.PARTIALLY_DIGITIZED] },
      ...patientWhere,
    },
  });

  const allBranches = await db.branch.findMany({
    where: { isActive: true, ...(branchId?{id:branchId}:{}) },
    include: {
      _count: {
        select: { registeredPatients: true, appointments: true },
      },
    },
    orderBy: { code: 'asc' },
  });

  const activeStaffCount = await db.user.count({
    where: {
      roleGrants: {
        some: {
          role: { in: [Role.DENTIST, Role.RECEPTIONIST, Role.BRANCH_MANAGER, Role.OWNER_ADMIN] },
        },
      },
    },
  });

  // 1. Multi-branch comparison aggregations
  const branchComparison: BranchComparisonData[] = await Promise.all(
    allBranches.map(async (b) => {
      const [invAgg, payAgg] = await Promise.all([
        db.invoice.aggregate({
          where: { branchId: b.id,status:{notIn:['VOIDED','DRAFT']} },
          _sum: { totalAmountPiasters: true },
        }),
        db.payment.aggregate({
          where: { collectionBranchId: b.id,status:'POSTED' },
          _sum: { amountPiasters: true },
        }),
      ]);

      return {
        branchId: b.id,
        code: b.code,
        name: b.name.replace(/^Branch [A-C] - /, ''),
        invoicedEgp: Math.round((invAgg._sum?.totalAmountPiasters || 0) / 100),
        collectedEgp: Math.round((payAgg._sum?.amountPiasters || 0) / 100),
        appointmentsCount: b._count.appointments,
        patientsCount: b._count.registeredPatients,
      };
    })
  );

  // 2. Attendance & No-Show Breakdown
  const apptWhere = branchId ? { branchId } : {};
  const [completedAppts, confirmedAppts, cancelledAppts, noShowAppts] = await Promise.all([
    db.appointment.count({ where: { ...apptWhere, status: 'COMPLETED' } }),
    db.appointment.count({ where: { ...apptWhere, status: 'CONFIRMED' } }),
    db.appointment.count({ where: { ...apptWhere, status: 'CANCELLED' } }),
    db.appointment.count({ where: { ...apptWhere, status: 'NO_SHOW' } }),
  ]);
  const totalAppts = completedAppts + confirmedAppts + cancelledAppts + noShowAppts;
  const attendanceAnalysis: AttendanceAnalytics = {
    completed: completedAppts,
    confirmed: confirmedAppts,
    cancelled: cancelledAppts,
    noShow: noShowAppts,
    total: totalAppts,
    noShowRatePct: totalAppts > 0 ? Math.round((noShowAppts / totalAppts) * 100) : 0,
    cancellationRatePct: totalAppts > 0 ? Math.round((cancelledAppts / totalAppts) * 100) : 0,
  };

  // 3. TimeSeries Financial Trend Aggregations (Past 6 Months)
  // Query all invoices, payments, and expenses for the branch scope
  const paymentFilter = branchId ? { collectionBranchId: branchId } : {};
  const [allInvoices, allPayments, allExpenses] = await Promise.all([
    db.invoice.findMany({
      where: {...branchFilter,status:{notIn:['VOIDED','DRAFT']}},
      select: { totalAmountPiasters: true, issuedAt: true },
    }),
    db.payment.findMany({
      where: {...paymentFilter,status:'POSTED'},
      select: { amountPiasters: true, collectedAt: true },
    }),
    db.expense.findMany({
      where: branchFilter,
      select: { amountPiasters: true, expenseDate: true },
    }),
  ]);

  // Group by month
  const monthMap = new Map<string, { invoicedEgp: number; collectedEgp: number; expensesEgp: number }>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit',timeZone:'Africa/Cairo' });
    monthMap.set(key, { invoicedEgp: 0, collectedEgp: 0, expensesEgp: 0 });
  }

  for (const inv of allInvoices) {
    const key = new Date(inv.issuedAt).toLocaleString('en-US', { month: 'short', year: '2-digit',timeZone:'Africa/Cairo' });
    if (monthMap.has(key)) {
      monthMap.get(key)!.invoicedEgp += (inv.totalAmountPiasters / 100);
    }
  }

  for (const pay of allPayments) {
    const key = new Date(pay.collectedAt).toLocaleString('en-US', { month: 'short', year: '2-digit',timeZone:'Africa/Cairo' });
    if (monthMap.has(key)) {
      monthMap.get(key)!.collectedEgp += (pay.amountPiasters / 100);
    }
  }

  for (const exp of allExpenses) {
    const key = new Date(exp.expenseDate).toLocaleString('en-US', { month: 'short', year: '2-digit',timeZone:'Africa/Cairo' });
    if (monthMap.has(key)) {
      monthMap.get(key)!.expensesEgp += (exp.amountPiasters / 100);
    }
  }

  const financialTrends = Array.from(monthMap.entries()).map(([label, val]) => ({
    label,
    invoicedEgp: val.invoicedEgp,
    collectedEgp: val.collectedEgp,
    expensesEgp: val.expensesEgp,
  }));

  // STRICT PRIVACY GUARANTEE: Purely statistical operational metrics. Zero medical diagnoses or intake questionnaire answers!
  return {
    totalPatients,
    pendingIntakesCount,
    pendingPortalLinksCount,
    unresolvedDuplicatesCount,
    legacyIncompleteCount,
    branches: allBranches.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      patientCount: b._count.registeredPatients,
    })),
    activeStaffCount,
    financialTrends,
    branchComparison,
    attendanceAnalysis,
  };
}

export async function getUnresolvedDuplicates(
  branchId: string | null | undefined,
  actorUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  requireRole(actorUser, [Role.BRANCH_MANAGER, Role.OWNER_ADMIN, Role.RECEPTIONIST], branchId);

  const rows = await db.potentialDuplicateReview.findMany({
    where: {
      status: DuplicateReviewStatus.PENDING,
      ...(branchId
        ? {
            OR: [
              { patientA: { primaryBranchId: branchId } },
              { patientB: { primaryBranchId: branchId } },
            ],
          }
        : {}),
    },
    include: {
      patientA: {
        select: {
          id: true,
          patientNumber: true,
          fullName: true,
          dateOfBirth: true,
          primaryPhone: true,
          source: true,
        },
      },
      patientB: {
        select: {
          id: true,
          patientNumber: true,
          fullName: true,
          dateOfBirth: true,
          primaryPhone: true,
          source: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const seenPairs = new Set<string>();
  const deduped = [];
  for (const r of rows) {
    const key = `${[r.patientAId, r.patientBId].sort().join('_')}::${r.matchType}`;
    if (!seenPairs.has(key)) {
      seenPairs.add(key);
      deduped.push(r);
    }
  }
  return deduped;
}

export async function getPendingPortalLinks(
  branchId: string | null | undefined,
  actorUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  requireRole(actorUser, [Role.RECEPTIONIST, Role.BRANCH_MANAGER, Role.OWNER_ADMIN], branchId);

  return db.portalPatientLink.findMany({
    where: {
      status: LinkStatus.PENDING,
      ...(branchId ? { patient: { primaryBranchId: branchId } } : {}),
    },
    include: {
      user: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      patient: {
        select: {
          id: true,
          patientNumber: true,
          fullName: true,
          dateOfBirth: true,
          primaryPhone: true,
          migrationStatus: true,
          primaryBranch: true,
        },
      },
    },
    orderBy: { requestedAt: 'asc' },
  });
}
