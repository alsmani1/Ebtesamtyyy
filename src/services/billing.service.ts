import {postPayment} from './payment.service';
import {randomUUID} from 'crypto';
import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import { 
  InvoiceStatus, 
  PaymentMethod, 
  PaymentStatus, 
  InstallmentPlanStatus, 
  InstallmentStatus,
  ExpenseCategory 
} from '@prisma/client';

export interface CreateInvoiceInput {
  patientId: string;
  branchId: string;
  encounterId?: string;
  issuedByUserId: string;
  notes?: string;
  discountPercent?: number;
  discountReason?: string;
  lines: Array<{
    serviceItemId?: string;
    description: string;
    toothNumber?: string;
    unitPricePiasters: number;
    quantity?: number;
  }>;
}

export interface RecordPaymentInput {
  patientId: string;
  collectionBranchId: string;
  amountPiasters: number;
  paymentMethod: PaymentMethod;
  collectedByUserId: string;
  idempotencyKey: string;
  invoiceAllocations?: Array<{
    invoiceId: string;
    amountPiasters: number;
  }>;
  notes?: string;
}

export interface CreateInstallmentPlanInput {
  patientId: string;
  invoiceId: string;
  totalInstallments: number;
  startDate?: Date;
}

export interface CashReconciliationInput {
  branchId: string;
  cashierUserId: string;
  reconciliationDate?: Date;
  countedCashPiasters: number;
  notes?: string;
}

export interface RecordExpenseInput {
  branchId: string;
  category: ExpenseCategory;
  payee: string;
  amountPiasters: number;
  expenseDate?: Date;
  notes?: string;
  createdByUserId: string;
}

// ==========================================
// 1. NUMBER SEQUENCING GENERATORS
// ==========================================

export async function generateNextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.invoice.count();
  const nextSeq = (count + 1).toString().padStart(4, '0');
  return `INV-${year}-${nextSeq}`;
}

export async function generateNextReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.payment.count();
  const nextSeq = (count + 1).toString().padStart(4, '0');
  return `RCP-${year}-${nextSeq}`;
}

// ==========================================
// 2. SERVICE CATALOG
// ==========================================

export async function getServiceCatalog() {
  const items = await db.serviceCatalogItem.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' },
  });

  return items;
}

// ==========================================
// 3. INVOICES & CHARGES
// ==========================================

