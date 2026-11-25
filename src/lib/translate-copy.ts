import {CLINIC_BRANCHES,CLINIC_SERVICES} from '@/config/clinic-catalog';
import copy from './complete-arabic.json';
import {interfaceMessages} from './interface-messages';
import {translations} from './i18n';
const arabic:Record<string,string>={...copy};
for(const pair of Object.values(interfaceMessages))arabic[pair.en]=pair.ar;
function collect(en:any,ar:any){for(const k of Object.keys(en)){if(typeof en[k]==='string'&&typeof ar?.[k]==='string')arabic[en[k]]=ar[k];else if(en[k]&&typeof en[k]==='object')collect(en[k],ar?.[k]);}}
collect(translations.en,translations.ar);
for(const item of [...CLINIC_BRANCHES,...CLINIC_SERVICES])arabic[item.nameEn]=item.nameAr;
const decode=(s:string)=>s.replaceAll('&amp;','&').replaceAll('&apos;',"'").replaceAll('&quot;','"').replaceAll('&ldquo;','“').replaceAll('&rdquo;','”').replaceAll('&le;','≤');
for(const [key,value] of Object.entries(arabic))arabic[decode(key)]=value;
export function translateCopy(text:string,locale:string){
 if(locale!=='ar')return decode(text);
 if(arabic[text])return decode(arabic[text]);
 const months:Record<string,string>={Jan:'يناير',Feb:'فبراير',Mar:'مارس',Apr:'أبريل',May:'مايو',Jun:'يونيو',Jul:'يوليو',Aug:'أغسطس',Sep:'سبتمبر',Oct:'أكتوبر',Nov:'نوفمبر',Dec:'ديسمبر'};
 if(/^[A-Z][a-z]{2} \d{2}$/.test(text)&&months[text.slice(0,3)])return months[text.slice(0,3)]+' '+text.slice(4);
 return decode(text.replace(/^(\d+) priority incidents require review$/,'$1 حالات ذات أولوية تحتاج المراجعة').replace(/^(\d+)% of prior stage$/,'$1٪ من المرحلة السابقة').replace(/^Low Stock Reorder Alert: /,'تنبيه إعادة طلب مخزون: ').replace(/^Duplicate Candidate: /,'سجل مكرر محتمل: '));
}

