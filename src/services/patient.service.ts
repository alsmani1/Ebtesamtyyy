import {normalizePhone} from '@/lib/phone';
import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import { requireRole, AuthorizationError } from '../lib/rbac';
import { Role, PatientSource, MigrationStatus, LinkStatus, DuplicateReviewStatus } from '@prisma/client';

export interface CreatePatientInput {
  fullName: string;
  dateOfBirth: string | Date;
  gender: string;
  primaryPhone: string;
  secondaryPhone?: string;
  nationalIdOrPassport?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  source?: PatientSource;
  migrationStatus?: MigrationStatus;
  legacyBalanceNotes?: string;
  primaryBranchId?: string;
}

export async function generateNextPatientNumber(): Promise<string> {
  const rows=await db.$queryRaw<{value:bigint}[]>`SELECT nextval('patient_number_sequence') AS value`;
  return `EBT-PAT-${new Date().getFullYear()}-${String(rows[0].value).padStart(4,'0')}`;
}

export async function createPatient(data: CreatePatientInput, actorUser?: { id: string; roleGrants: { role: Role; branchId: string | null }[] }) {
  // If registered by receptionist or staff, ensure they have proper role
  if (actorUser) {
    requireRole(actorUser, [Role.RECEPTIONIST, Role.BRANCH_MANAGER, Role.OWNER_ADMIN],data.primaryBranchId);
  }

  data={...data,primaryPhone:normalizePhone(data.primaryPhone)};
  const patientNumber = await generateNextPatientNumber();
  const dob = new Date(data.dateOfBirth);if(!Number.isFinite(+dob)||+dob>Date.now())throw Error('Enter a valid date of birth.');

  // 1. Check for potential duplicate candidates (same phone or exact name match)
  const potentialMatches = await db.patient.findMany({
    where: {
      OR: [
        { primaryPhone: data.primaryPhone },
        { fullName: { equals: data.fullName, mode: 'insensitive' } },
        ...(data.nationalIdOrPassport ? [{ nationalIdOrPassport: data.nationalIdOrPassport }] : []),
      ],
    },
  });

  // 2. Create the patient record in PostgreSQL
  const patient = await db.patient.create({
    data: {
      patientNumber,
      fullName: data.fullName,
      dateOfBirth: dob,
      gender: data.gender,
      primaryPhone: data.primaryPhone,
      secondaryPhone: data.secondaryPhone ?? null,
      nationalIdOrPassport: data.nationalIdOrPassport ?? null,
      address: data.address ?? null,
      emergencyContactName: data.emergencyContactName ?? null,
      emergencyContactPhone: data.emergencyContactPhone ?? null,
      source: data.source ?? PatientSource.CLINIC_ENTRY,
      migrationStatus: data.migrationStatus ?? MigrationStatus.FULLY_DIGITIZED,
      legacyBalanceNotes: data.legacyBalanceNotes ?? null,
      primaryBranchId: data.primaryBranchId ?? null,
      contacts: {
        create: [
          {
            contactType: 'PHONE',
            value: data.primaryPhone,
            isPrimary: true,
            isVerified: true,
          },
        ],
      },
    },
    include: {
      primaryBranch: true,
      contacts: true,
    },
  });

  // 3. If potential matches exist, create tracked duplicate hints (WITHOUT auto-merging!)
  for (const match of potentialMatches) {
    const matchType =
      match.primaryPhone === data.primaryPhone
        ? 'SAME_PHONE'
        : match.fullName.toLowerCase() === data.fullName.toLowerCase()
        ? 'SAME_NAME'
        : 'NATIONAL_ID_MATCH';

    const [canonicalA, canonicalB] = [match.id, patient.id].sort();
    const existingHint = await db.potentialDuplicateReview.findFirst({
      where: {
        OR: [
          { patientAId: canonicalA, patientBId: canonicalB, matchType },
          { patientAId: canonicalB, patientBId: canonicalA, matchType },
        ],
      },
    });

    if (!existingHint) {
      await db.potentialDuplicateReview.create({
        data: {
          patientAId: canonicalA,
          patientBId: canonicalB,
          matchType,
          status: DuplicateReviewStatus.PENDING,
        },
      });
    }
  }

  // 4. Record sanitized audit log
  await logAuditEvent({
    actorUserId: actorUser?.id ?? null,
    actorRole: actorUser?.roleGrants?.[0]?.role ?? 'SYSTEM',
    action: 'PATIENT_CREATED',
    entityType: 'Patient',
    entityId: patient.id,
    branchId: data.primaryBranchId ?? null,
    metadata: {
      patientNumber: patient.patientNumber,
      source: patient.source,
      hasPotentialDuplicates: potentialMatches.length > 0,
      duplicateCount: potentialMatches.length,
    },
  });

  return { patient, potentialDuplicatesFound: potentialMatches.length };
}

