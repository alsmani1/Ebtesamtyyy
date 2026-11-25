'use client';

import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_SERVICES } from '../../config/clinic-catalog';
import { Button } from '../../components/ui/Button';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Clock,
  Filter,
  Info,
  Banknote,
  Smartphone
} from 'lucide-react';

export default function PricingAndPaymentsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', nameEn: 'All Procedures', nameAr: 'جميع العلاجات' },
    { id: 'Preventive & Diagnostic', nameEn: 'Preventive & Exam', nameAr: 'الفحص والوقاية' },
    { id: 'Restorative & Endodontics', nameEn: 'Restorative & RCT', nameAr: 'الحشوات وعلاج الجذور' },
    { id: 'Surgical & Implants', nameEn: 'Implants & Surgery', nameAr: 'الزراعة والجراحة' },
    { id: 'Cosmetic Dentistry', nameEn: 'Cosmetic & Veneers', nameAr: 'التجميل والابتسامة' },
    { id: 'Orthodontics', nameEn: 'Orthodontics', nameAr: 'تقويم الأسنان' },
  ];

  const filteredServices = selectedCategory === 'ALL'
    ? CLINIC_SERVICES
    : CLINIC_SERVICES.filter(s => s.categoryEn === selectedCategory);

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-10 lg:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Header */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
            <Receipt className="w-3.5 h-3.5" />
            <span>
              {localizedText(isAr ? 'ar' : 'en', 'text_09a8a4a7cd')}
            </span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E] tracking-tight">
            {localizedText(isAr ? 'ar' : 'en', 'text_e761023741')}
          </h1>
          <p className="text-sm text-[#526574] leading-relaxed max-w-3xl">
            {localizedText(isAr ? 'ar' : 'en', 'text_b6b1519e45')}
          </p>

          <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC] text-xs text-[#526574] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
            <span>
              {localizedText(isAr ? 'ar' : 'en', 'text_92c47daa69')}
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#102A5E] text-white shadow-2xs'
                  : 'bg-white border border-[#D8E0DC] text-[#526574] hover:border-[#4169E1] hover:text-[#102A5E]'
              }`}
            >
              {isAr ? cat.nameAr : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Fee Schedule Table Card */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#D8E0DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#102A5E]">
                {localizedText(isAr ? 'ar' : 'en', 'text_9126ba779f')}
              </h2>
              <p className="text-xs text-[#526574]"> <TranslatedText text="Showing" /> {filteredServices.length} <TranslatedText text="procedures in Egyptian Pounds (EGP)" /> </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#4169E1] bg-[#EAF3FF] px-3 py-1 rounded-lg self-start sm:self-auto"> <TranslatedText text="All 3 Cairo Branches" /> </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-[#F7FAFF] border-b border-[#D8E0DC] text-xs font-bold uppercase text-[#526574]">
                  <th className="py-3.5 px-5 text-start">{localizedText(isAr ? 'ar' : 'en', 'text_9186bb4f22')}</th>
                  <th className="py-3.5 px-5 text-start">{localizedText(isAr ? 'ar' : 'en', 'text_b3c0e2a36a')}</th>
                  <th className="py-3.5 px-5 text-start">{localizedText(isAr ? 'ar' : 'en', 'text_fe64a4525f')}</th>
                  <th className="py-3.5 px-5 text-start">{localizedText(isAr ? 'ar' : 'en', 'text_e1c5566917')}</th>
                  <th className="py-3.5 px-5 text-start">{localizedText(isAr ? 'ar' : 'en', 'text_4b44b322ea')}</th>
                  <th className="py-3.5 px-5 text-end">{localizedText(isAr ? 'ar' : 'en', 'text_f552f7d4d1')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E0DC] text-xs">
                {filteredServices.map((srv) => (
                  <tr key={srv.slug} className="hover:bg-[#F7FAFF]/60 transition-colors">
                    <td className="py-4 px-5 font-mono text-[#526574] font-semibold">{srv.code}</td>
                    <td className="py-4 px-5">
                      <Link href={`/services/${srv.slug}`} className="font-bold text-[#102A5E] hover:text-[#4169E1] transition-colors block">
                        {isAr ? srv.nameAr : srv.nameEn}
                      </Link>
                      <span className="text-xs text-[#526574] line-clamp-1">
                        {isAr ? srv.shortDescAr : srv.shortDescEn}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#526574] font-medium">
                      {isAr ? srv.categoryAr : srv.categoryEn}
                    </td>
                    <td className="py-4 px-5 text-[#526574] tabular-nums font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#4169E1]" />
                        <span>{srv.durationMinutes} <TranslatedText text="min" /></span>
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-[#102A5E] tabular-nums">
                      {isAr ? srv.priceRangeAr : srv.priceRangeEn}
                    </td>
                    <td className="py-4 px-5 text-end">
                      <Link
                        href={`/book?service=${srv.slug}`}
                        className="inline-block px-3 py-1.5 rounded-lg bg-white border border-[#D8E0DC] text-xs font-bold text-[#4169E1] hover:bg-[#4169E1] hover:text-white transition-all shadow-2xs"
                      >
                        {localizedText(isAr ? 'ar' : 'en', 'text_11e052ad49')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column Payment Channels & Milestone Installments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#102A5E] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#4169E1]" />
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_fc82245a6a')}</span>
            </h2>

            <ul className="space-y-3 text-xs text-[#526574]">
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <Banknote className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#102A5E] block"> <TranslatedText text="Cash at Front Desk (EGP)" /> </strong>
                  <span> <TranslatedText text="Official computerized receipt generated immediately upon payment." /> </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <CreditCard className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#102A5E] block"> <TranslatedText text="Credit &amp; Debit POS Terminals" /> </strong>
                  <span> <TranslatedText text="Visa, Mastercard, and Meeza electronic card payments accepted across all desks." /> </span>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FAFF] border border-[#D8E0DC]">
                <Smartphone className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#102A5E] block"> <TranslatedText text="InstaPay Egypt &amp; Electronic Transfers" /> </strong>
                  <span> <TranslatedText text="Instant verified transfer via Central Bank of Egypt InstaPay network with instant confirmation." /> </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Staged Milestone Financing */}
          <div className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-[#102A5E] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4169E1]" />
              <span>
                {localizedText(isAr ? 'ar' : 'en', 'text_fa1e7c5952')}
              </span>
            </h2>
            <p className="text-xs text-[#526574] leading-relaxed">
              {localizedText(isAr ? 'ar' : 'en', 'text_63fcf6b2bd')}
            </p>

            <div className="p-3.5 rounded-2xl bg-[#EAF3FF] border border-[#4169E1]/20 text-xs space-y-1">
              <strong className="text-[#102A5E] block"> <TranslatedText text="Patient Portal Billing Ledger:" /> </strong>
              <p className="text-xs text-[#526574]"> <TranslatedText text="All invoices, partial receipts, and upcoming milestone installments are tracked in real time in your verified Patient Portal account." /> </p>
            </div>

            <Link href="/book" className="block pt-2">
              <Button variant="primary" size="md" fullWidth icon={<Calendar className="w-4 h-4" />}>
                {localizedText(isAr ? 'ar' : 'en', 'text_b988e6e000')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
