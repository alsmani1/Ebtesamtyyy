import React from 'react';
import { Activity, CalendarDays, ShieldPlus, Smile, Stethoscope, Boxes, CreditCard, Wrench, ClipboardList, Truck } from 'lucide-react';

type RoleKey = 'reception' | 'dentist' | 'owner' | 'patient' | 'inventory' | 'finance' | 'maintenance' | 'procurement';
const icons = { reception: CalendarDays, dentist: Stethoscope, owner: Activity, patient: Smile, inventory: Boxes, finance: CreditCard, maintenance: Wrench, procurement: Truck };
/** Decorative original interface motif; never shows patient data or a fictional photograph. */
export function WorkspaceEmblem({role, className=''}:{role:RoleKey;className?:string}){
 const Icon = icons[role] || ClipboardList;
 return <div aria-hidden="true" className={`eb-workspace-emblem ${className}`}>
   <div className="eb-workspace-emblem-orbit"><ShieldPlus size={18}/></div>
   <div className="eb-workspace-emblem-core"><Icon size={37} strokeWidth={1.65}/></div>
   <div className="eb-workspace-emblem-dot" />
 </div>;
}
