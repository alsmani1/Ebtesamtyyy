import {InsightChart} from './InsightChart';
import db from '@/lib/db';
import { cairoDate } from '@/lib/scheduling-rules';

type Props = {view:string; branchId?:string; period:{gte:Date;lt:Date}; dates:{gte:Date;lt:Date}; ar:boolean};
const Bars = InsightChart;
export async function OwnerCharts({view,branchId,period,dates,ar}:Props) {
  const t=(en:string,arabic:string)=>ar?arabic:en;
  const empty=t('No records in this period.','لا توجد سجلات في هذه الفترة.');
  if(view==='crm') {
    const leads=await db.feedbackCase.findMany({where:{branchId,createdAt:period,category:'INQUIRY'},select:{sourceChannel:true,linkedRequest:{select:{appointment:{select:{status:true}}}},_count:{select:{activities:true}}}});
    const sources=new Map<string,number>();
    for(const lead of leads){const source=lead.sourceChannel||t('Unattributed','غير محدد');sources.set(source,(sources.get(source)||0)+1);}
    return <div className="grid md:grid-cols-2 gap-5"><Bars mode="donut" title={t('Inquiries by source (Donut)','الاستفسارات حسب المصدر')} empty={empty} rows={Array.from(sources,([label,value])=>({label,value}))}/>
      <Bars mode="line" title={t('Inquiry progression curve','منحنى تطور الاستفسارات')} empty={empty} rows={[{label:t('Inquiries received','الاستفسارات الواردة'),value:leads.length},{label:t('Activity recorded','سُجل نشاط'),value:leads.filter(l=>l._count.activities).length},{label:t('Linked appointments','المواعيد المرتبطة'),value:leads.filter(l=>l.linkedRequest?.appointment).length},{label:t('Completed appointments','المواعيد المكتملة'),value:leads.filter(l=>l.linkedRequest?.appointment?.status==='COMPLETED').length}]}/></div>;
  }
  if(view==='inventory') {
    const [lots,movements]=await Promise.all([db.stockLot.groupBy({by:['branchId'],where:{branchId,quantityOnHand:{gt:0}},_count:true}),db.stockMovement.findMany({where:{branchId,createdAt:period},select:{createdAt:true}})]);
    const branches=await db.branch.findMany({where:{id:branchId},select:{id:true,code:true}});
    return <div className="grid md:grid-cols-2 gap-5"><Bars mode="donut" title={t('Stock lots by branch (Donut)','دفعات المخزون حسب الفرع')} empty={empty} rows={branches.map(b=>({label:b.code,value:lots.find(l=>l.branchId===b.id)?._count||0}))}/><Bars mode="line" title={t('Stock movements trajectory curve','منحنى حركات المخزون')} empty={empty} rows={Array.from(new Set(movements.map(m=>cairoDate(m.createdAt)))).sort().map((label: string)=>({label,value:movements.filter(m=>cairoDate(m.createdAt)===label).length}))}/></div>;
  }
  if(view==='finance'){
    const [invoices,collections,costs]=await Promise.all([
      db.invoice.aggregate({where:{branchId,issuedAt:period,status:{notIn:['DRAFT','VOIDED']}},_sum:{totalAmountPiasters:true,paidAmountPiasters:true}}),
      db.payment.aggregate({where:{collectionBranchId:branchId,collectedAt:period,status:'POSTED'},_sum:{amountPiasters:true}}),
      db.expense.groupBy({by:['category'],where:{branchId,expenseDate:period},_sum:{amountPiasters:true}})
    ]);
    return <div className="grid md:grid-cols-2 gap-5"><Bars mode="bar" title={t('Financial amounts (EGP)','منحنى المبالغ المالية (ج.م)')} empty={empty} rows={[
      {label:t('Invoices issued in period','فواتير الفترة'),value:(invoices._sum.totalAmountPiasters||0)/100},
      {label:t('Collections posted in period','تحصيل الفترة'),value:(collections._sum.amountPiasters||0)/100},
      {label:t('Remaining on period invoices','المتبقي على فواتير الفترة'),value:((invoices._sum.totalAmountPiasters||0)-(invoices._sum.paidAmountPiasters||0))/100}
    ]}/><Bars mode="donut" title={t('Recorded expenses by category (EGP)','المصروفات المسجلة حسب الفئة (ج.م)')} empty={empty} rows={costs.map(c=>({label:c.category,value:(c._sum.amountPiasters||0)/100}))}/></div>;
  }
  const patients = view==='reports'?await db.patient.findMany({where:{primaryBranchId:branchId,createdAt:period},select:{createdAt:true}}):[];
  const procedures = view==='reports'?await db.treatmentPlanItem.groupBy({by:['procedureName'],where:{status:'PERFORMED',performedAt:period,treatmentPlan:{branchId}},_count:true}):[];
  const [payments,appointments]=await Promise.all([db.payment.findMany({where:{collectionBranchId:branchId,collectedAt:period,status:'POSTED'},select:{collectedAt:true,amountPiasters:true}}),db.appointment.findMany({where:{branchId,appointmentDate:dates},select:{status:true,appointmentDate:true}})]);
  const totals=new Map<string,number>(),visits=new Map<string,number>();
  for(const p of payments){const day=cairoDate(p.collectedAt);totals.set(day,(totals.get(day)||0)+p.amountPiasters);}
  for(const a of appointments){const day=a.appointmentDate.toISOString().slice(0,10);visits.set(day,(visits.get(day)||0)+1);}
  const days=Array.from(new Set([...totals.keys(),...visits.keys()])).sort();
  return <>{view==='reports'&&<div className="grid md:grid-cols-2 gap-5"><Bars mode="line" title={t('New patient registrations','تسجيل المرضى الجدد')} empty={empty} rows={Array.from(new Set(patients.map(p=>cairoDate(p.createdAt)))).sort().map((label: string)=>({label,value:patients.filter(p=>cairoDate(p.createdAt)===label).length}))}/><Bars title={t('Recorded completed procedures','الإجراءات المكتملة المسجلة')} empty={empty} rows={procedures.map(p=>({label:p.procedureName,value:p._count}))}/></div>}<div className="grid md:grid-cols-2 gap-5"><Bars mode="line" title={t('Daily posted collections (EGP)','التحصيل اليومي المسجل (ج.م)')} empty={empty} rows={days.map(label=>({label,value:(totals.get(label)||0)/100}))}/><Bars mode="donut" title={t('Appointments by scheduled day','المواعيد حسب اليوم')} empty={empty} rows={days.map(label=>({label,value:visits.get(label)||0}))}/></div>
  {view==='reports'&&<section className="surface-card"><h2>{t('Daily performance report','تقرير الأداء اليومي')}</h2><table className="workflow-table"><thead><tr>{[t('Date','التاريخ'),t('Appointments','المواعيد'),t('Completed','مكتمل'),t('Collections (EGP)','التحصيل (ج.م)')].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{days.map(day=><tr key={day}><td>{day}</td><td>{visits.get(day)||0}</td><td>{appointments.filter(a=>a.appointmentDate.toISOString().startsWith(day)&&a.status==='COMPLETED').length}</td><td>{((totals.get(day)||0)/100).toFixed(2)}</td></tr>)}</tbody></table>{!days.length&&<p>{empty}</p>}</section>}</>;
}
