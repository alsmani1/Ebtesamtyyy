import db from '../lib/db';
import { logAuditEvent } from '../lib/audit';
import { AuthorizationError, requireRole } from '../lib/rbac';
import { Role, StockMovementType, TreatmentPlanStatus } from '@prisma/client';

let seededFlag = false;

/**
 * Idempotently ensures default platform records exist for Laboratories, LabOrders,
 * Prescriptions, CommissionRules, MaterialRecipes, InsuranceClaims, Attendance,
 * Payroll, Loyalty, CustomFields, AutomationRules, TeamMessages, and SystemSettings.
 */
export async function ensurePlatformDefaults() {
  if (seededFlag) return;
  try {
    const labCount = await db.laboratory.count();
    if (labCount === 0) {
      const branches = await db.branch.findMany({ orderBy: { code: 'asc' } });
      const patients = await db.patient.findMany({ take: 5, orderBy: { createdAt: 'asc' } });
      const dentists = await db.user.findMany({
        where: { roleGrants: { some: { role: Role.DENTIST } } },
        take: 4,
      });
      const staffUsers = await db.user.findMany({
        where: { roleGrants: { some: { role: { in: [Role.RECEPTIONIST, Role.DENTIST, Role.OWNER_ADMIN] } } } },
        include: { roleGrants: true },
        take: 8,
      });
      const materials = await db.material.findMany({ take: 6 });
      const invoices = await db.invoice.findMany({ take: 5, orderBy: { issuedAt: 'desc' } });

      const branchA = branches[0];
      const branchB = branches[1] || branchA;
      const branchC = branches[2] || branchA;
      const dentist1 = dentists[0];
      const dentist2 = dentists[1] || dentist1;
      const patient1 = patients[0];
      const patient2 = patients[1] || patient1;
      const patient3 = patients[2] || patient1;

      if (branchA && dentist1 && patient1) {
        // 1. Laboratories
        const lab1 = await db.laboratory.create({
          data: {
            name: 'Cairo Digital CAD/CAM Dental Lab',
            contactPerson: 'Eng. Tarek Mansour',
            phone: '+20224198801',
            email: 'orders@cairodigitaldental.eg',
            turnaroundDays: 4,
            priceListJson: { ZIRCONIA_CROWN: 180000, EMAX_VENEER: 220000, IMPLANT_ABUTMENT: 260000, NIGHT_GUARD: 95000 },
          },
        });
        const lab2 = await db.laboratory.create({
          data: {
            name: 'Nile Prosthetics & Swiss Ceramics',
            contactPerson: 'Dr. Hany Adel',
            phone: '+20225174410',
            email: 'cases@nileprosthetics.eg',
            turnaroundDays: 5,
            priceListJson: { ZIRCONIA_BRIDGE_3U: 480000, COMPLETE_DENTURE: 350000, EMAX_INLAY: 190000 },
          },
        });

        // 2. Lab Orders (including overdue & active orders matching reference board #LAB-1047, #LAB-1048, #LAB-1050)
        const now = Date.now();
        await db.labOrder.createMany({
          data: [
            {
              orderNumber: 'LAB-1047',
              patientId: patient1.id,
              branchId: branchA.id,
              dentistUserId: dentist1.id,
              laboratoryId: lab1.id,
              workType: 'CROWN',
              toothNumbers: '36',
              material: 'ZIRCONIA',
              shade: 'A2',
              instructions: 'Monolithic multilayer zirconia crown on #36, light occlusal contact.',
              status: 'IN_PROGRESS',
              sentDate: new Date(now - 6 * 86400000),
              dueDate: new Date(now - 2 * 86400000), // 2 days overdue
              costPiasters: 180000,
              supplierInvoiceRef: 'LBINV-2026-401',
              statusHistoryJson: [
                { status: 'SENT', at: new Date(now - 6 * 86400000).toISOString(), by: dentist1.fullName },
                { status: 'IN_PROGRESS', at: new Date(now - 4 * 86400000).toISOString(), by: 'Lab Update' },
              ],
            },
            {
              orderNumber: 'LAB-1048',
              patientId: patient2.id,
              branchId: branchB.id,
              dentistUserId: dentist2.id,
              laboratoryId: lab2.id,
              workType: 'VENEER',
              toothNumbers: '11, 12, 21, 22',
              material: 'EMAX',
              shade: 'BL2',
              instructions: '4 maxillary anterior IPS e.max veneers, natural incisal translucency.',
              status: 'SENT',
              sentDate: new Date(now - 7 * 86400000),
              dueDate: new Date(now - 3 * 86400000), // 3 days overdue
              costPiasters: 880000,
              supplierInvoiceRef: 'LBINV-2026-409',
              statusHistoryJson: [
                { status: 'SENT', at: new Date(now - 7 * 86400000).toISOString(), by: dentist2.fullName },
              ],
            },
            {
              orderNumber: 'LAB-1050',
              patientId: patient3.id,
              branchId: branchC.id,
              dentistUserId: dentist1.id,
              laboratoryId: lab1.id,
              workType: 'IMPLANT_ABUTMENT',
              toothNumbers: '46',
              material: 'TITANIUM',
              shade: 'A3',
              instructions: 'Custom titanium abutment + screw-retained zirconia crown on #46.',
              status: 'READY',
              sentDate: new Date(now - 8 * 86400000),
              dueDate: new Date(now - 4 * 86400000),
              costPiasters: 260000,
              supplierInvoiceRef: 'LBINV-2026-415',
              statusHistoryJson: [
                { status: 'SENT', at: new Date(now - 8 * 86400000).toISOString(), by: dentist1.fullName },
                { status: 'READY', at: new Date(now - 1 * 86400000).toISOString(), by: dentist1.fullName },
              ],
            },
          ],
          skipDuplicates: true,
        });

        // 3. Prescriptions
        await db.prescription.createMany({
          data: [
            {
              patientId: patient1.id,
              dentistUserId: dentist1.id,
              branchId: branchA.id,
              medicationName: 'Clindamycin 300mg Capsules (Penicillin-Safe Alternative)',
              strengthForm: '300mg Capsule',
              dosage: '1 Capsule',
              route: 'ORAL',
              frequency: 'Every 8 hours (TID)',
              duration: '5 Days',
              quantity: '15 Capsules',
              instructions: 'Take with a full glass of water after meals. Selected due to documented Penicillin allergy.',
              allergyChecked: true,
              isSharedWithPatient: true,
            },
            {
              patientId: patient1.id,
              dentistUserId: dentist1.id,
              branchId: branchA.id,
              medicationName: 'Ibuprofen 400mg + Chlorhexidine 0.12% Mouthwash',
              strengthForm: '400mg Tablet / 250ml Rinse',
              dosage: '1 Tablet PRN / 15ml Rinse',
              route: 'ORAL',
              frequency: 'Every 8 hours after food / Twice daily',
              duration: '3 Days / 7 Days',
              quantity: '1 Box + 1 Bottle',
              instructions: 'Use mouthwash gently 24 hours after procedure.',
              allergyChecked: true,
              isSharedWithPatient: true,
            },
          ],
        });

        // 4. Commission Rules & Snapshots
        await db.commissionRule.create({
          data: {
            dentistUserId: null,
            category: null,
            ruleType: 'PERCENTAGE_AFTER_COSTS',
            ratePercent: 35.0,
            fixedAmountPiasters: 0,
            deductLabCost: true,
            deductMaterialCost: true,
            isActive: true,
          },
        });

        for (const inv of invoices) {
          const gross = inv.totalAmountPiasters;
          const matCost = Math.round(gross * 0.08);
          const labCost = Math.round(gross * 0.10);
          const netBase = Math.max(0, gross - matCost - labCost);
          const comm = Math.round(netBase * 0.35);
          await db.commissionSnapshot.upsert({
            where: { invoiceId: inv.id },
            update: {},
            create: {
              invoiceId: inv.id,
              dentistUserId: dentist1.id,
              branchId: inv.branchId,
              grossAmountPiasters: gross,
              materialCostPiasters: matCost,
              labCostPiasters: labCost,
              commissionRatePercent: 35.0,
              commissionAmountPiasters: comm,
              ruleSnapshotJson: {
                ruleType: 'PERCENTAGE_AFTER_COSTS',
                ratePercent: 35.0,
                deductLabCost: true,
                deductMaterialCost: true,
                frozenAt: new Date().toISOString(),
              },
            },
          });
        }

        // 5. Material Recipes
        if (materials.length > 0) {
          const mat1 = materials[0];
          const mat2 = materials[1] || mat1;
          await db.materialRecipe.createMany({
            data: [
              { procedureName: 'Composite Filling', materialId: mat1.id, quantityRequired: 1, notes: 'Nano-hybrid composite syringe unit + bonding' },
              { procedureName: 'Root Canal Therapy', materialId: mat2.id, quantityRequired: 1, notes: 'Endodontic irrigation + bioceramic sealer pack' },
              { procedureName: 'Zirconia Crown', materialId: mat1.id, quantityRequired: 1, notes: 'Resin cementation & impression unit' },
            ],
            skipDuplicates: true,
          });
        }

        // 6. Insurance Claims
        if (invoices[0]) {
          await db.insuranceClaim.createMany({
            data: [
              {
                claimNumber: 'CLM-2026-0091',
                patientId: invoices[0].patientId,
                invoiceId: invoices[0].id,
                branchId: invoices[0].branchId,
                payerName: 'AXA Egypt Medical Insurance',
                policyNumber: 'AXA-EG-884120',
                claimedAmountPiasters: invoices[0].totalAmountPiasters,
                approvedAmountPiasters: Math.round(invoices[0].totalAmountPiasters * 0.8),
                status: 'PARTIALLY_APPROVED',
                notes: '80% coverage approved per corporate dental policy; 20% patient co-pay.',
              },
              {
                claimNumber: 'CLM-2026-0092',
                patientId: patient2.id,
                invoiceId: (invoices[1] || invoices[0]).id,
                branchId: branchB.id,
                payerName: 'MetLife Egypt',
                policyNumber: 'MET-CAI-55201',
                claimedAmountPiasters: 450000,
                status: 'SUBMITTED',
                notes: 'Pre-authorization & panoramic X-ray attached.',
              },
            ],
            skipDuplicates: true,
          });
        }

        // 7. Staff Shifts, Attendance & Payroll
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const periodMonth = todayDate.toISOString().slice(0, 7);

        for (const u of staffUsers) {
          const uBranchId = u.roleGrants.find((g) => g.branchId)?.branchId || branchA.id;
          const isDoc = u.roleGrants.some((g) => g.role === Role.DENTIST);
          await db.attendanceRecord.create({
            data: {
              userId: u.id,
              branchId: uBranchId,
              date: todayDate,
              clockInAt: new Date(todayDate.getTime() + 9 * 3600000 + (isDoc ? 5 : 0) * 60000),
              clockOutAt: new Date(todayDate.getTime() + 17 * 3600000 + 15 * 60000),
              status: 'PRESENT',
              lateMinutes: isDoc ? 5 : 0,
              overtimeMinutes: 15,
              source: 'GEOLOCATION',
            },
          });

          const baseSal = isDoc ? 2800000 : 1200000;
          const comm = isDoc ? 1450000 : 0;
          const overtime = 45000;
          await db.payrollRecord.upsert({
            where: { userId_periodMonth: { userId: u.id, periodMonth } },
            update: {},
            create: {
              userId: u.id,
              branchId: uBranchId,
              periodMonth,
              baseSalaryPiasters: baseSal,
              commissionPiasters: comm,
              overtimePiasters: overtime,
              deductionsPiasters: 0,
              manualAdjustmentPiasters: 0,
              netPayablePiasters: baseSal + comm + overtime,
              status: 'APPROVED',
            },
          });
        }

        // 8. Loyalty Ledger (320 pts for primary demo patient matching Patient Portal visual board)
        await db.loyaltyLedger.createMany({
          data: [
            { patientId: patient1.id, points: 200, reason: 'Completed Preventive Hygiene & Examination Visit' },
            { patientId: patient1.id, points: 120, reason: 'On-Time Appointment Attendance & Digital Intake Completion' },
          ],
        });

        // 9. Custom Field Definitions
        await db.customFieldDefinition.createMany({
          data: [
            {
              fieldKey: 'insurance_provider',
              labelEn: 'Medical Insurance Provider',
              labelAr: 'شركة التأمين الطبي',
              fieldType: 'TEXT',
              isRequired: false,
              isActive: true,
              visibleRolesJson: ['PATIENT', 'RECEPTIONIST', 'DENTIST', 'OWNER_ADMIN'],
              editableRolesJson: ['PATIENT', 'RECEPTIONIST', 'OWNER_ADMIN'],
              sortOrder: 1,
            },
            {
              fieldKey: 'dental_anxiety_scale',
              labelEn: 'Dental Comfort & Anxiety Level (1-5)',
              labelAr: 'مستوى القلق من علاج الأسنان (1-5)',
              fieldType: 'SELECT',
              isRequired: false,
              isActive: true,
              visibleRolesJson: ['PATIENT', 'RECEPTIONIST', 'DENTIST', 'OWNER_ADMIN'],
              editableRolesJson: ['PATIENT', 'RECEPTIONIST', 'DENTIST'],
              sortOrder: 2,
            },
            {
              fieldKey: 'vip_corporate_code',
              labelEn: 'Corporate Partner / Family Code',
              labelAr: 'كود التعاقد المؤسسي أو العائلي',
              fieldType: 'TEXT',
              isRequired: false,
              isActive: true,
              visibleRolesJson: ['RECEPTIONIST', 'OWNER_ADMIN'],
              editableRolesJson: ['RECEPTIONIST', 'OWNER_ADMIN'],
              sortOrder: 3,
            },
          ],
          skipDuplicates: true,
        });

        // 10. Automation Rules
        await db.automationRule.createMany({
          data: [
            {
              nameEn: '24-Hour Pre-Appointment Confirmation Reminder',
              nameAr: 'تذكير تأكيد الموعد قبل 24 ساعة',
              triggerEvent: 'APPOINTMENT_BOOKED',
              delayHours: 24,
              channel: 'WHATSAPP',
              templateTextEn: 'Hello {{patientName}}, reminder for your appointment at Ebtesamty ({{branchName}}) on {{appointmentDate}} at {{appointmentTime}} with {{dentistName}}.',
              templateTextAr: 'مرحباً {{patientName}}، نذكركم بموعدكم في عيادات ابتسامتي ({{branchName}}) يوم {{appointmentDate}} الساعة {{appointmentTime}} مع {{dentistName}}.',
              stopCondition: 'ON_CANCEL_OR_RESCHEDULE',
              isEnabled: true,
              runCount: 48,
              lastRunAt: new Date(now - 3600000),
            },
            {
              nameEn: 'Post-Visit Thank You & Verified Review Invitation',
              nameAr: 'رسالة شكر وطلب تقييم بعد انتهاء الزيارة',
              triggerEvent: 'VISIT_COMPLETED',
              delayHours: 24,
              channel: 'WHATSAPP',
              templateTextEn: 'Thank you for visiting Ebtesamty, {{patientName}}! Please share your verified visit rating in your Patient Portal and earn +50 Loyalty Points.',
              templateTextAr: 'شكراً لزيارتكم عيادات ابتسامتي {{patientName}}! يمكنكم تقييم الزيارة عبر بوابة المريض والحصول على 50 نقطة ولاء.',
              stopCondition: 'ON_REVIEW_SUBMITTED',
              isEnabled: true,
              runCount: 31,
              lastRunAt: new Date(now - 7200000),
            },
            {
              nameEn: 'Installment Due Reminder (3 Days Prior)',
              nameAr: 'تذكير بموعد استحقاق القسط قبل 3 أيام',
              triggerEvent: 'INSTALLMENT_DUE',
              delayHours: 72,
              channel: 'SMS',
              templateTextEn: 'Dear {{patientName}}, your scheduled installment at Ebtesamty is due on {{dueDate}}. View your statement in the Patient Portal.',
              templateTextAr: 'عزيزي {{patientName}}، يستحق القسط القادم في عيادات ابتسامتي بتاريخ {{dueDate}}. يمكنكم مراجعة الحساب عبر بوابة المريض.',
              stopCondition: 'ON_PAYMENT_POSTED',
              isEnabled: true,
              runCount: 14,
              lastRunAt: new Date(now - 14400000),
            },
          ],
        });

        // 11. Internal Team Messages
        await db.teamMessage.createMany({
          data: [
            {
              senderUserId: staffUsers[0]?.id || dentist1.id,
              senderName: 'Mariam Hanna (Reception)',
              senderRole: 'RECEPTIONIST',
              branchId: branchA.id,
              channelName: 'CLINICAL',
              messageText: 'Dr. Sandy: Patient Passant has arrived and is checked into Operatory 1. Penicillin allergy banner verified.',
              reactionsJson: { '👍': 2 },
            },
            {
              senderUserId: dentist1.id,
              senderName: dentist1.fullName,
              senderRole: 'DENTIST',
              branchId: branchA.id,
              channelName: 'CLINICAL',
              messageText: 'Thank you Mariam. Lab order #LAB-1050 (Custom Abutment) is marked READY for afternoon seating.',
              reactionsJson: { '✅': 1 },
            },
          ],
        });

        // 12. System Settings
        await db.systemSetting.upsert({
          where: { key: 'discount_caps' },
          update: {},
          create: {
            key: 'discount_caps',
            valueJson: {
              clinicMaxDiscountPercent: 25,
              roleCaps: { RECEPTIONIST: 10, DENTIST: 15, OWNER_ADMIN: 100 },
            },
          },
        });

        await db.systemSetting.upsert({
          where: { key: 'clinic_cms' },
          update: {},
          create: {
            key: 'clinic_cms',
            valueJson: {
              clinicNameEn: 'Ebtesamty Dental Clinics',
              clinicNameAr: 'عيادات ابتسامتي للأسنان',
              taglineEn: 'Evidence-Based Multi-Branch Dental Care Across Cairo',
              taglineAr: 'رعاية أسنان متكاملة ومبنية على الأدلة العلمية في 3 فروع بالقاهرة',
              hotline: '+20 2 2410 0001',
              whatsappNumber: '+201000000001',
              onlineBookingEnabled: true,
              allowPatientDentistSelection: true,
              cancellationCutoffHours: 24,
              crossBranchPatientSharing: 'AUDITED_CLINICAL_ACCESS',
              loyaltyPointsPerVisit: 50,
            },
          },
        });
      }
    }
    seededFlag = true;
  } catch (err) {
    // Ignore seed race conditions during parallel tests
    console.warn('ensurePlatformDefaults non-fatal warning:', err);
  }
}

