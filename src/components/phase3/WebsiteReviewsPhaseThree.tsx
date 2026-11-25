"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Star, CheckCircle2, Send, AlertCircle, MessageSquareReply } from "lucide-react";
import type { Phase2Role } from "../phase2/FinanceCenterPhaseTwo";
import { CLINIC_WHATSAPP_NUMBER, CLINIC_WHATSAPP_WA_LINK } from "./InboxWhatsAppPhaseThree";
import type { MinyaBranchCode } from "@/config/minya-clinic-store";

export const SHARED_REVIEWS_STORAGE_KEY = "ebtesamty_shared_reviews_v3";
export const SHARED_REVIEWS_EVENT = "ebtesamty-shared-reviews-sync";

export interface VerifiedReviewItem {
  id: string;
  visitId: string;
  patientDisplayName: string;
  rating: number;
  commentEn: string;
  commentAr: string;
  doctorEn: string;
  doctorAr: string;
  branchCode: "BR-A" | "BR-B" | "BR-C";
  branchNameEn: string;
  branchNameAr: string;
  publishedOnWebsite: boolean;
  isNew?: boolean;
  acknowledged?: boolean;
  receptionReply?: string;
}

export const INITIAL_REVIEWS: VerifiedReviewItem[] = [
  {
    id: "REV-1",
    visitId: "VIS-901",
    patientDisplayName: "Mona R.",
    rating: 5,
    commentEn: "The doctor explained every step, and booking on the website was easy.",
    commentAr: "الطبيب شرح كل خطوة بوضوح، والحجز عبر الموقع كان سهلاً جداً.",
    doctorEn: "Dr. Sandy Saad",
    doctorAr: "د. ساندي سعد",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    publishedOnWebsite: true,
    isNew: false,
    acknowledged: true,
  },
  {
    id: "REV-2",
    visitId: "VIS-902",
    patientDisplayName: "Karim S.",
    rating: 5,
    commentEn: "I didn’t wait in the waiting room at all.",
    commentAr: "لم أنتظر في غرفة الانتظار على الإطلاق، الموعد كان دقيقاً.",
    doctorEn: "Dr. Feby Samer",
    doctorAr: "د. فيبي سامر",
    branchCode: "BR-A",
    branchNameEn: "Minya – Branch A",
    branchNameAr: "المنيا – الفرع أ",
    publishedOnWebsite: true,
    isNew: false,
    acknowledged: true,
  },
  {
    id: "REV-3",
    visitId: "VIS-903",
    patientDisplayName: "Hoda K.",
    rating: 4,
    commentEn: "The WhatsApp reminder helped me not forget.",
    commentAr: "رسالة التذكير على واتساب ساعدتني ألا أنسى الموعد.",
    doctorEn: "Dr. Ahmed Hassan",
    doctorAr: "د. أحمد حسن",
    branchCode: "BR-B",
    branchNameEn: "Minya – Branch B",
    branchNameAr: "المنيا – الفرع ب",
    publishedOnWebsite: true,
    isNew: false,
    acknowledged: false,
  },
];

