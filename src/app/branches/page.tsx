'use client';
import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import {
  CLINIC_BRANCHES,
  CLINIC_DENTISTS,
} from '../../config/clinic-catalog';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  MapPin,
  Phone,
  Clock,
  Calendar,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export default function BranchesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {localizedText(isAr ? 'ar' : 'en', 'text_4a17378a70')}
              </span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E]">
              {localizedText(isAr ? 'ar' : 'en', 'text_abb8726947')}
            </h1>
            <p className="text-sm text-[#526574] leading-relaxed">
              {localizedText(isAr ? 'ar' : 'en', 'text_1118a9b886')}
            </p>
          </div>
          <Link href="/book">
            <Button variant="primary" size="lg" icon={<Calendar className="w-4 h-4" />}>
              {localizedText(isAr ? 'ar' : 'en', 'text_56b347b294')}
            </Button>
          </Link>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CLINIC_BRANCHES.map((branch) => {
            const branchDocs = CLINIC_DENTISTS.filter((d) => d.branchCode === branch.code);
            return (
              <Card
                key={branch.code}
                className="bg-white border border-[#D8E0DC] hover:border-[#4169E1] transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={branch.image || '/images/branches/branch_heliopolis.jpg'}
                      alt={branch.nameEn}
                      fill
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute top-3.5 start-3.5 end-3.5 flex justify-between items-center">
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#102A5E] text-white shadow-sm">
                        {branch.code}
                      </span>
                      <span className="text-xs font-bold text-[#4169E1] bg-white/95 px-2.5 py-1 rounded-lg shadow-sm">
                        {branch.operatoriesCount} {localizedText(isAr ? 'ar' : 'en', 'text_01ef946215')}
                      </span>
                    </div>
                    <div className="absolute bottom-3 start-3.5 end-3.5 text-white">
                      <h2 className="text-xl font-bold drop-shadow">
                        {isAr ? branch.nameAr : branch.nameEn}
                      </h2>
                      <p className="text-xs text-slate-200 mt-0.5 truncate">
                        {isAr ? branch.landmarkAr : branch.landmarkEn}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">

                  <div className="space-y-2.5 text-xs text-[#526574] p-4 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                      <span className="font-medium text-[#102A5E]">
                        {isAr ? branch.addressAr : branch.addressEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#4169E1] shrink-0" />
                      <a
                        href={`tel:${branch.phone}`}
                        className="font-bold text-[#102A5E] hover:text-[#4169E1]"
                      >
                        {branch.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#4169E1] shrink-0" />
                      <span>{isAr ? branch.hoursAr : branch.hoursEn}</span>
                    </div>
                  </div>

                  {/* Staffing */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#102A5E]">
                      {isAr
                        ? `الأطباء بالفرع (${branchDocs.length}):`
                        : `Assigned Dentists (${branchDocs.length}):`}
                    </div>
                    <div className="space-y-1.5">
                      {branchDocs.map((d) => (
                        <div
                          key={d.id}
                          className="p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#102A5E] block">
                              {isAr ? d.nameAr : d.nameEn}
                            </span>
                            <span className="text-xs text-[#526574]">
                              {isAr ? d.specialtyAr : d.specialtyEn}
                            </span>
                          </div>
                          <Link
                            href={`/book?branch=${branch.code}&dentist=${encodeURIComponent(d.email)}`}
                            className="text-xs font-bold text-[#4169E1] hover:underline"
                          >
                            {localizedText(isAr ? 'ar' : 'en', 'text_d77060b9f9')}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-[#102A5E]">
                      {localizedText(isAr ? 'ar' : 'en', 'text_5de30a3676')}
                    </div>
                    <ul className="space-y-1">
                      {(isAr ? branch.facilitiesAr : branch.facilitiesEn).map((fac, idx) => (
                        <li key={idx} className="text-xs text-[#526574] flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                          <span>{fac}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#D8E0DC] space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href={`/branches/${branch.code}`}
                      className="py-2.5 px-3 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC] text-[#102A5E] hover:border-[#4169E1] text-xs font-bold text-center transition-colors"
                    >
                      {localizedText(isAr ? 'ar' : 'en', 'text_078e185100')}
                    </Link>
                    <Link
                      href={`/book?branch=${branch.code}`}
                      className="py-2.5 px-3 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold text-center transition-colors"
                    >
                      {localizedText(isAr ? 'ar' : 'en', 'text_2729b6a3ed')}
                    </Link>
                  </div>
                  <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#526574] hover:text-[#102A5E] flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{localizedText(isAr ? 'ar' : 'en', 'text_24a3a02408')}</span>
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
