'use client';

import { TranslatedText } from '@/components/TranslatedText';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { presentationAccounts } from '@/lib/presentation';
import { loginWithDemoAccount } from '@/lib/auth';
import { isAssistantConfigured } from '@/lib/assistant-api';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';

const WORKSPACE_PREFIXES = [
  '/owner',
  '/doctor',
  '/reception',
  '/patient',
  '/portal',
  '/management',
  '/dentist',
  '/billing',
  '/inventory',
  '/crm',
  '/admin',
];

export function PresentationAccess({
  inline = false,
  compactHeader = false,
}: {
  inline?: boolean;
  compactHeader?: boolean;
}) {
  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || '/';
  const router = useRouter();

  const handleSwitchAccount = (email: string, fallbackPath: string) => {
    setOpen(false);
    const result = loginWithDemoAccount(email);
    const dest = result?.redirectUrl || fallbackPath;
    router.push(dest);
  };

  if (isAssistantConfigured()) return null;
  if (!inline && !compactHeader && pathname.startsWith('/auth/login')) return null;

  if (
    !inline &&
    !compactHeader &&
    WORKSPACE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return null;
  }

  if (compactHeader) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#102421] hover:bg-[#173631] text-white px-3.5 py-2 text-xs font-bold shadow-sm transition-all border border-[#C8A96E]/30 whitespace-nowrap"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#D9A648] shrink-0" />
          <span>{ar ? 'دخول العرض التقديمي' : 'Presentation access'}</span>
        </button>

        {open && (
          <div className="absolute top-full mt-2 end-0 w-[340px] sm:w-[400px] rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-xl p-4 shadow-2xl z-50 text-slate-900 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black text-slate-900">
                {ar ? 'اختر مساحة العمل' : 'Choose your workspace'}
              </h2>
              <button
                type="button"
                aria-label={ar ? 'إغلاق' : 'Close'}
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              {ar
                ? 'دخول مباشر بحسابات العرض المحفوظة لكل دور وظيفي'
                : 'One click opens your saved presentation account.'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {presentationAccounts.map((a) => (
                <button
                  key={a.email}
                  className="presentation-account w-full text-start"
                  type="button"
                  onClick={() => handleSwitchAccount(a.email, a.path)}
                >
                  <span className="text-[11px] font-bold text-teal-800 block">
                    {ar ? a.roleAr : a.role}
                  </span>
                  <span className="text-xs font-semibold flex items-center justify-between gap-1.5">
                    <TranslatedText text={String(a.name)} />
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className={inline ? 'mt-7 border-t pt-6' : 'presentation-access'}>
      {!inline && (
        <button
          className="primary-button shadow-lg"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <Sparkles size={18} />
          {ar ? 'دخول العرض التقديمي' : 'Presentation access'}
        </button>
      )}
      {(inline || open) && (
        <div className={inline ? 'space-y-3' : 'presentation-panel space-y-3'}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">{ar ? 'اختر مساحة العمل' : 'Choose your workspace'}</h2>
            {!inline && (
              <button aria-label={ar ? 'إغلاق' : 'Close'} onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-sm text-slate-600">
            {ar ? 'دخول مباشر بحسابات العرض المحفوظة' : 'One click opens your saved presentation account.'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {presentationAccounts.map((a) => (
              <button
                key={a.email}
                className="presentation-account"
                type="button"
                onClick={() => handleSwitchAccount(a.email, a.path)}
              >
                <span className="text-xs font-bold text-teal-800">{ar ? a.roleAr : a.role}</span>
                <span className="font-semibold flex items-center justify-between gap-2">
                  <TranslatedText text={String(a.name)} />
                  <ArrowUpRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
