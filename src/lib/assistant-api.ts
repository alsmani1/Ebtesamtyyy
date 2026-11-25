import { z } from 'zod';
import type { FallbackDemoAccount } from './auth';

export const ASSISTANT_OPEN_EVENT = 'ebtesamty-assistant-open';
export const ASSISTANT_SESSION_EVENT = 'ebtesamty-assistant-session-change';
const SESSION_KEY = 'ebtesamty_verified_assistant_session';
const API_URL = process.env.NEXT_PUBLIC_ASSISTANT_API_URL?.trim().replace(/\/$/, '') || '';
const DIRECT_GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim() || '';
const DIRECT_GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

export type AssistantRole = 'clinic_owner' | 'doctor' | 'receptionist' | 'patient';
export interface AssistantActor {
  userId: string;
  clinicId: string;
  role: AssistantRole;
  fullName: string;
  branchCode: 'ALL' | 'BR-A' | 'BR-B' | 'BR-C';
  patientId?: string;
  doctorNameEn?: string;
}
export interface AssistantSession {
  token: string;
  expiresAt: number | string;
  actor: AssistantActor;
  user: FallbackDemoAccount;
}
const actorSchema = z.object({
  userId: z.string().min(1),
  clinicId: z.string().min(1),
  role: z.enum(['clinic_owner', 'doctor', 'receptionist', 'patient']),
  fullName: z.string(),
  branchCode: z.enum(['ALL', 'BR-A', 'BR-B', 'BR-C']),
  patientId: z.string().optional(),
  doctorNameEn: z.string().optional(),
});
const userSchema = z.object({
  id: z.string().min(1),
  email: z.string(),
  phone: z.string(),
  fullName: z.string(),
  status: z.literal('ACTIVE'),
  roleGrants: z.array(z.object({
    id: z.string(),
    role: z.enum(['OWNER_ADMIN', 'DENTIST', 'RECEPTIONIST', 'PATIENT']),
    branchId: z.string().nullable(),
    branch: z.object({ id: z.string(), code: z.string(), name: z.string(), isActive: z.boolean() }).nullable(),
  })).length(1),
  staffProfile: z.object({
    id: z.string(), title: z.string(), active: z.boolean(),
    specialty: z.string().nullable().optional(), licenseNumber: z.string().nullable().optional(),
  }).nullable(),
  portalPatientLinks: z.array(z.object({
    id: z.string(), status: z.literal('APPROVED'),
    patient: z.object({ id: z.string(), patientNumber: z.string(), fullName: z.string(), primaryPhone: z.string() }),
  })),
});
const sessionSchema = z.object({
  token: z.string().min(24).max(256),
  expiresAt: z.union([z.number().finite(), z.string()]),
  actor: actorSchema,
  user: userSchema,
}).refine((session) => session.user.id === session.actor.userId);

export const assistantScopeSchema = z.object({
  patientIds: z.array(z.string().min(1).max(128)).max(20000),
  appointmentIds: z.array(z.string().min(1).max(128)).max(20000),
}).strict();

export const assistantChartSchema = z.object({
  type: z.enum(['bar', 'line']),
  title: z.string().max(160),
  unit: z.string().max(40),
  points: z.array(z.object({
    label: z.string().max(100),
    value: z.number().finite().min(-1e14).max(1e14),
  }).strict()).min(1).max(32),
}).strict();
export type AssistantChart = z.infer<typeof assistantChartSchema>;
export const assistantResponseSchema = z.object({
  type: z.enum(['standard_answer', 'permission_boundary', 'missing_data']),
  answer: z.string().max(12000).optional(),
  message: z.string().max(12000).optional(),
  actorId: z.string(),
  role: z.enum(['clinic_owner', 'doctor', 'receptionist', 'patient']),
  conversationId: z.string(),
  chart: assistantChartSchema.optional(),
});
export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

export function isAssistantConfigured(): boolean {
  return Boolean(API_URL);
}

