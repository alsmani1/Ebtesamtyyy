"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Sparkles, Send, X, ShieldCheck, Loader2, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getStaticSessionUser, STATIC_AUTH_EVENT, STATIC_SESSION_STORAGE_KEY } from '@/lib/auth';
import {
  ASSISTANT_OPEN_EVENT,
  ASSISTANT_SESSION_EVENT,
  assistantApi,
  assistantResponseSchema,
  clearAssistantSession,
  getAssistantSession,
  getDirectAssistantActor,
  isAssistantConfigured,
  isDirectGeminiConfigured,
  verifyAssistantSession,
  type AssistantActor,
  type AssistantChart,
  type AssistantResponse,
  type AssistantRole,
} from '@/lib/assistant-api';
import { syncAssistantContext } from '@/lib/assistant-context';
import { askDirectGemini } from '@/lib/assistant-direct';
import { APPOINTMENTS_EVENT } from '@/lib/appointments-db';
import { PATIENTS_DB_EVENT } from '@/lib/patients-db';
import { SHARED_INVOICES_EVENT } from '@/lib/finance-storage';
import { SHARED_EXPENSES_EVENT } from '@/lib/clinic-costs';
import { LAB_ORDERS_EVENT } from '@/lib/use-persisted-state';

interface ChatEntry {
  id: string;
  sender: 'user' | 'ai' | 'error';
  text: string;
  refused?: boolean;
  chart?: AssistantChart;
}

const ROLE_LABELS: Record<AssistantRole, [string, string]> = {
  clinic_owner: ['Owner · My clinic records', 'المالك · بيانات عيادتي'],
  doctor: ['Doctor · My assigned patients', 'الطبيب · المرضى المسندون إليّ'],
  receptionist: ['Reception · My branch records', 'الاستقبال · بيانات فرعي'],
  patient: ['Patient · My own file', 'المريض · ملفي فقط'],
};
const PROMPTS: Record<AssistantRole, [string, string][]> = {
  clinic_owner: [
    ['Show a monthly collections graph', 'اعرض رسمًا للتحصيل الشهري'],
    ['What is the outstanding invoice balance?', 'ما إجمالي أرصدة الفواتير المستحقة؟'],
    ['Summarize unfinished appointments', 'لخص المواعيد غير المكتملة'],
  ],
  doctor: [
    ['What appointments are assigned to me?', 'ما المواعيد المسندة إليّ؟'],
    ['Summarize my assigned patients’ medical alerts', 'لخص التنبيهات الطبية لمرضاي'],
  ],
  receptionist: [
    ['Which appointments are still unfinished in my branch?', 'ما المواعيد غير المكتملة في فرعي؟'],
    ['Which invoices in my branch have unpaid balances?', 'ما الفواتير غير المسددة في فرعي؟'],
  ],
  patient: [
    ['When is my next appointment?', 'متى موعدي القادم؟'],
    ['What remains to pay on my invoices?', 'كم يتبقى عليّ في فواتيري؟'],
  ],
};

function matchesActor(left: AssistantActor, right: AssistantActor): boolean {
  return left.userId === right.userId &&
    left.clinicId === right.clinicId &&
    left.role === right.role &&
    left.branchCode === right.branchCode &&
    left.patientId === right.patientId &&
    left.doctorNameEn === right.doctorNameEn;
}

