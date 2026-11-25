"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  MessageCircle,
  Send,
  ExternalLink,
  Sparkles,
  Check,
  CheckCheck,
  Phone,
  Video,
  Bookmark,
  X,
} from "lucide-react";
import type { Phase2Role } from "../phase2/FinanceCenterPhaseTwo";
import { SERVICES } from "@/lib/clinic-pricing";

export const CLINIC_WHATSAPP_NUMBER = "+201200054405";
export const CLINIC_WHATSAPP_WA_LINK = "https://wa.me/201200054405";
export const SHARED_INBOX_STORAGE_KEY = "ebtesamty_shared_inbox_v3";
export const SHARED_INBOX_EVENT = "ebtesamty-shared-inbox-sync";

export interface ChatMessageItem {
  id: string;
  sender: "patient" | "clinic";
  senderLabel?: string;
  text: string;
  time: string;
}

export interface InboxConversation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorNameEn: string;
  patientNameEn: string;
  patientNameAr: string;
  letter: string;
  avatarBg: string;
  channel: "WhatsApp" | "Instagram" | "Messenger";
  channelBadgeClass: string;
  previewEn: string;
  previewAr: string;
  unread: boolean;
  patientRecordHref: string;
  phone: string;
  messages: ChatMessageItem[];
}

const INITIAL_CONVERSATIONS: InboxConversation[] = [
  {
    id: "CONV-1",
    patientId: "pat-mohamed",
    doctorId: "dr-sandy",
    doctorNameEn: "Dr. Sandy Saad",
    patientNameEn: "Mohamed Ahmed",
    patientNameAr: "محمد أحمد",
    letter: "L",
    avatarBg: "bg-emerald-600",
    channel: "WhatsApp",
    channelBadgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    previewEn: "Is the appointment tomorrow at 5:30?",
    previewAr: "هل الموعد غداً الساعة 5:30؟",
    unread: true,
    patientRecordHref: "/doctor/patients?patientId=pat-mohamed",
    phone: "+201015520148",
    messages: [
      {
        id: "M-1",
        sender: "patient",
        senderLabel: "Mohamed Ahmed",
        text: "Is the appointment tomorrow at 5:30?",
        time: "4:10 PM",
      },
      {
        id: "M-2",
        sender: "clinic",
        senderLabel: "Dr. Sandy Saad",
        text: "Yes, Sunday at 5:30 with Dr. Sandy Saad. Do you need to reschedule?",
        time: "4:12 PM",
      },
      {
        id: "M-3",
        sender: "patient",
        senderLabel: "Mohamed Ahmed",
        text: "No, all good",
        time: "4:13 PM",
      },
    ],
  },
  {
    id: "CONV-PASSANT",
    patientId: "EBT-PAT-0001",
    doctorId: "dr-sandy",
    doctorNameEn: "Dr. Sandy Saad",
    patientNameEn: "Passant (#EBT-PAT-0001)",
    patientNameAr: "بسنت (#EBT-PAT-0001)",
    letter: "P",
    avatarBg: "bg-teal-600",
    channel: "WhatsApp",
    channelBadgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    previewEn: "Thank you! Can I confirm if my zirconia crown arrived from the lab?",
    previewAr: "شكراً! هل وصل تاج الزيركون الخاص بي من المعمل؟",
    unread: true,
    patientRecordHref: "/doctor/patients?patientId=EBT-PAT-0001",
    phone: "+201200054405",
    messages: [
      {
        id: "PAT-CHAT-1",
        sender: "clinic",
        senderLabel: "Dr. Sandy Saad",
        text: "Hello Passant! Checking in after your Post & Core procedure on Tooth #36 at Minya – Branch A. How are you feeling today?",
        time: "10:15 AM",
      },
      {
        id: "PAT-CHAT-2",
        sender: "patient",
        senderLabel: "Passant",
        text: "Thank you! Can I confirm if my zirconia crown arrived from the lab?",
        time: "10:17 AM",
      },
      {
        id: "PAT-CHAT-3",
        sender: "clinic",
        senderLabel: "Dr. Sandy Saad",
        text: "Yes, your zirconia crown (#L-311 · Shade A2) has arrived at Minya – Branch A and is ready for your fitting visit!",
        time: "10:18 AM",
      },
    ],
  },
  {
    id: "CONV-2",
    patientId: "pat-salma",
    doctorId: "dr-sandy",
    doctorNameEn: "Dr. Sandy Saad",
    patientNameEn: "Salma Fouad",
    patientNameAr: "سلمى فؤاد",
    letter: "S",
    avatarBg: "bg-purple-600",
    channel: "Instagram",
    channelBadgeClass: "border-purple-200 bg-purple-50 text-purple-700",
    previewEn: "How much is whitening?",
    previewAr: "بكم سعر تبييض الأسنان؟ وهل النتيجة دائمة؟",
    unread: true,
    patientRecordHref: "/reception/patients",
    phone: "+201066332211",
    messages: [
      {
        id: "M-201",
        sender: "patient",
        senderLabel: "Salma Fouad",
        text: "How much is whitening?",
        time: "3:40 PM",
      },
      {
        id: "M-202",
        sender: "clinic",
        senderLabel: "Minya Reception",
        text: `Laser teeth whitening is EGP ${SERVICES.whitening.price.toLocaleString()} including polishing. Would you like to book a slot this week?`,
        time: "3:44 PM",
      },
    ],
  },
  {
    id: "CONV-3",
    patientId: "pat-karim",
    doctorId: "dr-sandy",
    doctorNameEn: "Dr. Sandy Saad",
    patientNameEn: "Karim Saad",
    patientNameAr: "كريم سعد",
    letter: "S",
    avatarBg: "bg-blue-600",
    channel: "Messenger",
    channelBadgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    previewEn: "Great, thanks",
    previewAr: "ممتاز، شكراً جزيلاً",
    unread: false,
    patientRecordHref: "/doctor/patients",
    phone: "+201122334455",
    messages: [
      {
        id: "M-301",
        sender: "clinic",
        senderLabel: "Dr. Sandy Saad",
        text: "Your zirconia crown (#47) has arrived from the lab and is ready for fitting.",
        time: "2:10 PM",
      },
      {
        id: "M-302",
        sender: "patient",
        senderLabel: "Karim Saad",
        text: "Great, thanks",
        time: "2:15 PM",
      },
    ],
  },
];

