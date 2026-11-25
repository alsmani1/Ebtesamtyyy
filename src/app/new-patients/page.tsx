'use client';
import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { NEW_PATIENT_EXAM_FEE } from '@/lib/clinic-pricing';
import {
  ClipboardCheck,
  Calendar,
  ShieldCheck,
  FileText,
  CreditCard,
  CheckCircle2,
  UserCheck,
  Clock,
  Sparkles,
  HeartHandshake,
  Check
} from 'lucide-react';

export default function NewPatientsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const steps = [
    {
      step: '01',
      titleEn: 'Reserve Your Consultation',
      titleAr: 'احجز موعد استشارتك الأولى',
      descEn:
        'Select your preferred Cairo branch (Heliopolis, New Cairo, or Maadi), choose your specialist, and confirm a convenient morning or evening time slot.',
      descAr:
        'اختر الفرع الأقرب إليك (مصر الجديدة، التجمع الخامس، أو المعادي)، وحدد تخصص الطبيب والوقت الصباحي أو المسائي المناسب لك.',
    },
    {
      step: '02',
      titleEn: 'Digital Medical History Intake',
      titleAr: 'تعبئة السجل الطبي الرقمي مسبقاً',
      descEn:
        'Save reception wait time by completing your medical conditions, allergies, and current medications securely via the Patient Portal before arriving.',
      descAr:
        'وفّر وقت الانتظار عبر تسجيل الأمراض المزمنة، الحساسيات الدوائية، وقائمة الأدوية عبر بوابة المريض بأمان قبل وصولك للعيادة.',
    },
    {
      step: '03',
      titleEn: 'Comprehensive Examination & Diagnostics',
      titleAr: 'الفحص السريري الشامل والأشعة التشخيصية',
      descEn:
        'Your dentist performs a meticulous 32-tooth FDI charting assessment, periodontal screening, and digital radiography if clinically indicated.',
      descAr:
        'يقوم الطبيب المختص بفحص الأسنان واللثة بدقة على مخطط FDI الرقمي مع أخذ الأشعة التشخيصية اللازمة إذا استدعت الحالة.',
    },
    {
      step: '04',
      titleEn: 'Written Care Plan & Itemized EGP Fees',
      titleAr: 'خطة علاج مكتوبة وتكلفة معتمدة بالجنيه',
      descEn:
        'Before any procedure begins, we discuss staged treatment options, session counts, and transparent payment schedules tailored to your priorities.',
      descAr:
        'قبل البدء في أي علاج، نستعرض معك خطة العلاج المرحلية، عدد الجلسات، والتكلفة المحددة بالجنيه المصري دون أي مفاجآت.',
    },
  ];

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-10 lg:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Header with Reassurance */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_b7806b4775')}</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E] tracking-tight">
              {localizedText(isAr ? 'ar' : 'en', 'text_d73c904ff9')}
            </h1>
            <p className="text-sm text-[#526574] leading-relaxed max-w-2xl">
              {localizedText(isAr ? 'ar' : 'en', 'text_5ae56ab837')}
            </p>
          </div>

          <div className="lg:col-span-4 relative h-48 lg:h-56 rounded-2xl overflow-hidden border border-[#D8E0DC] shadow-xs">
            <Image
              src="/images/about_team.jpg"
              alt="Ebtesamty Clinical Team"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 4-Step Journey Grid */}
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-[#102A5E]">
              {localizedText(isAr ? 'ar' : 'en', 'text_21d3b5aeee')}
            </h2>
            <p className="text-xs text-[#526574] mt-1">
              {localizedText(isAr ? 'ar' : 'en', 'text_8813a2e235')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {steps.map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-3 shadow-xs hover:border-[#4169E1] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-[#102A5E] text-white"> <TranslatedText text="STEP" /> {s.step}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#4169E1]" />
                </div>
                <h3 className="text-base font-bold text-[#102A5E]">
                  {isAr ? s.titleAr : s.titleEn}
                </h3>
                <p className="text-xs text-[#526574] leading-relaxed">
                  {isAr ? s.descAr : s.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation Checklist & Call to Action */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl font-bold text-[#102A5E] flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#4169E1]" />
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_653504f903')}</span>
            </h2>
            <ul className="space-y-2.5 text-xs text-[#526574]">
              <li className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <span>
                  {localizedText(isAr ? 'ar' : 'en', 'text_2eb41eb30a')}
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <span>
                  {localizedText(isAr ? 'ar' : 'en', 'text_9ceb28bd8e')}
                </span>
              </li>
              <li className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <span>
                  {localizedText(isAr ? 'ar' : 'en', 'text_e2d65c3113')}
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 bg-[#F7FAFF] p-6 rounded-2xl border border-[#D8E0DC] flex flex-col gap-3">
            <div className="text-center pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#526574] block"><TranslatedText text="Comprehensive Consultation" /></span>
              <span className="text-2xl font-extrabold text-[#102A5E] tabular-nums">
                {isAr ? `${NEW_PATIENT_EXAM_FEE} ج.م` : `${NEW_PATIENT_EXAM_FEE} EGP`}
              </span>
              <span className="text-xs text-[#526574] block mt-0.5"><TranslatedText text="Includes full examination &amp; charting" /></span>
            </div>

            <Link href="/book">
              <Button variant="primary" size="lg" fullWidth icon={<Calendar className="w-4 h-4" />}>
                {localizedText(isAr ? 'ar' : 'en', 'text_a7a99ffe55')}
              </Button>
            </Link>

            <Link href="/portal">
              <Button variant="outline" size="lg" fullWidth>
                {localizedText(isAr ? 'ar' : 'en', 'text_fd722598f6')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
