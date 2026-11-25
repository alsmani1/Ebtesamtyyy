'use client';
import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import {
  CLINIC_SERVICES,
  CLINIC_BRANCHES,
  CLINIC_DENTISTS,
} from '../../../config/clinic-catalog';
import { Button } from '../../../components/ui/Button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  HelpCircle,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const service = CLINIC_SERVICES.find((s) => s.slug === slug) || CLINIC_SERVICES[0];
  const availableBranches = CLINIC_BRANCHES.filter((b) =>
    service.availableBranches.includes(b.code)
  );
  const matchingDentists = CLINIC_DENTISTS.filter((d) =>
    service.availableBranches.includes(d.branchCode)
  );

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#526574] hover:text-[#102A5E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{localizedText(isAr ? 'ar' : 'en', 'text_64c937dbdb')}</span>
        </Link>

        {/* Hero Section with Procedure Photography */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Procedure Photo Banner */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-[400px] bg-slate-900">
              <Image
                src={service.image || '/images/service_cosmetic.jpg'}
                alt={service.nameEn}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102A5E]/90 via-[#102A5E]/30 to-transparent lg:hidden" />
              <div className="absolute bottom-4 left-4 lg:hidden text-white">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#4169E1]">
                  {isAr ? service.categoryAr : service.categoryEn}
                </span>
              </div>
            </div>

            {/* Procedure Details & Scheduling Card */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF3FF] text-[#4169E1]">
                    {isAr ? service.categoryAr : service.categoryEn}
                  </span>
                  <span className="text-xs font-mono text-[#526574] bg-[#F7FAFF] px-2.5 py-1 rounded border border-[#D8E0DC]">
                    {service.code}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A5E] tracking-tight">
                  {isAr ? service.nameAr : service.nameEn}
                </h1>

                <p className="text-sm text-[#526574] leading-relaxed">
                  {isAr ? service.overviewAr : service.overviewEn}
                </p>
              </div>

              {/* Pricing & Duration Callout */}
              <div className="bg-[#F7FAFF] rounded-2xl border border-[#D8E0DC] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#526574] uppercase tracking-wider">
                      {localizedText(isAr ? 'ar' : 'en', 'text_4f51c17220')}
                    </div>
                    <div className="text-2xl font-extrabold text-[#102A5E] tabular-nums mt-0.5">
                      {isAr ? service.priceRangeAr : service.priceRangeEn}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-[#102A5E] bg-white px-3.5 py-2 rounded-xl border border-[#D8E0DC]">
                    <Clock className="w-4 h-4 text-[#4169E1]" />
                    <span>{service.durationMinutes} {localizedText(isAr ? 'ar' : 'en', 'text_cefc3f4873')}</span>
                  </div>
                </div>

                <div className="text-xs text-[#526574] flex items-start gap-1.5 border-t border-[#D8E0DC]/60 pt-3">
                  <Info className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span>
                    {localizedText(isAr ? 'ar' : 'en', 'text_39cf29d44d')}
                  </span>
                </div>

                <Link href={`/book?service=${service.slug}`} className="block pt-1">
                  <Button variant="primary" size="lg" fullWidth icon={<Calendar className="w-4 h-4" />}>
                    {localizedText(isAr ? 'ar' : 'en', 'text_023af70a41')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Clinical Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: 3-Stage Process & FAQs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step-by-Step Clinical Journey */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#102A5E]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_9cdb03ce71')}
                  </h2>
                  <p className="text-xs text-[#526574]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_0eb796d607')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(isAr ? service.processStepsAr : service.processStepsEn).map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#102A5E] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="text-xs font-medium text-[#102A5E] leading-relaxed pt-1">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service-Specific FAQs */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-[#102A5E] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#4169E1]" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_5dab32e105')}</span>
              </h2>
              <div className="space-y-3">
                {service.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] space-y-1.5"
                  >
                    <h3 className="text-xs font-bold text-[#102A5E] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4169E1]" />
                      <span>{isAr ? faq.qAr : faq.qEn}</span>
                    </h3>
                    <p className="text-xs text-[#526574] leading-relaxed ps-3.5">
                      {isAr ? faq.aAr : faq.aEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Candidates, Assigned Doctors with Portraits, Branch Availability */}
          <div className="lg:col-span-5 space-y-6">
            {/* Who Needs This Assessment */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_4e9d1f5740')}
              </h2>
              <p className="text-xs text-[#526574] leading-relaxed">
                {isAr ? service.whoNeedsItAr : service.whoNeedsItEn}
              </p>

              <div className="p-4 rounded-2xl bg-[#EAF3FF] border border-[#4169E1]/20 space-y-2">
                <div className="text-xs font-bold text-[#102A5E] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#4169E1]" />
                  <span>
                    {localizedText(isAr ? 'ar' : 'en', 'text_7cea4c30a0')}
                  </span>
                </div>
                <p className="text-xs text-[#526574] leading-relaxed">
                  {localizedText(isAr ? 'ar' : 'en', 'text_17f4ded9f9')}
                </p>
              </div>
            </div>

            {/* Clinicians Offering Care (with Portraits) */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-[#102A5E] flex items-center justify-between">
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_6f41ba6caa')}</span>
                <span className="text-xs text-[#526574] font-medium">{matchingDentists.length} <TranslatedText text="Faculty" /></span>
              </h2>

              <div className="space-y-2.5">
                {matchingDentists.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] hover:border-[#4169E1] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#D8E0DC]">
                        <Image
                          src={d.image || '/images/ebtesamty_official_logo.jpg'}
                          alt={d.nameEn}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-[#102A5E] block truncate">
                          {isAr ? d.nameAr : d.nameEn}
                        </span>
                        <span className="text-xs text-[#4169E1] font-semibold block truncate">
                          {isAr ? d.specialtyAr : d.specialtyEn} • {d.branchCode}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/book?branch=${d.branchCode}&service=${service.slug}&dentist=${encodeURIComponent(d.email)}`}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#D8E0DC] text-xs font-bold text-[#4169E1] hover:bg-[#4169E1] hover:text-white transition-all shrink-0"
                    >
                      {localizedText(isAr ? 'ar' : 'en', 'text_d77060b9f9')}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Available at Branches */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_7071d97ec7')}
              </h2>
              <div className="space-y-2">
                {availableBranches.map((b) => (
                  <div
                    key={b.code}
                    className="p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#102A5E]">
                        {isAr ? b.nameAr : b.nameEn}
                      </div>
                      <div className="text-xs text-[#526574]">
                        {b.operatoriesCount} <TranslatedText text="Operatories •" /> {b.phone}
                      </div>
                    </div>
                    <Link
                      href={`/book?branch=${b.code}&service=${service.slug}`}
                      className="text-xs font-bold text-[#4169E1] hover:underline shrink-0"
                    >
                      {localizedText(isAr ? 'ar' : 'en', 'text_20b3c7664f')}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
