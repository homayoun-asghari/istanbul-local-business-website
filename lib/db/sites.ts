import { desc, eq } from "drizzle-orm";
import { db } from "./client";
import { siteVersions, sites, type SiteRow } from "./schema";
import { SiteContentSchema, type SiteContent } from "@/lib/content/schema";

/**
 * The one seam in the system. Here content comes from Postgres; in a client's ejected
 * repository the identical object is imported from site.content.json. Same components,
 * same HTML, different loader — which is what makes handoff a build step.
 */
export async function getPublishedSite(slug: string): Promise<SiteContent | null> {
  const rows = await db().select().from(sites).where(eq(sites.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || row.status !== "published") return null;

  const parsed = SiteContentSchema.safeParse(row.content);
  if (!parsed.success) {
    // Never render half a site to a business owner. Loud in logs, 404 to the visitor.
    console.error(`site "${slug}" failed content validation`, parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

export type StudioSite = {
  id: string;
  slug: string;
  pack: string;
  preset: string;
  status: string;
  updatedAt: Date;
  content: SiteContent | null;
};

function toStudioSite(row: SiteRow): StudioSite {
  const parsed = SiteContentSchema.safeParse(row.content);
  return {
    id: row.id,
    slug: row.slug,
    pack: row.pack,
    preset: row.preset,
    status: row.status,
    updatedAt: row.updatedAt,
    content: parsed.success ? parsed.data : null,
  };
}

export async function listSites(): Promise<StudioSite[]> {
  const rows = await db().select().from(sites).orderBy(desc(sites.updatedAt));
  return rows.map(toStudioSite);
}

export async function getSite(slug: string): Promise<StudioSite | null> {
  const rows = await db().select().from(sites).where(eq(sites.slug, slug)).limit(1);
  return rows[0] ? toStudioSite(rows[0]) : null;
}

/**
 * Publishing snapshots the content it replaces into site_versions first, so a bad edit is
 * always one step from being undone and a sold site has a frozen point to eject from.
 */
export async function publishSite(slug: string, content: SiteContent): Promise<void> {
  const existing = await db().select().from(sites).where(eq(sites.slug, slug)).limit(1);
  const row = existing[0];
  if (!row) throw new Error(`no site with slug "${slug}"`);

  await db().insert(siteVersions).values({ siteId: row.id, content: row.content });
  await db()
    .update(sites)
    .set({ preset: content.preset, content, status: "published", updatedAt: new Date() })
    .where(eq(sites.id, row.id));
}

export async function countVersions(slug: string): Promise<number> {
  const row = (await db().select().from(sites).where(eq(sites.slug, slug)).limit(1))[0];
  if (!row) return 0;
  const versions = await db()
    .select({ id: siteVersions.id })
    .from(siteVersions)
    .where(eq(siteVersions.siteId, row.id));
  return versions.length;
}

/** Creating a demo from a lead. Re-running replaces the draft rather than failing. */
export async function createSite(content: SiteContent): Promise<void> {
  await db()
    .insert(sites)
    .values({
      slug: content.slug,
      pack: content.pack,
      preset: content.preset,
      content,
      status: "published",
    })
    .onConflictDoUpdate({
      target: sites.slug,
      set: {
        pack: content.pack,
        preset: content.preset,
        content,
        status: "published",
        updatedAt: new Date(),
      },
    });
}
