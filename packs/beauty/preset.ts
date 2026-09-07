import type { Preset } from "../types";

/**
 * Three complete looks, not three colour swaps. Ten demos that differ only in accent hue
 * read as ten copies of one site — exactly the impression that loses the sale — so each
 * preset changes typeface, edge language and rhythm as well.
 */
export const atolye: Preset = {
  id: "atolye",
  label: "Atölye — kemik beyazı, şarap, pirinç",
  fonts: { display: "bodoni-moda", body: "jost" },
  tokens: {
    ground: "#F4F2ED",
    surface: "#FFFFFF",
    ink: "#1B1A17",
    inkSoft: "#3D3A34",
    muted: "#77726A",
    line: "#E2DDD3",
    brand: "#5E2A38",
    brandInk: "#F8F2EF",
    accent: "#A98356",
    radius: "0px",
    radiusPill: "999px",
  },
};

/** Clinical calm: cool greys, deep teal, soft edges. Reads as a medical aesthetics clinic. */
export const klinik: Preset = {
  id: "klinik",
  label: "Klinik — buz grisi, petrol yeşili, yumuşak köşe",
  fonts: { display: "cormorant-garamond", body: "manrope" },
  tokens: {
    ground: "#F5F7F7",
    surface: "#FFFFFF",
    ink: "#141C1D",
    inkSoft: "#37474A",
    muted: "#6E8083",
    line: "#DDE5E6",
    brand: "#12595C",
    brandInk: "#F2FAFA",
    accent: "#C08A5A",
    radius: "14px",
    radiusPill: "999px",
  },
};

/** Evening luxe: near-black ground, warm gold. For salons that trade on glamour. */
export const gece: Preset = {
  id: "gece",
  label: "Gece — koyu zemin, altın, keskin köşe",
  fonts: { display: "cormorant-garamond", body: "jost" },
  tokens: {
    ground: "#14110F",
    surface: "#1D1917",
    ink: "#F3EDE6",
    inkSoft: "#D2C8BC",
    muted: "#968B7E",
    line: "#2C2521",
    brand: "#C2A163",
    brandInk: "#17130F",
    accent: "#8C6A3A",
    radius: "2px",
    radiusPill: "999px",
  },
};

export const BEAUTY_PRESETS: Record<string, Preset> = { atolye, klinik, gece };
