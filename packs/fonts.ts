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
    fallback: "Georgia, 'Times New Roman', serif",
  },
  /** Geometric sans with a warm cast. Reads cleanly at small sizes on a phone. */
  jost: {
    family: "Jost",
    subsets: ["latin", "latin-ext"],
    fallback: "'Helvetica Neue', Arial, sans-serif",
  },
} as const satisfies Record<
  string,
  { family: string; subsets: readonly string[]; fallback: string }
>;

export function fontStack(key: FontKey): string {
  const font = TURKISH_SAFE_FONTS[key];
  return `"${font.family}", ${font.fallback}`;
}
