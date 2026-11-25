import { checkIn, transitionVisit } from './visit.service';
async function schedulingActor(id:string){const user=await db.user.findUniqueOrThrow({where:{id},include:{roleGrants:true}});if(user.status!=='ACTIVE')throw new Error('Inactive account.');return user;}
import { cairoInstant, cairoDate, dateOnly } from '@/lib/scheduling-rules';
import { confirmBooking } from './booking.service';
import { assertPatientSelf, hasRole, requireRole } from '@/lib/rbac';
import { db } from '../lib/db';
import { 
  AppointmentRequestStatus, 
  AppointmentStatus, 
  QueueType, 
  QueueStatus, 
  DutyStatus, 
  FollowUpStatus,
  NotificationType,
  AlertType
} from '@prisma/client';
import { logAuditEvent } from '../lib/audit';

export interface CreateRequestInput {
  patientId: string;
  branchId: string;
  dentistPreferenceId?: string;
  serviceName?: string;
  preferredDate: Date | string;
  preferredTimeWindow: string; // "MORNING" | "AFTERNOON" | "EVENING"
  reason: string;
}

export interface ConfirmAppointmentInput {
  dentistUserId: string;
  roomId?: string;
  appointmentDate: Date | string;
  startTime: string; // "11:30"
  endTime: string;   // "12:15"
  durationMinutes?: number;
  serviceDescription: string;
}

/**
 * 1. Patient creates an appointment request (Does NOT reserve capacity or confirm)
 */
export async function createAppointmentRequest(
  input: CreateRequestInput,
  actor?: { id?: string; role?: string }
) {
  const reqDate = dateOnly(cairoDate(new Date(input.preferredDate)));

  const request = await db.appointmentRequest.create({
    data: {
      patientId: input.patientId,
      branchId: input.branchId,
      dentistPreferenceId: input.dentistPreferenceId,
      serviceName: input.serviceName,
      preferredDate: reqDate,
      preferredTimeWindow: input.preferredTimeWindow,
      reason: input.reason,
      status: AppointmentRequestStatus.REQUESTED,
    },
    include: {
      patient: true,
      branch: true,
    },
  });

  if (actor?.id) {
    await logAuditEvent({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'APPOINTMENT_REQUEST_CREATED',
      entityType: 'AppointmentRequest',
      entityId: request.id,
      branchId: input.branchId,
      metadata: { serviceName: input.serviceName, preferredTimeWindow: input.preferredTimeWindow },
    });
  }

  return request;
}

/**
 * 2. Receptionist reviews request: CONFIRM, PROPOSE_ALTERNATIVE, or DECLINE
 */
export async function reviewAppointmentRequest(
  requestId: string,
  action: 'CONFIRM' | 'PROPOSE_ALTERNATIVE' | 'DECLINE',
  payload: {
    confirmData?: ConfirmAppointmentInput;
    alternativeDate?: Date | string;
    alternativeTime?: string;
    staffNotes?: string;
  },
  actor: { id: string; role: string; branchId?: string }
) {
  const req = await db.appointmentRequest.findUnique({
    where: { id: requestId },
    include: { patient: true, branch: true },
  });

  const authorizedActor=await db.user.findUniqueOrThrow({where:{id:actor.id},include:{roleGrants:true}});
  if(req)requireRole(authorizedActor,['RECEPTIONIST','OWNER_ADMIN'],req.branchId);
  if (!req) {
    throw new Error('Appointment request not found.');
  }

  if (action === 'DECLINE') {
    const updated = await db.appointmentRequest.update({
      where: { id: requestId },
      data: {
        status: AppointmentRequestStatus.DECLINED,
        staffNotes: payload.staffNotes,
      },
    });

    // Notify patient
    const portalLink = await db.portalPatientLink.findFirst({
      where: { patientId: req.patientId, status: 'APPROVED' },
    });
    if (portalLink) {
      await db.notification.create({
        data: {
          userId: portalLink.userId,
          title: 'Appointment Request Update',
          body: `Your visit request for ${req.branch.name} could not be scheduled: ${payload.staffNotes || 'Please call the branch.'}`,
          type: NotificationType.STATUS_UPDATE,
        },
      });
    }

    return { request: updated, appointment: null };
  }

  if (action === 'PROPOSE_ALTERNATIVE') {
    if (!payload.alternativeDate || !payload.alternativeTime) {
      throw new Error('Alternative date and time window are required.');
    }
    const altDate = typeof payload.alternativeDate === 'string' ? new Date(payload.alternativeDate) : payload.alternativeDate;

    const updated = await db.appointmentRequest.update({
      where: { id: requestId },
      data: {
        status: AppointmentRequestStatus.ALTERNATIVE_PROPOSED,
        alternativeOfferedDate: altDate,
        alternativeOfferedTime: payload.alternativeTime,
        staffNotes: payload.staffNotes,
      },
    });

    // Notify patient
    const portalLink = await db.portalPatientLink.findFirst({
      where: { patientId: req.patientId, status: 'APPROVED' },
    });
    if (portalLink) {
      await db.notification.create({
        data: {
          userId: portalLink.userId,
          title: 'Alternative Appointment Offered',
          body: `Ebtesamty proposed an alternative visit slot on ${altDate.toISOString().split('T')[0]} at ${payload.alternativeTime}. Please review and respond in your portal.`,
          type: NotificationType.STATUS_UPDATE,
        },
      });
    }

    return { request: updated, appointment: null };
  }

  if (action === 'CONFIRM') {
    const user=await db.user.findUniqueOrThrow({where:{id:actor.id},include:{roleGrants:true}});
    const appointment=await confirmBooking(requestId,user,payload.confirmData);
    return {request:await db.appointmentRequest.findUniqueOrThrow({where:{id:requestId}}),appointment};
  }

  throw new Error('Unsupported action.');
}

