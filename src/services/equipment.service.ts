import db from '../lib/db';
import { clinicDateISO } from '../lib/clinic-clock';
import { logAuditEvent } from '../lib/audit';
import {
  EquipmentCategory,
  EquipmentStatus,
  CriticalityLevel,
  FaultSeverity,
  WorkOrderStatus,
  ExpenseCategory,
} from '@prisma/client';

export interface CreateAssetInput {
  branchId: string;
  roomId?: string;
  name: string;
  serialNumber: string;
  model: string;
  category: EquipmentCategory;
  criticality?: CriticalityLevel;
  nextServiceDue?: Date;
}

export interface ReportFaultInput {
  assetId: string;
  reportedByUserId: string;
  description: string;
  severity: FaultSeverity;
}

export interface CreateWorkOrderInput {
  assetId: string;
  faultId?: string;
  technicianName: string;
  technicianPhone: string;
  workOrderType?: 'CORRECTIVE' | 'PREVENTIVE';
  notes?: string;
}

export interface CompleteWorkOrderInput {
  costPiasters: number;
  downtimeHours: number;
  notes?: string;
}

// ==========================================
// 1. ASSET DIRECTORY & SEEDING
// ==========================================

export async function getEquipmentAssets(branchId?: string, status?: EquipmentStatus) {
  const whereClause: any = {};
  if (branchId) whereClause.branchId = branchId;
  if (status) whereClause.status = status;

  let assets = await db.equipmentAsset.findMany({
    where: whereClause,
    include: {
      branch: true,
      room: true,
      faults: { where: { isResolved: false }, orderBy: { reportedAt: 'desc' } },
      workOrders: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { name: 'asc' },
  });

  if (assets.length === 0 && !branchId) {
    const branches = await db.branch.findMany({ take: 3 });
    if (branches.length > 0) {
      const defaultAssets = [
        {
          branchId: branches[0].id,
          name: 'A-dec 500 Dental Chair Operatory 1',
          serialNumber: 'SN-ADEC-500-01',
          model: 'A-dec 500 Premium',
          category: EquipmentCategory.DENTAL_CHAIR,
          status: EquipmentStatus.OPERATIONAL,
          criticality: CriticalityLevel.HIGH,
          lastServiceDate: new Date(clinicDateISO(-101)),
          nextServiceDue: new Date(clinicDateISO(83)),
        },
        {
          branchId: branches[0].id,
          name: 'Melag Vacuklav 40B+ Autoclave Sterilizer',
          serialNumber: 'SN-MELAG-40B-01',
          model: 'Vacuklav 40B+',
          category: EquipmentCategory.AUTOCLAVE,
          status: EquipmentStatus.OPERATIONAL,
          criticality: CriticalityLevel.HIGH,
          lastServiceDate: new Date(clinicDateISO(-84)),
          nextServiceDue: new Date(clinicDateISO(7)),
        },
        {
          branchId: branches[0].id,
          name: 'Carestream CS 8100 3D Extraoral CBCT / Panoramic',
          serialNumber: 'SN-CS-8100-01',
          model: 'CS 8100 3D',
          category: EquipmentCategory.XRAY_UNIT,
          status: EquipmentStatus.OPERATIONAL,
          criticality: CriticalityLevel.HIGH,
          lastServiceDate: new Date(clinicDateISO(-127)),
          nextServiceDue: new Date(clinicDateISO(57)),
        },
        {
          branchId: branches[1]?.id || branches[0].id,
          name: 'Dürr Dental Tornado 2 Dental Air Compressor',
          serialNumber: 'SN-DURR-TORN-02',
          model: 'Tornado 2 Silent',
          category: EquipmentCategory.COMPRESSOR,
          status: EquipmentStatus.OPERATIONAL,
          criticality: CriticalityLevel.HIGH,
          lastServiceDate: new Date(clinicDateISO(-167)),
          nextServiceDue: new Date(clinicDateISO(16)),
        },
        {
          branchId: branches[1]?.id || branches[0].id,
          name: 'KaVo MASTERtorque Dental Handpiece Set',
          serialNumber: 'SN-KAVO-MT-02',
          model: 'MASTERtorque M9000L',
          category: EquipmentCategory.HANDPIECE_UNIT,
          status: EquipmentStatus.OPERATIONAL,
          criticality: CriticalityLevel.MEDIUM,
          lastServiceDate: new Date(clinicDateISO(-115)),
          nextServiceDue: new Date(clinicDateISO(-23)),
        },
      ];

      for (const a of defaultAssets) {
        await db.equipmentAsset.upsert({
          where: { serialNumber: a.serialNumber },
          update: {},
          create: a,
        });
      }

      assets = await db.equipmentAsset.findMany({
        where: whereClause,
        include: {
          branch: true,
          room: true,
          faults: { where: { isResolved: false }, orderBy: { reportedAt: 'desc' } },
          workOrders: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { name: 'asc' },
      });
    }
  }

  return assets;
}

export async function getEquipmentAssetById(id: string) {
  return db.equipmentAsset.findUnique({
    where: { id },
    include: {
      branch: true,
      room: true,
      faults: {
        include: {
          reportedByUser: { select: { id: true, fullName: true } },
          workOrders: true,
        },
        orderBy: { reportedAt: 'desc' },
      },
      workOrders: {
        include: {
          fault: true,
          verifiedByUser: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createEquipmentAsset(data: CreateAssetInput) {
  return db.equipmentAsset.create({
    data: {
      branchId: data.branchId,
      roomId: data.roomId ?? null,
      name: data.name,
      serialNumber: data.serialNumber,
      model: data.model,
      category: data.category,
      criticality: data.criticality ?? CriticalityLevel.HIGH,
      status: EquipmentStatus.OPERATIONAL,
      nextServiceDue: data.nextServiceDue ?? null,
    },
  });
}

// ==========================================
// 2. FAULT REPORTING & SAFETY RESTRICTIONS
// ==========================================

export async function reportEquipmentFault(data: ReportFaultInput) {
  const asset = await db.equipmentAsset.findUnique({
    where: { id: data.assetId },
  });

  if (!asset) {
    throw new Error('Equipment asset not found');
  }

  // Safety logic: If CRITICAL or MAJOR, take asset out of service or restrict use
  let newStatus: EquipmentStatus = asset.status;
  if (data.severity === FaultSeverity.CRITICAL) {
    newStatus = EquipmentStatus.OUT_OF_SERVICE;
  } else if (data.severity === FaultSeverity.MAJOR) {
    newStatus = EquipmentStatus.RESTRICTED_USE;
  }

  const result = await db.$transaction(async (tx) => {
    const fault = await tx.equipmentFault.create({
      data: {
        assetId: data.assetId,
        branchId: asset.branchId,
        reportedByUserId: data.reportedByUserId,
        description: data.description,
        severity: data.severity,
        isResolved: false,
      },
      include: {
        asset: true,
        reportedByUser: { select: { id: true, fullName: true } },
      },
    });

    if (newStatus !== asset.status) {
      await tx.equipmentAsset.update({
        where: { id: data.assetId },
        data: { status: newStatus },
      });
    }

    return fault;
  });

  await logAuditEvent({
    actorUserId: data.reportedByUserId,
    action: 'EQUIPMENT_FAULT_REPORTED',
    entityType: 'EquipmentFault',
    entityId: result.id,
    branchId: asset.branchId,
    metadata: {
      assetId: data.assetId,
      severity: data.severity,
      assetStatusTransition: `${asset.status} -> ${newStatus}`,
    },
  });

  return result;
}

// ==========================================
// 3. WORK ORDERS & REPAIRS
// ==========================================

export async function createWorkOrder(data: CreateWorkOrderInput) {
  const asset = await db.equipmentAsset.findUnique({
    where: { id: data.assetId },
  });

  if (!asset) {
    throw new Error('Equipment asset not found');
  }

  const workOrder = await db.$transaction(async (tx) => {
    const wo = await tx.maintenanceWorkOrder.create({
      data: {
        assetId: data.assetId,
        faultId: data.faultId ?? null,
        technicianName: data.technicianName,
        technicianPhone: data.technicianPhone,
        workOrderType: data.workOrderType || 'CORRECTIVE',
        status: WorkOrderStatus.IN_PROGRESS,
        notes: data.notes ?? null,
      },
      include: {
        asset: true,
        fault: true,
      },
    });

    // Mark asset under maintenance
    await tx.equipmentAsset.update({
      where: { id: data.assetId },
      data: { status: EquipmentStatus.UNDER_MAINTENANCE },
    });

    return wo;
  });

  return workOrder;
}

export async function completeWorkOrder(workOrderId: string, data: CompleteWorkOrderInput) {
  const wo = await db.maintenanceWorkOrder.findUnique({
    where: { id: workOrderId },
  });

  if (!wo) {
    throw new Error('Work order not found');
  }

  const updated = await db.maintenanceWorkOrder.update({
    where: { id: workOrderId },
    data: {
      status: WorkOrderStatus.COMPLETED_AWAITING_VERIFICATION,
      costPiasters: data.costPiasters,
      downtimeHours: data.downtimeHours,
      notes: data.notes ? `${wo.notes ? wo.notes + ' | ' : ''}${data.notes}` : wo.notes,
    },
  });

  return updated;
}

export async function verifyAndReturnToService(
  workOrderId: string,
  verifiedByUserId: string,
  notes?: string
) {
  const wo = await db.maintenanceWorkOrder.findUnique({
    where: { id: workOrderId },
    include: { asset: true, fault: true },
  });

  if (!wo) {
    throw new Error('Work order not found');
  }

  const result = await db.$transaction(async (tx) => {
    // 1. Update Work Order
    const verifiedWO = await tx.maintenanceWorkOrder.update({
      where: { id: workOrderId },
      data: {
        status: WorkOrderStatus.VERIFIED_RETURNED_TO_SERVICE,
        verifiedByUserId,
        verifiedAt: new Date(),
        notes: notes ? `${wo.notes ? wo.notes + ' | ' : ''}Verification: ${notes}` : wo.notes,
      },
    });

    // 2. Mark Fault resolved if linked
    if (wo.faultId) {
      await tx.equipmentFault.update({
        where: { id: wo.faultId },
        data: { isResolved: true },
      });
    }

    // 3. Return Asset to OPERATIONAL status
    await tx.equipmentAsset.update({
      where: { id: wo.assetId },
      data: {
        status: EquipmentStatus.OPERATIONAL,
        lastServiceDate: new Date(),
      },
    });

    // 4. If repair incurred cost, log into clinic Expenses ledger
    if (wo.costPiasters > 0) {
      await tx.expense.create({
        data: {
          branchId: wo.asset.branchId,
          category: ExpenseCategory.MAINTENANCE,
          payee: `Maintenance: ${wo.technicianName} (${wo.asset.name})`,
          amountPiasters: wo.costPiasters,
          expenseDate: new Date(),
          notes: `Work order ${workOrderId} completed. Downtime: ${wo.downtimeHours}h.`,
          createdByUserId: verifiedByUserId,
        },
      });
    }

    return verifiedWO;
  });

  await logAuditEvent({
    actorUserId: verifiedByUserId,
    action: 'EQUIPMENT_RETURNED_TO_SERVICE',
    entityType: 'EquipmentAsset',
    entityId: wo.assetId,
    branchId: wo.asset.branchId,
    metadata: {
      workOrderId,
      costPiasters: wo.costPiasters,
      downtimeHours: wo.downtimeHours,
    },
  });

  return result;
}

// ==========================================
// 4. SUMMARY METRICS
// ==========================================

export async function getEquipmentSummary(branchId?: string) {
  const whereClause: any = {};
  if (branchId) whereClause.branchId = branchId;

  const [total, operational, outOfService, openFaults, activeWorkOrders] = await Promise.all([
    db.equipmentAsset.count({ where: whereClause }),
    db.equipmentAsset.count({ where: { ...whereClause, status: EquipmentStatus.OPERATIONAL } }),
    db.equipmentAsset.count({
      where: {
        ...whereClause,
        status: { in: [EquipmentStatus.OUT_OF_SERVICE, EquipmentStatus.UNDER_MAINTENANCE] },
      },
    }),
    db.equipmentFault.count({ where: { ...whereClause, isResolved: false } }),
    db.maintenanceWorkOrder.count({
      where: {
        status: { in: [WorkOrderStatus.OPEN, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED_AWAITING_VERIFICATION] },
        ...(branchId ? { asset: { branchId } } : {}),
      },
    }),
  ]);

  return {
    total,
    operational,
    outOfService,
    openFaults,
    activeWorkOrders,
  };
}

export async function getWorkOrders(branchId?: string) {
  const whereClause: any = {};
  if (branchId) {
    whereClause.asset = { branchId };
  }

  return db.maintenanceWorkOrder.findMany({
    where: whereClause,
    include: {
      asset: { include: { branch: true, room: true } },
      fault: true,
      verifiedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

