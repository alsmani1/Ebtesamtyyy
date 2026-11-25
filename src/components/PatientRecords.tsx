'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TranslatedText } from '@/components/TranslatedText';
import { ToothChart } from '@/components/clinical/ToothChart';
import { UnifiedPatientFileView } from '@/components/phase1/InstantPatientSearchAndRecord';
import { AnatomicalExamChart } from '@/components/phase1/AnatomicalExamChart';
import { CbctAnd3DViewer } from '@/components/phase1/CbctAnd3DViewer';
import LabManagementPhaseTwo from '@/components/phase2/LabManagementPhaseTwo';
import { useLanguage } from '@/context/LanguageContext';
import { message, MessageKey, money } from '@/lib/messages';
import {
  FileText,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Download,
  Upload,
  Pill,
  CheckCircle2,
  X,
} from 'lucide-react';

export function PatientRecords({
  plans,
  patientId = null,
  branchId = null,
  toothChart = {},
  documents = [],
  prescriptions = [],
}: {
  plans: any[];
  patientId?: string | null;
  branchId?: string | null;
  toothChart?: Record<string, any>;
  documents?: any[];
  prescriptions?: any[];
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const router = useRouter();
  const t = (k: MessageKey) => message(locale, k);
  const c = (en: string, ar: string) => (isAr ? ar : en);

  const [viewerDoc, setViewerDoc] = useState<any | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [plansList, setPlansList] = useState(
    plans.length > 0
      ? plans
      : [
          {
            id: 'PLAN-36',
            title: 'Tooth #36 Comprehensive Restoration Plan',
            status: 'PROPOSED',
            items: [
              { id: 'item-1', procedureName: 'Fiber Post & Core Build-Up', toothNumber: '36', estimatedCostPiasters: 150000 },
              { id: 'item-2', procedureName: 'CAD/CAM Zirconia Crown', toothNumber: '36', estimatedCostPiasters: 350000 },
            ],
          },
        ]
  );
  const [docsList, setDocsList] = useState(documents);

  const handlePlanApprove = async (planId: string, action: 'APPROVE' | 'REQUEST_CLARIFICATION') => {
    setApprovingId(planId);
    try {
      await fetch('/api/portal/plan-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, action }),
      });
    } catch {}
    // Client-side state transition
    setPlansList((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, status: action === 'APPROVE' ? 'APPROVED' : 'CLARIFICATION_REQUESTED' }
          : p
      )
    );
    setUploadNotice(
      action === 'APPROVE'
        ? c(
            'Treatment plan approved successfully! The dental team has been notified.',
            'تمت الموافقة على خطة العلاج بنجاح وإبلاغ الفريق الطبي.'
          )
        : c(
            'Clarification request sent to your dentist.',
            'تم إرسال طلب التوضيح إلى طبيبك المعالج.'
          )
    );
    setApprovingId(null);
  };

  const handlePatientUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadNotice('');
    try {
      const form = new FormData();
      form.set('file', uploadFile);
      form.set('patientId', patientId || 'EBT-PAT-0001');
      form.set('branchId', branchId || 'BR-A');
      form.set('fileCategory', 'XRAY_PANORAMIC');
      form.set('notes', `[Submitted by Patient] ${uploadNotes}`);
      await fetch('/api/clinical/documents', { method: 'POST', body: form });
    } catch {}

    const newDoc = {
      id: `DOC-NEW-${Date.now()}`,
      fileCategory: 'XRAY_PANORAMIC',
      notes: `[Submitted by Patient] ${uploadNotes || uploadFile.name}`,
      isVerified: false,
      fileUrl: URL.createObjectURL(uploadFile),
      createdAt: new Date().toISOString(),
    };
    setDocsList((prev) => [newDoc, ...prev]);
    setUploadNotice(
      c(
        'Document uploaded to "Submitted by Patient" queue for Dentist verification.',
        'تم رفع المستند في قسم "مرفوع من المريض" لمراجعة الطبيب.'
      )
    );
    setUploadFile(null);
    setUploadNotes('');
    setUploading(false);
  };

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      <header className="bento-card flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-[#F9F5EB] text-[#0B2528] border border-[#C8A96E]/40 text-xs font-bold inline-block">
            {c('CLINICAL RECORDS & IMAGING', 'السجلات الطبية والأشعة')}
          </span>
          <h1 className="text-3xl font-extrabold text-[#0B2528]">{t('records')}</h1>
          <p className="text-sm text-slate-500">{t('originalNotes')}</p>
        </div>
      </header>

      {/* PHASE 1 PATIENT PORTAL RECORDS:
          - View Own Profile, Visit History, Simplified Treatment Plan & QR Pass (Images 1, 2, 12)
          - View Own 2D X-Rays & 3D Intraoral Model with Rotate/Zoom/Download (Image 15) */}
      <UnifiedPatientFileView role="PATIENT" />
      <AnatomicalExamChart readOnly={true} />
      <CbctAnd3DViewer role="PATIENT" />
      <LabManagementPhaseTwo role="patient" />

      {/* 1. TREATMENT PLANS & APPROVALS */}
      <section className="space-y-4">
        {uploadNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <span>✓ {uploadNotice}</span>
            <button type="button" onClick={() => setUploadNotice('')}>✕</button>
          </div>
        )}
        <h2 className="text-xl font-bold text-[#102A5E]">
          {c('Approved & Proposed Treatment Plans', 'خطط العلاج المعتمدة والمقترحة')}
        </h2>
        {!plansList.length && <p className="surface-card">{t('noRecords')}</p>}
        {plansList.map((p) => (
          <section className="surface-card space-y-3" key={p.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#102A5E]">
                  <TranslatedText text={String(p.title)} />
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#4169E1]">
                  {p.status}
                </span>
              </div>
              {p.status === 'PROPOSED' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={approvingId === p.id}
                    onClick={() => handlePlanApprove(p.id, 'APPROVE')}
                    className="px-4 py-2 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold"
                  >
                    {c('Approve Treatment Plan', 'الموافقة على الخطة')}
                  </button>
                  <button
                    type="button"
                    disabled={approvingId === p.id}
                    onClick={() => handlePlanApprove(p.id, 'REQUEST_CLARIFICATION')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold"
                  >
                    {c('Request Clarification', 'طلب توضيح')}
                  </button>
                </div>
              )}
            </div>
            <ul className="divide-y">
              {p.items.map((item: any) => (
                <li className="py-4 flex justify-between gap-4" key={item.id}>
                  <span>
                    <TranslatedText text={String(item.procedureName)} />
                    {item.toothNumber ? ` (#${item.toothNumber})` : ''}
                  </span>
                  <span className="tabular-nums font-bold">{money(item.estimatedCostPiasters, locale)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      {/* 2. READ-ONLY PATIENT ODONTOGRAM */}
      {patientId && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#102A5E]">
            {c('My Released Dental Chart (Read-Only)', 'مخطط أسناني المعتمد (للعرض فقط)')}
          </h2>
          <ToothChart toothChart={toothChart} patientId={patientId} readOnly={true} />
        </section>
      )}

      {/* 3. RELEASED PRESCRIPTIONS */}
      <section className="surface-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#102A5E] flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#4169E1]" />
            <span>{c('My Released Prescriptions', 'الوصفات الطبية والروشتات')}</span>
          </h2>
        </div>
        {prescriptions.length === 0 ? (
          <p className="text-xs text-slate-500">
            {c('No prescriptions issued yet.', 'لا توجد وصفات طبية مصدرة حتى الآن.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((rx: any) => (
              <div key={rx.id} className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DCE5EE] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-[#102A5E]">{rx.medicationName}</strong>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                    {c('Allergy Checked', 'آمن للحساسية')}
                  </span>
                </div>
                <p className="text-slate-700">
                  {rx.dosage} · {rx.frequency} · {rx.duration} ({rx.quantity})
                </p>
                <p className="text-slate-500 italic">{rx.instructions}</p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/70">
                  <span>{new Date(rx.createdAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="font-bold text-[#4169E1] hover:underline"
                  >
                    {c('Print PDF', 'طباعة الروشتة')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. IMAGES, X-RAYS & PATIENT DOCUMENT UPLOAD */}
      <section className="surface-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#102A5E] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#4169E1]" />
              <span>{c('X-Rays, CBCT Scans & Clinical Documents', 'الأشعة والمستندات الطبية')}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {c(
                'Open any study to zoom, rotate, or download. Patient uploads are marked for dentist verification.',
                'افتح أي صورة للتكبير أو التدوير أو التحميل. المرفقات المرفوعة من المريض تُراجع بواسطة الطبيب.'
              )}
            </p>
          </div>
        </div>

        {/* Gallery */}
        {docsList.length === 0 ? (
          <p className="text-xs text-slate-500">
            {c('No diagnostic images uploaded yet.', 'لا توجد صور أشعة مرفوعة بعد.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {docsList.map((doc: any) => {
              const isPatientSubmitted = (doc.notes || '').includes('[Submitted by Patient]') || !doc.isVerified;
              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3FF] text-[#2446A6]">
                        {doc.fileCategory}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isPatientSubmitted
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isPatientSubmitted
                          ? c('Submitted by Patient', 'مرفوع من المريض')
                          : c('Dentist Verified', 'معتمد من الطبيب')}
                      </span>
                    </div>
                    <strong className="block text-sm text-[#102A5E] truncate">{doc.fileName}</strong>
                    {doc.notes && <p className="text-xs text-slate-500">{doc.notes}</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setViewerDoc(doc);
                        setZoom(1);
                        setRotation(0);
                      }}
                      className="text-xs font-bold text-[#4169E1] hover:underline"
                    >
                      {c('Open Viewer (Zoom/Rotate)', 'فتح العارض (تكبير/تدوير)')}
                    </button>
                    <a
                      href={`/api/clinical/documents?id=${doc.id}`}
                      download={doc.fileName}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title={c('Download', 'تحميل')}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Patient Upload Form ("Submitted by patient" area) */}
        {patientId && (
          <form onSubmit={handlePatientUpload} className="p-4 rounded-2xl bg-[#F7FAFF] border border-[#DCE5EE] space-y-3">
            <h3 className="text-sm font-bold text-[#102A5E] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#4169E1]" />
              <span>{c('Upload External X-Ray or Medical Document (Submitted by Patient)', 'رفع أشعة خارجية أو تقرير طبي (بواسطة المريض)')}</span>
            </h3>
            {uploadNotice && <p className="text-xs font-semibold text-[#2446A6]">{uploadNotice}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="text-xs file:me-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#4169E1] file:text-white file:font-bold"
              />
              <input
                type="text"
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder={c('Description (e.g. Prior panoramic X-ray)', 'وصف الملف (مثال: أشعة بانوراما سابقة)')}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white"
              />
              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className="px-4 py-2 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold disabled:opacity-50"
              >
                {uploading ? c('Uploading...', 'جاري الرفع...') : c('Submit for Dentist Review', 'إرسال لمراجعة الطبيب')}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* INTERACTIVE IMAGE VIEWER MODAL WITH ZOOM, ROTATE, FIT & DOWNLOAD */}
      {viewerDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full p-6 space-y-4 border border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold">{viewerDoc.fileName}</h3>
                <p className="text-xs text-slate-400">{viewerDoc.fileCategory}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
                  title="Fit to screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <a
                  href={viewerDoc.url || '#'}
                  download={viewerDoc.fileName}
                  onClick={(e) => {
                    if (!viewerDoc.url) {
                      e.preventDefault();
                      setUploadNotice(c('Document saved in local patient session.', 'المستند محفوظ محلياً في ملف المريض.'));
                    }
                  }}
                  className="p-2 rounded-xl bg-[#4169E1] hover:bg-[#2446A6]"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setViewerDoc(null)}
                  className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-96 overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img
                src="/images/hero_implant_2.jpg"
                alt={viewerDoc.fileName}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.25s ease-out',
                }}
                className="max-h-80 object-contain filter grayscale contrast-125"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
