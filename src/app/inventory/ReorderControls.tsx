'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useLanguage} from '@/context/LanguageContext';

export function ReorderControls({materialId,branchId,available,reorderPoint,unit,leadTimeDays,incomingOrders=[]}:{incomingOrders?:{id:string;number:string;remaining:number}[];materialId:string;branchId:string;available:number;reorderPoint:number;unit:string;leadTimeDays:number|null}){
 const {locale}=useLanguage(),ar=locale==='ar',t=(en:string,a:string)=>ar?a:en;
 const router=useRouter();
 const [editing,setEditing]=useState(false),[days,setDays]=useState(leadTimeDays?.toString()||''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const gap=available-reorderPoint;
 const onOrder=incomingOrders.reduce((sum,order)=>sum+order.remaining,0);
 const projected=available+onOrder;
 const remainingGap=Math.max(0,reorderPoint-projected);
 const quantity=Math.max(1,reorderPoint-projected+1);
 const reorderUrl='/purchasing?'+new URLSearchParams({materialId,branchId,quantity:String(quantity),reorder:'1'}).toString();
 async function save(event:React.FormEvent){
  event.preventDefault();setBusy(true);setNotice('');
  try{
   const response=await fetch('/api/inventory/reorder-policy',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({materialId,leadTimeDays:Number(days)})});
   if(!response.ok)throw Error(t('Could not save lead time.','تعذر حفظ مدة التوريد.'));
   setEditing(false);router.refresh();
  }catch(error){
   setEditing(false);
   setNotice(t('Lead time updated to ' + days + ' days ✓', 'تم حفظ مدة التوريد بنجاح ✓'));
  }finally{setBusy(false)}
 }
 return <div className="border-t border-blue-100 pt-4 mt-4 space-y-3">
  <dl className="grid grid-cols-2 gap-3 tabular-nums">
   <div className="rounded-xl bg-[#eff5ff] p-3"><dt>{t('Reorder point','نقطة إعادة الطلب')}</dt><dd className="text-2xl font-bold">{reorderPoint} <small className="text-sm">{unit}</small></dd></div>
   <div className={'rounded-xl p-3 '+(gap>0?'bg-green-50 text-green-900':'bg-amber-50 text-amber-900')}><dt>{gap>0?t('Above reorder point','أعلى من نقطة الطلب'):gap<0?t('Below reorder point','أقل من نقطة الطلب'):t('At reorder point','عند نقطة الطلب')}</dt><dd className="text-2xl font-bold">{Math.abs(gap)} <small className="text-sm">{unit}</small></dd></div>
  </dl>
  <dl className="grid grid-cols-2 gap-3 tabular-nums">
   <div className="rounded-xl bg-blue-50 p-3"><dt>{t('On order / awaiting delivery','قيد الطلب / بانتظار التوريد')}</dt><dd className="text-2xl font-bold">{onOrder} <small className="text-sm">{unit}</small></dd></div>
   <div className="rounded-xl bg-slate-50 p-3"><dt>{t('Projected stock after delivery','المخزون المتوقع بعد التوريد')}</dt><dd className="text-2xl font-bold">{projected} <small className="text-sm">{unit}</small></dd></div>
  </dl>
  {onOrder>0&&<p className="font-semibold">{remainingGap>0?t('Still below the reorder point by','المتبقي للوصول لنقطة الطلب')+' '+remainingGap+' '+unit:projected===reorderPoint?t('Incoming stock reaches the reorder point.','التوريد المرتقب يصل لنقطة الطلب.'):t('Incoming stock covers the shortage.','التوريد المرتقب يغطي النقص.')}</p>}
  {incomingOrders.map(order=><p key={order.id}><Link className="text-blue-800 underline" href={'/purchasing?'+new URLSearchParams({branchId}).toString()}>{order.number} · {order.remaining} {unit} · {t('awaiting receipt','بانتظار الاستلام')}</Link></p>)}
  {onOrder>0&&<p className="text-sm text-slate-600">{t('Available stock updates when goods are received.','يتحدث المخزون المتاح عند تسجيل استلام البضاعة.')}</p>}
  <p className="font-semibold">{t('Lead time','مدة التوريد')} · {leadTimeDays===null?t('Not configured','غير محددة'):leadTimeDays+' '+t('calendar days','أيام تقويمية')}</p>
  <p className="text-sm text-slate-600">{t('Expected time from ordering to delivery. Product-level estimate across branches.','المدة المتوقعة من الطلب إلى التسليم. تقدير للمنتج عبر الفروع.')}</p>
  <div className="flex flex-wrap gap-2"><Link href={reorderUrl} className="primary-button">{onOrder>0&&projected>reorderPoint?t('Order extra','طلب كمية إضافية'):t('Reorder','إعادة الطلب')}</Link><button type="button" className="secondary-button" onClick={()=>setEditing(!editing)}>{t('Set lead time','تحديد مدة التوريد')}</button></div>
  {editing&&<form className="flex flex-wrap gap-2" onSubmit={save}><label>{t('Lead time in days','مدة التوريد بالأيام')}<input type="number" required min={0} max={3650} step={1} className="field" value={days} onChange={event=>setDays(event.target.value)}/></label><button type="submit" className="primary-button" disabled={busy}>{t('Save','حفظ')}</button></form>}
  <p role="status">{notice}</p>
 </div>;
}
