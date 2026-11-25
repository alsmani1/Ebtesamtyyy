'use client';
import {LocalizedInput,LocalizedTextarea} from '@/components/LocalizedControls';

import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';
import {clinicYear} from '@/lib/clinic-clock';


import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CLINIC_BRANCHES } from '../../config/clinic-catalog';
import { Button } from '../../components/ui/Button';
import {
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function ContactPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [branchCode, setBranchCode] = useState('BR-A');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          contactPhone,
          contactEmail,
          branchCode,
          category: 'INQUIRY',
          subject: subject || 'Website Inquiry',
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
      setSubmittedRef(data.feedback?.id?.slice(0, 8).toUpperCase() || `INQ-${clinicYear()}`);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setSubject('');
      setDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_b96e820ca0')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E]">
            {localizedText(isAr ? 'ar' : 'en', 'text_956991a3ff')}
          </h1>
          <p className="text-sm text-[#526574] leading-relaxed">
            {localizedText(isAr ? 'ar' : 'en', 'text_01281749f8')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#102A5E] mb-2">
              {localizedText(isAr ? 'ar' : 'en', 'text_f048718e18')}
            </h2>
            <p className="text-xs text-[#526574] mb-6">
              {localizedText(isAr ? 'ar' : 'en', 'text_0e9eb8f89b')}
            </p>

            {submittedRef ? (
              <div className="p-6 rounded-2xl bg-[#EAF3FF] border border-[#4169E1]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#4169E1] font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {localizedText(isAr ? 'ar' : 'en', 'text_574f6ebef2')}
                  </span>
                </div>
                <p className="text-xs text-[#102A5E]">
                  {isAr
                    ? `رقم المتابعة: #${submittedRef} — سيتواصل معك مكتب الاستقبال قريباً.`
                    : `Reference ID: #${submittedRef} — Our patient coordination desk will contact you shortly.`}
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmittedRef(null)}>
                  {localizedText(isAr ? 'ar' : 'en', 'text_04b420f4ca')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                      {localizedText(isAr ? 'ar' : 'en', 'text_9c148eebf6')}
                    </label>
                    <LocalizedInput
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={localizedText(isAr ? 'ar' : 'en', 'text_5ff09fd09b')}
                      className="w-full rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] px-3.5 py-2.5 text-xs text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                      {localizedText(isAr ? 'ar' : 'en', 'text_addfda0017')}
                    </label>
                    <LocalizedInput
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+20 10 ..."
                      className="w-full rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] px-3.5 py-2.5 text-xs text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                      {localizedText(isAr ? 'ar' : 'en', 'text_99ef601bb9')}
                    </label>
                    <LocalizedInput
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] px-3.5 py-2.5 text-xs text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                      {localizedText(isAr ? 'ar' : 'en', 'text_fb13d15d19')}
                    </label>
                    <select
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="w-full rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] px-3.5 py-2.5 text-xs font-semibold text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
                    >
                      {CLINIC_BRANCHES.map((b) => (
                        <option key={b.code} value={b.code}>
                          {isAr ? b.nameAr : b.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                    {localizedText(isAr ? 'ar' : 'en', 'text_1efd0de969')}
                  </label>
                  <LocalizedInput
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={
                      localizedText(isAr ? 'ar' : 'en', 'text_9a407faf8f')
                    }
                    className="w-full rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] px-3.5 py-2.5 text-xs text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A5E] mb-1.5">
                    {localizedText(isAr ? 'ar' : 'en', 'text_43230b15af')}
                  </label>
                  <LocalizedTextarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      localizedText(isAr ? 'ar' : 'en', 'text_5f74d36009')
                    }
                    className="w-full rounded-xl border border-[#D8E0DC] bg-[#F7FAFF] px-3.5 py-2.5 text-xs text-[#102A5E] focus:border-[#4169E1] focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  icon={<Send className="w-4 h-4" />}
                >
                  {localizedText(isAr ? 'ar' : 'en', 'text_2894ef1713')}
                </Button>
              </form>
            )}
          </div>

          {/* Direct Branch Cards with Facility Photos */}
          <div className="lg:col-span-5 space-y-5">
            {CLINIC_BRANCHES.map((b) => {
              const branchImage =
                b.code === 'BR-A'
                  ? '/images/branches/branch_heliopolis.jpg'
                  : b.code === 'BR-B'
                  ? '/images/branches/branch_new_cairo.jpg'
                  : '/images/branches/branch_maadi.jpg';

              return (
                <div
                  key={b.code}
                  className="bg-white rounded-3xl border border-[#D8E0DC] overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-[#102A5E]">
                    <img
                      src={branchImage}
                      alt={isAr ? b.nameAr : b.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102A5E]/90 via-[#102A5E]/30 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#4169E1] text-white shadow-sm">
                        {b.code}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-[#102A5E] backdrop-blur-xs">
                        {isAr ? b.shortNameAr : b.shortNameEn}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base font-extrabold text-white">
                        {isAr ? b.nameAr : b.nameEn}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <p className="text-xs text-[#526574] flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                      <span>{isAr ? b.addressAr : b.addressEn}</span>
                    </p>
                    <p className="text-xs text-[#526574] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#4169E1] shrink-0" />
                      <span>{isAr ? b.hoursAr : b.hoursEn}</span>
                    </p>

                    <div className="pt-2 border-t border-[#E8ECE9] flex flex-wrap gap-2">
                      <a
                        href={`tel:${b.phone}`}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{b.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/201001234567?text=${encodeURIComponent(
                          `Hello Ebtesamty Clinic (${b.code}), I would like to inquire about an appointment.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#EAF3FF] hover:bg-[#c9e4d9] text-[#4169E1] text-xs font-bold transition-colors"
                      >
                        <span><TranslatedText text="WhatsApp" /></span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
