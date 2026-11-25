import {getCurrentUser} from './auth';
/** Operational endpoints receive only the user's explicitly granted operational roles. */
export async function getOperationalUser(){const user=await getCurrentUser();if(!user)return null;return {...user,roleGrants:user.roleGrants.filter(g=>g.role!=='OWNER_ADMIN')};}
