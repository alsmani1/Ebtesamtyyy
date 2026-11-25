'use client';
import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_BRANCHES } from '../../config/clinic-catalog';
import { Button } from '../../components/ui/Button';
import {
  AlertTriangle,
  Phone,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Activity,
  AlertCircle,
  Building2
} from 'lucide-react';

export default function EmergencyDentalPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-10 lg:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Urgent High-Contrast Header */}
        <div className="bg-[#102A5E] text-white rounded-3xl p-8 sm:p-10 space-y-5 shadow-lg border border-[#102A5E]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              {localizedText(isAr ? 'ar' : 'en', 'text_d5185768d1')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {localizedText(isAr ? 'ar' : 'en', 'text_abbdf1d3db')}
          </h1>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            {localizedText(isAr ? 'ar' : 'en', 'text_06e7b01ad5')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/book?service=emergency-dental-care">
              <Button variant="primary" size="lg" icon={<Calendar className="w-4 h-4" />}>
                {localizedText(isAr ? 'ar' : 'en', 'text_e615041afd')}
              </Button>
            </Link>
            <a
              href="tel:+20224150001"
              className="px-5 py-3 rounded-xl bg-white text-[#102A5E] text-xs font-bold hover:bg-[#EAF3FF] transition-colors inline-flex items-center gap-2 shadow-xs"
            >
              <Phone className="w-4 h-4 text-[#4169E1]" />
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_00bf842df8')}</span>
            </a>
          </div>
        </div>

        {/* Life-Threatening Safety Notice & Disclaimer */}
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-3.5 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-sm font-bold text-rose-900">
              {localizedText(isAr ? 'ar' : 'en', 'text_eebd897b3f')}
            </strong>
            <p className="text-xs text-rose-800 leading-relaxed">
              {localizedText(isAr ? 'ar' : 'en', 'text_c3e12f3748')}
            </p>
          </div>
        </div>

        {/* Urgent vs Non-Urgent Triage Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Urgent / Same-Day Column */}
          <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
              <h2 className="text-base font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_fffd02173b')}
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-[#526574]">
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_aed0aeb4cb')}</strong> {localizedText(isAr ? 'ar' : 'en', 'text_ac9a55bf46')}</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_64102a4362')}</strong> {localizedText(isAr ? 'ar' : 'en', 'text_b7f53c3242')}</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_141997634c')}</strong> {localizedText(isAr ? 'ar' : 'en', 'text_c5ff37e0f5')}</span>
              </li>
            </ul>
          </div>

          {/* Non-Urgent / Routine Column */}
          <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4169E1]" />
              <h2 className="text-base font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_6d4b1aa3ac')}
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-[#526574]">
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_4003006ecc')}</strong> {localizedText(isAr ? 'ar' : 'en', 'text_7c988bde45')}</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_3df2eb479a')}</strong> {localizedText(isAr ? 'ar' : 'en', 'text_bc0e5774a7')}</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_10059aac5f')}</strong> {localizedText(isAr ? 'ar' : 'en', 'text_f0ad95b25a')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Immediate First-Aid Action Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#102A5E]">
            {localizedText(isAr ? 'ar' : 'en', 'text_613c7565f8')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                titleEn: '1. Knocked-Out Adult Tooth',
                titleAr: '1. خلع السن الدائم بالكامل',
                guidanceEn: 'Handle only by the white crown. Do NOT scrape the root. Place tooth in cold milk or patient saliva. Reach the clinic within 60 minutes.',
                guidanceAr: 'أمسك السن من التاج الأبيض فقط وتجنب لمس أو حك الجذر. ضعه في كوب حليب بارد أو لعاب المريض وتوجه للعيادة خلال ساعة.',
              },
              {
                titleEn: '2. Severe Throbbing Ache',
                titleAr: '2. ألم الأسنان الحاد والمستمر',
                guidanceEn: 'Rinse with warm saltwater to clear debris. Take standard oral analgesics according to your physician guidance. NEVER place aspirin on gums.',
                guidanceAr: 'مضمض بماء دافئ وملح لتنظيف الفم. تناول المسكنات الفموية المعتادة. تجنب تماماً وضع أقراص الأسبرين على اللثة لتفادي الحروق الكيميائية.',
              },
              {
                titleEn: '3. Facial Swelling & Abscess',
                titleAr: '3. تورم الوجه وانتفاخ اللثة',
                guidanceEn: 'Apply a cold compress on the outer cheek for 15 minutes at a time. Do NOT apply hot packs and never attempt to lance or drain swelling.',
                guidanceAr: 'ضع كمادات باردة على الخد من الخارج لمدة 15 دقيقة. تجنب الكمادات الساخنة تماماً ولا تحاول فتح أو ثقب التورم بنفسك.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#D8E0DC] p-6 space-y-2.5 shadow-xs"
              >
                <h3 className="text-sm font-bold text-[#102A5E]">
                  {isAr ? card.titleAr : card.titleEn}
                </h3>
                <p className="text-xs text-[#526574] leading-relaxed">
                  {isAr ? card.guidanceAr : card.guidanceEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Branch Emergency Hotlines */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E0DC] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_1c32b42bd4')}
              </h2>
              <p className="text-xs text-[#526574] mt-0.5">
                {localizedText(isAr ? 'ar' : 'en', 'text_372d4b190d')}
              </p>
            </div>
            <span className="text-xs font-bold text-[#4169E1] bg-[#EAF3FF] px-3 py-1 rounded-lg"> <TranslatedText text="3 Cairo Branches" /> </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {CLINIC_BRANCHES.map((b) => (
              <div
                key={b.code}
                className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] space-y-2 hover:border-[#4169E1] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white bg-[#102A5E] px-2 py-0.5 rounded">
                    {b.code}
                  </span>
                  <span className="text-xs text-[#526574] font-medium">{b.operatoriesCount} <TranslatedText text="Chairs" /></span>
                </div>

                <div className="text-sm font-bold text-[#102A5E]">
                  {isAr ? b.nameAr : b.nameEn}
                </div>

                <div className="text-xs text-[#526574] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#4169E1]" />
                  <span>{isAr ? b.hoursAr : b.hoursEn}</span>
                </div>

                <a
                  href={`tel:${b.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4169E1] hover:underline pt-2 border-t border-[#D8E0DC]/60 w-full"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span><TranslatedText text="Direct Hotline:" /> {b.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
