// Pure Static Client-Side Authentication & Session Engine (No Server Runtime / No Cookies)
import { Role } from '@prisma/client';
import { loginDestination } from './login-destination';
import { clearAssistantSession, getAssistantSession, isAssistantConfigured } from './assistant-api';
import { enrollPatient, findPatientByEmail, findPatientByPhone, getPatientByPortalLink } from './patients-db';

export const STATIC_SESSION_STORAGE_KEY = 'ebtesamty_static_session_v1';
export const STATIC_USERS_STORAGE_KEY = 'ebtesamty_static_registered_users_v1';
export const STATIC_AUTH_EVENT = 'ebtesamty-static-auth-change';

export interface FallbackDemoAccount {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  status: string;
  roleGrants: {
    id: string;
    role: Role;
    branchId: string | null;
    branch: { id: string; code: string; name: string; isActive: boolean } | null;
  }[];
  staffProfile: {
    id: string;
    title: string;
    specialty?: string | null;
    licenseNumber?: string | null;
    active: boolean;
  } | null;
  portalPatientLinks: any[];
}

export const FALLBACK_DEMO_USERS: Record<string, FallbackDemoAccount> = {
  'admin@ebtesamty.dev': {
    id: 'usr_owner_abram',
    email: 'admin@ebtesamty.dev',
    phone: '+201000000001',
    fullName: 'Abram',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_owner',
        role: 'OWNER_ADMIN' as Role,
        branchId: null,
        branch: { id: 'br_a', code: 'BR-A', name: 'Minya – Branch A', isActive: true },
      },
    ],
    staffProfile: { id: 'sp_owner', title: 'OWNER / EXECUTIVE', active: true },
    portalPatientLinks: [],
  },
  'mariam.reception@ebtesamty.dev': {
    id: 'usr_rec_mariam',
    email: 'mariam.reception@ebtesamty.dev',
    phone: '+201000000003',
    fullName: 'Mariam Hanna',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_rec_a',
        role: 'RECEPTIONIST' as Role,
        branchId: 'br_a',
        branch: { id: 'br_a', code: 'BR-A', name: 'Minya – Branch A', isActive: true },
      },
    ],
    staffProfile: { id: 'sp_rec_a', title: 'Senior Receptionist — Minya Branch A', active: true },
    portalPatientLinks: [],
  },
  'sandy.reception@ebtesamty.dev': {
    id: 'usr_rec_sandy',
    email: 'sandy.reception@ebtesamty.dev',
    phone: '+201000000004',
    fullName: 'Sandy Abd',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_rec_b',
        role: 'RECEPTIONIST' as Role,
        branchId: 'br_b',
        branch: { id: 'br_b', code: 'BR-B', name: 'Minya – Branch B', isActive: true },
      },
    ],
    staffProfile: { id: 'sp_rec_b', title: 'Receptionist — Minya Branch B', active: true },
    portalPatientLinks: [],
  },
  'salma.reception@ebtesamty.dev': {
    id: 'usr_rec_salma',
    email: 'salma.reception@ebtesamty.dev',
    phone: '+201000000008',
    fullName: 'Salma Adel',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_rec_c',
        role: 'RECEPTIONIST' as Role,
        branchId: 'br_c',
        branch: { id: 'br_c', code: 'BR-C', name: 'Minya – Branch C', isActive: true },
      },
    ],
    staffProfile: { id: 'sp_rec_c', title: 'Receptionist — Minya Branch C', active: true },
    portalPatientLinks: [],
  },
  'dr.sandy@ebtesamty.dev': {
    id: 'usr_doc_sandy',
    email: 'dr.sandy@ebtesamty.dev',
    phone: '+201000000005',
    fullName: 'Dr. Sandy Saad',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_doc_sandy',
        role: 'DENTIST' as Role,
        branchId: 'br_a',
        branch: { id: 'br_a', code: 'BR-A', name: 'Minya – Branch A', isActive: true },
      },
    ],
    staffProfile: {
      id: 'sp_doc_sandy',
      title: 'Lead Restorative & Cosmetic Dentist',
      specialty: 'Restorative & Cosmetic Dentistry',
      licenseNumber: 'EGY-DEN-44912',
      active: true,
    },
    portalPatientLinks: [],
  },
  'dr.ahmed@ebtesamty.dev': {
    id: 'usr_doc_ahmed',
    email: 'dr.ahmed@ebtesamty.dev',
    phone: '+201000000007',
    fullName: 'Dr. Ahmed Hassan',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_doc_ahmed',
        role: 'DENTIST' as Role,
        branchId: 'br_a',
        branch: { id: 'br_a', code: 'BR-A', name: 'Minya – Branch A', isActive: true },
      },
    ],
    staffProfile: {
      id: 'sp_doc_ahmed',
      title: 'Oral Surgery & Implantology Consultant',
      specialty: 'Dental Implants & Oral Surgery',
      licenseNumber: 'EGY-DEN-39104',
      active: true,
    },
    portalPatientLinks: [],
  },
  'dr.youssef@ebtesamty.dev': {
    id: 'usr_doc_youssef',
    email: 'dr.youssef@ebtesamty.dev',
    phone: '+201000000009',
    fullName: 'Dr. Youssef El-Mansy',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_doc_youssef',
        role: 'DENTIST' as Role,
        branchId: 'br_b',
        branch: { id: 'br_b', code: 'BR-B', name: 'Minya – Branch B', isActive: true },
      },
    ],
    staffProfile: {
      id: 'sp_doc_youssef',
      title: 'Orthodontics Specialist',
      specialty: 'Orthodontics & Clear Aligners',
      licenseNumber: 'EGY-DEN-48210',
      active: true,
    },
    portalPatientLinks: [],
  },
  'hassan.patient@ebtesamty.dev': {
    id: 'usr_pat_passant',
    email: 'hassan.patient@ebtesamty.dev',
    phone: '01200054405',
    fullName: 'Passant',
    status: 'ACTIVE',
    roleGrants: [
      {
        id: 'rg_pat_passant',
        role: 'PATIENT' as Role,
        branchId: null,
        branch: { id: 'br_a', code: 'BR-A', name: 'Minya – Branch A', isActive: true },
      },
    ],
    staffProfile: null,
    portalPatientLinks: [
      {
        id: 'lnk_passant',
        status: 'APPROVED',
        patient: {
          id: 'pat_passant',
          patientNumber: 'EBT-PAT-0001',
          fullName: 'Passant',
          primaryPhone: '01200054405',
        },
      },
    ],
  },
  'finance@ebtesamty.dev': {
    id: 'usr_finance',
    email: 'finance@ebtesamty.dev',
    phone: '+201000000011',
    fullName: 'Nadia Mansour',
    status: 'ACTIVE',
    roleGrants: [{ id: 'rg_fin', role: 'FINANCE' as Role, branchId: null, branch: null }],
    staffProfile: { id: 'sp_fin', title: 'FINANCE / ACCOUNTANT', active: true },
    portalPatientLinks: [],
  },
  'inventory@ebtesamty.dev': {
    id: 'usr_inventory',
    email: 'inventory@ebtesamty.dev',
    phone: '+201000000012',
    fullName: 'Khaled Soliman',
    status: 'ACTIVE',
    roleGrants: [{ id: 'rg_inv', role: 'INVENTORY' as Role, branchId: null, branch: null }],
    staffProfile: { id: 'sp_inv', title: 'INVENTORY & PROCUREMENT', active: true },
    portalPatientLinks: [],
  },
  'crm@ebtesamty.dev': {
    id: 'usr_crm',
    email: 'crm@ebtesamty.dev',
    phone: '+201000000013',
    fullName: 'Heba Zaki',
    status: 'ACTIVE',
    roleGrants: [{ id: 'rg_crm', role: 'CRM' as Role, branchId: null, branch: null }],
    staffProfile: { id: 'sp_crm', title: 'MARKETING & CRM', active: true },
    portalPatientLinks: [],
  },
  'sysadmin@ebtesamty.dev': {
    id: 'usr_sysadmin',
    email: 'sysadmin@ebtesamty.dev',
    phone: '+201000000014',
    fullName: 'Eng. Karim Zaki',
    status: 'ACTIVE',
    roleGrants: [{ id: 'rg_sys', role: 'OWNER_ADMIN' as Role, branchId: null, branch: null }],
    staffProfile: { id: 'sp_sys', title: 'SUPER ADMIN', active: true },
    portalPatientLinks: [],
  },
};