export async function createInvoice(data: CreateInvoiceInput) {
  if (!data.lines || data.lines.length === 0) {
    throw new Error('An invoice must contain at least one line item.');
  }

  const actor=await db.user.findUniqueOrThrow({where:{id:data.issuedByUserId},include:{roleGrants:true}});
  const {requireRole, AuthorizationError}=await import('@/lib/rbac');requireRole(actor,['RECEPTIONIST','FINANCE','OWNER_ADMIN','DENTIST'],data.branchId);
  if (data.lines.some(line => !line.description?.trim())) throw new Error("Enter a bill type for each invoice line.");
  for(const line of data.lines)if(!Number.isInteger(line.unitPricePiasters)||line.unitPricePiasters<0||!Number.isInteger(line.quantity??1)||(line.quantity??1)<1)throw new Error('Enter valid prices and quantities.');

  // Enforce clinic-level and role-level discount caps on the server
  const discountPct = Number(data.discountPercent || 0);
  if (discountPct > 0) {
    const isOwner = actor.roleGrants.some(g => g.role === 'OWNER_ADMIN');
    const isDentist = actor.roleGrants.some(g => g.role === 'DENTIST');
    const maxCap = isOwner ? 100 : isDentist ? 15 : 10; // Receptionist max 10%
    if (discountPct > maxCap) {
      await logAuditEvent({
        actorUserId: data.issuedByUserId,
        action: 'DISCOUNT_CAP_EXCEEDED_REJECTED',
        entityType: 'Invoice',
        entityId: data.patientId,
        branchId: data.branchId,
        metadata: { attemptedDiscountPercent: discountPct, maxAllowedPercent: maxCap },
      });
      throw new AuthorizationError(`Discount of ${discountPct}% exceeds your permitted role cap of ${maxCap}%. Owner approval is required.`);
    }
  }

  const invoiceNumber = 'INV-'+randomUUID();

  // Compute line totals and overall total
  let totalAmountPiasters = 0;
  const processedLines = data.lines.map((line) => {
    const qty = line.quantity ?? 1;
    const rawLineTotal = line.unitPricePiasters * qty;
    const discountedUnitPrice = discountPct > 0 ? Math.round(line.unitPricePiasters * (1 - discountPct / 100)) : line.unitPricePiasters;
    const lineTotal = discountPct > 0 ? Math.round(rawLineTotal * (1 - discountPct / 100)) : rawLineTotal;
    totalAmountPiasters += lineTotal;
    return {
      serviceItemId: line.serviceItemId ?? null,
      description: line.description,
      toothNumber: line.toothNumber ?? null,
      unitPricePiasters: discountedUnitPrice,
      quantity: qty,
      lineTotalPiasters: lineTotal,
    };
  });

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber,
      patientId: data.patientId,
      branchId: data.branchId,
      encounterId: data.encounterId ?? null,
      issuedByUserId: data.issuedByUserId,
      status: InvoiceStatus.ISSUED,
      totalAmountPiasters,
      paidAmountPiasters: 0,
      notes: discountPct > 0 ? `${data.notes || ''} [Discount ${discountPct}%: ${data.discountReason || 'Authorized'}]`.trim() : (data.notes ?? null),
      lines: {
        create: processedLines,
      },
    },
    include: {
      lines: true,
      patient: true,
      branch: true,
      issuedByUser: { select: { id: true, fullName: true } },
    },
  });

  // Freeze immutable CommissionSnapshot for the treating dentist at invoice finalization
  try {
    const rule = await db.commissionRule.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    const rate = rule?.ratePercent ?? 35.0;
    const matCost = Math.round(totalAmountPiasters * 0.08);
    const labCost = Math.round(totalAmountPiasters * 0.10);
    const netBase = Math.max(0, totalAmountPiasters - (rule?.deductMaterialCost !== false ? matCost : 0) - (rule?.deductLabCost !== false ? labCost : 0));
    const commAmount = Math.round(netBase * (rate / 100));
    const care = await db.patientCareAssignment.findFirst({ where: { patientId: data.patientId, active: true } });
    const dentistId = care?.dentistUserId || data.issuedByUserId;
    await db.commissionSnapshot.upsert({
      where: { invoiceId: invoice.id },
      update: {},
      create: {
        invoiceId: invoice.id,
        dentistUserId: dentistId,
        branchId: data.branchId,
        grossAmountPiasters: totalAmountPiasters,
        materialCostPiasters: matCost,
        labCostPiasters: labCost,
        commissionRatePercent: rate,
        commissionAmountPiasters: commAmount,
        ruleSnapshotJson: {
          ruleId: rule?.id || 'DEFAULT',
          ratePercent: rate,
          deductLabCost: rule?.deductLabCost ?? true,
          deductMaterialCost: rule?.deductMaterialCost ?? true,
          frozenAt: new Date().toISOString(),
        },
      },
    });
  } catch (snapErr) {
    console.warn('CommissionSnapshot non-fatal warning:', snapErr);
  }

  await logAuditEvent({
    actorUserId: data.issuedByUserId,
    action: 'INVOICE_ISSUED',
    entityType: 'Invoice',
    entityId: invoice.id,
    branchId: data.branchId,
    metadata: {
      invoiceNumber,
      patientId: data.patientId,
      totalAmountPiasters,
      linesCount: processedLines.length,
    },
  });

  return invoice;
}

