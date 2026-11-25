// Pure TypeScript replacement for @prisma/client to run smoothly on Cloudflare Workers & Vercel without native Prisma engine bindings

export const Role = {
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
  DENTIST: 'DENTIST',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  OWNER_ADMIN: 'OWNER_ADMIN',
  FINANCE: 'FINANCE',
  INVENTORY: 'INVENTORY',
  CRM: 'CRM',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const PatientSource = {
  CLINIC_ENTRY: 'CLINIC_ENTRY',
  ONLINE_SELF_REG: 'ONLINE_SELF_REG',
  MIGRATED_LEGACY: 'MIGRATED_LEGACY',
} as const;
export type PatientSource = (typeof PatientSource)[keyof typeof PatientSource];

export const MigrationStatus = {
  NOT_DIGITIZED: 'NOT_DIGITIZED',
  PARTIALLY_DIGITIZED: 'PARTIALLY_DIGITIZED',
  FULLY_DIGITIZED: 'FULLY_DIGITIZED',
} as const;
export type MigrationStatus = (typeof MigrationStatus)[keyof typeof MigrationStatus];

export const LinkStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type LinkStatus = (typeof LinkStatus)[keyof typeof LinkStatus];

export const DuplicateReviewStatus = {
  PENDING: 'PENDING',
  REVIEWED_DISTINCT: 'REVIEWED_DISTINCT',
  RESOLVED_MERGED: 'RESOLVED_MERGED',
} as const;
export type DuplicateReviewStatus = (typeof DuplicateReviewStatus)[keyof typeof DuplicateReviewStatus];

export const IntakeStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  REVIEWED: 'REVIEWED',
  SUPERSEDED: 'SUPERSEDED',
} as const;
export type IntakeStatus = (typeof IntakeStatus)[keyof typeof IntakeStatus];

export const IntakeSource = {
  PATIENT_PORTAL: 'PATIENT_PORTAL',
  PATIENT_ASSISTED_BY_RECEPTION: 'PATIENT_ASSISTED_BY_RECEPTION',
} as const;
export type IntakeSource = (typeof IntakeSource)[keyof typeof IntakeSource];

export const ReviewOutcome = {
  APPROVED: 'APPROVED',
  CLARIFICATION_REQUESTED: 'CLARIFICATION_REQUESTED',
} as const;
export type ReviewOutcome = (typeof ReviewOutcome)[keyof typeof ReviewOutcome];

export const DutyStatus = {
  PLANNED: 'PLANNED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  SUBSTITUTED: 'SUBSTITUTED',
} as const;
export type DutyStatus = (typeof DutyStatus)[keyof typeof DutyStatus];

export const AppointmentRequestStatus = {
  REQUESTED: 'REQUESTED',
  IN_REVIEW: 'IN_REVIEW',
  ALTERNATIVE_PROPOSED: 'ALTERNATIVE_PROPOSED',
  AWAITING_PATIENT: 'AWAITING_PATIENT',
  CONFIRMED: 'CONFIRMED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED',
} as const;
export type AppointmentRequestStatus = (typeof AppointmentRequestStatus)[keyof typeof AppointmentRequestStatus];

export const AppointmentStatus = {
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const BookingSource = {
  ONLINE_PATIENT: 'ONLINE_PATIENT',
  WEBSITE: 'WEBSITE',
  RECEPTION_DESK: 'RECEPTION_DESK',
  PHONE_CALL: 'PHONE_CALL',
  WALK_IN: 'WALK_IN',
} as const;
export type BookingSource = (typeof BookingSource)[keyof typeof BookingSource];

export const QueueType = {
  BOOKED: 'BOOKED',
  WALK_IN: 'WALK_IN',
} as const;
export type QueueType = (typeof QueueType)[keyof typeof QueueType];

export const QueueStatus = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  DEPARTED_UNSEEN: 'DEPARTED_UNSEEN',
} as const;
export type QueueStatus = (typeof QueueStatus)[keyof typeof QueueStatus];

