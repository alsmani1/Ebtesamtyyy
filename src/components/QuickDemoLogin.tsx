'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRound, ClipboardList, Stethoscope, Building2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { loginWithDemoAccount } from '@/lib/auth';
import { isAssistantConfigured } from '@/lib/assistant-api';

const main = [
  ['hassan.patient@ebtesamty.dev', '1. Patient (Passant)', '١. المريضة (بسنت)', UserRound, 'bg-emerald-50 text-emerald-900 border border-emerald-200'],
  ['mariam.reception@ebtesamty.dev', '2. Receptionist (Mariam)', '٢. الاستقبال (مريم)', ClipboardList, 'bg-blue-50 text-blue-900 border border-blue-200'],
  ['dr.sandy@ebtesamty.dev', '3. Dentist (Dr. Sandy)', '٣. طبيبة الأسنان (د. ساندي)', Stethoscope, 'bg-teal-50 text-teal-900 border border-teal-200'],
  ['admin@ebtesamty.dev', '4. Owner / Executive (Abram)', '٤. المالك / الإدارة (أبرام)', Building2, 'bg-violet-50 text-violet-900 border border-violet-200'],
] as const;

export function QuickDemoLogin() {
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const handleQuickLogin = (email: string) => {
    setBusy(email);
    const result = loginWithDemoAccount(email);
    const dest = result?.redirectUrl || '/patient/dashboard';
    router.push(dest);
  };

  if (isAssistantConfigured()) return null;

  return (
    <section aria-label={ar ? 'الدخول التجريبي السريع (٤ لوحات فقط)' : 'Four Role Dashboards Quick Login'} className="mt-7">
      <div className="flex items-center gap-3 mb-4 text-slate-500 text-sm">
        <span className="h-px bg-slate-100 flex-1" />
        <h2>{ar ? 'الدخول السريع للوحات الأربع المعتمدة' : '4 Role Dashboards Quick Access'}</h2>
        <span className="h-px bg-slate-100 flex-1" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {main.map(([email, en, arabic, Icon, color]) => (
          <button
            key={email}
            type="button"
            disabled={!!busy}
            onClick={() => handleQuickLogin(email)}
            className={`w-full h-full min-h-12 px-3 py-2.5 rounded-xl text-start text-xs font-bold flex items-center gap-2 transition hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#4169E1] disabled:opacity-60 ${color}`}
          >
            {busy === email ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Icon size={16} className="shrink-0" />}
            <span>{ar ? arabic : en}</span>
          </button>
        ))}
      </div>

      {/* Manual Login Credentials Display */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => setShowCredentials(!showCredentials)}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline transition"
        >
          {showCredentials
            ? (ar ? 'إخفاء بيانات الدخول اليدوي' : 'Hide manual credentials')
            : (ar ? 'عرض بيانات الدخول لجميع الأدوار (البريد وكلمة المرور)' : 'View all role login credentials (Email & Password)')}
        </button>

        {showCredentials && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between items-center">
              <span>{ar ? 'كلمة المرور المشتركة لجميع الحسابات:' : 'Shared Password for all roles:'}</span>
              <code className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">Password123!</code>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div><strong className="text-violet-800">1. Owner / Admin:</strong><br /><code className="text-slate-600">admin@ebtesamty.dev</code></div>
              <div><strong className="text-blue-800">2. Receptionist:</strong><br /><code className="text-slate-600">mariam.reception@ebtesamty.dev</code></div>
              <div><strong className="text-teal-800">3. Dentist:</strong><br /><code className="text-slate-600">dr.sandy@ebtesamty.dev</code></div>
              <div><strong className="text-emerald-800">4. Patient:</strong><br /><code className="text-slate-600">hassan.patient@ebtesamty.dev</code></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
