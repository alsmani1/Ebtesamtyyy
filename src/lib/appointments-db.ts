// Shared appointment store for the static build. The booking wizard, patient
// portal, staff calendar, and dashboards all read/write this one list so an
// appointment has exactly one status everywhere.

export const APPOINTMENTS_KEY = "ebtesamty_minya_booked_appointments";
export const APPOINTMENTS_EVENT = "ebtesamty-appointments-sync";

export type AppointmentStatus =
  | "CONFIRMED"
  | "RESCHEDULED"
  | "ARRIVED"
  | "IN_CHAIR"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentBranchCode = "BR-A" | "BR-B" | "BR-C";

export interface AppointmentRecord {
  id: string;
  patientId?: string;
  patientName: string;
  branchCode: AppointmentBranchCode;
  branchNameEn: string;
  branchNameAr: string;
  doctorNameEn: string;
  doctorNameAr: string;
  serviceEn: string;
  serviceAr: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  isPast?: boolean;
  cancelReason?: string;
}

const ACTIVE_STATUSES: AppointmentStatus[] = [
  "CONFIRMED",
  "RESCHEDULED",
  "ARRIVED",
  "IN_CHAIR",
];

export function isActiveAppointment(status: AppointmentStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function appointmentStatusLabel(status: AppointmentStatus, isAr: boolean): string {
  switch (status) {
    case "CONFIRMED":
      return isAr ? "مؤكد" : "Confirmed";
    case "RESCHEDULED":
      return isAr ? "تم تغيير الموعد" : "Rescheduled";
    case "ARRIVED":
      return isAr ? "حضر" : "Arrived";
    case "IN_CHAIR":
      return isAr ? "في الكرسي" : "In chair";
    case "COMPLETED":
      return isAr ? "مكتمل" : "Completed";
    case "CANCELLED":
      return isAr ? "ملغى" : "Cancelled";
    case "NO_SHOW":
      return isAr ? "لم يحضر" : "No-show";
    default:
      return String(status);
  }
}

// Tolerates records written before the statuses were unified.
function normalizeStatus(value: unknown): AppointmentStatus {
  switch (value) {
    case "BOOKED":
      return "CONFIRMED";
    case "LEFT":
      return "COMPLETED";
    case "RESCHEDULED":
    case "ARRIVED":
    case "IN_CHAIR":
    case "COMPLETED":
    case "CANCELLED":
    case "NO_SHOW":
      return value;
    default:
      return "CONFIRMED";
  }
}

export function listAppointments(): AppointmentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((row) => row && typeof row.id === "string")
      .map((row) => ({ ...row, status: normalizeStatus(row.status) })) as AppointmentRecord[];
  } catch {
    return [];
  }
}

export function saveAppointments(list: AppointmentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(APPOINTMENTS_EVENT));
  } catch {
    // storage unavailable — callers keep their in-memory copy
  }
}

export function upsertAppointment(record: AppointmentRecord): void {
  const list = listAppointments();
  const exists = list.some((visit) => visit.id === record.id);
  saveAppointments(
    exists
      ? list.map((visit) => (visit.id === record.id ? { ...visit, ...record } : visit))
      : [record, ...list]
  );
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  changes: Partial<AppointmentRecord> = {}
): boolean {
  const list = listAppointments();
  if (!list.some((visit) => visit.id === id)) return false;
  saveAppointments(
    list.map((visit) => (visit.id === id ? { ...visit, ...changes, status } : visit))
  );
  return true;
}

export function rescheduleAppointment(
  id: string,
  next: { date: string; time: string }
): boolean {
  return updateAppointmentStatus(id, "RESCHEDULED", {
    date: next.date,
    time: next.time,
    isPast: false,
    cancelReason: undefined,
  });
}

export function isSlotTaken(params: {
  date: string;
  time: string;
  doctorNameEn: string;
  branchCode?: AppointmentBranchCode;
  excludeId?: string;
}): boolean {
  return listAppointments().some(
    (visit) =>
      visit.id !== params.excludeId &&
      visit.status !== "CANCELLED" &&
      visit.date === params.date &&
      visit.time === params.time &&
      visit.doctorNameEn === params.doctorNameEn &&
      (!params.branchCode || visit.branchCode === params.branchCode)
  );
}

// Clinic working hours: 10:00 AM – 8:30 PM in 30-minute slots.
export function clinicSlotLabels(): string[] {
  const labels: string[] = [];
  for (let mins = 10 * 60; mins <= 20 * 60 + 30; mins += 30) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const suffix = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    labels.push(
      `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`
    );
  }
  return labels;
}