export const FollowUpStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  CONTACTED: 'CONTACTED',
  SCHEDULED: 'SCHEDULED',
  DISMISSED: 'DISMISSED',
} as const;
export type FollowUpStatus = (typeof FollowUpStatus)[keyof typeof FollowUpStatus];

export const EncounterStatus = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
} as const;
export type EncounterStatus = (typeof EncounterStatus)[keyof typeof EncounterStatus];

export const TreatmentPlanStatus = {
  DRAFT: 'DRAFT',
  PROPOSED: 'PROPOSED',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type TreatmentPlanStatus = (typeof TreatmentPlanStatus)[keyof typeof TreatmentPlanStatus];

export const TreatmentItemStatus = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PERFORMED: 'PERFORMED',
  DECLINED: 'DECLINED',
  DEFERRED: 'DEFERRED',
} as const;
export type TreatmentItemStatus = (typeof TreatmentItemStatus)[keyof typeof TreatmentItemStatus];

export const FileCategory = {
  XRAY_PANORAMIC: 'XRAY_PANORAMIC',
  XRAY_PERIAPICAL: 'XRAY_PERIAPICAL',
  INTRAORAL_PHOTO: 'INTRAORAL_PHOTO',
  LAB_REPORT: 'LAB_REPORT',
  CONSENT_FORM: 'CONSENT_FORM',
} as const;
export type FileCategory = (typeof FileCategory)[keyof typeof FileCategory];

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  VOIDED: 'VOIDED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  INSTAPAY: 'INSTAPAY',
  FAWRY: 'FAWRY',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  POSTED: 'POSTED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const InstallmentPlanStatus = {
  ACTIVE: 'ACTIVE',
  SATISFIED: 'SATISFIED',
  DEFAULTED: 'DEFAULTED',
} as const;
export type InstallmentPlanStatus = (typeof InstallmentPlanStatus)[keyof typeof InstallmentPlanStatus];

export const InstallmentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;
export type InstallmentStatus = (typeof InstallmentStatus)[keyof typeof InstallmentStatus];

