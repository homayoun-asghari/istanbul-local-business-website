import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
