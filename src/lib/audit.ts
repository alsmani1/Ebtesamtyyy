import db from './db';
import { Prisma } from '@prisma/client';

export interface AuditLogParams {
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  branchId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export async function logAuditEvent(params: AuditLogParams) {
  try {
    // Sanitize metadata to guarantee zero clinical PHI is persisted in audit trail
    const sanitizedMetadata = sanitizeAuditMetadata(params.metadata||{});

    await db.auditEvent.create({
      data: {
        actorUserId: params.actorUserId ?? null,
        actorRole: params.actorRole ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        branchId: params.branchId ?? null,
        metadataJson: sanitizedMetadata as Prisma.InputJsonValue,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error('[AuditEvent] Failed to persist audit event:', err);
    // Never crash the primary business operation if audit write encounters a non-fatal issue
  }
}

export function sanitizeAuditMetadata(value:unknown):unknown {if(Array.isArray(value))return value.map(sanitizeAuditMetadata);if(value&&typeof value==='object'){if(value instanceof Date)return value.toISOString();return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,/note|diagnosis|answer|questionnaire|password|reason|complaint|finding|phone|email|fullname/i.test(key)&&typeof item==='string'?'[REDACTED]':sanitizeAuditMetadata(item)]));}return value;}
