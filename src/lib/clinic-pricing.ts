/**
 * Single source of truth for service prices and material unit costs.
 * Every EGP amount in the app is either one of these inputs or derived from them.
 */

export type ServiceKey =
  | 'consult'
  | 'newPatient'
  | 'filling'
  | 'scaling'
  | 'extraction'
  | 'rct'
  | 'post'
  | 'crown'
  | 'bridge'
  | 'veneer'
  | 'implant'
  | 'braces'
  | 'whitening'
  | 'pediatric';

export type MaterialKey = 'composite' | 'lidocaine' | 'gutta' | 'fixture' | 'glove';

export interface ServiceDefinition {
  key: ServiceKey;
  nameEn: string;
  nameAr: string;
  price: number;
  labCost: number;
  doctorSharePercent: number;
  materials: { item: MaterialKey; qty: number }[];
}

export const MATERIAL_UNIT_COST: Record<MaterialKey, number> = {
  composite: 400,
  lidocaine: 25,
  gutta: 80,
  fixture: 2000,
  glove: 5,
};

export const MATERIAL_NAMES: Record<MaterialKey, { en: string; ar: string }> = {
  composite: { en: 'Composite A2', ar: 'كومبوزيت A2' },
  lidocaine: { en: 'Lidocaine cartridge', ar: 'أمبول ليدوكايين' },
  gutta: { en: 'Gutta-percha', ar: 'جوتا بيركا' },
  fixture: { en: 'Titanium fixture', ar: 'فيكستشر تيتانيوم' },
  glove: { en: 'Latex gloves (pair)', ar: 'جوانتي لاتكس (زوج)' },
};

export const SERVICES: Record<ServiceKey, ServiceDefinition> = {
  consult: {
    key: 'consult',
    nameEn: 'Consultation & Diagnosis',
    nameAr: 'كشف وتشخيص',
    price: 250,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  newPatient: {
    key: 'newPatient',
    nameEn: 'New Patient Exam & X-Ray',
    nameAr: 'كشف مريض جديد وأشعة',
    price: 400,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  filling: {
    key: 'filling',
    nameEn: 'Composite Filling',
    nameAr: 'حشو تجميلي',
    price: 500,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [
      { item: 'composite', qty: 0.2 },
      { item: 'lidocaine', qty: 1 },
      { item: 'glove', qty: 2 },
    ],
  },
  scaling: {
    key: 'scaling',
    nameEn: 'Scaling & Polishing',
    nameAr: 'تنظيف الجير',
    price: 400,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  extraction: {
    key: 'extraction',
    nameEn: 'Simple Tooth Extraction',
    nameAr: 'خلع سن بسيط',
    price: 600,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [
      { item: 'lidocaine', qty: 1 },
      { item: 'glove', qty: 2 },
    ],
  },
  rct: {
    key: 'rct',
    nameEn: 'Root Canal Therapy',
    nameAr: 'علاج جذور',
    price: 1800,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [
      { item: 'gutta', qty: 1 },
      { item: 'lidocaine', qty: 1 },
      { item: 'glove', qty: 2 },
    ],
  },
  post: {
    key: 'post',
    nameEn: 'Post & Core',
    nameAr: 'دعامة وتلبيس',
    price: 800,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [
      { item: 'composite', qty: 0.3 },
      { item: 'glove', qty: 2 },
    ],
  },
  crown: {
    key: 'crown',
    nameEn: 'Zirconia Crown',
    nameAr: 'تاج زيركون',
    price: 3000,
    labCost: 700,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  bridge: {
    key: 'bridge',
    nameEn: 'Zirconia Bridge (3 units)',
    nameAr: 'جسر زيركون (3 وحدات)',
    price: 3000,
    labCost: 900,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  veneer: {
    key: 'veneer',
    nameEn: 'Porcelain Veneer (Per Tooth)',
    nameAr: 'فينير بورسلين (لل سن)',
    price: 2500,
    labCost: 700,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  implant: {
    key: 'implant',
    nameEn: 'Dental Implant',
    nameAr: 'زراعة أسنان',
    price: 15000,
    labCost: 900,
    doctorSharePercent: 35,
    materials: [
      { item: 'fixture', qty: 1 },
      { item: 'lidocaine', qty: 2 },
      { item: 'glove', qty: 2 },
    ],
  },
  braces: {
    key: 'braces',
    nameEn: 'Orthodontic Braces (Full Arch)',
    nameAr: 'تقويم أسنان (فك كامل)',
    price: 12000,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  whitening: {
    key: 'whitening',
    nameEn: 'Laser Teeth Whitening',
    nameAr: 'تبييض أسنان بالليزر',
    price: 1200,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
  pediatric: {
    key: 'pediatric',
    nameEn: 'Pediatric Dental Visit',
    nameAr: 'زيارة أسنان للأطفال',
    price: 350,
    labCost: 0,
    doctorSharePercent: 35,
    materials: [{ item: 'glove', qty: 2 }],
  },
};

export const SERVICE_KEYS = Object.keys(SERVICES) as ServiceKey[];

export function serviceMaterialCost(key: ServiceKey): number {
  return SERVICES[key].materials.reduce(
    (sum, line) => sum + line.qty * MATERIAL_UNIT_COST[line.item],
    0
  );
}

export function roundEgp(value: number): number {
  return Math.round(value);
}

export function formatEgp(amount: number, locale: 'en' | 'ar' = 'en', withCurrency = true): string {
  const formatted = Math.round(amount).toLocaleString('en-US');
  if (!withCurrency) return formatted;
  return locale === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`;
}

/** Consultation fee shown on the public booking page. */
export const BOOKING_CONSULTATION_FEE = SERVICES.consult.price;
/** First-visit exam fee shown on the new-patients page. */
export const NEW_PATIENT_EXAM_FEE = SERVICES.newPatient.price;
