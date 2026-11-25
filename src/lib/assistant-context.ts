import type { AssistantActor } from './assistant-api';
import { assistantApi, assistantScopeSchema, getAssistantSession } from './assistant-api';
import { listAppointments } from './appointments-db';
import { listSharedInvoices } from './finance-storage';
import { listPatients } from './patients-db';
import { FINANCE_INVOICES, FINANCE_PAYMENTS } from './clinic-finance';
import { SHARED_EXPENSES_KEY, SEED_EXPENSES } from './clinic-costs';
import { LAB_ORDERS_KEY, readLocalJson } from './use-persisted-state';
import { INITIAL_LAB_ORDERS, type LabOrderRecord } from '@/components/phase2/LabManagementPhaseTwo';

let syncQueue = Promise.resolve();
let lastSyncedSnapshot = '';
let lastSyncedToken: string | undefined;
const lastSyncedRecords = new Map<string, string>();

export function collectAssistantContext(actor: AssistantActor): Record<string, { id: string }[]> {
  const patients = listPatients();
  const appointments = listAppointments();
  const invoices = listSharedInvoices();
  const labs = readLocalJson<LabOrderRecord[]>(LAB_ORDERS_KEY, INITIAL_LAB_ORDERS);
  if (actor.role === 'patient') {
    const patientId = actor.patientId;
    const patient = patients.find((row) => row.id === patientId);
    return {
      patients: patient ? [{
        id: patient.id,
        fullName: patient.fullName,
        fullNameAr: patient.fullNameAr,
        branchCode: patient.branchCode,
        primaryDoctorEn: patient.primaryDoctorEn,
        primaryDoctorAr: patient.primaryDoctorAr,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        medications: patient.medications,
        visitsCount: patient.visitsCount,
      }] : [],
      appointments: appointments.filter((visit) => visit.patientId === patientId).map((visit) => ({
        id: visit.id,
        patientId: visit.patientId,
        branchCode: visit.branchCode,
        doctorNameEn: visit.doctorNameEn,
        doctorNameAr: visit.doctorNameAr,
        serviceEn: visit.serviceEn,
        serviceAr: visit.serviceAr,
        date: visit.date,
        time: visit.time,
        status: visit.status,
        cancelReason: visit.cancelReason,
      })),
      invoices: invoices.filter((invoice) => invoice.patientId === patientId).map((invoice) => ({
        id: invoice.id,
        patientId: invoice.patientId,
        branch: invoice.branch,
        date: invoice.date,
        treatmentEn: invoice.treatmentEn,
        treatmentAr: invoice.treatmentAr,
        doctorEn: invoice.doctorEn,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        status: invoice.status,
        installments: invoice.installments,
      })),
    };
  }
  if (actor.role === 'clinic_owner') {
    return {
      patients,
      appointments,
      ledgerInvoices: FINANCE_INVOICES,
      invoices,
      ledgerPayments: FINANCE_PAYMENTS,
      expenses: readLocalJson(SHARED_EXPENSES_KEY, SEED_EXPENSES),
      labOrders: labs,
    };
  }
  if (actor.role === 'receptionist') {
    return {
      patients: patients.filter((patient) => patient.branchCode === actor.branchCode).map((patient) => ({
        id: patient.id,
        fullName: patient.fullName,
        fullNameAr: patient.fullNameAr,
        phone: patient.phone,
        email: patient.email,
        branchCode: patient.branchCode,
        primaryDoctorEn: patient.primaryDoctorEn,
        primaryDoctorAr: patient.primaryDoctorAr,
      })),
      appointments: appointments.filter((visit) => visit.branchCode === actor.branchCode),
      invoices: invoices.filter((invoice) => invoice.branch === actor.branchCode),
      labOrders: labs.filter((order) => order.branchCode === actor.branchCode),
    };
  }
  return {
    patients: patients.filter((patient) => patient.branchCode === actor.branchCode && patient.primaryDoctorEn === actor.doctorNameEn).map((patient) => ({
      id: patient.id,
      branchCode: patient.branchCode,
      allergies: patient.allergies,
      chronicConditions: patient.chronicConditions,
      medications: patient.medications,
      visitsCount: patient.visitsCount,
    })),
    appointments: appointments.filter((visit) => visit.doctorNameEn === actor.doctorNameEn && visit.branchCode === actor.branchCode && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(visit.status)).map((visit) => ({
      id: visit.id,
      branchCode: visit.branchCode,
      date: visit.date,
      time: visit.time,
      status: visit.status,
      isPast: visit.isPast,
      cancelReason: visit.cancelReason,
      serviceEn: visit.serviceEn,
      serviceAr: visit.serviceAr,
    })),
  };
}

export async function syncAssistantContext(actor: AssistantActor, signal?: AbortSignal): Promise<void> {
  if (actor.role === 'patient') return;
  const payload = collectAssistantContext(actor);
  const token = getAssistantSession()?.token;
  const queued = syncQueue.then(async () => {
    if (signal?.aborted || token !== getAssistantSession()?.token) return;
    let scopedPayload = payload;
    if (actor.role === 'doctor') {
      const scope = assistantScopeSchema.parse(await assistantApi('/api/context/scope', undefined, signal));
      if (signal?.aborted || token !== getAssistantSession()?.token) return;
      const patientIds = new Set(scope.patientIds);
      const appointmentIds = new Set(scope.appointmentIds);
      scopedPayload = {
        patients: payload.patients.filter((patient) => patientIds.has(patient.id)),
        appointments: payload.appointments.filter((visit) => appointmentIds.has(visit.id)),
      };
    }
    const snapshot = `${token}:${JSON.stringify(scopedPayload)}`;
    if (snapshot === lastSyncedSnapshot) return;
    if (token !== lastSyncedToken) {
      lastSyncedRecords.clear();
      lastSyncedToken = token;
    }
    const pending = Object.entries(scopedPayload).flatMap(([kind, rows]) => rows.map((row) => ({
      kind, row, key: `${kind}:${row.id}`, value: JSON.stringify(row),
    }))).filter((entry) => lastSyncedRecords.get(entry.key) !== entry.value);
    for (let offset = 0; offset < pending.length; offset += 80) {
      if (signal?.aborted || token !== getAssistantSession()?.token) return;
      const batch = pending.slice(offset, offset + 80);
      const body: Record<string, { id: string }[]> = {};
      for (const entry of batch) (body[entry.kind] ??= []).push(entry.row);
      await assistantApi('/api/context/sync', body, signal);
      if (token !== getAssistantSession()?.token) return;
      for (const entry of batch) lastSyncedRecords.set(entry.key, entry.value);
    }
    if (token === getAssistantSession()?.token) lastSyncedSnapshot = snapshot;
  });
  syncQueue = queued.catch(() => {});
  await queued;
}
