import type { FontKey } from "./fonts";

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
  };
}