function OwnerChart({ chart }: { chart: AssistantChart }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 600;
  const height = 320;
  const left = 68;
  const top = 24;
  const plotWidth = width - left - 20;
  const plotHeight = 200;
  const min = Math.min(0, ...chart.points.map((point) => point.value));
  const max = Math.max(0, ...chart.points.map((point) => point.value)) || (min === 0 ? 1 : 0);
  const span = max - min;
  const y = (value: number) => top + ((max - value) / span) * plotHeight;
  const slot = plotWidth / chart.points.length;
  const x = (index: number) => left + slot * (index + 0.5);
  const zero = y(0);
  const download = () => {
    if (!svgRef.current) return;
    const url = URL.createObjectURL(new Blob([svgRef.current.outerHTML], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ebtesamty-chart.svg';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <figure className="assistant-chart mt-3 rounded-2xl border border-slate-200 bg-white p-3">
      <figcaption className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800">
        <span>{chart.title} · {chart.unit}</span>
        <button type="button" onClick={download} aria-label="Download SVG chart" className="rounded-lg p-2 hover:bg-slate-100">
          <Download className="h-4 w-4" />
        </button>
      </figcaption>
      <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={chart.title} className="mt-2 w-full" dir="ltr">
        <title>{chart.title}</title>
        {Array.from({ length: 5 }, (_, index) => {
          const value = min + (span * index) / 4;
          return (
            <g key={index}>
              <line x1={left} y1={y(value)} x2={width - 20} y2={y(value)} stroke="#e2e8f0" />
              <text x={left - 8} y={y(value) + 4} textAnchor="end" fontSize="11" fill="#475569">{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</text>
            </g>
          );
        })}
        <line x1={left} y1={zero} x2={width - 20} y2={zero} stroke="#94a3b8" />
        {chart.type === 'line' && (
          <polyline points={chart.points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ')} fill="none" stroke="#4169e1" strokeWidth="3" />
        )}
        {chart.points.map((point, index) => (
          <g key={index}>
            <title>{point.label}: {point.value.toLocaleString()} {chart.unit}</title>
            {chart.type === 'bar' ? (
              <rect x={x(index) - slot * 0.3} y={Math.min(zero, y(point.value))} width={slot * 0.6} height={Math.abs(zero - y(point.value))} rx="3" fill="#4169e1" />
            ) : (
              <circle cx={x(index)} cy={y(point.value)} r="4" fill="#4169e1" />
            )}
            <text x={x(index)} y={top + plotHeight + 18} textAnchor="end" transform={`rotate(-35 ${x(index)} ${top + plotHeight + 18})`} fontSize="11" fill="#475569">{point.label.slice(0, 22)}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export default function EbtesamtyFloatingAiAssistant() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [actor, setActor] = useState<AssistantActor | null>(null);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const generation = useRef(0);
  const request = useRef<AbortController | null>(null);
  const verifyRequest = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      generation.current += 1;
      request.current?.abort();
      request.current = null;
      verifyRequest.current?.abort();
      setActor(null);
      setMessages([]);
      setConversationId(undefined);
      setLoading(false);
      setInput('');
      if (!isAssistantConfigured()) {
        if (!isDirectGeminiConfigured()) {
          setConnectionError('The Gemini backend is not configured yet.');
          return;
        }
        const directActor = getDirectAssistantActor(getStaticSessionUser());
        if (!active) return;
        if (!directActor) {
          setConnectionError('Sign in with a demo account to use the assistant.');
          return;
        }
        setActor(directActor);
        setConnectionError('');
        return;
      }
      if (!getAssistantSession()) {
        setConnectionError('Sign in with your verified account to use the assistant.');
        return;
      }
      const controller = new AbortController();
      verifyRequest.current = controller;
      try {
        const session = await verifyAssistantSession(controller.signal);
        if (session.user.id !== getStaticSessionUser()?.id) {
          clearAssistantSession();
          return;
        }
        if (!active || controller.signal.aborted) return;
        setActor(session.actor);
        setConnectionError('');
      } catch (error) {
        if (active && !controller.signal.aborted) setConnectionError(error instanceof Error ? error.message : 'Unable to verify your session.');
      }
    };
    const open = (event: Event) => {
      setIsOpen(true);
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) setInput(prompt.slice(0, 2000));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === STATIC_SESSION_STORAGE_KEY || event.key === null) void refresh();
    };
    void refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener(ASSISTANT_OPEN_EVENT, open);
    window.addEventListener(STATIC_AUTH_EVENT, refresh);
    window.addEventListener(ASSISTANT_SESSION_EVENT, refresh);
    return () => {
      active = false;
      request.current?.abort();
      verifyRequest.current?.abort();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(ASSISTANT_OPEN_EVENT, open);
      window.removeEventListener(STATIC_AUTH_EVENT, refresh);
      window.removeEventListener(ASSISTANT_SESSION_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    if (!actor || actor.role === 'patient' || !isAssistantConfigured()) return;
    const controller = new AbortController();
    let queue = Promise.resolve();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sync = async () => {
      if (controller.signal.aborted) return;
      try {
        const session = await verifyAssistantSession(controller.signal);
        if (session.actor.userId !== actor.userId || session.actor.role !== actor.role || session.user.id !== getStaticSessionUser()?.id) return;
        await syncAssistantContext(session.actor, controller.signal);
        if (!controller.signal.aborted) setConnectionError('');
      } catch (error) {
        if (!controller.signal.aborted) setConnectionError(error instanceof Error ? error.message : 'Unable to synchronize clinic records.');
      }
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { queue = queue.then(sync); }, 300);
    };
    const events = [APPOINTMENTS_EVENT, PATIENTS_DB_EVENT, SHARED_INVOICES_EVENT, SHARED_EXPENSES_EVENT, LAB_ORDERS_EVENT];
    queue = sync();
    events.forEach((event) => window.addEventListener(event, schedule));
    window.addEventListener('storage', schedule);
    return () => {
      controller.abort();
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, schedule));
      window.removeEventListener('storage', schedule);
    };
  }, [actor]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, loading]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const send = async (prompt?: string) => {
    const query = (prompt ?? input).trim();
    if (!query || !actor || request.current || query.length > 2000) return;
    const controller = new AbortController();
    request.current = controller;
    const currentGeneration = generation.current;
    const direct = !isAssistantConfigured() && isDirectGeminiConfigured();
    const token = direct ? undefined : getAssistantSession()?.token;
    setMessages((previous) => [...previous, { id: crypto.randomUUID(), sender: 'user', text: query }]);
    setInput('');
    setLoading(true);
    try {
      let response: AssistantResponse;
      if (direct) {
        const directActor = getDirectAssistantActor(getStaticSessionUser());
        if (!directActor || !matchesActor(directActor, actor)) throw new Error('Your signed-in account changed. Sign in again.');
        const history = messages.flatMap((entry) => entry.sender === 'user' || entry.sender === 'ai' ? [{ sender: entry.sender, text: entry.text }] : []);
        response = await askDirectGemini(directActor, query, history, conversationId || crypto.randomUUID(), controller.signal);
      } else {
        const session = await verifyAssistantSession(controller.signal);
        if (session.user.id !== getStaticSessionUser()?.id) throw new Error('Your signed-in account changed. Sign in again.');
        if (!matchesActor(session.actor, actor)) {
          clearAssistantSession();
          return;
        }
        await syncAssistantContext(session.actor, controller.signal);
        response = assistantResponseSchema.parse(await assistantApi('/api/assistant', { query, ...(conversationId ? { conversationId } : {}) }, controller.signal));
        if (token !== getAssistantSession()?.token) return;
      }
      if (response.actorId !== actor.userId || response.role !== actor.role) throw new Error('The assistant returned an invalid user scope.');
      if (response.chart && actor.role !== 'clinic_owner') throw new Error('Charts are restricted to the owner.');
      if (generation.current !== currentGeneration) return;
      const text = response.answer || response.message;
      if (!text) throw new Error('The assistant returned an empty response.');
      setConnectionError('');
      setConversationId(response.conversationId);
      setMessages((previous) => [...previous, { id: crypto.randomUUID(), sender: 'ai', text, refused: response.type === 'permission_boundary', chart: response.chart }]);
    } catch (error) {
      if (!controller.signal.aborted && generation.current === currentGeneration) {
        setMessages((previous) => [...previous, { id: crypto.randomUUID(), sender: 'error', text: error instanceof Error ? error.message : 'The AI service is unavailable. Please try again.' }]);
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={isAr ? 'فتح شات بوت ابتسامتي' : 'Open Embtesamty AI chatbot'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={isAr ? 'شات بوت ابتسامتي' : 'Embtesamty AI chatbot'}
        className="assistant-launcher group fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#4169E1] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2446A6] active:scale-95 md:bottom-6 md:right-6"
      >
        <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        <span className="pointer-events-none absolute right-full me-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg group-hover:block group-focus-visible:block">
          {isAr ? 'شات بوت ابتسامتي' : 'Embtesamty AI chatbot'}
        </span>
      </button>
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="assistant-overlay fixed inset-0 z-[9999] flex justify-end bg-slate-900/40" onClick={() => setIsOpen(false)}>
          <aside role="dialog" aria-modal="true" aria-label={isAr ? 'شات بوت ابتسامتي' : 'Embtesamty AI chatbot'} dir={isAr ? 'rtl' : 'ltr'} onClick={(event) => event.stopPropagation()} className="assistant-drawer flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><Sparkles className="h-5 w-5 text-blue-600" />{isAr ? 'شات بوت ابتسامتي' : 'Embtesamty AI chatbot'}</h2>
                <p className="mt-1 text-xs font-semibold text-blue-700">{actor ? `${actor.fullName} · ${ROLE_LABELS[actor.role][isAr ? 1 : 0]}` : (isAr ? 'يتطلب تسجيل الدخول' : 'Sign-in required')}</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label={isAr ? 'إغلاق شات بوت ابتسامتي' : 'Close Embtesamty AI chatbot'} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {isAssistantConfigured() && (
                <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
                  {isAr
                    ? 'يستخدم Gemini بيانات العرض المرتبطة بدورك فقط. المساعد للقراءة ولا يعدل السجلات. مفتاح API مكشوف في هذا الإصدار التجريبي.'
                    : 'Gemini receives only records permitted for your verified account. This assistant is read-only and refuses other-role questions.'}
                </p>
              )}
              {connectionError && <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{connectionError}{(isAssistantConfigured() || isDirectGeminiConfigured()) && <Link href="/auth/login" onClick={() => setIsOpen(false)} className="mt-2 block font-bold text-blue-700 underline">{isAr ? 'تسجيل الدخول' : 'Sign in'}</Link>}</div>}
              {actor && messages.length === 0 && <div className="mb-4 flex flex-wrap gap-2">{PROMPTS[actor.role].map(([en, ar]) => <button key={en} type="button" onClick={() => void send(isAr ? ar : en)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-blue-50 active:scale-95">{isAr ? ar : en}</button>)}</div>}
              <div className="space-y-4" aria-live="polite">
                {messages.map((message) => (
                  <div key={message.id} className={`assistant-message rounded-2xl border p-4 text-sm ${message.sender === 'user' ? 'border-blue-100 bg-blue-50' : message.sender === 'error' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                    <span className="mb-2 flex items-center gap-1 text-xs font-bold text-slate-500">{message.sender === 'user' ? (isAr ? 'أنت' : 'You') : message.sender === 'error' ? (isAr ? 'خطأ في الاتصال' : 'Connection error') : 'Gemini'}{message.refused && <ShieldCheck className="h-3.5 w-3.5" />}</span>
                    <p className="whitespace-pre-wrap leading-relaxed text-slate-900">{message.text}</p>
                    {actor?.role === 'clinic_owner' && message.chart && <OwnerChart chart={message.chart} />}
                  </div>
                ))}
                {loading && <div role="status" className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /><span className="animate-pulse">{isAr ? '(جارٍ التفكير...)' : '(Thinking...)'}</span></div>}
                <div ref={endRef} />
              </div>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex items-end gap-2 border-t border-slate-200 p-4">
              <textarea
                aria-label={isAr ? 'رسالة إلى شات بوت ابتسامتي' : 'Message to Embtesamty AI chatbot'}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    if (!loading && input.trim()) void send();
                  }
                }}
                disabled={!actor || loading}
                maxLength={2000}
                rows={2}
                placeholder={isAr ? 'اسأل عن بياناتك…' : 'Ask about your own records…'}
                className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
              />
              <button type="submit" aria-label={isAr ? 'إرسال رسالة إلى شات بوت ابتسامتي' : 'Send message to Embtesamty AI chatbot'} disabled={!actor || loading || !input.trim()} className="rounded-xl bg-[#4169E1] p-3 text-white transition-all hover:-translate-y-0.5 hover:bg-[#2446A6] active:scale-95 disabled:opacity-40"><Send className="h-5 w-5" /></button>
            </form>
          </aside>
        </div>, document.body
      )}
    </>
  );
}
