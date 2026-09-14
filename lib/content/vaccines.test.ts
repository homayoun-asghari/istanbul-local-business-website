import { describe, expect, it } from "vitest";
import type { SiteContent } from "./schema";
import { birthDate, datedSteps, formatDate, vaccineMessage, type Species } from "./vaccines";

const KITTEN: Species = {
  id: "kedi",
  label: "Kedi",
  steps: [
    { label: "Karma aşı · 2. doz", week: 12 },
    { label: "İlk muayene", week: 8 },
    { label: "Yıllık kontrol", week: 52 },
  ],
};

const content = { business: { name: "Vetwise Veteriner Kliniği" } } as SiteContent;

describe("the vaccine timeline", () => {
  it("dates every step from the middle of the birth month, in order", () => {
    const steps = datedSteps(KITTEN, birthDate(2026, 5), new Date("2026-06-01T00:00:00Z"));
    expect(steps.map((step) => step.label)).toEqual([
      "İlk muayene",
      "Karma aşı · 2. doz",
      "Yıllık kontrol",
    ]);
    expect(formatDate(steps[0].date)).toBe("10 Ağustos 2026");
    expect(formatDate(steps[1].date)).toBe("7 Eylül 2026");
  });

  it("marks what has passed, what is next and what comes later", () => {
    const steps = datedSteps(KITTEN, birthDate(2026, 5), new Date("2026-08-20T00:00:00Z"));
    expect(steps.map((step) => step.state)).toEqual(["past", "next", "later"]);
  });

  it("marks every step past for an animal older than the whole schedule", () => {
    const steps = datedSteps(KITTEN, birthDate(2020, 0), new Date("2026-09-13T00:00:00Z"));
    expect(steps.every((step) => step.state === "past")).toBe(true);
  });

  it("writes a message with the species, the month and the next step, and no price", () => {
    const birth = birthDate(2026, 5);
    const steps = datedSteps(KITTEN, birth, new Date("2026-08-20T00:00:00Z"));
    const message = vaccineMessage(content, KITTEN, birth, steps);
    expect(message).toContain("Dostum: Kedi");
    expect(message).toContain("Doğum: Haziran 2026");
    expect(message).toContain("Sıradaki adım: Karma aşı · 2. doz (yaklaşık 7 Eylül 2026)");
    expect(message).not.toMatch(/₺|TL|fiyat|ücret|indirim/i);
  });

  it("asks for a check-up when nothing is left in the schedule", () => {
    const birth = birthDate(2020, 0);
    const steps = datedSteps(KITTEN, birth, new Date("2026-09-13T00:00:00Z"));
    expect(vaccineMessage(content, KITTEN, birth, steps)).toContain("kontrol için gelmek");
  });
});