export async function getPatientInvoices(patientId: string) {
  return db.invoice.findMany({
    where: { patientId },
    include: {
      lines: { include: { serviceItem: true } },
      allocations: { include: { payment: true } },
      branch: true,
      issuedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { issuedAt: 'desc' },
  });
}

// ==========================================
// 4. PAYMENTS & ALLOCATIONS (ATOMIC & IDEMPOTENT)
// ==========================================

export async function recordPayment(data: RecordPaymentInput) { return postPayment(data); }

export async function getPatientPayments(patientId: string) {
  return db.payment.findMany({
    where: { patientId },
    include: {
      allocations: { include: { invoice: true } },
      collectedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { collectedAt: 'desc' },
  });
}

// ==========================================
// 5. INSTALLMENT PLANS (FLEXIBLE FINANCING)
// ==========================================

export async function createInstallmentPlan(data: CreateInstallmentPlanInput) {
  const invoice = await db.invoice.findUnique({
    where: { id: data.invoiceId },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const remainingBalancePiasters = invoice.totalAmountPiasters - invoice.paidAmountPiasters;
  if (remainingBalancePiasters <= 0) {
    throw new Error('Invoice is already fully paid. Cannot establish installment plan.');
  }

  const installmentsCount = Math.max(2, data.totalInstallments || 3);
  const perInstallmentAmount = Math.floor(remainingBalancePiasters / installmentsCount);
  const remainder = remainingBalancePiasters - (perInstallmentAmount * installmentsCount);

  const baseDate = data.startDate ? new Date(data.startDate) : new Date();

  const plan = await db.installmentPlan.create({
    data: {
      patientId: data.patientId,
      invoiceId: data.invoiceId,
      totalInstallments: installmentsCount,
      totalAmountPiasters: remainingBalancePiasters,
      status: InstallmentPlanStatus.ACTIVE,
      installments: {
        create: Array.from({ length: installmentsCount }, (_, i) => {
          const dueDate = new Date(baseDate);
          dueDate.setMonth(dueDate.getMonth() + i + 1);
          // Last installment absorbs rounding remainder
          const amount = i === installmentsCount - 1 ? perInstallmentAmount + remainder : perInstallmentAmount;
          return {
            installmentNumber: i + 1,
            dueDate,
            amountPiasters: amount,
            status: InstallmentStatus.PENDING,
          };
        }),
      },
    },
    include: {
      installments: { orderBy: { installmentNumber: 'asc' } },
      invoice: true,
    },
  });

  return plan;
}

// ==========================================
// 6. DAILY CASH RECONCILIATION & DISCREPANCIES
// ==========================================

export async function recordCashReconciliation(data: CashReconciliationInput) {
  const targetDate = data.reconciliationDate ? new Date(data.reconciliationDate) : new Date();
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Authoritatively calculate expected cash from posted CASH payments for this branch today
  const cashPayments = await db.payment.findMany({
    where: {
      collectionBranchId: data.branchId,
      paymentMethod: PaymentMethod.CASH,
      status: PaymentStatus.POSTED,
      collectedAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  const expectedCashPiasters = cashPayments.reduce((sum, p) => sum + p.amountPiasters, 0);
  const discrepancyPiasters = data.countedCashPiasters - expectedCashPiasters;

  const reconciliation = await db.cashReconciliation.create({
    data: {
      branchId: data.branchId,
      cashierUserId: data.cashierUserId,
      reconciliationDate: dayStart,
      expectedCashPiasters,
      countedCashPiasters: data.countedCashPiasters,
      discrepancyPiasters,
      notes: data.notes ?? null,
    },
    include: {
      branch: true,
      cashierUser: { select: { id: true, fullName: true } },
    },
  });

  await logAuditEvent({
    actorUserId: data.cashierUserId,
    action: 'CASH_RECONCILIATION_PERFORMED',
    entityType: 'CashReconciliation',
    entityId: reconciliation.id,
    branchId: data.branchId,
    metadata: {
      expectedCashPiasters,
      countedCashPiasters: data.countedCashPiasters,
      discrepancyPiasters,
    },
  });

  return reconciliation;
}

// ==========================================
// 7. EXPENSES & FINANCIAL ANALYTICS
// ==========================================

export async function recordExpense(data: RecordExpenseInput) {
  if (data.amountPiasters <= 0) {
    throw new Error('Expense amount must be greater than zero.');
  }

  const expense = await db.expense.create({
    data: {
      branchId: data.branchId,
      category: data.category,
      payee: data.payee,
      amountPiasters: data.amountPiasters,
      expenseDate: data.expenseDate || new Date(),
      notes: data.notes ?? null,
      createdByUserId: data.createdByUserId,
    },
    include: {
      branch: true,
      createdByUser: { select: { id: true, fullName: true } },
    },
  });

  await logAuditEvent({
    actorUserId: data.createdByUserId,
    action: 'EXPENSE_RECORDED',
    entityType: 'Expense',
    entityId: expense.id,
    branchId: data.branchId,
    metadata: {
      category: data.category,
      payee: data.payee,
      amountPiasters: data.amountPiasters,
    },
  });

  return expense;
}

export async function getFinancialSummary(branchId?: string, startDate?: Date, endDate?: Date) {
  const whereBranch = branchId ? { branchId } : {};
  const whereCollection = branchId ? { collectionBranchId: branchId } : {};

  const dateFilter = startDate && endDate ? { gte: startDate, lte: endDate } : undefined;

  const [invoices, payments, expenses] = await Promise.all([
    db.invoice.findMany({
      where: {
        ...whereBranch,
        status:{notIn:['VOIDED','DRAFT']},
        ...(dateFilter ? { issuedAt: dateFilter } : {}),
      },
    }),
    db.payment.findMany({
      where: {
        ...whereCollection,
        status: PaymentStatus.POSTED,
        ...(dateFilter ? { collectedAt: dateFilter } : {}),
      },
    }),
    db.expense.findMany({
      where: {
        ...whereBranch,
        ...(dateFilter ? { expenseDate: dateFilter } : {}),
      },
    }),
  ]);

  const totalInvoicedPiasters = invoices.reduce((sum, inv) => sum + inv.totalAmountPiasters, 0);
  const totalCollectedPiasters = payments.reduce((sum, p) => sum + p.amountPiasters, 0);
  const totalExpensesPiasters = expenses.reduce((sum, exp) => sum + exp.amountPiasters, 0);

  // Method breakdown
  const collectedByMethod = {
    CASH: payments.filter((p) => p.paymentMethod === PaymentMethod.CASH).reduce((sum, p) => sum + p.amountPiasters, 0),
    CREDIT_CARD: payments.filter((p) => p.paymentMethod === PaymentMethod.CREDIT_CARD).reduce((sum, p) => sum + p.amountPiasters, 0),
    INSTAPAY: payments.filter((p) => p.paymentMethod === PaymentMethod.INSTAPAY).reduce((sum, p) => sum + p.amountPiasters, 0),
    FAWRY: payments.filter((p) => p.paymentMethod === PaymentMethod.FAWRY).reduce((sum, p) => sum + p.amountPiasters, 0),
  };

  return {
    monthlyCollections:Array.from({length:6},(_,i)=>{const now=new Date();const month=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-5+i,15));const key=month.toLocaleDateString('en-GB',{month:'short',year:'2-digit',timeZone:'Africa/Cairo'});return {label:key,value:payments.filter(p=>new Date(p.collectedAt).toLocaleDateString('en-GB',{month:'short',year:'2-digit',timeZone:'Africa/Cairo'})===key).reduce((sum,p)=>sum+p.amountPiasters,0)/100}}),
    totalInvoicedPiasters,
    totalCollectedPiasters,
    totalExpensesPiasters,
    collectedByMethod,
    invoiceCount: invoices.length,
    paymentCount: payments.length,
    expenseCount: expenses.length,
  };
}
