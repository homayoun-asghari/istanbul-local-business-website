import { Bodoni_Moda, Jost } from "next/font/google";

/**
 * Loaded with literal arguments because next/font is a compile-time transform.
 * `packs/presets.test.ts` reads this file to guarantee every font here requests
 * latin-ext and appears in the Turkish-safe registry — see packs/fonts.ts for why.
 *
 * Self-hosted by next/font, so there is no render-blocking request to Google and no
 * flash of fallback text on a slow Istanbul mobile connection.
 */
export const displayFont = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const bodyFont = Jost({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
