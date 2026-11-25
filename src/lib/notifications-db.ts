import type { AppointmentBranchCode } from '@/lib/appointments-db';

export const PATIENT_NOTIFICATIONS_KEY = 'ebtesamty_patient_notifications_v1';
export const PATIENT_NOTIFICATIONS_EVENT = 'ebtesamty-patient-notifications-sync';

export type PatientNotificationKind =
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_CONFIRMED'
  | 'SCHEDULE_UPDATE'
  | 'TREATMENT_UPDATE'
  | 'INVOICE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'CUSTOM';

export interface PatientNotification {
  id: string;
  patientId: string;
  appointmentId?: string;
  branchCode: AppointmentBranchCode;
  kind: PatientNotificationKind;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  senderNameEn: string;
  senderNameAr: string;
  createdAt: string;
  readAt?: string;
}

export interface SendPatientNotificationInput {
  patientId: string;
  appointmentId?: string;
  branchCode: AppointmentBranchCode;
  kind: PatientNotificationKind;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  senderNameEn?: string;
  senderNameAr?: string;
}

function readStoredNotifications(): PatientNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PATIENT_NOTIFICATIONS_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.patientId === 'string' &&
        typeof item.createdAt === 'string'
    ) as PatientNotification[];
  } catch {
    return [];
  }
}

function writeStoredNotifications(notifications: PatientNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PATIENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event(PATIENT_NOTIFICATIONS_EVENT));
  } catch {}
}

function notificationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `NTF-${crypto.randomUUID()}`;
  }
  return `NTF-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function listPatientNotifications(patientId?: string | null): PatientNotification[] {
  const target = String(patientId || '').trim().toLowerCase();
  const notifications = readStoredNotifications();
  if (!target) return [];
  return notifications
    .filter((item) => item.patientId.toLowerCase() === target)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function unreadPatientNotificationCount(patientId?: string | null): number {
  return listPatientNotifications(patientId).filter((item) => !item.readAt).length;
}

export function sendPatientNotification(
  input: SendPatientNotificationInput
): PatientNotification | null {
  const patientId = input.patientId.trim();
  const bodyEn = input.bodyEn.trim();
  const bodyAr = input.bodyAr.trim();
  if (!patientId || (!bodyEn && !bodyAr)) return null;

  const notification: PatientNotification = {
    id: notificationId(),
    patientId,
    appointmentId: input.appointmentId,
    branchCode: input.branchCode,
    kind: input.kind,
    titleEn: input.titleEn.trim() || 'Message from reception',
    titleAr: input.titleAr.trim() || 'رسالة من الاستقبال',
    bodyEn: bodyEn || bodyAr,
    bodyAr: bodyAr || bodyEn,
    senderNameEn: input.senderNameEn?.trim() || 'Reception',
    senderNameAr: input.senderNameAr?.trim() || 'الاستقبال',
    createdAt: new Date().toISOString(),
  };

  writeStoredNotifications([notification, ...readStoredNotifications()]);
  return notification;
}

export interface BillingNotificationInvoice {
  id: string;
  patientId?: string;
  branch: AppointmentBranchCode;
  totalAmount: number;
  paidAmount: number;
}

function billingMoney(amount: number, isAr: boolean): string {
  return new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function billingEventTime(date: Date, isAr: boolean): string {
  return new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-GB', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function sendInvoiceCreatedNotification(
  invoice: BillingNotificationInvoice,
  occurredAt: Date = new Date()
): PatientNotification | null {
  if (!invoice.patientId) return null;
  const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const timeEn = billingEventTime(occurredAt, false);
  const timeAr = billingEventTime(occurredAt, true);

  return sendPatientNotification({
    patientId: invoice.patientId,
    branchCode: invoice.branch,
    kind: 'INVOICE_CREATED',
    titleEn: `New invoice ${invoice.id}`,
    titleAr: `فاتورة جديدة ${invoice.id}`,
    bodyEn: `Invoice ${invoice.id}\nTotal: ${billingMoney(invoice.totalAmount, false)}\nPaid at issue: ${billingMoney(invoice.paidAmount, false)}\nRemaining balance: ${billingMoney(remaining, false)}\nIssued at: ${timeEn} (Cairo time)`,
    bodyAr: `الفاتورة ${invoice.id}\nالإجمالي: ${billingMoney(invoice.totalAmount, true)}\nالمدفوع عند الإصدار: ${billingMoney(invoice.paidAmount, true)}\nالرصيد المتبقي: ${billingMoney(remaining, true)}\nتاريخ الإصدار: ${timeAr} بتوقيت القاهرة`,
    senderNameEn: 'Ebtesamty Finance',
    senderNameAr: 'مالية ابتسامتي',
  });
}

export function sendPaymentReceivedNotification(
  invoice: BillingNotificationInvoice,
  amount: number,
  methodEn: string,
  methodAr: string,
  occurredAt: Date = new Date()
): PatientNotification | null {
  if (!invoice.patientId || !Number.isFinite(amount) || amount <= 0) return null;
  const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const timeEn = billingEventTime(occurredAt, false);
  const timeAr = billingEventTime(occurredAt, true);

  return sendPatientNotification({
    patientId: invoice.patientId,
    branchCode: invoice.branch,
    kind: 'PAYMENT_RECEIVED',
    titleEn: `Payment received for ${invoice.id}`,
    titleAr: `تم استلام دفعة للفاتورة ${invoice.id}`,
    bodyEn: `Invoice ${invoice.id}\nPaid amount: ${billingMoney(amount, false)}\nMethod: ${methodEn}\nPaid at: ${timeEn} (Cairo time)\nRemaining balance: ${billingMoney(remaining, false)}`,
    bodyAr: `الفاتورة ${invoice.id}\nالمبلغ المدفوع: ${billingMoney(amount, true)}\nطريقة الدفع: ${methodAr}\nتاريخ ووقت الدفع: ${timeAr} بتوقيت القاهرة\nالرصيد المتبقي: ${billingMoney(remaining, true)}`,
    senderNameEn: 'Ebtesamty Finance',
    senderNameAr: 'مالية ابتسامتي',
  });
}

export function markPatientNotificationRead(
  notificationId: string,
  patientId?: string | null
): boolean {
  const target = String(patientId || '').trim().toLowerCase();
  if (!target) return false;
  const notifications = readStoredNotifications();
  let changed = false;
  const next = notifications.map((item) => {
    if (
      item.id === notificationId &&
      item.patientId.toLowerCase() === target &&
      !item.readAt
    ) {
      changed = true;
      return { ...item, readAt: new Date().toISOString() };
    }
    return item;
  });
  if (changed) writeStoredNotifications(next);
  return changed;
}

export function markAllPatientNotificationsRead(patientId?: string | null): boolean {
  const target = String(patientId || '').trim().toLowerCase();
  if (!target) return false;
  const notifications = readStoredNotifications();
  let changed = false;
  const readAt = new Date().toISOString();
  const next = notifications.map((item) => {
    if (item.patientId.toLowerCase() === target && !item.readAt) {
      changed = true;
      return { ...item, readAt };
    }
    return item;
  });
  if (changed) writeStoredNotifications(next);
  return changed;
}
