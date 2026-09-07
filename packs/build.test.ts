import { describe, expect, it } from "vitest";
import { parseSiteContent } from "@/lib/content/schema";
import { leadsFromCsv } from "@/lib/leads/csv";
import { IncompleteLeadError, reviewSentence } from "./build";
import { buildBeautySite } from "./beauty/build";
import { buildVetSite, isAlwaysOpen } from "./vet/build";
import { ALL_PRESETS, PACKS, packForIndustry, presetFor } from "./registry";

const SHEET = `business,phone,wa_link,rating,reviews,pct_five,social,maps_place,streetview,photo,neighborhood,district
Melike Adıgüzel Güzellik Salonu,+905515330919,https://wa.me/905515330919,4.7,1273,92,,https://maps.google.com/?q=place_id:X,"https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.9952757,28.8810021",https://example.com/photo.jpg,Osmaniye,Bakırköy
KADIKÖY RIHTIM 7/24 VETERİNER,+905360535252,https://wa.me/905360535252,4.9,250,96,http://instagram.com/kadikoyrihtimvet,https://maps.google.com/?q=place_id:Y,"https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.9932785,29.0272607",https://example.com/vet.jpg,Rasimpaşa,Kadıköy`;

const [beautyLead, vetLead] = leadsFromCsv(SHEET).leads;

describe("building a beauty demo from one sheet row", () => {
  const site = buildBeautySite(beautyLead);

  it("produces content that validates, so it can be published unedited", () => {
    expect(() => parseSiteContent(site)).not.toThrow();
  });

  it("carries only facts the owner can check on their own listing", () => {
    expect(site.business.name).toBe("Melike Adıgüzel Güzellik Salonu");
    expect(site.business.phone).toBe("+905515330919");
    expect(site.business.rating).toBe(4.7);
    expect(site.business.reviewCount).toBe(1273);
    expect(site.business.district).toBe("Bakırköy");
    expect(site.slug).toBe("melike-adiguzel-guzellik-salonu");
  });

  it("marks pack-written sections as placeholders and verified ones as not", () => {
    const byType = Object.fromEntries(site.sections.map((s) => [s.type, s.placeholder]));
    expect(byType.hero).toBe(true);
    expect(byType.services).toBe(true);
    expect(byType.about).toBe(true);
    expect(byType.proof).toBe(false);
    expect(byType.contact).toBe(false);
  });

  it("invents no price, no staff member and no clinical promise", () => {
    const words = JSON.stringify(site).toLowerCase();
    for (const forbidden of ["₺", "tl ", "fiyat:", "dr.", "uzman ", "garanti", "kalıcı çözüm"]) {
      expect(words, `must not assert "${forbidden}"`).not.toContain(forbidden);
    }
  });

  it("writes the review sentence from the sheet's own numbers", () => {
    const about = site.sections.find((s) => s.type === "about");
    expect(about!.body.join(" ")).toContain("1.273 değerlendirme");
    expect(about!.body.join(" ")).toContain("4,7");
    expect(about!.body.join(" ")).toContain("%92");
  });
});

describe("building a veteriner demo — the second industry, no kernel change", () => {
  const site = buildVetSite(vetLead);

  it("validates", () => {
    expect(() => parseSiteContent(site)).not.toThrow();
  });

  it("recognises a 7/24 clinic from its own name", () => {
    expect(isAlwaysOpen("KADIKÖY RIHTIM 7/24 VETERİNER")).toBe(true);
    expect(isAlwaysOpen("Capitol Veteriner Kliniği Bakırköy 7/24")).toBe(true);
    expect(isAlwaysOpen("Vetwise Veteriner Kliniği")).toBe(false);
  });

  it("gives a 7/24 clinic the emergency band and round-the-clock hours", () => {
    expect(site.sections.some((s) => s.type === "emergency")).toBe(true);
    expect(site.hours.sun).not.toBe("closed");
  });

  it("omits the emergency band for a clinic that does close", () => {
    const daytime = buildVetSite({ ...vetLead, business: "Vetwise Veteriner Kliniği" });
    expect(daytime.sections.some((s) => s.type === "emergency")).toBe(false);
    expect(daytime.hours.sun).toBe("closed");
  });

  it("keeps the Instagram handle the sheet supplied", () => {
    expect(site.business.instagram).toBe("http://instagram.com/kadikoyrihtimvet");
  });
});

describe("leads that cannot make a credible demo", () => {
  it("refuses a lead with no photo, naming what is missing in Turkish", () => {
    expect(() => buildBeautySite({ ...beautyLead, photo: null })).toThrow(IncompleteLeadError);
    expect(() => buildBeautySite({ ...beautyLead, photo: null })).toThrow(/fotoğraf/);
  });

  it("refuses a lead with no phone number", () => {
    expect(() => buildBeautySite({ ...beautyLead, phone: null, waLink: null })).toThrow(/telefon/);
  });

  it("refuses a lead with no coordinates", () => {
    expect(() => buildBeautySite({ ...beautyLead, lat: null, lng: null })).toThrow(/konum/);
  });

  it("omits the review sentence rather than inventing numbers", () => {
    expect(reviewSentence({ ...beautyLead, rating: null, reviews: null })).toBeNull();
  });
});

describe("the pack registry", () => {
  it("routes an inferred industry to its pack", () => {
    expect(packForIndustry("beauty")?.id).toBe("beauty");
    expect(packForIndustry("vet")?.id).toBe("vet");
  });

  it("refuses to guess for an industry with no pack yet", () => {
    expect(packForIndustry("dental")).toBeNull();
    expect(packForIndustry("other")).toBeNull();
  });

  it("offers more than one distinct look per pack", () => {
    for (const pack of Object.values(PACKS)) {
      expect(Object.keys(pack.presets).length).toBeGreaterThanOrEqual(2);
    }
    expect(ALL_PRESETS.length).toBeGreaterThanOrEqual(5);
  });

  it("gives every preset its own palette, not one hue swapped", () => {
    const grounds = new Set(ALL_PRESETS.map((p) => p.tokens.ground));
    const displays = new Set(ALL_PRESETS.map((p) => p.fonts.display));
    expect(grounds.size).toBeGreaterThan(1);
    expect(displays.size).toBeGreaterThan(1);
  });

  it("falls back to a real preset rather than rendering unstyled", () => {
    const site = buildBeautySite(beautyLead, "does-not-exist");
    expect(presetFor(site).id).toBe("atolye");
  });

  it("resolves each pack's own presets", () => {
    expect(presetFor(buildBeautySite(beautyLead, "gece")).id).toBe("gece");
    expect(presetFor(buildVetSite(vetLead, "mahalle")).id).toBe("mahalle");
  });
});