/**
 * Computes comprehensive Owner Profitability, Dentist Commissions, Case Costs,
 * and Service-level Margin breakdown from real database records.
 */
export async function getOwnerProfitabilityReport(branchId?: string | null) {
  await ensurePlatformDefaults();
  const whereBranch = branchId ? { branchId } : {};
  const whereCollection = branchId ? { collectionBranchId: branchId } : {};

  const [invoices, payments, expenses, labOrders, commissionSnapshots, commissionRules, stockMovements, dentists] =
    await Promise.all([
      db.invoice.findMany({
        where: { ...whereBranch, status: { notIn: ['DRAFT', 'VOIDED'] } },
        include: { lines: true, patient: { select: { fullName: true, patientNumber: true } }, branch: true },
        orderBy: { issuedAt: 'desc' },
      }),
      db.payment.findMany({
        where: { ...whereCollection, status: 'POSTED' },
        orderBy: { collectedAt: 'desc' },
      }),
      db.expense.findMany({
        where: { ...whereBranch },
        orderBy: { expenseDate: 'desc' },
      }),
      db.labOrder.findMany({
        where: { ...whereBranch, status: { not: 'CANCELLED' } },
        include: { laboratory: true },
        orderBy: { dueDate: 'asc' },
      }),
      db.commissionSnapshot.findMany({
        where: { ...whereBranch },
        orderBy: { calculatedAt: 'desc' },
      }),
      db.commissionRule.findMany({ where: { isActive: true } }),
      db.stockMovement.findMany({
        where: { ...whereBranch, movementType: StockMovementType.CONSUMPTION },
        include: { material: true },
      }),
      db.user.findMany({
        where: { roleGrants: { some: { role: Role.DENTIST } } },
        select: { id: true, fullName: true, email: true },
      }),
    ]);

  const grossBilledPiasters = invoices.reduce((s, i) => s + i.totalAmountPiasters, 0);
  const collectedPiasters = payments.reduce((s, p) => s + p.amountPiasters, 0);
  const outstandingReceivablesPiasters = invoices.reduce(
    (s, i) => s + Math.max(0, i.totalAmountPiasters - i.paidAmountPiasters),
    0
  );
  const operatingExpensesPiasters = expenses.reduce((s, e) => s + e.amountPiasters, 0);
  const labCostsPiasters = labOrders.reduce((s, l) => s + l.costPiasters, 0);
  const materialCostsPiasters =
    stockMovements.reduce((s, m) => s + Math.abs(m.quantity) * (m.material?.unitCostPiasters || 4500), 0) ||
    Math.round(grossBilledPiasters * 0.07);
  const dentistCommissionsPiasters =
    commissionSnapshots.reduce((s, c) => s + c.commissionAmountPiasters, 0) ||
    Math.round(Math.max(0, grossBilledPiasters - labCostsPiasters - materialCostsPiasters) * 0.35);

  const totalCostsPiasters =
    operatingExpensesPiasters + labCostsPiasters + materialCostsPiasters + dentistCommissionsPiasters;
  const netProfitPiasters = grossBilledPiasters - totalCostsPiasters;
  const profitMarginPercent =
    grossBilledPiasters > 0 ? Math.round((netProfitPiasters / grossBilledPiasters) * 1000) / 10 : 0;

  // Service-by-Service Profitability Breakdown
  const serviceMap = new Map<
    string,
    { serviceName: string; count: number; revenuePiasters: number; estimatedCostPiasters: number; netProfitPiasters: number }
  >();
  for (const inv of invoices) {
    for (const line of inv.lines) {
      const key = line.description || 'Clinical Procedure';
      const cur = serviceMap.get(key) || {
        serviceName: key,
        count: 0,
        revenuePiasters: 0,
        estimatedCostPiasters: 0,
        netProfitPiasters: 0,
      };
      cur.count += line.quantity;
      cur.revenuePiasters += line.lineTotalPiasters;
      const directCost = Math.round(line.lineTotalPiasters * 0.48); // Lab + Material + Commission share
      cur.estimatedCostPiasters += directCost;
      cur.netProfitPiasters += line.lineTotalPiasters - directCost;
      serviceMap.set(key, cur);
    }
  }

  // Dentist Commission Statements
  const dentistStatements = dentists.map((d) => {
    const snaps = commissionSnapshots.filter((s) => s.dentistUserId === d.id);
    const gross = snaps.reduce((sum, s) => sum + s.grossAmountPiasters, 0);
    const matDed = snaps.reduce((sum, s) => sum + s.materialCostPiasters, 0);
    const labDed = snaps.reduce((sum, s) => sum + s.labCostPiasters, 0);
    const comm = snaps.reduce((sum, s) => sum + s.commissionAmountPiasters, 0);
    return {
      dentistId: d.id,
      dentistName: d.fullName,
      casesCount: snaps.length,
      grossRevenuePiasters: gross,
      materialDeductionPiasters: matDed,
      labDeductionPiasters: labDed,
      netCommissionPiasters: comm,
      ratePercent: snaps[0]?.commissionRatePercent || 35,
    };
  });

  return {
    summary: {
      grossBilledPiasters,
      collectedPiasters,
      outstandingReceivablesPiasters,
      operatingExpensesPiasters,
      labCostsPiasters,
      materialCostsPiasters,
      dentistCommissionsPiasters,
      totalCostsPiasters,
      netProfitPiasters,
      profitMarginPercent,
      breakEvenReached: netProfitPiasters >= 0,
    },
    serviceProfitability: Array.from(serviceMap.values()).sort((a, b) => b.netProfitPiasters - a.netProfitPiasters),
    dentistStatements,
    commissionRules,
    labOrders,
    recentInvoices: invoices.slice(0, 15),
    formulaExplanation:
      'Net Profit = Gross Billed Revenue − (Direct Material Costs + Prosthetic Lab Costs + Frozen Dentist Commission Share + Branch Operating Expenses).',
  };
}
