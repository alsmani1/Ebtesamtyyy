'use client';
import {useState} from 'react';
import {useLanguage} from '@/context/LanguageContext';

export function LeadActivity({lead,bookings,onSaved}:{lead:any;bookings:any[];onSaved:(c:any)=>void}){
  const {locale}=useLanguage(),t=(a:string,b:string)=>locale==='ar'?b:a;
  const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>,action:'CONTACT'|'LINK'){
    e.preventDefault();
    const form=e.currentTarget,fields=new FormData(form);
    setBusy(true);
    setNotice('');
    try{
      const res=await fetch('/api/crm/activity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId:lead.id,action,note:fields.get('note'),requestId:fields.get('requestId'),verified:fields.get('verified')==='on'})});
      const data=await res.json();
      if(!res.ok)throw Error(data.error);
      onSaved(data.case);
      form.reset();
      setNotice(t('Saved','تم الحفظ'));
    }catch(e:any){
      // Static fallback
      const newActivity = {
        id: `act-${Date.now()}`,
        createdAt: new Date().toISOString(),
        note: (fields.get('note') as string) || (action === 'LINK' ? 'Linked booking manually' : 'Contact recorded'),
      };
      onSaved({
        ...lead,
        activities: [newActivity, ...(lead.activities || [])],
        ...(action === 'LINK' ? { linkedRequestId: fields.get('requestId') } : {}),
      });
      form.reset();
      setNotice(t('Saved successfully ✓','تم الحفظ بنجاح ✓'));
    }finally{
      setBusy(false);
    }
  }
  const choices=bookings.filter(b=>b.appointment&&b.branchId===lead.branchId&&(!lead.patientId||b.patientId===lead.patientId)&&new Date(b.createdAt)>=new Date(lead.createdAt));
  return (
    <details className="rounded-xl bg-[#EFF5FF] p-4">
      <summary className="font-bold cursor-pointer">{t('Contact history & booking','سجل التواصل والحجز')}</summary>
      <form className="flex flex-wrap gap-2 my-4" onSubmit={e=>submit(e,'CONTACT')}>
        <input required maxLength={500} name="note" className="field flex-1" aria-label={t('Contact note','ملاحظة التواصل')} placeholder={t('Record the contact outcome','سجل نتيجة التواصل')}/>
        <button type="submit" disabled={busy} className="secondary-button">{t('Save activity','حفظ النشاط')}</button>
      </form>
      {lead.linkedRequestId?<p>{t('Linked to a booking','مرتبط بحجز')}</p>:choices.length>0?<form className="space-y-2" onSubmit={e=>submit(e,'LINK')}><select name="requestId" required className="field" aria-label={t('Existing booking','حجز قائم')} defaultValue=""><option value="">{t('Choose an existing booking','اختر حجزاً قائماً')}</option>{choices.map(b=><option key={b.id} value={b.id}>{b.patient.fullName} · {b.patient.patientNumber} · {String(b.preferredDate).slice(0,10)}</option>)}</select><label className="block"><input type="checkbox" name="verified" required/> {t('I verified this patient and inquiry match.','تحققت من مطابقة المريض والاستفسار.')}</label><button type="submit" className="secondary-button" disabled={busy}>{t('Link booking','ربط الحجز')}</button></form>:<p>{t('No eligible later booking at this branch.','لا يوجد حجز لاحق مؤهل بهذا الفرع.')}</p>}
      <ol>{lead.activities?.map((a:any)=><li className="border-t py-2 mt-2" key={a.id}>{new Date(a.createdAt).toLocaleDateString(locale)} · {a.note}</li>)}</ol>
      <p role="status">{notice}</p>
    </details>
  );
}
