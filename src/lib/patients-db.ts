// Static client-side patient registry (EMPI-lite) shared by booking, staff files,
// and the patient portal. Patient IDs are the clinic file numbers used by the
// finance ledger (e.g. EBT-PAT-0001, P-1042) so invoices can be linked directly.
import type { MinyaBranchCode } from "@/config/minya-clinic-store";

export const PATIENTS_DB_KEY = "ebtesamty_patients_db_v1";
export const PATIENTS_DB_EVENT = "ebtesamty-patients-sync";

export type PatientSource = "seed" | "booking" | "registration" | "staff";
export type PatientBranchCode = Exclude<MinyaBranchCode, "ALL">;

export interface PatientFamilyMember {
  name: string;
  relation: string;
  code: string;
}

export interface PatientRecord {
  id: string;
  fullName: string;
  fullNameAr?: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: "Male" | "Female";
  age?: number;
  branchCode: PatientBranchCode;
  primaryDoctorEn?: string;
  primaryDoctorAr?: string;
  insurance?: string;
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  visitsCount: number;
  familyGroup?: string;
  familyMembers?: PatientFamilyMember[];
  avatarColor: string;
  initials: string;
  initialsAr: string;
  source: PatientSource;
  portalUserEmail?: string;
  duplicatePhone?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PatientsDbPayload {
  version: number;
  patients: PatientRecord[];
}

const SEED_DATE = "2024-01-01T00:00:00.000Z";
const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-blue-700",
  "bg-emerald-600",
  "bg-amber-700",
  "bg-pink-600",
  "bg-violet-600",
  "bg-sky-600",
  "bg-rose-600",
];

const SEED_PATIENTS: PatientRecord[] = [
  {
    id: "EBT-PAT-0001",
    fullName: "Passant",
    fullNameAr: "بسنت",
    phone: "01200054405",
    branchCode: "BR-A",
    primaryDoctorEn: "Dr. Sandy Saad",
    primaryDoctorAr: "د. ساندي سعد",
    gender: "Female",
    age: 26,
    insurance: "AXA Corporate",
    allergies: ["Penicillin (Use Clindamycin alternative)"],
    chronicConditions: ["None"],
    medications: ["Vitamin D3"],
    visitsCount: 14,
    familyGroup: "Passant Household",
    familyMembers: [{ name: "Mariam (Sister)", relation: "Sister", code: "EBT-PAT-0002" }],
    avatarColor: "bg-teal-600",
    initials: "PA",
    initialsAr: "بس",
    source: "seed",
    portalUserEmail: "hassan.patient@ebtesamty.dev",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: "P-1057",
    fullName: "Ibrahim Yassin Shaheen",
    fullNameAr: "إبراهيم ياسين شاهين",
    phone: "01298173694",
    branchCode: "BR-A",
    primaryDoctorEn: "Dr. Feby Samer",
    primaryDoctorAr: "د. فيبي سامر",
    gender: "Male",
    age: 23,
    insurance: "None",
    allergies: ["Penicillin (Severe rash)", "Latex sensitivity"],
    chronicConditions: ["Mild Asthma"],
    medications: ["Ventolin Inhaler PRN"],
    visitsCount: 36,
    familyGroup: "Shaheen Family",
    familyMembers: [
      { name: "Yassin Ibrahim Shaheen", relation: "Son (Child)", code: "P-1058" },
      { name: "Nourhan Shaheen", relation: "Spouse", code: "P-1059" },
    ],
    avatarColor: "bg-amber-600",
    initials: "IY",
    initialsAr: "إي",
    source: "seed",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: "P-1042",
    fullName: "Mohamed Ahmed Ali",
    fullNameAr: "محمد أحمد علي",
    phone: "01000000001",
    branchCode: "BR-B",
    primaryDoctorEn: "Dr. Ahmed Hassan",
    primaryDoctorAr: "د. أحمد حسن",
    gender: "Male",
    age: 34,
    insurance: "AXA Corporate",
    allergies: ["No known drug allergies"],
    chronicConditions: ["Controlled Hypertension"],
    medications: ["Concor 5mg daily"],
    visitsCount: 12,
    avatarColor: "bg-blue-600",
    initials: "MA",
    initialsAr: "مح",
    source: "seed",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: "P-0877",
    fullName: "Moustafa Samy",
    fullNameAr: "مصطفى سامي",
    phone: "01111111111",
    branchCode: "BR-B",
    primaryDoctorEn: "Dr. Youssef El-Mansy",
    primaryDoctorAr: "د. يوسف المنسي",
    gender: "Male",
    age: 29,
    insurance: "None",
    allergies: ["Aspirin / NSAIDs"],
    chronicConditions: ["None"],
    medications: ["None"],
    visitsCount: 8,
    avatarColor: "bg-violet-600",
    initials: "MS",
    initialsAr: "مس",
    source: "seed",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: "P-0310",
    fullName: "Ahmed Mohamed",
    fullNameAr: "أحمد محمد",
    phone: "01222222222",
    branchCode: "BR-A",
    primaryDoctorEn: "Dr. Feby Samer",
    primaryDoctorAr: "د. فيبي سامر",
    gender: "Male",
    age: 41,
    insurance: "None",
    allergies: ["Sulfa antibiotics"],
    chronicConditions: ["Type 2 Diabetes"],
    medications: ["Metformin 500mg BID"],
    visitsCount: 5,
    familyGroup: "Family",
    familyMembers: [
      { name: "Salma Ahmed Mohamed", relation: "Daughter (Child)", code: "P-0311" },
      { name: "Omar Ahmed Mohamed", relation: "Son (Child)", code: "P-0312" },
    ],
    avatarColor: "bg-emerald-600",
    initials: "AM",
    initialsAr: "أم",
    source: "seed",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
  {
    id: "P-1051",
    fullName: "Mai Saeed",
    fullNameAr: "مي سعيد",
    phone: "01015520148",
    branchCode: "BR-C",
    primaryDoctorEn: "Dr. Nadia El-Hariry",
    primaryDoctorAr: "د. نادية الحريري",
    gender: "Female",
    age: 34,
    insurance: "None",
    allergies: ["Local Anesthetic with Epinephrine (Use Mepivacaine plain)"],
    chronicConditions: ["None"],
    medications: ["Omega-3"],
    visitsCount: 1,
    familyGroup: "Family",
    familyMembers: [{ name: "Laila Saeed", relation: "Daughter", code: "P-1052" }],
    avatarColor: "bg-sky-600",
    initials: "MS",
    initialsAr: "مس",
    source: "seed",
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
  },
];

export function seedPatients(): PatientRecord[] {
  return SEED_PATIENTS.map((patient) => ({
    ...patient,
    allergies: [...patient.allergies],
    chronicConditions: [...patient.chronicConditions],
    medications: [...patient.medications],
    familyMembers: patient.familyMembers?.map((member) => ({ ...member })),
  }));
}

function readStoredPatients(): PatientRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PATIENTS_DB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.patients;
    return Array.isArray(list) ? (list as PatientRecord[]) : [];
  } catch {
    return [];
  }
}

