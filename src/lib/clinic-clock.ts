/** Mock clinic data follows the real Africa/Cairo calendar day, not a fixed seed date. */
const TZ = 'Africa/Cairo';

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function cairoYmd(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return { year: get('year'), month: get('month'), day: get('day') };
}

export function clinicTodayISO(): string {
  const { year, month, day } = cairoYmd();
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Minutes elapsed since midnight on the clinic clock (Africa/Cairo). */
export function clinicNowMinutes(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return (get('hour') % 24) * 60 + get('minute');
}

export function clinicDateISO(daysOffset: number): string {
  const { year, month, day } = cairoYmd();
  return new Date(Date.UTC(year, month - 1, day + daysOffset)).toISOString().slice(0, 10);
}

export function clinicMonthKey(monthOffset = 0): string {
  const { year, month } = cairoYmd();
  const shifted = new Date(Date.UTC(year, month - 1 + monthOffset, 1));
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}`;
}

export function clinicMonthStartISO(monthOffset = 0): string {
  return `${clinicMonthKey(monthOffset)}-01`;
}

export function clinicMonthEndISO(monthOffset = 0): string {
  const [year, month] = clinicMonthKey(monthOffset).split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${pad2(month)}-${pad2(lastDay)}`;
}

/** A seed date that stays inside the current month, never in the future. */
export function clinicThisMonthISO(daysAgo: number): string {
  const earliest = clinicMonthStartISO();
  const candidate = clinicDateISO(-Math.max(0, daysAgo));
  return candidate < earliest ? earliest : candidate;
}

/** A day inside a month; for the current month it is clamped to today. */
export function clinicMonthDayISO(dayOfMonth: number, monthOffset = 0): string {
  const key = clinicMonthKey(monthOffset);
  const [year, month] = key.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(Math.max(1, dayOfMonth), lastDay);
  const iso = `${key}-${pad2(day)}`;
  return monthOffset === 0 && iso > clinicTodayISO() ? clinicTodayISO() : iso;
}

export function clinicYear(offset = 0): string {
  return clinicMonthKey(offset * 12).slice(0, 4);
}

export function clinicMonthLabel(monthOffset: number, locale: 'en' | 'ar'): string {
  const key = clinicMonthKey(monthOffset);
  return new Date(`${key}-01T12:00:00Z`).toLocaleDateString(
    locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US',
    { timeZone: 'UTC', month: locale === 'ar' ? 'long' : 'short' }
  );
}

export function clinicDateText(iso: string, locale: 'en' | 'ar', includeYear = true): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(
    locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB',
    {
      timeZone: 'UTC',
      day: 'numeric',
      month: locale === 'ar' ? 'long' : 'short',
      ...(includeYear ? { year: 'numeric' } : {}),
    }
  );
}

export function clinicWeekdayDateText(iso: string, locale: 'en' | 'ar'): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(
    locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB',
    {
      timeZone: 'UTC',
      weekday: 'short',
      day: 'numeric',
      month: locale === 'ar' ? 'long' : 'short',
    }
  );
}