export function isDirectGeminiConfigured(): boolean {
  return Boolean(DIRECT_GEMINI_API_KEY);
}

export function getDirectGeminiModel(): string {
  return DIRECT_GEMINI_MODEL;
}

export function getDirectAssistantActor(user: FallbackDemoAccount | null): AssistantActor | null {
  if (!user || user.status !== 'ACTIVE') return null;
  const grant = user.roleGrants?.find((row) => ['OWNER_ADMIN', 'DENTIST', 'RECEPTIONIST', 'PATIENT'].includes(row.role));
  if (!grant) return null;
  const role: AssistantRole = grant.role === 'OWNER_ADMIN' ? 'clinic_owner' : grant.role === 'DENTIST' ? 'doctor' : grant.role === 'RECEPTIONIST' ? 'receptionist' : 'patient';
  const branch = grant.branch?.code;
  const branchCode = role === 'clinic_owner' ? 'ALL' : branch;
  if (!['ALL', 'BR-A', 'BR-B', 'BR-C'].includes(branchCode || '')) return null;
  const actor: AssistantActor = {
    userId: user.id,
    clinicId: 'demo-clinic',
    role,
    fullName: user.fullName,
    branchCode: branchCode as AssistantActor['branchCode'],
  };
  if (role === 'doctor') actor.doctorNameEn = user.fullName;
  if (role === 'patient') {
    const link = user.portalPatientLinks?.find((row) => row.status === 'APPROVED');
    if (!link?.patient?.id) return null;
    actor.patientId = link.patient.id;
  }
  return actor;
}

function requireApiUrl(): string {
  if (!API_URL) throw new Error('The AI backend is not configured yet.');
  const url = new URL(API_URL);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) {
    throw new Error('The AI backend requires HTTPS.');
  }
  return API_URL;
}

export function getAssistantSession(): AssistantSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const parsed = sessionSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearAssistantSession(): void {
  if (typeof window === 'undefined') return;
  const token = getAssistantSession()?.token;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(ASSISTANT_SESSION_EVENT));
  if (token && API_URL) {
    try {
      void fetch(`${requireApiUrl()}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'omit',
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }
}

export async function assistantApi<T>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
  authenticated = true
): Promise<T> {
  const apiUrl = requireApiUrl();
  const token = getAssistantSession()?.token;
  if (authenticated && !token) throw new Error('Sign in with your verified account to use the assistant.');
  const response = await fetch(`${apiUrl}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'omit',
    signal,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authenticated && token === getAssistantSession()?.token) clearAssistantSession();
    throw new Error(typeof data?.error === 'string' ? data.error : `AI service request failed (${response.status}).`);
  }
  return data as T;
}

export async function loginAssistantAccount(emailOrPhone: string, password: string): Promise<AssistantSession> {
  clearAssistantSession();
  const session = sessionSchema.parse(await assistantApi('/api/auth/login', { emailOrPhone, password }, undefined, false));
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function verifyAssistantSession(signal?: AbortSignal): Promise<AssistantSession> {
  const previous = getAssistantSession();
  if (!previous) throw new Error('Sign in with your verified account to use the assistant.');
  const verified = z.object({ actor: actorSchema, user: userSchema }).parse(await assistantApi('/api/auth/me', undefined, signal));
  if (previous.token !== getAssistantSession()?.token) throw new Error('Your session changed. Sign in again.');
  if (verified.user.id !== previous.actor.userId || verified.actor.userId !== verified.user.id || verified.actor.clinicId !== previous.actor.clinicId || verified.actor.role !== previous.actor.role || verified.actor.branchCode !== previous.actor.branchCode || verified.actor.patientId !== previous.actor.patientId || verified.actor.doctorNameEn !== previous.actor.doctorNameEn) {
    clearAssistantSession();
    throw new Error('Your session changed. Sign in again.');
  }
  return { ...previous, ...verified };
}

export function openAssistant(prompt?: string): void {
  window.dispatchEvent(new CustomEvent(ASSISTANT_OPEN_EVENT, { detail: { prompt } }));
}