/**
 * 3. Patient accepts or declines an alternative slot offer
 */
export async function patientRespondToAlternative(
  requestId: string,
  response: 'ACCEPT' | 'DECLINE',
  dentistUserId: string,
  actor: { id: string; role: string }
) {
  const req = await db.appointmentRequest.findUnique({
    where: { id: requestId },
    include: { patient: true, branch: true },
  });

  if (!req || req.status !== AppointmentRequestStatus.ALTERNATIVE_PROPOSED) {
    throw new Error('Valid pending alternative offer not found for this request.');
  }

  if(!['ACCEPT','DECLINE'].includes(response))throw new Error('Invalid response.');
  await assertPatientSelf(actor.id,req.patientId);
  if (response === 'DECLINE') {
    return await db.appointmentRequest.update({
      where: { id: requestId },
      data: { status: AppointmentRequestStatus.DECLINED },
    });
  }

  const user=await db.user.findUniqueOrThrow({where:{id:actor.id},include:{roleGrants:true}});
  const appointment=await confirmBooking(requestId,user,undefined,true);
  return {request:await db.appointmentRequest.findUniqueOrThrow({where:{id:requestId}}),appointment};
}

/**
 * 4. Cancel appointment & free slot transactionally
 */
export async function cancelAppointment(
  appointmentId: string,
  cancellationReason: string,
  actor: { id: string; role: string },
  isPatientRequest: boolean = false
) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: {
        include: {
          portalLinks: { where: { status: 'APPROVED' } },
        },
      },
      branch: true,
      request: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found.');
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new Error('Appointment is already cancelled.');
  }

  const user=await db.user.findUniqueOrThrow({where:{id:actor.id},include:{roleGrants:true}});
  const staff=hasRole(user,['RECEPTIONIST','OWNER_ADMIN'],appointment.branchId);
  if(!staff)await assertPatientSelf(actor.id,appointment.patientId);
  if(appointment.status!=='CONFIRMED')throw new Error('Only a confirmed appointment can be cancelled.');
  if(!staff || isPatientRequest){const policy=await db.schedulingPolicy.findUnique({where:{branchId:appointment.branchId}});const notice=policy?.cancellationNoticeHours??24;
    if((+cairoInstant(appointment.appointmentDate.toISOString().slice(0,10),appointment.startTime)-Date.now())/3600000<notice)throw new Error('Please contact reception to cancel within the cancellation notice period.');}

  return db.$transaction(async (tx) => {
    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason,
      },
    });

    if (appointment.requestId) {
      await tx.appointmentRequest.update({
        where: { id: appointment.requestId },
        data: { status: AppointmentRequestStatus.CANCELLED },
      });
    }

    await tx.queueEntry.updateMany({
      where: { appointmentId, status: QueueStatus.WAITING },
      data: { status: QueueStatus.DEPARTED_UNSEEN },
    });

    const portalUser = appointment.patient.portalLinks[0];
    if (portalUser) {
      await tx.notification.create({
        data: {
          userId: portalUser.userId,
          title: 'Appointment Cancelled',
          body: `Your visit at ${appointment.branch.name} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.startTime} has been cancelled. Reason: ${cancellationReason}`,
          type: NotificationType.STATUS_UPDATE,
        },
      });
    }

    await logAuditEvent({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'APPOINTMENT_CANCELLED',
      entityType: 'Appointment',
      entityId: appointmentId,
      branchId: appointment.branchId,
      metadata: { reason: cancellationReason, isPatientRequest },
    });

    return updated;
  });
}

