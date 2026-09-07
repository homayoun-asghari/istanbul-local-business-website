import { eq } from "drizzle-orm";
import { db } from "./client";
import { sites } from "./schema";
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

export async function listPublishedSlugs(): Promise<string[]> {
  const rows = await db().select({ slug: sites.slug, status: sites.status }).from(sites);
  return rows.filter((r) => r.status === "published").map((r) => r.slug);
}
