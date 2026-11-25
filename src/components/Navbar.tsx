'use client';
import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { AppointmentRequestModal } from './AppointmentRequestModal';
import { BrandLogo } from './ui/BrandLogo';
import { getStaticSessionUser, logoutStaticUser, STATIC_AUTH_EVENT } from '@/lib/auth';
import {
  Calendar,
  LogOut,
  Languages,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Phone,
  MapPin,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

interface NavbarProps {
  currentUser?: {
    id: string;
    fullName: string;
    email?: string | null;
    roleGrants: { role: string; branch?: { code: string; name: string } | null }[];
  } | null;
}

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

export function Navbar({ currentUser: initialUser }: NavbarProps) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const isAr = locale === 'ar';
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'services' | 'branches' | 'resources' | null>(null);
  const [sessionUser, setSessionUser] = useState<NavbarProps['currentUser']>(initialUser || null);

  useEffect(() => {
    const sync = () => {
      const stored = getStaticSessionUser();
      setSessionUser(stored || initialUser || null);
    };
    sync();
    window.addEventListener(STATIC_AUTH_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(STATIC_AUTH_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [initialUser, pathname]);

  const currentUser = sessionUser;
  const primaryRole = currentUser?.roleGrants?.[0]?.role;

  const handleStaticLogout = () => {
    logoutStaticUser();
    router.push('/auth/login');
  };

  const isWorkspaceRoute = WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  const publicNavLinks = [
    { href: '/', label: localizedText(isAr ? 'ar' : 'en', 'text_a7e49d2ebd') },
    {
      href: '/services',
      label: localizedText(isAr ? 'ar' : 'en', 'text_2ffb83e078'),
      dropdownKey: 'services' as const,
      subItems: [
        { href: '/services/general-dentistry', labelEn: 'General & Preventive Care', labelAr: 'طب الأسنان العام والوقائي' },
        { href: '/services/dental-cleaning', labelEn: 'Dental Cleaning & Hygiene', labelAr: 'تنظيف الجير وتلميع الأسنان' },
        { href: '/services/restorative-fillings', labelEn: 'Fillings & Restorative Care', labelAr: 'الحشوات التجميلية والعلاج التحفظي' },
        { href: '/services/root-canal', labelEn: 'Root Canal Treatment (Endodontics)', labelAr: 'علاج الجذور المجهري' },
        { href: '/services/crowns-bridges', labelEn: 'Crowns & Bridges', labelAr: 'التركيبات الثابتة والتيجان' },
        { href: '/services/dental-implants', labelEn: 'Dental Implants & Oral Surgery', labelAr: 'زراعة الأسنان والجراحة' },
        { href: '/services/orthodontics', labelEn: 'Orthodontics & Clear Aligners', labelAr: 'تقويم الأسنان والتقويم الشفاف' },
        { href: '/services/cosmetic-dentistry', labelEn: 'Cosmetic Dentistry & Whitening', labelAr: 'تجميل الأسنان وتبييضها' },
      ],
    },
    { href: '/dentists', label: localizedText(isAr ? 'ar' : 'en', 'text_c441cc23f0') },
    {
      href: '/branches',
      label: localizedText(isAr ? 'ar' : 'en', 'text_d9c43f75f3'),
      dropdownKey: 'branches' as const,
      subItems: [
        { href: '/branches/BR-A', labelEn: 'Branch A — Heliopolis', labelAr: 'الفرع أ — مصر الجديدة' },
        { href: '/branches/BR-B', labelEn: 'Branch B — New Cairo', labelAr: 'الفرع ب — القاهرة الجديدة' },
        { href: '/branches/BR-C', labelEn: 'Branch C — Maadi', labelAr: 'الفرع ج — المعادي' },
        { href: '/branches', labelEn: 'Compare All 3 Branches', labelAr: 'مقارنة جميع الفروع الثلاثة' },
      ],
    },
    {
      href: '/new-patients',
      label: localizedText(isAr ? 'ar' : 'en', 'text_dc35fb600a'),
      dropdownKey: 'resources' as const,
      subItems: [
        { href: '/about', labelEn: 'About Ebtesamty & Sterilization', labelAr: 'عن ابتسامتي ومعايير التعقيم' },
        { href: '/new-patients', labelEn: 'New Patient Guide', labelAr: 'دليل المريض الجديد' },
        { href: '/pricing', labelEn: 'Pricing & Payment Options', labelAr: 'الأسعار وطرق الدفع' },
        { href: '/emergency', labelEn: 'Emergency Dental Care', labelAr: 'طوارئ الأسنان العاجلة' },
        { href: '/education', labelEn: 'Patient Education Library', labelAr: 'مكتبة التثقيف الصحي' },
        { href: '/faqs', labelEn: 'Frequently Asked Questions', labelAr: 'الأسئلة الشائعة' },
        { href: '/policies', labelEn: 'Privacy, Terms & Policies', labelAr: 'الخصوصية والشروط والسياسات' },
      ],
    },
    { href: '/contact', label: localizedText(isAr ? 'ar' : 'en', 'text_8b91476a98') },
  ];

  if(pathname==='/auth/login')return <header className="relative z-30 max-w-6xl w-full mx-auto px-5 py-4 flex justify-between items-center gap-4"><Link href="/" aria-label="Ebtesamty" className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs"><BrandLogo/></Link><button className="secondary-button shrink-0 bg-white/90 backdrop-blur-md" onClick={toggleLanguage}><Languages size={16}/>{isAr?'English':'العربية'}</button></header>;
  if (isWorkspaceRoute) {
    return null;
  }

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-[#F7F6F2]/90 backdrop-blur-xl border-b border-slate-200/70 transition-colors"
        dir={localizedText(isAr ? 'ar' : 'en', 'text_52b133b060')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <BrandLogo size="md" variant="full" isArabic={isAr} />
              </Link>
            </div>

            {/* Desktop Public Navigation */}
            <nav
              aria-label="Global Public Navigation"
              className="hidden lg:flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs whitespace-nowrap"
            >
              {publicNavLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(`${item.href}/`));

                if (item.dropdownKey && item.subItems) {
                  const isDropdownOpen = openDropdown === item.dropdownKey;
                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.dropdownKey!)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <Link
                        href={item.href}
                        onFocus={() => setOpenDropdown(item.dropdownKey!)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                          isActive
                            ? 'text-white bg-[#0B2528] shadow-2xs'
                            : 'text-[#0B2528] hover:text-[#C8A96E] hover:bg-[#F7F6F2]'
                        }`}
                      >
                        <span><TranslatedText text={String(item.label)}/></span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-[#C8A96E]' : ''
                          }`}
                        />
                      </Link>

                      {isDropdownOpen && (
                        <div className="absolute left-0 rtl:right-0 rtl:left-auto top-full pt-2 w-64 z-50">
                          <div className="menu-enter bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-2 space-y-1">
                            {item.subItems.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setOpenDropdown(null)}
                                className="block px-3.5 py-2 rounded-2xl text-xs font-semibold text-[#0B2528] hover:bg-[#F7F6F2] hover:text-[#C8A96E] transition-colors"
                              >
                                {isAr ? sub.labelAr : sub.labelEn}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-white bg-[#0B2528] shadow-2xs'
                        : 'text-[#0B2528] hover:text-[#C8A96E] hover:bg-[#F7F6F2]'
                    }`}
                  >
                    <TranslatedText text={String(item.label)}/>
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls & Prominent Book Action */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white text-xs font-bold text-[#0B2528] hover:border-[#C8A96E] transition-all shadow-2xs active:scale-95"
                title="Toggle English / العربية"
              >
                <Languages className="w-3.5 h-3.5 text-[#C8A96E]" />
                <span className="font-sans text-xs">{locale === 'en' ? 'العربية' : 'English'}</span>
              </button>

              {/* Visually Prominent Book an Appointment Action */}
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B2528] text-white hover:bg-[#13393E] transition-all duration-200 text-xs font-bold shadow-sm group whitespace-nowrap active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C8A96E] group-hover:scale-110 transition-transform" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_7d4ef0aceb')}</span>
              </Link>

              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#DDE5E1]">
                  <Link
                    href={
                      primaryRole === 'PATIENT'
                        ? '/patient/dashboard'
                        : primaryRole === 'RECEPTIONIST'
                        ? '/reception/dashboard'
                        : primaryRole === 'DENTIST'
                        ? '/doctor/dashboard'
                        : '/owner/dashboard'
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EAF3FF] hover:bg-[#102A5E] text-[#102A5E] hover:text-white text-xs font-bold transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{primaryRole === 'PATIENT' ? t.portal : localizedText(isAr ? 'ar' : 'en', 'text_8e36599bcc')}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleStaticLogout}
                    aria-label="Logout"
                    className="p-2 text-slate-500 hover:text-[#B42318] hover:bg-rose-50 rounded-full transition-colors"
                    title={t.logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DDE5E1] bg-white text-[#102A5E] text-xs font-bold hover:border-[#4169E1] hover:text-[#4169E1] transition-all shadow-2xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_8e36599bcc')}</span>
                </Link>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="flex xl:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-2.5 py-1 border border-[#DDE5E1] bg-white rounded-full text-xs font-semibold text-[#102A5E]"
              >
                {locale === 'en' ? 'عربي' : 'EN'}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#102A5E] hover:bg-[#EAF3FF] rounded-full transition-colors"
                aria-label={isAr?'فتح أو إغلاق القائمة':'Open or close menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="menu-enter xl:hidden border-t border-[#DDE5E1] bg-white px-6 py-6 space-y-3 shadow-xl max-h-[82vh] overflow-y-auto">
            {publicNavLinks.map((item) => (
              <div key={item.href} className="border-b border-slate-100 pb-2">
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-bold text-[#102A5E] hover:text-[#4169E1]"
                >
                  <TranslatedText text={String(item.label)}/>
                </Link>
                {item.subItems && (
                  <div className="pl-3 rtl:pr-3 space-y-1 mt-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1 text-xs text-slate-600 hover:text-[#4169E1]"
                      >
                        • {isAr ? sub.labelAr : sub.labelEn}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-[#4169E1] border-b border-slate-100"
            >
              {localizedText(isAr ? 'ar' : 'en', 'text_f48c645df8')}
            </Link>

            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 rounded-full bg-[#4169E1] text-white font-bold text-xs tracking-wider uppercase transition-colors shadow-sm"
            >
              {localizedText(isAr ? 'ar' : 'en', 'text_3486902a04')}
            </Link>

            {currentUser ? (
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold text-[#102A5E]">{currentUser.fullName}</span>
                  <span className="text-xs text-slate-500 font-mono">{primaryRole}</span>
                </div>
                <button type="button" onClick={handleStaticLogout} className="text-xs font-bold text-[#B42318] hover:underline">
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 border border-[#DDE5E1] bg-white text-[#102A5E] rounded-full font-bold text-xs shadow-2xs"
                >
                  {localizedText(isAr ? 'ar' : 'en', 'text_128ec9d269')}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Quick Action Bar (Book, Call, Directions) */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DDE5E1] px-3 py-2 flex items-center justify-around gap-2 shadow-lg"
        dir={localizedText(isAr ? 'ar' : 'en', 'text_52b133b060')}
      >
        <Link
          href="/book"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#4169E1] text-white text-xs font-bold shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{localizedText(isAr ? 'ar' : 'en', 'text_f171838e14')}</span>
        </Link>
        <a
          href="tel:+20224150001"
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#EAF3FF] text-[#102A5E] text-xs font-bold"
        >
          <Phone className="w-3.5 h-3.5 text-[#4169E1]" />
          <span>{localizedText(isAr ? 'ar' : 'en', 'text_f8106cefde')}</span>
        </a>
        <Link
          href="/branches"
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#DDE5E1] bg-white text-[#102A5E] text-xs font-bold"
        >
          <MapPin className="w-3.5 h-3.5 text-[#4169E1]" />
          <span>{localizedText(isAr ? 'ar' : 'en', 'text_c1b7b21be3')}</span>
        </Link>
      </div>

      <AppointmentRequestModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}
