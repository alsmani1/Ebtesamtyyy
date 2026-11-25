'use client';
import {useLanguage} from '@/context/LanguageContext';
export function DemoDataBanner({start,end}:{start?:string;end?:string}){
 const {locale}=useLanguage();
 return <div className="bg-[#102A5E] text-white text-center px-4 py-2 text-xs">{locale==='ar'?'بيانات عرض خيالية — ليست سجلات مرضى حقيقية':'Fictional demonstration data — not real patient records'} · <bdi>{start} → {end} · Africa/Cairo</bdi></div>;
}
