import db from '@/lib/db';
import { Role, Prisma } from '@prisma/client';
import { requireRole, AuthorizationError } from '@/lib/rbac';
import { Actor } from './booking.service';
import { cairoDate, cairoInstant, orderVisits } from '@/lib/scheduling-rules';
import { getCairoDayBounds } from '@/lib/cairo-date';
export const defaultQueuePolicy = { earlyArrivalMinutes: 0, lateGraceMinutes: null as number | null, lateAction: 'STAFF_REVIEW', walkInsEnabled: false, cancellationNoticeHours: 24 };
export async function getQueuePolicy(branchId: string, tx: Prisma.TransactionClient = db) {
    return await tx.schedulingPolicy.findUnique({ where: { branchId } }) || { branchId, ...defaultQueuePolicy };
}
export async function checkIn(input: {
    patientId: string;
    branchId: string;
    appointmentId?: string;
    dentistUserId?: string;
    lateReason?: string;
}, actor: Actor) {
    requireRole(actor, [Role.RECEPTIONIST, Role.OWNER_ADMIN], input.branchId);
    return db.$transaction(async (tx) => {
        await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`visit:${input.branchId}`}))`;
        const { start, end } = getCairoDayBounds();
        const existing = await tx.queueEntry.findFirst({ where: { patientId: input.patientId, branchId: input.branchId, enteredAt: { gte: start, lt: end }, status: { in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] } } });
        if (existing) {
            if (input.appointmentId && existing.appointmentId !== input.appointmentId)
                throw new Error('This patient already has an active visit.');
            return { arrival: existing.arrivalEventId ? await tx.arrivalEvent.findUnique({ where: { id: existing.arrivalEventId } }) : null, queueEntry: existing };
        }
        const policy = await getQueuePolicy(input.branchId, tx);
        const appointment = input.appointmentId ? await tx.appointment.findUnique({ where: { id: input.appointmentId } }) : null;
        if (input.appointmentId && (!appointment || appointment.patientId !== input.patientId || appointment.branchId !== input.branchId))
            throw new AuthorizationError('Appointment does not match this patient and branch.');
        if (appointment) {
            if (appointment.status !== 'CONFIRMED')
                throw new Error('Only a confirmed appointment can be checked in.');
            if (appointment.appointmentDate.toISOString().slice(0, 10) !== cairoDate())
                throw new Error('Check-in is available on the appointment day.');
            const late = (Date.now() - +cairoInstant(cairoDate(), appointment.startTime)) / 60000;
            if (policy.lateGraceMinutes !== null && late > policy.lateGraceMinutes) {
                if (policy.lateAction === 'RESCHEDULE')
                    throw new Error('The late-arrival policy requires a new appointment.');
                if (!input.lateReason?.trim())
                    throw new Error('Late arrival: enter the approved exception reason before check-in.');
            }
        }
        else {
            if (!policy.walkInsEnabled)
                throw new Error('Book an available time before checking in this walk-in patient.');
            if (!input.dentistUserId)
                throw new Error('Choose the available treating dentist.');
            // Walk-ins require a confirmed available appointment: no unallocated capacity bypass.
            throw new Error('Create a walk-in booking in an available slot, then check in.');
        }
        const prior = await tx.queueEntry.findUnique({ where: { appointmentId: appointment.id } });
        if (prior)
            throw new Error('This appointment already has a visit record.');
        const now = new Date();
        const arrival = await tx.arrivalEvent.upsert({ where: { appointmentId: appointment.id }, create: { patientId: input.patientId, branchId: input.branchId, appointmentId: appointment.id, reportedAt: now, isVerified: true, verifiedAt: now, verifiedByUserId: actor.id, verificationNote: input.lateReason || null }, update: { isVerified: true, verifiedAt: now, verifiedByUserId: actor.id, verificationNote: input.lateReason || null } });
        const last = await tx.queueEntry.aggregate({ where: { branchId: input.branchId, enteredAt: { gte: start, lt: end } }, _max: { queueNumber: true } });
        const queueEntry = await tx.queueEntry.create({ data: { patientId: input.patientId, branchId: input.branchId, appointmentId: appointment.id, arrivalEventId: arrival.id, dentistUserId: appointment.dentistUserId, queueNumber: (last._max.queueNumber || 0) + 1, queueType: appointment.source === 'WALK_IN' ? 'WALK_IN' : 'BOOKED', enteredAt: now, status: 'WAITING' } });
        await tx.auditEvent.create({ data: { actorUserId: actor.id, action: 'PATIENT_CHECKED_IN', entityType: 'QueueEntry', entityId: queueEntry.id, branchId: input.branchId, metadataJson: { appointmentId: appointment.id, lateExceptionRecorded: !!input.lateReason } } });
        return { arrival, queueEntry };
    });
}
export async function transitionVisit(id: string, action: string, actor: Actor) {
    const transitions = { NO_RESPONSE: {from:'CALLED',to:'CALLED',field:'calledAt'}, RECALL: {from:'CALLED',to:'CALLED',field:'calledAt'}, RETURN: {from:'CALLED',to:'WAITING',field:'calledAt'}, DISMISS: {from:'CALLED',to:'DEPARTED_UNSEEN',field:'completedAt'}, CALL: { from: 'WAITING', to: 'CALLED', field: 'calledAt' }, START: { from: 'CALLED', to: 'IN_CONSULTATION', field: 'startedAt' }, COMPLETE: { from: 'IN_CONSULTATION', to: 'COMPLETED', field: 'completedAt' }, LEAVE: { from: 'WAITING', to: 'DEPARTED_UNSEEN', field: 'completedAt' } } as const;
    if (!(action in transitions))
        throw new Error('Choose a valid next action.');
    const step = transitions[action as keyof typeof transitions];
    return db.$transaction(async (tx) => {
        const entry = await tx.queueEntry.findUniqueOrThrow({ where: { id }, include: { appointment: true } });
        requireRole(actor, action === 'START' ? [Role.DENTIST, Role.RECEPTIONIST] : action === 'COMPLETE' ? [Role.DENTIST, Role.RECEPTIONIST] : [Role.RECEPTIONIST], entry.branchId);
        const owner = actor.roleGrants.some(g => g.role === 'OWNER_ADMIN');
        if (!owner && actor.roleGrants.some(g => g.role === 'DENTIST') && entry.dentistUserId !== actor.id)
            throw new AuthorizationError('This visit belongs to another dentist.');
        await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`visit:${entry.branchId}`}))`;
        if (entry.status === step.to && action === 'CALL') return entry;
        if (action === 'CALL') {
            const occupied = await tx.queueEntry.findFirst({ where: { branchId:entry.branchId, dentistUserId:entry.dentistUserId, status:{in:['CALLED','IN_CONSULTATION']}, enteredAt:{gte:getCairoDayBounds().start,lt:getCairoDayBounds().end} } });
            if (occupied && occupied.id !== id) throw new Error('Release the current patient before calling another.');
            const policy = await getQueuePolicy(entry.branchId, tx);
            const { start, end } = getCairoDayBounds();
            const candidates = await tx.queueEntry.findMany({ where: { branchId: entry.branchId, dentistUserId: entry.dentistUserId, status: 'WAITING', enteredAt: { gte: start, lt: end } }, include: { appointment: true } });
            const first = orderVisits(candidates, policy)[0];
            if (!first || first.id !== id) {
                // If this is the specific visit requested or first in line, allow it
                const matchingRequested = candidates.find(c => c.id === id);
                if (!matchingRequested) {
                    throw new Error('Call the next eligible patient in the queue.');
                }
            }
        }
        if (action === 'NO_RESPONSE' || action === 'RECALL') {
            const latest = await tx.auditEvent.findFirst({where:{entityType:'QueueEntry',entityId:id,action:{startsWith:'VISIT_'}},orderBy:{createdAt:'desc'}});
            if (action === 'RECALL' && latest?.action !== 'VISIT_NO_RESPONSE') throw new Error('Record no response before calling again.');
            if (action === 'NO_RESPONSE' && latest?.action === 'VISIT_NO_RESPONSE') throw new Error('No response is already recorded.');
        }
        const result = await tx.queueEntry.updateMany({ where: { id, status: step.from }, data: { status: step.to, ...(action === 'NO_RESPONSE' || action === 'RETURN' ? {} : {[step.field]:new Date()}) } });
        if (result.count !== 1)
            throw new Error('The visit has changed. Refresh the queue.');
        if (action === 'COMPLETE' && entry.appointmentId)
            await tx.appointment.update({ where: { id: entry.appointmentId }, data: { status: 'COMPLETED' } });
        await tx.auditEvent.create({ data: { actorUserId: actor.id, action: `VISIT_${action}`, entityType: 'QueueEntry', entityId: id, branchId: entry.branchId } });
        return tx.queueEntry.findUniqueOrThrow({ where: { id } });
    });
}
