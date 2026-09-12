import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteContentSchema } from "@/lib/content/schema";
import { Site } from "@/components/site/Site";
import { buildDentalSite, TITLES } from "./build";

/**
 * These are not style tests.
 *
 * Sağlıkta Tanıtım ve Bilgilendirme Yönetmeliği (Resmî Gazete 12.11.2025, No. 33075)
 * governs what a private health facility may publish, and the clinic — not us — carries
 * the fine. Every assertion below is an article of it, so that the day someone copies a
 * section across from the beauty pack, the build goes red instead of the clinic going
 * to a hearing.
 */
const LEAD = {
  business: "Özel Hesna Ağız ve Diş Sağlığı",
  slug: "ozel-hesna-agiz-ve-dis-sagligi",
  phone: "+905334407551",
  waLink: null,
  // The sheet has a rating for this lead. The site may not show it, which is the point.
  rating: 5,
  reviews: 406,
  pctFive: 98,
  social: null,
  mapsPlace: null,
  photo: "https://example.com/clinic.jpg",
  neighborhood: "Küçükbakkalköy",
  district: "Ataşehir",
  lat: 40.9821,
  lng: 29.1043,
};

const content = SiteContentSchema.parse(buildDentalSite(LEAD));
const html = renderToStaticMarkup(
  <Site content={content} now={new Date("2026-09-12T11:00:00Z")} />,
);

describe("what a dental site must not publish", () => {
  it("has no price list section at all — m.5/1-l, m.5/1-m", () => {
    expect(content.sections.some((section) => section.type === "pricelist")).toBe(false);
    expect(html).not.toContain("Fiyat");
    expect(html).not.toContain("₺");
  });

  it("quotes no money, discount or campaign anywhere in its content", () => {
    const json = JSON.stringify(content);
    for (const forbidden of [
      /₺/,
      /\bTL\b/,
      /indirim/i,
      /kampanya/i,
      /ücretsiz/i,
      /%\s*\d+\s*indirim/i,
    ]) {
      expect(json, `content matched ${forbidden}`).not.toMatch(forbidden);
    }
  });

  it("shows no rating, review count or five-star figure — m.5/1-e", () => {
    expect(content.sections.some((section) => section.type === "proof")).toBe(false);
    // The numbers are in the lead and must not reach the page.
    expect(html).not.toContain("406");
    expect(html).not.toContain("değerlendirme");
    expect(html).not.toContain("5,0");
    expect(html).not.toMatch(/★/);
  });

  it("makes no superiority or comparative claim — m.5/1-c", () => {
    const json = JSON.stringify(content);
    for (const forbidden of [/en iyi/i, /lider/i, /bir numara/i, /rakip/i, /memnuniyet oranı/i]) {
      expect(json, `content matched ${forbidden}`).not.toMatch(forbidden);
    }
  });

  it("gives every clinician a title that exists in law — m.5/1-d", () => {
    const team = content.sections.find((section) => section.type === "team");
    expect(team).toBeDefined();
    for (const member of team!.members) {
      expect(TITLES as readonly string[]).toContain(member.role);
    }
  });
});

describe("what a dental site must publish", () => {
  it("carries a last-updated date and the site editor's contact — m.5/1-i", () => {
    expect(content.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(content.business.editor).toContain(LEAD.phone);
    expect(html).toContain("Son güncelleme");
    expect(html).toContain("Site sorumlusu");
  });

  it("stamps both dates on a before/after pair and disclaims the result — m.7/1", () => {
    const pairs = content.sections.find((section) => section.type === "beforeAfter");
    expect(pairs).toBeDefined();
    expect(pairs!.disclaimer).toMatch(/kişiden kişiye değişir/);
    for (const item of pairs!.cases) {
      expect(item.procedureDate.length).toBeGreaterThan(0);
      expect(item.photoDate.length).toBeGreaterThan(0);
    }
    // Written lower-case and uppercased in CSS, so assert what is actually in the markup —
    // JavaScript's toLowerCase turns İ into i plus a combining dot, which matches nothing.
    expect(html).toContain("işlem tarihi");
    expect(html).toContain("çekim tarihi");
  });

  it("says so when a pair is a rendering rather than a patient", () => {
    const pairs = content.sections.find((section) => section.type === "beforeAfter")!;
    expect(pairs.cases[0].illustration).toBe(true);
    expect(html).toContain("hasta fotoğrafı değildir");
  });
});

describe("the dental site itself", () => {
  it("renders the planner, the treatments and the specialists", () => {
    for (const id of ["klinik", "tedaviler", "hekimler", "plan", "oncesi-sonrasi", "iletisim"]) {
      expect(html, `missing section #${id}`).toContain(`id="${id}"`);
    }
  });

  it("keeps the appointment route open on every device", () => {
    expect(html).toContain('data-cta="whatsapp"');
    expect(html).toContain('data-cta="call"');
    expect(html).toContain(LEAD.phone);
  });

  it("uses the pack's own photography, not the lead's one storefront snap, for treatments", () => {
    const treatments = content.sections.find((section) => section.type === "treatments")!;
    for (const item of treatments.items) {
      expect(item.image.src).toMatch(/^\/stock\/dental\//);
    }
  });
});
