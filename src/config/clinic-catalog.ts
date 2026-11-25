import { SERVICES } from '@/lib/clinic-pricing';

const egp = (value: number) => value.toLocaleString('en-US');

export interface ClinicBranchData {
  code: 'BR-A' | 'BR-B' | 'BR-C';
  slug: string;
  nameEn: string;
  nameAr: string;
  shortNameEn: string;
  shortNameAr: string;
  cityEn: string;
  cityAr: string;
  districtEn: string;
  districtAr: string;
  addressEn: string;
  addressAr: string;
  landmarkEn: string;
  landmarkAr: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  hoursEn: string;
  hoursAr: string;
  operatoriesCount: number;
  receptionistNameEn: string;
  receptionistNameAr: string;
  receptionistEmail: string;
  parkingEn: string;
  parkingAr: string;
  facilitiesEn: string[];
  facilitiesAr: string[];
  googleMapsUrl: string;
  image?: string;
}

export interface ClinicDentistData {
  id: string;
  slug: string;
  email: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  specialtyEn: string;
  specialtyAr: string;
  branchCode: 'BR-A' | 'BR-B' | 'BR-C';
  branchCodes: ('BR-A' | 'BR-B' | 'BR-C')[];
  branchNameEn: string;
  branchNameAr: string;
  experienceYears: number;
  qualificationsEn: string;
  qualificationsAr: string;
  scheduleSummaryEn: string;
  scheduleSummaryAr: string;
  languagesEn: string[];
  languagesAr: string[];
  bioEn: string;
  bioAr: string;
  focusAreasEn: string[];
  focusAreasAr: string[];
  image?: string;
}

export interface ClinicServiceData {
  slug: string;
  code: string;
  categoryEn: string;
  categoryAr: string;
  nameEn: string;
  nameAr: string;
  shortDescEn: string;
  shortDescAr: string;
  overviewEn: string;
  overviewAr: string;
  whoNeedsItEn: string;
  whoNeedsItAr: string;
  startingPriceEgp: number;
  priceRangeEn: string;
  priceRangeAr: string;
  priceRangeEgp: string;
  durationMinutes: number;
  availableBranches: ('BR-A' | 'BR-B' | 'BR-C')[];
  availableBranchCodes: ('BR-A' | 'BR-B' | 'BR-C')[];
  processStepsEn: string[];
  processStepsAr: string[];
  faqs: {
    qEn: string;
    qAr: string;
    aEn: string;
    aAr: string;
  }[];
  image?: string;
}

export const CLINIC_BRANCHES: ClinicBranchData[] = [
  {
    code: 'BR-A',
    slug: 'br-a',
    nameEn: 'Minya – Branch A (Heliopolis / Corniche)',
    nameAr: 'المنيا – الفرع أ (كورنيش النيل)',
    shortNameEn: 'Minya – Branch A',
    shortNameAr: 'المنيا – فرع أ',
    cityEn: 'Minya',
    cityAr: 'المنيا',
    districtEn: 'Minya – Branch A',
    districtAr: 'المنيا – الفرع أ',
    addressEn: '14 Corniche El-Nile Street, Minya – Branch A',
    addressAr: '14 شارع كورنيش النيل، المنيا – الفرع أ',
    landmarkEn: '2 minutes walk from Minya Corniche Square',
    landmarkAr: 'دقيقتان سيراً من ميدان كورنيش المنيا',
    phone: '+20 86 234 0001',
    emergencyPhone: '+20 12 0005 4405',
    email: 'branch-a@ebtesamty.eg',
    hoursEn: 'Sat – Thu: 09:00 AM – 09:00 PM (Fri: Emergency On-Call)',
    hoursAr: 'السبت – الخميس: 09:00 ص – 09:00 م (الجمعة: طوارئ)',
    operatoriesCount: 4,
    receptionistNameEn: 'Mariam Hanna',
    receptionistNameAr: 'مريم حنا',
    receptionistEmail: 'mariam.reception@ebtesamty.dev',
    parkingEn: 'Dedicated street parking on Corniche St., Minya – Branch A.',
    parkingAr: 'تتوفر مواقف سيارات بشارع الكورنيش، المنيا – الفرع أ.',
    facilitiesEn: [
      '4 Digital Operatory Suites',
      '3D CBCT & Panoramic X-Ray Imaging',
      'Class-B Vacuum Autoclave Sterilization Room',
      'Step-Free Elevator & Wheelchair Accessible',
    ],
    facilitiesAr: [
      '4 غرف علاجية رقمية حديثة',
      'وحدة أشعة مقطعية ثلاثية الأبعاد وبانوراما',
      'غرفة تعقيم مركزي Class-B',
      'مصعد ومدخل مهيأ للكراسي المتحركة',
    ],
    googleMapsUrl: 'https://maps.google.com/?q=28.1099,30.7503',
    image: '/images/branches/branch_heliopolis.jpg',
  },
  {
    code: 'BR-B',
    slug: 'br-b',
    nameEn: 'Minya – Branch B (New Minya)',
    nameAr: 'المنيا – الفرع ب (المنيا الجديدة)',
    shortNameEn: 'Minya – Branch B',
    shortNameAr: 'المنيا – فرع ب',
    cityEn: 'Minya',
    cityAr: 'المنيا',
    districtEn: 'Minya – Branch B',
    districtAr: 'المنيا – الفرع ب',
    addressEn: 'Medical Park Premier, Central Axis, New Minya – Branch B',
    addressAr: 'ميديكال بارك بريمير، المحور المركزي، المنيا الجديدة – الفرع ب',
    landmarkEn: 'Directly opposite New Minya University Club',
    landmarkAr: 'أمام نادي جامعة المنيا الجديدة مباشرة',
    phone: '+20 86 234 0002',
    emergencyPhone: '+20 12 0005 4405',
    email: 'branch-b@ebtesamty.eg',
    hoursEn: 'Sat – Thu: 09:00 AM – 09:00 PM (Fri: Emergency On-Call)',
    hoursAr: 'السبت – الخميس: 09:00 ص – 09:00 م (الجمعة: طوارئ)',
    operatoriesCount: 5,
    receptionistNameEn: 'Sandy Abd',
    receptionistNameAr: 'ساندي عبد',
    receptionistEmail: 'sandy.reception@ebtesamty.dev',
    parkingEn: 'Dedicated underground garage inside Medical Park Premier with direct elevator access.',
    parkingAr: 'جراج سيارات خاص تحت الأرض داخل ميديكال بارك بريمير متصل بالمصاعد مباشرة.',
    facilitiesEn: [
      '5 Surgical & Orthodontic Operatory Suites',
      'CAD/CAM Intraoral 3D Scanner',
      'Dedicated Implantology & Oral Surgery Suite',
      'Underground Garage & Wheelchair Accessible',
    ],
    facilitiesAr: [
      '5 غرف جراحية وتقويم مجهزة بالكامل',
      'ماسح ضوئي رقمي ثلاثي الأبعاد للأسنان',
      'غرفة مخصصة لزراعة وجراحة الفم والفكين',
      'جراج خاص ومدخل مهيأ للكراسي المتحركة',
    ],
    googleMapsUrl: 'https://maps.google.com/?q=28.0871,30.8025',
    image: '/images/branches/branch_new_cairo.jpg',
  },
  {
    code: 'BR-C',
    slug: 'br-c',
    nameEn: 'Minya – Branch C (Taha Hussein / Maadi)',
    nameAr: 'المنيا – الفرع ج (شارع طه حسين)',
    shortNameEn: 'Minya – Branch C',
    shortNameAr: 'المنيا – فرع ج',
    cityEn: 'Minya',
    cityAr: 'المنيا',
    districtEn: 'Minya – Branch C',
    districtAr: 'المنيا – الفرع ج',
    addressEn: '78 Taha Hussein Street, Minya – Branch C',
    addressAr: '78 شارع طه حسين، المنيا – الفرع ج',
    landmarkEn: '3 minutes walk from Taha Hussein Square, Minya',
    landmarkAr: '3 دقائق سيراً من ميدان طه حسين بالمنيا',
    phone: '+20 86 234 0003',
    emergencyPhone: '+20 12 0005 4405',
    email: 'branch-c@ebtesamty.eg',
    hoursEn: 'Sat – Thu: 10:00 AM – 08:00 PM (Fri: Closed)',
    hoursAr: 'السبت – الخميس: 10:00 ص – 08:00 م (الجمعة: مغلق)',
    operatoriesCount: 3,
    receptionistNameEn: 'Salma El-Masry',
    receptionistNameAr: 'سلمى المصري',
    receptionistEmail: 'salma.reception@ebtesamty.dev',
    parkingEn: 'Street parking along Taha Hussein Street, Minya – Branch C.',
    parkingAr: 'مواقف متاحة بشارع طه حسين، المنيا – الفرع ج.',
    facilitiesEn: [
      '3 Family & Pediatric-Friendly Operatories',
      'Low-Radiation Digital Sensor X-Rays',
      'Calm Anxiety-Free Pediatric Environment',
      'Ground-Floor Accessible Entrance',
    ],
    facilitiesAr: [
      '3 غرف علاجية مهيأة للعائلة والأطفال',
      'أشعة رقمية منخفضة الإشعاع',
      'بيئة هادئة ومريحة للأطفال',
      'مدخل أرضي مهيأ لكبار السن والكراسي المتحركة',
    ],
    googleMapsUrl: 'https://maps.google.com/?q=28.1122,30.7485',
    image: '/images/branches/branch_maadi.jpg',
  },
];

