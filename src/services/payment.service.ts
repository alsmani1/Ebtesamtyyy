import db from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';
import { randomUUID } from 'crypto';
const paymentSchema = z.object({ patientId: z.string().min(1), collectionBranchId: z.string().min(1), amountPiasters: z.number().int().positive().max(2147483647), paymentMethod: z.nativeEnum(PaymentMethod), collectedByUserId: z.string().min(1), idempotencyKey: z.string().min(8).max(200), invoiceAllocations: z.array(z.object({ invoiceId: z.string().min(1), amountPiasters: z.number().int().positive() })).optional(), notes: z.string().max(1000).optional() });
export async function postPayment(input: z.input<typeof paymentSchema>) {
    const data = paymentSchema.parse(input);
    const actor = await db.user.findUniqueOrThrow({ where: { id: data.collectedByUserId }, include: { roleGrants: true } });
    if (actor.status !== 'ACTIVE')
        throw new Error('Account is inactive.');
    requireRole(actor, ['RECEPTIONIST', 'FINANCE', 'OWNER_ADMIN'], data.collectionBranchId);
    const allocations = data.invoiceAllocations || [];
    if (new Set(allocations.map(a => a.invoiceId)).size !== allocations.length)
        throw new Error('Each invoice may be allocated only once.');
    if (allocations.reduce((s, a) => s + a.amountPiasters, 0) > data.amountPiasters)
        throw new Error('Invoice allocations exceed the amount received.');
    return db.$transaction(async (tx) => {
        await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`payment:${data.idempotencyKey}`}))`;
        const existing = await tx.payment.findUnique({ where: { idempotencyKey: data.idempotencyKey }, include: { allocations: true } });
        if (existing) {
            const old = existing.allocations.map(a => `${a.invoiceId}:${a.allocatedAmountPiasters}`).sort().join('|');
            const next = allocations.map(a => `${a.invoiceId}:${a.amountPiasters}`).sort().join('|');
            if (existing.patientId !== data.patientId || existing.collectionBranchId !== data.collectionBranchId || existing.amountPiasters !== data.amountPiasters || existing.paymentMethod !== data.paymentMethod || old !== next)
                throw new Error('This payment reference was already used for different details.');
            return existing;
        }
        for (const a of [...allocations].sort((a, b) => a.invoiceId.localeCompare(b.invoiceId))) {
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`invoice:${a.invoiceId}`}))`;
            const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: a.invoiceId } });
            requireRole(actor, ['RECEPTIONIST', 'FINANCE', 'OWNER_ADMIN'], invoice.branchId);
            if (invoice.patientId !== data.patientId)
                throw new Error('The invoice belongs to another patient.');
            if (!['ISSUED', 'PARTIALLY_PAID'].includes(invoice.status))
                throw new Error('This invoice cannot receive a payment.');
            if (a.amountPiasters > invoice.totalAmountPiasters - invoice.paidAmountPiasters)
                throw new Error('The allocation exceeds the invoice balance.');
            const paid = invoice.paidAmountPiasters + a.amountPiasters;
            await tx.invoice.update({ where: { id: invoice.id }, data: { paidAmountPiasters: paid, status: paid === invoice.totalAmountPiasters ? 'PAID' : 'PARTIALLY_PAID' } });
        }
        const payment = await tx.payment.create({ data: { receiptNumber: `RCP-${randomUUID()}`, patientId: data.patientId, collectionBranchId: data.collectionBranchId, amountPiasters: data.amountPiasters, paymentMethod: data.paymentMethod, collectedByUserId: actor.id, idempotencyKey: data.idempotencyKey, notes: data.notes, status: 'POSTED', allocations: { create: allocations.map(a => ({ invoiceId: a.invoiceId, allocatedAmountPiasters: a.amountPiasters })) } }, include: { allocations: true } });
        await tx.auditEvent.create({ data: { actorUserId: actor.id, action: 'PAYMENT_COLLECTED', entityType: 'Payment', entityId: payment.id, branchId: data.collectionBranchId, metadataJson: { amountPiasters: data.amountPiasters, paymentMethod: data.paymentMethod } } });
        return payment;
    });
}
