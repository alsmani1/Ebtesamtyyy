import {normalizePhone} from '@/lib/phone';
import db from '@/lib/db';
import { Prisma, Role, BookingSource } from '@prisma/client';
import { requireRole, assertPatientSelf } from '@/lib/rbac';
import { dateOnly, minutes, clockTime, cairoDate, cairoInstant, overlaps } from '@/lib/scheduling-rules';
import { randomUUID, createHash } from 'crypto';
export type Actor = {
    id: string;
    roleGrants: {
        role: Role;
        branchId: string | null;
    }[];
};
type Store = Prisma.TransactionClient;
export async function availability(branchId: string, day: string, dentistId?: string, duration = 45, tx: Store = db) {
    if (!Number.isInteger(duration) || duration < 15 || duration > 240)
        throw new Error('Invalid appointment duration.');
    const normalizedDay = String(day || '').trim().slice(0, 10);
    const start = dateOnly(normalizedDay), end = new Date(+start + 86400000);
    const duties = await tx.doctorDuty.findMany({ where: { branchId, dutyDate: { gte: start, lt: end }, status: 'CONFIRMED', ...(dentistId ? { dentistUserId: dentistId } : {}) }, include: { dentistUser: { select: { id: true, fullName: true, email: true, status: true } } } });
    const appointments = await tx.appointment.findMany({ where: { appointmentDate: { gte: start, lt: end }, status: { notIn: ['CANCELLED', 'NO_SHOW'] }, OR: [{ dentistUserId: { in: duties.map(d => d.dentistUserId) } }, { branchId }] } });
    const slots = new Map<string, {
        time: string;
        endTime: string;
        label: string;
        window: 'MORNING' | 'AFTERNOON' | 'EVENING';
        available: boolean;
        dentistIds: string[];
    }>();
    const format12HourLabel = (hhmm: string) => {
        const [hStr, mStr] = hhmm.split(':');
        const h = Number(hStr);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${String(h12).padStart(2, '0')}:${mStr} ${suffix}`;
    };
    for (const duty of duties) {
        if (duty.dentistUser.status !== 'ACTIVE')
            continue;
        for (let n = minutes(duty.startTime); n + duration <= minutes(duty.endTime); n += 30) {
            const time = clockTime(n), endTime = clockTime(n + duration);
            if (+cairoInstant(normalizedDay, time) <= Date.now())
                continue;
            const isBooked = appointments.some(a => (a.dentistUserId === duty.dentistUserId || (duty.roomId && a.roomId === duty.roomId)) && overlaps(time, endTime, a));
            const existingSlot = slots.get(time);
            if (isBooked && !existingSlot) {
                slots.set(time, {
                    time,
                    endTime,
                    label: format12HourLabel(time),
                    window: n < 720 ? 'MORNING' : n < 1020 ? 'AFTERNOON' : 'EVENING',
                    available: false,
                    dentistIds: [],
                });
                continue;
            }
            if (isBooked)
                continue;
            const slot = existingSlot || { time, endTime, label: format12HourLabel(time), window: n < 720 ? 'MORNING' : n < 1020 ? 'AFTERNOON' : 'EVENING', available: true, dentistIds: [] };
            slot.available = true;
            if (!slot.dentistIds.includes(duty.dentistUserId))
                slot.dentistIds.push(duty.dentistUserId);
            slots.set(time, slot);
        }
    }
    return { duties, slots: [...slots.values()].sort((a, b) => a.time.localeCompare(b.time)) };
}
export async function confirmBooking(requestId: string, actor: Actor, selection?: {
    dentistUserId?: string;
    appointmentDate?: Date | string;
    startTime?: string;
    serviceDescription?: string;
}, acceptOfferedSlot = false) {
    return db.$transaction(async (tx) => {
        const request = await tx.appointmentRequest.findUniqueOrThrow({ where: { id: requestId } });
        if (acceptOfferedSlot) {
            await assertPatientSelf(actor.id, request.patientId);
            if (request.status !== 'ALTERNATIVE_PROPOSED' || !request.alternativeOfferedDate || !request.alternativeOfferedTime)
                throw new Error('No pending offer.');
            selection = { appointmentDate: request.alternativeOfferedDate, startTime: request.alternativeOfferedTime, dentistUserId: request.dentistPreferenceId || undefined };
        }
        else
            requireRole(actor, [Role.RECEPTIONIST, Role.OWNER_ADMIN], request.branchId);
        // All confirmations use this branch lock, including reception and request review.
        await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`schedule:${request.branchId}`}))`;
        const existing = await tx.appointment.findUnique({ where: { requestId } });
        if (existing)
            return existing;
        if (!acceptOfferedSlot && !['REQUESTED', 'IN_REVIEW', 'AWAITING_PATIENT'].includes(request.status))
            throw new Error('This request can no longer be confirmed.');
        const day = selection?.appointmentDate ? cairoDate(new Date(selection.appointmentDate)) : request.preferredDate.toISOString().slice(0, 10);
        const time = selection?.startTime || request.selectedStartTime;
        if (!time)
            throw new Error('Choose an available time before confirming.');
        const dentistId = selection?.dentistUserId || request.dentistPreferenceId || undefined;
        const duties = await tx.doctorDuty.findMany({ where: { branchId: request.branchId, dutyDate: { gte: dateOnly(day), lt: new Date(+dateOnly(day) + 86400000) } } });
        for (const id of [...new Set(duties.map(d => d.dentistUserId))].sort())
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${'dentist:' + id + ':' + day}))`;
        const result = await availability(request.branchId, day, dentistId, request.durationMinutes, tx);
        const slot = result.slots.find(s => s.available && s.time === time);
        if (!slot)
            throw new Error('This time is no longer available. Choose another time.');
        const assigned = slot.dentistIds[0];
        const duty = result.duties.find(d => d.dentistUserId === assigned && minutes(d.startTime) <= minutes(time) && minutes(d.endTime) >= minutes(slot.endTime))!;
        const appointment = await tx.appointment.create({ data: { requestId, patientId: request.patientId, branchId: request.branchId, dentistUserId: assigned, roomId: duty.roomId, appointmentDate: dateOnly(day), startTime: time, endTime: slot.endTime, durationMinutes: request.durationMinutes, serviceDescription: selection?.serviceDescription || request.serviceName || 'Consultation', source: request.source } });
        if (request.rescheduleOfId) {
            const original = await tx.appointment.findUniqueOrThrow({ where: { id: request.rescheduleOfId } });
            if (original.patientId !== request.patientId || original.branchId !== request.branchId || original.status !== 'CONFIRMED')
                throw new Error('The original booking can no longer be rescheduled.');
            await tx.appointment.update({ where: { id: original.id }, data: { status: 'CANCELLED', cancellationReason: 'Replacement booking confirmed' } });
        }
        await tx.appointmentRequest.update({ where: { id: requestId }, data: { status: 'CONFIRMED' } });
        const assignment = await tx.patientCareAssignment.findFirst({ where: { patientId: request.patientId, dentistUserId: assigned, branchId: request.branchId } });
        if (assignment)
            await tx.patientCareAssignment.update({ where: { id: assignment.id }, data: { active: true } });
        else
            await tx.patientCareAssignment.create({ data: { patientId: request.patientId, dentistUserId: assigned, branchId: request.branchId, assignedByUserId: actor.id } });
        const links = await tx.portalPatientLink.findMany({ where: { patientId: request.patientId, status: 'APPROVED' } });
        for (const link of links)
            await tx.notification.create({ data: { userId: link.userId, title: 'Appointment confirmed | تم تأكيد الموعد', body: `${day} ${time} — ${request.serviceName || 'Consultation'}`, type: 'STATUS_UPDATE' } });
        await tx.auditEvent.create({ data: { actorUserId: actor.id, action: 'APPOINTMENT_CONFIRMED', entityType: 'Appointment', entityId: appointment.id, branchId: request.branchId, metadataJson: { source: request.source } } });
        return appointment;
    }, { timeout: 15000 });
}
export async function submitBooking(input: {
    submissionKey?: string;
    branchId: string;
    patientId?: string;
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
    day: string;
    time: string;
    dentistId?: string;
    serviceName: string;
    reason?: string;
    source: BookingSource;
    durationMinutes?: number;
}, actor: Actor | null) {
    if(input.phone)input={...input,phone:normalizePhone(input.phone)};
    const submissionHash=createHash('sha256').update(JSON.stringify({...input,submissionKey:undefined,actorId:actor?.id||'guest'})).digest('hex');
    const staff = actor?.roleGrants.some(g => [Role.RECEPTIONIST, Role.OWNER_ADMIN].includes(g.role as 'RECEPTIONIST' | 'OWNER_ADMIN'));
    if (staff)
        requireRole(actor, [Role.RECEPTIONIST, Role.OWNER_ADMIN], input.branchId);
    else if (input.source !== 'WEBSITE')
        throw new Error('Only reception can choose this booking source.');
    if (input.patientId) {
        if (!actor)
            throw new Error('Sign in to book for an existing patient.');
        if (!staff)
            await assertPatientSelf(actor.id, input.patientId);
    }
    if (!input.patientId && (!input.fullName?.trim() || !input.phone?.trim() || !input.dateOfBirth))
        throw new Error('Enter your name, phone number and date of birth.');
    if (input.source === 'WALK_IN') {
        const policy = await db.schedulingPolicy.findUnique({ where: { branchId: input.branchId } });
        if (!policy?.walkInsEnabled)
            throw new Error('Walk-in bookings are not enabled for this branch.');
    }
    const duration = input.durationMinutes || 45;
    return db.$transaction(async (tx) => {
        if(input.submissionKey){
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'submission:'+input.submissionKey}))`;
          const previous=await tx.appointmentRequest.findUnique({where:{submissionKey:input.submissionKey}});
          if(previous){if(previous.submissionHash!==submissionHash)throw new Error('This submission reference was used for different details.');return previous;}
        }
        const available=await availability(input.branchId,input.day,input.dentistId,duration,tx);
        if(!available.slots.some(s=>s.available&&s.time===input.time))throw new Error('This time is no longer available. Choose another time.');
        let patientId = input.patientId;
        if (!patientId) {
            const dob = dateOnly(input.dateOfBirth!);
            if (+dob > Date.now())
                throw new Error('Date of birth cannot be in the future.');
            const matches = await tx.patient.findMany({ where: { primaryPhone: input.phone!.trim() }, select: { id: true }, take: 20 });
            const patient = await tx.patient.create({ data: { patientNumber: `EBT-${randomUUID()}`, fullName: input.fullName!.trim(), primaryPhone: input.phone!.trim(), dateOfBirth: dob, gender: 'UNKNOWN', primaryBranchId: input.branchId, source: staff ? 'CLINIC_ENTRY' : 'ONLINE_SELF_REG' } });
            patientId = patient.id;
            for (const match of matches)
                await tx.potentialDuplicateReview.create({ data: { patientAId: match.id, patientBId: patientId, matchType: 'SAME_PHONE' } });
            // Guest identities are never linked to an existing account by contact details.
            if (actor && !staff)
                await tx.portalPatientLink.create({ data: { userId: actor.id, patientId, status: 'APPROVED', verificationNotes: 'New separate identity created by its signed-in user.' } });
        }
        await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`request:${patientId}`}))`;
        const duplicate = await tx.appointmentRequest.findFirst({ where: { patientId, branchId: input.branchId, preferredDate: dateOnly(input.day), selectedStartTime: input.time, status: { in: ['REQUESTED', 'IN_REVIEW', 'CONFIRMED'] } } });
        if (duplicate)
            return duplicate;
        return tx.appointmentRequest.create({ data: { submissionKey:input.submissionKey,submissionHash,patientId, branchId: input.branchId, dentistPreferenceId: input.dentistId, serviceName: input.serviceName, preferredDate: dateOnly(input.day), preferredTimeWindow: minutes(input.time) < 720 ? 'MORNING' : minutes(input.time) < 1020 ? 'AFTERNOON' : 'EVENING', selectedStartTime: input.time, durationMinutes: duration, source: input.source, reason: input.reason || input.serviceName } });
    });
}