export const ExpenseCategory = {
  SUPPLIES: 'SUPPLIES',
  MAINTENANCE: 'MAINTENANCE',
  UTILITIES: 'UTILITIES',
  RENT: 'RENT',
  LAB_FEES: 'LAB_FEES',
  OTHER: 'OTHER',
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const StockMovementType = {
  RECEIPT: 'RECEIPT',
  CONSUMPTION: 'CONSUMPTION',
  WASTE: 'WASTE',
  COUNT_ADJUSTMENT: 'COUNT_ADJUSTMENT',
  TRANSFER_OUT: 'TRANSFER_OUT',
  TRANSFER_IN: 'TRANSFER_IN',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export const StockTransferStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  SHIPPED: 'SHIPPED',
  RECEIVED: 'RECEIVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type StockTransferStatus = (typeof StockTransferStatus)[keyof typeof StockTransferStatus];

export const PurchaseOrderStatus = {
  ISSUED: 'ISSUED',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
} as const;
export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export const EquipmentCategory = {
  DENTAL_CHAIR: 'DENTAL_CHAIR',
  AUTOCLAVE: 'AUTOCLAVE',
  COMPRESSOR: 'COMPRESSOR',
  XRAY_UNIT: 'XRAY_UNIT',
  LASER_UNIT: 'LASER_UNIT',
  HANDPIECE_UNIT: 'HANDPIECE_UNIT',
} as const;
export type EquipmentCategory = (typeof EquipmentCategory)[keyof typeof EquipmentCategory];

export const EquipmentStatus = {
  OPERATIONAL: 'OPERATIONAL',
  RESTRICTED_USE: 'RESTRICTED_USE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
} as const;
export type EquipmentStatus = (typeof EquipmentStatus)[keyof typeof EquipmentStatus];

export const CriticalityLevel = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type CriticalityLevel = (typeof CriticalityLevel)[keyof typeof CriticalityLevel];

export const FaultSeverity = {
  CRITICAL: 'CRITICAL',
  MAJOR: 'MAJOR',
  MINOR: 'MINOR',
} as const;
export type FaultSeverity = (typeof FaultSeverity)[keyof typeof FaultSeverity];

export const WorkOrderStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED_AWAITING_VERIFICATION: 'COMPLETED_AWAITING_VERIFICATION',
  VERIFIED_RETURNED_TO_SERVICE: 'VERIFIED_RETURNED_TO_SERVICE',
} as const;
export type WorkOrderStatus = (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus];

export const NotificationType = {
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  STATUS_UPDATE: 'STATUS_UPDATE',
  CLINICAL_ALERT: 'CLINICAL_ALERT',
  BILLING_RECEIPT: 'BILLING_RECEIPT',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationStatus = {
  QUEUED: 'QUEUED',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const FeedbackCategory = {
  COMPLAINT: 'COMPLAINT',
  INQUIRY: 'INQUIRY',
  PRAISE: 'PRAISE',
} as const;
export type FeedbackCategory = (typeof FeedbackCategory)[keyof typeof FeedbackCategory];

export const FeedbackStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  RESPONDED: 'RESPONDED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type FeedbackStatus = (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

export const AlertType = {
  DOCTOR_ABSENT_WITH_BOOKINGS: 'DOCTOR_ABSENT_WITH_BOOKINGS',
  PROLONGED_WAIT_TIME: 'PROLONGED_WAIT_TIME',
  EQUIPMENT_OUT_OF_SERVICE: 'EQUIPMENT_OUT_OF_SERVICE',
  LOW_STOCK_THRESHOLD: 'LOW_STOCK_THRESHOLD',
  CASH_DISCREPANCY: 'CASH_DISCREPANCY',
} as const;
export type AlertType = (typeof AlertType)[keyof typeof AlertType];

export const AlertSeverity = {
  CRITICAL: 'CRITICAL',
  WARNING: 'WARNING',
  INFO: 'INFO',
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

export const AlertStatus = {
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
} as const;
export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus];

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  fullName: string;
  passwordHash: string;
  status: string;
  [key: string]: any;
}

export interface RoleGrant {
  id: string;
  userId?: string;
  role: Role;
  branchId: string | null;
  branch?: any;
  [key: string]: any;
}

export type ArrivalEvent = any;
export type QueueEntry = any;

export namespace Prisma {
  export type InputJsonValue = any;
  export type TransactionClient = any;
  export class PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
    constructor(message: string, { code }: { code: string; clientVersion?: string }) {
      super(message);
      this.code = code;
    }
  }
}

function createNoopModel(): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'findMany') return async () => [];
        if (prop === 'count' || prop === 'deleteMany' || prop === 'updateMany') return async () => 0;
        if (prop === 'aggregate') return async () => ({ _sum: {}, _count: {}, _avg: {} });
        if (prop === 'groupBy') return async () => [];
        // Throw on findUnique/create so auth routes cleanly hit their catch fallback (`FALLBACK_DEMO_USERS`)
        return async () => {
          throw new Error('Serverless mode: No database bound to worker');
        };
      },
    }
  );
}

export class PrismaClient {
  [key: string]: any;
  constructor(_options?: any) {
    return new Proxy(this, {
      get(target, prop: string) {
        if (prop in target) return (target as any)[prop];
        if (prop === '$connect' || prop === '$disconnect') return async () => {};
        if (prop === '$transaction') {
          return async (arg: any) => {
            if (typeof arg === 'function') return arg(createNoopModel());
            return Promise.all(arg);
          };
        }
        if (prop === '$executeRaw' || prop === '$queryRaw') return async () => [];
        return createNoopModel();
      },
    });
  }
}
