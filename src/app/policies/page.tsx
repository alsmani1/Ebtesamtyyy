'use client';
import {localizedText} from '@/lib/interface-messages';


import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  Lock,
  Calendar,
  Eye,
  FileCheck2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PoliciesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'privacy' | 'booking' | 'billing' | 'reviews' | 'accessibility'>('privacy');

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_c19c1a4873')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E]">
            {localizedText(isAr ? 'ar' : 'en', 'text_7760f7a76a')}
          </h1>
          <p className="text-sm text-[#526574] leading-relaxed">
            {localizedText(isAr ? 'ar' : 'en', 'text_0077b28d93')}
          </p>
          <div className="text-xs font-semibold text-[#4169E1]">
            {localizedText(isAr ? 'ar' : 'en', 'text_9879a3818d')}
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap gap-2 border-b border-[#D8E0DC] pb-4">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'privacy'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'bg-white text-[#526574] hover:bg-[#EAF3FF] border border-[#D8E0DC]'
            }`}
          >
            {localizedText(isAr ? 'ar' : 'en', 'text_41b87ab933')}
          </button>
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'booking'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'bg-white text-[#526574] hover:bg-[#EAF3FF] border border-[#D8E0DC]'
            }`}
          >
            {localizedText(isAr ? 'ar' : 'en', 'text_1d23844c86')}
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'billing'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'bg-white text-[#526574] hover:bg-[#EAF3FF] border border-[#D8E0DC]'
            }`}
          >
            {localizedText(isAr ? 'ar' : 'en', 'text_8c0ac00783')}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'reviews'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'bg-white text-[#526574] hover:bg-[#EAF3FF] border border-[#D8E0DC]'
            }`}
          >
            {localizedText(isAr ? 'ar' : 'en', 'text_02c5fcc6b5')}
          </button>
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'accessibility'
                ? 'bg-[#4169E1] text-white shadow-xs'
                : 'bg-white text-[#526574] hover:bg-[#EAF3FF] border border-[#D8E0DC]'
            }`}
          >
            {localizedText(isAr ? 'ar' : 'en', 'text_1a9b699bc4')}
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1: Privacy */}
          {(activeTab === 'privacy' || true) && (
            <div
              id="privacy"
              className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#102A5E]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_ee009ab279')}
                  </h2>
                  <p className="text-xs text-[#526574]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_c2a7ab3bc8')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                  <h3 className="text-sm font-bold text-[#102A5E] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4169E1]" />
                    <span>{localizedText(isAr ? 'ar' : 'en', 'text_58b685ac8c')}</span>
                  </h3>
                  <p className="text-xs text-[#526574] leading-relaxed">
                    {localizedText(isAr ? 'ar' : 'en', 'text_c87d7c6bc6')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                  <h3 className="text-sm font-bold text-[#102A5E] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4169E1]" />
                    <span>{localizedText(isAr ? 'ar' : 'en', 'text_a3c3c9d7fa')}</span>
                  </h3>
                  <p className="text-xs text-[#526574] leading-relaxed">
                    {localizedText(isAr ? 'ar' : 'en', 'text_0b9dd7599d')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Booking & Cancellation */}
          <div
            id="booking"
            className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_56f65a6b10')}
                </h2>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_0064c8fcb9')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#526574] leading-relaxed">
              <p>
                {localizedText(isAr ? 'ar' : 'en', 'text_636ea0c321')}
              </p>
              <p>
                {localizedText(isAr ? 'ar' : 'en', 'text_4eaf752a92')}
              </p>
              <p>
                {localizedText(isAr ? 'ar' : 'en', 'text_f8cf5ff735')}
              </p>
            </div>
          </div>

          {/* Section 3: Financial Transparency */}
          <div
            id="billing"
            className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_4cdd9c7f20')}
                </h2>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_1126310656')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                <div className="text-xs font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_30d91bea86')}
                </div>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_9cc1d45ecc')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                <div className="text-xs font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_a23c0d504c')}
                </div>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_0d674f8a2b')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                <div className="text-xs font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_a03545e127')}
                </div>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_d75ad39325')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Verified Reviews */}
          <div
            id="reviews"
            className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_047fa98284')}
                </h2>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_563e69568e')}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#526574] leading-relaxed pt-2">
              {localizedText(isAr ? 'ar' : 'en', 'text_e42b268b3e')}
            </p>
          </div>

          {/* Section 5: Accessibility */}
          <div
            id="accessibility"
            className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_67bbe19ab4')}
                </h2>
                <p className="text-xs text-[#526574]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_2d08595ae5')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                <h3 className="text-xs font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_467307aacc')}
                </h3>
                <ul className="text-xs text-[#526574] space-y-1.5 list-disc list-inside">
                  <li>{localizedText(isAr ? 'ar' : 'en', 'text_8117c26e25')}</li>
                  <li>{localizedText(isAr ? 'ar' : 'en', 'text_7318ed431a')}</li>
                  <li>{localizedText(isAr ? 'ar' : 'en', 'text_c9998e67ed')}</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#E8ECE9] space-y-2">
                <h3 className="text-xs font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_c1ad56cb2a')}
                </h3>
                <ul className="text-xs text-[#526574] space-y-1.5 list-disc list-inside">
                  <li>{localizedText(isAr ? 'ar' : 'en', 'text_5c42a7eff2')}</li>
                  <li>{localizedText(isAr ? 'ar' : 'en', 'text_2f267b93c3')}</li>
                  <li>{localizedText(isAr ? 'ar' : 'en', 'text_f8186ba04d')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#102A5E] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-lg font-bold">
              {localizedText(isAr ? 'ar' : 'en', 'text_cfe1671894')}
            </h3>
            <p className="text-xs text-white/80">
              {localizedText(isAr ? 'ar' : 'en', 'text_24151d9fa7')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact">
              <Button variant="primary" size="md">
                {localizedText(isAr ? 'ar' : 'en', 'text_fc69328233')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