export async function searchPatients(
  query: string,
  actorUser?: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = query.trim();

  // Search across patientNumber, fullName, and primaryPhone
  const patients = await db.patient.findMany({
    where: {
      OR: [
        { patientNumber: { contains: cleanQuery, mode: 'insensitive' } },
        { fullName: { contains: cleanQuery, mode: 'insensitive' } },
        { primaryPhone: { contains: cleanQuery } },
      ],
    },
    include: {
      primaryBranch: true,
      duplicatesAsPrimary: {
        where: { status: DuplicateReviewStatus.PENDING },
      },
      duplicatesAsSecondary: {
        where: { status: DuplicateReviewStatus.PENDING },
      },
      portalLinks: {
        select: { id: true, status: true, userId: true },
      },
    },
    take: 30,
    orderBy: { createdAt: 'desc' },
  });

  // Projection check: Clinical notes and medical questionnaires are NEVER included in search results!
  return patients.map((p) => {
    const pendingDuplicateCount = p.duplicatesAsPrimary.length + p.duplicatesAsSecondary.length;
    return {
      id: p.id,
      patientNumber: p.patientNumber,
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      primaryPhone: p.primaryPhone,
      address: p.address,
      source: p.source,
      migrationStatus: p.migrationStatus,
      legacyBalanceNotes: p.legacyBalanceNotes,
      primaryBranch: p.primaryBranch,
      hasPendingDuplicate: pendingDuplicateCount > 0,
      portalLinkStatus: p.portalLinks[0]?.status ?? null,
      createdAt: p.createdAt,
    };
  });
}

export async function requestPortalPatientLink(userId: string, patientId: string) {
  // Check if link already exists
  const existing = await db.portalPatientLink.findUnique({
    where: {
      userId_patientId: { userId, patientId },
    },
  });

  if (existing) {
    return existing;
  }

  const link = await db.portalPatientLink.create({
    data: {
      userId,
      patientId,
      status: LinkStatus.PENDING,
    },
  });

  await logAuditEvent({
    actorUserId: userId,
    actorRole: 'PATIENT',
    action: 'PORTAL_LINK_REQUESTED',
    entityType: 'PortalPatientLink',
    entityId: link.id,
    metadata: { patientId },
  });

  return link;
}

export async function verifyPortalPatientLink(
  linkId: string,
  decision: 'APPROVE' | 'REJECT',
  verificationNotes: string,
  verifierUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  requireRole(verifierUser, [Role.RECEPTIONIST, Role.OWNER_ADMIN]);

  const link = await db.portalPatientLink.findUnique({
    where: { id: linkId },
    include: { patient: true },
  });

  if (!link) {
    throw new Error('Portal link request not found');
  }

  const newStatus = decision === 'APPROVE' ? LinkStatus.APPROVED : LinkStatus.REJECTED;

  const updated = await db.portalPatientLink.update({
    where: { id: linkId },
    data: {
      status: newStatus,
      verifiedByUserId: verifierUser.id,
      verifiedAt: new Date(),
      verificationNotes,
      rejectionReason: decision === 'REJECT' ? verificationNotes : null,
    },
  });

  await logAuditEvent({
    actorUserId: verifierUser.id,
    actorRole: verifierUser.roleGrants[0]?.role,
    action: decision === 'APPROVE' ? 'PORTAL_LINK_APPROVED' : 'PORTAL_LINK_REJECTED',
    entityType: 'PortalPatientLink',
    entityId: link.id,
    metadata: {
      patientNumber: link.patient.patientNumber,
      decision,
      verificationNotes,
    },
  });

  return updated;
}

export async function resolveDuplicateReview(
  reviewId: string,
  resolution: DuplicateReviewStatus,
  resolutionNotes: string,
  actorUser: { id: string; roleGrants: { role: Role; branchId: string | null }[] }
) {
  requireRole(actorUser, [Role.RECEPTIONIST, Role.BRANCH_MANAGER, Role.OWNER_ADMIN]);

  const review = await db.potentialDuplicateReview.update({
    where: { id: reviewId },
    data: {
      status: resolution,
      reviewedByUserId: actorUser.id,
      reviewedAt: new Date(),
      resolutionNotes,
    },
  });

  // Also resolve any other pending hints for the same unordered pair + matchType
  await db.potentialDuplicateReview.updateMany({
    where: {
      status: DuplicateReviewStatus.PENDING,
      matchType: review.matchType,
      OR: [
        { patientAId: review.patientAId, patientBId: review.patientBId },
        { patientAId: review.patientBId, patientBId: review.patientAId },
      ],
    },
    data: {
      status: resolution,
      reviewedByUserId: actorUser.id,
      reviewedAt: new Date(),
      resolutionNotes,
    },
  });

  await logAuditEvent({
    actorUserId: actorUser.id,
    actorRole: actorUser.roleGrants[0]?.role,
    action: 'DUPLICATE_REVIEW_RESOLVED',
    entityType: 'PotentialDuplicateReview',
    entityId: review.id,
    metadata: {
      resolution,
      notes: resolutionNotes,
    },
  });

  return review;
}
