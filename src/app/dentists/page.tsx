'use client';
import {LocalizedInput} from '@/components/LocalizedControls';

import {localizedText} from '@/lib/interface-messages';


import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_DENTISTS, CLINIC_BRANCHES } from '../../config/clinic-catalog';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  GraduationCap,
  Globe,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';

export default function DentistsDirectoryPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDentists = useMemo(() => {
    return CLINIC_DENTISTS.filter((doc) => {
      const matchesBranch = branchFilter === 'ALL' || doc.branchCode === branchFilter;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesBranch;
      return (
        matchesBranch &&
        (doc.nameEn.toLowerCase().includes(q) ||
          doc.nameAr.includes(q) ||
          doc.specialtyEn.toLowerCase().includes(q) ||
          doc.specialtyAr.includes(q) ||
          doc.focusAreasEn.some((f) => f.toLowerCase().includes(q)))
      );
    });
  }, [branchFilter, searchQuery]);

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>
                {localizedText(isAr ? 'ar' : 'en', 'text_1830d8fe99')}
              </span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E]">
              {localizedText(isAr ? 'ar' : 'en', 'text_9fe8ad644f')}
            </h1>
            <p className="text-sm text-[#526574] leading-relaxed">
              {localizedText(isAr ? 'ar' : 'en', 'text_2ca4e72a84')}
            </p>
          </div>
          <Link href="/book">
            <Button variant="primary" size="lg" icon={<Calendar className="w-4 h-4" />}>
              {localizedText(isAr ? 'ar' : 'en', 'text_c3bfe64bb2')}
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#D8E0DC] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#526574] absolute start-3.5 top-1/2 -translate-y-1/2" />
            <LocalizedInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                localizedText(isAr ? 'ar' : 'en', 'text_bf17477cdb')
              }
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC] text-xs font-medium text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBranchFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                branchFilter === 'ALL'
                  ? 'bg-[#4169E1] text-white'
                  : 'bg-[#F7FAFF] text-[#526574] hover:text-[#102A5E]'
              }`}
            >
              {localizedText(isAr ? 'ar' : 'en', 'text_be1b013ad1')}
            </button>
            {CLINIC_BRANCHES.map((b) => (
              <button
                key={b.code}
                type="button"
                onClick={() => setBranchFilter(b.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  branchFilter === b.code
                    ? 'bg-[#4169E1] text-white'
                    : 'bg-[#F7FAFF] text-[#526574] hover:text-[#102A5E]'
                }`}
              >
                {isAr ? b.nameAr : b.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Dentist Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDentists.map((doc) => (
            <Card
              key={doc.id}
              className="bg-white border border-[#D8E0DC] hover:border-[#4169E1] transition-all p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-100">
                      <Image
                        src={doc.image || '/images/dentists/dr_sandy_saad.jpg'}
                        alt={doc.nameEn}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#EAF3FF] text-[#4169E1]">
                        {isAr ? doc.titleAr : doc.titleEn}
                      </span>
                      <h2 className="text-xl font-bold text-[#102A5E] mt-1">
                        {isAr ? doc.nameAr : doc.nameEn}
                      </h2>
                      <p className="text-xs font-semibold text-[#4169E1]">
                        {isAr ? doc.specialtyAr : doc.specialtyEn}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/branches/${doc.branchCode}`}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F7FAFF] border border-[#D8E0DC] text-[#102A5E] hover:border-[#4169E1]"
                  >
                    {doc.branchCode}
                  </Link>
                </div>

                <p className="text-xs text-[#526574] leading-relaxed">
                  {isAr ? doc.bioAr : doc.bioEn}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC] text-xs">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#102A5E] block">
                        {localizedText(isAr ? 'ar' : 'en', 'text_9ef047f284')}
                      </span>
                      <span className="text-[#526574]">
                        {isAr ? doc.qualificationsAr : doc.qualificationsEn}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#102A5E] block">
                        {localizedText(isAr ? 'ar' : 'en', 'text_85e92e1264')}
                      </span>
                      <span className="text-[#526574]">
                        {isAr ? doc.scheduleSummaryAr : doc.scheduleSummaryEn}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#102A5E] mb-2">
                    {localizedText(isAr ? 'ar' : 'en', 'text_64cda80516')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(isAr ? doc.focusAreasAr : doc.focusAreasEn).map((area, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#EAF3FF]/60 text-[#102A5E] border border-[#4169E1]/20"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D8E0DC] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#526574] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4169E1]" />
                  <span>{isAr ? doc.branchNameAr : doc.branchNameEn}</span>
                </div>

                <Link
                  href={`/book?branch=${doc.branchCode}&dentist=${encodeURIComponent(doc.email)}`}
                  className="px-4 py-2.5 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? `احجز موعداً مع ${doc.nameAr}`
                      : `Book with ${doc.nameEn}`}
                  </span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
