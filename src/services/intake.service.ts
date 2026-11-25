import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import { requireRole, assertCareAssignment, assertPatientSelf, AuthorizationError } from '../lib/rbac';
import { Role, IntakeStatus, IntakeSource, ReviewOutcome, Prisma } from '@prisma/client';

export interface MedicalAnswers {
  conditions: {
    hypertension?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    diabetes?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    bleedingDisorder?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    heartDisease?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    respiratory?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    hepatitisLiver?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    kidneyDisease?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    otherConditions?: string;
  };
  allergies: {
    penicillin?: { value: 'YES' | 'NO' | 'UNKNOWN'; reaction?: string };
    latex?: { value: 'YES' | 'NO' | 'UNKNOWN'; reaction?: string };
    localAnesthetics?: { value: 'YES' | 'NO' | 'UNKNOWN'; reaction?: string };
    aspirin?: { value: 'YES' | 'NO' | 'UNKNOWN'; reaction?: string };
    otherAllergies?: string;
  };
  medications: {
    bloodThinners?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    immunosuppressants?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    bisphosphonates?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
    currentMedsList?: string;
    isPregnantOrNursing?: { value: 'YES' | 'NO' | 'UNKNOWN'; notes?: string };
  };
  dental: {
    chiefComplaint?: string;
    dentalAnxiety?: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
    previousComplications?: string;
  };
}

export async function saveIntakeDraft(
  patientId: string,
  answers: MedicalAnswers,
  actorUserId: string
) {
  // Check if patient exists
  const patient = await db.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  // Find existing draft if any
  const existingDraft = await db.medicalHistorySubmission.findFirst({
    where: {
      patientId,
      status: IntakeStatus.DRAFT,
    },
  });

  if (existingDraft) {
    const updated = await db.medicalHistorySubmission.update({
      where: { id: existingDraft.id },
      data: {
        answersJson: answers as unknown as Prisma.InputJsonValue,
        submittedByUserId: actorUserId,
      },
    });
    return updated;
  }

  // Calculate next version number
  const latestSubmission = await db.medicalHistorySubmission.findFirst({
    where: { patientId },
    orderBy: { versionNumber: 'desc' },
  });
  const nextVersion = (latestSubmission?.versionNumber ?? 0) + 1;

  const draft = await db.medicalHistorySubmission.create({
    data: {
      patientId,
      versionNumber: nextVersion,
      status: IntakeStatus.DRAFT,
      answersJson: answers as unknown as Prisma.InputJsonValue,
      submissionSource: IntakeSource.PATIENT_PORTAL,
      submittedByUserId: actorUserId,
    },
  });

  return draft;
}

