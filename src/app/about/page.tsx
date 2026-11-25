'use client';
import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_BRANCHES, CLINIC_DENTISTS } from '../../config/clinic-catalog';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  CheckCircle2,
  Calendar,
  Lock,
  HeartHandshake,
} from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_bfd2a1558e')}</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_a3bf6ff1fd')}
              </h1>
              <p className="text-sm text-[#526574] leading-relaxed">
                {localizedText(isAr ? 'ar' : 'en', 'text_87002e3278')}
              </p>
            </div>
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/images/about_team.jpg"
                alt="Ebtesamty Dental Team"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Stethoscope className="w-6 h-6 text-[#4169E1]" />,
              titleEn: 'Specialist-Led Dentistry',
              titleAr: 'طب أسنان بقيادة متخصصين',
              descEn:
                'Every complex procedure—whether microscopic root canals, guided implants, or orthodontics—is performed by a dedicated specialist.',
              descAr:
                'يتم تنفيذ كل إجراء دقيق كعلاج العصب الميكروسكوبي أو الزراعة أو التقويم بواسطة طبيب متخصص في مجاله.',
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-[#4169E1]" />,
              titleEn: 'Class-B Infection Control',
              titleAr: 'مكافحة عدوى وتعقيم Class-B',
              descEn:
                'Dedicated sterilization rooms at every branch utilizing ultrasonic baths, thermal sealing, and Class-B vacuum autoclaves.',
              descAr:
                'غرف تعقيم مستقلة في كل فرع تستخدم الموجات فوق الصوتية والتغليف الحراري وأجهزة أوتوكلاف Class-B.',
            },
            {
              icon: <Lock className="w-6 h-6 text-[#4169E1]" />,
              titleEn: 'Role-Based Medical Privacy',
              titleAr: 'حماية صارمة لخصوصية المريض',
              descEn:
                'Your medical history, allergies, and clinical notes are protected by strict role-based access control and immutable audit logging.',
              descAr:
                'تاريخك الطبي وملاحظاتك السريرية محمية بضوابط صلاحيات صارمة وسجل تدقيق أمني غير قابل للتعديل.',
            },
          ].map((p, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#D8E0DC] p-6 space-y-3 shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] flex items-center justify-center">
                {p.icon}
              </div>
              <h2 className="text-lg font-bold text-[#102A5E]">
                {isAr ? p.titleAr : p.titleEn}
              </h2>
              <p className="text-xs text-[#526574] leading-relaxed">
                {isAr ? p.descAr : p.descEn}
              </p>
            </div>
          ))}
        </div>

        {/* Operating Model Summary */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 space-y-6">
          <h2 className="text-2xl font-bold text-[#102A5E]">
            {localizedText(isAr ? 'ar' : 'en', 'text_a9d18dfab6')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CLINIC_BRANCHES.map((b) => {
              const docs = CLINIC_DENTISTS.filter((d) => d.branchCode === b.code);
              return (
                <div
                  key={b.code}
                  className="p-5 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#102A5E] text-white">
                      {b.code}
                    </span>
                    <span className="text-xs font-bold text-[#4169E1]">
                      {docs.length} {localizedText(isAr ? 'ar' : 'en', 'text_68c3d8d29d')} • 1 {localizedText(isAr ? 'ar' : 'en', 'text_8aac3b1662')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#102A5E]">
                    {isAr ? b.nameAr : b.nameEn}
                  </h3>
                  <ul className="space-y-1 text-xs text-[#526574]">
                    {docs.map((d) => (
                      <li key={d.id} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4169E1]" />
                        <span>
                          {isAr ? d.nameAr : d.nameEn} — {isAr ? d.specialtyAr : d.specialtyEn}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <Link href="/book">
              <Button variant="primary" size="lg" icon={<Calendar className="w-4 h-4" />}>
                {localizedText(isAr ? 'ar' : 'en', 'text_c4a3045a83')}
              </Button>
            </Link>
            <Link href="/dentists">
              <Button variant="outline" size="lg">
                {localizedText(isAr ? 'ar' : 'en', 'text_c6a40af45f')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