export const CLINIC_DENTISTS: ClinicDentistData[] = [
  {
    id: 'doc-sandy',
    slug: 'dr-sandy-saad',
    email: 'dr.sandy@ebtesamty.dev',
    nameEn: 'Dr. Sandy Saad',
    nameAr: 'د. ساندي سعد',
    titleEn: 'Consultant of Prosthodontics & Cosmetic Dentistry',
    titleAr: 'استشاري التركيبات الثابتة وتجميل الأسنان',
    specialtyEn: 'Prosthodontics & Cosmetic Dentistry',
    specialtyAr: 'التركيبات الثابتة وتجميل الابتسامة',
    branchCode: 'BR-A',
    branchCodes: ['BR-A'],
    branchNameEn: 'Minya – Branch A',
    branchNameAr: 'المنيا – الفرع أ',
    experienceYears: 12,
    qualificationsEn: 'MSc & PhD in Fixed Prosthodontics, Ain Shams University',
    qualificationsAr: 'ماجستير ودكتوراه التركيبات الثابتة — جامعة عين شمس',
    scheduleSummaryEn: 'Sat, Mon, Tue, Thu (10:00 AM – 06:00 PM)',
    scheduleSummaryAr: 'السبت، الإثنين، الثلاثاء، الخميس (10:00 ص – 06:00 م)',
    languagesEn: ['Arabic', 'English', 'French'],
    languagesAr: ['العربية', 'الإنجليزية', 'الفرنسية'],
    bioEn:
      'Specializes in minimally invasive ceramic veneers, CAD/CAM zirconia crowns, and full-mouth rehabilitations at Branch A (Heliopolis).',
    bioAr:
      'متخصصة في عدسات الفينير التجميلية وتيجان الزيركون الرقمية وإعادة تأهيل الفم الكامل بفرع مصر الجديدة.',
    focusAreasEn: ['Digital Smile Design', 'Zirconia & E-Max Crowns', 'Ceramic Veneers'],
    focusAreasAr: ['تصميم الابتسامة الرقمي', 'تيجان الزيركون والإيماكس', 'عدسات الفينير'],
    image: '/images/dentists/dr_sandy_saad.jpg',
  },
  {
    id: 'doc-feby',
    slug: 'dr-feby-samer',
    email: 'dr.feby@ebtesamty.dev',
    nameEn: 'Dr. Feby Samer',
    nameAr: 'د. فيبي سامر',
    titleEn: 'Specialist in Microscopic Endodontics & Restorative Care',
    titleAr: 'أخصائي علاج الجذور الميكروسكوبي والعلاج التحفظي',
    specialtyEn: 'Endodontics & Root Canal Therapy',
    specialtyAr: 'علاج الجذور والعصب بالميكروسكوب',
    branchCode: 'BR-A',
    branchCodes: ['BR-A'],
    branchNameEn: 'Minya – Branch A',
    branchNameAr: 'المنيا – الفرع أ',
    experienceYears: 9,
    qualificationsEn: 'MSc in Endodontics, Cairo University',
    qualificationsAr: 'ماجستير علاج الجذور — جامعة القاهرة',
    scheduleSummaryEn: 'Sun, Tue, Wed, Thu (12:00 PM – 08:30 PM)',
    scheduleSummaryAr: 'الأحد، الثلاثاء، الأربعاء، الخميس (12:00 م – 08:30 م)',
    languagesEn: ['Arabic', 'English'],
    languagesAr: ['العربية', 'الإنجليزية'],
    bioEn:
      'Dedicated to painless single-visit microscopic root canal treatments, endodontic retreatments, and biomimetic composite restorations at Branch A (Heliopolis).',
    bioAr:
      'متخصصة في علاج العصب بدون ألم باستخدام الميكروسكوب الجراحي وإعادة علاج الجذور والحشوات التجميلية بفرع مصر الجديدة.',
    focusAreasEn: ['Microscopic Root Canal', 'Endodontic Retreatment', 'Aesthetic Fillings'],
    focusAreasAr: ['علاج العصب بالميكروسكوب', 'إعادة علاج الجذور', 'الحشوات التجميلية'],
    image: '/images/dentists/dr_feby_samer.jpg',
  },
  {
    id: 'doc-ahmed',
    slug: 'dr-ahmed-hassan',
    email: 'dr.ahmed@ebtesamty.dev',
    nameEn: 'Dr. Ahmed Hassan',
    nameAr: 'د. أحمد حسن',
    titleEn: 'Consultant of Oral & Maxillofacial Surgery & Implantology',
    titleAr: 'استشاري جراحة الفم والفكين وزراعة الأسنان',
    specialtyEn: 'Dental Implants & Oral Surgery',
    specialtyAr: 'زراعة الأسنان وجراحة الفم والفكين',
    branchCode: 'BR-B',
    branchCodes: ['BR-B'],
    branchNameEn: 'Minya – Branch B',
    branchNameAr: 'المنيا – الفرع ب',
    experienceYears: 14,
    qualificationsEn: 'PhD in Oral & Maxillofacial Surgery, Cairo University; Fellow ICOI',
    qualificationsAr: 'دكتوراه جراحة الفم والفكين — جامعة القاهرة وزمالة زراعة الأسنان',
    scheduleSummaryEn: 'Sat, Sun, Tue, Thu (11:00 AM – 07:30 PM)',
    scheduleSummaryAr: 'السبت، الأحد، الثلاثاء، الخميس (11:00 ص – 07:30 م)',
    languagesEn: ['Arabic', 'English', 'German'],
    languagesAr: ['العربية', 'الإنجليزية', 'الألمانية'],
    bioEn:
      'Leads computer-guided titanium dental implantology, sinus lifts, and surgical wisdom tooth extractions at Branch B (New Cairo).',
    bioAr:
      'يقود وحدة زراعة الأسنان الموجهة بالكمبيوتر ورفع الجيب الأنفي وخلع ضروس العقل الجراحي بفرع القاهرة الجديدة.',
    focusAreasEn: ['3D Guided Dental Implants', 'Surgical Extractions', 'Bone Grafting'],
    focusAreasAr: ['زراعة الأسنان الموجهة 3D', 'الخلع الجراحي لضرس العقل', 'تطعيم العظام'],
    image: '/images/dentists/dr_ahmed_hassan.jpg',
  },
  {
    id: 'doc-youssef',
    slug: 'dr-youssef-el-mansy',
    email: 'dr.youssef@ebtesamty.dev',
    nameEn: 'Dr. Youssef El-Mansy',
    nameAr: 'د. يوسف المنسي',
    titleEn: 'Specialist in Orthodontics & Dentofacial Orthopedics',
    titleAr: 'أخصائي تقويم الأسنان والفكين والتقويم الشفاف',
    specialtyEn: 'Orthodontics & Clear Aligners',
    specialtyAr: 'تقويم الأسنان الثابت والشفاف',
    branchCode: 'BR-B',
    branchCodes: ['BR-B'],
    branchNameEn: 'Minya – Branch B',
    branchNameAr: 'المنيا – الفرع ب',
    experienceYears: 10,
    qualificationsEn: 'MSc in Orthodontics, Alexandria University; MOrth RCSEd',
    qualificationsAr: 'ماجستير تقويم الأسنان — جامعة الإسكندرية وزمالة الكلية الملكية إدنبرة',
    scheduleSummaryEn: 'Sat, Mon, Wed, Thu (01:00 PM – 09:00 PM)',
    scheduleSummaryAr: 'السبت، الإثنين، الأربعاء، الخميس (01:00 م – 09:00 م)',
    languagesEn: ['Arabic', 'English'],
    languagesAr: ['العربية', 'الإنجليزية'],
    bioEn:
      'Provides digital 3D orthodontic treatment planning, clear aligner therapy, and adolescent/adult braces at Branch B (New Cairo).',
    bioAr:
      'متخصص في التخطيط الرقمي ثلاثي الأبعاد لتقويم الأسنان، القوالب الشفافة، والتقويم المعدني والذاتي بفرع القاهرة الجديدة.',
    focusAreasEn: ['Clear Aligners', 'Self-Ligating Braces', 'Adolescent Orthodontics'],
    focusAreasAr: ['التقويم الشفاف', 'التقويم المعدني والخزفي', 'تقويم أسنان المراهقين'],
    image: '/images/dentists/dr_youssef_elmansy.jpg',
  },
  {
    id: 'doc-nadia',
    slug: 'dr-nadia-el-hariry',
    email: 'dr.nadia@ebtesamty.dev',
    nameEn: 'Dr. Nadia El-Hariry',
    nameAr: 'د. نادية الحريري',
    titleEn: 'Consultant of Pediatric & Family Preventive Dentistry',
    titleAr: 'استشاري طب أسنان الأطفال وطب الأسنان الوقائي والعائلي',
    specialtyEn: 'Pediatric & Family Restorative Dentistry',
    specialtyAr: 'طب أسنان الأطفال والعائلة',
    branchCode: 'BR-C',
    branchCodes: ['BR-C'],
    branchNameEn: 'Minya – Branch C',
    branchNameAr: 'المنيا – الفرع ج',
    experienceYears: 11,
    qualificationsEn: 'PhD in Pediatric Dentistry & Dental Public Health, Cairo University',
    qualificationsAr: 'دكتوراه طب أسنان الأطفال والصحة العامة — جامعة القاهرة',
    scheduleSummaryEn: 'Sat – Thu (10:00 AM – 06:00 PM)',
    scheduleSummaryAr: 'السبت – الخميس (10:00 ص – 06:00 م)',
    languagesEn: ['Arabic', 'English'],
    languagesAr: ['العربية', 'الإنجليزية'],
    bioEn:
      'Provides gentle pediatric dental care, preventive fluoride/sealants, and family restorative dentistry at Branch C (Maadi).',
    bioAr:
      'تقدم رعاية متخصصة وهادئة لأسنان الأطفال، جلسات الفلورايد الوقائية، والحشوات التجميلية للعائلة بفرع المعادي.',
    focusAreasEn: ['Pediatric Dentistry', 'Preventive Sealants', 'Family Restorative Care'],
    focusAreasAr: ['طب أسنان الأطفال', 'الفلورايد والوقاية', 'الحشوات التجميلية للعائلة'],
    image: '/images/dentists/dr_nadia_elhariry.jpg',
  },
];

