'use client';
import {LocalizedInput} from '@/components/LocalizedControls';

import {localizedText} from '@/lib/interface-messages';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Calendar,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { registerStaticPatient } from '@/lib/auth';
import { isAssistantConfigured } from '@/lib/assistant-api';

export default function RegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    primaryPhone: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = registerStaticPatient({
        fullName: formData.fullName,
        phone: formData.primaryPhone,
        email: formData.email,
        password: formData.password,
      });
      router.push(result.redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
      setLoading(false);
    }
  };

  if (isAssistantConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-slate-900">{isAr ? 'حساب موثق مطلوب' : 'Verified account required'}</h1>
          <p className="text-sm text-slate-600">{isAr ? 'يرجى التواصل مع العيادة لإنشاء حساب آمن وربطه بملفك الطبي.' : 'Contact the clinic to provision a secure account linked to your own patient file.'}</p>
          <Link href="/auth/login" className="inline-block font-bold text-blue-700 underline">{isAr ? 'تسجيل الدخول' : 'Sign in'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-[#D8E0DC] p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#D8E0DC] p-1.5 mx-auto shadow-2xs overflow-hidden">
            <img
              src="/images/ebtesamty_official_logo.jpg"
              alt="Ebtesamty Dental Clinics"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#102A5E]">
              {localizedText(isAr ? 'ar' : 'en', 'text_e8fafd51e5')}
            </h1>
            <p className="text-xs text-[#526574] mt-1">
              {localizedText(isAr ? 'ar' : 'en', 'text_12085acb30')}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
              {localizedText(isAr ? 'ar' : 'en', 'text_904a137ee1')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#526574] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={localizedText(isAr ? 'ar' : 'en', 'text_0327eccb26')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] text-xs text-[#102A5E] focus:border-[#4169E1] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                {localizedText(isAr ? 'ar' : 'en', 'text_d2bc8664ef')}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#526574] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] text-xs text-[#102A5E] focus:border-[#4169E1] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                {localizedText(isAr ? 'ar' : 'en', 'text_6415bd68f4')}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] text-xs text-[#102A5E] focus:border-[#4169E1] focus:bg-white focus:outline-none transition-colors"
              >
                <option value="MALE">{localizedText(isAr ? 'ar' : 'en', 'text_e0122d2430')}</option>
                <option value="FEMALE">{localizedText(isAr ? 'ar' : 'en', 'text_e6e52eceaa')}</option>
                <option value="OTHER">{localizedText(isAr ? 'ar' : 'en', 'text_37900247b4')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
              {localizedText(isAr ? 'ar' : 'en', 'text_ef49df733d')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#526574] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                type="tel"
                required
                value={formData.primaryPhone}
                onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                placeholder="+20 100 123 4567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] text-xs text-[#102A5E] focus:border-[#4169E1] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
              {localizedText(isAr ? 'ar' : 'en', 'text_be085e4f7f')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#526574] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] text-xs text-[#102A5E] focus:border-[#4169E1] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
              {localizedText(isAr ? 'ar' : 'en', 'text_04b9a6a91d')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#526574] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <LocalizedInput
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] text-xs text-[#102A5E] focus:border-[#4169E1] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-3.5 bg-[#EAF3FF] border border-[#4169E1]/20 rounded-2xl text-xs text-[#4169E1] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {localizedText(isAr ? 'ar' : 'en', 'text_7086baec43')}
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full justify-center"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {localizedText(isAr ? 'ar' : 'en', 'text_dedd0d9f4a')}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-[#526574] space-y-2 border-t border-[#D8E0DC]">
          <div>
            {localizedText(isAr ? 'ar' : 'en', 'text_0bdca7e4ac')}{' '}
            <Link href="/auth/login" className="font-bold text-[#4169E1] hover:underline">
              {localizedText(isAr ? 'ar' : 'en', 'text_489fb9dd7c')}
            </Link>
          </div>
          <div>
            <Link href="/demo" className="font-semibold text-xs text-[#102A5E] hover:underline">
              {localizedText(isAr ? 'ar' : 'en', 'text_b21b2f9ec8')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