export async function submitIntake(
  patientId: string,
  answers: MedicalAnswers,
  actorUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] },
  isAssistedByReception: boolean = false
) {
  // Check if patient exists
  const patient = await db.patient.findUnique({ where: { id: patientId } });
  if (!patient) throw new Error('Patient not found');

  // Verify authorization:
  // If assisted by receptionist, actor must be receptionist or admin.
  // If patient submitting directly, must verify patient owns this record.
  if (isAssistedByReception) {
    requireRole(actorUser, [Role.RECEPTIONIST, Role.OWNER_ADMIN]);
  } else {
    // Assert patient is authorized for this record
    await assertPatientSelf(actorUser.id, patientId);
  }

  const submissionSource = isAssistedByReception
    ? IntakeSource.PATIENT_ASSISTED_BY_RECEPTION
    : IntakeSource.PATIENT_PORTAL;

  // Invalidate any earlier active submissions (supersede previous reviews for current care)
  await db.medicalHistorySubmission.updateMany({
    where: {
      patientId,
      status: { in: [IntakeStatus.PENDING_REVIEW, IntakeStatus.REVIEWED] },
    },
    data: {
      status: IntakeStatus.SUPERSEDED,
    },
  });

  // Check if there is an existing draft to promote to submitted, otherwise create new version
  const existingDraft = await db.medicalHistorySubmission.findFirst({
    where: {
      patientId,
      status: IntakeStatus.DRAFT,
    },
  });

  let submission;
  if (existingDraft) {
    submission = await db.medicalHistorySubmission.update({
      where: { id: existingDraft.id },
      data: {
        answersJson: answers as unknown as Prisma.InputJsonValue,
        status: IntakeStatus.PENDING_REVIEW,
        submissionSource,
        submittedByUserId: actorUser.id,
        submittedAt: new Date(),
      },
    });
  } else {
    const latest = await db.medicalHistorySubmission.findFirst({
      where: { patientId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (latest?.versionNumber ?? 0) + 1;

    submission = await db.medicalHistorySubmission.create({
      data: {
        patientId,
        versionNumber,
        answersJson: answers as unknown as Prisma.InputJsonValue,
        status: IntakeStatus.PENDING_REVIEW,
        submissionSource,
        submittedByUserId: actorUser.id,
        submittedAt: new Date(),
      },
    });
  }

  // Sanitized audit log
  await logAuditEvent({
    actorUserId: actorUser.id,
    actorRole: actorUser.roleGrants[0]?.role ?? 'PATIENT',
    action: 'INTAKE_SUBMITTED',
    entityType: 'MedicalHistorySubmission',
    entityId: submission.id,
    metadata: {
      patientNumber: patient.patientNumber,
      versionNumber: submission.versionNumber,
      submissionSource,
      hasUnknowns: JSON.stringify(answers).includes('"UNKNOWN"'),
    },
  });

  return submission;
}

export async function reviewIntake(
  submissionId: string,
  outcome: ReviewOutcome,
  clinicalNotes: string,
  dentistUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  // CRITICAL SECURITY: Receptionists or management MUST NEVER be allowed to approve clinical review!
  requireRole(dentistUser, [Role.DENTIST]);

  const submission = await db.medicalHistorySubmission.findUnique({
    where: { id: submissionId },
    include: {
      patient: true,
      reviews: true,
    },
  });

  if (!submission) {
    throw new Error('Medical history submission not found');
  }

  // Treating dentist must have explicit care assignment to this patient!
  await assertCareAssignment(dentistUser.id, submission.patientId);

  // Create immutable review record
  const review = await db.medicalHistoryReview.create({
    data: {
      submissionId,
      dentistUserId: dentistUser.id,
      outcome,
      clinicalNotes,
      reviewedAt: new Date(),
    },
  });

  // Update submission status to REVIEWED
  await db.medicalHistorySubmission.update({
    where: { id: submissionId },
    data: {
      status: IntakeStatus.REVIEWED,
    },
  });

  // Sanitized audit event (free text clinical notes NOT stored in audit log)
  await logAuditEvent({
    actorUserId: dentistUser.id,
    actorRole: 'DENTIST',
    action: 'INTAKE_REVIEWED',
    entityType: 'MedicalHistoryReview',
    entityId: review.id,
    metadata: {
      submissionId: submission.id,
      patientNumber: submission.patient.patientNumber,
      versionNumber: submission.versionNumber,
      outcome,
    },
  });

  return review;
}

export async function getPatientIntakeHistory(
  patientId: string,
  actorUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  // Check access permissions:
  // 1. Patient self-access
  // 2. Assigned Dentist
  // 3. Receptionist (for assisting/checking submission status)
  // Management does NOT get full medical answers!
  const isPatient = actorUser.roleGrants.some((g) => g.role === Role.PATIENT);
  const isDentist = actorUser.roleGrants.some((g) => g.role === Role.DENTIST);
  const isReception = actorUser.roleGrants.some((g) => g.role === Role.RECEPTIONIST);
  const isAdmin = actorUser.roleGrants.some((g) => g.role === Role.OWNER_ADMIN);
  const isManager = actorUser.roleGrants.some((g) => g.role === Role.BRANCH_MANAGER);

  if (isManager && !isAdmin && !isDentist) {
    throw new AuthorizationError('Access denied: Branch management is not authorized to read patient medical intake questionnaires.');
  }

  if (isPatient) {
    await assertPatientSelf(actorUser.id, patientId);
  } else if (isDentist && !isAdmin) {
    await assertCareAssignment(actorUser.id, patientId);
  } else if (!isReception && !isAdmin) {
    throw new AuthorizationError('Access denied: You do not have permission to view clinical records.');
  }

  const submissions = await db.medicalHistorySubmission.findMany({
    where: { patientId },
    include: {
      submittedByUser: {
        select: { id: true, fullName: true },
      },
      reviews: {
        include: {
          dentistUser: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { reviewedAt: 'desc' },
      },
    },
    orderBy: { versionNumber: 'desc' },
  });

  return submissions;
}