export const CLINIC_SERVICES: ClinicServiceData[] = [
  {
    slug: 'dental-checkups-consultations',
    code: 'SRV-CHK-01',
    categoryEn: 'Preventive & Diagnostic',
    categoryAr: 'الفحص والتشخيص الوقائي',
    nameEn: 'Comprehensive Dental Checkup & Digital X-Ray',
    nameAr: 'فحص شامل للأسنان وأشعة رقمية تشخيصية',
    shortDescEn:
      'Complete 32-tooth FDI examination, periodontal screening, digital X-ray assessment, and itemized written EGP treatment plan.',
    shortDescAr:
      'فحص إكلينيكي شامل لمخطط الأسنان واللثة مع أشعة رقمية وخطة علاج مكتوبة ومفصلة بالجنيه المصري.',
    overviewEn:
      'Every successful dental treatment starts with an accurate diagnosis. Our 45-minute comprehensive consultation includes a full tooth-by-tooth FDI odontogram inspection, gum health evaluation, oral cancer screening, and low-radiation digital radiography.',
    overviewAr:
      'يبدأ كل علاج ناجح بتشخيص دقيق. تشمل استشارتنا الشاملة فحصاً كاملاً لكل سن على مخطط FDI الرقمي، تقييم صحة اللثة، وأشعة رقمية منخفضة الإشعاع.',
    whoNeedsItEn:
      'Recommended every 6 months for routine prevention, or as the first visit for any new patient seeking a clear diagnosis and fee quote.',
    whoNeedsItAr:
      'يُنصح به كل 6 أشهر للوقاية الدورية، أو كزيارة أولى لأي مريض جديد يرغب في تشخيص دقيق وخطة أسعار مكتوبة.',
    startingPriceEgp: SERVICES.newPatient.price,
    priceRangeEn: `EGP ${egp(SERVICES.newPatient.price)}`,
    priceRangeAr: `${egp(SERVICES.newPatient.price)} ج.م`,
    priceRangeEgp: `EGP ${egp(SERVICES.newPatient.price)}`,
    durationMinutes: 45,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Review pre-visit medical history, allergies, and current medications.',
      'Perform 32-tooth FDI odontogram clinical examination and periodontal probing.',
      'Capture low-dose digital periapical or panoramic X-rays if clinically indicated.',
      'Present a written, itemized EGP treatment plan with timeline and payment options.',
    ],
    processStepsAr: [
      'مراجعة التاريخ الطبي والحساسية الدوائية المسجلة للمريض.',
      'فحص شامل للأسنان واللثة وتسجيل الملاحظات على مخطط FDI الرقمي.',
      'التقاط أشعة رقمية تشخيصية منخفضة الإشعاع عند الحاجة الإكلينيكية.',
      'تقديم خطة علاج مكتوبة ومفصلة بالتكلفة بالجنيه المصري وعدد الجلسات.',
    ],
    faqs: [
      {
        qEn: 'Does the consultation fee include a written treatment plan?',
        qAr: 'هل يشمل رسم الكشف الحصول على خطة علاج مكتوبة؟',
        aEn: 'Yes. Every patient receives an itemized written treatment plan in EGP accessible in the Patient Portal.',
        aAr: 'نعم، يحصل كل مريض على خطة علاج مفصلة بالجنيه المصري متاحة أيضاً عبر بوابة المريض.',
      },
    ],
    image: '/images/service_hygiene.jpg',
  },
  {
    slug: 'teeth-cleaning-polishing',
    code: 'SRV-HYG-02',
    categoryEn: 'Preventive & Periodontal',
    categoryAr: 'اللثة والوقاية',
    nameEn: 'Ultrasonic Scaling, Polishing & Periodontal Care',
    nameAr: 'تنظيف الجير بالموجات فوق الصوتية وتلميع الأسنان',
    shortDescEn:
      'Gentle ultrasonic calculus removal, airflow stain polishing, and protective fluoride remineralization.',
    shortDescAr:
      'إزالة التكلسات الجيرية بالموجات فوق الصوتية وتلميع التصبغات السطحية مع تطبيق الفلورايد الواقي.',
    overviewEn:
      'Professional ultrasonic scaling removes hardened supragingival and subgingival calculus that daily brushing cannot reach, eliminating gum inflammation and halitosis while restoring natural enamel luster.',
    overviewAr:
      'يعمل تنظيف الجير بالموجات فوق الصوتية على إزالة الرواسب الجيرية فوق وتحت اللثة، مما يعالج التهاب ونزيف اللثة ويعيد للأسنان لمعانها الطبيعي.',
    whoNeedsItEn:
      'Patients experiencing bleeding gums during brushing, coffee/tea staining, or due for their 6-month preventive hygiene recall.',
    whoNeedsItAr:
      'المرضى الذين يعانون من نزيف اللثة أثناء التفريش أو تصبغات القهوة والشاي أو موعد المتابعة الوقائية نصف السنوية.',
    startingPriceEgp: SERVICES.scaling.price,
    priceRangeEn: `EGP ${egp(SERVICES.scaling.price)}`,
    priceRangeAr: `${egp(SERVICES.scaling.price)} ج.م`,
    priceRangeEgp: `EGP ${egp(SERVICES.scaling.price)}`,
    durationMinutes: 45,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Periodontal pocket screening and gum inflammation assessment.',
      'Piezoelectric ultrasonic scaling to gently detach tartar and plaque.',
      'Prophy paste & AirFlow polishing to remove extrinsic tea/coffee stains.',
      'Optional topical fluoride varnish application and personalized hygiene coaching.',
    ],
    processStepsAr: [
      'فحص جيوب اللثة وتقييم درجة الالتهاب.',
      'إزالة الجير والترسبات بلطف باستخدام جهاز الموجات فوق الصوتية.',
      'تلميع الأسنان وإزالة التصبغات السطحية.',
      'تطبيق طبقة الفلورايد المقوية للمينا وتقديم إرشادات العناية المنزلية.',
    ],
    faqs: [
      {
        qEn: 'Does ultrasonic scaling weaken tooth enamel?',
        qAr: 'هل تنظيف الجير يضعف طبقة مينا الأسنان؟',
        aEn: 'No. Ultrasonic tips vibrate strictly against brittle calculus deposits without cutting or thinning healthy tooth enamel.',
        aAr: 'لا إطلاقاً، فالموجات فوق الصوتية تفتت التكلسات الجيرية الملتصقة فقط دون المساس بطبقة المينا السليمة.',
      },
    ],
    image: '/images/service_hygiene.jpg',
  },
  {
    slug: 'composite-filling-restoration',
    code: 'SRV-REST-03A',
    categoryEn: 'Restorative Dentistry',
    categoryAr: 'العلاج التحفظي والحشوات',
    nameEn: 'Composite Restoration / Filling (Per Tooth)',
    nameAr: 'حشو تجميلي كمبوزيت (للسن الواحد)',
    shortDescEn:
      'Tooth-colored nano-hybrid composite restoration matched to your natural enamel shade.',
    shortDescAr:
      'حشوات كمبوزيت تجميلية ضوئية مطابقة للون وشكل السن الطبيعي.',
    overviewEn:
      'Minimally invasive caries removal and biomimetic layered composite restoration.',
    overviewAr:
      'إزالة التسوس وبناء السن بطبقات الكمبوزيت التجميلي عالي المقاومة.',
    whoNeedsItEn: 'Patients with dental cavities, chipped enamel, or old amalgam fillings.',
    whoNeedsItAr: 'المرضى الذين يعانون من تسوس الأسنان أو كسر الحشوات.',
    startingPriceEgp: SERVICES.filling.price,
    priceRangeEn: `EGP ${egp(SERVICES.filling.price)} per tooth`,
    priceRangeAr: `${egp(SERVICES.filling.price)} ج.م للسن`,
    priceRangeEgp: `EGP ${egp(SERVICES.filling.price)}`,
    durationMinutes: 45,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Local anesthesia and rubber dam isolation.',
      'Conservative caries removal.',
      'Layered nano-hybrid composite bonding and curing.',
      'Anatomical occlusal shaping and high-gloss polishing.',
    ],
    processStepsAr: [
      'تخدير موضعي وعزل السن بالحاجز المطاطي.',
      'إزالة التسوس مع الحفاظ على نسيج السن السليم.',
      'بناء الحشوة التجميلية على طبقات وتثبيتها بالضوء.',
      'ضبط الإطباق وتلميع الحشوة.',
    ],
    faqs: [],
    image: '/images/service_restorative.jpg',
  },
  {
    slug: 'restorative-fillings-root-canals',
    code: 'SRV-ENDO-03',
    categoryEn: 'Endodontics & Restorative',
    categoryAr: 'علاج الجذور والعصب',
    nameEn: 'Microscopic Root Canal Therapy',
    nameAr: 'علاج العصب والجذور بالميكروسكوب',
    shortDescEn:
      'Painless single-visit microscopic endodontics and 3D root canal obturation.',
    shortDescAr:
      'علاج جذور وعصب الأسنان بدون ألم تحت الميكروسكوب الجراحي في جلسة واحدة.',
    overviewEn:
      'Using dental magnification, electronic apex locators, and rotary nickel-titanium instrumentation, our endodontists eliminate deep pulpal infection in a single comfortable session and restore tooth anatomy with biomimetic composite.',
    overviewAr:
      'باستخدام التكبير الميكروسكوبي وأجهزة تحديد طول الجذر الإلكترونية ومبارد النيكل تيتانيوم، نعالج التهاب العصب العميق بدقة وراحة تامة.',
    whoNeedsItEn:
      'Patients with dental caries, fractured fillings, lingering hot/cold sensitivity, or spontaneous throbbing toothache.',
    whoNeedsItAr:
      'المرضى الذين يعانون من تسوس الأسنان، كسر الحشوات القديمة، أو ألم مستمر مع المشروبات الساخنة والباردة.',
    startingPriceEgp: SERVICES.rct.price,
    priceRangeEn: `EGP ${egp(SERVICES.rct.price)}`,
    priceRangeAr: `${egp(SERVICES.rct.price)} ج.م`,
    priceRangeEgp: `EGP ${egp(SERVICES.rct.price)}`,
    durationMinutes: 60,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Digital periapical X-ray and profound local anesthesia with rubber dam isolation.',
      'Caries removal or microscopic root canal cleaning, shaping, and ultrasonic irrigation.',
      '3D bioceramic/thermoplastic canal obturation or layered nano-ceramic composite bonding.',
      'Occlusal bite adjustment and high-gloss anatomical polishing.',
    ],
    processStepsAr: [
      'أشعة رقمية وتخدير موضعي فعال مع عزل كامل للسن بالحاجز المطاطي (Rubber Dam).',
      'إزالة التسوس أو تنظيف وتطهير قنوات العصب تحت التكبير الميكروسكوبي.',
      'حشو القنوات ثلاثي الأبعاد أو بناء السن بحشوة الكومبوزيت التجميلية.',
      'ضبط الإطباق وتلميع الحشوة لتطابق شكل ولون السن الطبيعي.',
    ],
    faqs: [
      {
        qEn: 'Do I need a crown after a root canal?',
        qAr: 'هل أحتاج إلى طربوش (تاج) بعد علاج العصب؟',
        aEn: 'Back molars and premolars typically require a protective Zirconia or E-Max crown/onlay after root canal treatment to prevent vertical fracture.',
        aAr: 'تحتاج الضروس الخلفية غالباً إلى تاج (طربوش) زيركون أو إيماكس بعد علاج العصب لحمايتها من الكسر أثناء المضغ.',
      },
    ],
    image: '/images/service_restorative.jpg',
  },
  {
    slug: 'crowns-bridges-prosthodontics',
    code: 'SRV-PROS-04',
    categoryEn: 'Prosthodontics',
    categoryAr: 'التركيبات الثابتة والمتحركة',
    nameEn: 'CAD/CAM Zirconia Crown / E-Max Veneer (Per Unit)',
    nameAr: 'تاج زيركون أو عدسة إيماكس فينير (للوحدة)',
    shortDescEn:
      'Precision 3D-scanned all-ceramic crowns, E-Max veneers, and fixed bridges.',
    shortDescAr:
      'تركيبات وتيجان زيركون وعدسات إيماكس مصممة رقمياً بتقنية CAD/CAM.',
    overviewEn:
      'Our digital prosthodontics workflow replaces uncomfortable putty impressions with 3D intraoral scanning to craft high-translucency monolithic Zirconia and Lithium Disilicate (E-Max) crowns and bridges.',
    overviewAr:
      'يعتمد قسم التركيبات لدينا على المسح الضوئي الرقمي ثلاثي الأبعاد لتصميم وتصنيع تيجان الزيركون والإيماكس بأعلى دقة لحواف اللثة.',
    whoNeedsItEn:
      'Patients with root-canal-treated molars, heavily broken teeth, or single/multiple missing teeth requiring a fixed bridge.',
    whoNeedsItAr:
      'المرضى الذين لديهم ضروس معالجة عصبياً أو متهدمة، أو لتعويض سن مفقود بجسر خزفي ثابت.',
    startingPriceEgp: SERVICES.crown.price,
    priceRangeEn: `EGP ${egp(SERVICES.crown.price)} per unit`,
    priceRangeAr: `${egp(SERVICES.crown.price)} ج.م للوحدة`,
    priceRangeEgp: `EGP ${egp(SERVICES.crown.price)}`,
    durationMinutes: 60,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Conservative tooth preparation preserving healthy structure and digital shade matching.',
      '3D intraoral optical scan and placement of a custom aesthetic provisional crown.',
      'CAD/CAM milling of multilayer Zirconia or pressed E-Max ceramic.',
      'Try-in verification of margins and contacts followed by resin cementation.',
    ],
    processStepsAr: [
      'تحضير محافظ للسن مع اختيار درجة اللون الرقمية المطابقة لأسنانك.',
      'مسح ضوئي ثلاثي الأبعاد ووضع تاج مؤقت تجميلي لحماية السن.',
      'تصنيع التاج النهائي من الزيركون متعدد الطبقات أو الإيماكس بتقنية CAD/CAM.',
      'تجربة التاج والتأكد من تطابق الحواف والإطباق ثم اللصق النهائي.',
    ],
    faqs: [
      {
        qEn: 'How long does it take to receive my final Zirconia crown?',
        qAr: 'كم يستغرق استلام وتركيب تاج الزيركون النهائي؟',
        aEn: 'Typically 4 to 6 working days from the digital scan to final cementation.',
        aAr: 'يستغرق عادةً من 4 إلى 6 أيام عمل من جلسة المسح الرقمي وحتى التركيب النهائي.',
      },
    ],
    image: '/images/service_cosmetic.jpg',
  },
  {
    slug: 'dental-implants',
    code: 'SRV-IMP-05',
    categoryEn: 'Implantology & Oral Surgery',
    categoryAr: 'زراعة الأسنان وجراحة الفم',
    nameEn: '3D Computer-Guided Titanium Dental Implants',
    nameAr: 'زراعة الأسنان الموجهة بالكمبيوتر ثلاثية الأبعاد',
    shortDescEn:
      'Permanent biocompatible titanium tooth roots planned with 3D CBCT tomography and restored with Zirconia crowns.',
    shortDescAr:
      'تعويض الأسنان المفقودة بغرسات تيتانيوم سويسرية وألمانية مخططة بالأشعة ثلاثية الأبعاد CBCT.',
    overviewEn:
      'Dental implants are the gold-standard replacement for missing teeth, preserving jawbone volume without grinding adjacent healthy teeth. We use 3D CBCT planning and surgical guides for minimally invasive placement.',
    overviewAr:
      'تُعد زراعة الأسنان الحل الأمثل والدائم لتعويض الأسنان المفقودة والحفاظ على عظم الفك دون الحاجة لبرد الأسنان المجاورة السليمة.',
    whoNeedsItEn:
      'Adults missing one, several, or all teeth seeking a fixed, natural-feeling replacement.',
    whoNeedsItAr:
      'البالغون الذين فقدوا سناً واحداً أو عدة أسنان ويرغبون في تعويض ثابت يدوم طويلاً.',
    startingPriceEgp: SERVICES.implant.price,
    priceRangeEn: `EGP ${egp(SERVICES.implant.price)} (with installment plan)`,
    priceRangeAr: `${egp(SERVICES.implant.price)} ج.م (مع خطة تقسيط ميسرة)`,
    priceRangeEgp: `EGP ${egp(SERVICES.implant.price)}`,
    durationMinutes: 75,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      '3D CBCT bone volume assessment and virtual implant positioning.',
      'Atraumatic, guided placement of the sterile titanium implant fixture under local anesthesia.',
      '8–12 week osseointegration healing phase with follow-up checks.',
      'Digital scan and placement of custom titanium abutment and screw-retained Zirconia crown.',
    ],
    processStepsAr: [
      'تقييم كثافة وأبعاد العظم بالأشعة المقطعية ثلاثية الأبعاد (CBCT).',
      'وضع غرسة التيتانيوم المعقمة تحت التخدير الموضعي بدقة وبدون ألم.',
      'فترة التئام العظم مع الغرسة (8 إلى 12 أسبوعاً) مع متابعة دورية.',
      'أخذ طبعة رقمية وتركيب الدعامة وتاج الزيركون النهائي.',
    ],
    faqs: [
      {
        qEn: 'Can I pay for my dental implant in stages?',
        qAr: 'هل يمكن سداد تكلفة زراعة الأسنان على دفعات؟',
        aEn: 'Yes! You pay 50% at surgical fixture placement and the remaining 50% at final crown restoration 3 months later.',
        aAr: 'نعم، يتم سداد 50% عند وضع الغرسة الجراحية و50% عند تركيب التاج النهائي بعد التئام العظم.',
      },
    ],
    image: '/images/service_implants.jpg',
  },
  {
    slug: 'orthodontics-clear-aligners',
    code: 'SRV-ORTH-06',
    categoryEn: 'Orthodontics',
    categoryAr: 'تقويم الأسنان والفكين',
    nameEn: 'Orthodontics (Metal/Ceramic Braces or Clear Aligners)',
    nameAr: 'تقويم الأسنان (معدني/خزفي أو القوالب الشفافة)',
    shortDescEn:
      'Comprehensive bite correction and tooth alignment for children, teens, and adults with flexible monthly installments.',
    shortDescAr:
      'تصحيح اصطفاف الأسنان وإطباق الفكين للأطفال والمراهقين والبالغين مع خطط تقسيط شهرية ميسرة.',
    overviewEn:
      'Whether you prefer virtually invisible 3D-printed clear aligners or high-precision self-ligating metal/ceramic brackets, our orthodontic specialists design predictable tooth movement plans tailored to your facial profile.',
    overviewAr:
      'سواء كنت تفضل القوالب الشفافة المتحركة أو التقويم الثابت المعدني والخزفي، نصمم خطة تقويم رقمية مخصصة لتناسق الأسنان والوجه.',
    whoNeedsItEn:
      'Children (from age 7 for interceptive screening), teens, and adults with crowding, spacing, overbite, or crossbite.',
    whoNeedsItAr:
      'الأطفال والمراهقون والبالغون الذين يعانون من تزاحم الأسنان، الفراغات، أو عدم تطابق الفكين.',
    startingPriceEgp: SERVICES.braces.price,
    priceRangeEn: `EGP ${egp(SERVICES.braces.price)} (Staged Installments Available)`,
    priceRangeAr: `${egp(SERVICES.braces.price)} ج.م (متاح تقسيط على مراحل)`,
    priceRangeEgp: `EGP ${egp(SERVICES.braces.price)}`,
    durationMinutes: 45,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Orthodontic records: 3D intraoral scan, cephalometric X-ray, and clinical photography.',
      'Digital treatment simulation showing projected tooth movement and duration.',
      'Bonding of orthodontic appliances or delivery of sequential clear aligner trays.',
      'Monthly 20-minute activation/monitoring visits followed by Vivera/fixed retention.',
    ],
    processStepsAr: [
      'تسجيلات التقويم: مسح ثلاثي الأبعاد، أشعة سيفالومترية، وصور إكلينيكية.',
      'محاكاة رقمية لخطة حركة الأسنان والمدة المتوقعة للعلاج.',
      'تركيب جهاز التقويم أو تسليم مجموعة القوالب الشفافة المتتابعة.',
      'جلسات متابعة وتنشيط شهرية تنتهي بتركيب مثبت التقويم للحفاظ على النتيجة.',
    ],
    faqs: [
      {
        qEn: 'How do orthodontic installment plans work?',
        qAr: 'كيف يعمل نظام التقسيط في تقويم الأسنان؟',
        aEn: 'After an initial down payment (typically 25–30%), the remaining balance is divided into equal monthly installments across your active treatment visits.',
        aAr: 'بعد سداد دفعة التعاقد الأولى، يتم تقسيم باقي التكلفة على أقساط شهرية متساوية طوال فترة المتابعة.',
      },
    ],
    image: '/images/service_ortho.jpg',
  },
  {
    slug: 'cosmetic-dentistry-whitening',
    code: 'SRV-COSM-07',
    categoryEn: 'Cosmetic Dentistry',
    categoryAr: 'تجميل الأسنان وتبييض الليزر',
    nameEn: 'Laser Teeth Whitening',
    nameAr: 'تبييض الأسنان بالليزر',
    shortDescEn:
      'In-office desensitized photo-activated laser teeth whitening in a single comfortable session.',
    shortDescAr:
      'تبييض الأسنان الآمن بالليزر في العيادة خلال جلسة واحدة مريحة.',
    overviewEn:
      'Achieve a brighter, harmonious smile safely. Our cosmetic protocols use pH-balanced whitening gels with potassium nitrate desensitizers and Digital Smile Design (DSD) mockups so you can preview your veneer smile before any preparation.',
    overviewAr:
      'احصل على ابتسامة مشرقة ومتناسقة بأمان تام باستخدام مواد تبييض متوازنة تحمي المينا، أو تصميم الابتسامة الرقمي (DSD) لتجربة شكل الفينير قبل البدء.',
    whoNeedsItEn:
      'Patients seeking safe enamel brightening, closure of front tooth gaps (diastema), or correction of chipped/discolored front teeth.',
    whoNeedsItAr:
      'الراغبون في تفتيح لون الأسنان بأمان، إغلاق الفراغات الأمامية، أو تجميل الأسنان المتصبغة والمتآكلة.',
    startingPriceEgp: SERVICES.whitening.price,
    priceRangeEn: `EGP ${egp(SERVICES.whitening.price)}`,
    priceRangeAr: `${egp(SERVICES.whitening.price)} ج.م`,
    priceRangeEgp: `EGP ${egp(SERVICES.whitening.price)}`,
    durationMinutes: 60,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Baseline shade recording and preliminary polishing.',
      'Gingival barrier protection and 3 cycles of photo-activated clinical whitening (or 3D DSD mockup for veneers).',
      'Post-whitening fluoride/nano-hydroxyapatite desensitizing treatment.',
      'Home maintenance guidance to preserve shade stability.',
    ],
    processStepsAr: [
      'تسجيل درجة لون الأسنان الأساسية وتلميع السطح.',
      'وضع عازل حماية اللثة وتطبيق جلسة التبييض الضوئي (أو نموذج محاكاة الابتسامة للفينير).',
      'تطبيق جيل الفلورايد المهدئ لمنع حساسية الأسنان بعد الجلسة.',
      'تسليم إرشادات الحفاظ على ثبات اللون.',
    ],
    faqs: [
      {
        qEn: 'Will teeth whitening cause severe sensitivity?',
        qAr: 'هل يسبب تبييض الأسنان حساسية شديدة؟',
        aEn: 'We apply a protective gingival barrier and potassium-nitrate desensitizing gel before and after activation to keep sensitivity minimal and transient.',
        aAr: 'نستخدم عازلاً واقياً للثة وجيل مضاد للحساسية قبل وبعد الجلسة لضمان تجربة مريحة وآمنة.',
      },
    ],
    image: '/images/service_cosmetic.jpg',
  },
  {
    slug: 'pediatric-emergency-care',
    code: 'SRV-PED-08',
    categoryEn: 'Pediatric & Urgent Care',
    categoryAr: 'أسنان الأطفال والطوارئ',
    nameEn: 'Pediatric Dentistry & Same-Day Emergency Triage',
    nameAr: 'طب أسنان الأطفال ورعاية طوارئ الأسنان الفورية',
    shortDescEn:
      'Child-friendly preventive and restorative care plus same-day urgent pain relief across all branches.',
    shortDescAr:
      'رعاية متخصصة ولطيفة لأسنان الأطفال مع خدمة طوارئ تسكين الألم الفوري في نفس اليوم.',
    overviewEn:
      'From a child’s first preventive fluoride visit and fissure sealants to same-day emergency triage for acute pulpitis, dental trauma, or swelling, our clinicians provide calm, compassionate care.',
    overviewAr:
      'من الزيارة الوقائية الأولى لطفلك وتطبيق الفلورايد وحتى استقبال حالات الطوارئ لتسكين الألم الحاد أو إصابات الأسنان في نفس اليوم.',
    whoNeedsItEn:
      'Children aged 1–14 for preventive/restorative care, and any patient experiencing acute dental pain, swelling, or trauma.',
    whoNeedsItAr:
      'الأطفال من عمر سنة وحتى 14 عاماً، وأي مريض يعاني من ألم أسنان طارئ أو تورم أو كسر بالأسنان.',
    startingPriceEgp: SERVICES.pediatric.price,
    priceRangeEn: `EGP ${egp(SERVICES.pediatric.price)}`,
    priceRangeAr: `${egp(SERVICES.pediatric.price)} ج.م`,
    priceRangeEgp: `EGP ${egp(SERVICES.pediatric.price)}`,
    durationMinutes: 40,
    availableBranches: ['BR-A', 'BR-B', 'BR-C'],
    availableBranchCodes: ['BR-A', 'BR-B', 'BR-C'],
    processStepsEn: [
      'Rapid pain/trauma triage or gentle Tell-Show-Do pediatric acclimatization.',
      'Targeted digital radiograph to pinpoint the source of discomfort.',
      'Immediate pain-relief intervention (pulpotomy, sedative dressing, or drainage).',
      'Definitive follow-up scheduling and parent/patient home-care instructions.',
    ],
    processStepsAr: [
      'فرز سريع لحالة الطوارئ أو تهيئة نفسية لطيفة للطفل بأسلوب مبسط.',
      'أشعة رقمية موجهة لتحديد سبب الألم بدقة.',
      'تدخل فوري لتسكين الألم (علاج عصب أولي، ضماد مسكن، أو تصريف خراج).',
      'تحديد موعد المتابعة وتقديم إرشادات العناية المنزلية للأهل.',
    ],
    faqs: [
      {
        qEn: 'Are same-day emergency slots guaranteed?',
        qAr: 'هل مواعيد الطوارئ في نفس اليوم مضمونة؟',
        aEn: 'Yes. Each branch reserves dedicated buffer slots every day specifically for acute dental pain and trauma triage.',
        aAr: 'نعم، يخصص كل فرع فترات مخصصة يومياً لاستقبال حالات ألم الأسنان الحاد والإصابات الطارئة.',
      },
    ],
    image: '/images/service_pediatric.jpg',
  },
];

