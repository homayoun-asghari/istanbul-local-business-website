import { describe, expect, it } from "vitest";
import { buildDentalSite } from "@/packs/dental/build";
import type { SectionOf } from "./schema";
import {
  FDI_ALL,
  FDI_LOWER,
  FDI_UPPER,
  durationFraction,
  formatRange,
  planFor,
  plannerMessage,
  toothLabel,
} from "./planner";

const LEAD = {
  business: "Özel Hesna Ağız ve Diş Sağlığı",
  slug: "ozel-hesna-agiz-ve-dis-sagligi",
  phone: "+905551112233",
  waLink: null,
  rating: 5,
  reviews: 406,
  pctFive: 98,
  social: null,
  mapsPlace: null,
  photo: "https://example.com/clinic.jpg",
  neighborhood: "Küçükbakkalköy",
  district: "Ataşehir",
  lat: 40.98,
  lng: 29.1,
};

const content = buildDentalSite(LEAD);
const planner = content.sections.find((s) => s.type === "planner") as SectionOf<"planner">;

describe("FDI notation", () => {
  it("covers all thirty-two adult teeth exactly once", () => {
    expect(FDI_UPPER).toHaveLength(16);
    expect(FDI_LOWER).toHaveLength(16);
    expect(new Set(FDI_ALL).size).toBe(32);
  });

  it("names a tooth the way the dentist would say it", () => {
    expect(toothLabel(16)).toBe("sağ üst birinci azı");
    expect(toothLabel(21)).toBe("sol üst orta kesici");
    expect(toothLabel(48)).toBe("sağ alt yirmi yaş dişi");
  });

  it("reads the quadrant from the patient's side, not the viewer's", () => {
    // 11 and 21 straddle the midline: 11 is the patient's right, 21 their left.
    expect(toothLabel(11).startsWith("sağ")).toBe(true);
    expect(toothLabel(21).startsWith("sol")).toBe(true);
  });
});

describe("the treatment planner", () => {
  it("resolves a goal and a method into a plan", () => {
    const plan = planFor(planner, { goalId: "eksik", methodId: "implant", teeth: [36] });
    expect(plan?.method.label).toBe("İmplant");
    expect(plan?.teeth).toEqual([36]);
  });

  it("returns nothing when the method does not belong to the goal", () => {
    expect(planFor(planner, { goalId: "eksik", methodId: "braket", teeth: [] })).toBeNull();
    expect(planFor(planner, { goalId: "yok", methodId: "implant", teeth: [] })).toBeNull();
  });

  it("drops duplicate and invented teeth, and sorts what is left", () => {
    const plan = planFor(planner, {
      goalId: "eksik",
      methodId: "implant",
      teeth: [36, 11, 36, 99],
    });
    expect(plan?.teeth).toEqual([11, 36]);
  });

  it("flags a tooth-by-tooth method only when more than one tooth is picked", () => {
    const one = planFor(planner, { goalId: "eksik", methodId: "implant", teeth: [36] });
    const many = planFor(planner, { goalId: "eksik", methodId: "implant", teeth: [36, 37] });
    const notPerTooth = planFor(planner, { goalId: "caprasik", methodId: "plak", teeth: [36, 37] });
    expect(one?.manyTeeth).toBe(false);
    expect(many?.manyTeeth).toBe(true);
    expect(notPerTooth?.manyTeeth).toBe(false);
  });

  it("collapses a range that has only one value", () => {
    expect(formatRange([1, 1], "seans")).toBe("1 seans");
    expect(formatRange([3, 5], "seans")).toBe("3 – 5 seans");
  });

  it("scales duration logarithmically, so a filling is not invisible next to braces", () => {
    const filling = durationFraction([1, 1]);
    const braces = durationFraction([52, 104]);
    expect(filling).toBeGreaterThan(0.1);
    expect(braces).toBeGreaterThan(filling);
    expect(braces).toBeLessThanOrEqual(1);
  });

  it("writes a message with the teeth named, and no price in it", () => {
    const plan = planFor(planner, { goalId: "eksik", methodId: "implant", teeth: [36, 46] })!;
    const message = plannerMessage(content, plan);
    expect(message).toContain("İmplant");
    expect(message).toContain("36 (sol alt birinci azı)");
    expect(message).toContain("46 (sağ alt birinci azı)");
    expect(message).toContain("3 – 5 seans");
    // The whole point of the section: it must never quote money.
    expect(message).not.toMatch(/₺|TL|lira|fiyat|ücret|indirim|kampanya/i);
  });

  it("leaves the region line out when no tooth was picked", () => {
    const plan = planFor(planner, { goalId: "kontrol", methodId: "muayene", teeth: [] })!;
    expect(plannerMessage(content, plan)).not.toContain("Bölge:");
  });
});
