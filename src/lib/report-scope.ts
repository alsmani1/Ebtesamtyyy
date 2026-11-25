import { AccessActor, requireRole, AuthorizationError } from './rbac';
import { Role } from '@prisma/client';
export function reportBranch(user: AccessActor, roles: Role[], requested?: string | null) { requireRole(user, roles, requested); if (requested)
    return requested; if (user.roleGrants.some(g => g.role === 'OWNER_ADMIN' || (roles.includes(g.role) && g.branchId === null)))
    return undefined; const ids = [...new Set(user.roleGrants.filter(g => roles.includes(g.role)).map(g => g.branchId).filter(Boolean))]; if (ids.length === 1)
    return ids[0]!; throw new AuthorizationError('Choose an authorized branch.'); }
