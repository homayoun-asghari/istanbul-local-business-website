import { describe, expect, it } from "vitest";
import { melike } from "@/lib/content/fixtures/melike";
import { contentFromFields, fieldsFromFormData, validate } from "./form";

const edit = (fields: Record<string, string>) => contentFromFields(melike, fields);

describe("editing a business", () => {
  it("changes the name", () => {
    expect(edit({ "business.name": "Melike Güzellik" }).business.name).toBe("Melike Güzellik");
  });

  it("leaves untouched fields exactly as they were", () => {
    const result = edit({ "business.name": "Yeni Ad" });
    expect(result.business.phone).toBe(melike.business.phone);
    expect(result.business.rating).toBe(melike.business.rating);
    expect(result.slug).toBe(melike.slug);
    expect(result.sections).toHaveLength(melike.sections.length);
  });

  it("accepts a rating typed with a Turkish decimal comma", () => {
    expect(edit({ "business.rating": "4,9" }).business.rating).toBe(4.9);
  });

  it("never writes a Google standing into a clinic's content", () => {
    // A vet or dental site may not publish its rating; the studio must not put a zero back.
    for (const pack of ["vet", "dental"] as const) {
      const clinic = contentFromFields(
        {
          ...melike,
          pack,
          business: {
            ...melike.business,
            rating: undefined,
            reviewCount: undefined,
            fiveStarPct: undefined,
          },
        },
        { "business.rating": "4,9", "business.reviewCount": "250" },
      );
      expect(clinic.business.rating, pack).toBeUndefined();
      expect(clinic.business.reviewCount, pack).toBeUndefined();
      expect(clinic.business.fiveStarPct, pack).toBeUndefined();
    }
  });

  it("keeps a site on a template from its own pack", () => {
    const vet = { ...melike, pack: "vet" as const, preset: "gunes" };
    expect(contentFromFields(vet, { preset: "nabiz" }).preset).toBe("nabiz");
    // A salon template on a vet site is refused, not saved.
    expect(contentFromFields(vet, { preset: "kesim" }).preset).toBe("gunes");
    expect(edit({ preset: "gunes" }).preset).toBe(melike.preset);
  });

  it("drops an emptied Instagram rather than storing an empty string", () => {
    expect(edit({ "business.instagram": "  " }).business.instagram).toBeUndefined();
  });

  it("changes the WhatsApp message", () => {
    const result = edit({ whatsappMessage: "Merhaba, fiyat bilgisi alabilir miyim?" });
    expect(result.whatsappMessage).toBe("Merhaba, fiyat bilgisi alabilir miyim?");
  });
});

describe("editing hours", () => {
  it("changes an opening time", () => {
    const result = edit({ "hours.mon.open": "10:00", "hours.mon.close": "20:00" });
    expect(result.hours.mon).toEqual({ open: "10:00", close: "20:00" });
  });

  it("closes a day", () => {
    expect(edit({ "hours.sat.closed": "on" }).hours.sat).toBe("closed");
  });

  it("reopens a day that was closed, with a sane default", () => {
    const result = edit({ "hours.sun.open": "11:00", "hours.sun.close": "17:00" });
    expect(result.hours.sun).toEqual({ open: "11:00", close: "17:00" });
  });

  it("drops an emptied note", () => {
    expect(edit({ "hours.note": "" }).hours.note).toBeUndefined();
  });
});

describe("editing sections", () => {
  const heroIndex = melike.sections.findIndex((s) => s.type === "hero");
  const servicesIndex = melike.sections.findIndex((s) => s.type === "services");
  const aboutIndex = melike.sections.findIndex((s) => s.type === "about");

  it("changes the hero headline without touching the image", () => {
    const result = edit({ [`section.${heroIndex}.headline`]: "Yeni başlık" });
    const hero = result.sections[heroIndex];
    expect(hero.type === "hero" && hero.headline).toBe("Yeni başlık");
    expect(hero.type === "hero" && hero.image.src).toBe(
      melike.sections.find((s) => s.type === "hero")!.image.src,
    );
  });

  it("rewrites the service list in form order", () => {
    const result = edit({
      [`section.${servicesIndex}.item.0.name`]: "Lazer Epilasyon",
      [`section.${servicesIndex}.item.0.description`]: "Seans aralıkları kişiye göre.",
      [`section.${servicesIndex}.item.1.name`]: "Cilt Bakımı",
      [`section.${servicesIndex}.item.1.description`]: "",
    });
    const services = result.sections[servicesIndex];
    expect(services.type === "services" && services.items).toEqual([
      { name: "Lazer Epilasyon", description: "Seans aralıkları kişiye göre." },
      { name: "Cilt Bakımı", description: undefined },
    ]);
  });

  it("treats an emptied service name as a deletion", () => {
    const result = edit({
      [`section.${servicesIndex}.item.0.name`]: "Cilt Bakımı",
      [`section.${servicesIndex}.item.1.name`]: "   ",
      [`section.${servicesIndex}.item.2.name`]: "Kalıcı Makyaj",
    });
    const services = result.sections[servicesIndex];
    expect(services.type === "services" && services.items.map((i) => i.name)).toEqual([
      "Cilt Bakımı",
      "Kalıcı Makyaj",
    ]);
  });

  it("splits about copy into paragraphs on blank lines", () => {
    const result = edit({ [`section.${aboutIndex}.body`]: "Birinci.\n\nİkinci.\n\n\nÜçüncü." });
    const about = result.sections[aboutIndex];
    expect(about.type === "about" && about.body).toEqual(["Birinci.", "İkinci.", "Üçüncü."]);
  });
});

describe("validation before anything is written", () => {
  it("accepts a well-formed edit", () => {
    const result = validate(edit({ "business.name": "Melike Güzellik" }));
    expect(result.ok).toBe(true);
  });

  it("rejects a phone number that is not Turkish E.164, naming the field in Turkish", () => {
    const result = validate(edit({ "business.phone": "0551 533 09 19" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field.startsWith("Telefon"))).toBe(true);
    }
  });

  it("rejects an emptied business name", () => {
    const result = validate(edit({ "business.name": "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.some((e) => e.field === "İşletme adı")).toBe(true);
  });

  it("rejects an impossible opening time", () => {
    const result = validate(edit({ "hours.mon.open": "25:00" }));
    expect(result.ok).toBe(false);
  });

  it("rejects a rating above five", () => {
    expect(validate(edit({ "business.rating": "7" })).ok).toBe(false);
  });
});

describe("fieldsFromFormData", () => {
  it("reads string entries from a FormData", () => {
    const data = new FormData();
    data.set("business.name", "Melike");
    data.set("hours.sun.closed", "on");
    expect(fieldsFromFormData(data)).toEqual({
      "business.name": "Melike",
      "hours.sun.closed": "on",
    });
  });
});
