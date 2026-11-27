'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PatientPersonalAppointmentsView from './PatientPersonalAppointmentsView';
import {
  APPOINTMENTS_EVENT,
  appointmentStatusLabel,
  clinicSlotLabels,
  isActiveAppointment,
  isSlotTaken,
  listAppointments,
  saveAppointments,
  updateAppointmentStatus,
  upsertAppointment,
  type AppointmentBranchCode,
  type AppointmentRecord,
  type AppointmentStatus,
} from '@/lib/appointments-db';
import { clinicTodayISO } from '@/lib/clinic-clock';
import { MINYA_BRANCHES } from '@/config/minya-clinic-store';
import { ReceptionBooking } from '@/components/ReceptionBooking';
import { AppointmentReminderComposer } from '@/components/AppointmentReminderComposer';
import { readLocalJson, usePersistedState } from '@/lib/use-persisted-state';
import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Edit3,
  ShieldAlert,
  BellRing,
  X,
} from 'lucide-react';

export const DOCTOR_SCHEDULE_REQUESTS_KEY = 'ebtesamty_doctor_schedule_requests_v1';
export const DOCTOR_SCHEDULE_REQUESTS_EVENT = 'ebtesamty-doctor-schedule-requests-sync';

export interface DoctorScheduleChangeRequest {
  id: string;
  appointmentId: string;
  patientNameEn: string;
  patientNameAr: string;
  currentSlot: string;
  doctorNameEn: string;
  doctorNameAr: string;
  branchNameEn: string;
  reason:
    | 'Reschedule Visit'
    | 'Block Time Slot'
    | 'Extend Procedure Time'
    | 'Cancel / Patient Follow-up';
  note: string;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED';
}

interface CalendarSlotItem {
  id: string;
  patientId?: string;
  branchCode?: AppointmentBranchCode;
  dayCol: number; // 0 = Sat 12 .. 6 = Fri 18
  weekOffset?: number; // 0 = the current week; defaults to 0 when omitted
  chairId: 'CHAIR-1' | 'CHAIR-2' | 'CHAIR-3';
  time: string;
  patientNameEn: string;
  patientNameAr: string;
  procedureEn: string;
  procedureAr: string;
  doctorId: 'dr-sandy' | 'dr-ahmed' | 'dr-sara' | 'dr-karim' | 'dr-youssef' | 'dr-nadia';
  doctorNameEn: string;
  doctorNameAr: string;
  status: AppointmentStatus;
}

const INITIAL_CALENDAR_ITEMS: CalendarSlotItem[] = [
  // ── Branch A (Minya Corniche · Mariam Hanna): Dr. Sandy Saad & Dr. Feby Samer ──
  {
    id: 'cal-sandy-1',
    branchCode: 'BR-A',
    dayCol: 2,
    chairId: 'CHAIR-1',
    time: '10:00 AM',
    patientNameEn: 'Passant (#EBT-PAT-0001)',
    patientNameAr: 'بسنت (#EBT-PAT-0001)',
    procedureEn: 'Post & Core · Tooth #36',
    procedureAr: 'دعامة وبناء السن #36',
    doctorId: 'dr-sandy',
    doctorNameEn: 'Dr. Sandy Saad',
    doctorNameAr: 'د. ساندي سعد',
    status: 'ARRIVED',
  },
  {
    id: 'cal-1',
    branchCode: 'BR-A',
    dayCol: 0,
    chairId: 'CHAIR-1',
    time: '10:30 AM',
    patientNameEn: 'Mohamed Khaled',
    patientNameAr: 'محمد خالد',
    procedureEn: 'Root Canal',
    procedureAr: 'علاج الجذور',
    doctorId: 'dr-sandy',
    doctorNameEn: 'Dr. Sandy Saad',
    doctorNameAr: 'د. ساندي سعد',
    status: 'COMPLETED',
  },
  {
    id: 'cal-2',
    branchCode: 'BR-A',
    dayCol: 0,
    chairId: 'CHAIR-2',
    time: '11:30 AM',
    patientNameEn: 'Ibrahim Othman',
    patientNameAr: 'إبراهيم عثمان',
    procedureEn: 'Exam & Diagnosis',
    procedureAr: 'كشف وتشخيص',
    doctorId: 'dr-sara',
    doctorNameEn: 'Dr. Feby Samer',
    doctorNameAr: 'د. فيبي سامر',
    status: 'COMPLETED',
  },
  {
    id: 'cal-3',
    branchCode: 'BR-A',
    dayCol: 1,
    chairId: 'CHAIR-1',
    time: '10:30 AM',
    patientNameEn: 'Khaled Adel',
    patientNameAr: 'خالد عادل',
    procedureEn: 'Teeth Whitening',
    procedureAr: 'تبييض أسنان',
    doctorId: 'dr-sandy',
    doctorNameEn: 'Dr. Sandy Saad',
    doctorNameAr: 'د. ساندي سعد',
    status: 'ARRIVED',
  },
  {
    id: 'cal-5',
    branchCode: 'BR-A',
    dayCol: 2,
    chairId: 'CHAIR-1',
    time: '11:30 AM',
    patientNameEn: 'Siham Youssef',
    patientNameAr: 'سهام يوسف',
    procedureEn: 'Cosmetic Filling',
    procedureAr: 'حشو تجميلي',
    doctorId: 'dr-sara',
    doctorNameEn: 'Dr. Feby Samer',
    doctorNameAr: 'د. فيبي سامر',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-6',
    branchCode: 'BR-A',
    dayCol: 3,
    chairId: 'CHAIR-2',
    time: '02:30 PM',
    patientNameEn: 'Amira Ayman',
    patientNameAr: 'أميرة أيمن',
    procedureEn: 'Surgical Extraction',
    procedureAr: 'خلع جراحي',
    doctorId: 'dr-sandy',
    doctorNameEn: 'Dr. Sandy Saad',
    doctorNameAr: 'د. ساندي سعد',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-7',
    branchCode: 'BR-A',
    dayCol: 4,
    chairId: 'CHAIR-1',
    time: '10:30 AM',
    patientNameEn: 'Yasmine Amin',
    patientNameAr: 'ياسمين أمين',
    procedureEn: 'Cosmetic Filling',
    procedureAr: 'حشو تجميلي',
    doctorId: 'dr-sara',
    doctorNameEn: 'Dr. Feby Samer',
    doctorNameAr: 'د. فيبي سامر',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-9',
    branchCode: 'BR-A',
    dayCol: 5,
    chairId: 'CHAIR-2',
    time: '12:00 PM',
    patientNameEn: 'Ibrahim Hassan',
    patientNameAr: 'إبراهيم حسن',
    procedureEn: 'Exam & Diagnosis',
    procedureAr: 'كشف وتشخيص',
    doctorId: 'dr-sandy',
    doctorNameEn: 'Dr. Sandy Saad',
    doctorNameAr: 'د. ساندي سعد',
    status: 'CONFIRMED',
  },

  // ── Branch B (New Minya · Sandy Abd): Dr. Ahmed Hassan & Dr. Youssef El-Mansy ──
  {
    id: 'cal-4',
    branchCode: 'BR-B',
    dayCol: 0,
    chairId: 'CHAIR-1',
    time: '11:00 AM',
    patientNameEn: 'Amir Amin',
    patientNameAr: 'أمير أمين',
    procedureEn: 'Dental Implant Consult',
    procedureAr: 'استشارة زراعة أسنان',
    doctorId: 'dr-ahmed',
    doctorNameEn: 'Dr. Ahmed Hassan',
    doctorNameAr: 'د. أحمد حسن',
    status: 'COMPLETED',
  },
  {
    id: 'cal-b-1',
    branchCode: 'BR-B',
    dayCol: 1,
    chairId: 'CHAIR-2',
    time: '01:00 PM',
    patientNameEn: 'Rania Tarek',
    patientNameAr: 'رانيا طارق',
    procedureEn: 'Clear Aligners Fitting',
    procedureAr: 'تركيب تقويم شفاف',
    doctorId: 'dr-youssef',
    doctorNameEn: 'Dr. Youssef El-Mansy',
    doctorNameAr: 'د. يوسف المنسي',
    status: 'COMPLETED',
  },
  {
    id: 'cal-b-2',
    branchCode: 'BR-B',
    dayCol: 2,
    chairId: 'CHAIR-1',
    time: '12:30 PM',
    patientNameEn: 'Mostafa Nabil',
    patientNameAr: 'مصطفى نبيل',
    procedureEn: 'Wisdom Tooth Extraction',
    procedureAr: 'خلع ضرس العقل',
    doctorId: 'dr-ahmed',
    doctorNameEn: 'Dr. Ahmed Hassan',
    doctorNameAr: 'د. أحمد حسن',
    status: 'ARRIVED',
  },
  {
    id: 'cal-8',
    branchCode: 'BR-B',
    dayCol: 3,
    chairId: 'CHAIR-3',
    time: '02:15 PM',
    patientNameEn: 'Ahmed Mahmoud',
    patientNameAr: 'أحمد محمود',
    procedureEn: 'Orthodontics',
    procedureAr: 'تقويم أسنان',
    doctorId: 'dr-youssef',
    doctorNameEn: 'Dr. Youssef El-Mansy',
    doctorNameAr: 'د. يوسف المنسي',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-b-3',
    branchCode: 'BR-B',
    dayCol: 4,
    chairId: 'CHAIR-1',
    time: '11:30 AM',
    patientNameEn: 'Hossam El-Din',
    patientNameAr: 'حسام الدين',
    procedureEn: 'Implant Crown Placement',
    procedureAr: 'تركيب تاج على زراعة',
    doctorId: 'dr-ahmed',
    doctorNameEn: 'Dr. Ahmed Hassan',
    doctorNameAr: 'د. أحمد حسن',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-10',
    branchCode: 'BR-B',
    dayCol: 5,
    chairId: 'CHAIR-3',
    time: '10:30 AM',
    patientNameEn: 'Salma Ibrahim',
    patientNameAr: 'سلمى إبراهيم',
    procedureEn: 'Braces Adjustment',
    procedureAr: 'شد وضبط التقويم',
    doctorId: 'dr-youssef',
    doctorNameEn: 'Dr. Youssef El-Mansy',
    doctorNameAr: 'د. يوسف المنسي',
    status: 'CONFIRMED',
  },

  // ── Branch C (Taha Hussein St · Salma El-Masry): Dr. Nadia El-Hariry ──
  {
    id: 'cal-c-1',
    branchCode: 'BR-C',
    dayCol: 0,
    chairId: 'CHAIR-1',
    time: '10:00 AM',
    patientNameEn: 'Yara Adel',
    patientNameAr: 'يارا عادل',
    procedureEn: 'Pediatric Checkup & Fluoride',
    procedureAr: 'كشف أطفال وجلسة فلورايد',
    doctorId: 'dr-nadia',
    doctorNameEn: 'Dr. Nadia El-Hariry',
    doctorNameAr: 'د. نادية الحريري',
    status: 'COMPLETED',
  },
  {
    id: 'cal-c-2',
    branchCode: 'BR-C',
    dayCol: 1,
    chairId: 'CHAIR-1',
    time: '12:00 PM',
    patientNameEn: 'Seif El-Din',
    patientNameAr: 'سيف الدين',
    procedureEn: 'Family Restorative Filling',
    procedureAr: 'حشو ترميمي للأسنان',
    doctorId: 'dr-nadia',
    doctorNameEn: 'Dr. Nadia El-Hariry',
    doctorNameAr: 'د. نادية الحريري',
    status: 'COMPLETED',
  },
  {
    id: 'cal-c-3',
    branchCode: 'BR-C',
    dayCol: 2,
    chairId: 'CHAIR-2',
    time: '01:30 PM',
    patientNameEn: 'Malak Sherif',
    patientNameAr: 'ملك شريف',
    procedureEn: 'Pediatric Pulpotomy',
    procedureAr: 'علاج عصب أطفال',
    doctorId: 'dr-nadia',
    doctorNameEn: 'Dr. Nadia El-Hariry',
    doctorNameAr: 'د. نادية الحريري',
    status: 'ARRIVED',
  },
  {
    id: 'cal-c-4',
    branchCode: 'BR-C',
    dayCol: 3,
    chairId: 'CHAIR-1',
    time: '11:00 AM',
    patientNameEn: 'Nourhan Samir',
    patientNameAr: 'نورهان سمير',
    procedureEn: 'Scaling & Polishing',
    procedureAr: 'تنظيف جير وتلميع',
    doctorId: 'dr-nadia',
    doctorNameEn: 'Dr. Nadia El-Hariry',
    doctorNameAr: 'د. نادية الحريري',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-c-5',
    branchCode: 'BR-C',
    dayCol: 4,
    chairId: 'CHAIR-1',
    time: '03:00 PM',
    patientNameEn: 'Adam Walid',
    patientNameAr: 'آدم وليد',
    procedureEn: 'Space Maintainer Check',
    procedureAr: 'متابعة حافظ مسافة للأطفال',
    doctorId: 'dr-nadia',
    doctorNameEn: 'Dr. Nadia El-Hariry',
    doctorNameAr: 'د. نادية الحريري',
    status: 'CONFIRMED',
  },
  {
    id: 'cal-c-6',
    branchCode: 'BR-C',
    dayCol: 5,
    chairId: 'CHAIR-2',
    time: '12:30 PM',
    patientNameEn: 'Lina Magdy',
    patientNameAr: 'لينا مجدي',
    procedureEn: 'Composite Restoration',
    procedureAr: 'حشو تجميلي للأطفال',
    doctorId: 'dr-nadia',
    doctorNameEn: 'Dr. Nadia El-Hariry',
    doctorNameAr: 'د. نادية الحريري',
    status: 'CONFIRMED',
  },
];

