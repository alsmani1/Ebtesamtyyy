'use client';

import { TranslatedText } from '@/components/TranslatedText';
import { LocalizedInput } from '@/components/LocalizedControls';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { message } from '@/lib/messages';
import { cairoDate } from '@/lib/scheduling-rules';
import { CLINIC_SERVICES, CLINIC_DENTISTS } from '@/config/clinic-catalog';
import { FrostedSlideOverDrawer } from '@/components/ui/FrostedSlideOverDrawer';
import { upsertAppointment, listAppointments } from '@/lib/appointments-db';
import { enrollPatient } from '@/lib/patients-db';
import { clinicNowMinutes, clinicTodayISO } from '@/lib/clinic-clock';
import { Calendar, Clock, UserPlus } from 'lucide-react';

export function ReceptionBooking({
  branches,
  onSaved,
  onClose,
  initialPatient,
}: {
  branches: any[];
  initialPatient?: any;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [submissionKey] = useState(() => crypto.randomUUID());
  const { locale } = useLanguage();
  const t = (key: Parameters<typeof message>[1]) => message(locale, key);
  const [newPatient, setNewPatient] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(initialPatient || null);
  const [branch, setBranch] = useState(branches[0]?.code || '');
  const [service, setService] = useState('unsure');
  const [dentist, setDentist] = useState('ANY');
  const [day, setDay] = useState(cairoDate());
  const [time, setTime] = useState('');
  const [source, setSource] = useState('RECEPTION_PHONE');
  const [slots, setSlots] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const CLINIC_DEMO_PATIENTS = [
    { id: 'EBT-PAT-0001', fullName: 'Passant (#EBT-PAT-0001)', phone: '+201200054405' },
    { id: 'pat-mohamed', fullName: 'Mohamed Ahmed', phone: '+201015520148' },
    { id: 'pat-khaled', fullName: 'Khaled Adel', phone: '+201099887766' },
    { id: 'pat-salma', fullName: 'Salma Fouad', phone: '+201011223344' },
    { id: 'pat-karim', fullName: 'Karim Saad', phone: '+201044556677' },
  ];

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (query.length < 2) {
        setPatients([]);
        return;
      }
      fetch('/api/patients/search?q=' + encodeURIComponent(query))
        .then((r) => r.json())
        .then((d) => {
          if (active) setPatients(d.results || []);
        })
        .catch(() => {
          // Fallback to searching clinic patients
          if (active) {
            const filtered = CLINIC_DEMO_PATIENTS.filter(
              (p) =>
                p.fullName.toLowerCase().includes(query.toLowerCase()) ||
                p.phone.includes(query)
            );
            setPatients(filtered);
          }
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    let active = true;
    setTime('');
    setSlots([]);
    setLoading(true);
    fetch(
      `/api/scheduling/availability?branchCode=${encodeURIComponent(branch)}&date=${day}&dentistEmail=${encodeURIComponent(
        dentist
      )}&service=${service}`
    )
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (active) setSlots(d.slots && d.slots.length ? d.slots : staticSlotsFor(day));
      })
      .catch(() => {
        // Fallback to static interactive slots
        if (active) setSlots(staticSlotsFor(day));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [branch, day, dentist, service]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patient && !newPatient) {
      setError(t('selectPatient'));
      return;
    }
    if (!time) {
      setError(locale === 'ar' ? 'يرجى اختيار وقت.' : 'Please choose a time slot.');
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
          v.doctorNameEn === CLINIC_DENTISTS.find((d) => d.email === dentist)?.nameEn
      )
    ) {
      setError(
        locale === 'ar'
          ? 'هذا الوقت محجوز بالفعل لهذا الطبيب — اختر وقتاً آخر.'
          : 'That slot is already booked with this dentist — choose another time.'
      );
      return;
    }
    setBusy(true);
    setError('');
    const chosenDentist = CLINIC_DENTISTS.find((d) => d.email === dentist) || CLINIC_DENTISTS[0];
    const enrollment = newPatient
      ? enrollPatient({
          fullName: name,
          phone,
          dob: dob || undefined,
          branchCode: branch as 'BR-A' | 'BR-B' | 'BR-C',
          primaryDoctorEn: chosenDentist.nameEn,
          primaryDoctorAr: chosenDentist.nameAr,
          source: 'booking',
        })
      : null;
    const bookedPatientId = enrollment?.patient.id || patient?.id;
    const patientName = enrollment?.patient.fullName || patient?.fullName || 'Patient';
    try {
      await fetch('/api/scheduling/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionKey,
          patientId: bookedPatientId,
          fullName: newPatient ? name : undefined,
          phone: newPatient ? phone : undefined,
          dateOfBirth: newPatient ? dob : undefined,
          branchCode: branch,
          serviceSlug: service,
          serviceName: service === 'unsure' ? 'Consultation' : undefined,
          dentistEmail: dentist,
          preferredDate: day,
          selectedSlotTime: time,
          source,
          confirm: true,
        }),
      });
    } catch {}

    // Save booking locally for full synchronization
    try {
      const chosenService = CLINIC_SERVICES.find((s) => s.slug === service);
      upsertAppointment({
        id: `APT-REC-${Date.now()}`,
        patientId: bookedPatientId,
        patientName,
        branchCode: (branch || 'BR-A') as 'BR-A' | 'BR-B' | 'BR-C',
        branchNameEn: branch === 'BR-B' ? 'Minya – Branch B' : branch === 'BR-C' ? 'Minya – Branch C' : 'Minya – Branch A',
        branchNameAr: branch === 'BR-B' ? 'المنيا – الفرع ب' : branch === 'BR-C' ? 'المنيا – الفرع ج' : 'المنيا – الفرع أ',
        doctorNameEn: chosenDentist.nameEn,
        doctorNameAr: chosenDentist.nameAr,
        serviceEn: chosenService?.nameEn || 'Front-Desk Appointment',
        serviceAr: chosenService?.nameAr || 'موعد من الاستقبال',
        date: day,
        time: time,
        status: 'CONFIRMED',
        isPast: false,
      });
    } catch {}

    setBusy(false);
    onSaved();
  }

  return (
    <FrostedSlideOverDrawer
      open={true}
      onClose={onClose}
      title={t('newBooking')}
      subtitle={locale === 'ar' ? 'حجز وتأكيد فوري من مكتب الاستقبال' : 'Front-desk instant appointment booking'}
      iconBadge={<Calendar className="w-5 h-5" />}
      ariaLabel={t('newBooking')}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="secondary-button">
            {t('close')}
          </button>
          <button
            type="submit"
            form="reception-booking-form"
            className="primary-button"
            disabled={busy || loading || !time || (!patient && !newPatient)}
          >
            {busy ? t('checking') : t('confirm')}
          </button>
        </div>
      }
    >
      <form id="reception-booking-form" onSubmit={submit} className="space-y-4">
        <div
          onClick={() => setNewPatient(!newPatient)}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F6F2] border border-slate-200/80 cursor-pointer"
        >
          <label className="flex items-center gap-2.5 text-xs font-extrabold text-[#0B2528] cursor-pointer">
            <input
              type="checkbox"
              checked={newPatient}
              onChange={(e) => setNewPatient(e.target.checked)}
              className="rounded text-[#0B2528]"
            />
            <UserPlus className="w-4 h-4 text-[#C8A96E]" />
            <span>{locale === 'ar' ? 'تسجيل مريض جديد' : 'Register a new patient'}</span>
          </label>
        </div>

        {newPatient ? (
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs font-bold space-y-1">
              <span>{locale === 'ar' ? 'الاسم الكامل' : 'Full name'}</span>
              <input
                className="field w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
              />
            </label>
            <label className="text-xs font-bold space-y-1">
              <span>{locale === 'ar' ? 'رقم الهاتف' : 'Phone number'}</span>
              <input
                className="field w-full"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                minLength={8}
              />
            </label>
            <label className="text-xs font-bold space-y-1">
              <span>{locale === 'ar' ? 'تاريخ الميلاد' : 'Date of birth'}</span>
              <input
                className="field w-full"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={cairoDate()}
                required
              />
            </label>
          </div>
        ) : (
          <label className="block text-xs font-bold space-y-1.5">
            <span>{t('findPatient')}</span>
            <LocalizedInput
              className="field w-full"
              placeholder={t('search')}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPatient(null);
              }}
            />
          </label>
        )}

        {!newPatient &&
          (patient ? (
            <p className="p-3.5 bg-[#E6F0EE] border border-[#0B2528]/15 rounded-2xl text-xs font-extrabold text-[#0B2528]">
              {patient.fullName} · {patient.patientNumber}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {patients.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="p-3 rounded-2xl text-start w-full bg-[#F7F6F2] hover:bg-[#F9F5EB] border border-slate-200/70 text-xs font-bold text-[#0B2528]"
                    onClick={() => {
                      setPatient(p);
                      setPatients([]);
                    }}
                  >
                    {p.fullName} · <bdi>{p.primaryPhone}</bdi> · {p.patientNumber}
                  </button>
                </li>
              ))}
            </ul>
          ))}

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-xs font-bold space-y-1">
            <span>{t('branch')}</span>
            <select
              className="field w-full"
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setDentist('ANY');
              }}
            >
              {branches.map((b) => (
                <option value={b.code} key={b.id}>
                  <TranslatedText text={String(b.name)} />
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold space-y-1">
            <span>{t('source')}</span>
            <select
              className="field w-full"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {[
                ['RECEPTION_PHONE', 'phone'],
                ['WHATSAPP', 'whatsapp'],
                ['WALK_IN', 'walkIn'],
                ['OTHER', 'other'],
              ].map(([v, k]) => (
                <option key={v} value={v}>
                  {t(k as 'phone')}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold space-y-1">
            <span>{t('service')}</span>
            <select
              className="field w-full"
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              <option value="unsure">{t('unsure')}</option>
              {CLINIC_SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {locale === 'ar' ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold space-y-1">
            <span>{t('dentist')}</span>
            <select
              className="field w-full"
              value={dentist}
              onChange={(e) => setDentist(e.target.value)}
            >
              <option value="ANY">{t('anyDentist')}</option>
              {CLINIC_DENTISTS.filter((d) => d.branchCode === branch).map((d) => (
                <option value={d.email} key={d.id}>
                  {locale === 'ar' ? d.nameAr : d.nameEn}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold space-y-1">
            <span>{t('date')}</span>
            <input
              className="field w-full"
              type="date"
              value={day}
              min={cairoDate()}
              onChange={(e) => setDay(e.target.value)}
              required
            />
          </label>
          <label className="text-xs font-bold space-y-1">
            <span>{t('chooseTime')}</span>
            <select
              className="field w-full"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">{loading ? t('checking') : t('chooseTime')}</option>
              {slots.map((s) => (
                <option value={s.time} key={s.time}>
                  {s.time}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Tactile Time-Slot Pills */}
        {slots.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C8A96E]" />
              <span>{locale === 'ar' ? 'اختيار سريع للوقت' : 'Quick Slot Selection'}</span>
            </span>
            <div className="grid grid-cols-4 gap-2">
              {slots.slice(0, 8).map((s) => (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => setTime(s.time)}
                  className={`slot-button ${time === s.time ? 'selected' : ''}`}
                >
                  {s.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && !slots.length && <p className="text-xs text-amber-800">{t('noSlots')}</p>}
        {error && (
          <p role="alert" className="text-xs font-bold text-rose-800 bg-rose-50 p-3 rounded-2xl">
            {error}
          </p>
        )}
      </form>
    </FrostedSlideOverDrawer>
  );
}
