import {isStockLotExpired} from '@/lib/inventory-stock';
import {createHash} from 'crypto';
import {Prisma} from '@prisma/client';
import {requireRole} from '@/lib/rbac';
async function adjustStock(tx:Prisma.TransactionClient,data:StockAdjustmentInput){
 if(!Number.isInteger(data.quantity)||data.quantity===0)throw new Error('Stock quantity must be a non-zero integer.');
 const actor=await tx.user.findUniqueOrThrow({where:{id:data.performedByUserId},include:{roleGrants:true}});requireRole(actor,['INVENTORY','OWNER_ADMIN'],data.branchId);if(actor.status!=='ACTIVE')throw new Error('Inactive account.');
 await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'stock:'+data.materialId+':'+data.branchId+':'+data.lotNumber}))`;
 let lot=await tx.stockLot.findUnique({where:{materialId_branchId_lotNumber:{materialId:data.materialId,branchId:data.branchId,lotNumber:data.lotNumber}}});
 if(!lot){if(data.quantity<0)throw new Error('Cannot deduct from non-existent stock lot.');lot=await tx.stockLot.create({data:{materialId:data.materialId,branchId:data.branchId,lotNumber:data.lotNumber,expiryDate:data.expiryDate||new Date(new Date().setFullYear(new Date().getFullYear()+2)),quantityOnHand:0}});}
 if(lot.quantityOnHand+data.quantity<0)throw new Error('Insufficient stock in lot.');
 const updatedLot=await tx.stockLot.update({where:{id:lot.id},data:{quantityOnHand:{increment:data.quantity}}});
 const movement=await tx.stockMovement.create({data:{materialId:data.materialId,branchId:data.branchId,lotId:lot.id,movementType:data.movementType,quantity:data.quantity,notes:data.notes,performedByUserId:data.performedByUserId}});
 await tx.auditEvent.create({data:{actorUserId:actor.id,action:'STOCK_ADJUSTMENT_RECORDED',entityType:'StockMovement',entityId:movement.id,branchId:data.branchId,metadataJson:{quantity:data.quantity,movementType:data.movementType,resultingOnHand:updatedLot.quantityOnHand}}});return {updatedLot,movement};
}
import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import { 
  StockMovementType, 
  StockTransferStatus, 
  PurchaseOrderStatus 
} from '@prisma/client';

export interface CreateMaterialInput {
  sku: string;
  nameEn: string;
  nameAr: string;
  category: string;
  unit: string;
  unitCostPiasters: number;
  reorderPoint?: number;
}

export interface StockAdjustmentInput {
  materialId: string;
  branchId: string;
  lotNumber: string;
  expiryDate?: Date;
  quantity: number; // positive for addition, negative for consumption/waste
  movementType: StockMovementType;
  performedByUserId: string;
  notes?: string;
}

export interface RequestTransferInput {
  materialId: string;
  fromBranchId: string;
  toBranchId: string;
  quantity: number;
  requestedByUserId: string;
  notes?: string;
}

export interface CreateSupplierInput {
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  branchId: string;
  notes?: string;
  lines: Array<{
    materialId: string;
    quantityOrdered: number;
    unitCostPiasters: number;
  }>;
}

export interface ReceiveGoodsInput {
  idempotencyKey?: string;
  purchaseOrderId: string;
  branchId: string;
  receivedByUserId: string;
  notes?: string;
  lines: Array<{
    materialId: string;
    lotNumber: string;
    expiryDate: Date;
    quantityAccepted: number;
    quantityRejected?: number;
    rejectionReason?: string;
  }>;
}

// ==========================================
// 1. PO SEQUENCE GENERATOR
// ==========================================

export async function generateNextPONumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await db.purchaseOrder.count();
  const nextSeq = (count + 1).toString().padStart(4, '0');
  return `PO-${year}-${nextSeq}`;
}

// ==========================================
// 2. MATERIAL CATALOG
// ==========================================

export async function getMaterialCatalog(category?: string) {
  const whereClause: any = { isActive: true };
  if (category) whereClause.category = category;

  let materials = await db.material.findMany({
    where: whereClause,
    include: {
      lots: { where: { isQuarantined: false } },
    },
    orderBy: { sku: 'asc' },
  });

  return materials;
}

export async function createMaterial(data: CreateMaterialInput) {
  return db.material.create({
    data: {
      sku: data.sku,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      category: data.category,
      unit: data.unit,
      unitCostPiasters: data.unitCostPiasters,
      reorderPoint: data.reorderPoint ?? 10,
    },
  });
}

// ==========================================
// 3. STOCK BALANCES & AUDIT MOVEMENTS
// ==========================================

export async function getStockBalances(branchId: string) {
  const materials = await getMaterialCatalog();

  const balances = await Promise.all(
    materials.map(async (m) => {
      const lots = await db.stockLot.findMany({
        where: {
          materialId: m.id,
          branchId,
          isQuarantined: false,
        },
      });

      const totalOnHand = lots.filter(lot=>!isStockLotExpired(lot.expiryDate)).reduce((sum, lot) => sum + lot.quantityOnHand, 0);
      const isLowStock = totalOnHand <= m.reorderPoint;

      return {
        material: m,
        totalOnHand,
        reorderPoint: m.reorderPoint,
        isLowStock,
        lots,
      };
    })
  );

  return balances;
}

export async function recordStockAdjustment(data: StockAdjustmentInput) { return db.$transaction(tx=>adjustStock(tx,data)); }

// ==========================================
// 4. INTER-BRANCH STOCK TRANSFERS
// ==========================================

export async function requestStockTransfer(data: RequestTransferInput) {
  if(!Number.isInteger(data.quantity)||data.quantity<=0)throw new Error('Transfer quantity must be a positive integer.');
  const actor=await db.user.findUniqueOrThrow({where:{id:data.requestedByUserId},include:{roleGrants:true}});requireRole(actor,['INVENTORY','OWNER_ADMIN'],data.fromBranchId);
  if (data.fromBranchId === data.toBranchId) {
    throw new Error('Source and destination branches must be distinct.');
  }

  const transfer = await db.stockTransfer.create({
    data: {
      materialId: data.materialId,
      fromBranchId: data.fromBranchId,
      toBranchId: data.toBranchId,
      quantity: data.quantity,
      status: StockTransferStatus.REQUESTED,
      requestedByUserId: data.requestedByUserId,
      notes: data.notes ?? null,
    },
    include: {
      material: true,
      fromBranch: true,
      toBranch: true,
      requestedByUser: { select: { id: true, fullName: true } },
    },
  });

  return transfer;
}

export async function shipStockTransfer(transferId: string, performedByUserId: string, lotNumber: string) { return db.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'transfer:'+transferId}))`;const transfer=await tx.stockTransfer.findUniqueOrThrow({where:{id:transferId}});if(transfer.status!=='REQUESTED')throw new Error('Transfer must be REQUESTED before shipping.');await adjustStock(tx,{materialId:transfer.materialId,branchId:transfer.fromBranchId,lotNumber,quantity:-transfer.quantity,movementType:'TRANSFER_OUT',performedByUserId,notes:'Transfer '+transfer.id});return tx.stockTransfer.update({where:{id:transferId},data:{status:'SHIPPED',shippedAt:new Date()}});}); }

