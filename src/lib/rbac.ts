import { Role, User, RoleGrant } from '@prisma/client';
import db from './db';

export class AuthorizationError extends Error {
  statusCode: number;
  constructor(message: string = 'Access denied: insufficient permissions', statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

export class AuthenticationError extends Error {
  statusCode: number;
  constructor(message: string = 'Authentication required', statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}

export type UserWithGrants = User & {
  roleGrants: RoleGrant[];
};

export type AccessActor = { id: string; roleGrants: { role: Role; branchId: string | null }[] };
export function branchScope(user: AccessActor, roles: Role[], requested?: string | null) {
  requireRole(user, roles, requested);
  if (requested) return requested;
  if (user.roleGrants.some(g => roles.includes(g.role) && g.branchId === null)) return undefined;
  return { in: user.roleGrants.filter(g => roles.includes(g.role) && g.branchId).map(g => g.branchId!) };
}
export async function requireClinicalAccess(user: AccessActor, patientId: string, allowPatient = false) {

  if (user.roleGrants.some(g => g.role === Role.DENTIST)) { await assertCareAssignment(user.id, patientId); return; }
  if (allowPatient && user.roleGrants.some(g => g.role === Role.PATIENT)) { await assertPatientSelf(user.id, patientId); return; }
  throw new AuthorizationError('You do not have access to this clinical record.');
}

export function hasRole(
  user: { roleGrants: { role: Role; branchId: string | null }[] } | null | undefined,
  allowedRoles: Role | Role[],
  branchId?: string | null
): boolean {
  if (!user || !user.roleGrants || user.roleGrants.length === 0) return false;

  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Only explicit grants authorize a role; executive access is not a wildcard.

  return user.roleGrants.some((grant) => {
    if (!rolesArray.includes(grant.role)) return false;
    // If branchId is specified, user must have grant for that branch OR organization-wide (null branchId)
    if (branchId !== undefined && branchId !== null) {
      return grant.branchId === null || grant.branchId === branchId;
    }
    return true;
  });
}

export function requireRole(
  user: { roleGrants: { role: Role; branchId: string | null }[] } | null | undefined,
  allowedRoles: Role | Role[],
  branchId?: string | null
) {
  if (!user) {
    throw new AuthenticationError('You must be logged in to perform this action');
  }

  if (!hasRole(user, allowedRoles, branchId)) {
    throw new AuthorizationError('You do not have permission to perform this action');
  }
}

export async function assertPatientSelf(userId: string, targetPatientId: string) {
  // Check if user has an APPROVED link to this patient
  const link = await db.portalPatientLink.findFirst({
    where: {
      userId,
      patientId: targetPatientId,
      status: 'APPROVED',
    },
  });

  if (!link) {
    throw new AuthorizationError('Access denied: You can only view and manage your own authorized patient record.');
  }

  return link;
}

export async function assertCareAssignment(dentistUserId: string, patientId: string) {
  const assignment = await db.patientCareAssignment.findFirst({
    where: {
      dentistUserId,
      patientId,
      active: true,
    },
  });

  if (!assignment) {
    throw new AuthorizationError('Access denied: You are not assigned as an authorized treating clinician for this patient.');
  }

  return assignment;
}

export async function assertBranchAccess(
  user: { id: string; roleGrants: { role: Role; branchId: string | null }[] },
  branchId: string
) {
  const hasAccess = user.roleGrants.some(
    (g) => g.role === Role.OWNER_ADMIN || g.branchId === null || g.branchId === branchId
  );

  if (!hasAccess) {
    throw new AuthorizationError('Access denied: You do not have operational access to this branch.');
  }
}
