/**
 * The leads sheet has no industry column, so it is inferred from the business name.
 * Every rule here came from reading the actual 42 rows — "7/24" and "klinik" appear in
 * veteriner names, "estetik" straddles beauty and surgery, and "emlak" is neither.
 */
import { foldTurkish } from "./slug";

export type Industry = "beauty" | "vet" | "dental" | "other";

const RULES: { industry: Industry; patterns: RegExp[] }[] = [
  {
    industry: "vet",
    patterns: [/veteriner/i, /\bvet\b/i, /vetterapi/i, /vetwise/i, /vetmaster/i, /petten/i],
  },
  { industry: "dental", patterns: [/diş/i, /dis sagligi/i, /ağız ve diş/i, /dent/i] },
  {
    industry: "beauty",
    patterns: [
      /güzellik/i,
      /guzellik/i,
      /beauty/i,
      /estetik/i,
      /epilasyon/i,
      /kuaför/i,
      /kuafor/i,
      /bakım/i,
      /ağda/i,
      /kaş/i,
      /cilt/i,
      /salonu/i,
    ],
  },
];

/**
 * JavaScript's case-insensitive regex does not fold Turkish letters: "VETERİNER"
 * lowercases to "veteri̇ner" (i + combining dot), so /veteriner/i misses it entirely.
 * Every name is folded through the same table the slugifier uses before matching.
 */
export function inferIndustry(businessName: string): Industry {
  const folded = foldTurkish(businessName);
  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(folded))) return rule.industry;
  }
  return "other";
}

export const INDUSTRY_LABELS_TR: Record<Industry, string> = {
  beauty: "Güzellik / Estetik",
  vet: "Veteriner",
  dental: "Diş",
  other: "Diğer",
};