export function getStaticSessionUser(): FallbackDemoAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STATIC_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FallbackDemoAccount;
  } catch {
    return null;
  }
}

export function setStaticSessionUser(user: FallbackDemoAccount | null) {
  if (typeof window === 'undefined') return;
  const verified = getAssistantSession();
  if (!user || (verified && (verified.actor.userId !== user.id || JSON.stringify(verified.user.roleGrants) !== JSON.stringify(user.roleGrants)))) {
    clearAssistantSession();
  }
  try {
    if (user) {
      window.localStorage.setItem(STATIC_SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STATIC_SESSION_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(STATIC_AUTH_EVENT));
  } catch {
    // ignore storage errors
  }
}

// Older registrations were linked to random patient numbers that never existed
// in the registry. Resolve (or enroll) the real file and re-link the session.
function ensurePatientLink(user: FallbackDemoAccount): FallbackDemoAccount {
  const isPatient = user.roleGrants?.some((grant) => grant.role === 'PATIENT');
  if (!isPatient) return user;
  const phone = (user as FallbackDemoAccount & { phone?: string }).phone || '';
  const existing =
    getPatientByPortalLink(user.portalPatientLinks?.[0]) ||
    findPatientByPhone(phone) ||
    findPatientByEmail(user.email);
  if (!existing && !phone) return user;
  const patient =
    existing ||
    enrollPatient({
      fullName: user.fullName,
      phone,
      email: user.email,
      branchCode: 'BR-A',
      source: 'registration',
      portalUserEmail: user.email?.toLowerCase(),
    }).patient;
  return {
    ...user,
    portalPatientLinks: [
      {
        id: user.portalPatientLinks?.[0]?.id || `lnk_${user.id}`,
        status: 'APPROVED',
        patient: {
          id: patient.id,
          patientNumber: patient.id,
          fullName: patient.fullName,
          primaryPhone: patient.phone,
        },
      },
    ],
  };
}

export function loginWithDemoAccount(email: string): {
  user: FallbackDemoAccount;
  redirectUrl: string;
} | null {
  if (isAssistantConfigured()) return null;
  const clean = email.trim().toLowerCase();
  const user = FALLBACK_DEMO_USERS[clean];
  if (!user) return null;
  const linked = ensurePatientLink(user);
  setStaticSessionUser(linked);
  const redirectUrl = loginDestination(linked.roleGrants) || '/patient/dashboard';
  return { user: linked, redirectUrl };
}

export function loginWithCredentials(
  emailOrPhone: string,
  password: string
): { user: FallbackDemoAccount; redirectUrl: string } | { error: string } {
  if (isAssistantConfigured()) return { error: 'Verified backend sign-in is required.' };
  const clean = emailOrPhone.trim().toLowerCase();

  // Check custom registered users first
  if (typeof window !== 'undefined') {
    try {
      const regRaw = window.localStorage.getItem(STATIC_USERS_STORAGE_KEY);
      if (regRaw) {
        const regList = JSON.parse(regRaw) as (FallbackDemoAccount & { password?: string })[];
        const foundReg = regList.find(
          (u) => u.email.toLowerCase() === clean || u.phone === clean
        );
        if (foundReg && (!foundReg.password || foundReg.password === password)) {
          const linked = ensurePatientLink(foundReg);
          setStaticSessionUser(linked);
          return {
            user: linked,
            redirectUrl: loginDestination(linked.roleGrants) || '/patient/dashboard',
          };
        }
      }
    } catch {
      // ignore
    }
  }

  const demoUser =
    FALLBACK_DEMO_USERS[clean] ||
    Object.values(FALLBACK_DEMO_USERS).find((u) => u.phone === clean);

  if (demoUser && (password === 'Password123!' || password.length >= 4)) {
    const linked = ensurePatientLink(demoUser);
    setStaticSessionUser(linked);
    return {
      user: linked,
      redirectUrl: loginDestination(linked.roleGrants) || '/patient/dashboard',
    };
  }

  return { error: 'Invalid email, phone, or password' };
}

export function registerStaticPatient(input: {
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
}): { user: FallbackDemoAccount; redirectUrl: string } {
  if (isAssistantConfigured()) throw new Error('Contact the clinic to provision a verified patient account.');
  const email = (input.email || `${input.phone.replace(/\D/g, '')}@ebtesamty.dev`).toLowerCase();
  const patient = enrollPatient({
    fullName: input.fullName.trim() || 'Patient',
    phone: input.phone,
    email,
    branchCode: 'BR-A',
    source: 'registration',
    portalUserEmail: email,
  });
  const newUser: FallbackDemoAccount & { password?: string } = {
    id: `usr_pat_${Date.now()}`,
    email,
    phone: input.phone,
    fullName: input.fullName.trim() || 'Patient',
    status: 'ACTIVE',
    password: input.password || 'Password123!',
    roleGrants: [
      {
        id: `rg_pat_${Date.now()}`,
        role: 'PATIENT' as Role,
        branchId: null,
        branch: { id: 'br_a', code: 'BR-A', name: 'Minya – Branch A', isActive: true },
      },
    ],
    staffProfile: null,
    portalPatientLinks: [
      {
        id: `lnk_${Date.now()}`,
        status: 'APPROVED',
        patient: {
          id: patient.id,
          patientNumber: patient.id,
          fullName: patient.fullName,
          primaryPhone: patient.phone,
        },
      },
    ],
  };

  if (typeof window !== 'undefined') {
    try {
      const regRaw = window.localStorage.getItem(STATIC_USERS_STORAGE_KEY);
      const regList = regRaw ? JSON.parse(regRaw) : [];
      regList.push(newUser);
      window.localStorage.setItem(STATIC_USERS_STORAGE_KEY, JSON.stringify(regList));
    } catch {
      // ignore
    }
  }

  setStaticSessionUser(newUser);
  return { user: newUser, redirectUrl: '/patient/dashboard' };
}

export function logoutStaticUser() {
  setStaticSessionUser(null);
}

// Compatibility exports for legacy callers during static build
export async function getCurrentUser(): Promise<FallbackDemoAccount | null> {
  return getStaticSessionUser();
}

export async function getSessionUser(token: string): Promise<FallbackDemoAccount | null> {
  if (token.startsWith('demo:')) {
    const email = token.slice(5).trim().toLowerCase();
    return FALLBACK_DEMO_USERS[email] || null;
  }
  return getStaticSessionUser();
}

export async function hashPassword(password: string): Promise<string> {
  return password;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return password === hash || password === 'Password123!';
}

export async function createSession(userId: string) {
  return {
    session: { id: 'static_sess', userId, token: 'static_tok', expiresAt: new Date(Date.now() + 86400000) },
    token: 'static_tok',
    expiresAt: new Date(Date.now() + 86400000),
  };
}

export async function setSessionCookie(_token: string, _expiresAt: Date) {}
export async function clearSessionCookie() {
  logoutStaticUser();
}
