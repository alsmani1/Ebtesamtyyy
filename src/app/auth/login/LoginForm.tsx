'use client';
import { TranslatedText } from '@/components/TranslatedText';
import { LocalizedInput } from '@/components/LocalizedControls';
import { QuickDemoLogin } from '@/components/QuickDemoLogin';
import { authMessages } from '@/lib/auth-messages';
import { loginWithCredentials, setStaticSessionUser } from '@/lib/auth';
import { isAssistantConfigured, loginAssistantAccount } from '@/lib/assistant-api';
import { loginDestination } from '@/lib/login-destination';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export default function LoginForm({ demoEnabled = true }: { demoEnabled?: boolean }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { locale } = useLanguage();
  const copy = authMessages[locale];
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      if (isAssistantConfigured()) {
        const session = await loginAssistantAccount(emailOrPhone, password);
        setStaticSessionUser(session.user);
        router.push(loginDestination(session.user.roleGrants) || '/patient/dashboard');
        return;
      }
      const result = loginWithCredentials(emailOrPhone, password);
      if ('error' in result) {
        setError(copy.error);
        return;
      }
      router.push(result.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-[560px] bg-white/92 backdrop-blur-md rounded-3xl shadow-2xl border border-white/80 p-6 sm:p-9">
        <div className="text-center mb-8">
          <img
            src="/images/ebtesamty-logo.png"
            alt="Ebtesamty Dental Clinic"
            className="w-20 h-20 rounded-full object-contain mx-auto mb-3 bg-white p-0.5 shadow-md"
          />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            <TranslatedText text={String(copy.title)} />
          </h1>
          <p className="text-sm text-slate-500 mt-2">{copy.intro}</p>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-identity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {copy.identity}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                id="login-identity"
                autoComplete="username"
                dir="ltr"
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="name@example.com or +2010..."
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {copy.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                id="login-password"
                autoComplete="current-password"
                dir="ltr"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 text-sm focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={locale === 'ar' ? (showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور') : showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#4169E1] hover:bg-[#2446A6] text-white font-semibold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? copy.loading : copy.submit}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {demoEnabled && <QuickDemoLogin />}
        <div className="mt-6 text-center text-xs text-slate-500">
          {copy.newPatient}{' '}
          <Link href="/auth/register" className="font-bold text-teal-700 hover:underline">
            {copy.register}
          </Link>
        </div>
      </div>
    </div>
  );
}
