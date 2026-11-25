'use client';
import {useLanguage} from '@/context/LanguageContext';
export function LocalizedDate({value,time=false}:{value:Date|string|null|undefined;time?:boolean}){const {locale}=useLanguage();if(!value)return <>—</>;const date=new Date(value);if(!Number.isFinite(+date))return <>—</>;return <>{new Intl.DateTimeFormat(locale==='ar'?'ar-EG':'en-GB',{timeZone:'Africa/Cairo',dateStyle:'medium',...(time?{timeStyle:'short' as const}:{})}).format(date)}</>;}
