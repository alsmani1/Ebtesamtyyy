/** Canonical Egyptian mobile numbers; does not imply shared patient identity. */
export function normalizePhone(value:string){
 const digits=value.replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[^\d+]/g,'');
 const international=digits.startsWith('00')?'+'+digits.slice(2):digits;
 if(/^01\d{9}$/.test(international))return '+20'+international.slice(1);
 if(/^201\d{9}$/.test(international))return '+'+international;
 return international;
}
