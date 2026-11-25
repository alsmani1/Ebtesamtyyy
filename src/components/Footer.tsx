'use client';

import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React from 'react';
import {CLINIC_BRANCHES} from '@/config/clinic-catalog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Phone, MapPin, Calendar, ArrowUpRight, Languages } from 'lucide-react';
import { BrandLogo } from './ui/BrandLogo';

const WORKSPACE_PREFIXES = [
  '/owner',
  '/doctor',
  '/patient',
  '/portal',
  '/reception',
  '/dentist',
  '/management',
  '/billing',
  '/inventory',
  '/purchasing',
  '/operations',
  '/crm',
  '/admin',
  '/supplier',
];

export function Footer() {
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname() || '/';
  const isAr = locale === 'ar';

  const isWorkspaceRoute = WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const careWorkspaceRole =
    pathname === '/patient' || pathname.startsWith('/patient/') || pathname === '/portal' || pathname.startsWith('/portal/')
      ? 'patient'
      : pathname === '/reception' || pathname.startsWith('/reception/')
      ? 'receptionist'
      : null;

  if(pathname==='/auth/login')return null;
  if (isWorkspaceRoute) {
    return (
      <footer
        className={`${careWorkspaceRole ? 'care-footer' : 'bg-[#102A5E]'} text-slate-300 border-t border-white/10 py-3 text-xs`}
        data-workspace-role={careWorkspaceRole || undefined}
        dir={localizedText(isAr ? 'ar' : 'en', 'text_52b133b060')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${careWorkspaceRole ? 'bg-[#5FB8A6]' : 'bg-[#4169E1]'}`} />
            <span className="font-mono text-white font-semibold"><TranslatedText text="Ebtesamty Clinical & Operational Platform" /></span>
            <span>•</span>
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_dec7593b62')}</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span><TranslatedText text="Africa/Cairo • EGP" /></span>
            {process.env.NODE_ENV !== 'production' && (
              <Link href="/demo" className="text-[#F28C28] hover:underline font-semibold">
                {localizedText(isAr ? 'ar' : 'en', 'text_2f484b26b9')}
              </Link>
            )}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="bg-[#102A5E] text-[#F7FAFF] border-t border-[#4169E1]/30 pt-14 pb-20 md:pb-12 transition-colors"
      dir={localizedText(isAr ? 'ar' : 'en', 'text_52b133b060')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Final Call to Action Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-[#4169E1] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-block text-xs font-mono uppercase tracking-wider text-[#EAF3FF]">
              {localizedText(isAr ? 'ar' : 'en', 'text_4326040627')}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold">
              {localizedText(isAr ? 'ar' : 'en', 'text_fb32278cf3')}
            </h3>
            <p className="text-xs sm:text-sm text-[#EAF3FF]/90">
              {localizedText(isAr ? 'ar' : 'en', 'text_20963fa6a7')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#102A5E] hover:bg-[#EAF3FF] text-xs font-bold transition-colors shadow-sm"
            >
              <Calendar className="w-4 h-4 text-[#4169E1]" />
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_3486902a04')}</span>
            </Link>
            <Link
              href="/emergency"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_5412b01f2d')}</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-block bg-white/95 px-3.5 py-2 rounded-2xl">
              <BrandLogo size="md" variant="full" isArabic={isAr} />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {localizedText(isAr ? 'ar' : 'en', 'text_a23ebe2fab')}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-[#EAF3FF] rounded-full text-xs font-mono border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_3695841bdc')}</span>
              </span>
              <button
                type="button"
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold transition-colors"
              >
                <Languages className="w-3.5 h-3.5 text-[#F28C28]" />
                <span>{locale === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
              </button>
            </div>
          </div>

          {/* Patient Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F28C28]">
              {localizedText(isAr ? 'ar' : 'en', 'text_58502cf6c1')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><Link href="/services" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_22ee89c7d3')}</Link></li>
              <li><Link href="/dentists" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_f2cb0c76ff')}</Link></li>
              <li><Link href="/branches" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_fe3587942d')}</Link></li>
              <li><Link href="/new-patients" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_1bbbf070f0')}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_01b10b078a')}</Link></li>
              <li><Link href="/emergency" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_d3f2495979')}</Link></li>
              <li><Link href="/education" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_e1e425b4e6')}</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">{localizedText(isAr ? 'ar' : 'en', 'text_02d2ae3bf0')}</Link></li>
            </ul>
          </div>

          {/* Portals & Workspaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F28C28]">
              {localizedText(isAr ? 'ar' : 'en', 'text_4e9fd13a8d')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/portal" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_2149869788')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/reception" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_f367655786')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/dentist" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_33d4ef1e7a')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/management" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_741ba9f0ba')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/billing" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_8ab04e7ff5')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_ae69c5a580')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/crm" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_b760ed62f1')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_86a1b38ef9')}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-[#F28C28] hover:underline font-semibold">
                  {localizedText(isAr ? 'ar' : 'en', 'text_dfab6d514b')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cairo Branches Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#F28C28]">
              {localizedText(isAr ? 'ar' : 'en', 'text_f1e162da65')}
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              {CLINIC_BRANCHES.map(branch=><div key={branch.code}><Link href={'/branches/'+branch.code} className="font-semibold text-white block">{isAr?branch.nameAr:branch.nameEn}</Link><p className="text-xs text-slate-300">{isAr?branch.addressAr:branch.addressEn}</p><p className="tabular-nums text-slate-300"><bdi>{branch.phone}</bdi></p></div>)}

            </div>
          </div>
        </div>

        {/* Policies, Accessibility & Fictional Demo Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/policies" className="hover:text-white underline-offset-4 hover:underline">
              {localizedText(isAr ? 'ar' : 'en', 'text_93ed3359cd')}
            </Link>
            <Link href="/policies#terms" className="hover:text-white underline-offset-4 hover:underline">
              {localizedText(isAr ? 'ar' : 'en', 'text_d7cd103fc6')}
            </Link>
            <Link href="/policies#accessibility" className="hover:text-white underline-offset-4 hover:underline">
              {localizedText(isAr ? 'ar' : 'en', 'text_54bad84761')}
            </Link>
            <Link href="/contact" className="hover:text-white underline-offset-4 hover:underline">
              {localizedText(isAr ? 'ar' : 'en', 'text_7d703bb61d')}
            </Link>
          </div>

          <p className="font-mono text-xs text-slate-400">
            © {new Date().getFullYear()} Ebtesamty Dental Clinics (ابتسامتي). <TranslatedText text={String(isAr?'بيئة تجريبية • جنيه مصري • توقيت القاهرة':'Demo environment • EGP • Cairo time')}/>
          </p>
        </div>
      </div>
    </footer>
  );
}
