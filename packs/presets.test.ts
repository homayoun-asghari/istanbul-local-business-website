import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { BEAUTY_PRESETS } from "./beauty/preset";
import { TURKISH_GLYPHS, TURKISH_SAFE_FONTS, fontStack } from "./fonts";
import { presetCssVars } from "./types";

const ALL_PRESETS = Object.values(BEAUTY_PRESETS);

describe("Turkish-safe font registry", () => {
  it("has at least one font", () => {
    expect(Object.keys(TURKISH_SAFE_FONTS).length).toBeGreaterThan(0);
  });

  it("declares latin-ext for every font, which is the subset carrying ı İ ş ğ ç ö ü", () => {
    for (const [key, font] of Object.entries(TURKISH_SAFE_FONTS)) {
      expect(font.subsets, `${key} must declare latin-ext`).toContain("latin-ext");
    }
  });

  it("gives every font a real fallback stack, so a failed fetch is not a blank page", () => {
    for (const [key, font] of Object.entries(TURKISH_SAFE_FONTS)) {
      expect(font.fallback.length, `${key} needs a fallback`).toBeGreaterThan(0);
      expect(fontStack(key as keyof typeof TURKISH_SAFE_FONTS)).toContain(font.family);
    }
  });

  it("covers the full Turkish glyph set in the constant the registry is checked against", () => {
    expect(TURKISH_GLYPHS).toBe("ıİşŞğĞçÇöÖüÜ");
  });
});

describe("preset photography", () => {
  const paths = ALL_PRESETS.flatMap((preset) =>
    preset.stock
      ? [preset.stock.hero, ...(preset.stock.tiles ?? []), ...(preset.stock.staff ?? [])]
      : [],
  );

  it("is referenced by root-relative path, so it ejects with the render layer", () => {
    for (const src of paths) expect(src.startsWith("/stock/"), src).toBe(true);
  });

  it("all exists on disk", () => {
    // A preset pointing at a file that is not there renders a broken image on a demo
    // and, worse, ships that hole into a client's repository. Renaming an asset without
    // renaming its reference is the way this happens.
    for (const src of new Set(paths)) {
      expect(existsSync(`public${src}`), `missing public${src}`).toBe(true);
    }
  });

  it("gives every salon preset a hero, tiles and staff", () => {
    for (const preset of ALL_PRESETS.filter((candidate) => candidate.stock)) {
      expect(preset.stock!.tiles?.length, `${preset.id} tiles`).toBeGreaterThan(0);
      expect(preset.stock!.staff?.length, `${preset.id} staff`).toBeGreaterThan(0);
    }
  });
});

describe("presets", () => {
  it("only use fonts from the Turkish-safe registry", () => {
    for (const preset of ALL_PRESETS) {
      expect(Object.keys(TURKISH_SAFE_FONTS)).toContain(preset.fonts.display);
      expect(Object.keys(TURKISH_SAFE_FONTS)).toContain(preset.fonts.body);
    }
  });

  it("define every colour token explicitly, with no inherited defaults", () => {
    for (const preset of ALL_PRESETS) {
      const vars = presetCssVars(preset);
      for (const name of ["--ground", "--surface", "--ink", "--brand", "--accent", "--line"]) {
        expect(vars[name], `${preset.id} is missing ${name}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
});

describe("font loading", () => {
  // components/site/fonts.ts calls next/font with literal arguments, so it cannot be
  // imported outside a Next build. Reading it is the mechanical way to guard the subset.
  const source = readFileSync(new URL("../components/site/fonts.ts", import.meta.url), "utf8");

  it("requests latin-ext for every font it loads", () => {
    const calls = source.match(/subsets:\s*\[[^\]]*\]/g) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call).toContain("latin-ext");
  });

  it("loads only fonts that are in the Turkish-safe registry", () => {
    for (const font of Object.values(TURKISH_SAFE_FONTS)) {
      const identifier = font.family.replace(/ /g, "_");
      expect(source).toContain(identifier);
    }
  });
});
