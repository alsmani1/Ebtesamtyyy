'use client';
import {localizedText} from '@/lib/interface-messages';


import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../context/LanguageContext';
import { BookOpen, CheckCircle2, Calendar, Sparkles, Clock, User, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PatientEducationPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', nameEn: 'All Guides', nameAr: 'جميع الأدلة' },
    { id: 'Aftercare', nameEn: 'Post-Op Aftercare', nameAr: 'العناية بعد الجراحة' },
    { id: 'Endodontics', nameEn: 'Root Canal Recovery', nameAr: 'علاج الجذور' },
    { id: 'Pediatric', nameEn: 'Child & Preventive', nameAr: 'أسنان الأطفال' },
    { id: 'Orthodontics', nameEn: 'Aligners & Braces', nameAr: 'التقويم والعناية' },
  ];

  const guides = [
    {
      id: 'post-op-extraction-implant',
      category: 'Aftercare',
      categoryEn: 'Post-Procedure Aftercare',
      categoryAr: 'العناية بعد الإجراءات الجراحية',
      readTime: '3 min read',
      authorName: 'Dr. Sandy Saad',
      authorTitle: 'Consultant Prosthodontics & Oral Implantology',
      authorImage: '/images/dentists/dr_sandy_saad.jpg',
      titleEn: 'First 24 Hours After Tooth Extraction or Dental Implant Surgery',
      titleAr: 'أول 24 ساعة بعد خلع الأسنان أو وضع الغرسة السنية',
      pointsEn: [
        'Bite firmly on the sterile cotton gauze for 45–60 minutes to establish a stable primary clot.',
        'Avoid hot beverages, carbonated drinks, smoking, spitting forcefully, or using straws for 48 hours.',
        'Consume cool, soft foods (yogurt, blended soups, puréed fruit) and take prescribed medications on time.',
        'Apply an ice pack to the cheek outside for 15-minute intervals to minimize tissue edema.',
      ],
      pointsAr: [
        'اضغط بثبات على الشاش المعقم لمدة 45 إلى 60 دقيقة لتمكين تكوين الجلطة الدموية الأولية.',
        'تجنب المشروبات الساخنة والغازية، والتدخين، أو المضمضة العنيفة واستخدام الشفاطة لمدة 48 ساعة.',
        'تناول أطعمة باردة ولينة والتزم بمواعيد الأدوية ومسكنات الألم الموصوفة.',
        'ضع كمادات باردة على الخد من الخارج لمدة 15 دقيقة لتقليل الانتفاخ.',
      ],
    },
    {
      id: 'rct-care',
      category: 'Endodontics',
      categoryEn: 'Endodontic Recovery',
      categoryAr: 'ما بعد علاج الجذور والعصب',
      readTime: '4 min read',
      authorName: 'Dr. Feby Samer',
      authorTitle: 'Specialist Endodontics & Micro-Restorative',
      authorImage: '/images/dentists/dr_feby_samer.jpg',
      titleEn: 'Caring for Your Tooth Following Microscopic Root Canal Therapy',
      titleAr: 'كيفية حماية السن بعد جلسة علاج العصب الميكروسكوبي',
      pointsEn: [
        'Do not chew hard, crusty, or sticky foods on the treated side until the permanent crown or onlay is placed.',
        'Mild sensitivity to pressure for 2–3 days is normal and responds well to standard NSAID therapy.',
        'Maintain gentle brushing and flossing around the temporary filling without dislodging it.',
        'Schedule your permanent restoration visit within 2–4 weeks to prevent coronal microleakage.',
      ],
      pointsAr: [
        'تجنب مضغ الأطعمة الصلبة على الجانب المعالج حتى يتم تركيب التاج الدائم لمنع كسر السن.',
        'حساسية الضغط الخفيفة لمدة يومين إلى ثلاثة أمر طبيعي وتستجيب للمسكنات الموصوفة.',
        'استمر في تنظيف الأسنان بالفرشاة بلطف حول الحشوة المؤقتة.',
        'احرص على تثبيت التاج الدائم خلال أسبوعين إلى 4 أسابيع لمنع التسرب البكتيري.',
      ],
    },
    {
      id: 'pediatric-prevention',
      category: 'Pediatric',
      categoryEn: 'Preventive & Pediatric Care',
      categoryAr: 'الوقاية وصحة أسنان الأطفال',
      readTime: '3 min read',
      authorName: 'Dr. Nadia Elhariry',
      authorTitle: 'Consultant Pediatric Dentistry',
      authorImage: '/images/dentists/dr_nadia_elhariry.jpg',
      titleEn: 'Preventing Early Childhood Caries & Protecting 6-Year Molars',
      titleAr: 'الوقاية من تسوس الأطفال المبكر وحماية الضروس الدائمة الأولى',
      pointsEn: [
        'Schedule a child’s first diagnostic dental visit by age 1 or within 6 months of primary tooth eruption.',
        'Apply clinical resin fissure sealants on permanent 6-year molars promptly upon complete eruption.',
        'Brush twice daily with age-appropriate fluoride toothpaste under parental supervision until age 8.',
        'Limit sticky candies, sodas, and sweet drinks before bedtime.',
      ],
      pointsAr: [
        'احرص على أول فحص لأسنان طفلك عند عمر سنة أو خلال 6 أشهر من بزوغ أول سن.',
        'تطبيق المادة الواقية للشقوق (Fissure Sealants) على الضروس الدائمة فور اكتمال بزوغها.',
        'تفريش الأسنان مرتين يومياً بمعجون فلورايد مخصص تحت إشراف الوالدين حتى عمر 8 سنوات.',
        'تقليل السكريات والمشروبات المحلاة خاصة قبل النوم.',
      ],
    },
    {
      id: 'ortho-hygiene',
      category: 'Orthodontics',
      categoryEn: 'Orthodontic Hygiene',
      categoryAr: 'العناية بالتقويم والشفاف',
      readTime: '3 min read',
      authorName: 'Dr. Ahmed Hassan',
      authorTitle: 'Specialist Orthodontics & Clear Aligners',
      authorImage: '/images/dentists/dr_ahmed_hassan.jpg',
      titleEn: 'Daily Hygiene Protocol for Fixed Braces and Clear Aligner Trays',
      titleAr: 'النظافة اليومية مع أجهزة التقويم الثابت أو القوالب الشفافة',
      pointsEn: [
        'Wear clear aligners 20–22 hours daily, removing them strictly for eating and brushing.',
        'Use interdental brushes or an oral irrigator daily to dislodge plaque between orthodontic brackets.',
        'Clean aligner trays with cool running water—never hot water, which warps medical polymers.',
        'Attend scheduled review appointments on time to keep aligner staging on target.',
      ],
      pointsAr: [
        'ارتدِ قوالب التقويم الشفاف 20–22 ساعة يومياً وانزعها فقط أثناء الوجبات وتفريش الأسنان.',
        'استخدم فرشاة ما بين الأسنان أو جهاز الخيط المائي لتنظيف البلاك حول الحواصر المعدنية.',
        'اغسل القوالب الشفافة بماء بارد وتجنب الماء الساخن للحفاظ على دقة القياس.',
        'التزم بمواعيد المتابعة الدورية لضمان تقدم حركة الأسنان وفق الخطة.',
      ],
    },
  ];

  const filteredGuides = selectedCategory === 'ALL'
    ? guides
    : guides.filter(g => g.category === selectedCategory);

  return (
    <div className="bg-[#F7FAFF] min-h-screen py-10 lg:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Header */}
        <div className="bg-white rounded-3xl border border-[#D8E0DC] p-8 sm:p-10 shadow-sm space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3FF] text-[#4169E1] text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{localizedText(isAr ? 'ar' : 'en', 'text_579d4278d9')}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A5E] tracking-tight">
            {localizedText(isAr ? 'ar' : 'en', 'text_87bbda26e1')}
          </h1>
          <p className="text-sm text-[#526574] leading-relaxed max-w-3xl">
            {localizedText(isAr ? 'ar' : 'en', 'text_f391d41458')}
          </p>
        </div>

        {/* Category Filter Chips */}
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

        {/* Educational Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-3xl border border-[#D8E0DC] p-6 sm:p-7 space-y-5 shadow-xs flex flex-col justify-between hover:border-[#4169E1] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold px-3 py-1 rounded-lg bg-[#EAF3FF] text-[#4169E1]">
                    {isAr ? guide.categoryAr : guide.categoryEn}
                  </span>
                  <span className="text-[#526574] flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#4169E1]" />
                    <span>{guide.readTime}</span>
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#102A5E] leading-snug">
                  {isAr ? guide.titleAr : guide.titleEn}
                </h2>

                {/* Clinical Guidance Points */}
                <ul className="space-y-2.5 text-xs text-[#526574]">
                  {(isAr ? guide.pointsAr : guide.pointsEn).map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7FAFF] border border-[#D8E0DC]/60">
                      <CheckCircle2 className="w-4 h-4 text-[#4169E1] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Author Specialist Attribution */}
              <div className="pt-4 border-t border-[#D8E0DC]/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-[#D8E0DC]">
                    <Image
                      src={guide.authorImage}
                      alt={guide.authorName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#102A5E] block">
                      {guide.authorName}
                    </span>
                    <span className="text-xs text-[#526574] block">
                      {guide.authorTitle}
                    </span>
                  </div>
                </div>

                <Link
                  href="/book"
                  className="px-3 py-1.5 rounded-xl bg-[#4169E1] text-white text-xs font-bold hover:bg-[#2446A6] transition-colors shrink-0"
                >
                  {localizedText(isAr ? 'ar' : 'en', 'text_c144a58088')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
