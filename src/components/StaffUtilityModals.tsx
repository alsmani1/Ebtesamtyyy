'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { openAssistant } from '@/lib/assistant-api';
import { useLanguage } from '@/context/LanguageContext';
import {
  Send,
  X,
  Clock,
  MessageSquare,
  Sun,
  Moon,
  Search,
  Wifi,
  WifiOff,
  CheckCircle2,
  Plus,
  Home,
  Calendar,
  FileText,
} from 'lucide-react';

export function StaffTopbarUtilities({
  primaryRole,
  userFullName,
}: {
  primaryRole: string | null;
  userFullName?: string;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const router = useRouter();

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  // Clock-in state
  const [clockedIn, setClockedIn] = useState<any>(null);
  const [clockLoading, setClockLoading] = useState(false);
  // Internal Team Chat drawer
  const [teamChatOpen, setTeamChatOpen] = useState(false);
  const [teamMessages, setTeamMessages] = useState<any[]>([]);
  const [teamChannel, setTeamChannel] = useState('CLINICAL');
  const [teamInput, setTeamInput] = useState('');
  const [sendingTeam, setSendingTeam] = useState(false);

  // Offline status & global search
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Check saved theme
    const savedTheme = localStorage.getItem('ebtesamty_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check offline queue
    try {
      const q = JSON.parse(localStorage.getItem('ebtesamty_offline_queue') || '[]');
      setOfflineCount(Array.isArray(q) ? q.length : 0);
    } catch {}

    // Fetch staff attendance status
    fetch('/api/platform/operations?module=my_attendance')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.attendance && !d.attendance.clockOutAt) {
          setClockedIn(d.attendance);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ebtesamty_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ebtesamty_theme', 'light');
    }
  };

  const handleClockToggle = async () => {
    setClockLoading(true);
    try {
      const action = clockedIn ? 'CLOCK_OUT' : 'CLOCK_IN';
      const res = await fetch('/api/platform/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setClockedIn(action === 'CLOCK_IN' ? data.attendance : null);
      }
    } catch {}
    setClockLoading(false);
  };

  const loadTeamChat = async () => {
    setTeamChatOpen(true);
    try {
      const res = await fetch('/api/platform/operations?module=team_and_automation');
      if (res.ok) {
        const data = await res.json();
        setTeamMessages(data.teamMessages || []);
      }
    } catch {}
  };

  const handleSendTeamMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamInput.trim()) return;
    setSendingTeam(true);
    try {
      const res = await fetch('/api/platform/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SEND_TEAM_MESSAGE',
          channelName: teamChannel,
          messageText: teamInput.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeamMessages([data.teamMessage, ...teamMessages]);
        setTeamInput('');
      }
    } catch {}
    setSendingTeam(false);
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    if (primaryRole === 'DENTIST') {
      router.push(`/dentist/records?q=${encodeURIComponent(quickSearch.trim())}`);
    } else if (primaryRole === 'RECEPTIONIST') {
      router.push(`/reception/patients?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      openAssistant(quickSearch.trim());
    }
  };

  const quickActionHref =
    primaryRole === 'DENTIST'
      ? '/dentist/records'
      : primaryRole === 'RECEPTIONIST'
      ? '/reception/patients?add=new'
      : '/management?view=finance';

  const quickActionLabel =
    primaryRole === 'DENTIST'
      ? isAr
        ? '+ زيارة / مخطط'
        : '+ Save / Chart'
      : primaryRole === 'RECEPTIONIST'
      ? isAr
        ? '+ إضافة مريض'
        : '+ Add Patient'
      : isAr
      ? '+ إجراء سريع'
      : '+ Quick Add';

  return (
    <>
      {/* Global Search Input (Desktop) */}
      <form onSubmit={handleGlobalSearchSubmit} className="hidden 2xl:flex items-center relative w-48">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 pointer-events-none" />
        <input
          type="search"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder={isAr ? 'بحث... (Ctrl+K)' : 'Search... (Ctrl+K)'}
          aria-label={isAr ? 'بحث سريع' : 'Global Search'}
          className="w-full ps-8 pe-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 text-xs text-slate-800 focus:bg-white focus:border-[#4169E1] focus:outline-none"
        />
      </form>

      {/* Online / Offline Sync Status Badge */}
      <span
        title={isOnline ? 'Connected & Synced' : 'Offline Queue Active'}
        className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
          isOnline
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}
      >
        {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
        <span>{isOnline ? (isAr ? 'متصل' : 'Synced') : `${isAr ? 'انتظار' : 'Pending'} (${offlineCount})`}</span>
      </span>

      {/* Clock In / Clock Out Control for Receptionist & Dentist */}
      {(primaryRole === 'RECEPTIONIST' || primaryRole === 'DENTIST') && (
        <button
          type="button"
          onClick={handleClockToggle}
          disabled={clockLoading}
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
            clockedIn
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-[#EAF3FF] hover:text-[#2446A6]'
          }`}
          title={isAr ? 'تسجيل حضور / انصراف الموظف' : 'Staff Attendance Clock In / Out'}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">
            {clockedIn
              ? isAr
                ? 'حضور · انصراف'
                : 'Clock Out'
              : isAr
              ? 'تسجيل حضور'
              : 'Clock In'}
          </span>
        </button>
      )}

      {/* Internal Team Chat Button */}
      <button
        type="button"
        onClick={loadTeamChat}
        className="p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-[#EAF3FF] hover:text-[#4169E1] transition-colors"
        title={isAr ? 'محادثة الفريق الداخلية' : 'Internal Team Collaboration'}
        aria-label={isAr ? 'محادثة الفريق الداخلية' : 'Internal Team Collaboration'}
      >
        <MessageSquare className="w-4 h-4" />
      </button>

      {/* Theme Toggle (Light / Dark) */}
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
        title={darkMode ? (isAr ? 'الوضع النهاري' : 'Switch to Light Mode') : (isAr ? 'الوضع الليلي' : 'Switch to Dark Mode')}
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
      </button>

      {/* Role Quick Add Button */}
      <Link
        href={quickActionHref}
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold shadow-xs transition-colors"
      >
        <span>{quickActionLabel}</span>
      </Link>

      {/* SLIDE-OVER 2: INTERNAL TEAM COLLABORATION CHAT */}
      {teamChatOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? 'تواصل الفريق الداخلي' : 'Internal Team Collaboration'}
            className="w-full max-w-md bg-white h-full shadow-2xl border-s border-slate-200 flex flex-col justify-between p-6 overflow-y-auto"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-[#102A5E]">
                    {isAr ? 'غرفة تواصل الفريق الداخلي' : 'Internal Team Collaboration'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAr ? 'الاستقبال • الأطباء • الإدارة التنفيذية' : 'Shared staff threads · Reception, Dentists & Owner'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTeamChatOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Channel Filter Tabs */}
              <div className="flex gap-1.5">
                {(['CLINICAL', 'FRONT_DESK', 'GENERAL', 'URGENT'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setTeamChannel(ch)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      teamChannel === ch ? 'bg-[#4169E1] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    #{ch}
                  </button>
                ))}
              </div>

              {/* Messages List */}
              <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
                {teamMessages
                  .filter((m) => !teamChannel || m.channelName === teamChannel || teamChannel === 'GENERAL')
                  .map((msg) => (
                    <div key={msg.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#102A5E]">{msg.senderName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF3FF] text-[#2446A6]">
                          #{msg.channelName}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{msg.messageText}</p>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <form onSubmit={handleSendTeamMessage} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                placeholder={isAr ? 'اكتب رسالة للفريق (@mention)...' : 'Message team channel (@mention)...'}
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#4169E1] focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingTeam}
                className="px-4 py-2.5 rounded-xl bg-[#4169E1] hover:bg-[#2446A6] text-white text-xs font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}

/**
 * Mobile Bottom Navigation Bar for the Patient Portal (matching Patient Mobile Portal reference image)
 */
export function PatientMobileBottomNav() {
  const pathname = (usePathname() || '/patient/dashboard').replace(/\/+$/, '') || '/';
  const { locale } = useLanguage();
  const isAr = locale === 'ar';

  const items = [
    { href: '/patient/dashboard', label: isAr ? 'الرئيسية' : 'Home', icon: Home, exact: true },
    { href: '/patient/appointments', label: isAr ? 'المواعيد' : 'Appointments', icon: Calendar },
    { href: '/patient/inbox', label: isAr ? 'الرسائل' : 'Messages', icon: MessageSquare },
    { href: '/patient/treatment-plan', label: isAr ? 'خطة العلاج' : 'Care plan', icon: FileText },
  ];

  return (
    <nav
      aria-label={isAr ? 'التنقل السفلي للمريض' : 'Patient Mobile Bottom Navigation'}
      className="care-mobile-nav md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(16,42,94,0.06)]"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href || pathname === '/patient'
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-colors ${
              active ? 'text-[#4169E1]' : 'text-slate-500 hover:text-[#102A5E]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.badge && (
              <span className="absolute top-0.5 end-2 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