/**
 * 5. Mark appointment as No-Show
 */
export async function markAppointmentNoShow(
  appointmentId: string,
  reason: string,
  actor: { id: string; role: string }
) {
  const app = await db.appointment.findUnique({
    where: { id: appointmentId },
  });
  if (!app) throw new Error('Appointment not found.');

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: AppointmentStatus.NO_SHOW,
      cancellationReason: reason,
    },
  });

  await logAuditEvent({
    actorUserId: actor.id,
    actorRole: actor.role,
    action: 'APPOINTMENT_NO_SHOW',
    entityType: 'Appointment',
    entityId: appointmentId,
    branchId: app.branchId,
    metadata: { reason },
  });

  return updated;
}

/**
 * 6. Patient reports arrival on site: "I've Arrived" (ARRIVAL_REPORTED)
 * Does NOT enter live queue until receptionist physically verifies presence!
 */
export async function reportPatientArrival(
  patientId: string,
  branchId: string,
  appointmentId?: string
): Promise<import("@prisma/client").ArrivalEvent> { throw new Error('Arrival must be verified by reception using checkIn.'); }

/**
 * 7. Receptionist verifies physical presence (ARRIVAL_VERIFIED) and admits to Live Queue
 * Prevents duplicate active admissions for the same patient today.
 */
export async function verifyArrivalAndAdmitToQueue(
  arrivalEventId: string,
  actor: { id: string; role: string; branchId?: string }
) { const arrival=await db.arrivalEvent.findUniqueOrThrow({where:{id:arrivalEventId}});const user=await db.user.findUniqueOrThrow({where:{id:actor.id},include:{roleGrants:true}});const result=await checkIn({patientId:arrival.patientId,branchId:arrival.branchId,appointmentId:arrival.appointmentId||undefined},user);if(!result.arrival)throw new Error("Missing verified arrival record.");return {...result,arrival:result.arrival}; }

/**
 * 8. Receptionist admits offline walk-in patient directly to queue
 */
export async function admitDirectWalkIn(
  patientId: string,
  branchId: string,
  dentistUserId: string | undefined,
  priorityReason: string | undefined,
  actor: { id: string; role: string }
): Promise<import("@prisma/client").QueueEntry> { throw new Error('Book an available walk-in slot, then check in at reception.'); }

/**
 * 9. Dentist / Staff calls patient from waiting queue
 */
export async function callQueuePatient(queueEntryId: string, actor: { id: string; role: string }) { return transitionVisit(queueEntryId,'CALL',await schedulingActor(actor.id)); }

/**
 * 10. Start clinical consultation
 */
export async function startConsultation(queueEntryId: string, actor: { id: string; role: string }) { return transitionVisit(queueEntryId,'START',await schedulingActor(actor.id)); }

/**
 * 11. Complete consultation
 */
export async function completeConsultation(queueEntryId: string, actor: { id: string; role: string }) { return transitionVisit(queueEntryId,'COMPLETE',await schedulingActor(actor.id)); }

/**
 * 12. Doctor duty assignment & absence management
 */
export async function recordDoctorDuty(
  dentistUserId: string,
  branchId: string,
  dutyDate: Date | string,
  startTime: string,
  endTime: string,
  roomId?: string,
  actor?: { id: string; role: string }
) {
  const dDate = dateOnly(cairoDate(new Date(dutyDate))); 

  return await db.doctorDuty.create({
    data: {
      dentistUserId,
      branchId,
      dutyDate: dDate,
      startTime,
      endTime,
      roomId,
      status: DutyStatus.CONFIRMED,
    },
  });
}

