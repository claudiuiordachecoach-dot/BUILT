/**
 * Utilități pentru săptămâna luni–duminică (standard RO).
 * Toate funcțiile lucrează în UTC ca să evite drift-ul de fus orar
 * între server (UTC) și client.
 */

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface WeekDay {
  key: DayKey;
  iso: string; // YYYY-MM-DD
  date: Date;
  label: string; // "Lun", "Mar", ...
  longLabel: string; // "Luni 5 mai"
  isToday: boolean;
  isPast: boolean;
}

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS_SHORT: Record<DayKey, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mie",
  thursday: "Joi",
  friday: "Vin",
  saturday: "Sâm",
  sunday: "Dum",
};

const DAY_LABELS_LONG: Record<DayKey, string> = {
  monday: "Luni",
  tuesday: "Marți",
  wednesday: "Miercuri",
  thursday: "Joi",
  friday: "Vineri",
  saturday: "Sâmbătă",
  sunday: "Duminică",
};

const MONTHS_RO = [
  "ian",
  "feb",
  "mar",
  "apr",
  "mai",
  "iun",
  "iul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returnează luni-ul săptămânii care conține `date`, normalizat la 00:00 UTC.
 * Folosim UTC ca să evităm orele locale care pot trage o zi în spate.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  const dow = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = dow === 0 ? -6 : 1 - dow; // back-up pentru a ajunge la luni
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export function buildWeek(weekStart: Date, todayIso: string): WeekDay[] {
  return DAY_KEYS.map((key, i) => {
    const date = new Date(weekStart);
    date.setUTCDate(date.getUTCDate() + i);
    const iso = toIsoDate(date);
    const dayNum = date.getUTCDate();
    const monthLabel = MONTHS_RO[date.getUTCMonth()];
    return {
      key,
      iso,
      date,
      label: DAY_LABELS_SHORT[key],
      longLabel: `${DAY_LABELS_LONG[key]} ${dayNum} ${monthLabel}`,
      isToday: iso === todayIso,
      isPast: iso < todayIso,
    };
  });
}

export function shiftWeek(weekStartIso: string, weeks: number): string {
  const d = new Date(weekStartIso + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return toIsoDate(d);
}

export function formatWeekRange(week: WeekDay[]): string {
  if (week.length === 0) return "";
  const first = week[0]!.date;
  const last = week[6]!.date;
  const firstMonth = MONTHS_RO[first.getUTCMonth()];
  const lastMonth = MONTHS_RO[last.getUTCMonth()];
  if (first.getUTCMonth() === last.getUTCMonth()) {
    return `${first.getUTCDate()}–${last.getUTCDate()} ${firstMonth} ${last.getUTCFullYear()}`;
  }
  return `${first.getUTCDate()} ${firstMonth} – ${last.getUTCDate()} ${lastMonth} ${last.getUTCFullYear()}`;
}

export function formatTodayLong(date: Date): string {
  const dayKey = DAY_KEYS[(date.getUTCDay() + 6) % 7]!;
  const dayName = DAY_LABELS_LONG[dayKey];
  const dayNum = date.getUTCDate();
  const monthLabel = MONTHS_RO[date.getUTCMonth()];
  return `${dayName} ${dayNum} ${monthLabel} ${date.getUTCFullYear()}`;
}
