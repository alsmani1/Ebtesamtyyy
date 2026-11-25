/** Calendar dates in scheduling tables are date-only UTC-midnight values. */
export function minutes(time: string) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
        throw new Error('Choose a valid time.');
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}
export function clockTime(value: number) {
    return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
}
export function dateOnly(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error('Choose a valid date.');
    const date = new Date(`${value}T00:00:00Z`);
    if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== value)
        throw new Error('Choose a valid date.');
    return date;
}
export function cairoDate(value = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value);
    const p = (type: string) => parts.find(p => p.type === type)!.value;
    return `${p('year')}-${p('month')}-${p('day')}`;
}
export function cairoInstant(day: string, time: string) {
    dateOnly(day);
    minutes(time);
    const wall = Date.parse(`${day}T${time}:00Z`);
    let candidate = wall;
    for (let i = 0; i < 3; i++) {
        const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(candidate));
        const p = (type: string) => parts.find(p => p.type === type)!.value;
        const represented = Date.parse(`${p('year')}-${p('month')}-${p('day')}T${p('hour')}:${p('minute')}:00Z`);
        candidate += wall - represented;
    }
    return new Date(candidate);
}
export function overlaps(start: string, end: string, occupied: {
    startTime: string;
    endTime: string;
}) {
    return minutes(start) < minutes(occupied.endTime) && minutes(end) > minutes(occupied.startTime);
}
export type QueuePolicy = {
    earlyArrivalMinutes: number;
    lateGraceMinutes: number | null;
    lateAction: string;
    walkInsEnabled: boolean;
};
export type OrderedVisit = {
    id: string;
    enteredAt: Date | string;
    clinicalPriority?: boolean;
    status: string;
    appointment?: {
        appointmentDate?: Date | string;
        startTime: string;
    } | null;
};
export function orderVisits<T extends OrderedVisit>(entries: T[], policy: Pick<QueuePolicy, 'earlyArrivalMinutes'>, now = new Date()) {
    const scheduled = (e: T) => e.appointment ? +cairoInstant(e.appointment.appointmentDate ? new Date(e.appointment.appointmentDate).toISOString().slice(0, 10) : cairoDate(now), e.appointment.startTime) : +new Date(e.enteredAt);
    const eligible = (e: T) => e.clinicalPriority || scheduled(e) - policy.earlyArrivalMinutes * 60000 <= +now;
    const rank = (e: T) => e.status === 'IN_CONSULTATION' ? 0 : e.status === 'CALLED' ? 1 : e.status === 'WAITING' ? 2 : 3;
    return [...entries].sort((a, b) => rank(a) - rank(b) || Number(eligible(b)) - Number(eligible(a)) || Number(!!b.clinicalPriority) - Number(!!a.clinicalPriority) || scheduled(a) - scheduled(b) || +new Date(a.enteredAt) - +new Date(b.enteredAt) || a.id.localeCompare(b.id));
}
