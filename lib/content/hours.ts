import { DAY_KEYS, type DayKey, type DayHours, type WeekHours } from "./schema";

/**
 * "Şu an açık · 19:00'a kadar" is a small feature that does disproportionate work in a
 * sales demo: it is the one thing a static template never has, and the owner notices.
 *
 * Everything here is pure. The render layer is not allowed to reach for request context,
 * so the current time is always passed in.
 */

export const DAY_NAMES_TR: Record<DayKey, string> = {
  mon: "Pazartesi",
  tue: "Salı",
  wed: "Çarşamba",
  thu: "Perşembe",
  fri: "Cuma",
  sat: "Cumartesi",
  sun: "Pazar",
};

const WEEKDAY_TO_KEY: Record<string, DayKey> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

const istanbul = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Istanbul",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Where the salon is, not where the visitor is. A demo opened from Berlin must still be right. */
export function istanbulNow(now: Date): { day: DayKey; minutes: number } {
  const parts = istanbul.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const day = WEEKDAY_TO_KEY[get("weekday")];
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
};

const dayAfter = (day: DayKey): DayKey => DAY_KEYS[(DAY_KEYS.indexOf(day) + 1) % DAY_KEYS.length];

export type OpenState =
  | { open: true; closesAt: string }
  | { open: false; opensAt: string; opensDay: DayKey }
  | { open: false; opensAt: null; opensDay: null };

function isWithin(slot: Exclude<DayHours, "closed">, minutes: number): boolean {
  const open = toMinutes(slot.open);
  const close = toMinutes(slot.close);
  // A close time at or before the open time means the shift runs past midnight.
  return close > open ? minutes >= open && minutes < close : minutes >= open || minutes < close;
}

export function isOpenNow(hours: WeekHours, now: Date): OpenState {
  const { day, minutes } = istanbulNow(now);

  const today = hours[day];
  if (today !== "closed" && isWithin(today, minutes)) {
    return { open: true, closesAt: today.close };
  }

  // Still inside yesterday's overnight shift?
  const yesterday = hours[DAY_KEYS[(DAY_KEYS.indexOf(day) + 6) % DAY_KEYS.length]];
  if (yesterday !== "closed" && toMinutes(yesterday.close) <= toMinutes(yesterday.open)) {
    if (minutes < toMinutes(yesterday.close)) return { open: true, closesAt: yesterday.close };
  }

  // Opening later today?
  if (today !== "closed" && minutes < toMinutes(today.open)) {
    return { open: false, opensAt: today.open, opensDay: day };
  }

  // Otherwise the next day that has any hours at all.
  let cursor = dayAfter(day);
  for (let i = 0; i < DAY_KEYS.length; i++) {
    const slot = hours[cursor];
    if (slot !== "closed") return { open: false, opensAt: slot.open, opensDay: cursor };
    cursor = dayAfter(cursor);
  }
  return { open: false, opensAt: null, opensDay: null };
}

/** "Şu an açık · 19:00'a kadar" / "Şu an kapalı · Pazartesi 09:00'da açılıyor" */
export function openStateLabel(state: OpenState, today: DayKey): string {
  if (state.open) return `Şu an açık · ${state.closesAt}’a kadar`;
  if (state.opensAt === null) return "Şu an kapalı";
  const when =
    state.opensDay === today ? state.opensAt : `${DAY_NAMES_TR[state.opensDay]} ${state.opensAt}`;
  return `Şu an kapalı · ${when}’da açılıyor`;
}
