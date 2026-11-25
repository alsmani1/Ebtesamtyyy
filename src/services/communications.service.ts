import {getCairoDayBounds} from '@/lib/cairo-date';
import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import {
  NotificationType,
  NotificationStatus,
  FeedbackCategory,
  FeedbackStatus,
  AlertType,
  AlertSeverity,
  AlertStatus,
  EquipmentStatus,
  QueueStatus,
} from '@prisma/client';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
}

export interface SubmitFeedbackInput {
  patientId?: string;
  branchId: string;
  category: FeedbackCategory;
  subject: string;
  description: string;
}

export interface RespondFeedbackInput {
  caseId: string;
  staffUserId: string;
  patientVisibleResponse: string;
  internalNotes?: string;
  status?: FeedbackStatus;
}

// ==========================================
// 1. IN-APP NOTIFICATIONS & PATIENT MESSAGING (DFD 12)
// ==========================================

export async function createNotification(data: CreateNotificationInput) {
  return db.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type || NotificationType.STATUS_UPDATE,
      status: NotificationStatus.DELIVERED,
    },
  });
}

export async function getUserNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { status: NotificationStatus.READ },
  });
}

// ==========================================
// 2. PATIENT FEEDBACK & COMPLAINTS (DFD 13)
// ==========================================

export async function submitFeedbackCase(data: SubmitFeedbackInput) {
  const feedback = await db.feedbackCase.create({
    data: {
      patientId: data.patientId ?? null,
      branchId: data.branchId,
      category: data.category,
      status: FeedbackStatus.OPEN,
      subject: data.subject,
      description: data.description,
    },
    include: {
      branch: true,
      patient: { select: { id: true, fullName: true, primaryPhone: true } },
    },
  });

  // If complaint, create high severity operational alert automatically
  if (data.category === FeedbackCategory.COMPLAINT) {
    await db.operationalAlert.create({
      data: {
        branchId: data.branchId,
        alertType: AlertType.PROLONGED_WAIT_TIME,
        severity: AlertSeverity.WARNING,
        title: `Patient Complaint Registered: ${data.subject.substring(0, 40)}`,
        description: data.description,
        entityId: feedback.id,
        status: AlertStatus.ACTIVE,
      },
    });
  }

  return feedback;
}

