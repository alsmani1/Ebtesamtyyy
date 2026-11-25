import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import { 
  EncounterStatus, 
  TreatmentPlanStatus, 
  TreatmentItemStatus, 
  FileCategory 
} from '@prisma/client';

export interface CreateEncounterInput {
  patientId: string;
  branchId: string;
  dentistUserId: string;
  appointmentId?: string;
  chiefComplaint: string;
  examinationFindings: string;
  provisionalDiagnosis?: string;
  clinicalNotes: string;
}

export interface UpdateEncounterDraftInput {
  chiefComplaint?: string;
  examinationFindings?: string;
  provisionalDiagnosis?: string;
  clinicalNotes?: string;
}

export interface RecordToothFindingInput {
  patientId: string;
  encounterId?: string;
  toothNumber: string;
  surface?: string;
  condition: string;
  notes?: string;
  dentistUserId: string;
}

export interface CreateTreatmentPlanInput {
  patientId: string;
  dentistUserId: string;
  branchId: string;
  title: string;
  notes?: string;
  items: Array<{
    procedureName: string;
    toothNumber?: string;
    estimatedCostPiasters: number;
    sequenceOrder?: number;
    notes?: string;
  }>;
}

export interface RecordDocumentMetadataInput {
  patientId: string;
  branchId: string;
  encounterId?: string;
  fileName: string;
  fileMime: string;
  fileSizeBytes: number;
  fileCategory: FileCategory;
  storageKey: string;
  uploadedByUserId: string;
  notes?: string;
}

// ==========================================
// 1. ENCOUNTERS & IMMUTABLE CLINICAL NOTES
// ==========================================

export async function createEncounter(data: CreateEncounterInput) {
  const encounter = await db.encounter.create({
    data: {
      patientId: data.patientId,
      branchId: data.branchId,
      dentistUserId: data.dentistUserId,
      appointmentId: data.appointmentId ?? null,
      chiefComplaint: data.chiefComplaint,
      examinationFindings: data.examinationFindings,
      provisionalDiagnosis: data.provisionalDiagnosis ?? null,
      clinicalNotes: data.clinicalNotes,
      status: EncounterStatus.DRAFT,
    },
    include: {
      patient: true,
      branch: true,
      dentistUser: { select: { id: true, fullName: true, email: true } },
    },
  });

  await logAuditEvent({
    actorUserId: data.dentistUserId,
    action: 'CLINICAL_ENCOUNTER_CREATED',
    entityType: 'Encounter',
    entityId: encounter.id,
    branchId: data.branchId,
    metadata: { patientId: data.patientId, appointmentId: data.appointmentId },
  });

  return encounter;
}

export async function updateEncounterDraft(
  encounterId: string, 
  dentistUserId: string, 
  updates: UpdateEncounterDraftInput
) {
  const existing = await db.encounter.findUnique({
    where: { id: encounterId },
  });

  if (!existing) {
    throw new Error('Encounter not found');
  }

  if (existing.status === EncounterStatus.FINALIZED) {
    throw new Error('Finalized clinical encounters are legally immutable. Create a signed clinical addendum for modifications.');
  }

  const updated = await db.encounter.update({
    where: { id: encounterId, dentistUserId, status: EncounterStatus.DRAFT, clinicalNotes:existing.clinicalNotes },
    data: {
      ...(updates.chiefComplaint !== undefined && { chiefComplaint: updates.chiefComplaint }),
      ...(updates.examinationFindings !== undefined && { examinationFindings: updates.examinationFindings }),
      ...(updates.provisionalDiagnosis !== undefined && { provisionalDiagnosis: updates.provisionalDiagnosis }),
      ...(updates.clinicalNotes !== undefined && { clinicalNotes: updates.clinicalNotes }),
    },
  });

  return updated;
}

