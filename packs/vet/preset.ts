import type { Preset } from "../types";

/**
 * A veteriner's site is opened in a hurry, often at night. These read as calm and
 * medical rather than cute — no paw prints, no pastel — because the person looking is
 * worried, not shopping.
 */
export const klinik: Preset = {
  id: "klinik",
  label: "Klinik — beyaz, petrol mavisi, yumuşak köşe",
  fonts: { display: "manrope", body: "manrope" },
  tokens: {
    ground: "#F6F8F9",
    surface: "#FFFFFF",
    ink: "#111A20",
    inkSoft: "#33454F",
    muted: "#6B7C86",
    line: "#DCE4E8",
    brand: "#12546E",
    brandInk: "#F2F9FC",
    accent: "#B4402F",
    radius: "12px",
    radiusPill: "999px",
  },
};

/** Warmer, for neighbourhood practices that trade on being familiar rather than clinical. */
export const mahalle: Preset = {
  id: "mahalle",
  label: "Mahalle — sıcak bej, yeşil, geniş köşe",
  fonts: { display: "jost", body: "jost" },
  tokens: {
    ground: "#F7F5F0",
    surface: "#FFFFFF",
    ink: "#1A1D16",
    inkSoft: "#3E4436",
    muted: "#767C68",
    line: "#E4E0D5",
    brand: "#3B5B37",
    brandInk: "#F5F8F2",
    accent: "#B4552B",
    radius: "18px",
    radiusPill: "999px",
  },
};

export const VET_PRESETS: Record<string, Preset> = { klinik, mahalle };
