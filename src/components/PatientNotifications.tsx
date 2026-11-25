'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, CheckCheck, Inbox } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { FrostedSlideOverDrawer } from '@/components/ui/FrostedSlideOverDrawer';
import {
  listPatientNotifications,
  markAllPatientNotificationsRead,
  markPatientNotificationRead,
  PATIENT_NOTIFICATIONS_EVENT,
  type PatientNotification,
} from '@/lib/notifications-db';

function usePatientNotifications(patientId?: string) {
  const patientKey = String(patientId || '').trim().toLowerCase();
  const [snapshot, setSnapshot] = useState<{
    patientId: string;
    notifications: PatientNotification[];
  }>({ patientId: patientKey, notifications: [] });

  useEffect(() => {
    const sync = () => {
      setSnapshot({
        patientId: patientKey,
        notifications: listPatientNotifications(patientKey),
      });
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(PATIENT_NOTIFICATIONS_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(PATIENT_NOTIFICATIONS_EVENT, sync);
    };
  }, [patientKey]);

  const notifications =
    snapshot.patientId === patientKey ? snapshot.notifications : [];
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return { notifications, unreadCount, patientKey };
}

function notificationTime(value: string, isAr: boolean): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(isAr ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotificationList({
  patientId,
  notifications,
  limit,
}: {
  patientId?: string;
  notifications: PatientNotification[];
  limit?: number;
}) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const visible = typeof limit === 'number' ? notifications.slice(0, limit) : notifications;

  if (!patientId) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
        <Inbox className="mx-auto h-7 w-7 text-slate-400" />
        <p className="mt-2 text-xs font-bold text-slate-600">
          {isAr ? 'لا يوجد ملف مريض مرتبط بهذا الحساب.' : 'No patient file is linked to this account.'}
        </p>
      </div>
    );
  }

  if (!visible.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
        <Inbox className="mx-auto h-7 w-7 text-slate-400" />
        <p className="mt-2 text-xs font-bold text-slate-600">
          {isAr ? 'لا توجد إشعارات جديدة من الاستقبال.' : 'No notifications from reception yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((item) => {
        const unread = !item.readAt;
        return (
          <article
            key={item.id}
            className={`rounded-2xl border p-4 transition-colors ${
              unread
                ? 'border-blue-200 bg-blue-50/70'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    unread ? 'bg-blue-600' : 'bg-transparent'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-[#102A5E]">
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                    {isAr ? item.bodyAr : item.bodyEn}
                  </p>
                </div>
              </div>
              {unread && (
                <button
                  type="button"
                  onClick={() => markPatientNotificationRead(item.id, patientId)}
                  className="shrink-0 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-extrabold text-blue-700 transition hover:bg-blue-100"
                >
                  {isAr ? 'تحديد كمقروء' : 'Mark read'}
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold text-slate-500">
              <span>
                {isAr ? item.senderNameAr : item.senderNameEn} · {item.branchCode}
              </span>
              <span>{notificationTime(item.createdAt, isAr)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function PatientNotificationsCard({ patientId }: { patientId?: string }) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const { notifications, unreadCount } = usePatientNotifications(patientId);

  return (
    <section id="notifications" className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isAr ? 'إشعاراتي' : 'My Notifications'}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {isAr ? 'رسائل وتحديثات من فريق الاستقبال' : 'Messages and updates from reception'}
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={!unreadCount}
          onClick={() => markAllPatientNotificationsRead(patientId)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck className="h-4 w-4" />
          {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
        </button>
      </div>
      <div className="mt-4">
        <NotificationList patientId={patientId} notifications={notifications} limit={6} />
      </div>
    </section>
  );
}

export function PatientNotificationsBell({ patientId }: { patientId?: string }) {
  const { locale } = useLanguage();
  const isAr = locale === 'ar';
  const [open, setOpen] = useState(false);
  const previousUnreadCount = useRef(0);
  const { notifications, unreadCount } = usePatientNotifications(patientId);
  const label = isAr ? 'الإشعارات' : 'Notifications';

  useEffect(() => {
    setOpen(false);
    previousUnreadCount.current = 0;
  }, [patientId]);

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      setOpen(true);
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={label}
        className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95 sm:px-3"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
        {unreadCount > 0 && (
          <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <FrostedSlideOverDrawer
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        subtitle={isAr ? 'رسائل وتحديثات من فريق الاستقبال' : 'Messages and updates from reception'}
        iconBadge={<BellRing className="h-5 w-5" />}
        maxWidth="max-w-md"
        ariaLabel={label}
        footer={
          <button
            type="button"
            disabled={!unreadCount}
            onClick={() => markAllPatientNotificationsRead(patientId)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B2528] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#13393E] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="h-4 w-4" />
            {isAr ? 'تحديد الكل كمقروء' : 'Mark all read'}
          </button>
        }
      >
        <NotificationList patientId={patientId} notifications={notifications} />
      </FrostedSlideOverDrawer>
    </>
  );
}