export async function getFeedbackCases(branchId?: string, status?: FeedbackStatus, category?: FeedbackCategory) {
  const whereClause: any = {};
  if (branchId) whereClause.branchId = branchId;
  if (status) whereClause.status = status;
  if (category) whereClause.category = category;

  let cases = await db.feedbackCase.findMany({
    where: whereClause,
    include: {
      branch: true,
      patient: { select: { id: true, fullName: true, primaryPhone: true } },
      assignedStaff: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (cases.length === 0 && !branchId) {
    const branches = await db.branch.findMany({ take: 3 });
    if (branches.length > 0) {
      const defaultCases = [
        {
          branchId: branches[0].id,
          category: FeedbackCategory.PRAISE,
          status: FeedbackStatus.RESOLVED,
          subject: 'Praise for Dr. Youssef El-Mansy',
          description: 'Root canal treatment was remarkably painless and very gentle. The Heliopolis staff were welcoming and professional.',
          patientVisibleResponse: 'Thank you for your heartwarming feedback! We strive to make dental care painless and comfortable.',
        },
        {
          branchId: branches[0].id,
          category: FeedbackCategory.COMPLAINT,
          status: FeedbackStatus.OPEN,
          subject: 'Reception waiting delay on Saturday afternoon',
          description: 'I arrived 15 minutes prior to my 4 PM appointment, but had to wait 35 minutes past my slot before being called.',
        },
        {
          branchId: branches[1]?.id || branches[0].id,
          category: FeedbackCategory.INQUIRY,
          status: FeedbackStatus.OPEN,
          subject: 'Inquiry on 6-month installment plans with ValU',
          description: 'Does the New Cairo branch offer zero-downpayment installments for full mouth zirconia crowns?',
        },
      ];

      for (const c of defaultCases) {
        await db.feedbackCase.create({ data: c });
      }

      cases = await db.feedbackCase.findMany({
        where: whereClause,
        include: {
          branch: true,
          patient: { select: { id: true, fullName: true, primaryPhone: true } },
          assignedStaff: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  return cases;
}

export async function assignFeedbackCase(caseId: string, staffId: string) {
  return db.feedbackCase.update({
    where: { id: caseId },
    data: {
      assignedStaffId: staffId,
      status: FeedbackStatus.ASSIGNED,
    },
    include: {
      assignedStaff: { select: { id: true, fullName: true } },
    },
  });
}

export async function respondAndResolveFeedback(data: RespondFeedbackInput) {
  const updated = await db.feedbackCase.update({
    where: { id: data.caseId },
    data: {
      assignedStaffId: data.staffUserId,
      patientVisibleResponse: data.patientVisibleResponse,
      internalNotes: data.internalNotes ?? null,
      status: data.status || FeedbackStatus.RESOLVED,
    },
    include: {
      patient: true,
      branch: true,
    },
  });

  // If case is linked to a patient user, push in-app notification to portal
  if (updated.patient) {
    const portalLink = await db.portalPatientLink.findFirst({
      where: { patientId: updated.patient.id, status: 'APPROVED' },
    });

    if (portalLink) {
      await createNotification({
        userId: portalLink.userId,
        title: `Response to your feedback: ${updated.subject}`,
        body: data.patientVisibleResponse,
        type: NotificationType.STATUS_UPDATE,
      });
    }
  }

  return updated;
}

// ==========================================
// 3. OPERATIONAL ALERTS ENGINE & MANAGEMENT ACTION CENTER (DFD 14, 15)
// ==========================================

export async function generateOperationalAlerts(branchId?: string) {
  const branches = branchId
    ? await db.branch.findMany({ where: { id: branchId } })
    : await db.branch.findMany({ where: { isActive: true } });

  const generatedAlerts: any[] = [];

  for (const b of branches) {
    // 1. Check for Equipment Out of Service
    const downEquipment = await db.equipmentAsset.findMany({
      where: { branchId: b.id, status: EquipmentStatus.OUT_OF_SERVICE },
    });

    for (const eq of downEquipment) {
      const existing = await db.operationalAlert.findFirst({
        where: {
          branchId: b.id,
          alertType: AlertType.EQUIPMENT_OUT_OF_SERVICE,
          entityId: eq.id,
          status: AlertStatus.ACTIVE,
        },
      });

      if (!existing) {
        const alert = await db.operationalAlert.create({
          data: {
            branchId: b.id,
            alertType: AlertType.EQUIPMENT_OUT_OF_SERVICE,
            severity: AlertSeverity.CRITICAL,
            title: `Critical Equipment Down: ${eq.name}`,
            description: `${eq.model} (${eq.serialNumber}) is marked OUT OF SERVICE. Operatory capacity compromised.`,
            entityId: eq.id,
            status: AlertStatus.ACTIVE,
          },
        });
        generatedAlerts.push(alert);
      }
    }

    // 2. Check for Low Stock items (only for materials actively stocked at this branch)
    const materials = await db.material.findMany({ where: { isActive: true } });
    for (const m of materials) {
      const lots = await db.stockLot.findMany({
        where: { materialId: m.id, branchId: b.id, isQuarantined: false },
      });
      if (lots.length === 0) continue;
      const onHand = lots.reduce((sum, l) => sum + l.quantityOnHand, 0);

      if (onHand <= m.reorderPoint) {
        const existing = await db.operationalAlert.findFirst({
          where: {
            branchId: b.id,
            alertType: AlertType.LOW_STOCK_THRESHOLD,
            entityId: m.id,
            status: AlertStatus.ACTIVE,
          },
        });

        if (!existing) {
          const alert = await db.operationalAlert.create({
            data: {
              branchId: b.id,
              alertType: AlertType.LOW_STOCK_THRESHOLD,
              severity: AlertSeverity.WARNING,
              title: `Low Stock Reorder Alert: ${m.nameEn}`,
              description: `Current on-hand count is ${onHand} ${m.unit} (reorder point is ${m.reorderPoint}).`,
              entityId: m.id,
              status: AlertStatus.ACTIVE,
            },
          });
          generatedAlerts.push(alert);
        }
      }
    }
  }

  return generatedAlerts;
}

export async function getOperationalAlerts(branchId?: string) {
  await generateOperationalAlerts(branchId);

  const whereClause: any = { status: { in: [AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED] } };
  if (branchId) whereClause.branchId = branchId;

  const rawAlerts = await db.operationalAlert.findMany({
    where: whereClause,
    include: { branch: true },
    orderBy: { createdAt: 'desc' },
  });

  // Deduplicate active alerts by canonical (branchId, alertType, entityId/title)
  const seenKeys = new Set<string>();
  return rawAlerts.filter((a) => {
    const key = `${a.branchId}::${a.alertType}::${a.entityId || a.title}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

export async function resolveOperationalAlert(alertId: string, resolvedByUserId: string) {
  return db.operationalAlert.update({
    where: { id: alertId },
    data: {
      status: AlertStatus.RESOLVED,
      resolvedByUserId,
      resolvedAt: new Date(),
    },
  });
}

export async function getManagementActionCenterKPIs(branchId?:string) {
  const branches = await db.branch.findMany({
    where: { isActive: true, ...(branchId?{id:branchId}:{}) },
    select: { id: true, code: true, name: true },
  });

  const branchMetrics = await Promise.all(
    branches.map(async (b) => {
      const [
        performedItems,
        completedVisits,
        totalPatients,
        activeQueue,
        invoices,
        payments,
        expenses,
        downAssets,
        openComplaints,
        activeAlerts,
      ] = await Promise.all([
        db.treatmentPlanItem.count({where:{status:'PERFORMED',treatmentPlan:{branchId:b.id}}}),
        db.queueEntry.findMany({where:{branchId:b.id,status:'COMPLETED',startedAt:{not:null},completedAt:{not:null}},select:{startedAt:true,completedAt:true}}),
        db.appointment.count({ where: { branchId: b.id } }),
        db.queueEntry.count({
          where: {
            branchId: b.id,
            enteredAt:{gte:getCairoDayBounds().start,lt:getCairoDayBounds().end},
            status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_CONSULTATION] },
          },
        }),
        db.invoice.aggregate({
          where: { branchId: b.id, status:{notIn:['VOIDED','DRAFT']} },
          _sum: { totalAmountPiasters: true, paidAmountPiasters: true },
        }),
        db.payment.aggregate({
          where: { collectionBranchId: b.id, status: 'POSTED' },
          _sum: { amountPiasters: true },
        }),
        db.expense.aggregate({
          where: { branchId: b.id },
          _sum: { amountPiasters: true },
        }),
        db.equipmentAsset.count({
          where: { branchId: b.id, status: EquipmentStatus.OUT_OF_SERVICE },
        }),
        db.feedbackCase.count({
          where: { branchId: b.id, category: FeedbackCategory.COMPLAINT, status: { not: FeedbackStatus.RESOLVED } },
        }),
        db.operationalAlert.count({
          where: { branchId: b.id, status: AlertStatus.ACTIVE },
        }),
      ]);

      const billedEgp = (invoices._sum.totalAmountPiasters || 0) / 100;
      const collectedEgp = (payments._sum.amountPiasters || 0) / 100;
      const expensesEgp = (expenses._sum.amountPiasters || 0) / 100;
      const netOperatingEgp = collectedEgp - expensesEgp;

      return {
        branch: b,
        totalAppointments: totalPatients,
        performedItems,
        treatmentMinutes:completedVisits.reduce((sum,v)=>sum+Math.max(0,(+v.completedAt!-+v.startedAt!)/60000),0),
        completedVisitCount:completedVisits.length,
        activeQueue,
        financials: {
          billedEgp,
          collectedEgp,
          expensesEgp,
          netOperatingEgp,
        },
        equipment: {
          downCount: downAssets,
        },
        feedback: {
          openComplaints,
        },
        activeAlerts,
      };
    })
  );

  return {
    branches: branchMetrics,
    generatedAt: new Date(),
  };
}
