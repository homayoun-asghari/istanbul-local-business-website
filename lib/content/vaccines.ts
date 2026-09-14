import type { SectionOf, SiteContent } from "./schema";

/**
 * The vaccine timeline's arithmetic, kept out of the component so it can be tested
 * without a browser.
 *
 * It turns "weeks after birth" into dates and says which step comes next. It never
 * produces a price, and it never produces advice: the steps are the clinic's own
 * schedule, and the component says in plain words that the vet decides.
 */

export type VaccineSection = SectionOf<"vaccines">;
export type Species = VaccineSection["species"][number];
export type StepState = "past" | "next" | "later";

export type DatedStep = Species["steps"][number] & { date: Date; state: StepState };

export const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

const WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Birth is taken as the middle of the chosen month. Owners of a rescued kitten rarely
 * know the day, and a date that can be two weeks out either way is exactly as precise as
 * a vaccine schedule needs to be. Everything is done in UTC at noon so a timezone can
 * never move a step onto the day before.
 */
export function birthDate(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 15, 12));
}

export function datedSteps(species: Species, birth: Date, today: Date): DatedStep[] {
  const steps = species.steps
    .slice()
    .sort((a, b) => a.week - b.week)
    .map((step) => ({ ...step, date: new Date(birth.getTime() + step.week * WEEK) }));
  const nextIndex = steps.findIndex((step) => step.date.getTime() >= today.getTime());
  return steps.map((step, index) => ({
    ...step,
    state: nextIndex === -1 || index < nextIndex ? "past" : index === nextIndex ? "next" : "later",
  }));
}

/** "12 Ekim 2026". */
export function formatDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS_TR[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * The message the visitor sends. First person, because it opens in their own WhatsApp.
 * It names the next step and the month they chose, and asks for a time — nothing else.
 */
export function vaccineMessage(
  content: SiteContent,
  species: Species,
  birth: Date,
  steps: DatedStep[],
): string {
  const next = steps.find((step) => step.state === "next");
  const lines = [
    `Merhaba, ${content.business.name} web sitesindeki aşı takvimini doldurdum.`,
    "",
    `Dostum: ${species.label}`,
    `Doğum: ${MONTHS_TR[birth.getUTCMonth()]} ${birth.getUTCFullYear()}`,
  ];
  if (next) lines.push(`Sıradaki adım: ${next.label} (yaklaşık ${formatDate(next.date)})`);
  else lines.push("Takvimdeki adımların hepsi geçmiş görünüyor; kontrol için gelmek istiyorum.");
  lines.push("", "Uygun bir randevu saati verebilir misiniz?");
  return lines.join("\n");
}
