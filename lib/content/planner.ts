import type { SectionOf, SiteContent } from "./schema";

/**
 * The treatment planner's arithmetic, kept out of the component so it can be tested
 * without a browser.
 *
 * The one rule that governs this file: it never produces a number a patient could read
 * as a price. Price lists, discounts and campaign announcements are prohibited on a
 * Turkish clinic's site (m.5/1-l, m.5/1-m), and this section exists precisely because a
 * dental site has no price list to show. What it produces is the shape of a treatment —
 * how many appointments, over how long, in what order, with whom — and a WhatsApp
 * message the visitor can send.
 */

export type PlannerSection = SectionOf<"planner">;
export type PlannerGoal = PlannerSection["goals"][number];
export type PlannerMethod = PlannerGoal["methods"][number];

/**
 * FDI two-digit notation, which is what a Turkish dental chart actually uses: first
 * digit the quadrant clockwise from the patient's upper right, second the tooth counting
 * out from the midline. A visitor recognises their own chart; a row of generic boxes
 * would not be recognised by anyone.
 */
export const FDI_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
export const FDI_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
export const FDI_ALL: number[] = [...FDI_UPPER, ...FDI_LOWER];

const POSITION_TR: Record<number, string> = {
  1: "orta kesici",
  2: "yan kesici",
  3: "köpek dişi",
  4: "birinci küçük azı",
  5: "ikinci küçük azı",
  6: "birinci azı",
  7: "ikinci azı",
  8: "yirmi yaş dişi",
};

const QUADRANT_TR: Record<number, string> = {
  1: "sağ üst",
  2: "sol üst",
  3: "sol alt",
  4: "sağ alt",
};

/** "16" reads as "sağ üst birinci azı" — the name the dentist would say out loud. */
export function toothLabel(fdi: number): string {
  const quadrant = QUADRANT_TR[Math.floor(fdi / 10)];
  const position = POSITION_TR[fdi % 10];
  return quadrant && position ? `${quadrant} ${position}` : String(fdi);
}

export type PlannerChoice = { goalId: string; methodId: string; teeth: number[] };

export type PlannerResult = {
  goal: PlannerGoal;
  method: PlannerMethod;
  teeth: number[];
  /** True when the method is planned tooth by tooth and more than one was picked. */
  manyTeeth: boolean;
};

export function planFor(section: PlannerSection, choice: PlannerChoice): PlannerResult | null {
  const goal = section.goals.find((candidate) => candidate.id === choice.goalId);
  if (!goal) return null;
  const method = goal.methods.find((candidate) => candidate.id === choice.methodId);
  if (!method) return null;
  const teeth = [...new Set(choice.teeth)]
    .filter((fdi) => FDI_ALL.includes(fdi))
    .sort((a, b) => a - b);
  return { goal, method, teeth, manyTeeth: method.perTooth && teeth.length > 1 };
}

/** "3 – 5 seans", or "1 seans" when the range has collapsed. */
export function formatRange(range: readonly [number, number], unit: string): string {
  const [low, high] = range;
  return low === high ? `${low} ${unit}` : `${low} – ${high} ${unit}`;
}

/**
 * How full the duration bar is drawn, 0–1.
 *
 * Two years of orthodontics against a single filling is a hundredfold spread, so a
 * linear bar would show almost every treatment as empty. The scale is logarithmic
 * against a two-year ceiling, which is the longest course any method here describes.
 */
export function durationFraction(weeks: readonly [number, number]): number {
  const CEILING = 104;
  const midpoint = (weeks[0] + weeks[1]) / 2;
  return Math.min(1, Math.log(1 + midpoint) / Math.log(1 + CEILING));
}

/**
 * The message the visitor sends.
 *
 * Written as a person would write it, in the first person, because it opens in their own
 * WhatsApp and they are the one sending it. It states no price and asks for none.
 */
export function plannerMessage(
  content: SiteContent,
  result: PlannerResult,
  visitor: { firstVisit?: boolean } = {},
): string {
  const lines = [
    `Merhaba, ${content.business.name} web sitesindeki tedavi planlayıcıyı doldurdum.`,
    "",
    `İstediğim: ${result.goal.label}`,
    `Yöntem: ${result.method.label}`,
  ];
  if (visitor.firstVisit !== undefined) {
    lines.push(
      visitor.firstVisit ? "Kliniğinize ilk kez geleceğim." : "Daha önce kliniğinize geldim.",
    );
  }
  if (result.teeth.length > 0) {
    const listed = result.teeth.map((fdi) => `${fdi} (${toothLabel(fdi)})`).join(", ");
    lines.push(`Bölge: ${listed}`);
  }
  lines.push(
    `Planlanan: ${formatRange(result.method.visits, "seans")}, ${formatRange(result.method.weeks, "hafta")}`,
  );
  lines.push("", "Uygun bir randevu saati verebilir misiniz?");
  return lines.join("\n");
}
