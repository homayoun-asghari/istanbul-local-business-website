import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { melike } from "@/lib/content/fixtures/melike";
import { Site } from "./Site";
import { formatPhone } from "./Cta";

// Monday 2026-09-07, 13:00 Istanbul — inside opening hours.
const OPEN = new Date("2026-09-07T10:00:00Z");
// Sunday 2026-09-06, 13:00 Istanbul — closed.
const CLOSED = new Date("2026-09-06T10:00:00Z");

const render = (now: Date) => renderToStaticMarkup(<Site content={melike} now={now} />);

describe("the demo a salon owner opens", () => {
  const html = render(OPEN);

  it("shows the business name", () => {
    expect(html).toContain("Melike Adıgüzel Güzellik Salonu");
  });

  it("shows the district and neighbourhood", () => {
    expect(html).toContain("Bakırköy");
    expect(html).toContain("Osmaniye");
  });

  it("shows the Google rating Turkish-style", () => {
    expect(html).toContain("4,7");
  });

  it("shows the review count with a Turkish thousands separator", () => {
    expect(html).toContain("1.273");
  });

  it("shows the five-star share", () => {
    expect(html).toContain("%92");
  });

  it("reaches WhatsApp in one tap, with the message prefilled", () => {
    expect(html).toContain("https://wa.me/905515330919?text=");
    expect(html).toContain('data-cta="whatsapp"');
  });

  it("reaches the phone in one tap", () => {
    expect(html).toContain("tel:+905515330919");
    expect(html).toContain('data-cta="call"');
  });

  it("shows the phone number the way a Turkish customer reads it", () => {
    expect(formatPhone("+905515330919")).toBe("0551 533 09 19");
    expect(html).toContain("0551 533 09 19");
  });

  it("offers directions to the salon", () => {
    expect(html).toContain(melike.business.mapsUrl);
    expect(html).toContain(`maps.google.com/maps?q=${melike.business.lat}`);
  });

  it("renders every section in the content, in order", () => {
    for (const id of ["hizmetler", "hakkimizda", "galeri", "saatler", "iletisim"]) {
      expect(html, `missing section #${id}`).toContain(`id="${id}"`);
    }
    expect(html.indexOf("hizmetler")).toBeLessThan(html.indexOf("iletisim"));
  });

  it("names every service from the content", () => {
    const services = melike.sections.find((s) => s.type === "services");
    for (const item of services!.items) expect(html).toContain(item.name);
  });

  it("applies the preset's tokens rather than hardcoded colours", () => {
    expect(html).toContain("--brand:#5E2A38");
    expect(html).toContain("--ground:#F4F2ED");
  });

  it("gives every image alt text, in Turkish", () => {
    const imgs = html.match(/<img[^>]*>/g) ?? [];
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img).toMatch(/alt="[^"]+"/);
  });
});

describe("the live open/closed state", () => {
  it("says it is open, and until when, during opening hours", () => {
    expect(render(OPEN)).toContain("Şu an açık · 19:00’a kadar");
  });

  it("says it is closed on Sunday and names the next opening day", () => {
    const html = render(CLOSED);
    expect(html).toContain("Şu an kapalı");
    expect(html).toContain("Pazartesi 09:00");
  });
});
