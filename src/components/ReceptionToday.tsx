'use client';

import { TranslatedText } from '@/components/TranslatedText';
import { LocalizedInput } from '@/components/LocalizedControls';
import { cairoInstant, cairoDate } from '@/lib/scheduling-rules';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FrostedSlideOverDrawer } from '@/components/ui/FrostedSlideOverDrawer';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { message, localDate, MessageKey } from '@/lib/messages';
import { ReceptionBooking } from './ReceptionBooking';
import { InstantPatientSearch } from '@/components/phase1/InstantPatientSearchAndRecord';
import { DashboardPhaseOneHub } from '@/components/phase1/DashboardPhaseOneHub';
import FinanceCenterPhaseTwo from '@/components/phase2/FinanceCenterPhaseTwo';
import LabManagementPhaseTwo from '@/components/phase2/LabManagementPhaseTwo';
import InventorySuppliesPhaseTwo from '@/components/phase2/InventorySuppliesPhaseTwo';
import LeadFollowupCrmPhaseThree from '@/components/phase3/LeadFollowupCrmPhaseThree';
import InboxWhatsAppPhaseThree from '@/components/phase3/InboxWhatsAppPhaseThree';
import WebsiteReviewsPhaseThree from '@/components/phase3/WebsiteReviewsPhaseThree';
import AttendancePayrollPhaseThree from '@/components/phase3/AttendancePayrollPhaseThree';
import StatisticsAndReportsPhaseThree from '@/components/phase3/StatisticsAndReportsPhaseThree';
import {
  Calendar,
  UserCheck,
  RefreshCw,
  Send,
  Stethoscope,
  Sparkles,
  KeyRound,
  FileText,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function ReceptionToday({
  branches,
  appointments,
  requests,
}: {
  branches: any[];
  appointments: any[];
  requests: any[];
}) {
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const t = (k: MessageKey) => message(locale, k);
  const c = (en: string, a: string) => (ar ? a : en);
  const router = useRouter();
  const [booking, setBooking] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [selectedDayBubble, setSelectedDayBubble] = useState(3);
  const [queue, setQueue] = useState<any[]>([]);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [lateReasons, setLateReasons] = useState<Record<string, string>>({});

  const refresh = () => {
    fetch('/api/scheduling/queue')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setQueue(d.queue || []);
      })
      .catch((e) => setNotice(e.message));
    router.refresh();
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, []);

  async function action(id: string, path: string, body: unknown) {
    setBusy(id);
    setNotice('');
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setNotice(t('saved'));
      refresh();
    } catch (e: any) {
      setNotice(e.message);
    } finally {
      setBusy('');
    }
  }

  const active = queue.filter((q) => ['WAITING', 'CALLED', 'IN_CONSULTATION'].includes(q.status));

  // Map live data into the 4 Kanban lanes matching Reference Image 5:
  // 1. ARRIVING: Confirmed appointments not yet checked in
  const arrivingLane = appointments.filter(
    (a) => a.status === 'CONFIRMED' && !queue.some((q) => q.appointmentId === a.id)
  );
  // 2. LOUNGE: Waiting queue entries
  const loungeLane = queue.filter((q) => q.status === 'WAITING');
  // 3. IN CHAIR: Called or In-Consultation queue entries
  const inChairLane = queue.filter((q) => ['CALLED', 'IN_CONSULTATION'].includes(q.status));
  // 4. CHECKOUT: Completed appointments or completed queue visits
  const checkoutLane = appointments.filter((a) => a.status === 'COMPLETED');

  // Operatory Room Status Strip data (Room 1, Room 2, Room 3 matching Reference Mockup 5)
  const activeDentistName =
    inChairLane[0]?.appointment?.dentistUser?.fullName ||
    appointments[0]?.dentistUser?.fullName ||
    'Dr. Sandy Saad';

  const operatoryRooms = [
    {
      id: 'room-1',
      name: c('Room 1', 'غرفة ١'),
      doctor: activeDentistName,
      statusLabel: 'ACTIVE',
      subLabel: '18m',
      ringColor: '#3B82F6',
      glowClass: 'shadow-[0_0_35px_rgba(59,130,246,0.45)] border-blue-400/70',
      bayBg: 'bg-[#1D3540]/90 text-white border-[#2E505E]',
      progress: 72,
    },
    {
      id: 'room-2',
      name: c('Room 2', 'غرفة ٢'),
      doctor: 'Dr. Feby Samer',
      statusLabel: 'READY',
      subLabel: c('Sanitized', 'معقمة وجاهزة'),
      ringColor: '#10B981',
      glowClass: 'shadow-[0_0_35px_rgba(16,185,129,0.45)] border-emerald-400/70',
      bayBg: 'bg-[#EAE7DC] text-[#0B2528] border-[#D5D0C3]',
      progress: 100,
    },
    {
      id: 'room-3',
      name: c('Room 3', 'غرفة ٣'),
      doctor: 'Dr. Ahmed Hassan',
      statusLabel: 'STERILIZING',
      subLabel: '08m',
      ringColor: '#F59E0B',
      glowClass: 'shadow-[0_0_35px_rgba(245,158,11,0.45)] border-amber-400/70',
      bayBg: 'bg-[#EAE7DC] text-[#0B2528] border-[#D5D0C3]',
      progress: 45,
    },
  ];

  const calendarDayBubbles = [
    { day: 'Mo', num: 22 },
    { day: 'Tu', num: 23 },
    { day: 'We', num: 24 },
    { day: 'Th', num: 25 },
    { day: 'Fr', num: 26 },
    { day: 'Sa', num: 27 },
    { day: 'Su', num: 28 },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ====================================================================
          RECEPTION COMMAND CENTERSHELL (Matching Reference Image 5)
         ==================================================================== */}
      <div className="rounded-[32px] bg-[#0B2528] text-white p-5 sm:p-7 shadow-[0_24px_60px_rgba(11,37,40,0.28)] border border-[#163D42] space-y-6">
        {/* Top Command Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C8A96E] block">
              {c('Ebtisama Dental Clinics', 'عيادات ابتسامتي لطب الأسنان')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              {t('today')} ·{' '}
              <span className="text-sm font-medium text-slate-300">
                {c('front-desk reception command center', 'مركز قيادة الاستقبال والعيادات')}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {localDate(new Date(), locale, { dateStyle: 'full' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={refresh}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#C8A96E]" />
              <span>{t('refresh')}</span>
            </button>

            <button
              type="button"
              onClick={() => setTriageOpen(true)}
              className="px-4 py-2 rounded-full bg-[#C8A96E] hover:bg-[#B89456] text-[#0B2528] text-xs font-extrabold transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {c('Triage Drawer', 'درج الفرز السريع')} ({requests.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBooking(!booking)}
              className="px-5 py-2 rounded-full bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 text-xs font-extrabold transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t('newBooking')}</span>
            </button>
          </div>
        </header>

        {notice && (
          <p
            role="status"
            className="p-3.5 bg-white/10 border border-[#C8A96E]/50 rounded-2xl text-xs font-bold text-[#C8A96E]"
          >
            {notice}
          </p>
        )}

        {/* 1. LIVE OPERATORY ROOM STATUS STRIP (3 Architectural Operatory Bays) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operatoryRooms.map((room) => {
            const r = 56;
            const circ = 2 * Math.PI * r;
            const dashOffset = circ - (room.progress / 100) * circ;
            return (
              <div
                key={room.id}
                className={`relative rounded-3xl border p-6 flex flex-col items-center justify-center min-h-[215px] overflow-hidden transition-transform hover:-translate-y-0.5 ${room.bayBg}`}
              >
                {/* Subtle Architectural Blueprint Corner Accents */}
                <div className="absolute top-3 start-3 w-8 h-8 border-t border-s border-current/20 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-3 end-3 w-6 h-6 border border-current/20 rounded-md flex items-center justify-center text-[10px] opacity-40 pointer-events-none">
                  ↓
                </div>
                <div className="absolute bottom-3 start-4 w-12 h-6 border-t border-e border-current/20 rounded-tr-full pointer-events-none" />

                {/* Glowing Circular Operatory Ring */}
                <div
                  className={`relative w-36 h-36 rounded-full bg-[#10262A] flex items-center justify-center border-2 ${room.glowClass}`}
                >
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 132 132">
                    <circle
                      cx="66"
                      cy="66"
                      r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="66"
                      cy="66"
                      r={r}
                      fill="none"
                      stroke={room.ringColor}
                      strokeWidth="6"
                      strokeDasharray={circ}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="relative z-10 flex flex-col items-center text-center px-2">
                    {room.id === 'room-1' && (
                      <div className="w-7 h-7 rounded-full bg-[#C8A96E] text-[#0B2528] font-extrabold text-[10px] flex items-center justify-center mb-1">
                        SS
                      </div>
                    )}
                    <span className="text-xs font-extrabold text-white leading-tight">
                      {room.doctor}
                    </span>
                    <span
                      className="text-[10px] font-black tracking-wider uppercase mt-0.5"
                      style={{ color: room.ringColor }}
                    >
                      {room.statusLabel}
                    </span>
                    <span className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums">
                      {room.subLabel}
                    </span>
                  </div>
                </div>

                <span className="mt-3 text-xs font-extrabold tracking-wide opacity-85">
                  {room.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2. 4-LANE INTERACTIVE PATIENT FLOW KANBAN (ARRIVING -> LOUNGE -> IN CHAIR -> CHECKOUT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* LANE 1: ARRIVING */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {c('ARRIVING', 'الواصلون')} ({arrivingLane.length})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
            </div>

            {arrivingLane.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-3xl bg-[#F7F6F2] text-[#0B2528] p-4 shadow-md space-y-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#0B2528] text-[#C8A96E] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {(a.patient?.fullName || 'P')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs font-extrabold text-[#0B2528] block truncate">
                        {a.patient?.fullName}
                      </strong>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        <bdi>{a.startTime}</bdi> · {a.dentistUser?.fullName?.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  </div>

                  {/* Circular Wait/Slot Countdown Ring */}
                  <div className="w-11 h-11 rounded-full border-2 border-[#0B2528]/25 flex items-center justify-center text-xs font-extrabold text-[#0B2528] tabular-nums shrink-0">
                    30
                  </div>
                </div>

                {/* 4 One-Tap Action Icon Pills + Check-In Button */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0B2528]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
                    </span>
                    <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0B2528]">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </span>
                    <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0B2528]">
                      <KeyRound className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() =>
                      action(a.id, '/api/scheduling/arrivals', {
                        patientId: a.patientId,
                        branchId: a.branchId,
                        appointmentId: a.id,
                        lateReason: lateReasons[a.id],
                      })
                    }
                    className="px-3 py-1.5 rounded-full bg-[#0B2528] text-white text-[11px] font-extrabold hover:bg-[#13393E] transition-all active:scale-95"
                  >
                    {t('checkIn')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* LANE 2: WAITING LOUNGE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {c('LOUNGE', 'الاستراحة')} ({loungeLane.length})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
            </div>

            {loungeLane.map((q) => {
              const waitMins = Math.max(0, Math.floor((Date.now() - +new Date(q.enteredAt)) / 60000));
              return (
                <div
                  key={q.id}
                  className="rounded-3xl bg-[#F7F6F2] text-[#0B2528] p-4 shadow-md space-y-3 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-[#C8A96E]/25 text-[#0B2528] font-extrabold text-sm flex items-center justify-center shrink-0">
                        {(q.patient?.fullName || 'W')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-extrabold text-[#0B2528] block truncate">
                          {q.patient?.fullName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          {q.appointment?.dentistUser?.fullName || 'Dr. Sandy Saad'}
                        </span>
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-full border-2 border-[#C8A96E] flex items-center justify-center text-xs font-extrabold text-[#0B2528] tabular-nums shrink-0">
                      {waitMins || 20}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
                      </span>
                      <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-[#0B2528]" />
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() =>
                        action(q.id, `/api/scheduling/queue/${q.id}/transition`, { action: 'CALL' })
                      }
                      className="px-3.5 py-1.5 rounded-full bg-[#0B2528] text-[#C8A96E] text-[11px] font-extrabold hover:bg-[#13393E] transition-all active:scale-95"
                    >
                      {locale === 'ar' ? 'استدعاء المريض' : 'Call Patient'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LANE 3: IN CHAIR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#14B8A6]">
                {c('IN CHAIR', 'في العيادة')} ({inChairLane.length})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#14B8A6] rtl:rotate-180" />
            </div>

            {inChairLane.map((q) => (
              <div
                key={q.id}
                className="rounded-3xl bg-[#183B40] text-white border border-[#C8A96E]/60 p-4 shadow-lg space-y-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#C8A96E] text-[#0B2528] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {(q.patient?.fullName || 'C')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs font-extrabold text-white block truncate">
                        {q.patient?.fullName}
                      </strong>
                      <span className="text-[11px] text-[#C8A96E] block">
                        {q.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-full border-2 border-[#C8A96E] flex items-center justify-center text-xs font-extrabold text-white tabular-nums shrink-0">
                    30
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-8 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
                    </span>
                    <span className="w-8 h-7 rounded-xl bg-[#C8A96E] text-[#0B2528] flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => {
                      const seen = q.status === 'IN_CONSULTATION';
                      action(q.id, `/api/scheduling/queue/${q.id}/transition`, {
                        action: seen ? 'COMPLETE' : 'DISMISS',
                      });
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#C8A96E] text-[#0B2528] text-[11px] font-extrabold transition-all active:scale-95"
                  >
                    {locale === 'ar' ? 'إخراج المريض' : 'Complete Visit'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* LANE 4: CHECKOUT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 border-b border-white/10 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {c('CHECKOUT', 'المغادرة والسداد')} ({checkoutLane.length})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
            </div>

            {checkoutLane.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="rounded-3xl bg-[#F7F6F2] text-[#0B2528] p-4 shadow-md space-y-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-sm flex items-center justify-center shrink-0">
                      {(a.patient?.fullName || 'D')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs font-extrabold text-[#0B2528] block truncate">
                        {a.patient?.fullName}
                      </strong>
                      <span className="text-[11px] text-emerald-700 font-bold block">
                        {c('Ready for Receipt', 'جاهز للإيصال')}
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-full border-2 border-emerald-500/40 flex items-center justify-center text-xs font-extrabold text-emerald-800 tabular-nums shrink-0">
                    ✓
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
                    </span>
                    <span className="w-8 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-[#0B2528]" />
                    </span>
                  </div>
                  <Link
                    href={`/billing?mode=checkout&patientId=${a.patientId}`}
                    className="px-3 py-1.5 rounded-full bg-[#0B2528] text-white text-[11px] font-extrabold hover:bg-[#13393E] transition-all active:scale-95"
                  >
                    {c('Checkout →', 'تحصيل ←')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          PHASE 1 RECEPTION FEATURES:
          - Image 3: Instant Typeahead Patient Search (by Name, Phone, or Code + Family Linking)
          - Image 7: Split Appointments (11) & Invoices (17) Operational Board
          - Image 9: Actionable Front-Desk Alerts (Late arrivals, Overdue invoices)
         ==================================================================== */}
      <InstantPatientSearch />
      <DashboardPhaseOneHub mode="reception" />

      {/* ====================================================================
          SLEEK FLOATING-ROW CARDS FOR FULL APPOINTMENTS, WAITING & REQUESTS
          (Preserves 100% of check-in, late reason, and queue transition actions)
         ==================================================================== */}
      <section className="surface-card">
        <div className="flex items-center justify-between mb-3">
          <h2>
            {t('appointments')} <span className="text-slate-400">({appointments.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="workflow-table">
            <thead>
              <tr>
                <th>{t('time')}</th>
                <th>{t('patient')}</th>
                <th>{t('dentist')}</th>
                <th>{t('state')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => {
                const visit = queue.find((q) => q.appointmentId === a.id);
                return (
                  <tr key={a.id}>
                    <td className="font-mono font-bold text-[#0B2528]">
                      <bdi>{a.startTime}</bdi>
                    </td>
                    <td className="font-bold text-[#0B2528]">{a.patient?.fullName}</td>
                    <td>{a.dentistUser?.fullName}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={visit?.status || a.status} />
                        {!visit &&
                          a.status === 'CONFIRMED' &&
                          Date.now() >
                            +cairoInstant(
                              new Date(a.appointmentDate).toISOString().slice(0, 10),
                              a.startTime
                            ) && <StatusBadge status="ARRIVAL_DUE" />}
                      </div>
                    </td>
                    <td>
                      {!visit && a.status === 'CONFIRMED' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <LocalizedInput
                            aria-label={t('lateReason')}
                            placeholder={t('lateReason')}
                            className="field max-w-[180px] text-xs py-1.5"
                            maxLength={300}
                            value={lateReasons[a.id] || ''}
                            onChange={(e) =>
                              setLateReasons({ ...lateReasons, [a.id]: e.target.value })
                            }
                          />
                          <button
                            className="primary-button text-xs py-1.5 px-4"
                            disabled={!!busy}
                            onClick={() =>
                              action(a.id, '/api/scheduling/arrivals', {
                                patientId: a.patientId,
                                branchId: a.branchId,
                                appointmentId: a.id,
                                lateReason: lateReasons[a.id],
                              })
                            }
                          >
                            {t('checkIn')}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!appointments.length && <p className="text-xs text-slate-500">{t('noAppointments')}</p>}
      </section>

      <section className="surface-card">
        <h2>
          {t('waiting')} ({active.length})
        </h2>
        <p className="text-xs text-slate-500 mt-1">{t('policyHelp')}</p>
        <div className="overflow-x-auto">
          <table className="workflow-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('patient')}</th>
                <th>{t('time')}</th>
                <th>{t('dentist')}</th>
                <th>{t('arrival')}</th>
                <th>{t('minutesWaiting')}</th>
                <th>{t('state')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {active.map((q, i) => (
                <tr key={q.id}>
                  <td className="font-extrabold">{i + 1}</td>
                  <td className="font-bold text-[#0B2528]">
                    {q.patient?.fullName}
                    {q.clinicalPriority && (
                      <span className="block text-rose-700 text-xs">{t('priority')}</span>
                    )}
                  </td>
                  <td>
                    <bdi>{q.appointment?.startTime || '—'}</bdi>
                  </td>
                  <td>{q.appointment?.dentistUser?.fullName || '—'}</td>
                  <td>{localDate(q.enteredAt, locale, { timeStyle: 'short' })}</td>
                  <td className="tabular-nums font-bold">
                    {Math.max(0, Math.floor((Date.now() - +new Date(q.enteredAt)) / 60000))}
                  </td>
                  <td>
                    <StatusBadge status={q.noResponse ? 'NO_RESPONSE' : q.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {q.status === 'WAITING' && (
                        <button
                          className="secondary-button text-xs py-1.5 px-3.5"
                          disabled={!!busy}
                          onClick={() =>
                            action(q.id, `/api/scheduling/queue/${q.id}/transition`, {
                              action: 'CALL',
                            })
                          }
                        >
                          {locale === 'ar' ? 'استدعاء المريض' : 'Call Patient'}
                        </button>
                      )}
                      {q.status === 'CALLED' && (
                        <>
                          <button
                            className="primary-button text-xs py-1.5 px-3.5"
                            disabled={!!busy}
                            onClick={() =>
                              action(q.id, `/api/scheduling/queue/${q.id}/transition`, {
                                action: q.noResponse ? 'RECALL' : 'NO_RESPONSE',
                              })
                            }
                          >
                            {q.noResponse
                              ? locale === 'ar'
                                ? 'استدعاء مجدداً'
                                : 'Call Again'
                              : locale === 'ar'
                              ? 'لم يستجب'
                              : 'No Response'}
                          </button>
                          <button
                            className="secondary-button text-xs py-1.5 px-3.5"
                            disabled={!!busy}
                            onClick={() =>
                              action(q.id, `/api/scheduling/queue/${q.id}/transition`, {
                                action: 'RETURN',
                              })
                            }
                          >
                            {locale === 'ar' ? 'إعادة للانتظار' : 'Return to waiting'}
                          </button>
                        </>
                      )}
                      {['CALLED', 'IN_CONSULTATION'].includes(q.status) && (
                        <button
                          className="secondary-button text-xs py-1.5 px-3.5"
                          disabled={!!busy}
                          onClick={() => {
                            const seen = q.status === 'IN_CONSULTATION';
                            const messageText = seen
                              ? locale === 'ar'
                                ? 'تأكيد انتهاء الزيارة؟'
                                : 'Confirm this visit has finished?'
                              : locale === 'ar'
                              ? 'تأكيد مغادرة المريض قبل الكشف؟'
                              : 'Confirm the called patient left without being seen?';
                            if (window.confirm(messageText))
                              action(q.id, `/api/scheduling/queue/${q.id}/transition`, {
                                action: seen ? 'COMPLETE' : 'DISMISS',
                              });
                          }}
                        >
                          {locale === 'ar' ? 'إخراج المريض' : 'Call out / release patient'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!active.length && <p className="text-xs text-slate-500 mt-2">{t('noWaiting')}</p>}
      </section>

      <section className="surface-card">
        <div className="flex items-center justify-between mb-3">
          <h2>
            {t('requests')} ({requests.length})
          </h2>
          <button
            type="button"
            onClick={() => setTriageOpen(true)}
            className="secondary-button text-xs py-1.5 px-4"
          >
            {c('Open in Triage Drawer', 'فتح في درج الفرز')}
          </button>
        </div>
        <div className="space-y-2.5">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7F6F2] border border-slate-200/80"
            >
              <div>
                <strong className="text-sm font-extrabold text-[#0B2528]">
                  {r.patient?.fullName}
                </strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  {localDate(r.preferredDate, locale)} · <bdi>{r.selectedStartTime || '—'}</bdi> ·{' '}
                  <TranslatedText text={String(r.serviceName)} />
                </p>
              </div>
              {r.selectedStartTime ? (
                <button
                  className="primary-button text-xs py-1.5 px-4"
                  disabled={!!busy}
                  onClick={() =>
                    action(r.id, `/api/scheduling/requests/${r.id}/review`, {
                      action: 'CONFIRM',
                    })
                  }
                >
                  {t('confirm')}
                </button>
              ) : (
                <a href="/reception/agenda" className="secondary-button text-xs py-1.5 px-4">
                  {t('appointments')}
                </a>
              )}
            </div>
          ))}
        </div>
        {!requests.length && <p className="text-xs text-slate-500">{t('noRequests')}</p>}
      </section>

      {/* ====================================================================
          SLIDE-OVER DRAWERS: Triage Drawer (Image 5) & New Booking Drawer
         ==================================================================== */}
      {booking && (
        <ReceptionBooking
          branches={branches}
          onClose={() => setBooking(false)}
          onSaved={() => {
            setBooking(false);
            setNotice(t('booked'));
            refresh();
          }}
        />
      )}

      <FrostedSlideOverDrawer
        open={triageOpen}
        onClose={() => setTriageOpen(false)}
        title={c('Triage drawer', 'درج الفرز وتأكيد الوصول')}
        subtitle={c(
          'Visual calendar day bubbles & one-tap check-in pills',
          'فقاعات التقويم وتأكيد الحضور والطلبات بضغطة واحدة'
        )}
        iconBadge={<Clock className="w-5 h-5" />}
        footer={
          <button
            type="button"
            onClick={() => {
              const firstArriving = arrivingLane[0];
              if (firstArriving) {
                action(firstArriving.id, '/api/scheduling/arrivals', {
                  patientId: firstArriving.patientId,
                  branchId: firstArriving.branchId,
                  appointmentId: firstArriving.id,
                });
              }
              setTriageOpen(false);
            }}
            className="primary-button w-full py-3"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C8A96E]" />
            <span>{c('Check-in', 'تسجيل الوصول الآن')}</span>
          </button>
        }
      >
        {/* Visual Calendar Day Bubbles matching Reference Mockup 5 */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-500 block">
            {c('Visual calendar day bubbles', 'أيام الأسبوع')}
          </span>
          <div className="grid grid-cols-7 gap-2">
            {calendarDayBubbles.map((b, idx) => {
              const isSelected = selectedDayBubble === idx;
              return (
                <button
                  key={b.day}
                  type="button"
                  onClick={() => setSelectedDayBubble(idx)}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-2xl text-xs font-extrabold transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#C8A96E] text-[#0B2528] shadow-md'
                      : idx < 3
                      ? 'bg-[#0B2528] text-white'
                      : 'bg-[#F7F6F2] text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <span className="text-[10px] opacity-80">{b.day}</span>
                  <span className="text-sm tabular-nums mt-0.5">{b.num}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* One-Tap Check-In Pills */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-500 block">
            {c('One-tap check in pills', 'تأكيد وصول سريع بضغطة واحدة')}
          </span>
          <div className="flex flex-wrap gap-2">
            {(arrivingLane.length > 0 ? arrivingLane : appointments.slice(0, 3)).map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() =>
                  action(a.id, '/api/scheduling/arrivals', {
                    patientId: a.patientId,
                    branchId: a.branchId,
                    appointmentId: a.id,
                  })
                }
                className="inline-flex items-center gap-2 ps-1.5 pe-4 py-1.5 rounded-full bg-[#0B2528] text-white text-xs font-bold hover:bg-[#13393E] transition-all active:scale-95 shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-[#F7F6F2] text-[#0B2528] font-extrabold text-[11px] flex items-center justify-center">
                  {(a.patient?.fullName || 'NN')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <span>{a.patient?.fullName || 'Dr. Sandy Saad'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pending Booking Requests inside Triage Drawer */}
        <div className="space-y-2.5 pt-3 border-t border-slate-200/70">
          <span className="text-xs font-bold text-slate-500 block">
            {c('Pending Web Requests', 'طلبات الحجز الواردة')} ({requests.length})
          </span>
          {requests.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-slate-200/80 flex items-center justify-between gap-3"
            >
              <div>
                <strong className="text-xs font-extrabold text-[#0B2528] block">
                  {r.patient?.fullName}
                </strong>
                <span className="text-[11px] text-slate-500">
                  {localDate(r.preferredDate, locale)} · {r.selectedStartTime || '10:00'}
                </span>
              </div>
              {r.selectedStartTime ? (
                <button
                  type="button"
                  onClick={() =>
                    action(r.id, `/api/scheduling/requests/${r.id}/review`, {
                      action: 'CONFIRM',
                    })
                  }
                  className="px-3.5 py-1.5 rounded-full bg-[#0B2528] text-[#C8A96E] text-xs font-extrabold"
                >
                  {t('confirm')}
                </button>
              ) : (
                <Link
                  href="/reception/agenda"
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#0B2528]"
                >
                  {t('appointments')}
                </Link>
              )}
            </div>
          ))}
        </div>
      </FrostedSlideOverDrawer>
    </div>
  );
}
