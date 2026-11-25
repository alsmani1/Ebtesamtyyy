/** A clinic day follows Africa/Cairo, not the server deployment timezone. */
const TZ = 'Africa/Cairo';
function cairoParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return { year: get('year'), month: get('month'), day: get('day') };
}
function cairoUtcOffsetMinutes(instant: Date): number {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' })
    .formatToParts(instant).find((p) => p.type === 'timeZoneName')?.value || 'GMT+2';
  const match = part.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 120;
  return (match[1] === '+' ? 1 : -1) * (Number(match[2]) * 60 + Number(match[3] || 0));
}
function startOfCairoDate(year: number, month: number, day: number): Date {
  const midnightAsUtc = Date.UTC(year, month - 1, day);
  const guess = new Date(midnightAsUtc - 120 * 60_000);
  const offset = cairoUtcOffsetMinutes(guess);
  return new Date(midnightAsUtc - offset * 60_000);
}
export function getCairoDayBounds(now: Date = new Date()) {
  const { year, month, day } = cairoParts(now);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    start: startOfCairoDate(year, month, day),
    end: startOfCairoDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()),
    label: new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(now),
  };
}
