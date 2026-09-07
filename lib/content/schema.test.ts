import { describe, expect, it } from "vitest";
import { melike } from "./fixtures/melike";
import { formatCount, formatRating, parseSiteContent, telHref, whatsappHref } from "./schema";

describe("SiteContent", () => {
  it("accepts the Melike Adıgüzel fixture", () => {
    expect(() => parseSiteContent(melike)).not.toThrow();
    expect(parseSiteContent(melike).business.name).toBe("Melike Adıgüzel Güzellik Salonu");
  });

  it("rejects content with no phone number", () => {
    const business: Record<string, unknown> = { ...melike.business };
    delete business.phone;
    expect(() => parseSiteContent({ ...melike, business })).toThrow();
  });

  it("rejects a phone number that is not Turkish E.164", () => {
    const bad = { ...melike, business: { ...melike.business, phone: "0551 533 09 19" } };
    expect(() => parseSiteContent(bad)).toThrow(/E.164/);
  });

  it("rejects a slug with spaces or capitals", () => {
    expect(() => parseSiteContent({ ...melike, slug: "Melike Guzellik" })).toThrow(/slug/);
  });

  it("rejects an unknown section type", () => {
    const bad = { ...melike, sections: [...melike.sections, { type: "pricing", title: "x" }] };
    expect(() => parseSiteContent(bad)).toThrow();
  });

  it("rejects a rating above five", () => {
    expect(() =>
      parseSiteContent({ ...melike, business: { ...melike.business, rating: 5.4 } }),
    ).toThrow();
  });
});

describe("Turkish formatting", () => {
  it("writes the rating with a comma", () => {
    expect(formatRating(4.7)).toBe("4,7");
  });

  it("writes the review count with a dot separator", () => {
    expect(formatCount(1273)).toBe("1.273");
  });
});

describe("one-tap contact", () => {
  it("builds a wa.me link carrying the prefilled Turkish message", () => {
    const href = whatsappHref(melike);
    expect(href).toContain("https://wa.me/905515330919");
    expect(decodeURIComponent(href)).toContain("Randevu almak istiyorum");
  });

  it("percent-encodes the message so WhatsApp does not render literal plus signs", () => {
    const href = whatsappHref(melike);
    expect(href).toContain("%20");
    expect(href).not.toContain("+");
  });

  it("builds a tel: link", () => {
    expect(telHref(melike.business)).toBe("tel:+905515330919");
  });
});
