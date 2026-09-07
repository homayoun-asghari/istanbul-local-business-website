import type { Preset } from "../types";

/**
 * "Atölye" — the atelier. Warm bone ground, deep wine, brushed brass, square panels
 * and hairline rules, with a high-contrast fashion serif carrying the headlines.
 *
 * Chosen against the obvious: rose gold, blush gradients and script lettering are what
 * every güzellik salonu template in Istanbul already looks like, so a salon owner reads
 * them as "someone reused a template on me". This reads as an editorial spread instead.
 */
export const atolye: Preset = {
  id: "atolye",
  label: "Atölye — bone, şarap kırmızısı, pirinç",
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

export const BEAUTY_PRESETS: Record<string, Preset> = { atolye };
