'use client';
import {LocalizedInput,LocalizedSelect} from '@/components/LocalizedControls';

import {TranslatedText} from '@/components/TranslatedText';

import {localizedText} from '@/lib/interface-messages';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AppointmentRequestModal } from '../components/AppointmentRequestModal';
import WebsiteReviewsPhaseThree from '../components/phase3/WebsiteReviewsPhaseThree';
import {
  CLINIC_BRANCHES,
  CLINIC_DENTISTS,
  CLINIC_SERVICES,
  CLINIC_FAQS,
} from '../config/clinic-catalog';
import {
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Phone,
  Lock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Activity,
  Award,
  Layers,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  Users,
  Gem,
  Play,
  AlertCircle,
  Search,
} from 'lucide-react';

export default function HomePage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const router = useRouter();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Parallax Scroll Tracking
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quick Booking Finder State
  const [quickBranch, setQuickBranch] = useState<string>('BR-A');
  const [quickSpecialty, setQuickSpecialty] = useState<string>('all');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickDate, setQuickDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });

  // Clinical Protocols Interactive Tabs
  const [activeProtocol, setActiveProtocol] = useState<'restorative' | 'implants' | 'ortho' | 'cosmetic'>('restorative');

  // FAQ Accordion State (first open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleQuickBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      branch: quickBranch,
      date: quickDate,
      ...(quickSpecialty && quickSpecialty !== 'all' ? { service: quickSpecialty } : {}),
      ...(quickPhone ? { phone: quickPhone } : {}),
    });
    router.push(`/book?${params.toString()}`);
  };

  const protocolsData = {
    restorative: {
      tagEn: 'Restorative & Endodontics',
      tagAr: 'علاج الجذور والعلاج التحفظي',
      titleEn: 'Microscopic Root Canal & Biomimetic Restorations',
      titleAr: 'علاج العصب بالميكروسكوب والحشوات الحيوية التجميلية',
      descriptionEn:
        'Operating under 25x surgical magnification to locate hidden MB2 canals, eliminate deep pulpal infections in a single appointment, and rebuild natural tooth biomechanics with nano-hybrid ceramic composite.',
      descriptionAr:
        'علاج عصب الأسنان تحت تكبير جراحي 25 ضعفاً لكشف القنوات الدقيقة وعلاج الالتهاب في جلسة واحدة مع إعادة بناء بنية السن بحشوات السيراميك النانوية.',
      checkpointsEn: [
        'Electronic apex locators with 0.1mm apical accuracy',
        'Continuous vacuum rubber dam isolation with aseptic protocol',
        'Thermoplastic 3D bioceramic warm obturation',
        'Direct anatomical composite layer curing under cross-polarization',
      ],
      checkpointsAr: [
        'محددات قمة الجذر الإلكترونية بدقة 0.1 مم',
        'عزل تام للسن بالحاجز المطاطي المعقم لمنع أي تلوث بكتيري',
        'حشو القنوات ثلاثي الأبعاد بالسيراميك الحيوي الحراري',
        'بناء تشريحي دقيق لطبقات الكومبوزيت مطابق لصلابة المينا',
      ],
      image: '/images/service_restorative.jpg',
      specialistEn: 'Dr. Feby Samer (Ain Shams / Cairo Univ)',
      specialistAr: 'د. فيبي سامر (جامعة القاهرة)',
      durationEn: '60 – 75 Minutes',
      durationAr: '60 – 75 دقيقة',
    },
    implants: {
      tagEn: 'Implants & Oral Rehabilitation',
      tagAr: 'زراعة الأسنان وتأهيل الفم',
      titleEn: 'Computer-Guided 3D Titanium Implantology',
      titleAr: 'زراعة الأسنان الموجهة رقمياً ثلاثية الأبعاد',
      descriptionEn:
        'Guided implant placement based on high-resolution 3D CBCT bone tomography. Custom surgical stents ensure precise angulation and depth, reducing surgical trauma and healing times.',
      descriptionAr:
        'زراعة الغرسات بدقة متناهية بالاعتماد على الأشعة المقطعية ثلاثية الأبعاد والمرشد الجراحي الرقمي لتقليل الجراحة وتسريع التئام العظم.',
      checkpointsEn: [
        'Pre-operative virtual bone density and nerve mapping',
        'Biocompatible Swiss & German Grade-4 titanium implants',
        'Screw-retained monolithic zirconia final restorations',
        'Staged payment plan aligned with 3-month osseointegration',
      ],
      checkpointsAr: [
        'تخطيط افتراضي مسبق لكثافة العظم ومسار الأعصاب',
        'غرسات تيتانيوم طبية سويسرية وألمانية معتمدة عالمياً',
        'تركيبات زيركون مصمتة مثبتة بمسامير داخلية لسهولة الصيانة',
        'نظام دفع وسداد على مراحل تزامناً مع فترات التئام العظم',
      ],
      image: '/images/service_implants.jpg',
      specialistEn: 'Dr. Ahmed Hassan (PhD, Cairo Univ; Fellow ICOI)',
      specialistAr: 'د. أحمد حسن (دكتوراه جراحة الفم والفكين)',
      durationEn: '45 – 90 Minutes per stage',
      durationAr: '45 – 90 دقيقة لكل مرحلة',
    },
    ortho: {
      tagEn: 'Orthodontics & Clear Aligners',
      tagAr: 'تقويم الأسنان والقوالب الشفافة',
      titleEn: 'Digital 3D Clear Aligner Planning & Damon Self-Ligation',
      titleAr: 'التخطيط الرقمي للتقويم الشفاف وتقنية ديمون الذاتية',
      descriptionEn:
        'Digitally sequenced tooth movements designed from intraoral 3D scans. Choose discreet removable clear aligner trays or low-friction self-ligating brackets for faster alignment and fewer clinic visits.',
      descriptionAr:
        'تحريك الأسنان بدقة عبر محاكاة رقمية ثلاثية الأبعاد باستخدام قوالب شفافة غير مرئية أو حاصرات ديمون الحديثة لتجربة أسرع وأكثر راحة.',
      checkpointsEn: [
        'Full 3D digital simulation before initial tray fabrication',
        'Bi-weekly tray progression monitoring via Patient Portal',
        'Clear aligners or aesthetic ceramic tooth-colored brackets',
        'Predictable monthly installment payments during treatment',
      ],
      checkpointsAr: [
        'محاكاة فيديو ثلاثية الأبعاد لنتيجة العلاج قبل بدء التصنيع',
        'متابعة دورية لتسلسل القوالب مع توثيق عبر بوابة المريض',
        'خيارات القوالب الشفافة المتحركة أو التقويم الخزفي التجميلي',
        'أقساط شهرية ميسرة طوال فترة المتابعة بدون فوائد',
      ],
      image: '/images/service_ortho.jpg',
      specialistEn: 'Dr. Youssef El-Mansy (MSc Orthodontics; MOrth RCSEd)',
      specialistAr: 'د. يوسف المنسي (ماجستير التقويم وزمالة إدنبرة)',
      durationEn: '30 – 45 Minutes per visit',
      durationAr: '30 – 45 دقيقة لكل زيارة',
    },
    cosmetic: {
      tagEn: 'Cosmetic & Biomimetic Veneers',
      tagAr: 'تجميل الابتسامة وعدسات الفينير',
      titleEn: 'Digital Smile Design (DSD) & Ultra-Thin Ceramic Veneers',
      titleAr: 'تصميم الابتسامة الرقمي وعدسات الفينير فائقة الرقة',
      descriptionEn:
        'Conservative smile transformations guided by facial symmetry and digital shade analysis. Test-drive your new smile with intraoral 3D mockups before any tooth preparation begins.',
      descriptionAr:
        'تصميم الابتسامة وفقاً لملامح الوجه وتناسق الشفاه مع إمكانية تجربة شكل الابتسامة في فمك قبل البدء في أي تحضير.',
      checkpointsEn: [
        'Facial harmony photographic analysis & digital mockup',
        'Minimally invasive 0.3mm enamel micro-preparation',
        'Pressed IPS e.max lithium disilicate hand-finished ceramics',
        'High-bond adhesive resin cementation under rubber dam',
      ],
      checkpointsAr: [
        'تحليل فوتوغرافي لملامح الوجه وتجربة الابتسامة رقمياً',
        'تحضير محافظ لا يتجاوز 0.3 مم للحفاظ على مينا الأسنان',
        'سيراميك إيماكس ألماني عالي الشفافية مصقول يدوياً',
        'تثبيت لاصق عالي القوة تحت العزل المطاطي لحماية اللثة',
      ],
      image: '/images/service_cosmetic.jpg',
      specialistEn: 'Dr. Sandy Saad (MSc & PhD Prosthodontics, Ain Shams)',
      specialistAr: 'د. ساندي سعد (دكتوراه التركيبات الثابتة والتجميل)',
      durationEn: '2 – 3 Clinical Visits',
      durationAr: '2 – 3 زيارات إكلينيكية',
    },
  };

  const activeProto = protocolsData[activeProtocol];

  return (
    <div className="bg-[#F7FAFF] text-[#102A5E]">
      <AppointmentRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* 1. CINEMATIC FULL-BLEED PHOTOGRAPHIC HERO SECTION (Matching Reference Designs) */}
      <section className="relative min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-between overflow-hidden bg-[#0c2438] text-white pt-6 pb-8 lg:pt-10 lg:pb-10 border-b border-white/10 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* A. Full-Bleed Photographic Background with Parallax Scroll */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="relative w-full h-[120%] -top-[10%] transition-transform duration-75 ease-out will-change-transform"
            style={{
              transform: `translateY(${scrollY * 0.14}px) scale(${1 + scrollY * 0.0001})`,
            }}
          >
            <Image
              src="/images/hero/hero_fullbleed_smile.jpg"
              alt="Ebtesamty Dental Patient Treatment & Care"
              fill
              priority
              quality={90}
              className="object-cover object-[70%_25%] lg:object-[65%_30%]"
            />
          </div>
          {/* Multi-Stop Cinematic Gradients: Deep Navy/Teal on left & bottom for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c2438]/95 via-[#0c2438]/70 to-[#0c2438]/20 lg:from-[#0c2438]/95 lg:via-[#0c2438]/50 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c2438] via-transparent to-[#0c2438]/50 lg:from-[#0c2438]/90 lg:via-transparent lg:to-black/30" />
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#2446A6]/30 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* B. Floating Center Frosted Navigation Bar (Matching Mockup 1 & 2) */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6 lg:mb-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left Tag or Spacer */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold tracking-wide text-white/80">
                {localizedText(isAr ? 'ar' : 'en', 'text_077445cd27')}
              </span>
            </div>

            {/* Floating Glass Pill Navigation Bar */}
            <nav
              aria-label="Quick Section Navigation"
              className="mx-auto inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 shadow-2xl text-xs sm:text-sm font-semibold text-white/90"
            >
              <Link
                href="/"
                className="px-3 py-1 rounded-full bg-white text-[#102A5E] font-bold shadow-sm transition-all hover:scale-105"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_a7e49d2ebd')}
              </Link>
              <Link
                href="/about"
                className="px-2.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_d31b95a43d')}
              </Link>
              <Link
                href="/services"
                className="px-2.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_9ed27d3f75')}
              </Link>
              <Link
                href="/dentists"
                className="px-2.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_ea53f10d4c')}
              </Link>
              <Link
                href="/branches"
                className="px-2.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors hidden md:inline-block"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_4de85d249e')}
              </Link>
              <Link
                href="/pricing"
                className="px-2.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors hidden lg:inline-block"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_62bb28dfb7')}
              </Link>
              <Link
                href="/contact"
                className="px-2.5 py-1 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_86dc3b549d')}
              </Link>
            </nav>

            {/* Quick Action Pill */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white text-[#0c2438] hover:bg-[#F28C28] hover:text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-1.5"
              >
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_a1dbd557eb')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* C. Main Hero Workspace & Floating Overlay Cards */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-7">
              
              {/* Kicker Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {localizedText(isAr ? 'ar' : 'en', 'text_ec22145c78')}
                </span>
              </div>

              {/* Big Headline with Embedded Smiling Photo Pill */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-extrabold uppercase tracking-tight text-white leading-[1.08] drop-shadow-md">
                {isAr ? (
                  <>
                    رعايتك السنية{' '}
                    <span className="inline-flex items-center align-middle mx-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-inner group hover:scale-105 transition-all duration-300 cursor-pointer">
                      <img
                        src="/images/hero/hero_smile_pill.jpg"
                        alt="ابتسامة صحية"
                        className="w-12 h-6 sm:w-16 sm:h-8 rounded-full object-cover shadow-sm group-hover:brightness-110 transition-all"
                      />
                    </span>{' '}
                    الأفضل في القاهرة.
                  </>
                ) : (
                  <> <TranslatedText text="YOUR BEST" />{' '}
                    <span className="inline-flex items-center align-middle mx-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-inner group hover:scale-105 transition-all duration-300 cursor-pointer">
                      <img
                        src="/images/hero/hero_smile_pill.jpg"
                        alt="Healthy Smile"
                        className="w-12 h-6 sm:w-16 sm:h-8 rounded-full object-cover shadow-sm group-hover:brightness-110 transition-all"
                      />
                    </span>{' '} <TranslatedText text="DENTAL HEALTH COMPANION." /> </>
                )}
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl drop-shadow-sm">
                {localizedText(isAr ? 'ar' : 'en', 'text_4fb1ae0315')}
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/book"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#F28C28] to-[#E07A18] hover:from-[#E07A18] hover:to-[#C96A12] text-white text-sm font-extrabold uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2.5 group"
                >
                  <Calendar className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_3465a71f43')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/services"
                  className="px-7 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-white text-[#0c2438] flex items-center justify-center text-xs font-bold">
                    ▶
                  </div>
                  <span>{localizedText(isAr ? 'ar' : 'en', 'text_e3ab8b436a')}</span>
                </Link>
              </div>

              {/* Integrated Quick Booking Triage Widget (Matching Reference 2) */}
              <div className="pt-4 max-w-2xl">
                <form
                  onSubmit={handleQuickBookSubmit}
                  className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/25 shadow-2xl space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-white/90 pb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-300" />
                      {localizedText(isAr ? 'ar' : 'en', 'text_00119de47b')}
                    </span>
                    <span className="text-xs text-white/70">
                      {localizedText(isAr ? 'ar' : 'en', 'text_2281df1720')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* 1. Date */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <LocalizedInput
                        type="date"
                        aria-label="Preferred Date"
                        value={quickDate}
                        onChange={(e) => setQuickDate(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/15 pl-9 pr-3 py-2.5 text-xs font-semibold text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#2446A6] transition-all"
                      />
                    </div>

                    {/* 2. Specialty */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <LocalizedSelect
                        aria-label="Select Treatment Category"
                        value={quickSpecialty}
                        onChange={(e) => setQuickSpecialty(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/15 pl-9 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#2446A6] transition-all appearance-none cursor-pointer"
                      >
                        <option value="all" className="text-slate-900">
                          {localizedText(isAr ? 'ar' : 'en', 'text_a638f5b02c')}
                        </option>
                        <option value="restorative-fillings" className="text-slate-900">
                          {localizedText(isAr ? 'ar' : 'en', 'text_1d66a7e192')}
                        </option>
                        <option value="dental-implants" className="text-slate-900">
                          {localizedText(isAr ? 'ar' : 'en', 'text_0f5794b81b')}
                        </option>
                        <option value="orthodontics-aligners" className="text-slate-900">
                          {localizedText(isAr ? 'ar' : 'en', 'text_e48148632d')}
                        </option>
                        <option value="cosmetic-dentistry" className="text-slate-900">
                          {localizedText(isAr ? 'ar' : 'en', 'text_7184e1fc84')}
                        </option>
                      </LocalizedSelect>
                      <ChevronDown className="w-3.5 h-3.5 text-white/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* 3. Branch */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <LocalizedSelect
                        aria-label="Select Cairo Branch"
                        value={quickBranch}
                        onChange={(e) => setQuickBranch(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/15 pl-9 pr-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#2446A6] transition-all appearance-none cursor-pointer"
                      >
                        {CLINIC_BRANCHES.map((b) => (
                          <option key={b.code} value={b.code} className="text-slate-900">
                            {isAr ? b.nameAr : b.nameEn}
                          </option>
                        ))}
                      </LocalizedSelect>
                      <ChevronDown className="w-3.5 h-3.5 text-white/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* 4. Search CTA */}
                    <div>
                      <button
                        type="submit"
                        className="w-full h-full min-h-[38px] rounded-xl bg-white hover:bg-[#F28C28] text-[#0c2438] hover:text-white text-xs font-extrabold tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg hover:scale-105"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>{localizedText(isAr ? 'ar' : 'en', 'text_494d2fba2d')}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Visual Floating Elements Column (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[340px] sm:min-h-[420px] flex flex-col justify-between">
              
              {/* 1. Top-Left Floating Card with SVG Connector Line (Matching Reference 1) */}
              <div className="relative self-start sm:-ml-4 lg:-ml-10 z-20 animate-float-gentle">
                <div className="p-4 rounded-2xl bg-[#0c2438]/80 backdrop-blur-xl border border-white/25 shadow-2xl max-w-xs text-white group hover:border-emerald-400/60 transition-all duration-300">
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {localizedText(isAr ? 'ar' : 'en', 'text_926f3a7745')}
                  </p>
                </div>

                {/* Curved SVG Connector Line pointing toward the patient smile */}
                <svg
                  className="absolute -right-24 top-1/2 w-28 h-20 pointer-events-none hidden lg:block overflow-visible"
                  viewBox="0 0 120 70"
                  fill="none"
                >
                  <circle cx="4" cy="35" r="4" fill="#34D399" className="animate-ping" />
                  <circle cx="4" cy="35" r="3" fill="#34D399" />
                  <path
                    d="M4 35 C 45 35, 65 65, 115 65"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="115" cy="65" r="4" fill="#F28C28" />
                </svg>
              </div>

              {/* 2. Top-Right Specialist Feature Card (Matching Reference 1 & 2) */}
              <div className="self-end mt-4 sm:mt-0 z-20 animate-float-delayed">
                <div className="p-3.5 rounded-2xl bg-white text-slate-900 shadow-2xl border border-white/80 max-w-xs flex items-center gap-3.5 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <Image
                      src="/images/dentists/dr_sandy_saad.jpg"
                      alt="Doctor Consultation"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2446A6] block">
                      {localizedText(isAr ? 'ar' : 'en', 'text_d266065936')}
                    </span>
                    <h2 className="text-xs font-bold text-slate-900 leading-snug">
                      {localizedText(isAr ? 'ar' : 'en', 'text_6325a2ce00')}
                    </h2>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#F28C28] group-hover:text-[#C96A12] mt-0.5"
                    >
                      <span>{localizedText(isAr ? 'ar' : 'en', 'text_c5102722c4')}</span>
                      <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                        ↗
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. Bottom-Right Social Proof & Trust Card (Matching Reference 1 & 2) */}
              <div className="self-end mt-6 sm:mt-12 z-20 animate-float-gentle">
                <div className="p-3.5 rounded-2xl bg-[#0c2438]/85 backdrop-blur-xl border border-white/20 shadow-2xl max-w-xs text-white hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden shrink-0">
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="/images/hero/avatar_1.jpg"
                        alt="Patient 1"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="/images/hero/avatar_2.jpg"
                        alt="Patient 2"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="/images/hero/avatar_3.jpg"
                        alt="Patient 3"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                        src="/images/hero/avatar_4.jpg"
                        alt="Patient 4"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">
                        {localizedText(isAr ? 'ar' : 'en', 'text_cc465bf784')}
                      </span>
                      <span className="text-xs text-slate-300 block leading-tight">
                        {localizedText(isAr ? 'ar' : 'en', 'text_3a0b7a49a4')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Category Pills Dock (Matching Mockup 2 bottom edge) */}
              <div className="mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2 self-start sm:self-center z-20">
                {['Orthodontics', 'Endodontics', 'Prosthodontics', 'Periodontics'].map((cat) => (
                  <Link
                    key={cat}
                    href="/services"
                    className="px-3 py-1 rounded-full bg-white/15 hover:bg-white text-white hover:text-[#0c2438] text-xs font-bold backdrop-blur-md border border-white/20 transition-all duration-200 shadow-sm"
                  >
                    {cat}
                  </Link>
                ))}
                <Link
                  href="/services"
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#0c2438] flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                  title="View All Dental Disciplines"
                >
                  🦷
                </Link>
              </div>

            </div>

          </div>
        </div>

        {/* D. Hero Bottom Metric Bar (Matching Reference 1 Footer Strip) */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 mt-6 border-t border-white/15">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-white/90">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">01</span>
              <div>
                <span className="text-xs font-bold block text-white">
                  {localizedText(isAr ? 'ar' : 'en', 'text_6b0fc686b9')}
                </span>
                <span className="text-xs text-white/60 block">
                  {localizedText(isAr ? 'ar' : 'en', 'text_e857b1924d')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:border-x sm:border-white/15 sm:px-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">02</span>
              <div>
                <span className="text-xs font-bold block text-white">
                  {localizedText(isAr ? 'ar' : 'en', 'text_612a414e7d')}
                </span>
                <span className="text-xs text-white/60 block">
                  {localizedText(isAr ? 'ar' : 'en', 'text_ddad875290')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">03</span>
              <div>
                <span className="text-xs font-bold block text-white">
                  {localizedText(isAr ? 'ar' : 'en', 'text_c68152636f')}
                </span>
                <span className="text-xs text-white/60 block">
                  {localizedText(isAr ? 'ar' : 'en', 'text_a4fd54093e')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 2. SMILE SOLUTIONS FOR EVERY NEED — SECTION 2 (Matching Reference 2) */}
      <section className="py-16 bg-white border-b border-slate-200/80 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#2446A6] font-extrabold block mb-1">
                {localizedText(isAr ? 'ar' : 'en', 'text_b2b91e6dbe')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E] tracking-tight">
                {localizedText(isAr ? 'ar' : 'en', 'text_cc99ae0c53')}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
                {localizedText(isAr ? 'ar' : 'en', 'text_dd67411ff5')}
              </p>
            </div>

            {/* Quick Feature Pills matching Reference 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs">
                  {localizedText(isAr ? 'ar' : 'en', 'text_76fe0839d2')}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs">
                  {localizedText(isAr ? 'ar' : 'en', 'text_8e16010b12')}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs">
                  {localizedText(isAr ? 'ar' : 'en', 'text_3202e0fbc2')}
                </span>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1356CC] hover:underline whitespace-nowrap"
              >
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_3f7d71b85f')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {/* 1. General Dentistry */}
            <Link
              href="/services/general-dentistry"
              className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 hover:border-[#1356CC]/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#1356CC] flex items-center justify-center shadow-2xs mb-3 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-5 h-5 text-sky-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#102A5E] group-hover:text-[#1356CC] transition-colors">
                  {localizedText(isAr ? 'ar' : 'en', 'text_2e2fcd5008')}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {localizedText(isAr ? 'ar' : 'en', 'text_db8c1c60ca')}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="w-5 h-5 rounded-full bg-white text-slate-400 group-hover:bg-[#1356CC] group-hover:text-white flex items-center justify-center text-xs shadow-2xs transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* 2. Cosmetic Dentistry */}
            <Link
              href="/services/cosmetic-dentistry"
              className="p-4 rounded-2xl bg-[#FFFBEB] border border-amber-100 hover:border-[#F59B20]/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#F59B20] flex items-center justify-center shadow-2xs mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#102A5E] group-hover:text-[#F59B20] transition-colors">
                  {localizedText(isAr ? 'ar' : 'en', 'text_8c5a67c6d3')}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {localizedText(isAr ? 'ar' : 'en', 'text_a9a6df57d4')}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="w-5 h-5 rounded-full bg-white text-slate-400 group-hover:bg-[#F59B20] group-hover:text-white flex items-center justify-center text-xs shadow-2xs transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* 3. Restorative Dentistry */}
            <Link
              href="/services/restorative-fillings"
              className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-100 hover:border-[#18794E]/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#18794E] flex items-center justify-center shadow-2xs mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#102A5E] group-hover:text-[#18794E] transition-colors">
                  {localizedText(isAr ? 'ar' : 'en', 'text_433a561512')}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {localizedText(isAr ? 'ar' : 'en', 'text_f76d8c753f')}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="w-5 h-5 rounded-full bg-white text-slate-400 group-hover:bg-[#18794E] group-hover:text-white flex items-center justify-center text-xs shadow-2xs transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* 4. Pediatric Dentistry */}
            <Link
              href="/services/pediatric-dentistry"
              className="p-4 rounded-2xl bg-[#FDF2F8] border border-pink-100 hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-pink-500 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-pink-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#102A5E] group-hover:text-pink-600 transition-colors">
                  {localizedText(isAr ? 'ar' : 'en', 'text_60da81f1ea')}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {localizedText(isAr ? 'ar' : 'en', 'text_1236fbc690')}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="w-5 h-5 rounded-full bg-white text-slate-400 group-hover:bg-pink-500 group-hover:text-white flex items-center justify-center text-xs shadow-2xs transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* 5. Orthodontics */}
            <Link
              href="/services/orthodontics"
              className="p-4 rounded-2xl bg-[#FAF5FF] border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 text-purple-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#102A5E] group-hover:text-purple-600 transition-colors">
                  {localizedText(isAr ? 'ar' : 'en', 'text_b07c25a730')}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {localizedText(isAr ? 'ar' : 'en', 'text_944b443541')}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="w-5 h-5 rounded-full bg-white text-slate-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center text-xs shadow-2xs transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* 6. Oral Surgery */}
            <Link
              href="/services/dental-implants"
              className="p-4 rounded-2xl bg-[#F0FDFA] border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-teal-600 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-teal-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#102A5E] group-hover:text-teal-600 transition-colors">
                  {localizedText(isAr ? 'ar' : 'en', 'text_7b666bc9fd')}
                </h3>
                <p className="text-xs text-slate-500 leading-snug">
                  {localizedText(isAr ? 'ar' : 'en', 'text_cf39d3f5cc')}
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="w-5 h-5 rounded-full bg-white text-slate-400 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center text-xs shadow-2xs transition-colors">
                  →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL SPLIT SECTION: PHILOSOPHY & CLINICAL RIGOR (Matches Benchmark) */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4169E1] font-bold"> <TranslatedText text="[ PHILOSOPHY & CLINICAL RIGOR ]" /> </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold text-[#102A5E] tracking-tight leading-[1.2]">
              {localizedText(isAr ? 'ar' : 'en', 'text_09bebd354c')}
            </h2>

            <p className="text-base text-slate-600 leading-relaxed font-light">
              {localizedText(isAr ? 'ar' : 'en', 'text_e468e18e9d')}
            </p>

            {/* Two Benchmark Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_a1bd9c82e1')}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {localizedText(isAr ? 'ar' : 'en', 'text_c21ecbb823')}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] text-[#4169E1] flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#102A5E]">
                  {localizedText(isAr ? 'ar' : 'en', 'text_988f0dabbb')}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {localizedText(isAr ? 'ar' : 'en', 'text_963863b342')}
                </p>
              </div>
            </div>

            {/* Key Quality Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1]" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_3e69584a8a')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1]" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_d94e7ea361')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4169E1]" />
                <span>{localizedText(isAr ? 'ar' : 'en', 'text_dd1354430e')}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Photographic Card with Overlapping Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/5] bg-slate-900">
              <Image
                src="/images/branches/branch_heliopolis.jpg"
                alt="Modern Ebtesamty Operatory in Heliopolis"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              {/* Top Floating Badge */}
              <div className="absolute top-5 start-5 end-5 flex justify-between items-center">
                <div className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4169E1]" />
                  <span className="text-xs font-bold text-[#102A5E]">
                    {localizedText(isAr ? 'ar' : 'en', 'text_33937910e7')}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#102A5E]/90 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                  {localizedText(isAr ? 'ar' : 'en', 'text_f4821c5737')}
                </div>
              </div>

              {/* Bottom Overlapping Card */}
              <div className="absolute bottom-5 start-5 end-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#4169E1] text-white flex items-center justify-center font-bold text-xs">
                      EMPI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#102A5E]">
                        {localizedText(isAr ? 'ar' : 'en', 'text_06b19928ab')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {localizedText(isAr ? 'ar' : 'en', 'text_8eff1a8409')}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/about"
                    className="p-2 rounded-lg bg-[#F7FAFF] text-[#4169E1] hover:bg-[#EAF3FF] transition-colors"
                    aria-label="Learn more about our clinic"
                  >
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION [ 01 • CLINICAL DISCIPLINES ] — 6 Photo Cards */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#4169E1] font-bold"> <TranslatedText text="[ 01 • CLINICAL DISCIPLINES ]" /> </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#102A5E] mt-1 tracking-tight">
                {localizedText(isAr ? 'ar' : 'en', 'text_b0f4f7cbeb')}
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl">
                {localizedText(isAr ? 'ar' : 'en', 'text_eae3d84281')}
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#4169E1] hover:text-[#2446A6] uppercase tracking-wider"
            >
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_32d2840f71')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CLINIC_SERVICES.slice(0, 6).map((service) => (
              <div
                key={service.slug}
                className="group rounded-3xl border border-slate-200/90 bg-[#F7FAFF] overflow-hidden hover:border-[#4169E1] hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={service.image || '/images/service_restorative.jpg'}
                      alt={service.nameEn}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3.5 start-3.5 end-3.5 flex justify-between items-center">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/95 text-[#102A5E] backdrop-blur-sm shadow-sm">
                        {isAr ? service.categoryAr : service.categoryEn}
                      </span>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{service.durationMinutes} <TranslatedText text="min" /></span>
                      </span>
                    </div>

                    {/* Bottom Price on Image */}
                    <div className="absolute bottom-3 start-3.5">
                      <span className="text-xs font-bold text-white tracking-wide drop-shadow">
                        {isAr ? `يبدأ من ${service.startingPriceEgp} ج.م` : `From EGP ${service.startingPriceEgp.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-[#102A5E] group-hover:text-[#4169E1] transition-colors leading-snug">
                      {isAr ? service.nameAr : service.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {isAr ? service.shortDescAr : service.shortDescEn}
                    </p>

                    {/* Key Procedure Checkpoints */}
                    <ul className="pt-2 space-y-1.5 text-xs text-slate-600">
                      {(isAr ? service.processStepsAr : service.processStepsEn).slice(0, 2).map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0 border-t border-slate-200/60 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {localizedText(isAr ? 'ar' : 'en', 'text_71e1906ca4')}
                    <strong className="text-[#102A5E]">
                      {service.availableBranchCodes.join(', ')}
                    </strong>
                  </span>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-xs font-bold text-[#4169E1] hover:text-[#102A5E] inline-flex items-center gap-1 group-hover:underline"
                  >
                    <span>{localizedText(isAr ? 'ar' : 'en', 'text_b593076086')}</span>
                    <span className="text-xs">↗</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION [ 02 • INTERACTIVE CLINICAL PROTOCOLS ] (Matches Benchmark) */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#4169E1] font-bold"> <TranslatedText text="[ 02 • INTERACTIVE CLINICAL PROTOCOLS ]" /> </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#102A5E] mt-1 tracking-tight">
            {localizedText(isAr ? 'ar' : 'en', 'text_6f9dbe6609')}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {localizedText(isAr ? 'ar' : 'en', 'text_ba5dc97e46')}
          </p>

          {/* Interactive Protocol Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-6">
            {(
              [
                { id: 'restorative', labelEn: 'Restorative & Endodontics', labelAr: 'علاج الجذور والتحفظي' },
                { id: 'implants', labelEn: 'Implants & Oral Rehabilitation', labelAr: 'زراعة الأسنان والجراحة' },
                { id: 'ortho', labelEn: 'Orthodontics & Clear Aligners', labelAr: 'التقويم والقوالب الشفافة' },
                { id: 'cosmetic', labelEn: 'Cosmetic & Biomimetic Veneers', labelAr: 'تجميل الابتسامة والفينير' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveProtocol(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeProtocol === tab.id
                    ? 'bg-[#4169E1] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-[#102A5E]'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Protocol Showcase Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>{isAr ? activeProto.tagAr : activeProto.tagEn}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#102A5E] leading-tight">
                {isAr ? activeProto.titleAr : activeProto.titleEn}
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed font-light">
                {isAr ? activeProto.descriptionAr : activeProto.descriptionEn}
              </p>

              {/* Checkpoints */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {localizedText(isAr ? 'ar' : 'en', 'text_7fe83617cc')}
                </div>
                {(isAr ? activeProto.checkpointsAr : activeProto.checkpointsEn).map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-[#EAF3FF] text-[#4169E1] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      0{i + 1}
                    </div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* Specialist Attribution */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-500">
                    {localizedText(isAr ? 'ar' : 'en', 'text_b555c72b22')}
                  </div>
                  <div className="text-xs font-bold text-[#102A5E]">
                    {isAr ? activeProto.specialistAr : activeProto.specialistEn}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-xs text-slate-500">
                    {localizedText(isAr ? 'ar' : 'en', 'text_71bc13d09c')}
                  </div>
                  <div className="text-xs font-bold text-[#4169E1]">
                    {isAr ? activeProto.durationAr : activeProto.durationEn}
                  </div>
                </div>
                <Link
                  href="/book"
                  className="px-5 py-2.5 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {localizedText(isAr ? 'ar' : 'en', 'text_3993c802b9')}
                </Link>
              </div>
            </div>

            {/* Right Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] bg-slate-900">
                <Image
                  src={activeProto.image}
                  alt={activeProto.titleEn}
                  fill
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 start-4 end-4 text-white">
                  <div className="text-xs font-bold">
                    {localizedText(isAr ? 'ar' : 'en', 'text_bdba8d8de3')}
                  </div>
                  <div className="text-xs text-slate-300">
                    {localizedText(isAr ? 'ar' : 'en', 'text_7bb0228659')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION [ 03 • SEAMLESS CARE PATHWAY ] — 4 Numbered Steps */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold"> <TranslatedText text="[ 03 • SEAMLESS CARE PATHWAY ]" /> </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold mt-1 tracking-tight">
              {localizedText(isAr ? 'ar' : 'en', 'text_04b3fbf39e')}
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              {localizedText(isAr ? 'ar' : 'en', 'text_1ee9747c42')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                titleEn: 'Digital Triage & Booking',
                titleAr: 'الحجز والفرز الإلكتروني',
                descEn:
                  'Reserve your preferred Cairo branch and specialist in under 2 minutes with instant live slot confirmation.',
                descAr:
                  'اختر الفرع والطبيب والوقت الأنسب لك في أقل من دقيقتين مع تأكيد فوري للموعد.',
              },
              {
                num: '02',
                titleEn: 'Microscopic Diagnostics',
                titleAr: 'الفحص الميكروسكوبي الدقيق',
                descEn:
                  'Full 32-tooth FDI odontogram charting, low-radiation digital radiography, and periodontal screening.',
                descAr:
                  'فحص شامل لكل سن على مخطط FDI الرقمي وأشعة رقمية تشخيصية منخفضة الإشعاع.',
              },
              {
                num: '03',
                titleEn: 'Written EGP Plan',
                titleAr: 'خطة علاج وتسعير مكتوبة',
                descEn:
                  'Receive a transparent, itemized treatment proposal in Egyptian Pounds before any dental work begins.',
                descAr:
                  'استلم خطة علاج مفصلة مكتوبة بالجنيه المصري وعدد الجلسات قبل البدء في أي علاج.',
              },
              {
                num: '04',
                titleEn: 'Precision Care & Recall',
                titleAr: 'العلاج الدقيق والمتابعة',
                descEn:
                  'Biomimetic execution followed by automated continuing recall across our 3 synchronized branches.',
                descAr:
                  'تنفيذ العلاج بأعلى معايير الدقة ومتابعة دورية لحماية أسنانك عبر ملفك الموحد.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-serif text-3xl font-light text-amber-400 mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {isAr ? step.titleAr : step.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {isAr ? step.descAr : step.descEn}
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>{isAr ? `المرحلة ${step.num}` : `Phase ${step.num}`}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION [ 04 • PRACTICE LOCATIONS ] — 3 Real Cairo Branches */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#4169E1] font-bold"> <TranslatedText text="[ 04 • PRACTICE LOCATIONS ]" /> </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#102A5E] mt-1 tracking-tight">
              {localizedText(isAr ? 'ar' : 'en', 'text_8f49470579')}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {localizedText(isAr ? 'ar' : 'en', 'text_193f5f6605')}
            </p>
          </div>
          <Link
            href="/branches"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#4169E1] hover:text-[#2446A6] uppercase tracking-wider"
          >
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_f2e3434fa9')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CLINIC_BRANCHES.map((branch) => {
            const branchDocs = CLINIC_DENTISTS.filter((d) => d.branchCode === branch.code);
            return (
              <div
                key={branch.code}
                className="group rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-[#4169E1] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-52 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={branch.image || '/images/branches/branch_heliopolis.jpg'}
                      alt={branch.nameEn}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    <div className="absolute top-3.5 start-3.5 end-3.5 flex justify-between items-center">
                      <span className="text-xs font-bold px-3 py-1 rounded-md bg-[#102A5E] text-white shadow-sm">
                        {branch.code}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/95 text-[#4169E1] backdrop-blur-sm shadow-sm">
                        {branch.operatoriesCount} {localizedText(isAr ? 'ar' : 'en', 'text_01ef946215')}
                      </span>
                    </div>

                    <div className="absolute bottom-3 start-3.5 end-3.5 text-white">
                      <h3 className="text-lg font-bold drop-shadow">
                        {isAr ? branch.nameAr : branch.nameEn}
                      </h3>
                      <p className="text-xs text-slate-200 truncate">
                        {isAr ? branch.districtAr : branch.districtEn}
                      </p>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="p-6 space-y-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{isAr ? branch.addressAr : branch.addressEn}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#4169E1] shrink-0" />
                      <a href={`tel:${branch.phone}`} className="font-semibold text-[#102A5E] hover:text-[#4169E1]">
                        {branch.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-[#4169E1] shrink-0" />
                      <span>{isAr ? branch.hoursAr : branch.hoursEn}</span>
                    </div>

                    {/* Assigned Dentists */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-xs font-bold text-[#102A5E] mb-2">
                        {localizedText(isAr ? 'ar' : 'en', 'text_4aba9bb6ff')}
                      </div>
                      <div className="space-y-1.5">
                        {branchDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#102A5E]">
                              {isAr ? doc.nameAr : doc.nameEn}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {isAr ? doc.specialtyAr : doc.specialtyEn}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-0 border-t border-slate-100 grid grid-cols-2 gap-2 mt-4">
                  <Link
                    href={`/branches/${branch.code}`}
                    className="py-2.5 px-3 rounded-xl bg-[#F7FAFF] text-[#102A5E] hover:bg-[#EAF3FF] text-xs font-bold text-center transition-colors"
                  >
                    {localizedText(isAr ? 'ar' : 'en', 'text_078e185100')}
                  </Link>
                  <Link
                    href={`/book?branch=${branch.code}`}
                    className="py-2.5 px-3 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold text-center transition-colors shadow-sm"
                  >
                    {localizedText(isAr ? 'ar' : 'en', 'text_9fbd6308a4')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. SECTION [ 05 • CLINICAL FACULTY ] — 5 Real Specialist Portraits */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#4169E1] font-bold"> <TranslatedText text="[ 05 • CLINICAL FACULTY ]" /> </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#102A5E] mt-1 tracking-tight">
                {localizedText(isAr ? 'ar' : 'en', 'text_c53dc8fcdf')}
              </h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xl">
                {localizedText(isAr ? 'ar' : 'en', 'text_70b901677a')}
              </p>
            </div>
            <Link
              href="/dentists"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#4169E1] hover:text-[#2446A6] uppercase tracking-wider"
            >
              <span>{localizedText(isAr ? 'ar' : 'en', 'text_1370a26cdc')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {CLINIC_DENTISTS.map((doc) => (
              <div
                key={doc.id}
                className="group rounded-3xl border border-slate-200/90 bg-[#F7FAFF] overflow-hidden hover:border-[#4169E1] hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Real Portrait Photo */}
                  <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={doc.image || '/images/dentists/dr_sandy_saad.jpg'}
                      alt={doc.nameEn}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 end-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#102A5E] text-white">
                        {doc.branchCode}
                      </span>
                    </div>

                    <div className="absolute bottom-3 start-3 end-3 text-white">
                      <div className="text-xs text-amber-300 font-medium">
                        {isAr ? doc.titleAr : doc.titleEn}
                      </div>
                      <h3 className="text-base font-bold drop-shadow">
                        {isAr ? doc.nameAr : doc.nameEn}
                      </h3>
                    </div>
                  </div>

                  {/* Bio & Details */}
                  <div className="p-4 space-y-2 text-xs">
                    <div className="font-semibold text-[#4169E1]">
                      {isAr ? doc.specialtyAr : doc.specialtyEn}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? doc.branchNameAr : doc.branchNameEn} • {doc.experienceYears}{' '}
                      {localizedText(isAr ? 'ar' : 'en', 'text_590d91419e')}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                      {isAr ? doc.bioAr : doc.bioEn}
                    </p>
                  </div>
                </div>

                {/* Booking Button */}
                <div className="p-4 pt-0 border-t border-slate-200/60 mt-3">
                  <div className="text-xs text-slate-500 mb-2 truncate">
                    <strong>{localizedText(isAr ? 'ar' : 'en', 'text_d9b04338c2')}</strong>{' '}
                    {isAr ? doc.scheduleSummaryAr : doc.scheduleSummaryEn}
                  </div>
                  <Link
                    href={`/book?branch=${doc.branchCode}&dentist=${encodeURIComponent(doc.email)}`}
                    className="w-full py-2 px-3 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{localizedText(isAr ? 'ar' : 'en', 'text_b4bad7b5b8')}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SECTION [ 06 • PATIENT QUESTIONS ] — Clean Accordion */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#4169E1] font-bold"> <TranslatedText text="[ 06 • PATIENT QUESTIONS ]" /> </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#102A5E] mt-1 tracking-tight">
            {localizedText(isAr ? 'ar' : 'en', 'text_f81b285be5')}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {localizedText(isAr ? 'ar' : 'en', 'text_ab3af495b8')}
          </p>
        </div>

        <div className="space-y-3">
          {CLINIC_FAQS.slice(0, 5).map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-start flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <span className="text-sm font-bold text-[#102A5E] flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#EAF3FF] text-[#4169E1] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      0{index + 1}
                    </span>
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#4169E1] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed ps-14 border-t border-slate-100">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#4169E1] hover:text-[#102A5E] uppercase tracking-wider"
          >
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_f0e9bc254f')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* VERIFIED WEBSITE REVIEWS (Matching Reference Image 7: "Reviews on your website · Every review has a completed visit behind it") */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <WebsiteReviewsPhaseThree role="public" />
      </div>

      {/* 10. MIDNIGHT CTA BANNER (Matches Reference Benchmark) */}
      <section className="bg-[#0C1A30] text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#102A5E] to-[#0C1A30] border border-slate-700/60 p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {localizedText(isAr ? 'ar' : 'en', 'text_1cc6819183')}
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {localizedText(isAr ? 'ar' : 'en', 'text_547ff1d327')}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {localizedText(isAr ? 'ar' : 'en', 'text_518dad7324')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/book"
                className="px-6 py-3.5 rounded-xl bg-[#F28C28] hover:bg-[#c37b48] text-white text-xs font-bold text-center tracking-wide transition-colors shadow-lg"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_8138753933')}
              </Link>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold text-center tracking-wide transition-colors"
              >
                {localizedText(isAr ? 'ar' : 'en', 'text_a58061f672')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