const SAVED_REPLIES_ALL = [
  {
    labelEn: "Whitening price & duration",
    text: `Laser teeth whitening is EGP ${SERVICES.whitening.price.toLocaleString()} (45-minute single session). Shall we reserve an appointment for you?`,
    clinicalOnly: false,
  },
  {
    labelEn: "Clinic location & hours",
    text: "We are open Saturday–Thursday from 10:00 AM to 9:00 PM across Minya – Branch A, Branch B, and Branch C. WhatsApp: +201200054405.",
    clinicalOnly: false,
  },
  {
    labelEn: "Post-filling care follow-up",
    text: "Hello from Dr. Sandy Saad at Ebtesamty Clinic! How are you feeling after your procedure today? Please avoid hard foods on that side for 2 hours.",
    clinicalOnly: true,
  },
  {
    labelEn: "Post-op care & medication reminder",
    text: "Post-op reminder from your treating dentist: Please take your prescribed medication after meals and rinse gently with warm salt water starting tomorrow.",
    clinicalOnly: true,
  },
  {
    labelEn: "Review request link",
    text: "Thank you for visiting Ebtesamty Clinic! We would love your 1-tap review of today's completed visit.",
    clinicalOnly: false,
  },
];

interface AutoTemplateStep {
  id: string;
  title: string;
  timing: string;
  dotStyle: "green" | "blue_ring" | "outline";
  templateText: string;
  category: "scheduling" | "clinical";
}