export async function finalizeEncounter(
  encounterId: string,
  dentistUserId: string,
  finalizedDiagnosis: string,
  clinicalNotesAddendum?: string
) {
  const existing = await db.encounter.findUnique({
    where: { id: encounterId },
  });

  if (!existing) {
    throw new Error('Encounter not found');
  }

  if (existing.status === EncounterStatus.FINALIZED) {
    throw new Error('Encounter has already been finalized.');
  }

  const updatedNotes = clinicalNotesAddendum 
    ? `${existing.clinicalNotes}\n\n[Finalization Notes]: ${clinicalNotesAddendum}` 
    : existing.clinicalNotes;

  const finalized = await db.encounter.update({
    where: { id: encounterId, dentistUserId, status: EncounterStatus.DRAFT, clinicalNotes:existing.clinicalNotes },
    data: {
      status: EncounterStatus.FINALIZED,
      finalizedDiagnosis,
      clinicalNotes: updatedNotes,
      finalizedAt: new Date(),
      endedAt: new Date(),
    },
    include: {
      patient: true,
      branch: true,
      dentistUser: { select: { id: true, fullName: true } },
    },
  });

  await logAuditEvent({
    actorUserId: dentistUserId,
    action: 'CLINICAL_ENCOUNTER_FINALIZED',
    entityType: 'Encounter',
    entityId: encounterId,
    branchId: existing.branchId,
    metadata: { patientId: existing.patientId },
  });

  return finalized;
}

export async function addClinicalAddendum(
  encounterId: string,
  dentistUserId: string,
  addendumText: string
) {
  if (!addendumText || addendumText.trim().length === 0) {
    throw new Error('Addendum text cannot be empty');
  }

  const encounter = await db.encounter.findUnique({
    where: { id: encounterId },
  });

  if (!encounter) {
    throw new Error('Encounter not found');
  }

  const addendum = await db.clinicalNoteAddendum.create({
    data: {
      encounterId,
      dentistUserId,
      addendumText: addendumText.trim(),
    },
    include: {
      dentistUser: { select: { id: true, fullName: true } },
    },
  });

  await logAuditEvent({
    actorUserId: dentistUserId,
    action: 'CLINICAL_ADDENDUM_ADDED',
    entityType: 'ClinicalNoteAddendum',
    entityId: addendum.id,
    branchId: encounter.branchId,
    metadata: { patientId: encounter.patientId, encounterId },
  });

  return addendum;
}

export async function getEncounter(encounterId: string) {
  return db.encounter.findUnique({
    where: { id: encounterId },
    include: {
      patient: true,
      branch: true,
      dentistUser: { select: { id: true, fullName: true, email: true } },
      addenda: {
        include: { dentistUser: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'asc' },
      },
      toothFindings: {
        orderBy: { recordedAt: 'desc' },
      },
      performedItems: true,
      documentMetadata: true,
    },
  });
}

export async function getPatientEncounters(patientId: string) {
  return db.encounter.findMany({
    where: { patientId },
    include: {
      branch: true,
      dentistUser: { select: { id: true, fullName: true } },
      addenda: {
        include: { dentistUser: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'asc' },
      },
      toothFindings: true,
      performedItems: true,
    },
    orderBy: { startedAt: 'desc' },
  });
}

// ==========================================
// 2. TOOTH FINDINGS & ODONTOGRAM (TOOTH CHART)
// ==========================================