export async function receiveStockTransfer(
  transferId: string, 
  performedByUserId: string, 
  lotNumber: string, 
  expiryDate: Date
) { return db.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'transfer:'+transferId}))`;const transfer=await tx.stockTransfer.findUniqueOrThrow({where:{id:transferId}});if(transfer.status!=='SHIPPED')throw new Error('Transfer must be in SHIPPED status before receiving.');await adjustStock(tx,{materialId:transfer.materialId,branchId:transfer.toBranchId,lotNumber,expiryDate,quantity:transfer.quantity,movementType:'TRANSFER_IN',performedByUserId,notes:'Transfer '+transfer.id});return tx.stockTransfer.update({where:{id:transferId},data:{status:'RECEIVED',receivedAt:new Date()}});}); }

// ==========================================
// 5. SUPPLIERS & PROCUREMENT
// ==========================================

export async function getSuppliers() {
  const suppliers = await db.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return suppliers;
}

export async function createSupplier(data: CreateSupplierInput) {
  return db.supplier.create({
    data: {
      name: data.name,
      contactPerson: data.contactPerson ?? null,
      phone: data.phone,
      email: data.email ?? null,
      address: data.address ?? null,
    },
  });
}

export async function createPurchaseOrder(data: CreatePurchaseOrderInput) {
  if (!data.lines || data.lines.length === 0) {
    throw new Error('Purchase order must have at least one line item.');
  }

  const poNumber = await generateNextPONumber();
  let totalAmountPiasters = 0;

  const linesData = data.lines.map((l) => {
    const lineTotal = l.quantityOrdered * l.unitCostPiasters;
    totalAmountPiasters += lineTotal;
    return {
      materialId: l.materialId,
      quantityOrdered: l.quantityOrdered,
      quantityReceived: 0,
      unitCostPiasters: l.unitCostPiasters,
    };
  });

  const po = await db.purchaseOrder.create({
    data: {
      poNumber,
      supplierId: data.supplierId,
      branchId: data.branchId,
      status: PurchaseOrderStatus.ISSUED,
      totalAmountPiasters,
      notes: data.notes ?? null,
      lines: {
        create: linesData,
      },
    },
    include: {
      lines: { include: { material: true } },
      supplier: true,
      branch: true,
    },
  });

  return po;
}

export async function receiveGoods(data: ReceiveGoodsInput) {
  const requestHash=createHash('sha256').update(JSON.stringify({...data,idempotencyKey:undefined})).digest('hex');
  const receipt = await db.$transaction(async (tx) => {
    const actor=await tx.user.findUniqueOrThrow({where:{id:data.receivedByUserId},include:{roleGrants:true}});
    requireRole(actor,['INVENTORY','OWNER_ADMIN'],data.branchId);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'po:'+data.purchaseOrderId}))`;
    if(data.idempotencyKey){const old=await tx.goodsReceipt.findUnique({where:{idempotencyKey:data.idempotencyKey},include:{lines:true}});if(old){if(old.requestHash!==requestHash)throw new Error('Receipt reference reused with different details.');return old;}}
    const po=await tx.purchaseOrder.findUniqueOrThrow({where:{id:data.purchaseOrderId},include:{lines:true}});
    if(po.branchId!==data.branchId||!['ISSUED','PARTIALLY_RECEIVED'].includes(po.status))throw new Error('Purchase order is not open for this branch.');
    if(!data.lines.length||new Set(data.lines.map(l=>l.materialId)).size!==data.lines.length)throw new Error('Each ordered material must appear once.');
    for(const line of data.lines){const ordered=po.lines.find(p=>p.materialId===line.materialId);if(!ordered||!Number.isInteger(line.quantityAccepted)||line.quantityAccepted<0||line.quantityAccepted>ordered.quantityOrdered-ordered.quantityReceived)throw new Error('Accepted quantity exceeds remaining order quantity.');}

    for(const line of data.lines){
      if(line.quantityAccepted>0){
        const name=await tx.material.findUnique({where:{id:line.materialId},select:{nameEn:true}});
        const label=name?.nameEn || 'Item';
        if(!line.lotNumber?.trim())throw new Error(label+': enter the supplier batch / lot number.');
        if(!Number.isFinite(+line.expiryDate))throw new Error(label+': select the expiry date using the date field.');
        if(isStockLotExpired(line.expiryDate))throw new Error(label+': the entered expiry date '+line.expiryDate.toISOString().slice(0,10)+' is already expired. Enter the expiry printed on the delivered goods.');
      }
    }
    if(!data.lines.some(line=>line.quantityAccepted>0||(line.quantityRejected||0)>0)) throw new Error('Enter a received or rejected quantity.');
    const gr = await tx.goodsReceipt.create({
      data: {
        idempotencyKey:data.idempotencyKey,requestHash,
        purchaseOrderId: data.purchaseOrderId,
        branchId: data.branchId,
        receivedByUserId: data.receivedByUserId,
        notes: data.notes ?? null,
        lines: {
          create: data.lines.map((l) => ({
            materialId: l.materialId,
            lotNumber: l.lotNumber,
            expiryDate: l.expiryDate,
            quantityAccepted: l.quantityAccepted,
            quantityRejected: l.quantityRejected || 0,
            rejectionReason: l.rejectionReason || null,
          })),
        },
      },
      include: { lines: true },
    });

    // Update PO lines & stock lots for accepted quantities
    for (const line of data.lines) {
      if (line.quantityAccepted > 0) {
        // Update PO line received count
        const poLine = po.lines.find((pl) => pl.materialId === line.materialId);
        if (poLine) {
          await tx.purchaseOrderLine.update({
            where: { id: poLine.id },
            data: { quantityReceived: poLine.quantityReceived + line.quantityAccepted },
          });
        }

        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'stock:'+line.materialId+':'+data.branchId+':'+line.lotNumber}))`;
        // Add to stock lot
        let lot = await tx.stockLot.findUnique({
          where: {
            materialId_branchId_lotNumber: {
              materialId: line.materialId,
              branchId: data.branchId,
              lotNumber: line.lotNumber,
            },
          },
        });

        if (!lot) {
          lot = await tx.stockLot.create({
            data: {
              materialId: line.materialId,
              branchId: data.branchId,
              lotNumber: line.lotNumber,
              expiryDate: line.expiryDate,
              quantityOnHand: line.quantityAccepted,
            },
          });
        } else {
          if(lot.isQuarantined || isStockLotExpired(lot.expiryDate)) throw new Error('This batch is expired or quarantined. Receive usable goods into a valid batch.');
          if(lot.expiryDate.toISOString().slice(0,10)!==line.expiryDate.toISOString().slice(0,10)) throw new Error('Expiry date does not match the existing batch.');
          lot = await tx.stockLot.update({
            where: { id: lot.id },
            data: { quantityOnHand: {increment:line.quantityAccepted} },
          });
        }

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            materialId: line.materialId,
            branchId: data.branchId,
            lotId: lot.id,
            movementType: StockMovementType.RECEIPT,
            quantity: line.quantityAccepted,
            referenceId: gr.id,
            performedByUserId: data.receivedByUserId,
          },
        });
      }
    }

    // Check if PO is completely fulfilled
    const updatedPoLines = await tx.purchaseOrderLine.findMany({
      where: { purchaseOrderId: data.purchaseOrderId },
    });
    const allFulfilled = updatedPoLines.every((pl) => pl.quantityReceived >= pl.quantityOrdered);

    await tx.purchaseOrder.update({
      where: { id: data.purchaseOrderId },
      data: {
        status: allFulfilled ? PurchaseOrderStatus.FULFILLED : PurchaseOrderStatus.PARTIALLY_RECEIVED,
      },
    });

    return gr;
  });

  return receipt;
}

export async function getStockTransfers(branchId?: string) {
  const whereClause: any = {};
  if (branchId) {
    whereClause.OR = [
      { fromBranchId: branchId },
      { toBranchId: branchId },
    ];
  }

  return db.stockTransfer.findMany({
    where: whereClause,
    include: {
      material: true,
      fromBranch: true,
      toBranch: true,
      requestedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPurchaseOrders(branchId?: string) {
  const whereClause: any = {};
  if (branchId) {
    whereClause.branchId = branchId;
  }

  return db.purchaseOrder.findMany({
    where: whereClause,
    include: {
      supplier: true,
      branch: true,
      lines: {
        include: { material: true },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });
}

export async function getGoodsReceipts(branchId?: string) {
  const whereClause: any = {};
  if (branchId) {
    whereClause.branchId = branchId;
  }

  return db.goodsReceipt.findMany({
    where: whereClause,
    include: {
      branch: true,
      purchaseOrder: { include: { supplier: true } },
      receivedByUser: { select: { id: true, fullName: true } },
      lines: { include: { material: true } },
    },
    orderBy: { receivedAt: 'desc' },
  });
}

export async function getStockMovements(branchId?: string, limit = 50) {
  const whereClause: any = {};
  if (branchId) {
    whereClause.branchId = branchId;
  }

  return db.stockMovement.findMany({
    where: whereClause,
    include: {
      material: true,
      branch: true,
      performedByUser: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