const INITIAL_AUTO_TEMPLATES: AutoTemplateStep[] = [
  {
    id: "AUTO-1",
    title: "Appointment confirmation",
    timing: "On booking",
    dotStyle: "green",
    templateText:
      "Hello {{patient_name}}, your appointment at Ebtesamty Clinic with {{doctor_name}} is confirmed for {{date}} at {{time}}. Clinic WhatsApp: +201200054405",
    category: "scheduling",
  },
  {
    id: "AUTO-2",
    title: "Reminder — the patient reschedules by replying",
    timing: "One day before",
    dotStyle: "green",
    templateText:
      "Reminder: Your dental visit is tomorrow at {{time}}. Reply 1 to confirm or 2 if you need to reschedule.",
    category: "scheduling",
  },
  {
    id: "AUTO-3",
    title: "“How are you feeling after your procedure today?”",
    timing: "After the visit (Clinical Check-In)",
    dotStyle: "blue_ring",
    templateText:
      "Hi {{patient_name}}, checking in from Dr. Sandy Saad at Ebtesamty Clinic (+201200054405) — how are you feeling after your procedure today?",
    category: "clinical",
  },
  {
    id: "AUTO-CLINICAL-2",
    title: "Post-op care & medication reminder",
    timing: "Evening after treatment (Clinical Follow-Up)",
    dotStyle: "blue_ring",
    templateText:
      "Hello {{patient_name}}, please remember to follow your post-op care instructions and take your prescribed antibiotic/analgesic on schedule. Reply here if you feel any discomfort.",
    category: "clinical",
  },
  {
    id: "AUTO-4",
    title: "Review request → shown on your website",
    timing: "After a week",
    dotStyle: "outline",
    templateText:
      "We hope your smile feels great! Tap here to leave a verified review of your completed visit for our website.",
    category: "scheduling",
  },
];