type SlotTemplate = Omit<CalendarSlotItem, 'id' | 'weekOffset'>;

/** Extra visits used to give every surrounding week its own schedule across all 3 branches. */
const EXTRA_WEEK_POOL: SlotTemplate[] = [
  // Branch A
  { branchCode: 'BR-A', dayCol: 0, chairId: 'CHAIR-2', time: '09:45 AM', patientNameEn: 'Hana Mostafa', patientNameAr: 'هنا مصطفى', procedureEn: 'Composite Filling', procedureAr: 'حشو تجميلي', doctorId: 'dr-sara', doctorNameEn: 'Dr. Feby Samer', doctorNameAr: 'د. فيبي سامر', status: 'COMPLETED' },
  { branchCode: 'BR-A', dayCol: 1, chairId: 'CHAIR-1', time: '12:00 PM', patientNameEn: 'Youssef Nabil', patientNameAr: 'يوسف نبيل', procedureEn: 'Crown Prep', procedureAr: 'تحضير تاج', doctorId: 'dr-sandy', doctorNameEn: 'Dr. Sandy Saad', doctorNameAr: 'د. ساندي سعد', status: 'CONFIRMED' },
  { branchCode: 'BR-A', dayCol: 2, chairId: 'CHAIR-2', time: '02:45 PM', patientNameEn: 'Dina Fouad', patientNameAr: 'دينا فؤاد', procedureEn: 'Root Canal', procedureAr: 'علاج الجذور', doctorId: 'dr-sara', doctorNameEn: 'Dr. Feby Samer', doctorNameAr: 'د. فيبي سامر', status: 'CONFIRMED' },
  { branchCode: 'BR-A', dayCol: 3, chairId: 'CHAIR-1', time: '11:00 AM', patientNameEn: 'Mariam Adel', patientNameAr: 'مريم عادل', procedureEn: 'Scaling & Polishing', procedureAr: 'تنظيف وتلميع', doctorId: 'dr-sara', doctorNameEn: 'Dr. Feby Samer', doctorNameAr: 'د. فيبي سامر', status: 'CONFIRMED' },
  { branchCode: 'BR-A', dayCol: 4, chairId: 'CHAIR-1', time: '02:00 PM', patientNameEn: 'Omar Farouk', patientNameAr: 'عمر فاروق', procedureEn: 'Veneer Consultation', procedureAr: 'استشارة فينير', doctorId: 'dr-sandy', doctorNameEn: 'Dr. Sandy Saad', doctorNameAr: 'د. ساندي سعد', status: 'CONFIRMED' },
  { branchCode: 'BR-A', dayCol: 5, chairId: 'CHAIR-2', time: '10:30 AM', patientNameEn: 'Laila Kamal', patientNameAr: 'ليلى كمال', procedureEn: 'Composite Bonding', procedureAr: 'تجميل الأسنان', doctorId: 'dr-sara', doctorNameEn: 'Dr. Feby Samer', doctorNameAr: 'د. فيبي سامر', status: 'CONFIRMED' },
  // Branch B
  { branchCode: 'BR-B', dayCol: 0, chairId: 'CHAIR-1', time: '10:15 AM', patientNameEn: 'Karim Adel', patientNameAr: 'كريم عادل', procedureEn: 'Surgical Extraction', procedureAr: 'خلع جراحي', doctorId: 'dr-ahmed', doctorNameEn: 'Dr. Ahmed Hassan', doctorNameAr: 'د. أحمد حسن', status: 'COMPLETED' },
  { branchCode: 'BR-B', dayCol: 1, chairId: 'CHAIR-3', time: '01:15 PM', patientNameEn: 'Tamer Hosny', patientNameAr: 'تامر حسني', procedureEn: 'Ortho Adjustment', procedureAr: 'متابعة تقويم', doctorId: 'dr-youssef', doctorNameEn: 'Dr. Youssef El-Mansy', doctorNameAr: 'د. يوسف المنسي', status: 'CONFIRMED' },
  { branchCode: 'BR-B', dayCol: 2, chairId: 'CHAIR-1', time: '11:45 AM', patientNameEn: 'Ziad Ashraf', patientNameAr: 'زياد أشرف', procedureEn: 'Implant Surgery', procedureAr: 'جراحة زراعة', doctorId: 'dr-ahmed', doctorNameEn: 'Dr. Ahmed Hassan', doctorNameAr: 'د. أحمد حسن', status: 'CONFIRMED' },
  { branchCode: 'BR-B', dayCol: 3, chairId: 'CHAIR-3', time: '03:30 PM', patientNameEn: 'Nourhan Adel', patientNameAr: 'نورهان عادل', procedureEn: 'Clear Aligner Check', procedureAr: 'متابعة تقويم شفاف', doctorId: 'dr-youssef', doctorNameEn: 'Dr. Youssef El-Mansy', doctorNameAr: 'د. يوسف المنسي', status: 'CONFIRMED' },
  { branchCode: 'BR-B', dayCol: 4, chairId: 'CHAIR-1', time: '12:30 PM', patientNameEn: 'Hassan Ali', patientNameAr: 'حسن علي', procedureEn: 'Implant Follow-Up', procedureAr: 'مراجعة زراعة', doctorId: 'dr-ahmed', doctorNameEn: 'Dr. Ahmed Hassan', doctorNameAr: 'د. أحمد حسن', status: 'CONFIRMED' },
  { branchCode: 'BR-B', dayCol: 5, chairId: 'CHAIR-3', time: '01:00 PM', patientNameEn: 'Mahmoud Ezzat', patientNameAr: 'محمود عزت', procedureEn: 'Retainer Delivery', procedureAr: 'تسليم مثبت التقويم', doctorId: 'dr-youssef', doctorNameEn: 'Dr. Youssef El-Mansy', doctorNameAr: 'د. يوسف المنسي', status: 'CONFIRMED' },
  // Branch C
  { branchCode: 'BR-C', dayCol: 0, chairId: 'CHAIR-1', time: '10:30 AM', patientNameEn: 'Farida Sameh', patientNameAr: 'فريدة سامح', procedureEn: 'Pediatric Checkup', procedureAr: 'كشف أطفال', doctorId: 'dr-nadia', doctorNameEn: 'Dr. Nadia El-Hariry', doctorNameAr: 'د. نادية الحريري', status: 'COMPLETED' },
  { branchCode: 'BR-C', dayCol: 1, chairId: 'CHAIR-2', time: '11:30 AM', patientNameEn: 'Rana Yasser', patientNameAr: 'رنا ياسر', procedureEn: 'Restorative Filling', procedureAr: 'حشو ترميمي', doctorId: 'dr-nadia', doctorNameEn: 'Dr. Nadia El-Hariry', doctorNameAr: 'د. نادية الحريري', status: 'CONFIRMED' },
  { branchCode: 'BR-C', dayCol: 2, chairId: 'CHAIR-1', time: '01:00 PM', patientNameEn: 'Ahmed Zaki', patientNameAr: 'أحمد زكي', procedureEn: 'Family Checkup', procedureAr: 'كشف أسنان العائلة', doctorId: 'dr-nadia', doctorNameEn: 'Dr. Nadia El-Hariry', doctorNameAr: 'د. نادية الحريري', status: 'CONFIRMED' },
  { branchCode: 'BR-C', dayCol: 3, chairId: 'CHAIR-2', time: '02:00 PM', patientNameEn: 'Nada Sherif', patientNameAr: 'ندى شريف', procedureEn: 'Fluoride & Sealant', procedureAr: 'فلورايد ووقاية', doctorId: 'dr-nadia', doctorNameEn: 'Dr. Nadia El-Hariry', doctorNameAr: 'د. نادية الحريري', status: 'CONFIRMED' },
  { branchCode: 'BR-C', dayCol: 4, chairId: 'CHAIR-1', time: '10:00 AM', patientNameEn: 'Salma Fouad', patientNameAr: 'سلمى فؤاد', procedureEn: 'Pediatric Hygiene', procedureAr: 'تنظيف أسنان للأطفال', doctorId: 'dr-nadia', doctorNameEn: 'Dr. Nadia El-Hariry', doctorNameAr: 'د. نادية الحريري', status: 'CONFIRMED' },
  { branchCode: 'BR-C', dayCol: 5, chairId: 'CHAIR-1', time: '12:15 PM', patientNameEn: 'Youssef Karim', patientNameAr: 'يوسف كريم', procedureEn: 'Dental Sealant', procedureAr: 'حشو وقائي للأطفال', doctorId: 'dr-nadia', doctorNameEn: 'Dr. Nadia El-Hariry', doctorNameAr: 'د. نادية الحريري', status: 'CONFIRMED' },
];

