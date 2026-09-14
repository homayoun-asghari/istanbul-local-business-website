import { fontValue, type FontKey } from "./fonts";

/**
 * A preset is a complete visual identity, not a colour swap. Ten sites that differ only
 * in accent hue read as ten copies of one site — which is exactly the impression that
 * loses the sale. So a preset also carries its own typefaces, edge language and rhythm.
 */
export type Preset = {
  id: string;
  /** Shown in the studio's preset picker. */
  label: string;
  fonts: { display: FontKey; body: FontKey };
  /**
   * Which hero the preset renders. "classic" is the split text-and-photo layout every
   * preset shipped with; "chrome" replaces it with a pinned, animated scene in which the
   * business photo does not appear above the fold at all.
   */
  hero?:
    | "classic"
    | "chrome"
    | "kesim"
    | "gece"
    | "kemer"
    | "makro"
    | "menu"
    | "sade"
    | "cam"
    | "gunes"
    | "nabiz";
  /**
   * Photography the preset owns rather than the business.
   *
   * These leads arrive with one low-resolution storefront snap from Google Maps, which
   * none of these layouts can carry. A preset that needs a portrait, a macro crop or a
   * tile strip supplies its own, and because it lives on the preset the ?preset= preview
   * shows the right pictures too instead of the lead's photo in the wrong shape.
   */
  stock?: {
    hero: string;
    heroAlt: string;
    tiles?: string[];
    staff?: string[];
    /**
     * Named pictures a preset's own sections place around the content — the cat that
     * peeks over the hours card, the dog in the services blob. Decoration the preset
     * owns, so switching preset switches them too.
     */
    extras?: Record<string, string>;
  };
  tokens: {
    ground: string;
    surface: string;
    ink: string;
    inkSoft: string;
    muted: string;
    line: string;
    brand: string;
    brandInk: string;
    accent: string;
    /** Panels and images. The atölye preset is deliberately square. */
    radius: string;
    /** Tap targets stay pill-shaped regardless, because thumbs. */
    radiusPill: string;
  };
};

/** CSS custom properties, ready to drop on the site's root element. */
export function presetCssVars(preset: Preset): Record<string, string> {
  const t = preset.tokens;
  return {
    "--ground": t.ground,
    "--surface": t.surface,
    "--ink": t.ink,
    "--ink-soft": t.inkSoft,
    "--muted": t.muted,
    "--line": t.line,
    "--brand": t.brand,
    "--brand-ink": t.brandInk,
    "--accent": t.accent,
    "--radius": t.radius,
    "--radius-pill": t.radiusPill,
    // A preset changes the typefaces too — a colour swap alone reads as one template.
    "--font-display-active": fontValue(preset.fonts.display),
    "--font-body-active": fontValue(preset.fonts.body),
  };
}
