import type { SiteContent, WeekHours } from "@/lib/content/schema";

/**
 * Turning a lead row into a site is where the per-lead cost lives, so it must never
 * involve a code editor. Everything verifiable comes from the sheet; everything else is
 * marked `placeholder: true` and badged in the studio.
 *
 * The rule for placeholder copy: name real services an industry offers, and assert no
 * price, no staff member and no clinical claim. The owner reads this before replying,
 * and a wrong specific is worse than a missing section.
 */
export type BuildInput = {
  business: string;
  slug: string;
  phone: string | null;
  waLink: string | null;
  rating: number | null;
  reviews: number | null;
  pctFive: number | null;
  social: string | null;
  mapsPlace: string | null;
  photo: string | null;
  neighborhood: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
};

export class IncompleteLeadError extends Error {}

/** Sheet rows are messy. A lead missing any of these cannot make a credible demo. */
export function requireFacts(lead: BuildInput): {
  phone: string;
  whatsapp: string;
  photo: string;
  neighborhood: string;
  district: string;
  mapsUrl: string;
  lat: number;
  lng: number;
} {
  const missing: string[] = [];
  if (!lead.phone) missing.push("telefon");
  if (!lead.photo) missing.push("fotoğraf");
  if (!lead.neighborhood) missing.push("mahalle");
  if (!lead.district) missing.push("ilçe");
  if (lead.lat === null || lead.lng === null) missing.push("konum");
  if (missing.length > 0) {
    throw new IncompleteLeadError(`Bu kayıtta eksik alanlar var: ${missing.join(", ")}.`);
  }
  return {
    phone: lead.phone!,
    whatsapp: lead.waLink ?? `https://wa.me/${lead.phone!.replace("+", "")}`,
    photo: lead.photo!,
    neighborhood: lead.neighborhood!,
    district: lead.district!,
    mapsUrl: lead.mapsPlace ?? `https://www.google.com/maps?q=${lead.lat},${lead.lng}`,
    lat: lead.lat!,
    lng: lead.lng!,
  };
}

export const WEEKDAYS_9_TO_7: WeekHours = {
  mon: { open: "09:00", close: "19:00" },
  tue: { open: "09:00", close: "19:00" },
  wed: { open: "09:00", close: "19:00" },
  thu: { open: "09:00", close: "19:00" },
  fri: { open: "09:00", close: "19:00" },
  sat: { open: "09:00", close: "19:00" },
  sun: "closed",
  note: "Randevu ile çalışılmaktadır.",
};

export const ALWAYS_OPEN: WeekHours = {
  mon: { open: "00:00", close: "23:59" },
  tue: { open: "00:00", close: "23:59" },
  wed: { open: "00:00", close: "23:59" },
  thu: { open: "00:00", close: "23:59" },
  fri: { open: "00:00", close: "23:59" },
  sat: { open: "00:00", close: "23:59" },
  sun: { open: "00:00", close: "23:59" },
  note: "Acil durumlar için 7 gün 24 saat ulaşabilirsiniz.",
};

const tr = (n: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("tr-TR", options).format(n);

/** Only claims the sheet can back. Skipped entirely when the numbers are missing. */
export function reviewSentence(lead: BuildInput): string | null {
  if (lead.rating === null || lead.reviews === null) return null;
  const rating = tr(lead.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const base = `Google üzerinde ${tr(lead.reviews)} değerlendirme aldık ve ortalamamız ${rating}.`;
  if (lead.pctFive === null) return base;
  return `${base} Değerlendirmelerin %${lead.pctFive}’si beş yıldız.`;
}

export function baseBusiness(lead: BuildInput) {
  const facts = requireFacts(lead);
  return {
    name: lead.business,
    district: facts.district,
    neighborhood: facts.neighborhood,
    phone: facts.phone,
    whatsapp: facts.whatsapp,
    rating: lead.rating ?? 0,
    reviewCount: Math.round(lead.reviews ?? 0),
    fiveStarPct: Math.round(lead.pctFive ?? 0),
    lat: facts.lat,
    lng: facts.lng,
    mapsUrl: facts.mapsUrl,
    instagram: lead.social && /instagram\.com/i.test(lead.social) ? lead.social : undefined,
  } satisfies SiteContent["business"];
}
