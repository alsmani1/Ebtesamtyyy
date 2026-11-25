/** Both password and presentation authentication use persisted grants. */
export function loginDestination(grants: {role:string}[]): string | null {
 const destinations: Record<string,string>={
   OWNER_ADMIN:'/owner/dashboard',
   BRANCH_MANAGER:'/owner/dashboard',
   SYSTEM_ADMIN:'/owner/dashboard',
   FINANCE:'/owner/finance',
   INVENTORY:'/owner/inventory',
   CRM:'/owner/crm',
   RECEPTIONIST:'/reception/dashboard',
   DENTIST:'/doctor/dashboard',
   PATIENT:'/patient/dashboard'
 };
 for(const role of Object.keys(destinations)) if(grants.some(g=>g.role===role))return destinations[role];
 return null;
}
