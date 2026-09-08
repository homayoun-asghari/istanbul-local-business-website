import { z } from "zod";

/**
 * SiteContent is the currency of the whole system: AI drafts it, the studio edits it,
 * Postgres stores it, the render layer consumes it, and eject freezes it to a file.
 *
 * It is the ONLY thing components/site/ is allowed to depend on. That is what makes a
 * client handoff a build step rather than a rewrite — see docs/ARCHITECTURE.md.
 */

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const E164_TR = /^\+90\d{10}$/;

export const DayHoursSchema = z.union([
  z.literal("closed"),
  z.object({ open: z.string().regex(TIME), close: z.string().regex(TIME) }),
]);

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export const WeekHoursSchema = z.object({
  mon: DayHoursSchema,
  tue: DayHoursSchema,
  wed: DayHoursSchema,
  thu: DayHoursSchema,
  fri: DayHoursSchema,
  sat: DayHoursSchema,
  sun: DayHoursSchema,
  /** Shown under the table, e.g. "Randevu ile çalışılmaktadır." */
  note: z.string().optional(),
});

/**
 * Either a remote URL (a demo pointing at the business's Google photo) or a root-relative
 * path (an ejected client site, whose images were downloaded into public/). Both are
 * valid states of the same field, so the schema has to accept both.
 */
const ImageSrc = z
  .string()
  .min(1)
  .refine((value) => /^https?:\/\//.test(value) || value.startsWith("/"), {
    message: "image src must be an http(s) URL or a root-relative path",
  });

export const ImageSchema = z.object({
  src: ImageSrc,
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

/**
 * Facts we can point at in the owner's own Google listing. Everything here is
 * verifiable by the owner in ten seconds, which is the entire persuasive value.
 */
export const BusinessSchema = z.object({
  name: z.string().min(1),
  district: z.string().min(1),
  neighborhood: z.string().min(1),
  phone: z.string().regex(E164_TR, "phone must be E.164 Turkish, e.g. +905515330919"),
  whatsapp: z.string().url(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  fiveStarPct: z.number().int().min(0).max(100),
  lat: z.number(),
  lng: z.number(),
  mapsUrl: z.string().url(),
  instagram: z.string().url().optional(),
});

/**
 * `placeholder` marks a section whose content came from the industry pack rather than
 * from the business. The studio badges it; the site never says so. It exists so the
 * operator always knows what still needs a real answer before a handoff.
 */
const placeholder = z.boolean().default(false);

export const SectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    headline: z.string().min(1),
    subline: z.string().min(1),
    image: ImageSchema,
    placeholder,
  }),
  z.object({ type: z.literal("proof"), placeholder }),
  z.object({
    type: z.literal("services"),
    title: z.string().min(1),
    intro: z.string().optional(),
    items: z
      .array(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .min(1),
    placeholder,
  }),
  z.object({
    type: z.literal("about"),
    title: z.string().min(1),
    body: z.array(z.string().min(1)).min(1),
    placeholder,
  }),
  z.object({
    type: z.literal("gallery"),
    title: z.string().min(1),
    images: z.array(ImageSchema).min(1),
    placeholder,
  }),
  /**
   * A price menu. Every salon theme studied publishes prices — a round thumbnail, the
   * service, a dotted leader and the number. Price opacity is the top complaint about
   * this trade, so this is the section that answers a real objection.
   */
  z.object({
    type: z.literal("pricelist"),
    title: z.string().min(1),
    intro: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          /** Free text, not a number: "₺450", "₺450'den başlayan", "Randevuda belirlenir". */
          price: z.string().min(1),
          duration: z.string().optional(),
          image: ImageSchema.optional(),
        }),
      )
      .min(1),
    placeholder,
  }),
  /** Named people with portraits. The strongest trust signal that is not a stock photo. */
  z.object({
    type: z.literal("team"),
    title: z.string().min(1),
    intro: z.string().optional(),
    members: z
      .array(z.object({ name: z.string().min(1), role: z.string().min(1), image: ImageSchema }))
      .min(1),
    placeholder,
  }),
  /** The strip of squares above the footer that every salon theme ships. */
  z.object({
    type: z.literal("instagram"),
    title: z.string().min(1),
    handle: z.string().optional(),
    images: z.array(ImageSchema).min(1),
    placeholder,
  }),
  /** Hours beside a WhatsApp booking panel — a form on the page, not just a link. */
  z.object({
    type: z.literal("booking"),
    title: z.string().min(1),
    note: z.string().optional(),
    placeholder,
  }),
  z.object({
    type: z.literal("emergency"),
    /** "7/24 Acil" — the whole reason a pet owner opens a vet's site at 3am. */
    title: z.string().min(1),
    note: z.string().min(1),
    placeholder,
  }),
  z.object({ type: z.literal("hours"), title: z.string().min(1), placeholder }),
  z.object({ type: z.literal("contact"), title: z.string().min(1), placeholder }),
]);

export const SiteContentSchema = z.object({
  version: z.literal(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits and hyphens"),
  pack: z.enum(["beauty", "vet"]),
  preset: z.string().min(1),
  business: BusinessSchema,
  hours: WeekHoursSchema,
  sections: z.array(SectionSchema).min(1),
  /** Prefilled Turkish text for the WhatsApp deep link. */
  whatsappMessage: z.string().min(1),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
});

export type DayHours = z.infer<typeof DayHoursSchema>;
export type WeekHours = z.infer<typeof WeekHoursSchema>;
export type Business = z.infer<typeof BusinessSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type SiteContent = z.infer<typeof SiteContentSchema>;
export type SectionOf<T extends Section["type"]> = Extract<Section, { type: T }>;

export function parseSiteContent(input: unknown): SiteContent {
  return SiteContentSchema.parse(input);
}

/** Turkish number formatting: 4.7 reads as "4,7" and 1273 as "1.273". */
const tr = (options: Intl.NumberFormatOptions) => new Intl.NumberFormat("tr-TR", options);
export const formatRating = (n: number) =>
  tr({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
export const formatCount = (n: number) => tr({}).format(n);

/**
 * wa.me deep link with the message prefilled, so the owner's first tap is one tap.
 *
 * Built by hand rather than with URLSearchParams: that encodes spaces as "+", and
 * WhatsApp renders them literally, so the owner would open a message full of pluses.
 */
export function whatsappHref(content: SiteContent): string {
  return `${content.business.whatsapp}?text=${encodeURIComponent(content.whatsappMessage)}`;
}

export const telHref = (business: Business) => `tel:${business.phone}`;