/** Deterministic slice per branch so every week has full schedules for BR-A, BR-B, and BR-C. */
function extraWeekItems(weekOffset: number): CalendarSlotItem[] {
  const branches: AppointmentBranchCode[] = ['BR-A', 'BR-B', 'BR-C'];
  const items: CalendarSlotItem[] = [];
  for (const branch of branches) {
    const pool = EXTRA_WEEK_POOL.filter((item) => item.branchCode === branch);
    const shift = (((weekOffset * 2) % pool.length) + pool.length) % pool.length;
    for (let k = 0; k < 4; k += 1) {
      const template = pool[(shift + k) % pool.length];
      items.push({
        ...template,
        id: `wk-${weekOffset}-${branch}-${k}`,
        weekOffset,
      });
    }
  }
  return items;
}

/** Most recent Saturday at local midnight (Egypt weeks start Saturday). */
function saturdayStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  return d;
}

export const CALENDAR_ITEMS_KEY = 'ebtesamty_calendar_items_v1';

const FUTURE_DISALLOWED_STATUSES: AppointmentStatus[] = [
  'ARRIVED',
  'IN_CHAIR',
  'COMPLETED',
  'NO_SHOW',
];

const PAST_ALLOWED_STATUSES: AppointmentStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

function pastOutcomeForId(id: string): AppointmentStatus {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const mod = hash % 7;
  if (mod === 0) return 'NO_SHOW';
  if (mod === 1) return 'CANCELLED';
  return 'COMPLETED';
}

function normalizeFutureCalendarItem(
  item: CalendarSlotItem,
  todayIso = clinicTodayISO()
): CalendarSlotItem {
  const itemDate = calendarItemDate(item);
  if (itemDate > todayIso && FUTURE_DISALLOWED_STATUSES.includes(item.status)) {
    return { ...item, status: 'CONFIRMED' };
  }
  if (itemDate < todayIso && !PAST_ALLOWED_STATUSES.includes(item.status)) {
    return { ...item, status: pastOutcomeForId(item.id) };
  }
  return item;
}

const INITIAL_CALENDAR_STATE: CalendarSlotItem[] = [
  ...INITIAL_CALENDAR_ITEMS.map((it) => ({ ...it, weekOffset: 0 })),
  ...[-2, -1, 1, 2, 3].flatMap((offset) => extraWeekItems(offset)),
].map((it) => normalizeFutureCalendarItem(it));

const isoFromDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;

/** Egypt week starts Saturday; offset 0 = current week. */
function weekStartSaturday(offsetWeeks: number): Date {
  const now = new Date();
  const daysSinceSat = (now.getDay() + 1) % 7;
  const sat = new Date(now);
  sat.setDate(now.getDate() - daysSinceSat + offsetWeeks * 7);
  sat.setHours(0, 0, 0, 0);
  return sat;
}

function calendarItemDate(item: CalendarSlotItem, dayCol = item.dayCol): string {
  const d = weekStartSaturday(item.weekOffset ?? 0);
  d.setDate(d.getDate() + dayCol);
  return isoFromDate(d);
}

function calendarItemBranchCode(item: CalendarSlotItem): AppointmentBranchCode {
  if (item.branchCode) return item.branchCode;
  if (item.doctorId === 'dr-ahmed' || item.doctorId === 'dr-karim' || item.doctorId === 'dr-youssef') {
    return 'BR-B';
  }
  if (item.doctorId === 'dr-nadia') return 'BR-C';
  return 'BR-A';
}

