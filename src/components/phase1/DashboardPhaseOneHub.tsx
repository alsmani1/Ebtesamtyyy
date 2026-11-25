'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getSharedPaymentsDelta } from '@/config/minya-clinic-store';
import {
  clinicDateISO,
  clinicDateText,
  clinicMonthLabel,
  clinicMonthStartISO,
  clinicTodayISO,
} from '@/lib/clinic-clock';
import { doctorPerformance, debtorRows, financeKpis } from '@/lib/clinic-finance';
import { SERVICES } from '@/lib/clinic-pricing';
import {
  TrendingUp,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Edit3,
  X,
  DollarSign,
  Clock,
  Boxes,
  FlaskConical,
  CreditCard,
} from 'lucide-react';

export function DashboardPhaseOneHub({
  mode = 'owner',
}: {
  mode?: 'owner' | 'reception';
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const c = (en: string, ar: string) => (isAr ? ar : en);

  // Dentist & Period Filter State (Image 10)
  const [selectedDentistFilter, setSelectedDentistFilter] = useState<string>('ALL');
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<'this-month' | 'last-month'>('this-month');

  // Drill-Down Modal State (Images 8 & 10: "Click any number to open its details")
  const [drilldownModal, setDrilldownModal] = useState<{
    title: string;
    total: string;
    formula: string;
    type: 'collections' | 'dentist' | 'kpi';
  } | null>(null);

  // Alerts state (Image 9)
  const [alertActionDone, setAlertActionDone] = useState<Record<string, boolean>>({});
  const [, setFinanceTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = () => setFinanceTick((t) => t + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("ebtesamty-shared-invoices-sync", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("ebtesamty-shared-invoices-sync", handleSync);
    };
  }, []);

  const { paidDelta } = getSharedPaymentsDelta();
  const kpis = financeKpis();
  const todayRevenueNum = kpis.todayCollected + paidDelta;
  const yesterdayRevenueNum = kpis.yesterdayCollected;
  const todayChangePct = kpis.todayChangePercent;
  const topDebtor = debtorRows(1)[0];

  // Split Operational Board State (Image 7: Appointments 11 + Invoices 17)
  const [boardAppointments, setBoardAppointments] = useState([
    {
      id: 'ba-1',
      patientAr: 'دينا سامح فوزي',
      patientEn: 'Dina Sameh Fawzy',
      time: '10:30 AM - 11:15 AM',
      date: clinicTodayISO(),
      doctorAr: 'د. سارة عبد الرحمن',
      doctorEn: 'Dr. Sara Abdelrahman',
      procedureAr: 'حشو',
      procedureEn: 'Filling',
      procBadgeClass: 'bg-sky-100 text-sky-800',
      cardClass: 'bg-sky-50/70 border-e-4 border-e-indigo-500',
      confirmed: false,
    },
    {
      id: 'ba-2',
      patientAr: 'جنى شريف عبد الله',
      patientEn: 'Jana Sherif Abdullah',
      time: '11:15 AM - 12:15 PM',
      date: clinicTodayISO(),
      doctorAr: 'د. سارة عبد الرحمن',
      doctorEn: 'Dr. Sara Abdelrahman',
      procedureAr: 'حشو تجميلي',
      procedureEn: 'Cosmetic Filling',
      procBadgeClass: 'bg-pink-100 text-pink-800',
      cardClass: 'bg-pink-50/60 border-e-4 border-e-pink-500',
      confirmed: false,
    },
    {
      id: 'ba-3',
      patientAr: 'حسام وليد فتحي',
      patientEn: 'Hossam Waleed Fathy',
      time: '12:15 PM - 01:15 PM',
      date: clinicTodayISO(),
      doctorAr: 'د. سارة عبد الرحمن',
      doctorEn: 'Dr. Sara Abdelrahman',
      procedureAr: 'تبييض أسنان',
      procedureEn: 'Teeth Whitening',
      procBadgeClass: 'bg-teal-100 text-teal-800',
      cardClass: 'bg-teal-50/60 border-e-4 border-e-teal-500',
      confirmed: false,
    },
    {
      id: 'ba-4',
      patientAr: 'دينا سامح فوزي',
      patientEn: 'Dina Sameh Fawzy',
      time: '02:00 PM - 02:30 PM',
      date: clinicTodayISO(),
      doctorAr: 'د. أحمد الشريف',
      doctorEn: 'Dr. Ahmed El-Sherif',
      procedureAr: 'خلع',
      procedureEn: 'Extraction',
      procBadgeClass: 'bg-rose-100 text-rose-800',
      cardClass: 'bg-rose-50/60 border-e-4 border-e-rose-500',
      confirmed: false,
    },
    {
      id: 'ba-5',
      patientAr: 'فاطمة خالد رمضان',
      patientEn: 'Fatma Khaled Ramadan',
      time: '02:45 PM - 03:45 PM',
      date: clinicTodayISO(),
      doctorAr: 'د. أحمد الشريف',
      doctorEn: 'Dr. Ahmed El-Sherif',
      procedureAr: 'تركيب تاج',
      procedureEn: 'Crown Placement',
      procBadgeClass: 'bg-amber-100 text-amber-800',
      cardClass: 'bg-amber-50/60 border-e-4 border-e-amber-500',
      confirmed: false,
    },
    {
      id: 'ba-6',
      patientAr: 'سلمى عمر السيد',
      patientEn: 'Salma Omar El-Sayed',
      time: '03:30 PM - 04:30 PM',
      date: clinicTodayISO(),
      doctorAr: 'د. كريم مصطفى',
      doctorEn: 'Dr. Karim Moustafa',
      procedureAr: 'علاج العصب',
      procedureEn: 'Root Canal',
      procBadgeClass: 'bg-purple-100 text-purple-800',
      cardClass: 'bg-purple-50/60 border-e-4 border-e-purple-500',
      confirmed: false,
    },
    {
      id: 'ba-7',
      patientAr: 'عمرو ياسين زكي',
      patientEn: 'Amr Yassin Zaki',
      time: '04:00 PM - 04:30 PM',
      date: clinicTodayISO(),
      doctorAr: 'د. أحمد الشريف',
      doctorEn: 'Dr. Ahmed El-Sherif',
      procedureAr: 'تنظيف الجير',
      procedureEn: 'Scaling & Polishing',
      procBadgeClass: 'bg-emerald-100 text-emerald-800',
      cardClass: 'bg-emerald-50/60 border-e-4 border-e-emerald-500',
      confirmed: false,
    },
  ]);

  const [boardInvoices, setBoardInvoices] = useState([
    {
      id: 'bi-1',
      patientAr: 'طارق يوسف عثمان',
      patientEn: 'Tarek Youssef Othman',
      phone: '01067213441',
      serviceAr: SERVICES.pediatric.nameAr,
      serviceEn: SERVICES.pediatric.nameEn,
      metaAr: 'منذ 18 يوم · بواسطة د. كريم مصطفى',
      metaEn: '18 days ago · by Dr. Karim Moustafa',
      totalEgp: SERVICES.pediatric.price,
      paidEgp: 0,
    },
    {
      id: 'bi-2',
      patientAr: 'نور مصطفى فوزي',
      patientEn: 'Nour Moustafa Fawzy',
      phone: '01545379838',
      serviceAr: SERVICES.filling.nameAr,
      serviceEn: SERVICES.filling.nameEn,
      metaAr: 'منذ 24 يوم · بواسطة د. كريم مصطفى',
      metaEn: '24 days ago · by Dr. Karim Moustafa',
      totalEgp: SERVICES.filling.price,
      paidEgp: 0,
    },
    {
      id: 'bi-3',
      patientAr: 'رنا مروان عبد العزيز',
      patientEn: 'Rana Marwan Abdelaziz',
      phone: '01055330343',
      serviceAr: SERVICES.veneer.nameAr,
      serviceEn: SERVICES.veneer.nameEn,
      metaAr: `${clinicDateISO(-77)} · بواسطة د. أحمد الشريف`,
      metaEn: `${clinicDateISO(-77)} · by Dr. Ahmed El-Sherif`,
      totalEgp: SERVICES.veneer.price,
      paidEgp: 0,
    },
    {
      id: 'bi-4',
      patientAr: 'حسام وليد فتحي',
      patientEn: 'Hossam Waleed Fathy',
      phone: '01216532251',
      serviceAr: SERVICES.post.nameAr,
      serviceEn: SERVICES.post.nameEn,
      metaAr: `${clinicDateISO(-78)} · بواسطة د. سارة عبد الرحمن`,
      metaEn: `${clinicDateISO(-78)} · by Dr. Sara Abdelrahman`,
      totalEgp: SERVICES.post.price,
      paidEgp: Math.round(SERVICES.post.price * 0.4),
    },
    {
      id: 'bi-5',
      patientAr: 'إيمان عبد الرحمن سليمان',
      patientEn: 'Eman Abdelrahman Soliman',
      phone: '01535810328',
      serviceAr: SERVICES.consult.nameAr,
      serviceEn: SERVICES.consult.nameEn,
      metaAr: `${clinicDateISO(-80)} · بواسطة د. سارة عبد الرحمن`,
      metaEn: `${clinicDateISO(-80)} · by Dr. Sara Abdelrahman`,
      totalEgp: SERVICES.consult.price,
      paidEgp: 0,
    },
  ]);

  const boardOutstandingInvoices = boardInvoices.filter((inv) => inv.paidEgp < inv.totalEgp);
  const boardToCollect = boardOutstandingInvoices.reduce(
    (sum, inv) => sum + Math.max(0, inv.totalEgp - inv.paidEgp),
    0
  );
  const methodTotal = Math.max(1, kpis.methodMix.cash + kpis.methodMix.instapay + kpis.methodMix.visa);
  const methodPct = (value: number) => Math.round((value / methodTotal) * 100);
  const avgRevenuePerPatient = kpis.activePatients ? Math.round(kpis.monthInvoiced / kpis.activePatients) : 0;
  const allDentists = doctorPerformance(0);
  const periodDentists = doctorPerformance(selectedPeriodFilter === 'this-month' ? 0 : -1);
  const maxDoctorInvoiced = Math.max(1, ...periodDentists.map((d) => d.invoiced));
  const dentistColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-500'];
  const dentistPerformanceRows = periodDentists
    .filter((d) => selectedDentistFilter === 'ALL' || selectedDentistFilter === d.doctorId)
    .map((d, idx) => ({
      id: d.doctorId,
      nameEn: d.nameEn,
      nameAr: d.nameAr,
      cases: d.cases,
      revenueEgp: d.invoiced,
      collectionPct: d.collectionRatePercent,
      barColor: dentistColors[idx % dentistColors.length],
      pct: Math.round((d.invoiced / maxDoctorInvoiced) * 100),
    }));

  return (
    <div className="space-y-6">
      {/* ====================================================================
          1. TODAY AT A GLANCE STRIP (Revenue vs Yesterday, Confirmed Appts,
             Chair Occupancy Rate, New Patients Today)
         ==================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() =>
            setDrilldownModal({
              title: c("Today's Revenue vs Yesterday", 'إيراد اليوم مقارنة بالأمس'),
              total: `EGP ${todayRevenueNum.toLocaleString()}`,
              formula: c(
                `Today's posted payments (EGP ${todayRevenueNum.toLocaleString()}) compared with yesterday's total (EGP ${yesterdayRevenueNum.toLocaleString()}).`,
                `إجمالي متحصلات اليوم (${todayRevenueNum.toLocaleString()} ج.م) مقارنة بالأمس (${yesterdayRevenueNum.toLocaleString()} ج.م).`
              ),
              type: 'collections',
            })
          }
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500">
              {mode === 'reception'
                ? c("Today's Front-Desk Collections", 'تحصيل خزينة الاستقبال اليوم')
                : c("Today's Revenue vs Yesterday", 'إيراد اليوم مقارنة بالأمس')}
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900 tabular-nums block">
            EGP {todayRevenueNum.toLocaleString()}
          </strong>
          <span className={`text-xs font-extrabold block ${todayChangePct >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {todayChangePct >= 0 ? '↑ +' : '↓ '}
            {todayChangePct}% {c(`vs yesterday (EGP ${yesterdayRevenueNum.toLocaleString()})`, `مقارنة بالأمس (${yesterdayRevenueNum.toLocaleString()} ج.م)`)}
          </span>
        </div>

        <div
          onClick={() =>
            setDrilldownModal({
              title: c('Appointments & Confirmed Count', 'مواعيد اليوم والمؤكد منها'),
              total: '22 Visits (18 Confirmed)',
              formula: c(
                '18 confirmed via WhatsApp · 4 unconfirmed slots ready to be filled from the waiting list.',
                '18 موعداً مؤكداً عبر واتساب · 4 مواعيد غير مؤكدة يمكن ملؤها من قائمة الانتظار.'
              ),
              type: 'kpi',
            })
          }
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500">
              {c('Appointments & Confirmed', 'المواعيد وعدد المؤكد منها')}
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900 tabular-nums block">
            22 <span className="text-sm font-bold text-emerald-700">(18 {c('Confirmed', 'مؤكد')})</span>
          </strong>
          <span className="text-xs font-bold text-amber-700 block">
            {c('4 unconfirmed — fill from waiting list', '4 غير مؤكدة — املأها من قائمة الانتظار')}
          </span>
        </div>

        <div
          onClick={() =>
            setDrilldownModal({
              title: c('Chair Occupancy Rate', 'معدل إشغال الكراسي'),
              total: '87%',
              formula: c(
                'Booked chair hours (20.8 hrs) ÷ Available operatory hours across 3 chairs (24 hrs) = 87%.',
                'ساعات الحجز الفعلية مقسومة على الساعات المتاحة للكراسي الثلاثة = 87%.'
              ),
              type: 'kpi',
            })
          }
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500">
              {c('Chair Occupancy Rate', 'معدل إشغال الكراسي')}
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900 tabular-nums block">
            87%
          </strong>
          <span className="text-xs font-bold text-slate-500 block">
            {c('3 chairs active · 13% unused capacity', '3 كراسي نشطة · 13% طاقة متاحة')}
          </span>
        </div>

        <div
          onClick={() =>
            setDrilldownModal({
              title: c('New Patients Today', 'مرضى جدد اليوم'),
              total: '13 New Patients',
              formula: c(
                'First-time registered patients with a booked visit in the selected period (8 WhatsApp, 3 Instagram, 2 Referral).',
                'المرضى المسجلون لأول مرة مع زيارة فعلية (قياس التسويق بالأرقام لا بالانطباعات).'
              ),
              type: 'kpi',
            })
          }
          className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500">
              {c('New Patients Today', 'مرضى جدد اليوم')}
            </span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <strong className="text-2xl font-black text-slate-900 tabular-nums block">
            13
          </strong>
          <span className="text-xs font-bold text-purple-700 block">
            {c('Measured in booked patients, not impressions', 'قياس التسويق بالأرقام لا بالانطباعات')}
          </span>
        </div>
      </section>

      {/* ====================================================================
          2. IMAGE 9 (Actionable Front-Desk Alerts) + IMAGE 10 (Performance by dentist — Owner Only)
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* IMAGE 9: ALERTS CARD */}
        <section
          className={`${
            mode === 'owner' ? 'lg:col-span-6' : 'lg:col-span-12'
          } bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {mode === 'reception'
                ? c('Actionable Front-Desk Alerts', 'تنبيهات مكتب الاستقبال العاجلة')
                : c('Alerts', 'تنبيهات توفّر المال قبل وقوع المشكلة')}
            </h3>
            <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold">
              {mode === 'reception'
                ? c('3 need action', '3 تحتاج إجراء')
                : c('4 need action', '4 تحتاج إجراء')}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Row 1: Composite A2 running low (Owner Only) */}
            {mode === 'owner' && (
              <div className="p-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                    !
                  </div>
                  <div>
                    <strong className="text-sm font-extrabold text-slate-900 block">
                      {c('Composite A2 running low', 'نقص في مخزون كومبوزيت A2')}
                    </strong>
                    <span className="text-xs text-slate-500">
                      {c('2 left — minimum 5', 'المتبقي 2 — الحد الأدنى 5')}
                    </span>
                  </div>
                </div>
                <Link
                  href="/owner/inventory"
                  className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold transition-colors"
                >
                  {c('Order', 'اطلب الآن')}
                </Link>
              </div>
            )}

            {/* Row 2: 3 late appointments, patients not arrived yet */}
            <div className="p-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {c(
                      '3 late appointments, patients not arrived yet',
                      '3 مواعيد متأخرة لم يصل مرضاها بعد'
                    )}
                  </strong>
                  <span className="text-xs text-slate-500 font-mono">11:00 · 11:30 · 12:00</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertActionDone({ ...alertActionDone, late: true })}
                className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-extrabold transition-colors"
              >
                {alertActionDone.late ? c('Called ✓', 'تم الاتصال ✓') : c('Call', 'اتصال')}
              </button>
            </div>

            {/* Row 3: Overdue invoice */}
            <div className="p-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  F
                </div>
                <div>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {c('Overdue invoice', 'فاتورة متأخرة السداد')}
                  </strong>
                  <span className="text-xs text-slate-500">
                    {topDebtor
                      ? c(
                          `${topDebtor.nameEn} · EGP ${topDebtor.balance.toLocaleString()} · ${topDebtor.oldestDays} days`,
                          `${topDebtor.nameAr} · ${topDebtor.balance.toLocaleString()} ج.م · منذ ${topDebtor.oldestDays} يوم`
                        )
                      : c('No overdue balances', 'لا توجد متأخرات')}
                  </span>
                </div>
              </div>
              <Link
                href="/billing?view=balances"
                className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition-colors"
              >
                {c('Overdue', 'متأخرة')}
              </Link>
            </div>

            {/* Row 4: Lab order past its due date */}
            <div className="p-3.5 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  L
                </div>
                <div>
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {c('Lab order past its due date', 'طلب معمل تجاوز موعد التسليم')}
                  </strong>
                  <span className="text-xs text-slate-500">
                    {c('#L-302 · Al Amal Lab · 2 days', '#L-302 · معمل الأمل · يومان')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAlertActionDone({ ...alertActionDone, lab: true })}
                className="px-4 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-extrabold transition-colors"
              >
                {alertActionDone.lab
                  ? c('Lab Notified ✓', 'تمت المتابعة ✓')
                  : c('Follow up with the lab', 'متابعة المعمل')}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {c(
              'The alert shows up before the problem happens — not after',
              'يظهر التنبيه قبل وقوع المشكلة وتوقف العمل — وليس بعدها'
            )}
          </p>
        </section>

        {/* IMAGE 10: PERFORMANCE BY DENTIST CARD (Strictly Owner-Only — Removed from Receptionist Dashboard) */}
        {mode === 'owner' && (
          <section className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {c('Performance by dentist', 'أداء كل طبيب وكل فرع على حدة')}
            </h3>
            <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-extrabold">
              {clinicMonthLabel(selectedPeriodFilter === 'this-month' ? 0 : -1, isAr ? 'ar' : 'en')}
            </span>
          </div>

          {/* Filter Pills matching Image 10 */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: c('All dentists', 'كل الأطباء') },
              ...allDentists.map((d) => ({ id: d.doctorId, label: isAr ? d.nameAr : d.nameEn })),
            ].map((docPill) => {
              const active = selectedDentistFilter === docPill.id;
              return (
                <button
                  key={docPill.id}
                  type="button"
                  onClick={() => setSelectedDentistFilter(docPill.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {docPill.label}
                </button>
              );
            })}

            <div className="ms-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedPeriodFilter('this-month')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                  selectedPeriodFilter === 'this-month'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {c('This month', 'هذا الشهر')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriodFilter('last-month')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                  selectedPeriodFilter === 'last-month'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {c('Last month', 'الشهر الماضي')}
              </button>
            </div>
          </div>

          {/* Dentist Performance Progress Cards matching Image 10 */}
          <div className="space-y-3">
            {dentistPerformanceRows.map((doc) => {
              const isHighlighted =
                selectedDentistFilter === 'ALL' || selectedDentistFilter === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() =>
                    setDrilldownModal({
                      title: `${isAr ? doc.nameAr : doc.nameEn} — ${doc.cases} ${c('cases', 'حالة')}`,
                      total: `EGP ${doc.revenueEgp.toLocaleString()}`,
                      formula: c(
                        `Calculated from ${doc.cases} cases · issued EGP ${doc.revenueEgp.toLocaleString()} · collection rate ${doc.collectionPct}%`,
                        `محسوبة من ${doc.cases} حالة · فواتير ${doc.revenueEgp.toLocaleString()} ج.م · نسبة التحصيل ${doc.collectionPct}%`
                      ),
                      type: 'dentist',
                    })
                  }
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                    isHighlighted
                      ? 'bg-white border-slate-200/90 hover:border-blue-400 shadow-2xs'
                      : 'bg-slate-50/60 border-slate-200/50 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-extrabold text-slate-900">
                      {isAr ? doc.nameAr : doc.nameEn} — {doc.cases} {c('cases', 'حالة')}
                    </strong>
                    <strong className="text-base font-black text-slate-900 tabular-nums">
                      EGP {doc.revenueEgp.toLocaleString()}
                    </strong>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${doc.barColor} transition-all duration-500`}
                      style={{ width: `${doc.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-500">
            {c(
              'Click any number to open the invoices and appointments it was calculated from',
              'اضغط على أي رقم لفتح الفواتير والمواعيد التي تم حسابه منها'
            )}
          </p>
          </section>
        )}
      </div>

      {/* ====================================================================
          3. IMAGE 8: INTERACTIVE ANALYTICS GRID WITH CLICK-TO-DRILL-DOWN MODAL
             ("لوحة الإحصائيات — اضغط أي بطاقة لرسم بياني وتفاصيل قابلة للتنقيب")
         ==================================================================== */}
      {mode === 'owner' && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {c('Interactive Statistics & Drill-Down Board', 'لوحة الإحصائيات التفصيلية')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {c(
                  'Click any KPI card below to open its interactive chart, payment method breakdown, and source invoices',
                  'اضغط أي بطاقة لرسم بياني وتفاصيل قابلة للتنقيب: 1 ' +
                    clinicDateText(clinicMonthStartISO(), 'ar', false) +
                    ' – ' +
                    clinicDateText(clinicTodayISO(), 'ar', false)
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setDrilldownModal({
                  title: c('Actual Collected Revenue (المحصّل فعلياً)', 'المحصّل فعلياً'),
                  total: `EGP ${kpis.monthCollected.toLocaleString()}`,
                  formula: c(
                    `Collected = Sum of actual payments this month (Cash ${methodPct(kpis.methodMix.cash)}%, Transfer ${methodPct(kpis.methodMix.instapay)}%, Card ${methodPct(kpis.methodMix.visa)}%)`,
                    `المحصّل = مجموع الدفعات الفعلية هذا الشهر (نقدي ${methodPct(kpis.methodMix.cash)}% · تحويل ${methodPct(kpis.methodMix.instapay)}% · بطاقة ${methodPct(kpis.methodMix.visa)}%)`
                  ),
                  type: 'collections',
                })
              }
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs"
            >
              {c('Open Collected & Debt Aging Breakdown', 'فتح تفاصيل المحصّل وأعمار الديون')}
            </button>
          </div>

          {/* 8 Primary Interactive KPI Cards matching Image 8 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                labelAr: 'إجمالي الإيراد المفوتر',
                labelEn: 'Total Invoiced Revenue',
                val: `${kpis.monthInvoiced.toLocaleString()} ج.م`,
                sub: `${kpis.monthInvoiceCount} فاتورة · متوسط ${kpis.monthAverageInvoice.toLocaleString()} ج.م`,
                color: 'text-blue-700',
              },
              {
                labelAr: 'المحصّل فعلياً',
                labelEn: 'Actual Collected',
                val: `${kpis.monthCollected.toLocaleString()} ج.م`,
                sub: `تحصيل فواتير الفترة ${kpis.collectionRatePercent}%`,
                color: 'text-emerald-700',
              },
              {
                labelAr: 'صافي الربح',
                labelEn: 'Net Profit',
                val: `${kpis.netProfit.toLocaleString()} ج.م`,
                sub: `هامش ${kpis.marginPercent}% - بعد كل التكاليف`,
                color: 'text-slate-900',
              },
              {
                labelAr: 'إجمالي الذمم المدينة',
                labelEn: 'Total Receivables (Arrears)',
                val: `${kpis.arrears.toLocaleString()} ج.م`,
                sub: `${kpis.debtorsCount} مريض · متأخر +60 يوم: ${(kpis.aging.d60 + kpis.aging.d90plus).toLocaleString()} ج.م`,
                color: 'text-amber-700',
              },
              {
                labelAr: 'الإلغاء والتغيّب',
                labelEn: 'Cancellation & No-Show',
                val: '50%',
                sub: '2 ملغاة · 2 لم يحضر',
                color: 'text-rose-700',
              },
              {
                labelAr: 'مرضى جدد',
                labelEn: 'New Patients',
                val: '13',
                sub: 'خلال الفترة المحددة',
                color: 'text-purple-700',
              },
              {
                labelAr: 'معدّل عودة المرضى',
                labelEn: 'Patient Retention Rate',
                val: '30%',
                sub: '3 عائد من 10 نشط',
                color: 'text-indigo-700',
              },
              {
                labelAr: 'متوسط الإيراد لكل مريض',
                labelEn: 'Avg Revenue per Patient',
                val: `${avgRevenuePerPatient.toLocaleString()} ج.م`,
                sub: `${kpis.activePatients} مريض نشط في الفترة`,
                color: 'text-teal-700',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setDrilldownModal({
                    title: isAr ? card.labelAr : card.labelEn,
                    total: card.val,
                    formula: card.sub,
                    type: 'collections',
                  })
                }
                className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-500 bg-slate-50/40 hover:bg-white cursor-pointer transition-all space-y-1.5"
              >
                <span className="text-xs font-bold text-slate-500 block">
                  {isAr ? card.labelAr : card.labelEn}
                </span>
                <strong className={`text-2xl font-black tabular-nums block ${card.color}`}>
                  {card.val}
                </strong>
                <span className="text-[11px] text-slate-400 block">{card.sub}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ====================================================================
          4. IMAGE 7: OPERATIONAL SPLIT BOARD (Appointments 11 + Invoices 17)
         ==================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-5): Invoices to Collect (الفواتير 17) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                {c('Invoices', 'الفواتير')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black tabular-nums">
                {boardOutstandingInvoices.length}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold tabular-nums">
              {c(`To Collect: ${boardToCollect.toLocaleString()} EGP`, `المطلوب تحصيله: ${boardToCollect.toLocaleString()} ج.م`)}
            </span>
          </div>

          <div className="space-y-3 max-h-[540px] overflow-y-auto pe-1">
            {boardInvoices.map((inv) => {
              const remaining = Math.max(0, inv.totalEgp - inv.paidEgp);
              const pct = Math.round((inv.paidEgp / Math.max(1, inv.totalEgp)) * 100);
              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-white space-y-3 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-900 block">
                        {isAr ? inv.patientAr : inv.patientEn}
                      </strong>
                      <span className="text-xs font-mono text-slate-400 block">{inv.phone}</span>
                      <span className="text-xs text-slate-600 font-semibold block mt-0.5">
                        {isAr ? inv.serviceAr : inv.serviceEn}
                      </span>
                    </div>

                    <div className="text-end text-xs space-y-0.5">
                      <div>
                        <span className="text-slate-400">{c('Total', 'الإجمالي')} </span>
                        <strong className="font-black text-slate-900 tabular-nums">
                          {inv.totalEgp.toLocaleString()} {c('EGP', 'ج.م')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{c('Paid', 'المدفوع')} </span>
                        <strong className="font-bold text-emerald-600 tabular-nums">
                          {inv.paidEgp.toLocaleString()} {c('EGP', 'ج.م')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{c('Due', 'المتبقي')} </span>
                        <strong className="font-black text-rose-600 tabular-nums">
                          {remaining.toLocaleString()} {c('EGP', 'ج.م')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black tabular-nums ${
                          pct >= 100
                            ? 'border-emerald-500 text-emerald-700'
                            : pct > 0
                            ? 'border-amber-500 text-amber-700'
                            : 'border-rose-300 text-rose-600'
                        }`}
                      >
                        {pct}%
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isAr ? inv.metaAr : inv.metaEn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setBoardInvoices((prev) =>
                          prev.map((item) =>
                            item.id === inv.id ? { ...item, paidEgp: item.totalEgp } : item
                          )
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-blue-50 hover:border-blue-400 text-xs font-extrabold text-slate-800"
                    >
                      + {c('Add Payment', 'إضافة الدفع')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (lg:col-span-7): Today's Color-Coded Appointments List (المواعيد 11) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                {c('Appointments', 'المواعيد')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black tabular-nums">
                11
              </span>
            </div>
            <Link
              href="/reception/agenda"
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold"
            >
              + {c('New Appointment', 'موعد جديد')}
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pe-1">
            {boardAppointments.map((appt) => (
              <div
                key={appt.id}
                className={`p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 transition-all ${appt.cardClass}`}
              >
                <div className="space-y-1">
                  <strong className="text-sm font-extrabold text-slate-900 block">
                    {isAr ? appt.patientAr : appt.patientEn}
                  </strong>
                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold">{appt.time}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">{appt.date}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-800">
                      {isAr ? appt.doctorAr : appt.doctorEn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/80 text-indigo-800 text-xs font-extrabold">
                    • {c('Booked', 'محجوز')}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${appt.procBadgeClass}`}>
                    {isAr ? appt.procedureAr : appt.procedureEn}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBoardAppointments((prev) =>
                        prev.map((a) =>
                          a.id === appt.id ? { ...a, confirmed: !a.confirmed } : a
                        )
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold transition-colors ${
                      appt.confirmed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {appt.confirmed ? c('Confirmed ✓', 'مؤكَّد ✓') : c('Unconfirmed', 'لم يُؤكَّد')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          IMAGE 8 LEFT OVERLAY: CLICK-TO-DRILL-DOWN MODAL (Collected, Payment
          Methods, Monthly Curve, and Debt Aging Bars)
         ==================================================================== */}
      {drilldownModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{drilldownModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formula Explanation Banner matching Image 8 */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-semibold">
              {drilldownModal.formula}
            </div>

            {/* 4 Summary Metric Boxes matching Image 8 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[11px] font-bold text-slate-500 block">
                  {c('Actual Collected', 'المحصّل فعلياً')}
                </span>
                <strong className="text-lg font-black text-emerald-700 tabular-nums">
                  {kpis.monthCollected.toLocaleString()} {c('EGP', 'ج.م')}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-500 block">
                  {c('Remaining on Period Invoices', 'المتبقي على فواتير الفترة')}
                </span>
                <strong className="text-lg font-black text-slate-900 tabular-nums">
                  {kpis.arrears.toLocaleString()} {c('EGP', 'ج.م')}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl border border-blue-400 bg-blue-50/40">
                <span className="text-[11px] font-bold text-slate-500 block">
                  {c('Collection Rate', 'نسبة تحصيل فواتير الفترة')}
                </span>
                <strong className="text-lg font-black text-blue-700 tabular-nums">{kpis.collectionRatePercent}%</strong>
              </div>
              <div className="p-3.5 rounded-2xl border border-rose-200 bg-rose-50/40">
                <span className="text-[11px] font-bold text-slate-500 block">
                  {c('Overdue > 60 Days', 'متأخر أكثر من 60 يوم')}
                </span>
                <strong className="text-lg font-black text-rose-700 tabular-nums">
                  {(kpis.aging.d60 + kpis.aging.d90plus).toLocaleString()} {c('EGP', 'ج.م')}
                </strong>
              </div>
            </div>

            {/* Middle Split: Collection by Payment Method + Monthly Curve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700">
                  {c('Collection by Payment Method', 'التحصيل حسب طريقة الدفع')}
                </h4>
                {[
                  { label: c('Cash', 'نقدي'), val: `${kpis.methodMix.cash.toLocaleString()} EGP (${methodPct(kpis.methodMix.cash)}%)`, pct: `${methodPct(kpis.methodMix.cash)}%`, color: 'bg-blue-600' },
                  { label: c('Transfer / InstaPay', 'تحويل'), val: `${kpis.methodMix.instapay.toLocaleString()} EGP (${methodPct(kpis.methodMix.instapay)}%)`, pct: `${methodPct(kpis.methodMix.instapay)}%`, color: 'bg-purple-600' },
                  { label: c('Card', 'بطاقة'), val: `${kpis.methodMix.visa.toLocaleString()} EGP (${methodPct(kpis.methodMix.visa)}%)`, pct: `${methodPct(kpis.methodMix.visa)}%`, color: 'bg-emerald-600' },
                ].map((pm) => (
                  <div key={pm.label} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{pm.label}</span>
                      <span className="tabular-nums text-slate-600">{pm.val}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${pm.color}`} style={{ width: pm.pct }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-700">
                  {c('Monthly Collections Trajectory', 'التحصيل — شهرياً')}
                </h4>
                <svg viewBox="0 0 320 130" className="w-full h-28">
                  <path
                    d="M 15 110 L 140 110 C 165 110, 180 42, 205 24 C 230 12, 250 48, 275 88 L 305 102 L 305 110 Z"
                    fill="rgba(16, 185, 129, 0.2)"
                  />
                  <path
                    d="M 15 110 L 140 110 C 165 110, 180 42, 205 24 C 230 12, 250 48, 275 88 L 305 102"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom: Debt Aging Bars matching Image 8 */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700">
                {c(
                  'Debt Aging — How long each overdue balance has been outstanding',
                  'أعمار الديون — كم مضى على كل مبلغ متأخر'
                )}
              </h4>
              {[
                { label: c('< 30 Days', 'أقل من 30 يوم'), amount: kpis.aging.current, color: 'bg-emerald-600' },
                { label: c('31–60 Days', '31–60 يوم'), amount: kpis.aging.d30, color: 'bg-amber-500' },
                { label: c('61–90 Days', '61–90 يوم'), amount: kpis.aging.d60, color: 'bg-orange-500' },
                { label: c('90+ Days', 'أكثر من 90 يوم'), amount: kpis.aging.d90plus, color: 'bg-rose-600' },
              ].map((ag) => ({
                ...ag,
                info: `${ag.amount.toLocaleString()} EGP`,
                pct: `${Math.round((ag.amount / Math.max(1, kpis.arrears)) * 100)}%`,
              })).map((ag) => (
                <div key={ag.label} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{ag.label}</span>
                    <span className="tabular-nums text-slate-600">{ag.info}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${ag.color}`} style={{ width: ag.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
