/**
 * Fonts verified to carry the full Turkish set: ı İ ş Ş ğ Ğ ç Ç ö Ö ü Ü.
 *
 * This registry exists because the failure it prevents is invisible in English and
 * humiliating in Turkish: a display face with no dotless ı falls back mid-word, so
 * "Bakırköy" renders in two different typefaces on the site of a Bakırköy business.
 * A font gets added here only after its Google Fonts specimen has been checked against
 * TURKISH_GLYPHS, and only if it publishes a latin-ext subset.
 */

export const TURKISH_GLYPHS = "ıİşŞğĞçÇöÖüÜ";

export type FontKey = keyof typeof TURKISH_SAFE_FONTS;

export const TURKISH_SAFE_FONTS = {
  /** High-contrast fashion serif. Carries the display weight of the atölye preset. */
  "bodoni-moda": {
    family: "Bodoni Moda",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-display",
    fallback: "Georgia, 'Times New Roman', serif",
  },
  /** Geometric sans with a warm cast. Reads cleanly at small sizes on a phone. */
  jost: {
    family: "Jost",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-body",
    fallback: "'Helvetica Neue', Arial, sans-serif",
  },
  /** Old-style serif with a light, elegant colour. Carries the klinik and gece looks. */
  "cormorant-garamond": {
    family: "Cormorant Garamond",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-display-alt",
    fallback: "Georgia, 'Times New Roman', serif",
  },
  /** Neutral, highly legible sans for dense clinical copy. */
  manrope: {
    family: "Manrope",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-body-alt",
    fallback: "'Helvetica Neue', Arial, sans-serif",
  },
  /** Modern geometric. Thin at display size, heavy for the words that carry weight. */
  onest: {
    family: "Onest",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-onest",
    fallback: "'Helvetica Neue', Arial, sans-serif",
  },
  /** Roman inscriptional serif. Read off sailon.bravisthemes.com, a live salon site. */
  marcellus: {
    family: "Marcellus",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-marcellus",
    fallback: "Georgia, 'Times New Roman', serif",
  },
  /** Its partner on that same site: quiet, highly legible, warm. */
  "dm-sans": {
    family: "DM Sans",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-dm-sans",
    fallback: "'Helvetica Neue', Arial, sans-serif",
  },
  /** The handwritten line above serif capitals — the beauty-salon signature. */
  "dancing-script": {
    family: "Dancing Script",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-script",
    fallback: "'Snell Roundhand', cursive",
  },
  /** High-contrast display serif for the interleaved headline. */
  playfair: {
    family: "Playfair Display",
    subsets: ["latin", "latin-ext"],
    cssVariable: "--font-playfair",
    fallback: "Georgia, 'Times New Roman', serif",
  },
} as const satisfies Record<
  string,
  { family: string; subsets: readonly string[]; fallback: string; cssVariable: string }
>;

export function fontStack(key: FontKey): string {
  const font = TURKISH_SAFE_FONTS[key];
  return `"${font.family}", ${font.fallback}`;
}

/** What a preset writes into --font-display-active / --font-body-active. */
export function fontValue(key: FontKey): string {
  const font = TURKISH_SAFE_FONTS[key];
  return `var(${font.cssVariable}), ${font.fallback}`;
}
