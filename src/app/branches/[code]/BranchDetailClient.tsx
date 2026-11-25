'use client';

import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../../context/LanguageContext';
import {
  CLINIC_BRANCHES,
  CLINIC_DENTISTS,
  CLINIC_SERVICES,
} from '../../../config/clinic-catalog';
import { Button } from '../../../components/ui/Button';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Stethoscope,
  Building2,
  Sparkles,
  ShieldCheck,
  User
} from 'lucide-react';

export default function BranchDetailPage() {
  const params = useParams();
  const codeParam = typeof params?.code === 'string' ? params.code.toUpperCase() : 'BR-A';
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const branch =
    CLINIC_BRANCHES.find((b) => b.code === codeParam || b.slug === codeParam.toLowerCase()) ||
    CLINIC_BRANCHES[0];

  const branchDentists = CLINIC_DENTISTS.filter((d) => d.branchCodes.includes(branch.code));
  const branchServices = CLINIC_SERVICES.filter((s) =>
    s.availableBranches.includes(branch.code)
  );

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/branches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#526574] hover:text-[#102A5E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{localizedText(isAr ? 'ar' : 'en', 'text_dcb31a786c')}</span>
        </Link>

        {/* Hero Section with Architectural Photography */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Facility Photo Banner */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-[420px] bg-slate-900">
              <Image
                src={branch.image || '/images/branches/branch_heliopolis.jpg'}
                alt={branch.nameEn}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102A5E]/90 via-[#102A5E]/30 to-transparent lg:hidden" />
              <div className="absolute bottom-4 left-4 lg:hidden text-white">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#4169E1]">
                  {branch.code}
                </span>
              </div>
            </div>

            {/* Branch Details & Action Card */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#102A5E] text-white">
                    {branch.code}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#EAF3FF] text-[#4169E1]">
                    {branch.operatoriesCount} {localizedText(isAr ? 'ar' : 'en', 'text_bad2043096')}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A5E] tracking-tight">
                  {isAr ? branch.nameAr : branch.nameEn}
                </h1>

                <p className="text-sm text-[#526574] leading-relaxed">
                  {isAr ? branch.landmarkAr : branch.landmarkEn}
                </p>

                {/* Address & Hours Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#102A5E] block">
                        {localizedText(isAr ? 'ar' : 'en', 'text_c8c3a3c177')}
                      </span>
                      <span className="text-[#526574] leading-relaxed">
                        {isAr ? branch.addressAr : branch.addressEn}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#102A5E] block">
                        {localizedText(isAr ? 'ar' : 'en', 'text_b4029605da')}
                      </span>
                      <span className="text-[#526574] leading-relaxed">
                        {isAr ? branch.hoursAr : branch.hoursEn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receptionist Contact & Direct Booking */}
              <div className="bg-[#F7FAFF] rounded-2xl border border-[#D8E0DC] p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#526574] block">
                      {localizedText(isAr ? 'ar' : 'en', 'text_fe2cb94805')}
                    </span>
                    <span className="text-sm font-bold text-[#102A5E]">
                      {isAr ? branch.receptionistNameAr : branch.receptionistNameEn}
                    </span>
                  </div>

                  <a
                    href={`tel:${branch.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D8E0DC] text-xs font-bold text-[#4169E1] hover:border-[#4169E1] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{branch.phone}</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <Link href={`/book?branch=${branch.code}`}>
                    <Button variant="primary" size="md" fullWidth icon={<Calendar className="w-4 h-4" />}>
                      {isAr ? 'احجز موعداً في هذا الفرع' : `Book at ${branch.shortNameEn}`}
                    </Button>
                  </Link>

                  <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[#D8E0DC] text-xs font-bold text-[#102A5E] hover:border-[#4169E1] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{localizedText(isAr ? 'ar' : 'en', 'text_3bc2b78833')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content: Resident Dentists with Portraits & Branch Facilities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Resident Dentists Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8E0DC]">
                <div>
                  <h2 className="text-lg font-bold text-[#102A5E]">
                    {isAr
                      ? `الأطباء المقيمون بفرع ${branch.shortNameAr} (${branchDentists.length})`
                      : `Resident Specialists at ${branch.shortNameEn} (${branchDentists.length})`}
                  </h2>
                  <p className="text-xs text-[#526574]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_6c70e40155')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {branchDentists.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] space-y-3 hover:border-[#4169E1] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-[#D8E0DC]">
                          <Image
                            src={doc.image || '/images/ebtesamty_official_logo.jpg'}
                            alt={doc.nameEn}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#102A5E]">
                            {isAr ? doc.nameAr : doc.nameEn}
                          </h3>
                          <p className="text-xs font-semibold text-[#4169E1]">
                            {isAr ? doc.specialtyAr : doc.specialtyEn}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/book?branch=${branch.code}&dentist=${encodeURIComponent(doc.email)}`}
                        className="px-3 py-1.5 rounded-xl bg-[#4169E1] text-white text-xs font-bold hover:bg-[#2446A6] transition-colors shrink-0"
                      >
                        {localizedText(isAr ? 'ar' : 'en', 'text_d77060b9f9')}
                      </Link>
                    </div>

                    <p className="text-xs text-[#526574] leading-relaxed">
                      {isAr ? doc.bioAr : doc.bioEn}
                    </p>

                    <div className="text-xs text-[#526574] pt-2 border-t border-[#D8E0DC]/60 flex items-center justify-between">
                      <span><strong className="text-[#102A5E]">{localizedText(isAr ? 'ar' : 'en', 'text_94c16650b3')}</strong> {isAr ? doc.scheduleSummaryAr : doc.scheduleSummaryEn}</span>
                      <span className="font-semibold text-[#4169E1]">{doc.experienceYears} <TranslatedText text="+ Yrs Exp" /> </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Facilities & Services Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Facility Features */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-[#102A5E] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4169E1]" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_2ca70b0633')}</span>
              </h2>

              <ul className="space-y-2.5">
                {(isAr ? branch.facilitiesAr : branch.facilitiesEn).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#102A5E] p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]/60">
                    <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-xs text-[#526574] p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]/60">
                  <MapPin className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                  <span>{isAr ? branch.parkingAr : branch.parkingEn}</span>
                </li>
              </ul>
            </div>

            {/* Available Services at this Branch */}
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_70b496f2b5')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {branchServices.map((srv) => (
                  <Link
                    key={srv.slug}
                    href={`/services/${srv.slug}`}
                    className="p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] hover:border-[#4169E1] transition-colors flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-[#102A5E] truncate">
                      {isAr ? srv.nameAr : srv.nameEn}
                    </span>
                    <span className="text-xs font-bold text-[#4169E1] shrink-0 ms-2 tabular-nums">
                      {srv.startingPriceEgp} <TranslatedText text="EGP" /> </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
