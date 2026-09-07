import { describe, expect, it } from "vitest";
import { melike } from "./fixtures/melike";
import { isOpenNow, istanbulNow, openStateLabel } from "./hours";
import type { WeekHours } from "./schema";

// Türkiye has been on UTC+3 year-round since 2016, so 09:00 local is 06:00Z.
const istanbul = (iso: string) => new Date(iso);

describe("isOpenNow — Melike Adıgüzel, 09:00–19:00 Mon–Sat, closed Sunday", () => {
  const hours = melike.hours;

  it("is open exactly at the opening minute", () => {
    // Monday 2026-09-07, 09:00 Istanbul
    expect(isOpenNow(hours, istanbul("2026-09-07T06:00:00Z"))).toEqual({
      open: true,
      closesAt: "19:00",
    });
  });

  it("is open one minute before closing", () => {
    expect(isOpenNow(hours, istanbul("2026-09-07T15:59:00Z"))).toEqual({
      open: true,
      closesAt: "19:00",
    });
  });

  it("is closed exactly at the closing minute", () => {
    const state = isOpenNow(hours, istanbul("2026-09-07T16:00:00Z"));
    expect(state.open).toBe(false);
  });

  it("is closed one minute after closing, and opens tomorrow", () => {
    expect(isOpenNow(hours, istanbul("2026-09-07T16:01:00Z"))).toEqual({
      open: false,
      opensAt: "09:00",
      opensDay: "tue",
    });
  });

  it("is closed before opening, and opens later the same day", () => {
    expect(isOpenNow(hours, istanbul("2026-09-07T05:30:00Z"))).toEqual({
      open: false,
      opensAt: "09:00",
      opensDay: "mon",
    });
  });

  it("is closed all day Sunday and points at Monday", () => {
    // Sunday 2026-09-06, 13:00 Istanbul
    expect(isOpenNow(hours, istanbul("2026-09-06T10:00:00Z"))).toEqual({
      open: false,
      opensAt: "09:00",
      opensDay: "mon",
    });
  });

  it("reads the salon's timezone, not the visitor's", () => {
    // 23:30 UTC Sunday is already 02:30 Monday in Istanbul — still closed, opens 09:00.
    const state = isOpenNow(hours, istanbul("2026-09-06T23:30:00Z"));
    expect(state).toEqual({ open: false, opensAt: "09:00", opensDay: "mon" });
    expect(istanbulNow(istanbul("2026-09-06T23:30:00Z")).day).toBe("mon");
  });
});

describe("isOpenNow — overnight shifts, for the 7/24 veteriner pack", () => {
  const allDay: WeekHours = {
    mon: { open: "20:00", close: "08:00" },
    tue: { open: "20:00", close: "08:00" },
    wed: "closed",
    thu: "closed",
    fri: "closed",
    sat: "closed",
    sun: "closed",
  };

  it("is open after midnight, inside the previous day's shift", () => {
    // Tuesday 03:00 Istanbul falls inside Monday's 20:00–08:00 shift.
    expect(isOpenNow(allDay, istanbul("2026-09-08T00:00:00Z"))).toEqual({
      open: true,
      closesAt: "08:00",
    });
  });

  it("is closed in the gap between shifts", () => {
    const state = isOpenNow(allDay, istanbul("2026-09-08T09:00:00Z")); // Tue 12:00
    expect(state.open).toBe(false);
  });
});

describe("openStateLabel", () => {
  it("says when it closes today", () => {
    expect(openStateLabel({ open: true, closesAt: "19:00" }, "mon")).toBe(
      "Şu an açık · 19:00’a kadar",
    );
  });

  it("omits the day name when it opens again the same day", () => {
    expect(openStateLabel({ open: false, opensAt: "09:00", opensDay: "mon" }, "mon")).toBe(
      "Şu an kapalı · 09:00’da açılıyor",
    );
  });

  it("names the day when it opens on a later day", () => {
    expect(openStateLabel({ open: false, opensAt: "09:00", opensDay: "mon" }, "sun")).toBe(
      "Şu an kapalı · Pazartesi 09:00’da açılıyor",
    );
  });

  // The bug this guards: hardcoding 'a/'da looks right for a 09:00–19:00 salon and is
  // wrong for the 08:00–20:00 clinic hours the veteriner pack will use.
  it("harmonises front-vowel times correctly, not as 'a/'da", () => {
    expect(openStateLabel({ open: true, closesAt: "08:00" }, "mon")).toBe(
      "Şu an açık · 08:00’e kadar",
    );
    expect(openStateLabel({ open: false, opensAt: "20:00", opensDay: "mon" }, "mon")).toBe(
      "Şu an kapalı · 20:00’de açılıyor",
    );
  });
});
