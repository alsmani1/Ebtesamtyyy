'use client';
import {LocalizedInput} from '@/components/LocalizedControls';

import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_FAQS } from '../../config/clinic-catalog';
import { HelpCircle, Search, Calendar, ChevronDown, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function FaqsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const categories = [
    { id: 'ALL', nameEn: 'All Topics', nameAr: 'جميع المواضيع' },
    { id: 'Appointments', nameEn: 'Booking & Visits', nameAr: 'المواعيد والحجز' },
    { id: 'Clinical Care', nameEn: 'Procedures & Care', nameAr: 'الخدمات السريرية' },
    { id: 'Billing & Insurance', nameEn: 'Fees & Payment', nameAr: 'الأسعار والدفع' },
    { id: 'Sterilization & Safety', nameEn: 'Sterility & Protocols', nameAr: 'التعقيم والسلامة' },
  ];

  const filtered = CLINIC_FAQS.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const q = query.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesQuery = (
      item.qEn.toLowerCase().includes(q) ||
      item.aEn.toLowerCase().includes(q) ||
      item.qAr.includes(q) ||
      item.aAr.includes(q)
    );
    return matchesCat && matchesQuery;
  });

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-[#F7F6F2] min-h-screen py-10 lg:py-14">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Search Bar */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_05bc8703ed')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E] tracking-tight">
            {localizedText(isAr ? 'ar' : 'en', 'text_2efe90583d')}
          </h1>
          <p className="text-sm text-[#526574] leading-relaxed max-w-2xl">
            {localizedText(isAr ? 'ar' : 'en', 'text_b58b3ccd64')}
          </p>

          <div className="relative max-w-xl pt-2">
            <Search className="w-4 h-4 text-[#526574] absolute start-4 top-1/2 -translate-y-1/2 mt-1" />
            <LocalizedInput
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={localizedText(isAr ? 'ar' : 'en', 'text_3d0281a02b')}
              className="w-full ps-11 pe-4 py-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] text-xs text-[#102A5E] font-medium focus:bg-white focus:border-[#4169E1] focus:ring-1 focus:ring-[#4169E1] outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#102A5E] text-white shadow-2xs'
                  : 'bg-white border border-[#D8E0DC] text-[#526574] hover:border-[#4169E1] hover:text-[#102A5E]'
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#D8E0DC] p-12 text-center text-xs text-[#526574]"> <TranslatedText text="No questions found matching your search. Please reach out to our reception team directly." /> </div>
          ) : (
            filtered.map((faq, idx) => {
              const isOpen = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#D8E0DC] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="w-full p-5 text-start flex items-center justify-between gap-4 hover:bg-[#F7FAFF]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#4169E1] shrink-0" />
                      <span className="text-sm font-bold text-[#102A5E]">
                        {isAr ? faq.qAr : faq.qEn}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#EAF3FF] text-[#4169E1] hidden sm:inline-block">
                        {faq.category}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#526574] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#4169E1]' : ''}`} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#526574] leading-relaxed border-t border-[#D8E0DC]/60 bg-[#F7FAFF]/30">
                      <p className="ps-5">
                        {isAr ? faq.aAr : faq.aEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Have a Question Bottom Card */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="text-xs text-[#526574] text-center sm:text-start">
            <strong className="text-[#102A5E] block text-base font-bold">
              {localizedText(isAr ? 'ar' : 'en', 'text_2004c1b4d7')}
            </strong>
            {localizedText(isAr ? 'ar' : 'en', 'text_c881e79fc0')}
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/contact">
              <Button variant="outline" size="md">
                {localizedText(isAr ? 'ar' : 'en', 'text_b960182c78')}
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="primary" size="md" icon={<Calendar className="w-4 h-4" />}>
                {localizedText(isAr ? 'ar' : 'en', 'text_445471317d')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
