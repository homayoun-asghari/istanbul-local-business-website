import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { melike } from "@/lib/content/fixtures/melike";
import { parseSiteContent, type SiteContent } from "@/lib/content/schema";
import { Site } from "./Site";

/**
 * Eject fidelity. A client's standalone repo renders the same components from the same
 * SiteContent — the only differences are that images are local and the analytics beacon
 * is absent. If anything else diverges, the handoff has stopped being a build step.
 */
const NOW = new Date("2026-09-07T10:00:00Z");

/** Mirrors scripts/eject.ts: one download per distinct URL, so a photo reused across
 *  sections keeps pointing at the same local file — which is what lets the render
 *  layer's repeated-photo dedupe behave identically in the client's repo. */
function localiseImages(content: SiteContent): SiteContent {
  const seen = new Map<string, string>();
  const next = (src: string) => {
    if (!seen.has(src)) seen.set(src, `/images/image-${seen.size + 1}.jpg`);
    return seen.get(src)!;
  };
  return {
    ...content,
    sections: content.sections.map((section) => {
      if (section.type === "hero") {
        return { ...section, image: { ...section.image, src: next(section.image.src) } };
      }
      if (section.type === "gallery") {
        return {
          ...section,
          images: section.images.map((image) => ({ ...image, src: next(image.src) })),
        };
      }
      return section;
    }),
  };
}

/** Strip the two things that are meant to differ, so everything else must match. */
const normalise = (html: string) =>
  html
    .replace(/(src|href)="[^"]*(lh3\.googleusercontent|\/images\/)[^"]*"/g, '$1="IMAGE"')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");

describe("an ejected site renders identically to its demo", () => {
  const demo = renderToStaticMarkup(<Site content={melike} now={NOW} trackAs={melike.slug} />);
  const ejected = renderToStaticMarkup(<Site content={localiseImages(melike)} now={NOW} />);

  it("produces the same markup once images and the beacon are set aside", () => {
    expect(normalise(ejected)).toBe(normalise(demo));
  });

  it("still carries every fact the owner will check", () => {
    for (const fact of ["Melike Adıgüzel Güzellik Salonu", "Bakırköy", "4,7", "1.273", "%92"]) {
      expect(ejected).toContain(fact);
    }
    expect(ejected).toContain("https://wa.me/905515330919");
    expect(ejected).toContain("tel:+905515330919");
  });

  it("points at local images, never back at the operator's sources", () => {
    expect(ejected).not.toContain("lh3.googleusercontent");
    expect(ejected).toContain("/images/image-1.jpg");
  });

  it("validates as content in its localised form, so the client's build can parse it", () => {
    expect(() => parseSiteContent(localiseImages(melike))).not.toThrow();
  });
});
