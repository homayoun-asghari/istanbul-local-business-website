import {
  Bodoni_Moda,
  Cormorant_Garamond,
  DM_Sans,
  Dancing_Script,
  Jost,
  Manrope,
  Marcellus,
  Onest,
  Playfair_Display,
} from "next/font/google";

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

export const serifAltFont = Cormorant_Garamond({
  variable: "--font-display-alt",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const sansAltFont = Manrope({
  variable: "--font-body-alt",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const geometricFont = Onest({
  variable: "--font-onest",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "800"],
  display: "swap",
});

export const marcellusFont = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
});

export const dmSansFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

/** The handwritten line that sits above serif capitals in every nail-salon theme. */
export const scriptFont = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
});

export const playfairFont = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "800"],
  display: "swap",
});
