'use client';

import React, { useMemo, useState } from 'react';
import {
  BellRing,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Stethoscope,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { FrostedSlideOverDrawer } from '@/components/ui/FrostedSlideOverDrawer';
import { clinicDateText } from '@/lib/clinic-clock';
import { getPatientById, listPatients } from '@/lib/patients-db';
import {
  sendPatientNotification,
  type PatientNotificationKind,
} from '@/lib/notifications-db';
import type { AppointmentRecord } from '@/lib/appointments-db';

const TEMPLATE_OPTIONS: Array<{
  kind: PatientNotificationKind;
  labelEn: string;
  labelAr: string;
  icon: typeof BellRing;
}> = [
  {
    kind: 'APPOINTMENT_REMINDER',
    labelEn: 'Appointment reminder',
    labelAr: 'تذكير بالموعد',
    icon: BellRing,
  },
  {
    kind: 'APPOINTMENT_CONFIRMED',
    labelEn: 'Appointment confirmed',
    labelAr: 'تأكيد الموعد',
    icon: Calendar,
  },
  {
    kind: 'SCHEDULE_UPDATE',
    labelEn: 'Schedule update',
    labelAr: 'تحديث الموعد',
    icon: Clock,
  },
  {
    kind: 'TREATMENT_UPDATE',
    labelEn: 'Treatment update',
    labelAr: 'تحديث العلاج',
    icon: Stethoscope,
  },
  {
    kind: 'CUSTOM',
    labelEn: 'Custom message',
    labelAr: 'رسالة مخصصة',
    icon: MessageSquare,
  },
];

function appointmentPatientName(appointment: AppointmentRecord): string {
  return appointment.patientName.replace(/\(#[^)]*\)/g, '').trim() || 'Patient';
}

function buildTemplate(
  kind: PatientNotificationKind,
  appointment: AppointmentRecord,
  locale: 'en' | 'ar',
  patientNameAr?: string
) {
  const isAr = locale === 'ar';
  const patientName = isAr && patientNameAr ? patientNameAr : appointmentPatientName(appointment);
  const doctor = isAr ? appointment.doctorNameAr : appointment.doctorNameEn;
  const branch = isAr ? appointment.branchNameAr : appointment.branchNameEn;
  const date = clinicDateText(appointment.date, locale);
  const service = isAr ? appointment.serviceAr : appointment.serviceEn;

  switch (kind) {
    case 'APPOINTMENT_REMINDER':
      return {
        titleEn: 'Appointment reminder',
        titleAr: 'تذكير بالموعد',
        bodyEn: `Hello ${patientName}, this is a reminder of your appointment with ${doctor} on ${date} at ${appointment.time} (${branch}). Please arrive 10 minutes early.`,
        bodyAr: `مرحباً ${patientName}، نذكّرك بموعدك مع ${doctor} يوم ${date} الساعة ${appointment.time} في ${branch}. يرجى الحضور قبل الموعد بـ 10 دقائق.`,
      };
    case 'APPOINTMENT_CONFIRMED':
      return {
        titleEn: 'Appointment confirmed',
        titleAr: 'تأكيد الموعد',
        bodyEn: `Hello ${patientName}, your ${service} appointment with ${doctor} is confirmed for ${date} at ${appointment.time} (${branch}).`,
        bodyAr: `مرحباً ${patientName}، تم تأكيد موعد ${service} مع ${doctor} يوم ${date} الساعة ${appointment.time} في ${branch}.`,
      };
    case 'SCHEDULE_UPDATE':
      return {
        titleEn: 'Schedule update',
        titleAr: 'تحديث الموعد',
        bodyEn: `Hello ${patientName}, we have an update about your appointment on ${date} at ${appointment.time}. Our team is running a little late. Thank you for your patience.`,
        bodyAr: `مرحباً ${patientName}، لدينا تحديث بخصوص موعدك يوم ${date} الساعة ${appointment.time}. فريقنا متأخر قليلاً، شكراً لتفهمك.`,
      };
    case 'TREATMENT_UPDATE':
      return {
        titleEn: 'Treatment update',
        titleAr: 'تحديث العلاج',
        bodyEn: `Hello ${patientName}, your treatment update is ready. Please review the next steps with ${doctor} at your appointment on ${date} at ${appointment.time}.`,
        bodyAr: `مرحباً ${patientName}، تحديث خطة علاجك جاهز. يرجى مراجعة الخطوات التالية مع ${doctor} خلال موعدك يوم ${date} الساعة ${appointment.time}.`,
      };
    default:
      return {
        titleEn: 'Message from reception',
        titleAr: 'رسالة من الاستقبال',
        bodyEn: '',
        bodyAr: '',
      };
  }
}

export function AppointmentReminderComposer({
  appointment,
  onClose,
  onSent,
}: {
  appointment: AppointmentRecord;
  onClose: () => void;
  onSent?: (patientName: string) => void;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const linkedPatient = useMemo(() => {
    const byId = getPatientById(appointment.patientId);
    if (byId) return byId;
    const name = appointmentPatientName(appointment).toLowerCase();
    const matches = listPatients().filter(
      (patient) =>
        patient.fullName.trim().toLowerCase() === name ||
        (patient.fullNameAr || '').trim() === appointmentPatientName(appointment)
    );
    return matches.length === 1 ? matches[0] : undefined;
  }, [appointment]);

  const [selectedKind, setSelectedKind] =
    useState<PatientNotificationKind>('APPOINTMENT_REMINDER');
  const initialTemplate = buildTemplate(
    'APPOINTMENT_REMINDER',
    appointment,
    locale,
    linkedPatient?.fullNameAr
  );
  const [message, setMessage] = useState(
    isAr ? initialTemplate.bodyAr : initialTemplate.bodyEn
  );
  const [customized, setCustomized] = useState(false);
  const [error, setError] = useState('');

  const selectedTemplate = buildTemplate(
    selectedKind,
    appointment,
    locale,
    linkedPatient?.fullNameAr
  );

  const chooseTemplate = (kind: PatientNotificationKind) => {
    const template = buildTemplate(kind, appointment, locale, linkedPatient?.fullNameAr);
    setSelectedKind(kind);
    setMessage(isAr ? template.bodyAr : template.bodyEn);
    setCustomized(kind === 'CUSTOM');
    setError('');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!linkedPatient) {
      setError(
        isAr
          ? 'هذا الموعد غير مرتبط بملف مريض. اربطه بسجل المريض أولاً.'
          : 'This appointment is not linked to a patient file. Link it to a patient record first.'
      );
      return;
    }
    const text = message.trim();
    if (!text) {
      setError(isAr ? 'اكتب رسالة الإشعار.' : 'Write a notification message.');
      return;
    }

    const bodyEn = customized || selectedKind === 'CUSTOM' ? text : selectedTemplate.bodyEn;
    const bodyAr = customized || selectedKind === 'CUSTOM' ? text : selectedTemplate.bodyAr;
    const sent = sendPatientNotification({
      patientId: linkedPatient.id,
      appointmentId: appointment.id,
      branchCode: appointment.branchCode,
      kind: selectedKind,
      titleEn: selectedTemplate.titleEn,
      titleAr: selectedTemplate.titleAr,
      bodyEn,
      bodyAr,
    });

    if (!sent) {
      setError(isAr ? 'تعذر إرسال الإشعار.' : 'Could not send the notification.');
      return;
    }
    onSent?.(linkedPatient.fullName);
    onClose();
  };

  return (
    <FrostedSlideOverDrawer
      open={true}
      onClose={onClose}
      title={isAr ? 'إرسال إشعار للمريض' : 'Send Patient Notification'}
      subtitle={
        isAr
          ? `${appointmentPatientName(appointment)} · ${appointment.time}`
          : `${appointmentPatientName(appointment)} · ${appointment.time}`
      }
      iconBadge={<BellRing className="h-5 w-5" />}
      ariaLabel={isAr ? 'إرسال إشعار للمريض' : 'Send Patient Notification'}
      footer={
        <button
          type="submit"
          form="appointment-notification-form"
          disabled={!linkedPatient}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4169E1] px-4 py-3 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#2446A6] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          {isAr ? 'إرسال إلى بوابة المريض' : 'Send to Patient Portal'}
        </button>
      }
    >
      <form
        id="appointment-notification-form"
        onSubmit={submit}
        className="space-y-5"
      >
        <div className="rounded-2xl border border-slate-200 bg-[#F7FAFF] p-4 text-xs text-slate-700">
          <div className="font-extrabold text-[#102A5E]">
            {isAr ? 'الموعد المحدد' : 'Selected appointment'}
          </div>
          <p className="mt-1 leading-relaxed">
            {clinicDateText(appointment.date, locale)} · {appointment.time} ·{' '}
            {isAr ? appointment.doctorNameAr : appointment.doctorNameEn}
          </p>
          <p className="mt-1 text-slate-500">
            {isAr ? appointment.branchNameAr : appointment.branchNameEn}
          </p>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="mb-2 text-xs font-extrabold text-slate-700">
            {isAr ? 'اختر إشعاراً جاهزاً' : 'Choose a ready-made notification'}
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TEMPLATE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const active = selectedKind === option.kind;
              return (
                <button
                  key={option.kind}
                  type="button"
                  onClick={() => chooseTemplate(option.kind)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-start text-xs font-extrabold transition ${
                    active
                      ? 'border-[#4169E1] bg-[#EAF3FF] text-[#2446A6]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {isAr ? option.labelAr : option.labelEn}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block space-y-1.5 text-xs font-extrabold text-slate-700">
          <span>{isAr ? 'نص الرسالة' : 'Message'}</span>
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setCustomized(true);
              setError('');
            }}
            rows={6}
            required
            placeholder={isAr ? 'اكتب رسالتك للمريض...' : 'Write your message to the patient...'}
            className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-medium leading-relaxed text-slate-800 focus:border-[#4169E1] focus:outline-none"
          />
          <span className="block text-[10px] font-semibold text-slate-500">
            {isAr
              ? 'يمكنك تعديل النص الجاهز أو كتابة أي رسالة مخصصة.'
              : 'You can edit the ready-made text or write any custom message.'}
          </span>
        </label>

        {!linkedPatient && (
          <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900">
            {isAr
              ? 'لا يوجد ملف مريض مرتبط بهذا الموعد، لذلك تم تعطيل الإرسال.'
              : 'No patient file is linked to this appointment, so sending is disabled.'}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            {error}
          </p>
        )}

        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          {isAr
            ? 'سيظهر الإشعار في نافذة إشعارات المريض داخل البوابة.'
            : 'The notification will appear in the patient’s Notifications window inside the portal.'}
        </p>
      </form>
    </FrostedSlideOverDrawer>
  );
}