export default function WebsiteReviewsPhaseThree({
  role = "clinic_owner",
  activeBranchCode = "ALL",
  doctorNameFilter,
}: {
  role?: Phase2Role | "public";
  activeBranchCode?: MinyaBranchCode;
  doctorNameFilter?: string;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [reviews, setReviewsState] = useState<VerifiedReviewItem[]>(INITIAL_REVIEWS);

  // Sync shared reviews store across /patient/reviews, /reception/reviews, /doctor/reports, and /owner/reviews
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(SHARED_REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviewsState(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }

    const handleSync = () => {
      try {
        const latest = window.localStorage.getItem(SHARED_REVIEWS_STORAGE_KEY);
        if (latest) {
          const parsed = JSON.parse(latest);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviewsState(parsed);
          }
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(SHARED_REVIEWS_EVENT, handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SHARED_REVIEWS_EVENT, handleSync);
    };
  }, []);

  const setReviews: React.Dispatch<React.SetStateAction<VerifiedReviewItem[]>> = (updater) => {
    setReviewsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(SHARED_REVIEWS_STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(SHARED_REVIEWS_EVENT));
        } catch {
          // Ignore storage write errors
        }
      }
      return next;
    });
  };

  const [selectedCompletedVisitId, setSelectedCompletedVisitId] = useState("VIS-904");
  const [selectedReviewBranch, setSelectedReviewBranch] = useState("Minya – Branch A");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const completedVisitsForPatient = [
    {
      visitId: "VIS-904",
      branchCode: "BR-A" as const,
      branchNameEn: "Minya – Branch A",
      branchNameAr: "المنيا – الفرع أ",
      doctorEn: "Dr. Sandy Saad",
      doctorAr: "د. ساندي سعد",
      labelEn: "Completed Visit #VIS-904 — Root Canal & Filling (Dr. Sandy Saad · Minya – Branch A)",
      labelAr: "زيارة مكتملة #VIS-904 — حشو عصب وتجميل (د. ساندي سعد · المنيا – الفرع أ)",
    },
    {
      visitId: "VIS-906",
      branchCode: "BR-A" as const,
      branchNameEn: "Minya – Branch A",
      branchNameAr: "المنيا – الفرع أ",
      doctorEn: "Dr. Feby Samer",
      doctorAr: "د. فيبي سامر",
      labelEn: "Completed Visit #VIS-906 — Porcelain Veneer Consultation (Dr. Feby Samer · Minya – Branch A)",
      labelAr: "زيارة مكتملة #VIS-906 — استشارة فينير تجميلي (د. فيبي سامر · المنيا – الفرع أ)",
    },
    {
      visitId: "VIS-905",
      branchCode: "BR-B" as const,
      branchNameEn: "Minya – Branch B",
      branchNameAr: "المنيا – الفرع ب",
      doctorEn: "Dr. Ahmed Hassan",
      doctorAr: "د. أحمد حسن",
      labelEn: "Completed Visit #VIS-905 — Ultrasonic Scaling & Polishing (Dr. Ahmed Hassan · Minya – Branch B)",
      labelAr: "زيارة مكتملة #VIS-905 — تنظيف الجير وتلميع الأسنان (د. أحمد حسن · المنيا – الفرع ب)",
    },
    {
      visitId: "VIS-907",
      branchCode: "BR-C" as const,
      branchNameEn: "Minya – Branch C",
      branchNameAr: "المنيا – الفرع ج",
      doctorEn: "Dr. Nadia El-Hariry",
      doctorAr: "د. نادية الحريري",
      labelEn: "Completed Visit #VIS-907 — Orthodontic Checkup (Dr. Nadia El-Hariry · Minya – Branch C)",
      labelAr: "زيارة مكتملة #VIS-907 — متابعة تقويم الأسنان (د. نادية الحريري · المنيا – الفرع ج)",
    },
    {
      visitId: "VIS-901",
      branchCode: "BR-A" as const,
      branchNameEn: "Minya – Branch A",
      branchNameAr: "المنيا – الفرع أ",
      doctorEn: "Dr. Sandy Saad",
      doctorAr: "د. ساندي سعد",
      labelEn: "Completed Visit #VIS-901 — Consultation & Scaling (Already Reviewed)",
      labelAr: "زيارة مكتملة #VIS-901 — كشف وتنظيف جير (تم تقييمها مسبقاً)",
    },
  ];

  const [ownerBranchFilter, setOwnerBranchFilter] = useState<"ALL" | "BR-A" | "BR-B" | "BR-C">("ALL");
  const [ownerDoctorFilter, setOwnerDoctorFilter] = useState<string>("ALL");
  const [ownerAckFilter, setOwnerAckFilter] = useState<"ALL" | "ACK" | "PENDING">("ALL");

  const uniqueDoctors = useMemo(
    () => Array.from(new Set(reviews.map((r) => r.doctorEn))),
    [reviews]
  );

  // Filter reviews by role (Doctor -> own feedback, Receptionist -> branch, Owner -> interactive filters)
  const visibleReviews = useMemo(() => {
    let list = reviews;
    if (role === "doctor" && doctorNameFilter) {
      list = list.filter(
        (r) =>
          r.doctorEn.toLowerCase().includes(doctorNameFilter.toLowerCase()) ||
          r.doctorAr.includes(doctorNameFilter)
      );
    } else if (role === "receptionist" && activeBranchCode && activeBranchCode !== "ALL") {
      list = list.filter((r) => !r.branchCode || r.branchCode === activeBranchCode);
    } else if (role === "clinic_owner") {
      const effectiveBranch = ownerBranchFilter !== "ALL" ? ownerBranchFilter : activeBranchCode;
      if (effectiveBranch && effectiveBranch !== "ALL") {
        list = list.filter((r) => !r.branchCode || r.branchCode === effectiveBranch);
      }
      if (ownerDoctorFilter !== "ALL") {
        list = list.filter((r) => r.doctorEn === ownerDoctorFilter);
      }
      if (ownerAckFilter === "ACK") {
        list = list.filter((r) => r.acknowledged);
      } else if (ownerAckFilter === "PENDING") {
        list = list.filter((r) => !r.acknowledged);
      }
    }
    return list;
  }, [
    reviews,
    role,
    activeBranchCode,
    doctorNameFilter,
    ownerBranchFilter,
    ownerDoctorFilter,
    ownerAckFilter,
  ]);

  const averageRating = useMemo(() => {
    if (visibleReviews.length === 0) return "5.0";
    const sum = visibleReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / visibleReviews.length).toFixed(1);
  }, [visibleReviews]);

  const handlePatientSubmitReview = () => {
    setDuplicateAlert(null);
    const alreadyExists = reviews.some((r) => r.visitId === selectedCompletedVisitId);
    if (alreadyExists) {
      setDuplicateAlert(
        isAr
          ? "تقييم واحد لكل زيارة مكتملة: هذه الزيارة تم تقييمها بالفعل لمنع التكرار."
          : "One review per completed visit: A verified review already exists for this completed visit."
      );
      return;
    }
    if (!newComment.trim()) return;

    const visitMeta =
      completedVisitsForPatient.find((v) => v.visitId === selectedCompletedVisitId) ||
      completedVisitsForPatient[0];

    const branchCodeFromSelect: "BR-A" | "BR-B" | "BR-C" =
      selectedReviewBranch === "Minya – Branch B"
        ? "BR-B"
        : selectedReviewBranch === "Minya – Branch C"
        ? "BR-C"
        : "BR-A";

    const branchArFromSelect =
      branchCodeFromSelect === "BR-B"
        ? "المنيا – الفرع ب"
        : branchCodeFromSelect === "BR-C"
        ? "المنيا – الفرع ج"
        : "المنيا – الفرع أ";

    const doctorEnForBranch =
      branchCodeFromSelect === "BR-B"
        ? "Dr. Ahmed Hassan"
        : branchCodeFromSelect === "BR-C"
        ? "Dr. Nadia El-Hariry"
        : visitMeta.doctorEn;

    const doctorArForBranch =
      branchCodeFromSelect === "BR-B"
        ? "د. أحمد حسن"
        : branchCodeFromSelect === "BR-C"
        ? "د. نادية الحريري"
        : visitMeta.doctorAr;

    setReviews((prev) => [
      {
        id: `REV-${Date.now()}`,
        visitId: selectedCompletedVisitId,
        patientDisplayName: `Passant (${selectedReviewBranch})`,
        rating: newRating,
        commentEn: newComment.trim(),
        commentAr: newComment.trim(),
        doctorEn: doctorEnForBranch,
        doctorAr: doctorArForBranch,
        branchCode: branchCodeFromSelect,
        branchNameEn: selectedReviewBranch,
        branchNameAr: branchArFromSelect,
        publishedOnWebsite: true,
        isNew: true,
        acknowledged: false,
      },
      ...prev,
    ]);
    setNewComment("");
  };

  const handleAcknowledgeOrReply = (reviewId: string, customReply?: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              isNew: false,
              acknowledged: true,
              receptionReply:
                customReply?.trim() ||
                r.receptionReply ||
                "Thank you for your feedback! — Ebtesamty Minya Front Desk",
            }
          : r
      )
    );
    setReplyingReviewId(null);
    setReplyDraft("");
  };

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "تقييمات المرضى على موقع العيادة" : "Reviews on your website"}
      className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
    >
      {/* HEADER WITH LIVE AVERAGE STAR RATING & OWNER FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-black text-slate-900">
            {role === "doctor"
              ? isAr
                ? `آراء وتقييمات المرضى — ${doctorNameFilter || "مرضاي"}`
                : `Patient Feedback & Reviews — ${doctorNameFilter || "My Patients"}`
              : isAr
              ? "تقييمات المرضى على الموقع"
              : "Reviews on your website"}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-black text-amber-800 tabular-nums">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>
              {averageRating} / 5.0 ({visibleReviews.length}{" "}
              {isAr ? "تقييمات" : visibleReviews.length === 1 ? "review" : "reviews"})
            </span>
          </span>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-black text-emerald-700">
          {isAr
            ? "جميع التقييمات مرتبطة بزيارات مكتملة وموثقة"
            : "Every review has a completed visit behind it"}
        </span>
      </div>

      {/* Owner Branch, Doctor & Acknowledgment Filters */}
      {role === "clinic_owner" && (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
          <select
            aria-label={isAr ? "تصفية التقييمات حسب الفرع" : "Filter reviews by branch"}
            value={ownerBranchFilter}
            onChange={(e) => setOwnerBranchFilter(e.target.value as typeof ownerBranchFilter)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
          >
            <option value="ALL">{isAr ? "كل فروع المنيا" : "All Minya Branches"}</option>
            <option value="BR-A">{isAr ? "المنيا – فرع أ" : "Minya – Branch A"}</option>
            <option value="BR-B">{isAr ? "المنيا – فرع ب" : "Minya – Branch B"}</option>
            <option value="BR-C">{isAr ? "المنيا – فرع ج" : "Minya – Branch C"}</option>
          </select>

          <select
            aria-label={isAr ? "تصفية التقييمات حسب الطبيب" : "Filter reviews by doctor"}
            value={ownerDoctorFilter}
            onChange={(e) => setOwnerDoctorFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
          >
            <option value="ALL">{isAr ? "كل الأطباء" : "All Doctors"}</option>
            {uniqueDoctors.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>

          <select
            aria-label={isAr ? "تصفية التقييمات حسب حالة الرد" : "Filter reviews by acknowledgment status"}
            value={ownerAckFilter}
            onChange={(e) => setOwnerAckFilter(e.target.value as typeof ownerAckFilter)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
          >
            <option value="ALL">{isAr ? "كل حالات الرد" : "All Acknowledgment Statuses"}</option>
            <option value="ACK">{isAr ? "تم الرد والتأكيد ✓" : "Acknowledged / Replied ✓"}</option>
            <option value="PENDING">{isAr ? "بانتظار الرد / جديد" : "Pending Reply / New"}</option>
          </select>
        </div>
      )}

      {/* REVIEW ROWS + REAL-TIME "NEW" BADGE & RECEPTIONIST REPLY/ACKNOWLEDGE */}
      <div className="mt-4 space-y-3">
        {visibleReviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {rev.patientDisplayName}
                  </span>
                  {rev.isNew && (
                    <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-black text-white">
                      {isAr ? "جديد" : "New"}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3.5 w-3.5 ${
                          idx < rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-amber-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    · {isAr ? rev.doctorAr : rev.doctorEn} ·{" "}
                    {isAr
                      ? rev.branchNameAr || "المنيا – فرع أ"
                      : rev.branchNameEn || "Minya – Branch A"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {isAr ? rev.commentAr : rev.commentEn}
                </p>
                {rev.receptionReply && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {isAr ? "رد مكتب الاستقبال:" : "Front-Desk Reply:"} {rev.receptionReply}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-black text-emerald-700">
                  {isAr ? "زيارة مكتملة ✓" : "Completed visit ✓"}
                </span>

                {(role === "receptionist" || role === "clinic_owner") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (replyingReviewId === rev.id) {
                        setReplyingReviewId(null);
                      } else {
                        setReplyingReviewId(rev.id);
                        setReplyDraft(rev.receptionReply || "");
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-black transition ${
                      rev.acknowledged
                        ? "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <MessageSquareReply className="h-3.5 w-3.5" />
                    <span>
                      {rev.acknowledged
                        ? isAr
                          ? "تم الرد ✓"
                          : "Acknowledged ✓"
                        : isAr
                        ? "رد / تأكيد الاستلام"
                        : "Reply / Acknowledge"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {replyingReviewId === rev.id && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 text-xs">
                <input
                  type="text"
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder={
                    isAr
                      ? "اكتب رد مكتب الاستقبال على تقييم المريض..."
                      : "Write a front-desk acknowledgment or reply to this review..."
                  }
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleAcknowledgeOrReply(rev.id, replyDraft)}
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 font-bold text-white hover:bg-blue-700"
                >
                  {isAr ? "حفظ الرد وتأكيد الاستلام" : "Save Reply & Acknowledge"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Role-Specific Footer / Controls */}
      {role === "patient" && (
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3 text-xs"
        >
          <div className="font-black text-slate-900">
            {isAr
              ? "أضف تقييمك لزيارتك المكتملة (تقييم واحد لكل زيارة مكتملة)"
              : "Submit a Review for Your Completed Visit (One review per completed visit)"}
          </div>

          {duplicateAlert && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 font-bold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{duplicateAlert}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={selectedCompletedVisitId}
              onChange={(e) => setSelectedCompletedVisitId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800"
            >
              {completedVisitsForPatient.map((v) => (
                <option key={v.visitId} value={v.visitId}>
                  {isAr ? v.labelAr : v.labelEn}
                </option>
              ))}
            </select>

            <select
              aria-label={isAr ? "فرع المنيا" : "Minya Branch"}
              value={selectedReviewBranch}
              onChange={(e) => setSelectedReviewBranch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-800"
            >
              <option value="Minya – Branch A">
                {isAr ? "المنيا – فرع أ" : "Minya – Branch A"}
              </option>
              <option value="Minya – Branch B">
                {isAr ? "المنيا – فرع ب" : "Minya – Branch B"}
              </option>
              <option value="Minya – Branch C">
                {isAr ? "المنيا – فرع ج" : "Minya – Branch C"}
              </option>
            </select>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              {/* Interactive 5-Star Clickable Selector (1 to 5 stars) */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setNewRating(starValue)}
                    aria-label={`Rate ${starValue} out of 5 stars`}
                    className="p-0.5 transition hover:scale-110"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        starValue <= newRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <select
                aria-label={isAr ? "تقييم النجوم من 1 إلى 5" : "Star rating 1 to 5"}
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="bg-transparent font-bold text-amber-600 focus:outline-none"
              >
                <option value={5}>★★★★★ (5/5)</option>
                <option value={4}>★★★★☆ (4/5)</option>
                <option value={3}>★★★☆☆ (3/5)</option>
                <option value={2}>★★☆☆☆ (2/5)</option>
                <option value={1}>★☆☆☆☆ (1/5)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب رأيك في الزيارة ليظهر على موقع العيادة..."
                  : "Write your impression while it is still fresh..."
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-800"
            />
            <button
              type="button"
              onClick={handlePatientSubmitReview}
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              {isAr ? "نشر التقييم" : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {(role === "clinic_owner" || role === "receptionist") && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {isAr
              ? `يتم إرسال طلب التقييم تلقائياً عبر واتساب (${CLINIC_WHATSAPP_NUMBER}) بعد كل زيارة مكتملة — تقييمات حقيقية بدون تكرار.`
              : `Automatic review request sent via WhatsApp (${CLINIC_WHATSAPP_NUMBER}) after every completed visit — real numbers, no duplicates.`}
          </span>
          <a
            href={`${CLINIC_WHATSAPP_WA_LINK}?text=${encodeURIComponent(
              isAr
                ? "شكراً لزيارتك عيادات ابتسامتي! يسعدنا مشاركة تقييمك الموثق للزيارة."
                : "Thank you for completing your visit at Ebtesamty Clinic! Please share your verified review."
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
          >
            <Send className="h-3 w-3" />
            {isAr ? "إرسال دعوة تقييم بعد الزيارة ←" : "Send post-visit review invite →"}
          </a>
        </div>
      )}
    </section>
  );
}
