'use client';

import { TranslatedText } from '@/components/TranslatedText';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CLINIC_BRANCHES, CLINIC_DENTISTS, CLINIC_SERVICES } from '@/config/clinic-catalog';
import { cairoDate } from '@/lib/scheduling-rules';
import { clinicNowMinutes, clinicTodayISO } from '@/lib/clinic-clock';
import { CalendarDays, CheckCircle2, Clock, Sparkles, Stethoscope, Building2 } from 'lucide-react';
import { FrostedSlideOverDrawer } from '@/components/ui/FrostedSlideOverDrawer';
import { upsertAppointment, listAppointments } from '@/lib/appointments-db';
import { getPatientById } from '@/lib/patients-db';

export function PatientBooking({
  patientId,
  onSaved,
  onClose,
}: {
  patientId: string;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [submissionKey] = useState(() => crypto.randomUUID());
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const [branch, setBranch] = useState('BR-A');
  const [service, setService] = useState('unsure');
  const [dentist, setDentist] = useState('ANY');
  const [day, setDay] = useState(cairoDate());
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [slots, setSlots] = useState<{ time: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const DEFAULT_STATIC_SLOTS = [
    { time: '10:00 AM' },
    { time: '10:30 AM' },
    { time: '11:00 AM' },
    { time: '11:30 AM' },
    { time: '12:30 PM' },
    { time: '02:00 PM' },
    { time: '03:00 PM' },
    { time: '04:00 PM' },
    { time: '05:30 PM' },
    { time: '06:30 PM' },
  ];

  const staticSlotsFor = (iso: string) => {
    const base =
      iso !== clinicTodayISO()
        ? DEFAULT_STATIC_SLOTS
        : DEFAULT_STATIC_SLOTS.filter((s) => {
            const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(s.time);
            if (!m) return true;
            const h = (Number(m[1]) % 12) + (/pm/i.test(m[3]) ? 12 : 0);
            return h * 60 + Number(m[2]) > clinicNowMinutes();
          });

    const busy = listAppointments().filter(
      (v) => v.status !== 'CANCELLED' && v.status !== 'NO_SHOW' && v.date === iso
    );
    const docs = CLINIC_DENTISTS.filter((d) => d.branchCode === branch);
    const chosen = docs.find((d) => d.email === dentist);
    return base.filter((s) =>
      dentist === 'ANY'
        ? docs.some(
            (d) => !busy.some((v) => v.time === s.time && v.doctorNameEn === d.nameEn)
          )
        : !busy.some((v) => v.time === s.time && v.doctorNameEn === chosen?.nameEn)
    );
  };

  useEffect(() => {
    const controller = new AbortController();
    setTime('');
    setSlots([]);
    setLoading(true);
    setError('');
    fetch(
      `/api/scheduling/availability?branchCode=${branch}&date=${day}&dentistEmail=${encodeURIComponent(
        dentist
      )}&service=${service}`,
      { signal: controller.signal }
    )
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => setSlots(d.slots && d.slots.length ? d.slots : staticSlotsFor(day)))
      .catch(() => {
        // Fallback to static interactive slots for presentation/static export
        setSlots(staticSlotsFor(day));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [branch, service, dentist, day, ar]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) {
      setError(ar ? 'يرجى اختيار الوقت المناسب.' : 'Please choose an appointment time.');
      return;
    }
    if (
      dentist !== 'ANY' &&
      listAppointments().some(
        (v) =>
          v.status !== 'CANCELLED' &&
          v.status !== 'NO_SHOW' &&
          v.date === day &&
          v.time === time &&
          v.doctorNameEn === selectedDoctorObj?.nameEn
      )
    ) {
      setError(
        ar
          ? 'هذا الوقت تم حجزه للتو — اختر وقتاً آخر.'
          : 'That time was just taken — please choose another slot.'
      );
      return;
    }
    setBusy(true);
    setError('');
    try {
      await fetch('/api/scheduling/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionKey,
          patientId,
          branchCode: branch,
          serviceSlug: service,
          dentistEmail: dentist,
          preferredDate: day,
          selectedSlotTime: time,
          reason,
          source: 'WEBSITE',
        }),
      });
    } catch {}

    // Save to localStorage for static clinic synchronization
    try {
      const patientRecord = getPatientById(patientId);
      const chosenService = CLINIC_SERVICES.find((s) => s.slug === service);
      upsertAppointment({
        id: `APT-${Date.now()}`,
        patientId,
        patientName: patientRecord?.fullName || 'Patient',
        branchCode: branch as 'BR-A' | 'BR-B' | 'BR-C',
        branchNameEn: branch === 'BR-A' ? 'Minya – Branch A' : branch === 'BR-B' ? 'Minya – Branch B' : 'Minya – Branch C',
        branchNameAr: branch === 'BR-A' ? 'المنيا – الفرع أ' : branch === 'BR-B' ? 'المنيا – الفرع ب' : 'المنيا – الفرع ج',
        doctorNameEn: selectedDoctorObj?.nameEn || 'Dr. Sandy Saad',
        doctorNameAr: selectedDoctorObj?.nameAr || 'د. ساندي سعد',
        serviceEn: chosenService?.nameEn || 'General Consultation & Examination',
        serviceAr: chosenService?.nameAr || 'استشارة وكشف عام',
        date: day,
        time: time,
        status: 'CONFIRMED',
        isPast: false,
      });
    } catch {}

    setBusy(false);
    onSaved();
  }

  // Generate 7-day quick calendar bubbles starting from today
  const baseToday = new Date(cairoDate() + 'T00:00:00Z');
  const dayBubbles = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(+baseToday + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso,
      weekday: d.toLocaleDateString(ar ? 'ar-EG' : 'en-US', { weekday: 'short', timeZone: 'UTC' }),
      dayNum: d.getUTCDate(),
    };
  });

  const branchDentists = CLINIC_DENTISTS.filter((d) => d.branchCode === branch);
  const selectedDoctorObj = branchDentists.find((d) => d.email === dentist) || branchDentists[0];

  return (
    <FrostedSlideOverDrawer
      open={true}
      onClose={() => !busy && onClose()}
      title={ar ? 'حجز موعد جديد' : 'Book Appointment'}
      subtitle={
        ar
          ? 'اختر الطبيب والفرع والوقت المناسب'
          : 'Choose your specialist, branch, and preferred time slot'
      }
      iconBadge={<CalendarDays className="w-5 h-5" />}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="secondary-button"
            disabled={busy}
            onClick={onClose}
          >
            {ar ? 'إلغاء' : <TranslatedText text="Cancel" />}
          </button>
          <button
            type="submit"
            form="patient-booking-form"
            className="primary-button"
            disabled={!time || loading || busy}
          >
            {busy
              ? ar
                ? 'جارٍ الإرسال…'
                : 'Sending…'
              : ar
              ? 'إرسال طلب الموعد'
              : 'Request this appointment'}
          </button>
        </div>
      }
    >
      <form id="patient-booking-form" onSubmit={submit} className="space-y-5">
        {/* 1. Doctors Avatar Chips matching Reference Mockup 1 */}
        <div className="space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
            {ar ? 'اختر الطبيب المعالج' : 'Doctors chips'}
          </span>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setDentist('ANY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-bold transition-all active:scale-95 shrink-0 ${
                dentist === 'ANY'
                  ? 'bg-[#0B2528] text-white border-[#0B2528] shadow-sm'
                  : 'bg-white text-[#0B2528] border-slate-200 hover:border-[#C8A96E]'
              }`}
            >
              <span className="w-7 h-7 rounded-full bg-[#C8A96E]/25 text-[#0B2528] flex items-center justify-center font-extrabold text-[11px]">
                ★
              </span>
              <span>{ar ? 'أي طبيب متاح' : 'Any Specialist'}</span>
            </button>
            {branchDentists.map((doc) => {
              const active = dentist === doc.email;
              const initials = doc.nameEn
                .replace('Dr. ', '')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);
              return (
                <button
                  key={doc.email}
                  type="button"
                  onClick={() => setDentist(doc.email)}
                  className={`flex items-center gap-2 ps-1.5 pe-3.5 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 shrink-0 ${
                    active
                      ? 'bg-[#0B2528] text-white border-[#0B2528] shadow-sm'
                      : 'bg-white text-[#0B2528] border-slate-200 hover:border-[#C8A96E]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${
                      active ? 'bg-[#C8A96E] text-[#0B2528]' : 'bg-[#F7F6F2] text-[#0B2528]'
                    }`}
                  >
                    {initials}
                  </span>
                  <span>{ar ? doc.nameAr : doc.nameEn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Doctor Spotlight Chip */}
          {selectedDoctorObj && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F7F6F2] border border-slate-200/80">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-[#0B2528] text-[#C8A96E] flex items-center justify-center font-extrabold text-sm">
                  {selectedDoctorObj.nameEn
                    .replace('Dr. ', '')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                  ✓
                </span>
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#0B2528]">
                  {ar ? selectedDoctorObj.nameAr : selectedDoctorObj.nameEn}
                </div>
                <div className="text-xs text-slate-500">
                  {ar ? selectedDoctorObj.specialtyAr : selectedDoctorObj.specialtyEn}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Branch & Service Selector */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          <label className="text-xs font-bold text-[#0B2528] space-y-1.5">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#C8A96E]" />
              {ar ? 'الفرع' : <TranslatedText text="Branch" />}
            </span>
            <select
              className="field w-full"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setDentist('ANY');
              }}
            >
              {CLINIC_BRANCHES.map((b) => (
                <option value={b.code} key={b.code}>
                  {ar ? b.nameAr : b.nameEn}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-[#0B2528] space-y-1.5">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#C8A96E]" />
              {ar ? 'نوع الزيارة' : 'Visit type'}
            </span>
            <select
              className="field w-full"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="unsure">
                {ar ? 'استشارة — لست متأكداً' : 'Consultation — I am not sure'}
              </option>
              {CLINIC_SERVICES.map((s) => (
                <option value={s.slug} key={s.slug}>
                  {ar ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-[#0B2528] space-y-1.5">
            <span>{ar ? 'الطبيب' : 'Dentist'}</span>
            <select
              className="field w-full"
              value={dentist}
              onChange={(e) => setDentist(e.target.value)}
            >
              <option value="ANY">{ar ? 'أي طبيب متاح' : 'Any available dentist'}</option>
              {branchDentists.map((d) => (
                <option key={d.email} value={d.email}>
                  {ar ? d.nameAr : d.nameEn}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-[#0B2528] space-y-1.5">
            <span>{ar ? 'تاريخ الزيارة' : 'Visit date'}</span>
            <input
              autoFocus
              className="field w-full"
              type="date"
              min={cairoDate()}
              required
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </label>
        </div>

        {/* Visual Calendar Day Bubbles */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {dayBubbles.map((b) => {
            const active = day === b.iso;
            return (
              <button
                key={b.iso}
                type="button"
                onClick={() => setDay(b.iso)}
                className={`flex flex-col items-center justify-center min-w-[52px] py-2 px-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? 'bg-[#C8A96E] text-[#0B2528] border-[#C8A96E] shadow-xs'
                    : 'bg-[#F7F6F2] text-slate-600 border-slate-200/80 hover:border-[#C8A96E]'
                }`}
              >
                <span className="text-[10px] uppercase opacity-75">{b.weekday}</span>
                <span className="text-sm font-extrabold tabular-nums">{b.dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Tactile Time-Slot Pills */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex gap-2 items-center">
            <Clock size={15} className="text-[#C8A96E]" />
            {ar ? 'المواعيد المتاحة بتوقيت القاهرة' : 'Available times · Cairo time'}
          </legend>
          {loading ? (
            <p role="status" className="text-xs text-slate-500 py-3">
              {ar ? 'جارٍ البحث عن المواعيد…' : 'Checking availability…'}
            </p>
          ) : !slots.length ? (
            <p className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 p-4 text-xs font-semibold">
              {ar
                ? 'لا توجد مواعيد متاحة لهذا الاختيار. جرّب يوماً أو طبيباً أو فرعاً آخر.'
                : 'No times are available for this selection. Try another date, dentist or branch.'}
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.time}
                  aria-pressed={time === s.time}
                  className={`slot-button ${time === s.time ? 'selected' : ''}`}
                  onClick={() => setTime(s.time)}
                >
                  <span>{s.time}</span>
                  {time === s.time && <CheckCircle2 size={14} className="text-[#C8A96E]" />}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        {/* Optional Notes */}
        <label className="block text-xs font-bold text-[#0B2528] space-y-1.5">
          <span>{ar ? 'ملاحظات اختيارية' : 'Optional notes'}</span>
          <textarea
            className="field w-full"
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={ar ? 'أعراض أو ملاحظات للطبيب...' : 'Any symptoms or preferences...'}
          />
        </label>

        {error && (
          <p role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 text-xs font-bold">
            {error}
          </p>
        )}
      </form>
    </FrostedSlideOverDrawer>
  );
}
