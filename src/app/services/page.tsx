'use client';
import {LocalizedInput} from '@/components/LocalizedControls';

import {localizedText} from '@/lib/interface-messages';


import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_SERVICES } from '../../config/clinic-catalog';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Search,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ServicesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(CLINIC_SERVICES.map((s) => s.categoryEn)));
    return ['ALL', ...unique];
  }, []);

  const filteredServices = useMemo(() => {
    return CLINIC_SERVICES.filter((srv) => {
      const matchesCat = selectedCategory === 'ALL' || srv.categoryEn === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (srv.nameEn.toLowerCase().includes(q) ||
          srv.nameAr.includes(q) ||
          srv.shortDescEn.toLowerCase().includes(q) ||
          srv.shortDescAr.includes(q) ||
          srv.code.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>
                {localizedText(isAr ? 'ar' : 'en', 'text_6d3b541b0b')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E]">
              {localizedText(isAr ? 'ar' : 'en', 'text_dd3f730613')}
            </h1>
            <p className="text-sm text-[#526574] leading-relaxed">
              {localizedText(isAr ? 'ar' : 'en', 'text_20d90a8ab6')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/book">
              <Button variant="primary" size="lg" icon={<Calendar className="w-4 h-4" />}>
                {localizedText(isAr ? 'ar' : 'en', 'text_3486902a04')}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                {localizedText(isAr ? 'ar' : 'en', 'text_0ee0e82646')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#D8E0DC] p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#526574] absolute start-3.5 top-1/2 -translate-y-1/2" />
            <LocalizedInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                localizedText(isAr ? 'ar' : 'en', 'text_0c947472ad')
              }
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC] text-xs font-medium text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#4169E1] text-white'
                    : 'bg-[#F7FAFF] text-[#526574] hover:text-[#102A5E]'
                }`}
              >
                {cat === 'ALL' ? (localizedText(isAr ? 'ar' : 'en', 'text_64bf383ec5')) : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((srv) => (
            <Card
              key={srv.slug}
              className="bg-white border border-[#D8E0DC] hover:border-[#4169E1] transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={srv.image || '/images/service_restorative.jpg'}
                    alt={srv.nameEn}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute top-3.5 start-3.5 end-3.5 flex justify-between items-center">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white/95 text-[#4169E1] shadow-sm">
                      {isAr ? srv.categoryAr : srv.categoryEn}
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-black/60 text-white backdrop-blur-sm">
                      {srv.code}
                    </span>
                  </div>
                  <div className="absolute bottom-3 start-3.5 end-3.5 text-white">
                    <h2 className="text-lg font-bold drop-shadow">
                      {isAr ? srv.nameAr : srv.nameEn}
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-[#526574] leading-relaxed">
                    {isAr ? srv.overviewAr : srv.overviewEn}
                  </p>

                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]">
                  <div>
                    <div className="text-xs text-[#526574]">
                      {localizedText(isAr ? 'ar' : 'en', 'text_00d45af2d4')}
                    </div>
                    <div className="text-sm font-bold text-[#102A5E] tabular-nums mt-0.5">
                      {isAr ? srv.priceRangeAr : srv.priceRangeEn}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#526574]">
                      {localizedText(isAr ? 'ar' : 'en', 'text_5db8869245')}
                    </div>
                    <div className="text-sm font-bold text-[#102A5E] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#4169E1]" />
                      <span>
                        {srv.durationMinutes} {localizedText(isAr ? 'ar' : 'en', 'text_5f325e8b6c')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#102A5E]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_a1bd051668')}
                  </div>
                  <ul className="space-y-1">
                    {(isAr ? srv.processStepsAr : srv.processStepsEn).slice(0, 3).map((step, i) => (
                      <li key={i} className="text-xs text-[#526574] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-[#D8E0DC] flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/services/${srv.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4169E1] hover:text-[#102A5E]"
                >
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_f6909ff3ec')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>

                <Link
                  href={`/book?service=${srv.slug}`}
                  className="px-4 py-2 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_7cff17586d')}</span>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
