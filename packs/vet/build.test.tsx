import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteContentSchema } from "@/lib/content/schema";
import { Site } from "@/components/site/Site";
import { VET_PRESETS } from "./preset";
import { buildVetSite } from "./build";

/**
 * Not style tests. Law 6343 m.41, as re-enacted by Law 7584 on 11 June 2026, makes
 * advertising content "on the internet, media and social media" a disciplinary offence
 * for a veterinarian, and TVHB Uygulama Yönetmeliği m.97–98 spell out what that covers.
 * Each assertion is one of those lines, so a section copied across from the beauty pack
 * turns the build red instead of putting a clinic in front of its chamber.
 */
const LEAD = {
  business: "KADIKÖY RIHTIM 7/24 VETERİNER",
  slug: "kadikoy-rihtim-7-24-veteriner",
  phone: "+905551112233",
  waLink: null,
  // The sheet has a strong standing for this lead. The site may not show it.
  rating: 4.9,
  reviews: 250,
  pctFive: 96,
  social: null,
  mapsPlace: null,
  photo: "https://example.com/clinic.jpg",
  neighborhood: "Rasimpaşa",
  district: "Kadıköy",
  lat: 40.99,
  lng: 29.02,
};

const now = new Date("2026-09-13T11:00:00Z");

describe.each(Object.keys(VET_PRESETS))("a vet site on the %s preset", (preset) => {
  const content = SiteContentSchema.parse(buildVetSite(LEAD, preset));
  const html = renderToStaticMarkup(<Site content={content} now={now} />);
  const text = html.replace(/<[^>]*>/g, " ");

  it("does not carry the Google standing, even in the hydration payload — TVHB m.98", () => {
    expect(content.business.rating).toBeUndefined();
    expect(content.business.reviewCount).toBeUndefined();
    expect(content.business.fiveStarPct).toBeUndefined();
    expect(content.sections.some((section) => section.type === "proof")).toBe(false);
    expect(JSON.stringify(content)).not.toMatch(/250|değerlendirme|beş yıldız/);
  });

  it("shows no rating, review count or five-star figure — Law 6343 m.41", () => {
    expect(text).not.toContain("değerlendirme");
    expect(text).not.toContain("beş yıldız");
    expect(text).not.toContain("4,9");
    expect(text).not.toMatch(/★/);
  });

  it("promises no discount, campaign or price — TVHB m.97", () => {
    const json = JSON.stringify(content);
    for (const forbidden of [/₺/, /\bTL\b/, /indirim/i, /kampanya/i, /ücretsiz/i, /uygun fiyat/i]) {
      expect(json, `content matched ${forbidden}`).not.toMatch(forbidden);
    }
  });

  it("makes no superiority claim — Law 6343 m.41 (s)", () => {
    const json = JSON.stringify(content);
    for (const forbidden of [/en iyi/i, /lider/i, /bir numara/i, /rakipsiz/i]) {
      expect(json, `content matched ${forbidden}`).not.toMatch(forbidden);
    }
  });

  it("keeps a 7/24 clinic's emergency line and both routes to reach it", () => {
    expect(content.sections.some((section) => section.type === "emergency")).toBe(true);
    expect(html).toContain('data-cta="whatsapp"');
    expect(html).toContain(LEAD.phone);
  });
});