export async function recordToothFinding(data: RecordToothFindingInput) {
  // Validate candidate FDI two-digit tooth notation (11-48 adult, 51-85 primary)
  const toothNum = parseInt(data.toothNumber, 10);
  const isValidFdi = 
    (toothNum >= 11 && toothNum <= 18) ||
    (toothNum >= 21 && toothNum <= 28) ||
    (toothNum >= 31 && toothNum <= 38) ||
    (toothNum >= 41 && toothNum <= 48) ||
    (toothNum >= 51 && toothNum <= 55) ||
    (toothNum >= 61 && toothNum <= 65) ||
    (toothNum >= 71 && toothNum <= 75) ||
    (toothNum >= 81 && toothNum <= 85);

  if (!isValidFdi) {
    throw new Error(`Invalid tooth identifier: ${data.toothNumber}. Must follow FDI standard.`);
  }

  const finding = await db.toothFinding.create({
    data: {
      patientId: data.patientId,
      encounterId: data.encounterId ?? null,
      toothNumber: data.toothNumber,
      surface: data.surface ?? null,
      condition: data.condition,
      notes: data.notes ?? null,
      recordedByUserId: data.dentistUserId,
    },
    include: {
      recordedByUser: { select: { id: true, fullName: true } },
    },
  });

  await logAuditEvent({
    actorUserId: data.dentistUserId,
    action: 'TOOTH_FINDING_RECORDED',
    entityType: 'ToothFinding',
    entityId: finding.id,
    metadata: { patientId: data.patientId, toothNumber: data.toothNumber, condition: data.condition, surface: data.surface },
  });

  return finding;
}