export async function recordDoctorAbsence(
  dentistUserId: string,
  branchId: string,
  dutyDate: Date | string,
  reason: string,
  substituteDentistId?: string,
  actor?: { id: string; role: string }
) {
  const dDate = dateOnly(cairoDate(new Date(dutyDate))); 

  return await db.$transaction(async (tx) => {
    // 1. Update duty status
    await tx.doctorDuty.updateMany({
      where: {
        dentistUserId,
        branchId,
        dutyDate: {
          gte: dDate,
          lt: new Date(+dDate + 86400000),
        },
      },
      data: {
        status: DutyStatus.CANCELLED,
        substituteDentistId,
      },
    });

    // 2. Count affected confirmed bookings
    const affectedCount = await tx.appointment.count({
      where: {
        dentistUserId,
        branchId,
        appointmentDate: {
          gte: dDate,
          lt: new Date(+dDate + 86400000),
        },
        status: AppointmentStatus.CONFIRMED,
      },
    });

    // 3. Create Coverage Exception
    const coverageException = await tx.coverageException.create({
      data: {
        branchId,
        dentistUserId,
        dutyDate: dDate,
        reason,
        affectedBookingsCount: affectedCount,
      },
    });

    // 4. Create Operational Alert for Management
    await tx.operationalAlert.create({
      data: {
        branchId,
        alertType: AlertType.DOCTOR_ABSENT_WITH_BOOKINGS,
        severity: affectedCount > 0 ? 'CRITICAL' : 'WARNING',
        title: `Doctor Absence: ${affectedCount} affected booking(s)`,
        description: `Dentist absent on ${dDate.toISOString().split('T')[0]}. Reason: ${reason}. ${affectedCount} confirmed patient visits require rescheduling or substitute coverage.`,
        entityId: coverageException.id,
      },
    });

    return { coverageException, affectedCount };
  });
}

// ==========================================
// 8. APPOINTMENT RESCHEDULING
// ==========================================

export interface RescheduleAppointmentInput {
  appointmentId: string;
  actor: { id: string; role: string };
  newDate: Date;
  preferredTimeWindow: string;
  reason: string;
  serviceDescription?: string;
}

export async function rescheduleAppointment({
  appointmentId,
  actor,
  newDate,
  preferredTimeWindow,
  reason,
  serviceDescription,
}: RescheduleAppointmentInput) {
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: {
        include: {
          portalLinks: { where: { status: 'APPROVED' } },
        },
      },
      branch: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const user=await db.user.findUniqueOrThrow({where:{id:actor.id},include:{roleGrants:true}});
  if(!hasRole(user,['RECEPTIONIST','OWNER_ADMIN'],appointment.branchId))await assertPatientSelf(actor.id,appointment.patientId);
  if(appointment.status!=='CONFIRMED'||!Number.isFinite(+newDate)||+newDate<Date.now()-86400000)throw new Error('Choose a future date for a confirmed appointment.');
  return db.$transaction(async (tx) => {
    // 2. Create new AppointmentRequest in REQUESTED state for reception review
    const newRequest = await tx.appointmentRequest.create({
      data: {
        rescheduleOfId: appointment.id,
        patientId: appointment.patientId,
        branchId: appointment.branchId,
        preferredDate: newDate,
        preferredTimeWindow,
        serviceName: serviceDescription || appointment.serviceDescription,
        reason: `Reschedule of previous booking: ${reason}`,
        status: AppointmentRequestStatus.REQUESTED,
      },
    });

    // 3. Notify patient
    const portalUser = appointment.patient.portalLinks[0];
    if (portalUser) {
      await tx.notification.create({
        data: {
          userId: portalUser.userId,
          title: 'Reschedule Request Submitted',
          body: `Your request to reschedule your visit to ${newDate.toISOString().split('T')[0]} (${preferredTimeWindow}) has been sent to ${appointment.branch.name} reception for confirmation.`,
          type: NotificationType.STATUS_UPDATE,
        },
      });
    }

    // 4. Audit log
    await logAuditEvent({
      actorUserId: actor.id,
      actorRole: actor.role,
      action: 'APPOINTMENT_RESCHEDULED',
      entityType: 'Appointment',
      entityId: appointmentId,
      branchId: appointment.branchId,
      metadata: { newRequestId: newRequest.id, newDate, preferredTimeWindow },
    });

    return { oldAppointmentId: appointmentId, newRequest };
  });
}

