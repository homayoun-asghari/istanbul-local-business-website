import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Relational for operations, JSONB for content.
 *
 * The content shape changes every week while we learn what sells; a DDL migration each
 * time a pack grows a field is a tax paid forever. Zod validates on the way in and out,
 * so the JSONB column is type-safe at both boundaries. See docs/ARCHITECTURE.md.
 */
export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  pack: text("pack").notNull(),
  preset: text("preset").notNull(),
  content: jsonb("content").notNull(),
  /** draft | published | archived */
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteRow = typeof sites.$inferSelect;

/**
 * Append-only snapshots. Every publish stores the content it replaced, so a bad edit is
 * undoable and a sold site has a frozen point to eject from.
 */
export const siteVersions = pgTable("site_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  siteId: uuid("site_id").notNull(),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SiteVersionRow = typeof siteVersions.$inferSelect;

/**
 * The operator's own sheet, imported by pasting a CSV export. `sourceKey` is unique so
 * re-pasting an updated export updates rows instead of duplicating them.
 *
 * This table holds real contact details for businesses that have consented to nothing.
 * It is never committed to git — see CLAUDE.md.
 */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceKey: text("source_key").notNull().unique(),
  business: text("business").notNull(),
  slug: text("slug").notNull(),
  industry: text("industry").notNull(),
  phone: text("phone"),
  waLink: text("wa_link"),
  rating: doublePrecision("rating"),
  reviews: integer("reviews"),
  pctFive: integer("pct_five"),
  photos: integer("photos"),
  social: text("social"),
  mapsPlace: text("maps_place"),
  photo: text("photo"),
  neighborhood: text("neighborhood"),
  district: text("district"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  contacted: boolean("contacted").notNull().default(false),
  /** new | building | published | sent | won | lost */
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LeadRow = typeof leads.$inferSelect;

/**
 * The warmth signal. One table turns every demo into a sensor: an owner who opened the
 * link six times and tapped WhatsApp twice is who to follow up with tomorrow.
 */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  /** view | whatsapp | call | maps */
  type: text("type").notNull(),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EventRow = typeof events.$inferSelect;