function writeStoredPatients(patients: PatientRecord[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: PatientsDbPayload = { version: 1, patients };
    window.localStorage.setItem(PATIENTS_DB_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event(PATIENTS_DB_EVENT));
  } catch {
    // storage full or unavailable — keep in-memory callers working
  }
}

export function listPatients(): PatientRecord[] {
  const stored = readStoredPatients();
  const seeds = seedPatients();
  const merged: PatientRecord[] = seeds.map((seed) => {
    const override = stored.find((item) => item.id === seed.id);
    return override ? { ...seed, ...override } : seed;
  });
  const extras = stored
    .filter((item) => !seeds.some((seed) => seed.id === item.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return [...merged, ...extras];
}

export function getPatientById(id?: string | null): PatientRecord | undefined {
  if (!id) return undefined;
  const clean = String(id).trim().toLowerCase();
  return listPatients().find((patient) => patient.id.toLowerCase() === clean);
}

export function normalizePhone(phone?: string | null): string {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0020")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("20") && digits.length === 12) digits = `0${digits.slice(2)}`;
  return digits;
}

export function findPatientByPhone(phone?: string | null): PatientRecord | undefined {
  const target = normalizePhone(phone);
  if (!target) return undefined;
  return listPatients().find((patient) => normalizePhone(patient.phone) === target);
}

export function findPatientByEmail(email?: string | null): PatientRecord | undefined {
  const target = String(email || "").trim().toLowerCase();
  if (!target) return undefined;
  return listPatients().find(
    (patient) => (patient.portalUserEmail || patient.email || "").toLowerCase() === target
  );
}

export function findPatientByFullName(name?: string | null): PatientRecord | undefined {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return undefined;
  return listPatients().find(
    (patient) =>
      patient.fullName.trim().toLowerCase() === target ||
      (patient.fullNameAr || "").trim() === String(name || "").trim()
  );
}

export function getPatientByPortalLink(link?: {
  patient?: { id?: string; patientNumber?: string; fullName?: string; primaryPhone?: string };
} | null): PatientRecord | undefined {
  if (!link?.patient) return undefined;
  return (
    getPatientById(link.patient.patientNumber) ||
    getPatientById(link.patient.id) ||
    findPatientByPhone(link.patient.primaryPhone) ||
    findPatientByFullName(link.patient.fullName)
  );
}

export function searchPatients(query?: string | null): PatientRecord[] {
  const all = listPatients();
  const raw = String(query || "").trim();
  if (!raw) return all;
  const q = raw.toLowerCase();
  const phoneQ = normalizePhone(raw);
  return all.filter((patient) => {
    if (patient.fullName.toLowerCase().includes(q)) return true;
    if ((patient.fullNameAr || "").toLowerCase().includes(q)) return true;
    if (patient.id.toLowerCase().includes(q)) return true;
    if ((patient.portalUserEmail || "").toLowerCase().includes(q)) return true;
    if (phoneQ && normalizePhone(patient.phone).includes(phoneQ)) return true;
    return false;
  });
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

function formatFileNumber(value: number): string {
  return `EBT-PAT-${String(value).padStart(4, "0")}`;
}

export function nextPatientFileNumber(existing: PatientRecord[] = listPatients()): string {
  let next = 1001;
  const taken = new Set(existing.map((patient) => patient.id.toLowerCase()));
  while (taken.has(formatFileNumber(next).toLowerCase())) next += 1;
  return formatFileNumber(next);
}

function initialsFromName(name: string): { initials: string; initialsAr: string } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : (words[0] || "P").slice(0, 2).toUpperCase();
  const initialsAr = /[\u0600-\u06FF]/.test(name) ? name.trim().slice(0, 2) : initials;
  return { initials, initialsAr };
}

export function ageFromDob(dob?: string | null): number | undefined {
  if (!dob) return undefined;
  const parsed = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const monthDiff = now.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < parsed.getDate())) age -= 1;
  return Math.max(0, age);
}

function sameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export interface EnrollPatientInput {
  fullName: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: "Male" | "Female";
  branchCode?: PatientBranchCode;
  primaryDoctorEn?: string;
  primaryDoctorAr?: string;
  source?: PatientSource;
  portalUserEmail?: string;
  fileNumber?: string;
}

export interface EnrollPatientResult {
  patient: PatientRecord;
  created: boolean;
  duplicatePhone: boolean;
}

export function enrollPatient(input: EnrollPatientInput): EnrollPatientResult {
  const fullName = input.fullName.trim() || "Patient";
  const phone = input.phone.trim();
  const all = listPatients();
  const phoneMatch = phone ? findPatientByPhone(phone) : undefined;

  if (phoneMatch && sameName(phoneMatch.fullName, fullName)) {
    const updated: PatientRecord = {
      ...phoneMatch,
      email: input.email || phoneMatch.email,
      dob: input.dob || phoneMatch.dob,
      gender: input.gender || phoneMatch.gender,
      age: ageFromDob(input.dob) ?? phoneMatch.age,
      branchCode: input.branchCode || phoneMatch.branchCode,
      primaryDoctorEn: input.primaryDoctorEn || phoneMatch.primaryDoctorEn,
      primaryDoctorAr: input.primaryDoctorAr || phoneMatch.primaryDoctorAr,
      portalUserEmail: input.portalUserEmail || phoneMatch.portalUserEmail,
      updatedAt: new Date().toISOString(),
    };
    const nextAll = all.map((patient) => (patient.id === updated.id ? updated : patient));
    writeStoredPatients(nextAll);
    return { patient: updated, created: false, duplicatePhone: Boolean(updated.duplicatePhone) };
  }

  const duplicatePhone = Boolean(phoneMatch);
  const id = input.fileNumber?.trim() || nextPatientFileNumber(all);
  const { initials, initialsAr } = initialsFromName(fullName);
  const patient: PatientRecord = {
    id,
    fullName,
    fullNameAr: undefined,
    phone,
    email: input.email,
    dob: input.dob,
    gender: input.gender,
    age: ageFromDob(input.dob),
    branchCode: input.branchCode || "BR-A",
    primaryDoctorEn: input.primaryDoctorEn,
    primaryDoctorAr: input.primaryDoctorAr,
    insurance: "None",
    allergies: [],
    chronicConditions: [],
    medications: [],
    visitsCount: 0,
    avatarColor: AVATAR_COLORS[hashString(id) % AVATAR_COLORS.length],
    initials,
    initialsAr,
    source: input.source || "staff",
    portalUserEmail: input.portalUserEmail,
    duplicatePhone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const marked = duplicatePhone && phoneMatch
    ? all.map((item) =>
        item.id === phoneMatch.id ? { ...item, duplicatePhone: true } : item
      )
    : all;

  writeStoredPatients([...marked, patient]);
  return { patient, created: true, duplicatePhone };
}

export function addFamilyMember(
  patientId: string,
  member: { name: string; relation: string }
): PatientRecord | undefined {
  const all = listPatients();
  const target = all.find((patient) => patient.id === patientId);
  if (!target) return undefined;
  const code = nextPatientFileNumber(all);
  const updated: PatientRecord = {
    ...target,
    familyGroup: target.familyGroup || "Family",
    familyMembers: [...(target.familyMembers || []), { name: member.name, relation: member.relation, code }],
    updatedAt: new Date().toISOString(),
  };
  writeStoredPatients(all.map((patient) => (patient.id === patientId ? updated : patient)));
  return updated;
}

export function patientDisplayName(patient?: PatientRecord | null, isAr = false): string {
  if (!patient) return "";
  return isAr && patient.fullNameAr ? patient.fullNameAr : patient.fullName;
}
