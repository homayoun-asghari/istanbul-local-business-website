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

/** The vet pack's line icons, drawn in components/site/VetIcons.tsx. */
export const SERVICE_ICONS = [
  "muayene",
  "asi",
  "laboratuvar",
  "cerrahi",
  "dis",
  "bakim",
  "cip",
  "parazit",
  "kontrol",
  "acil",
] as const;

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
  /**
   * The business's standing on Google. Optional because a private health facility may
   * not publish any of it (m.5/1-e) — and a field it may not publish is one the dental
   * pack should not carry at all, since content is serialised into the page whether it
   * is rendered or not.
   */
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  fiveStarPct: z.number().int().min(0).max(100).optional(),
  lat: z.number(),
  lng: z.number(),
  mapsUrl: z.string().url(),
  instagram: z.string().url().optional(),
  /** Who to contact about the site itself — required of a health facility (m.5/1-i). */
  editor: z.string().min(1).optional(),
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
      .array(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          /** A line icon from the vet pack's own set. Presets without icons ignore it. */
          icon: z.enum(SERVICE_ICONS).optional(),
          /** A cut-out photograph for presets that set services on image panels. */
          image: ImageSchema.optional(),
        }),
      )
      .min(1),
    placeholder,
  }),
  z.object({
    type: z.literal("about"),
    title: z.string().min(1),
    body: z.array(z.string().min(1)).min(1),
    /**
     * Plain, checkable facts — the district, the hours, the species seen. Never a figure
     * that reads as a result: a vet may not advertise (Law 6343 m.41), and "250+ mutlu
     * dost" is advertising.
     */
    facts: z.array(z.string().min(1)).max(6).optional(),
    /** A second photograph beside the business's own, for presets that pair them. */
    image: ImageSchema.optional(),
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
      .array(
        z.object({
          name: z.string().min(1),
          /**
           * A dental site may only use a title that exists in law (m.5/1-d), so the
           * dental pack draws this from a fixed list rather than writing one.
           */
          role: z.string().min(1),
          image: ImageSchema,
          bio: z.string().optional(),
          /** "2014'ten beri" — a fact, not a claim. */
          since: z.string().optional(),
        }),
      )
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
    /**
     * Signs that mean "call now". They exist to get a frightened owner on the phone, not
     * to diagnose, so every one ends in the same instruction rather than an explanation.
     */
    signs: z.array(z.string().min(1)).max(10).optional(),
    placeholder,
  }),
  /**
   * The clinic band: the business's own photograph under a flood of the brand colour,
   * with four figures along the bottom.
   *
   * Those figures are deliberately not a rating. A private health facility may not
   * publish review counts, star ratings or satisfaction figures (m.5/1-e), so what sits
   * here has to be checkable and neutral — the year it opened, how many dentists work
   * there, how many treatments it offers.
   */
  z.object({
    type: z.literal("clinic"),
    title: z.string().min(1),
    body: z.string().min(1),
    image: ImageSchema,
    facts: z
      .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
      .min(2)
      .max(4),
    placeholder,
  }),
  /**
   * Treatment tiles. Unlike `services`, every item carries an image, because this pack
   * ships its own photography — a row of glass dental objects that needs no clinic to
   * have photographed anything.
   */
  z.object({
    type: z.literal("treatments"),
    title: z.string().min(1),
    intro: z.string().optional(),
    items: z
      .array(z.object({ name: z.string().min(1), note: z.string().optional(), image: ImageSchema }))
      .min(3),
    placeholder,
  }),
  /**
   * The treatment planner: pick a goal, a method and the teeth, get the shape of the
   * treatment and a prefilled WhatsApp message.
   *
   * It ends in a message and never in a number. Price lists, discounts and campaign
   * announcements are all prohibited (m.5/1-l, m.5/1-m), which is why this section
   * exists at all — it is what a dental site has instead of a price list.
   */
  z.object({
    type: z.literal("planner"),
    title: z.string().min(1),
    intro: z.string().optional(),
    goals: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          methods: z
            .array(
              z.object({
                id: z.string().min(1),
                label: z.string().min(1),
                /** How many appointments and over how long: information, not a price. */
                visits: z.tuple([z.number().int().positive(), z.number().int().positive()]),
                weeks: z.tuple([z.number().int().positive(), z.number().int().positive()]),
                /** Implants scale with the number of teeth; a cleaning does not. */
                perTooth: z.boolean().default(false),
                steps: z.array(z.string().min(1)).min(1),
                /** Matched against a team member's role to suggest who would do it. */
                specialist: z.string().optional(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
    note: z.string().min(1),
    placeholder,
  }),
  /**
   * Before and after.
   *
   * Prohibited outright until 12 November 2025 and permitted since, under conditions
   * (m.7/1): consent on the Ek-1 form, the same setting and technical conditions in both
   * frames, no filter or retouching, *both* the procedure date and the photograph date
   * shown, comments disabled, and a line saying results differ from person to person.
   *
   * Every one of those fields is required here rather than optional, because a pair
   * missing its dates is not a legal pair.
   */
  z.object({
    type: z.literal("beforeAfter"),
    title: z.string().min(1),
    intro: z.string().optional(),
    disclaimer: z.string().min(1),
    cases: z
      .array(
        z.object({
          treatment: z.string().min(1),
          title: z.string().min(1),
          story: z.string().min(1),
          did: z.array(z.string().min(1)).min(1),
          before: ImageSchema,
          after: ImageSchema,
          procedureDate: z.string().min(1),
          photoDate: z.string().min(1),
          /** A rendering rather than a patient. Says so on the frame when true. */
          illustration: z.boolean().default(false),
        }),
      )
      .min(1),
    placeholder,
  }),
  /**
   * The vaccine and care timeline — the vet pack's counterpart to the dental planner.
   *
   * A visitor picks the species and the month their animal was born, and the steps come
   * back as dates. The steps are the clinic's own schedule; the pack ships an example and
   * says so. Like the planner it ends in a WhatsApp message, and it never shows a price.
   */
  z.object({
    type: z.literal("vaccines"),
    title: z.string().min(1),
    intro: z.string().optional(),
    species: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          steps: z
            .array(
              z.object({
                label: z.string().min(1),
                /** Weeks after birth. The timeline turns this into a date. */
                week: z.number().int().nonnegative(),
                icon: z.enum(SERVICE_ICONS).optional(),
              }),
            )
            .min(1),
        }),
      )
      .min(1),
    note: z.string().min(1),
    placeholder,
  }),
  z.object({
    type: z.literal("faq"),
    title: z.string().min(1),
    intro: z.string().optional(),
    items: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(1),
    image: ImageSchema.optional(),
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
  pack: z.enum(["beauty", "vet", "dental"]),
  preset: z.string().min(1),
  business: BusinessSchema,
  hours: WeekHoursSchema,
  sections: z.array(SectionSchema).min(1),
  /** Prefilled Turkish text for the WhatsApp deep link. */
  whatsappMessage: z.string().min(1),
  /**
   * A private health facility's site must show when it was last updated and how to
   * reach whoever edits it (m.5/1-i). Optional here only because the beauty and vet
   * rows predate it; the dental pack always sets both.
   */
  updatedAt: z.string().min(1).optional(),
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
