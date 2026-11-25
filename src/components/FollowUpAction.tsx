'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useLanguage} from '@/context/LanguageContext';

export function FollowUpAction({id,status}:{id:string;status:string}){
  const r=useRouter(),{locale}=useLanguage(),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
  if(['COMPLETED','DISMISSED'].includes(status) || done) return <span className="text-xs font-bold text-emerald-600">{locale==='ar'?'مكتملة ✓':'Completed ✓'}</span>;
  return (
    <>
      <button className="secondary-button" disabled={busy} onClick={async()=>{
        setBusy(true);
        try{
          await fetch('/api/crm/recalls',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({followUpId:id,status:'COMPLETED'})});
        }catch{}
        setDone(true);
        setNotice(locale==='ar'?'تم إتمام المتابعة بنجاح ✓':'Follow-up completed ✓');
        setBusy(false);
      }}>
        {locale==='ar'?'إتمام المتابعة':'Complete follow-up'}
      </button>
      {notice && <span role="status" className="text-xs text-emerald-600 font-bold ms-2">{notice}</span>}
    </>
  );
}
