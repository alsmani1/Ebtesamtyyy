'use client';
import {useState} from 'react';
import {ReceptionBooking} from '@/components/ReceptionBooking';
import {useLanguage} from '@/context/LanguageContext';
import {useRouter} from 'next/navigation';
export function FrontDeskBook({branches}:{branches:{id:string;code:string;name:string}[]}){const [open,setOpen]=useState(false);const r=useRouter();const {locale}=useLanguage();return <><button className="primary-button" onClick={()=>setOpen(true)}>{locale==='ar'?'حجز موعد':'Book appointment'}</button>{open&&<ReceptionBooking branches={branches} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false);r.refresh()}}/>}</>}