/** Full shared-store record for a calendar row. */
export function calendarItemToAppointment(
  item: CalendarSlotItem,
  status: AppointmentStatus
): AppointmentRecord {
  const branchCode = calendarItemBranchCode(item);
  const branch = MINYA_BRANCHES.find((b) => b.code === branchCode);
  const idMatch = item.patientNameEn.match(/\(#([^)]+)\)/);
  const patientName =
    item.patientNameEn.replace(/\(#[^)]*\)/, '').trim() || 'Patient';
  return {
    id: item.id,
    patientId: item.patientId || (idMatch ? idMatch[1].trim() : undefined),
    patientName,
    branchCode,
    branchNameEn: branch?.nameEn ?? 'Minya – Branch A',
    branchNameAr: branch?.nameAr ?? 'المنيا – الفرع أ',
    doctorNameEn: item.doctorNameEn,
    doctorNameAr: item.doctorNameAr,
    serviceEn: item.procedureEn,
    serviceAr: item.procedureAr,
    date: calendarItemDate(item),
    time: item.time,
    status,
  };
}

/**
 * Reconciles reception calendar rows into the shared appointment store, so
 * dashboards see visits confirmed or moved in reception even if the calendar
 * has not been opened this session. Terminal records stay untouched; active
 * calendar rows supply the latest date, time, doctor and status.
 */
export function publishCalendarAppointmentsToStore(source?: CalendarSlotItem[]): void {
  if (typeof window === 'undefined') return;
  const rawRows =
    source ?? readLocalJson<CalendarSlotItem[]>(CALENDAR_ITEMS_KEY, INITIAL_CALENDAR_STATE);
  if (!Array.isArray(rawRows)) return;
  const todayIso = clinicTodayISO();
  const stored = listAppointments();
  const cancelledIds = new Set(stored.filter((row) => row.status === 'CANCELLED').map((row) => row.id));
  const rawIds = new Set(rawRows.map((row) => row.id));
  const missingSeeds = INITIAL_CALENDAR_STATE.filter(
    (seed) => !rawIds.has(seed.id) && !cancelledIds.has(seed.id)
  );
  const rows = [...rawRows, ...missingSeeds].map((row) =>
    normalizeFutureCalendarItem(row, todayIso)
  );
  const calendarById = new Map(
    rows
      .filter((row) => row.status !== 'CANCELLED')
      .map((row) => [row.id, row] as const)
  );
  const reconciled = stored.map((record) => {
    const item = calendarById.get(record.id);
    if (!item || ['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(record.status)) {
      return record;
    }
    const fromCalendar = calendarItemToAppointment(item, item.status);
    return {
      ...record,
      ...fromCalendar,
      patientId: fromCalendar.patientId ?? record.patientId,
      branchCode: record.branchCode || fromCalendar.branchCode,
      isPast: false,
      cancelReason: undefined,
    };
  });
  const storedIds = new Set(stored.map((row) => row.id));
  const missing = rows
    .filter((row) => row.status !== 'CANCELLED' && !storedIds.has(row.id))
    .map((row) => calendarItemToAppointment(row, row.status));
  const next = [...missing, ...reconciled];
  if (JSON.stringify(next) !== JSON.stringify(stored)) saveAppointments(next);
}

const CALENDAR_STATUS_STYLES: Record<AppointmentStatus, string> = {
  CONFIRMED: 'bg-[#EDE9FE]/90 border-[#C4B5FD] text-[#4C1D95]',
  RESCHEDULED: 'bg-amber-50 border-amber-300 text-amber-900',
  ARRIVED: 'bg-sky-50 border-sky-300 text-sky-900',
  IN_CHAIR: 'bg-blue-100/90 border-blue-300 text-blue-950',
  COMPLETED: 'bg-[#D1FAE5]/90 border-[#6EE7B7] text-[#065F46]',
  NO_SHOW: 'bg-rose-50 border-rose-300 text-rose-900',
  CANCELLED: 'bg-slate-100 border-slate-300 text-slate-500',
};

const STATUS_ACTION_ORDER: AppointmentStatus[] = [
  'CONFIRMED',
  'ARRIVED',
  'IN_CHAIR',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
];

export function SmartClinicCalendar({
  role = 'RECEPTIONIST',
  loggedInDoctorNameEn = 'Dr. Sandy Saad',
  loggedInDoctorNameAr = 'د. ساندي سعد',
  branchCode = 'ALL',
}: {
  role?: 'OWNER_ADMIN' | 'DENTIST' | 'RECEPTIONIST' | 'PATIENT';
  loggedInDoctorNameEn?: string;
  loggedInDoctorNameAr?: string;
  branchCode?: AppointmentBranchCode | 'ALL';
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);
  const isDentist = role === 'DENTIST';

  const [viewMode, setViewMode] = useState<'week' | 'chairs' | 'month'>('week');
  const [selectedDoctor, setSelectedDoctor] = useState<string>(isDentist ? 'dr-sandy' : 'ALL');
  useEffect(() => {
    if (!isDentist) setSelectedDoctor('ALL');
  }, [branchCode, isDentist]);
  const [activeWeekTab, setActiveWeekTab] = useState<number>(2);
  const [items, setItems] = usePersistedState<CalendarSlotItem[]>(
    CALENDAR_ITEMS_KEY,
    INITIAL_CALENDAR_STATE
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [clashAlert, setClashAlert] = useState<string | null>(null);
  const [rescheduleToast, setRescheduleToast] = useState<string | null>(null);

  // Front-desk appointment manager (status changes + reschedule)
  const [managingAppt, setManagingAppt] = useState<CalendarSlotItem | null>(null);
  const [manageDate, setManageDate] = useState('');
  const [manageTime, setManageTime] = useState('');
  const [manageError, setManageError] = useState<string | null>(null);
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [reminderAppt, setReminderAppt] = useState<AppointmentRecord | null>(null);

  // Doctor -> Receptionist Schedule Change Request state
  const [scheduleRequests, setScheduleRequests] = useState<DoctorScheduleChangeRequest[]>([]);
  const [requestModalTarget, setRequestModalTarget] = useState<CalendarSlotItem | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestReason, setRequestReason] = useState<DoctorScheduleChangeRequest['reason']>('Reschedule Visit');
  const [requestNote, setRequestNote] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const loadRequests = () => {
      try {
        const raw = window.localStorage.getItem(DOCTOR_SCHEDULE_REQUESTS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setScheduleRequests(parsed);
        }
      } catch {}
    };
    loadRequests();
    window.addEventListener('storage', loadRequests);
    window.addEventListener(DOCTOR_SCHEDULE_REQUESTS_EVENT, loadRequests);
    return () => {
      window.removeEventListener('storage', loadRequests);
      window.removeEventListener(DOCTOR_SCHEDULE_REQUESTS_EVENT, loadRequests);
    };
  }, []);

  const saveScheduleRequests = (next: DoctorScheduleChangeRequest[]) => {
    setScheduleRequests(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(DOCTOR_SCHEDULE_REQUESTS_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event(DOCTOR_SCHEDULE_REQUESTS_EVENT));
      } catch {}
    }
  };

  const handleOpenDoctorRequestModal = (appt?: CalendarSlotItem) => {
    setRequestModalTarget(appt || null);
    setRequestReason(appt ? 'Reschedule Visit' : 'Block Time Slot');
    setRequestNote(
      appt
        ? `Please reschedule ${appt.patientNameEn} (${appt.procedureEn} at ${appt.time}) and confirm via WhatsApp.`
        : 'Please block 2:00 PM – 3:00 PM on Chair 1 for surgical follow-up.'
    );
    setShowRequestModal(true);
  };

  const handleSubmitDoctorScheduleRequest = () => {
    const newReq: DoctorScheduleChangeRequest = {
      id: `DSR-${Date.now()}`,
      appointmentId: requestModalTarget?.id || 'SLOT-BLOCK',
      patientNameEn: requestModalTarget?.patientNameEn || 'Schedule Slot Block',
      patientNameAr: requestModalTarget?.patientNameAr || 'حجز/إغلاق فترة زمنية',
      currentSlot: requestModalTarget
        ? `${requestModalTarget.time} · ${requestModalTarget.chairId}`
        : 'Chair 1 · 2:00 PM',
      doctorNameEn: loggedInDoctorNameEn,
      doctorNameAr: loggedInDoctorNameAr,
      branchNameEn: 'Minya – Branch A',
      reason: requestReason,
      note: requestNote.trim() || requestReason,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
    };
    saveScheduleRequests([newReq, ...scheduleRequests]);
    setShowRequestModal(false);
    setRescheduleToast(
      c(
        `Schedule change request ("${requestReason}") sent to Minya – Branch A Reception (Mariam Hanna).`,
        `تم إرسال طلب تعديل الجدول ("${requestReason}") إلى استقبال المنيا – الفرع أ (مريم حنا).`
      )
    );
  };

  const handleReceptionCompleteDoctorRequest = (reqId: string) => {
    const next = scheduleRequests.map((r) =>
      r.id === reqId ? { ...r, status: 'COMPLETED' as const } : r
    );
    saveScheduleRequests(next);
    setRescheduleToast(
      c(
        'Doctor schedule change executed & patient notified via Clinic WhatsApp.',
        'تم تنفيذ طلب الطبيب لتعديل الموعد وإبلاغ المريض عبر واتساب العيادة.'
      )
    );
  };

  // Reconcile persisted reception moves before loading shared records back into
  // the grid, otherwise stale store dates can snap older bookings back.
  const hydratedAppointmentsRef = React.useRef(false);
  useEffect(() => {
    if (hydratedAppointmentsRef.current) return;
    hydratedAppointmentsRef.current = true;
    publishCalendarAppointmentsToStore(items);
  }, [items]);

  useEffect(() => {
    const loadBookedAppointments = () => {
      const stored = listAppointments();
      const todayWeekStart = saturdayStart(new Date()).getTime();

      const toCalendarItem = (
        p: (typeof stored)[number],
        existing?: CalendarSlotItem
      ): CalendarSlotItem => {
        // Place every real booking on the weekday of its own stored date,
        // inside the week that actually contains that date.
        const visitDay = new Date(`${p.date}T12:00:00`);
        const safeVisitDay = Number.isNaN(visitDay.getTime()) ? new Date() : visitDay;
        const dayCol = (safeVisitDay.getDay() + 1) % 7;
        const weekOffset = Math.round(
          (saturdayStart(safeVisitDay).getTime() - todayWeekStart) / (7 * 86400000)
        );
        const doctorName = p.doctorNameEn || '';
        const doctorId: CalendarSlotItem['doctorId'] = /sandy/i.test(doctorName)
          ? 'dr-sandy'
          : /feby|sara/i.test(doctorName)
          ? 'dr-sara'
          : /youssef|mansy/i.test(doctorName)
          ? 'dr-youssef'
          : /nadia|hariry/i.test(doctorName)
          ? 'dr-nadia'
          : 'dr-ahmed';
        const chairId: CalendarSlotItem['chairId'] =
          existing?.chairId ??
          (doctorId === 'dr-sandy' ? 'CHAIR-1' : doctorId === 'dr-sara' ? 'CHAIR-2' : 'CHAIR-3');
        return {
          id: p.id,
          patientId: p.patientId,
          branchCode: p.branchCode,
          dayCol,
          weekOffset,
          chairId,
          time: p.time,
          patientNameEn: p.patientName || 'Patient',
          patientNameAr: p.patientName || 'مريض',
          procedureEn: p.serviceEn,
          procedureAr: p.serviceAr,
          doctorId,
          doctorNameEn: p.doctorNameEn,
          doctorNameAr: p.doctorNameAr,
          status: p.status,
        };
      };

      setItems((prev) => {
        const todayIso = clinicTodayISO();
        const visible = stored.filter((p) => p.status !== 'CANCELLED' && !p.isPast);
        const visibleById = new Map(visible.map((p) => [p.id, p]));
        const hiddenIds = new Set(
          stored.filter((p) => p.status === 'CANCELLED' || p.isPast).map((p) => p.id)
        );
        const prevIds = new Set(prev.map((item) => item.id));
        const seedAdditions = INITIAL_CALENDAR_STATE.filter(
          (seed) => !prevIds.has(seed.id) && !hiddenIds.has(seed.id)
        );
        const kept = [...prev, ...seedAdditions]
          .filter((item) => !hiddenIds.has(item.id))
          .map((item) => {
            const record = visibleById.get(item.id);
            return normalizeFutureCalendarItem(
              record ? toCalendarItem(record, item) : item,
              todayIso
            );
          });
        const keptIds = new Set(kept.map((item) => item.id));
        const additions = visible
          .filter((p) => !keptIds.has(p.id))
          .map((p) => normalizeFutureCalendarItem(toCalendarItem(p), todayIso));
        return [...additions, ...kept];
      });
    };
    loadBookedAppointments();
    window.addEventListener('storage', loadBookedAppointments);
    window.addEventListener(APPOINTMENTS_EVENT, loadBookedAppointments);
    return () => {
      window.removeEventListener('storage', loadBookedAppointments);
      window.removeEventListener(APPOINTMENTS_EVENT, loadBookedAppointments);
    };
  }, [setItems]);

  // Waiting List & No-Shows state (Image 6)
  const [waitingList, setWaitingList] = useState([
    {
      id: 'wl-1',
      initial: 'S',
      color: 'bg-purple-600',
      nameEn: 'Salma Fouad',
      nameAr: 'سلمى فؤاد',
      prefEn: 'Prefers after 3 PM · Cleaning',
      prefAr: 'تفضل بعد 3 عصراً · تنظيف جير',
      called: false,
    },
    {
      id: 'wl-2',
      initial: 'T',
      color: 'bg-blue-600',
      nameEn: 'Khaled Omar',
      nameAr: 'خالد عمر',
      prefEn: 'Any time today · Follow-up',
      prefAr: 'أي وقت اليوم · متابعة',
      called: false,
    },
    {
      id: 'wl-3',
      initial: 'L',
      color: 'bg-emerald-600',
      nameEn: 'Mona Ragab',
      nameAr: 'منى رجب',
      prefEn: 'Saturday or Sunday · Check-up',
      prefAr: 'السبت أو الأحد · كشف دوري',
      called: false,
    },
  ]);

  const [noShows, setNoShows] = useState([
    {
      id: 'ns-1',
      nameEn: 'Tarek Youssef',
      nameAr: 'طارق يوسف',
      missedSlot: 'Yesterday 4:00 PM · Root Canal',
      status: 'Awaiting Recall',
    },
  ]);

  const [newWaitName, setNewWaitName] = useState('');
  const [newWaitPref, setNewWaitPref] = useState('Any time today · Cleaning');
  const [showAddWaitModal, setShowAddWaitModal] = useState(false);

  // WhatsApp Template & Lead Time State (Image 5)
  const [waLeadTime, setWaLeadTime] = useState('24 hours before visit');
  const [waTemplate, setWaTemplate] = useState(
    'Reminder: your appointment is tomorrow at 5:30 PM — Smile Clinic, 3rd floor.'
  );
  const [editingTemplate, setEditingTemplate] = useState(false);

  // CRITICAL PRIVACY & RBAC GUARD:
  // Patients NEVER see the multi-chair staff calendar, cancellation waiting list, or internal Clinic WhatsApp console.
  if (role === 'PATIENT') {
    return <PatientPersonalAppointmentsView />;
  }

  // ── Dynamic week computation ──────────────────────────────────────────────
  // Egypt week starts Saturday. weekOffset=0 means the current week.
  const getWeekStartSaturday = (offsetWeeks: number): Date => weekStartSaturday(offsetWeeks);

  // Build week tabs from 2 weeks back up to the furthest week holding a booking.
  const maxWeekOffset = Math.max(3, ...items.map((it) => it.weekOffset ?? 0));
  const weekTabs = Array.from({ length: maxWeekOffset + 3 }, (_, i) => {
    const offset = i - 2; // tabs start at -2; offset 0 is the current week
    const sat = getWeekStartSaturday(offset);
    const fri = new Date(sat);
    fri.setDate(sat.getDate() + 6);
    const fmtDay = (d: Date) => d.getDate();
    const fmtMonEn = (d: Date) => d.toLocaleString('en-US', { month: 'short' });
    const fmtMonAr = (d: Date) => d.toLocaleString('ar-EG', { month: 'long' });
    const sameMon = sat.getMonth() === fri.getMonth();
    const labelEn = sameMon
      ? `${fmtMonEn(sat)} ${fmtDay(sat)}–${fmtDay(fri)}`
      : `${fmtMonEn(sat)} ${fmtDay(sat)}–${fmtMonEn(fri)} ${fmtDay(fri)}`;
    const labelAr = sameMon
      ? `${fmtDay(sat)}-${fmtDay(fri)} ${fmtMonAr(sat)}`
      : `${fmtDay(sat)} ${fmtMonAr(sat)}-${fmtDay(fri)} ${fmtMonAr(fri)}`;
    return { offset, labelEn, labelAr };
  });

  // The currently-viewed week offset: tab index 2 = current week (offset 0)
  const currentWeekOffset = weekTabs[activeWeekTab]?.offset ?? 0;

  // Build weekDays for the selected week
  const weekSat = getWeekStartSaturday(currentWeekOffset);
  const DAY_NAMES_EN = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const DAY_NAMES_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const weekDays = Array.from({ length: 7 }, (_, col) => {
    const d = new Date(weekSat);
    d.setDate(weekSat.getDate() + col);
    return {
      col,
      dayEn: DAY_NAMES_EN[col],
      dayAr: DAY_NAMES_AR[col],
      num: d.getDate(),
      subEn: d.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
      subAr: d.toLocaleString('ar-EG', { month: 'long', day: 'numeric' }),
      date: d,
    };
  });

  const dateForItem = (item: CalendarSlotItem, dayCol = item.dayCol): string =>
    calendarItemDate(item, dayCol);

  const weekOffsetForDate = (iso: string): number => {
    const target = new Date(`${iso}T12:00:00`);
    const diff = saturdayStart(target).getTime() - saturdayStart(new Date()).getTime();
    return Math.round(diff / (7 * 86400000));
  };

  // Demo rows seeded straight into the calendar have no shared-store record.
  // When the front desk touches one, publish a full record so the dashboard,
  // patient portal and owner analytics see the same appointment + status.
  const syncCalendarItem = (
    item: CalendarSlotItem,
    status: AppointmentStatus,
    changes: Partial<AppointmentRecord> = {}
  ) => {
    if (updateAppointmentStatus(item.id, status, changes)) return;
    upsertAppointment({ ...calendarItemToAppointment(item, status), ...changes });
  };

  const openAppointmentManager = (appt: CalendarSlotItem) => {
    setManagingAppt(appt);
    setManageDate(dateForItem(appt));
    setManageTime(appt.time);
    setManageError(null);
  };

  const openReminderComposer = (appt: CalendarSlotItem) => {
    const stored = listAppointments().find((record) => record.id === appt.id);
    const record = stored || calendarItemToAppointment(appt, appt.status);
    if (!stored) upsertAppointment(record);
    setReminderAppt(record);
  };

  const applyAppointmentStatus = (appt: CalendarSlotItem, status: AppointmentStatus) => {
    const isCancelling = status === 'CANCELLED';
    setItems((prev) =>
      isCancelling
        ? prev.filter((i) => i.id !== appt.id)
        : prev.map((i) => (i.id === appt.id ? { ...i, status } : i))
    );
    syncCalendarItem(appt, status);
    setRescheduleToast(
      isCancelling
        ? c(
            `${appt.patientNameEn}'s appointment was cancelled and the slot is now free.`,
            `تم إلغاء موعد ${appt.patientNameAr} وتحرير الوقت في الجدول.`
          )
        : c(
            `${appt.patientNameEn} → ${appointmentStatusLabel(status, false)} · patient portal updated.`,
            `${appt.patientNameAr} → ${appointmentStatusLabel(status, true)} · تم تحديث بوابة المريض.`
          )
    );
    setManagingAppt(null);
  };

  const handleManageReschedule = () => {
    if (!managingAppt) return;
    const iso = manageDate;
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    const isClosedFriday = isValidDate && new Date(`${iso}T12:00:00`).getDay() === 5;
    if (!isValidDate || iso < clinicTodayISO() || isClosedFriday) {
      setManageError(
        c(
          'Pick an upcoming Saturday–Thursday date (Fridays are closed).',
          'اختر تاريخاً قادماً من السبت إلى الخميس (الجمعة إجازة).'
        )
      );
      return;
    }

    const record = listAppointments().find((r) => r.id === managingAppt.id);
    const takenInStore = isSlotTaken({
      date: iso,
      time: manageTime,
      doctorNameEn: managingAppt.doctorNameEn,
      branchCode: record?.branchCode,
      excludeId: managingAppt.id,
    });
    const clashInCalendar = items.some(
      (i) =>
        i.id !== managingAppt.id &&
        i.status !== 'CANCELLED' &&
        i.doctorNameEn === managingAppt.doctorNameEn &&
        i.time === manageTime &&
        dateForItem(i) === iso
    );
    if (takenInStore || clashInCalendar) {
      setManageError(
        c(
          'That slot is already booked with this doctor — choose another time.',
          'هذا الوقت محجوز بالفعل لدى هذا الطبيب — اختر وقتاً آخر.'
        )
      );
      return;
    }

    const dayCol = (new Date(`${iso}T12:00:00`).getDay() + 1) % 7;
    const weekOffset = weekOffsetForDate(iso);
    setItems((prev) =>
      prev.map((i) =>
        i.id === managingAppt.id
          ? { ...i, dayCol, weekOffset, time: manageTime, status: 'RESCHEDULED' }
          : i
      )
    );
    syncCalendarItem(
      { ...managingAppt, dayCol, weekOffset, time: manageTime },
      'RESCHEDULED',
      { date: iso, time: manageTime, isPast: false, cancelReason: undefined }
    );
    setRescheduleToast(
      c(
        `${managingAppt.patientNameEn} moved to ${iso} at ${manageTime} · patient portal updated.`,
        `تم نقل موعد ${managingAppt.patientNameAr} إلى ${iso} الساعة ${manageTime} · تم تحديث بوابة المريض.`
      )
    );
    setManagingAppt(null);
  };

  // Build month grid for current viewed month
  const monthDate = new Date(weekSat);
  const monthYear = monthDate.getFullYear();
  const monthMonth = monthDate.getMonth();
  const firstDayOfMonth = new Date(monthYear, monthMonth, 1);
  // Adjust start to nearest Saturday before/on 1st
  const firstDow = firstDayOfMonth.getDay(); // 0=Sun..6=Sat
  const calStart = new Date(firstDayOfMonth);
  calStart.setDate(firstDayOfMonth.getDate() - ((firstDow + 1) % 7));
  const calCells: Date[] = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(calStart);
    d.setDate(calStart.getDate() + i);
    return d;
  });
  // ─────────────────────────────────────────────────────────────────────────

  const chairs = [
    { id: 'CHAIR-1' as const, labelEn: 'Chair 1 — Main Operatory', labelAr: 'كرسي ١ — العيادة الرئيسية' },
    { id: 'CHAIR-2' as const, labelEn: 'Chair 2 — Surgical Suite', labelAr: 'كرسي ٢ — جراحة وزراعة' },
    { id: 'CHAIR-3' as const, labelEn: 'Chair 3 — Ortho & Hygiene', labelAr: 'كرسي ٣ — تقويم وتجميل' },
  ];

  const allDoctors = [
    { id: 'dr-sandy', branch: 'BR-A' as const, labelEn: 'Dr. Sandy Saad', labelAr: 'د. ساندي سعد' },
    { id: 'dr-sara', branch: 'BR-A' as const, labelEn: 'Dr. Feby Samer', labelAr: 'د. فيبي سامر' },
    { id: 'dr-ahmed', branch: 'BR-B' as const, labelEn: 'Dr. Ahmed Hassan', labelAr: 'د. أحمد حسن' },
    { id: 'dr-youssef', branch: 'BR-B' as const, labelEn: 'Dr. Youssef El-Mansy', labelAr: 'د. يوسف المنسي' },
    { id: 'dr-nadia', branch: 'BR-C' as const, labelEn: 'Dr. Nadia El-Hariry', labelAr: 'د. نادية الحريري' },
  ];
  const doctors = [
    { id: 'ALL', labelEn: 'All Doctors', labelAr: 'كل الأطباء' },
    ...allDoctors.filter((doc) => branchCode === 'ALL' || doc.branch === branchCode),
  ];

  // When role === 'DENTIST', show ONLY the logged-in doctor's own schedule
  const filteredItems = items.filter((it) => {
    if (branchCode !== 'ALL' && calendarItemBranchCode(it) !== branchCode) return false;
    if (isDentist) {
      return (
        it.doctorId === 'dr-sandy' ||
        it.doctorNameEn.toLowerCase().includes(loggedInDoctorNameEn.toLowerCase())
      );
    }
    return selectedDoctor === 'ALL' || it.doctorId === selectedDoctor;
  });

  // Cards belong to exactly one week; only the week selected in the tabs is rendered.
  const currentWeekItems = filteredItems.filter(
    (it) => (it.weekOffset ?? 0) === currentWeekOffset
  );

  // Handle Drag-and-Drop Reschedule with Automatic Clash Prevention
  const handleDropOnDay = (targetDayCol: number) => {
    if (!draggedId) return;
    const draggedItem = items.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    // Automatic Clash Prevention check: same week, same day, same chair, same time
    const clash = items.find(
      (i) =>
        i.id !== draggedItem.id &&
        (i.weekOffset ?? 0) === (draggedItem.weekOffset ?? 0) &&
        i.dayCol === targetDayCol &&
        i.chairId === draggedItem.chairId &&
        i.time === draggedItem.time
    );

    if (clash) {
      setClashAlert(
        c(
          `Automatic Clash Prevention: ${draggedItem.chairId} is already booked at ${draggedItem.time} for ${clash.patientNameEn}. Double-booking prevented!`,
          `منع التعارض التلقائي: ${draggedItem.chairId} محجوز بالفعل الساعة ${draggedItem.time} للمريض ${clash.patientNameAr}. لا يسمح النظام بحجزين على نفس الكرسي في نفس الوقت!`
        )
      );
      setDraggedId(null);
      return;
    }

    setClashAlert(null);
    setItems((prev) =>
      prev.map((i) => (i.id === draggedItem.id ? { ...i, dayCol: targetDayCol } : i))
    );
    if (isActiveAppointment(draggedItem.status)) {
      syncCalendarItem(
        { ...draggedItem, dayCol: targetDayCol },
        'RESCHEDULED',
        {
          date: dateForItem(draggedItem, targetDayCol),
          time: draggedItem.time,
          isPast: false,
          cancelReason: undefined,
        }
      );
    }
    const dayObj = weekDays.find((d) => d.col === targetDayCol);
    setRescheduleToast(
      c(
        `Moved ${draggedItem.patientNameEn} to ${dayObj?.dayEn} ${dayObj?.num} (${draggedItem.time}) & queued WhatsApp update.`,
        `تم نقل موعد ${draggedItem.patientNameAr} إلى ${dayObj?.dayAr} ${dayObj?.num} (${draggedItem.time}) في ثانية واحدة.`
      )
    );
    setDraggedId(null);
  };

  const handleDropOnChair = (targetChairId: 'CHAIR-1' | 'CHAIR-2' | 'CHAIR-3') => {
    if (!draggedId) return;
    const draggedItem = items.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    const clash = items.find(
      (i) =>
        i.id !== draggedItem.id &&
        (i.weekOffset ?? 0) === (draggedItem.weekOffset ?? 0) &&
        i.dayCol === draggedItem.dayCol &&
        i.chairId === targetChairId &&
        i.time === draggedItem.time
    );

    if (clash) {
      setClashAlert(
        c(
          `Automatic Clash Prevention: ${targetChairId} is already occupied at ${draggedItem.time} by ${clash.patientNameEn}.`,
          `منع التعارض التلقائي: ${targetChairId} مشغول بالفعل في نفس الموعد (${draggedItem.time}).`
        )
      );
      setDraggedId(null);
      return;
    }

    setClashAlert(null);
    setItems((prev) =>
      prev.map((i) => (i.id === draggedItem.id ? { ...i, chairId: targetChairId } : i))
    );
    setRescheduleToast(
      c(
        `Reassigned ${draggedItem.patientNameEn} to ${targetChairId} (${draggedItem.time}).`,
        `تم نقل ${draggedItem.patientNameAr} إلى ${targetChairId} بنجاح.`
      )
    );
    setDraggedId(null);
  };

  const handleFillCancelledSlot = (waitItem: (typeof waitingList)[0]) => {
    setWaitingList((prev) =>
      prev.map((w) => (w.id === waitItem.id ? { ...w, called: true } : w))
    );
    const newCalItem: CalendarSlotItem = {
      id: `cal-fill-${Date.now()}`,
      dayCol: 2,
      weekOffset: currentWeekOffset,
      chairId: 'CHAIR-2',
      time: '04:00 PM',
      patientNameEn: waitItem.nameEn,
      patientNameAr: waitItem.nameAr,
      procedureEn: 'Cleaning (Filled from Waiting List)',
      procedureAr: 'تنظيف جير (من قائمة الانتظار)',
      doctorId: 'dr-ahmed',
      doctorNameEn: 'Dr. Ahmed Hassan',
      doctorNameAr: 'د. أحمد حسن',
      status: 'CONFIRMED',
    };
    setItems((prev) => [newCalItem, ...prev]);
    syncCalendarItem(newCalItem, 'CONFIRMED');
    setRescheduleToast(
      c(
        `4:00 PM slot on Chair 2 filled immediately with ${waitItem.nameEn} from the waiting list!`,
        `تم ملء موعد الساعة 4:00 على كرسي 2 فوراً بالمريض ${waitItem.nameAr} من قائمة الانتظار!`
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================
          IMAGE 4: MULTI-COLUMN / MULTI-DAY COLOR-CODED DRAG & DROP CALENDAR
         ==================================================================== */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        {/* Top Calendar Controls Bar matching Image 4 (Scoped for Doctor vs Front Desk) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            {!isDentist ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowBookingDrawer(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{c('New Appointment', 'موعد جديد')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddWaitModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-extrabold flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c('Waiting List', 'قائمة الانتظار')}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black">
                    {waitingList.length}
                  </span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenDoctorRequestModal()}
                className="px-4 py-2 rounded-xl bg-[#0B2528] hover:bg-[#153D42] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <BellRing className="w-4 h-4 text-[#C8A96E]" />
                <span>
                  {c(
                    'Request Change / Notify Reception',
                    'طلب تعديل الجدول / إبلاغ الاستقبال'
                  )}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveWeekTab(2)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold"
            >
              {c('Today', 'اليوم')}
            </button>

            {/* View Switcher: Week / Chair Columns / Month */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'week' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {c('Weekly', 'أسبوعي')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('chairs')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'chairs' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {c('Chair Columns', 'أعمدة الكراسي')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'month' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {c('Monthly', 'شهري')}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs tabular-nums">
              {currentWeekItems.length}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>
                {isDentist
                  ? c(
                      `My Clinical Schedule — ${loggedInDoctorNameEn}`,
                      `جدول مواعيدي — ${loggedInDoctorNameAr}`
                    )
                  : c('Calendar', 'التقويم')}
              </span>
            </h2>
          </div>
        </div>

        {/* Week Range Selector Tabs — dynamic real dates */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/70 text-xs font-bold">
          {weekTabs.map((wk, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveWeekTab(idx)}
              className={`py-2 px-3 rounded-xl text-center transition-all ${
                activeWeekTab === idx
                  ? 'bg-blue-100/90 text-blue-800 font-extrabold shadow-2xs'
                  : 'text-slate-500 hover:bg-white'
              }`}
            >
              {isAr ? wk.labelAr : wk.labelEn}
              {wk.offset === 0 && (
                <span className="block text-[9px] font-black text-blue-600 mt-0.5">
                  {c('Current', 'الأسبوع الحالي')}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Doctor Filter Pills & Drag-and-Drop Hint (Hidden for Dentist — Dentist views own schedule only) */}
        {!isDentist ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-semibold">
              {c(
                '💡 Drag any appointment card and drop it into a new day or chair column to reschedule in 1 second (with automatic clash prevention).',
                '💡 اسحب أي موعد وأفلته في يوم أو كرسي آخر لنقله في ثانية واحدة (مع منع التعارض التلقائي).'
              )}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {doctors.map((doc) => {
                const active = selectedDoctor === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all active:scale-95 ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isAr ? doc.labelAr : doc.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-2.5 text-xs">
            <span className="font-bold text-slate-700">
              {c(
                `Showing only ${loggedInDoctorNameEn}'s personal schedule at Minya – Branch A (${currentWeekItems.length} scheduled visits).`,
                `يعرض فقط جدول مواعيد ${loggedInDoctorNameAr} في المنيا – الفرع أ (${currentWeekItems.length} مواعيد مجدولة).`
              )}
            </span>
            <span className="text-slate-500 font-semibold">
              {c(
                'View-Only Schedule: Use "Request Change" on any visit to notify Reception (Mariam Hanna).',
                'جدول للعرض فقط: اضغط "طلب تعديل" لإبلاغ موظفة الاستقبال (مريم حنا).'
              )}
            </span>
          </div>
        )}

        {/* Live Doctor Schedule Change Requests Banner for Receptionist / Owner */}
        {!isDentist && scheduleRequests.filter((r) => r.status === 'PENDING').length > 0 && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                <BellRing className="w-4 h-4 text-amber-600" />
                <span>
                  {c(
                    `Live Doctor Schedule Change Requests (${
                      scheduleRequests.filter((r) => r.status === 'PENDING').length
                    })`,
                    `طلبات تعديل الجدول الواردة من الأطباء (${
                      scheduleRequests.filter((r) => r.status === 'PENDING').length
                    })`
                  )}
                </span>
              </div>
              <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                {c('Action Required by Reception', 'مطلوب تنفيذ الاستقبال')}
              </span>
            </div>
            <div className="space-y-2">
              {scheduleRequests
                .filter((r) => r.status === 'PENDING')
                .map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs"
                  >
                    <div>
                      <div className="font-black text-slate-900">
                        {req.doctorNameEn} → {req.reason} · {req.patientNameEn} ({req.currentSlot})
                      </div>
                      <div className="text-slate-600">{req.note}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReceptionCompleteDoctorRequest(req.id)}
                      className="rounded-xl bg-emerald-600 px-3.5 py-1.5 font-extrabold text-white hover:bg-emerald-700"
                    >
                      {c('Execute & Confirm with Patient ✓', 'تنفيذ التعديل وإبلاغ المريض ✓')}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Clash Prevention Alert or Reschedule Toast */}
        {clashAlert && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-extrabold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{clashAlert}</span>
            </span>
            <button type="button" onClick={() => setClashAlert(null)}>
              ✕
            </button>
          </div>
        )}

        {rescheduleToast && (
          <div
            role="status"
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{rescheduleToast}</span>
            </span>
            <button type="button" onClick={() => setRescheduleToast(null)}>
              ✕
            </button>
          </div>
        )}

        {/* VIEW 1: 7-COLUMN WEEKLY COLOR-CODED GRID (Exact match to Image 4) */}
        {viewMode === 'week' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[980px] grid grid-cols-7 border border-slate-200 rounded-2xl overflow-hidden divide-x rtl:divide-x-reverse divide-slate-200">
              {weekDays.map((wd) => {
                const colAppts = currentWeekItems.filter((i) => i.dayCol === wd.col);
                return (
                  <div
                    key={wd.col}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnDay(wd.col)}
                    className="flex flex-col bg-white min-h-[440px]"
                  >
                    {/* Column Day Header */}
                    <div className="p-3 text-center border-b border-slate-100 bg-slate-50/70">
                      <span className="text-xs font-bold text-slate-600 block">
                        {isAr ? wd.dayAr : wd.dayEn}
                      </span>
                      <strong className="text-lg font-black text-slate-900 tabular-nums block">
                        {wd.num}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">
                        {isAr ? wd.subAr : wd.subEn}
                      </span>
                    </div>

                    {/* Appointment Cards (Draggable for Receptionist/Owner; View-Only + Request Change for Doctor) */}
                    <div className="p-2 space-y-2 flex-1">
                      {colAppts.map((appt) => {
                        const canManage = !isDentist;
                        const canDrag = canManage && isActiveAppointment(appt.status);
                        return (
                          <div
                            key={appt.id}
                            draggable={canDrag}
                            onDragStart={() => canDrag && setDraggedId(appt.id)}
                            className={`p-2.5 rounded-xl border text-[11px] ${
                              canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                            } transition-transform hover:-translate-y-0.5 shadow-2xs ${
                              CALENDAR_STATUS_STYLES[appt.status]
                            }`}
                          >
                            <div className="flex items-center justify-between font-extrabold mb-1">
                              <span>
                                • {appointmentStatusLabel(appt.status, isAr)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px]">{appt.time}</span>
                                {role === 'RECEPTIONIST' && (
                                  <button
                                    type="button"
                                    onClick={() => openReminderComposer(appt)}
                                    title={c('Send patient notification', 'إرسال إشعار للمريض')}
                                    aria-label={c('Send patient notification', 'إرسال إشعار للمريض')}
                                    className="rounded-md border border-blue-200 bg-white/80 p-0.5 text-blue-700 transition hover:bg-blue-100"
                                  >
                                    <BellRing className="w-3 h-3" />
                                  </button>
                                )}
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => openAppointmentManager(appt)}
                                    title={c('Manage appointment', 'إدارة الموعد')}
                                    className="rounded-md border border-black/10 bg-white/70 p-0.5 transition hover:bg-white"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                              </span>
                            </div>
                            <strong className="block truncate font-extrabold text-xs">
                              {isAr ? appt.patientNameAr : appt.patientNameEn} -{' '}
                              {isAr ? appt.procedureAr : appt.procedureEn}
                            </strong>
                            <span className="block text-[10px] opacity-75 mt-0.5 truncate">
                              {appt.chairId} · {isAr ? appt.doctorNameAr : appt.doctorNameEn}
                            </span>
                            {isDentist && (
                              <button
                                type="button"
                                onClick={() => handleOpenDoctorRequestModal(appt)}
                                className="mt-2 w-full rounded-lg bg-white/90 hover:bg-white px-2 py-1 text-[10px] font-black text-slate-900 border border-slate-300/80 shadow-2xs transition"
                              >
                                {c('Request Change → Reception', 'طلب تعديل ← الاستقبال')}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === 'month' ? (
          /* VIEW 3: MONTHLY CALENDAR GRID */
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="text-center mb-4">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {new Date(monthYear, monthMonth, 1).toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAY_NAMES_EN.map((d, i) => (
                  <div key={d} className="text-center text-[11px] font-extrabold text-slate-500 py-1">
                    {isAr ? DAY_NAMES_AR[i].slice(0, 3) : d.slice(0, 3)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calCells.map((cellDate, ci) => {
                  const isCurrentMonth = cellDate.getMonth() === monthMonth;
                  const today = new Date();
                  const isToday =
                    cellDate.getDate() === today.getDate() &&
                    cellDate.getMonth() === today.getMonth() &&
                    cellDate.getFullYear() === today.getFullYear();
                  const cellDay = cellDate.getDate();
                  const cellMon = cellDate.getMonth();
                  const cellYear = cellDate.getFullYear();
                  const cellAppts = filteredItems.filter((it) => {
                    const itemDate = new Date(weekSat);
                    itemDate.setDate(
                      weekSat.getDate() + it.dayCol + 7 * (it.weekOffset ?? 0)
                    );
                    return (
                      itemDate.getDate() === cellDay &&
                      itemDate.getMonth() === cellMon &&
                      itemDate.getFullYear() === cellYear
                    );
                  });
                  return (
                    <div
                      key={ci}
                      className={`min-h-[80px] rounded-xl border p-1 transition-all ${
                        !isCurrentMonth
                          ? 'border-transparent bg-slate-50/40 opacity-40'
                          : isToday
                          ? 'border-blue-400 bg-blue-50/60'
                          : 'border-slate-200 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`text-[11px] font-extrabold mb-1 ${isToday ? 'text-blue-700' : 'text-slate-500'}`}>
                        {cellDate.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {cellAppts.slice(0, 3).map((appt) => (
                          <div
                            key={appt.id}
                            className={`flex items-center gap-1 rounded px-1 py-0.5 text-[9px] font-bold ${
                              appt.status === 'NO_SHOW' || appt.status === 'CANCELLED'
                                ? 'bg-rose-100 text-rose-800'
                                : appt.status === 'COMPLETED' ||
                                  appt.status === 'ARRIVED' ||
                                  appt.status === 'IN_CHAIR'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {appt.time} {isAr ? appt.patientNameAr : appt.patientNameEn}
                            </span>
                            {role === 'RECEPTIONIST' && (
                              <button
                                type="button"
                                onClick={() => openReminderComposer(appt)}
                                title={c('Send patient notification', 'إرسال إشعار للمريض')}
                                aria-label={c('Send patient notification', 'إرسال إشعار للمريض')}
                                className="shrink-0 rounded p-0.5 text-current transition hover:bg-white/70"
                              >
                                <BellRing className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {cellAppts.length > 3 && (
                          <div className="text-[9px] text-slate-400 font-bold">+{cellAppts.length - 3} {c('more', 'آخرين')}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: CHAIR COLUMN VIEW ("Every chair is a column and every dentist a color") */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chairs.map((ch) => {
              const chairAppts = currentWeekItems.filter((i) => i.chairId === ch.id);
              return (
                <div
                  key={ch.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnChair(ch.id)}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 min-h-[340px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <strong className="text-sm font-extrabold text-slate-900">
                      {isAr ? ch.labelAr : ch.labelEn}
                    </strong>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
                      {chairAppts.length} {c('slots', 'مواعيد')}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {chairAppts.map((appt) => {
                      const docColor =
                        appt.doctorId === 'dr-ahmed'
                          ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950'
                          : appt.doctorId === 'dr-sara'
                          ? 'bg-purple-100/90 border-purple-300 text-purple-950'
                          : 'bg-sky-100/90 border-sky-300 text-sky-950';
                      const canDrag = !isDentist && isActiveAppointment(appt.status);
                      return (
                        <div
                          key={appt.id}
                          draggable={canDrag}
                          onDragStart={() => canDrag && setDraggedId(appt.id)}
                          className={`p-3 rounded-xl border text-xs ${
                            canDrag ? 'cursor-grab' : 'cursor-default'
                          } ${docColor}`}
                        >
                          <div className="flex items-center justify-between gap-2 font-extrabold">
                            <span>
                              {appt.time} · {appointmentStatusLabel(appt.status, isAr)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span>{isAr ? appt.doctorNameAr : appt.doctorNameEn}</span>
                              {role === 'RECEPTIONIST' && (
                                <button
                                  type="button"
                                  onClick={() => openReminderComposer(appt)}
                                  title={c('Send patient notification', 'إرسال إشعار للمريض')}
                                  aria-label={c('Send patient notification', 'إرسال إشعار للمريض')}
                                  className="rounded-md border border-blue-200 bg-white/80 p-0.5 text-blue-700 transition hover:bg-blue-100"
                                >
                                  <BellRing className="w-3 h-3" />
                                </button>
                              )}
                              {!isDentist && (
                                <button
                                  type="button"
                                  onClick={() => openAppointmentManager(appt)}
                                  title={c('Manage appointment', 'إدارة الموعد')}
                                  className="rounded-md border border-black/10 bg-white/70 p-0.5 transition hover:bg-white"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          </div>
                          <strong className="block text-sm font-black mt-1">
                            {isAr ? appt.patientNameAr : appt.patientNameEn}
                          </strong>
                          <span className="text-[11px] opacity-80">
                            {isAr ? appt.procedureAr : appt.procedureEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ====================================================================
          CANCELLATION WAITING LIST CARD (Exclusively for Front Desk / Owner — Removed from /doctor/appointments)
         ==================================================================== */}
      {!isDentist && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* IMAGE 6: WAITING LIST THAT FILLS CANCELLATIONS */}
        <section className="lg:col-span-12 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {c('Waiting list', 'قائمة الانتظار لملء الإلغاءات')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddWaitModal(true)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold"
              >
                + {c('Add Patient', 'إضافة مريض')}
              </button>
              <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
                {waitingList.length + 1} {c('ready', 'جاهزون')}
              </span>
            </div>
          </div>

          {/* Amber Cancellation Alert Banner matching Image 6 */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs font-extrabold">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-black shrink-0">
              !
            </span>
            <span>
              {c(
                '4:00 appointment on Chair 2 cancelled — whom do we call?',
                'تم إلغاء موعد الساعة 4:00 على كرسي 2 — بمن نتصل لملء الكرسي؟'
              )}
            </span>
          </div>

          {/* Waiting List Patients Rows matching Image 6 */}
          <div className="space-y-2.5">
            {waitingList.map((w, idx) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl border border-slate-200/90 bg-white flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-full ${w.color} text-white font-extrabold text-sm flex items-center justify-center shrink-0`}
                  >
                    {w.initial}
                  </div>
                  <div>
                    <strong className="text-sm font-extrabold text-slate-900 block">
                      {isAr ? w.nameAr : w.nameEn}
                    </strong>
                    <span className="text-xs text-slate-500">
                      {isAr ? w.prefAr : w.prefEn}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFillCancelledSlot(w)}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                    w.called
                      ? 'bg-emerald-600 text-white'
                      : idx < 2
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                  }`}
                >
                  {w.called ? c('Slot Filled ✓', 'تم الحجز ✓') : c('Call', 'اتصال')}
                </button>
              </div>
            ))}
          </div>

          {/* No-Show Follow-Up Strip */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">
              {c(
                'Whoever said “call me if something frees up” is recorded here — not in someone’s memory',
                'كل من طلب الاتصال به عند توفر موعد يُسجّل هنا — وليس في الذاكرة'
              )}
            </span>
            {noShows.map((ns) => (
              <span
                key={ns.id}
                className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold"
              >
                {c('No-Show Recall:', 'متابعة متغيب:')} {isAr ? ns.nameAr : ns.nameEn}
              </span>
            ))}
          </div>
        </section>
      </div>
      )}

      {/* Doctor -> Receptionist Schedule Change Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {c(
                    'Request Schedule Change (Notify Reception)',
                    'طلب تعديل جدول المواعيد (إبلاغ الاستقبال)'
                  )}
                </h4>
                <p className="text-xs text-slate-500">
                  {requestModalTarget
                    ? `${requestModalTarget.patientNameEn} · ${requestModalTarget.time} (${requestModalTarget.chairId})`
                    : c('General Schedule / Time Slot Request', 'طلب حجز أو إغلاق فترة زمنية')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {c('Reason for Schedule Request', 'سبب طلب التعديل')}
                </label>
                <select
                  value={requestReason}
                  onChange={(e) =>
                    setRequestReason(e.target.value as DoctorScheduleChangeRequest['reason'])
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-bold text-slate-800"
                >
                  <option value="Reschedule Visit">
                    {c('Reschedule Visit', 'إعادة جدولة زيارة المريض')}
                  </option>
                  <option value="Block Time Slot">
                    {c('Block Time Slot', 'إغلاق فترة زمنية بالجدول')}
                  </option>
                  <option value="Extend Procedure Time">
                    {c('Extend Procedure Time', 'تمديد وقت الجلسة العلاجية')}
                  </option>
                  <option value="Cancel / Patient Follow-up">
                    {c('Cancel / Patient Follow-up', 'إلغاء الموعد / متابعة مع المريض')}
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {c('Instructions for Front-Desk Receptionist', 'ملاحظات لموظفة الاستقبال')}
                </label>
                <textarea
                  rows={3}
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder={c(
                    'Write instructions for Mariam Hanna (Reception)...',
                    'اكتب تفاصيل التعديل المطلوب لموظفة الاستقبال...'
                  )}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                {c('Cancel', 'إلغاء')}
              </button>
              <button
                type="button"
                onClick={handleSubmitDoctorScheduleRequest}
                className="rounded-xl bg-[#0B2528] hover:bg-[#153D42] px-5 py-2 text-xs font-extrabold text-white shadow-xs"
              >
                {c('Send Request to Reception', 'إرسال الطلب للاستقبال')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Waiting List Modal */}
      {showAddWaitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h4 className="text-base font-extrabold text-slate-900">
              {c('Add Patient to Cancellation Waiting List', 'إضافة مريض لقائمة الانتظار')}
            </h4>
            <label className="block text-xs font-bold text-slate-700">
              {c('Patient Name', 'اسم المريض')}
              <input
                type="text"
                value={newWaitName}
                onChange={(e) => setNewWaitName(e.target.value)}
                placeholder={c('e.g. Hany Mahmoud', 'مثال: هاني محمود')}
                className="field w-full mt-1"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700">
              {c('Preferred Time & Procedure', 'الوقت المفضل والإجراء')}
              <input
                type="text"
                value={newWaitPref}
                onChange={(e) => setNewWaitPref(e.target.value)}
                className="field w-full mt-1"
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddWaitModal(false)}
                className="secondary-button text-xs py-2 px-4"
              >
                {c('Cancel', 'إلغاء')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newWaitName.trim()) return;
                  setWaitingList([
                    ...waitingList,
                    {
                      id: `wl-${Date.now()}`,
                      initial: newWaitName.trim().charAt(0).toUpperCase(),
                      color: 'bg-blue-600',
                      nameEn: newWaitName.trim(),
                      nameAr: newWaitName.trim(),
                      prefEn: newWaitPref,
                      prefAr: newWaitPref,
                      called: false,
                    },
                  ]);
                  setNewWaitName('');
                  setShowAddWaitModal(false);
                }}
                className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-extrabold"
              >
                {c('Save to Waiting List', 'حفظ في قائمة الانتظار')}
              </button>
            </div>
          </div>
        </div>
      )}

      {reminderAppt && (
        <AppointmentReminderComposer
          appointment={reminderAppt}
          onClose={() => setReminderAppt(null)}
          onSent={() =>
            setRescheduleToast(
              c(
                'Notification sent · visible in the patient portal.',
                'تم إرسال الإشعار · سيظهر في بوابة المريض.'
              )
            )
          }
        />
      )}

      {/* Real front-desk booking form: writes to the shared appointment store */}
      {showBookingDrawer && (
        <ReceptionBooking
          branches={MINYA_BRANCHES.map((b) => ({
            id: b.code,
            code: b.code,
            name: isAr ? b.nameAr : b.nameEn,
          }))}
          onSaved={() => {
            setShowBookingDrawer(false);
            setRescheduleToast(
              c(
                'Appointment booked and added to the calendar · patient portal updated.',
                'تم حجز الموعد وإضافته للجدول · تم تحديث بوابة المريض.'
              )
            );
          }}
          onClose={() => setShowBookingDrawer(false)}
        />
      )}

      {/* Front-desk appointment manager: single status flow + reschedule */}
      {managingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {c('Manage Appointment', 'إدارة الموعد')}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr ? managingAppt.patientNameAr : managingAppt.patientNameEn} ·{' '}
                  {dateForItem(managingAppt)} · {managingAppt.time} ·{' '}
                  {isAr ? managingAppt.doctorNameAr : managingAppt.doctorNameEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingAppt(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>{c('Status', 'الحالة')}</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-black ${CALENDAR_STATUS_STYLES[managingAppt.status]}`}
                >
                  {appointmentStatusLabel(managingAppt.status, isAr)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {STATUS_ACTION_ORDER.map((status) => {
                  const active = managingAppt.status === status;
                  const isDanger = status === 'CANCELLED' || status === 'NO_SHOW';
                  const apptDate = calendarItemDate(managingAppt);
                  const todayIso = clinicTodayISO();
                  const isStatusBlocked =
                    (apptDate > todayIso && FUTURE_DISALLOWED_STATUSES.includes(status)) ||
                    (apptDate < todayIso && !PAST_ALLOWED_STATUSES.includes(status));
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={isStatusBlocked}
                      onClick={() => applyAppointmentStatus(managingAppt, status)}
                      className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                        isStatusBlocked
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                          : active
                          ? 'border-[#0B2528] bg-[#0B2528] text-white'
                          : isDanger
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {appointmentStatusLabel(status, isAr)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-700">
                {c('Reschedule to another day or time', 'إعادة الجدولة ليوم أو وقت آخر')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] font-bold text-slate-600">
                  {c('Date', 'التاريخ')}
                  <input
                    type="date"
                    value={manageDate}
                    min={clinicTodayISO()}
                    onChange={(e) => {
                      setManageDate(e.target.value);
                      setManageError(null);
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                  />
                </label>
                <label className="text-[11px] font-bold text-slate-600">
                  {c('Time', 'الوقت')}
                  <select
                    value={manageTime}
                    onChange={(e) => {
                      setManageTime(e.target.value);
                      setManageError(null);
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    {Array.from(new Set([managingAppt.time, ...clinicSlotLabels()])).map(
                      (label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>
              {manageError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">
                  {manageError}
                </div>
              )}
              <button
                type="button"
                onClick={handleManageReschedule}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95"
              >
                {c('Save New Date & Time', 'حفظ التاريخ والوقت الجديد')}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setManagingAppt(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                {c('Close', 'إغلاق')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