export async function getPatientToothChart(patientId: string) {
  const findings = await db.toothFinding.findMany({
    where: { patientId },
    include: {
      recordedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { recordedAt: 'desc' },
  });

  // Group by toothNumber and keep latest primary condition, plus full history
  const chart: Record<string, { latest: any; history: any[] }> = {};
  for (const f of findings) {
    if (!chart[f.toothNumber]) {
      chart[f.toothNumber] = {
        latest: f,
        history: [f],
      };
    } else {
      chart[f.toothNumber].history.push(f);
    }
  }

  return chart;
}

// ==========================================
// 3. TREATMENT PLANS & PROCEDURAL ITEMS
// ==========================================

export async function createTreatmentPlan(data: CreateTreatmentPlanInput) {
  const totalEstimatedCostPiasters = data.items.reduce(
    (sum, item) => sum + (item.estimatedCostPiasters || 0), 
    0
  );

  const plan = await db.treatmentPlan.create({
    data: {
      patientId: data.patientId,
      dentistUserId: data.dentistUserId,
      branchId: data.branchId,
      title: data.title,
      notes: data.notes ?? null,
      status: TreatmentPlanStatus.DRAFT,
      totalEstimatedCostPiasters,
      items: {
        create: data.items.map((item, idx) => ({
          sequenceOrder: item.sequenceOrder ?? idx + 1,
          procedureName: item.procedureName,
          toothNumber: item.toothNumber ?? null,
          estimatedCostPiasters: item.estimatedCostPiasters,
          notes: item.notes ?? null,
          status: TreatmentItemStatus.PLANNED,
        })),
      },
    },
    include: {
      items: { orderBy: { sequenceOrder: 'asc' } },
      dentistUser: { select: { id: true, fullName: true } },
      branch: true,
    },
  });

  await logAuditEvent({
    actorUserId: data.dentistUserId,
    action: 'TREATMENT_PLAN_CREATED',
    entityType: 'TreatmentPlan',
    entityId: plan.id,
    branchId: data.branchId,
    metadata: { patientId: data.patientId, totalEstimatedCostPiasters, itemsCount: data.items.length },
  });

  return plan;
}

export async function updateTreatmentPlanStatus(
  planId: string, 
  actorUserId: string, 
  status: TreatmentPlanStatus
) {
  const plan = await db.treatmentPlan.findUnique({
    where: { id: planId },
    include: { items: true },
  });

  if (!plan) {
    throw new Error('Treatment plan not found');
  }

  const updated = await db.treatmentPlan.update({
    where: { id: planId },
    data: { status },
    include: {
      items: { orderBy: { sequenceOrder: 'asc' } },
      dentistUser: { select: { id: true, fullName: true } },
    },
  });

  await logAuditEvent({
    actorUserId,
    action: 'TREATMENT_PLAN_STATUS_CHANGED',
    entityType: 'TreatmentPlan',
    entityId: planId,
    metadata: { patientId: plan.patientId, from: plan.status, to: status },
  });

  return updated;
}

export async function markTreatmentItemPerformed(
  itemId: string,
  encounterId: string,
  actorUserId: string,
  notes?: string
) {
  const item = await db.treatmentPlanItem.findUnique({
    where: { id: itemId },
    include: { treatmentPlan: true },
  });

  if (!item) {
    throw new Error('Treatment plan item not found');
  }

  const updatedItem = await db.treatmentPlanItem.update({
    where: { id: itemId },
    data: {
      status: TreatmentItemStatus.PERFORMED,
      performedEncounterId: encounterId,
      performedAt: new Date(),
      ...(notes ? { notes: item.notes ? `${item.notes}\n${notes}` : notes } : {}),
    },
    include: {
      performedEncounter: true,
      treatmentPlan: true,
    },
  });

  // Check if all items in plan are performed, if so, move plan to COMPLETED
  const allItems = await db.treatmentPlanItem.findMany({
    where: { treatmentPlanId: item.treatmentPlanId },
  });
  const allDone = allItems.every((it) => it.status === TreatmentItemStatus.PERFORMED || it.status === TreatmentItemStatus.DECLINED);
  if (allDone && item.treatmentPlan.status !== TreatmentPlanStatus.COMPLETED) {
    await db.treatmentPlan.update({
      where: { id: item.treatmentPlanId },
      data: { status: TreatmentPlanStatus.COMPLETED },
    });
  }

  await logAuditEvent({
    actorUserId,
    action: 'TREATMENT_ITEM_PERFORMED',
    entityType: 'TreatmentPlanItem',
    entityId: itemId,
    metadata: { patientId: item.treatmentPlan.patientId, encounterId, procedureName: item.procedureName, toothNumber: item.toothNumber },
  });

  // Automatically trigger configured MaterialRecipe stock deduction (idempotent: once per itemId)
  try {
    const existingDed = await db.stockMovement.findFirst({
      where: { referenceId: `PROC:${itemId}`, movementType: 'CONSUMPTION' },
    });
    if (!existingDed) {
      const recipes = await db.materialRecipe.findMany();
      const matchedRecipe = recipes.find((r) =>
        item.procedureName.toLowerCase().includes(r.procedureName.toLowerCase()) ||
        r.procedureName.toLowerCase().includes(item.procedureName.toLowerCase())
      );
      const targetMaterialId = matchedRecipe?.materialId || (await db.material.findFirst({ where: { isActive: true } }))?.id;
      const deductQty = matchedRecipe?.quantityRequired || 1;
      if (targetMaterialId) {
        const lot = await db.stockLot.findFirst({
          where: {
            materialId: targetMaterialId,
            branchId: item.treatmentPlan.branchId,
            isQuarantined: false,
            quantityOnHand: { gte: deductQty },
          },
          orderBy: { expiryDate: 'asc' },
        });
        if (lot) {
          await db.$transaction([
            db.stockLot.update({
              where: { id: lot.id },
              data: { quantityOnHand: { decrement: deductQty } },
            }),
            db.stockMovement.create({
              data: {
                materialId: targetMaterialId,
                branchId: item.treatmentPlan.branchId,
                lotId: lot.id,
                movementType: 'CONSUMPTION',
                quantity: -deductQty,
                referenceId: `PROC:${itemId}`,
                notes: `Auto-deducted for completed procedure: ${item.procedureName}`,
                performedByUserId: actorUserId,
              },
            }),
          ]);
        }
      }
      // Award loyalty points once per completed treatment item
      await db.loyaltyLedger.create({
        data: {
          patientId: item.treatmentPlan.patientId,
          points: 50,
          reason: `Completed clinical procedure: ${item.procedureName}`,
          visitId: itemId,
        },
      });
    }
  } catch (dedErr) {
    console.warn('Non-fatal recipe deduction / loyalty update warning:', dedErr);
  }

  return updatedItem;
}

export async function getPatientTreatmentPlans(patientId: string) {
  return db.treatmentPlan.findMany({
    where: { patientId },
    include: {
      items: { 
        orderBy: { sequenceOrder: 'asc' },
        include: { performedEncounter: true },
      },
      dentistUser: { select: { id: true, fullName: true } },
      branch: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ==========================================
// 4. DIAGNOSTIC FILES, X-RAYS & CONSENTS
// ==========================================

export async function recordDocumentMetadata(data: RecordDocumentMetadataInput) {
  // Validate acceptable MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'image/tiff',
    'application/dicom',
  ];

  if (!allowedMimes.includes(data.fileMime.toLowerCase())) {
    throw new Error(`Unsupported medical file type: ${data.fileMime}. Only JPEG, PNG, WEBP, PDF, TIFF and DICOM are permitted.`);
  }

  // File size validation (max 50MB per healthcare document)
  const MAX_SIZE = 50 * 1024 * 1024;
  if (data.fileSizeBytes > MAX_SIZE) {
    throw new Error(`File size exceeds maximum permitted 50MB threshold.`);
  }

  const document = await db.documentMetadata.create({
    data: {
      patientId: data.patientId,
      branchId: data.branchId,
      encounterId: data.encounterId ?? null,
      fileName: data.fileName,
      fileMime: data.fileMime,
      fileSizeBytes: data.fileSizeBytes,
      fileCategory: data.fileCategory,
      storageKey: data.storageKey,
      uploadedByUserId: data.uploadedByUserId,
      isVerified: true,
      notes: data.notes ?? null,
    },
    include: {
      uploadedByUser: { select: { id: true, fullName: true } },
      branch: true,
    },
  });

  await logAuditEvent({
    actorUserId: data.uploadedByUserId,
    action: 'DOCUMENT_METADATA_RECORDED',
    entityType: 'DocumentMetadata',
    entityId: document.id,
    branchId: data.branchId,
    metadata: { patientId: data.patientId, fileName: data.fileName, category: data.fileCategory, size: data.fileSizeBytes },
  });

  return document;
}

export async function getPatientDocuments(patientId: string, category?: FileCategory) {
  return db.documentMetadata.findMany({
    where: {
      patientId,
      ...(category ? { fileCategory: category } : {}),
    },
    include: {
      uploadedByUser: { select: { id: true, fullName: true } },
      encounter: true,
      branch: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ==========================================
// 5. COMPREHENSIVE CLINICAL PATIENT SUMMARY
// ==========================================

export async function getPatientClinicalSummary(patientId: string) {
  const patient = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      primaryBranch: true,
      medicalSubmissions: {
        where: { status: {not:'DRAFT'} },
        include: {
          reviews: {
            include: { dentistUser: { select: { id: true, fullName: true } } },
            orderBy: { reviewedAt: 'desc' },
          },
        },
        orderBy: { versionNumber: 'desc' },

      },
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  const { ensurePlatformDefaults } = await import('./platform-extensions.service');
  await ensurePlatformDefaults();

  const [encounters, toothChart, treatmentPlans, documents, prescriptions, labOrders, laboratories, loyaltyRows] = await Promise.all([
    getPatientEncounters(patientId),
    getPatientToothChart(patientId),
    getPatientTreatmentPlans(patientId),
    getPatientDocuments(patientId),
    db.prescription.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
    db.labOrder.findMany({ where: { patientId }, include: { laboratory: true }, orderBy: { createdAt: 'desc' } }),
    db.laboratory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    db.loyaltyLedger.findMany({ where: { patientId }, orderBy: { createdAt: 'desc' } }),
  ]);

  return {
    patient,
    latestReviewedIntake: patient.medicalSubmissions.find(s=>s.status==='REVIEWED')||null,
    encounters,
    toothChart,
    treatmentPlans,
    documents,
    prescriptions,
    labOrders,
    laboratories,
    loyaltyPoints: loyaltyRows.reduce((s, r) => s + r.points, 0),
    loyaltyHistory: loyaltyRows,
  };
}
