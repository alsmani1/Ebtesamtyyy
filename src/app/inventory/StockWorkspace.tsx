'use client';

import { isStockLotExpired } from '@/lib/inventory-stock';
import { ReorderControls } from './ReorderControls';
import { InsightChart } from '../management/InsightChart';
import { FrostedSlideOverDrawer } from '@/components/ui/FrostedSlideOverDrawer';
import InventorySuppliesPhaseTwo from '@/components/phase2/InventorySuppliesPhaseTwo';
import LabManagementPhaseTwo from '@/components/phase2/LabManagementPhaseTwo';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  Bell,
  RefreshCw,
  FlaskConical,
  Syringe,
  Package,
  SlidersHorizontal,
} from 'lucide-react';

type Stock = {
  incomingOrders: { id: string; number: string; remaining: number }[];
  material: {
    id: string;
    sku: string;
    nameEn: string;
    nameAr: string;
    category: string;
    unit: string;
    reorderPoint: number;
    leadTimeDays: number | null;
    unitCostPiasters: number;
  };
  branch: { id: string; name: string; code: string };
  lots: {
    id: string;
    lotNumber: string;
    quantityOnHand: number;
    expiryDate: string;
    isQuarantined: boolean;
  }[];
};

export function StockWorkspace({
  stock,
  view,
  movements = [],
}: {
  stock: Stock[];
  view: string;
  movements?: { day: string; branchId: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const branchParam = params.get('branchId') || '';
  const materialParam = params.get('materialId') || '';
  const requestedSku = stock.find((item) => item.material.id === materialParam)?.material.sku || '';

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [router]);

  const { locale } = useLanguage();
  const ar = locale === 'ar';
  const t = (en: string, a: string) => (ar ? a : en);

  const [branch, setBranch] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(
    view === 'low' ? 'low' : view === 'expiry' ? 'expiry' : 'all'
  );
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  const [selectedRecord, setSelected] = useState<Stock | null>(null);
  const [stepQuantities, setStepQuantities] = useState<Record<string, number>>({});
  const [leadTimeDaysSlider, setLeadTimeDaysSlider] = useState<number>(7);

  const selected =
    stock.find(
      (item) =>
        item.material.id === selectedRecord?.material.id &&
        item.branch.id === selectedRecord?.branch.id
    ) || null;

  useEffect(() => {
    setBranch(branchParam);
    setQuery(requestedSku);
  }, [branchParam, requestedSku]);

  const now = Date.now();
  const soon = now + 90 * 86400000;
  const available = (r: Stock) =>
    r.lots
      .filter((l) => !l.isQuarantined && !isStockLotExpired(l.expiryDate))
      .reduce((s, l) => s + l.quantityOnHand, 0);

  const scoped = stock.filter((r) => !branch || r.branch.id === branch);
  const low = scoped.filter((r) => available(r) <= r.material.reorderPoint);
  const expired = scoped.filter((r) =>
    r.lots.some((l) => l.quantityOnHand > 0 && +new Date(l.expiryDate) <= soon)
  );
  const inTransitCount = scoped.filter((r) => r.incomingOrders.length > 0).length;

  const rows = scoped
    .filter((r) =>
      (r.material.nameEn + ' ' + r.material.nameAr + ' ' + r.material.sku)
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .filter(
      (r) =>
        filter === 'all' ||
        (filter === 'low' && available(r) <= r.material.reorderPoint) ||
        (filter === 'zero' && available(r) === 0) ||
        (filter === 'expiry' && expired.includes(r)) ||
        (filter === 'transit' && r.incomingOrders.length > 0)
    );

  const branches = Array.from(new Map(stock.map((r) => [r.branch.id, r.branch])).values());

  // Group filtered rows into 1 UNIFIED SMART CARD PER SKU (eliminating 3x repeated branch cards)
  const groupedMaterials = Array.from(
    rows.reduce((map, record) => {
      const list = map.get(record.material.id) || [];
      list.push(record);
      map.set(record.material.id, list);
      return map;
    }, new Map<string, Stock[]>())
  );

  const title =
    view === 'catalog'
      ? t('Product catalog', 'كتالوج المنتجات')
      : view === 'expiry'
      ? t('Expiry monitoring', 'متابعة الصلاحية')
      : view === 'low'
      ? t('Low stock & reordering', 'النواقص وإعادة الطلب')
      : t('Inventory overview', 'نظرة عامة للمخزون');

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* PHASE 2 INVENTORY & SUPPLIES + LAB MANAGEMENT SUITE (Images 8–14) */}
      <InventorySuppliesPhaseTwo role="clinic_owner" />
      <LabManagementPhaseTwo role="clinic_owner" />

      {/* ====================================================================
          FLOATING TOP INVENTORY COMMAND PILL BAR (Matching Reference Image 2)
         ==================================================================== */}
      <header className="bento-card rounded-full px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="text-lg font-black tracking-tight text-slate-400 select-none">ebt</span>
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              className="w-full ps-9 pe-4 py-2 rounded-full bg-[#F7F6F2] border border-slate-200/80 text-xs font-semibold text-[#0B2528] focus:bg-white"
              aria-label={t('Search products', 'بحث المنتجات')}
              placeholder={t('SKU search...', 'ابحث باسم المنتج أو رمزه...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Interactive Filter Pills with Counts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
              filter === 'all'
                ? 'bg-white text-[#0B2528] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-[#0B2528]'
            }`}
          >
            <span>{t('All', 'الكل')}</span>
            <span className="px-2 py-0.2 rounded-full bg-[#0B2528] text-white text-[11px] tabular-nums">
              {groupedMaterials.length || scoped.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('low')}
            aria-pressed={filter === 'low'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
              filter === 'low'
                ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-amber-800 hover:bg-amber-50/60'
            }`}
          >
            <span>{t('Low Stock', 'مخزون منخفض')}</span>
            <span className="px-2 py-0.2 rounded-full bg-amber-600 text-white text-[11px] tabular-nums">
              {low.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('transit')}
            aria-pressed={filter === 'transit'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
              filter === 'transit'
                ? 'bg-sky-50 text-sky-900 border border-sky-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{t('In Transit', 'قيد التوريد')}</span>
            <span className="px-2 py-0.2 rounded-full bg-[#0B2528] text-white text-[11px] tabular-nums">
              {inTransitCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('expiry')}
            aria-pressed={filter === 'expiry'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all active:scale-95 ${
              filter === 'expiry'
                ? 'bg-rose-50 text-rose-900 border border-rose-300 shadow-xs'
                : 'text-rose-700 hover:bg-rose-50/60'
            }`}
          >
            <span>{t('Expiry within 90 days', 'الصلاحية خلال ٩٠ يوماً')}</span>
            <span className="px-2 py-0.2 rounded-full bg-rose-600 text-white text-[11px] tabular-nums">
              {expired.length}
            </span>
          </button>
        </div>

        {/* Right Controls: Branch Filter + Purchase Requests Pill + Card/Table Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3.5 py-1.5 rounded-full bg-[#F7F6F2] border border-slate-200/80 text-xs font-bold text-[#0B2528]"
            aria-label={t('Branch', 'الفرع')}
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="">{t('All authorized branches', 'كل الفروع المصرح بها')}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <Link
            href="/purchasing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B2528] hover:bg-[#13393E] text-white text-xs font-extrabold shadow-sm transition-all active:scale-95"
          >
            <span className="relative">
              <Bell className="w-3.5 h-3.5 text-[#C8A96E]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
            </span>
            <span>{t('Purchase requests', 'طلبات الشراء')}</span>
          </Link>

          <div className="inline-flex p-0.5 rounded-full bg-[#F7F6F2] border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDisplayMode('card')}
              className={`px-3 py-1 rounded-full transition-all ${
                displayMode === 'card' ? 'bg-white text-[#0B2528] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Card
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`px-3 py-1 rounded-full transition-all ${
                displayMode === 'table' ? 'bg-white text-[#0B2528] shadow-2xs' : 'text-slate-500'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </header>

      {/* Screen-reader & page title header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2528]">{title}</h1>
          <p className="text-xs text-slate-500">
            {t(
              'Available quantities exclude expired and quarantined lots.',
              'الكميات المتاحة تستبعد الدفعات المنتهية والمعزولة.'
            )}
          </p>
        </div>
        <button
          type="button"
          className="secondary-button text-xs py-1.5 px-4"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('Refresh stock', 'تحديث المخزون')}</span>
        </button>
      </div>

      {/* ====================================================================
          1 UNIFIED SMART CARD PER SKU (Matching Reference Image 2)
         ==================================================================== */}
      {displayMode === 'card' ? (
        <div className="space-y-4">
          {groupedMaterials.map(([matId, branchRecords], skuIdx) => {
            const mat = branchRecords[0].material;
            const isSyringe =
              mat.nameEn.toLowerCase().includes('composite') ||
              mat.nameEn.toLowerCase().includes('syringe') ||
              skuIdx % 2 === 1;

            return (
              <article
                key={matId}
                className="bento-card p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-center"
              >
                {/* Left & Center: SKU Title + Horizontal Branch Depletion Bars */}
                <div className="xl:col-span-9 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#E6F0EE] text-[#0B2528] border border-[#0B2528]/10 flex items-center justify-center shrink-0">
                        {isSyringe ? (
                          <Syringe className="w-5 h-5 text-[#0B2528]" />
                        ) : (
                          <FlaskConical className="w-5 h-5 text-[#0B2528]" />
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelected(branchRecords[0])}
                          className="text-start hover:underline"
                        >
                          <h2 className="text-lg font-extrabold text-[#0B2528]">
                            {ar ? mat.nameAr : mat.nameEn}
                          </h2>
                        </button>
                        <p className="text-xs text-slate-500">
                          {mat.category} · <span className="font-mono">{mat.sku}</span> ({mat.unit})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelected(branchRecords[0])}
                      className="text-xs font-extrabold text-[#0B2528] hover:text-[#C8A96E] transition-colors"
                    >
                      {t('View batches & product details →', 'عرض الدفعات وتفاصيل المنتج ←')}
                    </button>
                  </div>

                  {/* Horizontal Branch Depletion Bars inside the Unified SKU Card */}
                  <div className="space-y-2.5 ps-0 sm:ps-14">
                    {branchRecords.map((rec, bIdx) => {
                      const qty = available(rec);
                      const threshold = rec.material.reorderPoint;
                      const isLow = qty <= threshold;
                      const maxBar = Math.max(qty * 1.4, threshold * 2.5, 40);
                      const pct = Math.min(100, Math.max(12, Math.round((qty / maxBar) * 100)));
                      const stepKey = `${rec.branch.id}_${rec.material.id}`;
                      const stepVal = stepQuantities[stepKey] ?? 10;
                      const onOrderTotal = rec.incomingOrders.reduce(
                        (s, o) => s + o.remaining,
                        0
                      );

                      return (
                        <div
                          key={rec.branch.id}
                          className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-2.5 rounded-2xl transition-colors ${
                            isLow
                              ? 'bg-amber-50/90 border border-amber-200/80'
                              : 'hover:bg-[#F7F6F2]/70'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelected(rec)}
                            className="w-28 shrink-0 text-start text-xs font-extrabold text-[#0B2528] truncate"
                          >
                            {t(`Branch ${bIdx + 1}`, `فرع ${bIdx + 1}`)} · {rec.branch.code}
                          </button>

                          {/* Color-Coded Depletion Bar */}
                          <div className="flex-1 min-w-[140px] h-3.5 rounded-full bg-emerald-950/10 overflow-hidden p-0.5">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                isLow
                                  ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                  : 'bg-gradient-to-r from-[#0B2528] via-emerald-600 to-[#14B8A6]'
                              }`}
                            />
                          </div>

                          {/* Quantity Readout & +On Order Badge */}
                          <div className="flex items-center gap-2 shrink-0 min-w-[135px] justify-end">
                            <strong className="text-xs font-extrabold text-[#0B2528] tabular-nums">
                              {qty} {rec.material.unit}
                            </strong>
                            {onOrderTotal > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold tabular-nums">
                                +{onOrderTotal} On Order
                              </span>
                            )}
                          </div>

                          {/* Circular - / + Stepper Buttons OR Reorder Pill Button */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              aria-label="Decrease step quantity"
                              onClick={() =>
                                setStepQuantities({
                                  ...stepQuantities,
                                  [stepKey]: Math.max(1, stepVal - 5),
                                })
                              }
                              className="w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#0B2528] font-bold text-xs flex items-center justify-center active:scale-95"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-xs font-extrabold tabular-nums">
                              {stepVal}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase step quantity"
                              onClick={() =>
                                setStepQuantities({
                                  ...stepQuantities,
                                  [stepKey]: stepVal + 5,
                                })
                              }
                              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center active:scale-95 ${
                                isLow
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                            >
                              +
                            </button>
                          </div>

                          {/* Preserve ReorderControls for automated tests & 1-click reorder */}
                          <div className="shrink-0">
                            <ReorderControls
                              incomingOrders={rec.incomingOrders}
                              materialId={rec.material.id}
                              branchId={rec.branch.id}
                              available={qty}
                              reorderPoint={threshold}
                              unit={rec.material.unit}
                              leadTimeDays={rec.material.leadTimeDays}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column of SKU Card: Quick FEFO Batch & Expiry Trigger Card */}
                <div className="xl:col-span-3 border-t xl:border-t-0 xl:border-s border-slate-100 pt-4 xl:pt-0 xl:ps-5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      {t('FEFO Batch Status', 'حالة الدفعات والصلاحية')}
                    </span>
                    <Package className="w-4 h-4 text-[#C8A96E]" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                      Safe
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold">
                      &lt;3m
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelected(branchRecords[0])}
                      className="px-3 py-1 rounded-full bg-[#F7F6F2] hover:bg-[#F9F5EB] border border-slate-200 text-[11px] font-extrabold text-[#0B2528]"
                    >
                      {t('Inspect Lots →', 'فحص الدفعات ←')}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Sleek Floating-Row Table View */
        <div className="surface-card overflow-x-auto">
          <table className="workflow-table">
            <thead>
              <tr>
                <th>{t('SKU & Material', 'المنتج والرمز')}</th>
                <th>{t('Branch', 'الفرع')}</th>
                <th>{t('Usable Stock', 'المتاح للاستخدام')}</th>
                <th>{t('Reorder Point', 'حد الطلب')}</th>
                <th>{t('Action', 'الإجراء')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const qty = available(r);
                return (
                  <tr key={r.branch.id + r.material.id}>
                    <td className="font-bold text-[#0B2528]">
                      {ar ? r.material.nameAr : r.material.nameEn}{' '}
                      <span className="font-mono text-xs text-slate-400">({r.material.sku})</span>
                    </td>
                    <td>{r.branch.name}</td>
                    <td className="font-extrabold tabular-nums">
                      {qty} {r.material.unit}
                    </td>
                    <td className="tabular-nums">{r.material.reorderPoint}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelected(r)}
                        className="secondary-button text-xs py-1 px-3"
                      >
                        {t('Batch details', 'تفاصيل الدفعات')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!rows.length && (
        <p className="surface-card text-xs text-slate-500">
          {t('No products match these filters.', 'لا توجد منتجات مطابقة.')}
        </p>
      )}

      {/* Optional Overview Charts */}
      {view === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <InsightChart
            mode="pie"
            title={t('Products by category (share)', 'المنتجات حسب الفئة (دائري)')}
            empty={t('No products', 'لا توجد منتجات')}
            rows={Array.from(new Set(scoped.map((r) => r.material.category))).map((label) => ({
              label,
              value: new Set(
                scoped.filter((r) => r.material.category === label).map((r) => r.material.id)
              ).size,
            }))}
          />
          <InsightChart
            mode="line"
            title={t('Stock activity · last 30 days', 'حركة المخزون خلال ٣٠ يوماً')}
            empty={t('No recorded movements', 'لا توجد حركات مسجلة')}
            rows={Array.from(
              new Set(movements.filter((m) => !branch || m.branchId === branch).map((m) => m.day))
            )
              .sort()
              .map((label) => ({
                label,
                value: movements.filter(
                  (m) => m.day === label && (!branch || m.branchId === branch)
                ).length,
              }))}
          />
        </div>
      )}

      {/* ====================================================================
          FROSTED SLIDE-OVER BATCH & EXPIRY DRAWER (Matching Reference Image 2)
         ==================================================================== */}
      <FrostedSlideOverDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `Batch & Expiry - ${ar ? selected.material.nameAr : selected.material.nameEn}`
            : t('Product detail', 'تفاصيل المنتج')
        }
        subtitle={selected ? `${selected.branch.name} · ${selected.material.sku}` : ''}
        iconBadge={<SlidersHorizontal className="w-5 h-5" />}
        ariaLabel={t('Product detail', 'تفاصيل المنتج')}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelected(null)}
            >
              {t('Close', 'إغلاق')}
            </button>
            <Link className="primary-button" href="/purchasing">
              {t('Request supplies', 'طلب مستلزمات')}
            </Link>
          </div>
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* FEFO Expiry Status Pills matching Reference Image 2 */}
            <div className="space-y-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                FEFO expiry
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-xs">
                  Safe
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-white text-xs font-extrabold shadow-xs">
                  &lt;3m
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white text-xs font-extrabold shadow-xs">
                  Expiring Soon
                </span>
              </div>

              <div className="space-y-1.5 pt-2 text-xs font-bold">
                <div className="flex items-center gap-2 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>
                    {t('Stock on hand', 'المخزون الفعلي')}:{' '}
                    {selected.lots.reduce((sum, lot) => sum + lot.quantityOnHand, 0)}{' '}
                    {selected.material.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#0B2528]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>
                    {t('Available', 'المتاح')}: {available(selected)} {selected.material.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Lead-Time Slider matching Reference Image 2 */}
            <div className="p-4 rounded-2xl bg-[#F7F6F2] border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#0B2528]">
                <span>Lead-time slider</span>
                <span className="font-mono text-[#C8A96E]">
                  {leadTimeDaysSlider || selected.material.leadTimeDays || 7}d
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={21}
                value={leadTimeDaysSlider}
                onChange={(e) => setLeadTimeDaysSlider(Number(e.target.value))}
                className="w-full accent-[#0B2528] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span>1w</span>
                <span>High</span>
              </div>
            </div>

            {/* Reorder Controls */}
            <ReorderControls
              incomingOrders={selected.incomingOrders}
              materialId={selected.material.id}
              branchId={selected.branch.id}
              available={available(selected)}
              reorderPoint={selected.material.reorderPoint}
              unit={selected.material.unit}
              leadTimeDays={selected.material.leadTimeDays}
            />

            {/* Detailed Batch Lots List */}
            <div className="space-y-2.5 pt-2">
              <h3 className="text-sm font-extrabold text-[#0B2528]">
                {t('Batch details', 'تفاصيل الدفعات')}
              </h3>
              <div className="space-y-2">
                {selected.lots.map((l) => {
                  const expiredLot = isStockLotExpired(l.expiryDate);
                  const expiringSoon = +new Date(l.expiryDate) <= soon;
                  return (
                    <div
                      className="p-3.5 rounded-2xl bg-[#F7F6F2] border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                      key={l.id}
                    >
                      <div>
                        <b className="font-mono text-[#0B2528] block">{l.lotNumber}</b>
                        <p className="text-slate-600 mt-0.5 tabular-nums">
                          {l.quantityOnHand} {selected.material.unit} · {l.expiryDate.slice(0, 10)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full font-extrabold text-[11px] ${
                          l.isQuarantined || expiredLot
                            ? 'bg-rose-100 text-rose-800'
                            : expiringSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {l.isQuarantined
                          ? t('Quarantined', 'معزول')
                          : expiredLot
                          ? t('Expired', 'منتهي الصلاحية')
                          : expiringSoon
                          ? t('Expiring soon', 'قريب الانتهاء')
                          : t('Within shelf life', 'ساري الصلاحية')}
                      </span>
                    </div>
                  );
                })}
                {!selected.lots.length && (
                  <p className="text-xs text-slate-500">
                    {t('No recorded batches', 'لا توجد دفعات مسجلة')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </FrostedSlideOverDrawer>
    </main>
  );
}
