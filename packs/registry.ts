import type { SiteContent } from "@/lib/content/schema";
import type { BuildInput } from "./build";
import type { Preset } from "./types";
import { BEAUTY_PRESETS } from "./beauty/preset";
import { VET_PRESETS } from "./vet/preset";
import { DENTAL_PRESETS } from "./dental/preset";
import { buildBeautySite } from "./beauty/build";
import { buildVetSite } from "./vet/build";
import { buildDentalSite } from "./dental/build";

/**
 * Adding an industry is adding an entry here plus a folder — never a change to
 * components/site. If a new pack needs the render layer edited, the abstraction is wrong.
 */
export type PackId = SiteContent["pack"];

export type Pack = {
  id: PackId;
  label: string;
  presets: Record<string, Preset>;
  build: (lead: BuildInput, preset?: string) => SiteContent;
};

export const PACKS: Record<PackId, Pack> = {
  beauty: {
    id: "beauty",
    label: "Güzellik / Estetik",
    presets: BEAUTY_PRESETS,
    build: buildBeautySite,
  },
  vet: { id: "vet", label: "Veteriner", presets: VET_PRESETS, build: buildVetSite },
  dental: {
    id: "dental",
    label: "Ağız ve Diş Sağlığı",
    presets: DENTAL_PRESETS,
    build: buildDentalSite,
  },
};

/** Industries the sheet contains that have no pack yet simply cannot be built. */
export function packForIndustry(industry: string): Pack | null {
  if (industry === "beauty") return PACKS.beauty;
  if (industry === "vet") return PACKS.vet;
  if (industry === "dental") return PACKS.dental;
  return null;
}

/** Falls back to the pack's first preset rather than rendering an unstyled page. */
export function presetFor(content: SiteContent): Preset {
  const pack = PACKS[content.pack];
  return pack.presets[content.preset] ?? Object.values(pack.presets)[0];
}

export const ALL_PRESETS = Object.values(PACKS).flatMap((pack) =>
  Object.values(pack.presets).map((preset) => ({ pack: pack.id, ...preset })),
);