export default function InboxWhatsAppPhaseThree({
  role = "clinic_owner",
  patientFileNumber,
  patientName,
}: {
  role?: Phase2Role;
  patientFileNumber?: string;
  patientName?: string;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [conversations, setConversationsState] =
    useState<InboxConversation[]>(INITIAL_CONVERSATIONS);

  // Two-Way Real-Time Chat Sync across /doctor/inbox, /reception/inbox, and /patient/inbox
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(SHARED_INBOX_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversationsState(parsed);
        }
      }
    } catch {}

    const handleSync = () => {
      try {
        const latest = window.localStorage.getItem(SHARED_INBOX_STORAGE_KEY);
        if (latest) {
          const parsed = JSON.parse(latest);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversationsState(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(SHARED_INBOX_EVENT, handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SHARED_INBOX_EVENT, handleSync);
    };
  }, []);

  const setConversations: React.Dispatch<React.SetStateAction<InboxConversation[]>> = (
    updater
  ) => {
    setConversationsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(SHARED_INBOX_STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new Event(SHARED_INBOX_EVENT));
        } catch {}
      }
      return next;
    });
  };

  const [activeConvId, setActiveConvId] = useState<string>("CONV-1");
  const [replyText, setReplyText] = useState("");
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "waiting" | "unread">("all");

  // Editable Automatic Templates state
  const [autoTemplates, setAutoTemplates] =
    useState<AutoTemplateStep[]>(INITIAL_AUTO_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<AutoTemplateStep | null>(null);
  const [pendingExternalSend, setPendingExternalSend] = useState<string | null>(null);

  // Filter templates & saved replies for Doctor vs Receptionist/Owner
  const visibleAutoTemplates = useMemo(
    () =>
      role === "doctor"
        ? autoTemplates.filter((t) => t.category === "clinical")
        : autoTemplates,
    [autoTemplates, role]
  );

  const visibleSavedReplies = useMemo(
    () =>
      role === "doctor"
        ? SAVED_REPLIES_ALL.filter((r) => r.clinicalOnly)
        : SAVED_REPLIES_ALL,
    [role]
  );

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const handleSendReply = (customText?: string) => {
    const rawText = customText !== undefined ? customText : replyText;
    if (!rawText.trim()) return;
    const textToSend = rawText.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const senderLabel =
      role === "doctor"
        ? "Dr. Sandy Saad"
        : role === "receptionist"
        ? "Minya – Branch A Reception"
        : "Clinic Management";

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              unread: false,
              previewEn: textToSend,
              messages: [
                ...c.messages,
                {
                  id: `M-${Date.now()}`,
                  sender: "clinic",
                  senderLabel,
                  text: textToSend,
                  time: nowTime,
                },
              ],
            }
          : c
      )
    );
    if (customText === undefined) {
      setReplyText("");
    }
    setShowSavedReplies(false);
  };

  // Patient Direct Support & Doctor Chat State (Synced two-way with /doctor/inbox & /reception/inbox)
  const [patientSelectedBranch, setPatientSelectedBranch] = useState<
    "Minya – Branch A" | "Minya – Branch B" | "Minya – Branch C"
  >("Minya – Branch A");
  const [patientChatInput, setPatientChatInput] = useState("");

  // A patient only ever sees the support thread that belongs to their own clinic
  // file number; threads of other patients are never rendered in this view.
  const patientThreadFileNumber =
    patientFileNumber ||
    (patientName?.trim().toLowerCase() === "passant" ? "EBT-PAT-0001" : undefined);
  const displayPatientName = patientName || "Patient";
  const activePatientConversation = patientThreadFileNumber
    ? conversations.find((c) => c.patientId === patientThreadFileNumber)
    : undefined;

  const handlePatientSendSupportMessage = () => {
    if (!patientChatInput.trim() || !patientThreadFileNumber) return;
    const msgText = patientChatInput.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage: ChatMessageItem = {
      id: `PAT-MSG-${Date.now()}`,
      sender: "patient",
      senderLabel: displayPatientName,
      text: msgText,
      time: nowTime,
    };

    setConversations((prev) => {
      const existing = prev.find((c) => c.patientId === patientThreadFileNumber);
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                unread: true, // Immediately triggers Unread badge in /doctor/inbox & /reception/inbox
                previewEn: msgText,
                previewAr: msgText,
                messages: [...c.messages, newMessage],
              }
            : c
        );
      }
      const newConversation: InboxConversation = {
        id: `CONV-${patientThreadFileNumber}`,
        patientId: patientThreadFileNumber,
        doctorId: "dr-sandy",
        doctorNameEn: "Dr. Sandy Saad",
        patientNameEn: displayPatientName,
        patientNameAr: displayPatientName,
        letter: displayPatientName.slice(0, 1).toUpperCase(),
        avatarBg: "bg-teal-600",
        channel: "WhatsApp",
        channelBadgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        previewEn: msgText,
        previewAr: msgText,
        unread: true,
        patientRecordHref: `/doctor/patients?patientId=${encodeURIComponent(
          patientThreadFileNumber
        )}`,
        phone: "",
        messages: [newMessage],
      };
      return [newConversation, ...prev];
    });
    setPatientChatInput("");
  };

  // Patient View: Direct Support Chat with Minya – Branch A/B/C Reception + Continue on WhatsApp (+201200054405)
  if (role === "patient") {
    return (
      <section
        dir={isAr ? "rtl" : "ltr"}
        aria-label={isAr ? "محادثة الدعم المباشر مع الاستقبال" : "Direct Support Chat with Minya Reception"}
        className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-md space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-black text-emerald-700">
                ● {isAr ? "متصل الآن · استقبال فروع المنيا" : "Online · Minya Reception Desk"}
              </span>
              <h3 className="mt-1 text-xl font-black text-slate-900">
                {isAr
                  ? "محادثة الدعم المباشر مع استقبال العيادة"
                  : "Direct Support Chat — Minya Clinic Reception"}
              </h3>
              <p className="text-sm text-slate-500">
                {isAr
                  ? `راسل استقبال فرعك مباشرة أو تابع عبر واتساب (${CLINIC_WHATSAPP_NUMBER})`
                  : `Message Minya – Branch A/B/C Reception directly or continue on WhatsApp (${CLINIC_WHATSAPP_NUMBER})`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black text-teal-800">
              {isAr ? "محادثتك مع العيادة" : "Your conversation with the clinic"}
              {patientThreadFileNumber ? ` · #${patientThreadFileNumber}` : ""}
            </span>

            <select
              aria-label={isAr ? "اختر فرع المنيا" : "Select Minya Branch Reception"}
              value={patientSelectedBranch}
              onChange={(e) =>
                setPatientSelectedBranch(
                  e.target.value as "Minya – Branch A" | "Minya – Branch B" | "Minya – Branch C"
                )
              }
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-800"
            >
              <option value="Minya – Branch A">Minya – Branch A (Dr. Sandy Saad · Mariam Hanna)</option>
              <option value="Minya – Branch B">Minya – Branch B (Dr. Ahmed Hassan · Sandy Abd)</option>
              <option value="Minya – Branch C">Minya – Branch C (Dr. Nadia El-Hariry · Salma El-Masry)</option>
            </select>

            <a
              href={`${CLINIC_WHATSAPP_WA_LINK}?text=${encodeURIComponent(
                isAr
                  ? `مرحباً عيادة ابتسامتي (${patientSelectedBranch})، أود الاستفسار عن موعدي القادم.`
                  : `Hello Ebtesamty Clinic (${patientSelectedBranch}), I have a question about my upcoming visit.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
              <span>
                {isAr
                  ? "متابعة على واتساب (+20 120 005 4405)"
                  : "Continue on WhatsApp (+20 120 005 4405)"}
              </span>
            </a>
          </div>
        </div>

        {/* Patient-to-Doctor/Reception Live Synced Chat Thread */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3 max-h-80 overflow-y-auto">
          {(!activePatientConversation || activePatientConversation.messages.length === 0) && (
            <p className="py-6 text-center text-sm font-bold text-slate-500">
              {isAr
                ? "لا توجد رسائل بعد — اكتب رسالتك الأولى أدناه."
                : "No messages yet — write your first message below."}
            </p>
          )}
          {activePatientConversation?.messages.map((msg) =>
            msg.sender === "clinic" ? (
              <div
                key={msg.id}
                className="max-w-[82%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-2xs"
              >
                <div className="text-xs font-black text-emerald-700 mb-1">
                  {msg.senderLabel || `${patientSelectedBranch} · Dr. Sandy Saad`}
                </div>
                <div className="leading-relaxed">{msg.text}</div>
                <div className="mt-1 text-end text-[11px] text-slate-400">{msg.time}</div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="ms-auto max-w-[82%] rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white shadow-xs"
              >
                <div className="text-[11px] font-bold text-blue-100 mb-0.5">
                  {msg.senderLabel || activePatientConversation?.patientNameEn || displayPatientName}
                </div>
                <div className="font-semibold leading-relaxed">{msg.text}</div>
                <div className="mt-1 text-end text-[11px] text-blue-100">{msg.time}</div>
              </div>
            )
          )}
        </div>

        {/* Message Input Bar */}
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-2xs">
          <input
            type="text"
            value={patientChatInput}
            onChange={(e) => setPatientChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePatientSendSupportMessage()}
            placeholder={
              isAr
                ? `اكتب رسالتك إلى استقبال (${patientSelectedBranch})...`
                : `Write a message to ${patientSelectedBranch} Reception...`
            }
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handlePatientSendSupportMessage}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-xs transition hover:bg-blue-700"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isAr ? "إرسال" : "Send"}</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "مركز التواصل وواتساب العيادة" : "Team Inbox & Clinic WhatsApp"}
      className="space-y-6"
    >
      {/* Top Clinic WhatsApp Connection Banner (+201200054405) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-emerald-200/80 bg-emerald-50/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div className="text-xs">
            <span className="font-black text-slate-900">
              {isAr ? "واتساب العيادة الموحد متصل بالنظام:" : "Clinic WhatsApp Connected:"}
            </span>{" "}
            <span className="font-mono font-black text-emerald-700">{CLINIC_WHATSAPP_NUMBER}</span>
            <span className="ms-2 text-slate-500">
              {isAr
                ? "· كل محادثة مربوطة بملف المريض مباشرة"
                : "· Every conversation is linked to the patient's record"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Arabic Filter Pills from Image 5 */}
          {(
            [
              { id: "all", ar: "كل المحادثات", en: "All chats" },
              { id: "waiting", ar: "تنتظر رداً", en: "Awaiting reply" },
              { id: "unread", ar: "غير مقروءة", en: "Unread" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterTab(f.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                filterTab === f.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isAr ? f.ar : f.en}
            </button>
          ))}

          <a
            href={CLINIC_WHATSAPP_WA_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-black text-white hover:bg-emerald-700"
          >
            <span>WhatsApp {CLINIC_WHATSAPP_NUMBER}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* SPLIT GRID: Image 4 ("Inbox") & Image 6 ("Messages sent automatically") */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* IMAGE 4 EXACT CARD: Unified Team Inbox (xl:col-span-7) */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="xl:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)]"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">
              {isAr ? "صندوق الرسائل الموحد" : "Inbox"}
            </h3>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {isAr
                ? `صندوق واحد للفريق · ${CLINIC_WHATSAPP_NUMBER}`
                : `One inbox for the team · ${CLINIC_WHATSAPP_NUMBER}`}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Left Thread List (md:col-span-5) */}
            <div className="md:col-span-5 space-y-2.5">
              {conversations
                .filter((c) => (filterTab === "unread" ? c.unread : true))
                .map((conv) => {
                  const isSelected = conv.id === activeConv.id;
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setConversations((prev) =>
                          prev.map((item) =>
                            item.id === conv.id ? { ...item, unread: false } : item
                          )
                        );
                      }}
                      className={`w-full rounded-2xl border p-3.5 text-left transition ${
                        isSelected
                          ? "border-blue-300 bg-blue-50/50 shadow-2xs"
                          : "border-slate-200/70 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${conv.avatarBg}`}
                          >
                            {conv.letter}
                          </span>
                          <div>
                            <div className="text-xs font-black text-slate-900">
                              {conv.patientNameEn}
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                              {conv.previewEn}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${conv.channelBadgeClass}`}
                          >
                            {conv.channel}
                          </span>
                          {conv.unread && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black text-white">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Right Active Conversation Thread (md:col-span-7) — Exact match to Image 4 */}
            <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4">
              <div>
                {/* Conversation Header with "Open in WhatsApp" and "Patient record ↗" pills */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {isAr ? activeConv.patientNameAr : activeConv.patientNameEn}
                    </div>
                    <div className="text-[11px] text-slate-400 tabular-nums flex items-center gap-2">
                      <span>{activeConv.phone}</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600">via {activeConv.channel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/${activeConv.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
                      title={isAr ? "محادثة مباشرة على واتساب" : "Chat directly on WhatsApp Web / Mobile"}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{isAr ? "فتح واتساب ↗" : "Open in WhatsApp ↗"}</span>
                    </a>
                    <Link
                      href={
                        role === "doctor"
                          ? `/doctor/patients?patientId=${encodeURIComponent(activeConv.patientId)}`
                          : role === "receptionist"
                          ? `/reception/patients?patientId=${encodeURIComponent(activeConv.patientId)}`
                          : `/owner/patients?patientId=${encodeURIComponent(activeConv.patientId)}`
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                    >
                      <span>{isAr ? "ملف المريض ↗" : "Patient record ↗"}</span>
                    </Link>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="mt-4 max-h-60 space-y-3 overflow-y-auto pr-1">
                  {activeConv.messages.map((msg) =>
                    msg.sender === "patient" ? (
                      <div
                        key={msg.id}
                        className="max-w-[85%] rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-800"
                      >
                        <div className="font-medium leading-relaxed">{msg.text}</div>
                        <div className="mt-1 text-right text-[10px] text-slate-400">
                          {msg.time}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={msg.id}
                        className="ms-auto max-w-[85%] rounded-2xl bg-blue-600 px-3.5 py-2.5 text-xs text-white shadow-xs"
                      >
                        <div className="font-semibold leading-relaxed">{msg.text}</div>
                        <div className="mt-1 text-right text-[10px] text-blue-100">
                          {msg.time}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Saved Replies Picker Popover */}
              {showSavedReplies && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-700 px-1">
                    <span>Saved replies for common questions</span>
                    <button
                      type="button"
                      onClick={() => setShowSavedReplies(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                  {visibleSavedReplies.map((sr, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setReplyText(sr.text);
                        setShowSavedReplies(false);
                      }}
                      className="w-full rounded-xl bg-white px-3 py-2 text-left text-[11px] transition hover:bg-blue-50"
                    >
                      <div className="font-bold text-slate-900">{sr.labelEn}</div>
                      <div className="truncate text-slate-500">{sr.text}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Input Bar with "Saved replies" pill — Exact match to Image 4 */}
              <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                  placeholder={isAr ? "اكتب ردك هنا..." : "Type a reply..."}
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSavedReplies((s) => !s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                >
                  {isAr ? "الردود الجاهزة" : "Saved replies"}
                </button>
                {replyText.trim() && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSendReply()}
                      className="rounded-full bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 text-[11px] font-bold flex items-center gap-1"
                      title={isAr ? "تسجيل الرد في المحادثة" : "Send & Log in chat"}
                    >
                      <Send className="h-3 w-3" />
                      <span>{isAr ? "إرسال" : "Send"}</span>
                    </button>
                    <a
                      href={`https://wa.me/${activeConv.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(replyText.trim())}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        handleSendReply();
                      }}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 text-[11px] font-bold flex items-center gap-1"
                      title={isAr ? "إرسال مباشرة عبر تطبيق واتساب" : "Send via WhatsApp app"}
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* IMAGE 6 EXACT CARD: Messages sent automatically (xl:col-span-5) */}
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="xl:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(11,37,40,0.04)] flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">
                {role === "doctor"
                  ? isAr
                    ? "قوالب المتابعة الإكلينيكية بعد العلاج"
                    : "Post-Treatment Clinical Check-In Templates"
                  : isAr
                  ? "الرسائل التلقائية وقوالب المتابعة"
                  : "Messages sent automatically"}
              </h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600">
                {role === "doctor"
                  ? isAr
                    ? "متابعات طبية فقط · يتطلب تأكيد الإرسال"
                    : "Clinical follow-ups only · Explicit Send required"
                  : isAr
                  ? "بقوالبك وأسلوب عيادتك الخاص"
                  : "With your templates and your style"}
              </span>
            </div>

            {/* Vertical Timeline — Exact match to Image 6 */}
            <div className="mt-5 space-y-5 relative before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-500/40">
              {visibleAutoTemplates.map((step) => (
                <div key={step.id} className="relative flex items-start justify-between gap-3 pl-8">
                  {/* Timeline Node Dot */}
                  {step.dotStyle === "green" && (
                    <span className="absolute left-0 top-1 h-6 w-6 rounded-full bg-emerald-600 ring-4 ring-white" />
                  )}
                  {step.dotStyle === "blue_ring" && (
                    <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-blue-100 bg-blue-600" />
                  )}
                  {step.dotStyle === "outline" && (
                    <span className="absolute left-0 top-1 h-6 w-6 rounded-full border-2 border-slate-300 bg-white" />
                  )}

                  <div>
                    <div className="text-sm font-black text-slate-900">{step.title}</div>
                    <div className="text-xs text-slate-500">{step.timing}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingTemplate(step)}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingExternalSend(step.templateText)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      Tap to send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human-in-the-loop tap confirmation banner or footer */}
          {pendingExternalSend ? (
            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs">
              <div className="font-black text-slate-900">
                Confirm WhatsApp send via {CLINIC_WHATSAPP_NUMBER}:
              </div>
              <p className="mt-1 text-slate-600">{pendingExternalSend}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const personalized = pendingExternalSend
                      .replace("{{patient_name}}", activeConv.patientNameEn)
                      .replace("{{doctor_name}}", "Dr. Sandy Saad");
                    handleSendReply(personalized);
                    setPendingExternalSend(null);
                  }}
                  className="rounded-xl bg-blue-600 px-3.5 py-1.5 font-bold text-white hover:bg-blue-700"
                >
                  Send in Live Chat & WhatsApp
                </button>
                <a
                  href={`${CLINIC_WHATSAPP_WA_LINK}?text=${encodeURIComponent(
                    pendingExternalSend
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setPendingExternalSend(null)}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  Open WhatsApp External
                </a>
                <button
                  type="button"
                  onClick={() => setPendingExternalSend(null)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-xs text-slate-500">
              Every step is a template you edit yourself — and anything external needs a tap from
              you
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Edit Automatic Template */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Edit Template — {editingTemplate.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <textarea
                rows={4}
                value={editingTemplate.templateText}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, templateText: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 p-3 font-medium text-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAutoTemplates((prev) =>
                      prev.map((t) => (t.id === editingTemplate.id ? editingTemplate : t))
                    );
                    setEditingTemplate(null);
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