export const CLINIC_FAQS = [
  {
    category: 'Booking & Appointments',
    qEn: 'How do I book an appointment at my preferred Cairo branch?',
    qAr: 'كيف يمكنني حجز موعد في الفرع المفضل لي بالقاهرة؟',
    aEn: 'Use our online booking page (/book) to select Branch A (Heliopolis), Branch B (New Cairo), or Branch C (Maadi), choose your service and preferred dentist, and pick an open time slot.',
    aAr: 'يمكنك استخدام صفحة الحجز الإلكتروني (/book) لاختيار فرع مصر الجديدة أو القاهرة الجديدة أو المعادي، وتحديد الخدمة والطبيب والوقت المناسب لك.',
  },
  {
    category: 'Branches & Medical Records',
    qEn: 'Can I visit more than one branch using the same patient file?',
    qAr: 'هل يمكنني المتابعة في أكثر من فرع بنفس الملف الطبي؟',
    aEn: 'Yes. Ebtesamty operates a unified Electronic Dental Record (EDR). Your FDI tooth chart, X-rays, medical intake, and billing ledger are synchronized across all 3 branches.',
    aAr: 'نعم، تعمل عيادات ابتسامتي بنظام الملف الطبي الإلكتروني الموحد (EDR)، مما يتيح لأطبائك في الفروع الثلاثة الاطلاع على مخطط أسنانك والأشعة وخطة العلاج.',
  },
  {
    category: 'Pricing & Payments',
    qEn: 'What payment methods and installment plans are accepted?',
    qAr: 'ما هي طرق الدفع وخطط التقسيط المتاحة؟',
    aEn: 'All fees are quoted transparently in Egyptian Pounds (EGP). We accept Cash, Visa/Mastercard/Meeza cards, InstaPay, Fawry, and staged installment plans for implants and orthodontics.',
    aAr: 'جميع الأسعار محددة بشفافية بالجنيه المصري، ونقبل الدفع النقدي، البطاقات البنكية وميزة، إنستا باي (InstaPay)، فوري، وخطط التقسيط المرحلية للزراعة والتقويم.',
  },
  {
    category: 'Sterilization & Safety',
    qEn: 'What sterilization protocols are followed between patients?',
    qAr: 'ما هي إجراءات التعقيم ومكافحة العدوى المتبعة بين المرضى؟',
    aEn: 'Every reusable instrument undergoes a 7-stage protocol including ultrasonic cleaning, individual thermal pouching, and Class-B vacuum autoclave sterilization with chemical and biological indicators.',
    aAr: 'تخضع جميع الأدوات لبروتوكول تعقيم سباعي المراحل يشمل التنظيف بالموجات فوق الصوتية، التغليف الحراري الفردي، والتعقيم بأجهزة أوتوكلاف Class-B.',
  },
  {
    category: 'Patient Portal & Privacy',
    qEn: 'Who can view my medical history questionnaire?',
    qAr: 'من يمكنه الاطلاع على استمارة تاريخي الطبي؟',
    aEn: 'Your detailed medical intake answers and clinical notes are protected by Role-Based Access Control (RBAC) and are visible only to you and your authorized treating clinicians.',
    aAr: 'تخضع إجابات التاريخ الطبي والملاحظات الإكلينيكية لضوابط صلاحيات صارمة ولا يطلع عليها سوى المريض والفريق الطبي المعالج فقط.',
  },
  {
    category: 'Cancellation Policy',
    qEn: 'What is your rescheduling and cancellation policy?',
    qAr: 'ما هي سياسة تعديل أو إلغاء المواعيد؟',
    aEn: 'You may reschedule or cancel any appointment free of charge up to 24 hours before your scheduled time via the Patient Portal or by calling the branch reception desk.',
    aAr: 'يمكنك تعديل أو إلغاء موعدك مجاناً قبل 24 ساعة على الأقل من موعد الزيارة عبر بوابة المريض أو بالاتصال بمكتب الاستقبال.',
  },
];
