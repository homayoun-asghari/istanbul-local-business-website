import { asc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { events, leads, sites, type LeadRow } from "./schema";
import type { Lead } from "@/lib/leads/csv";

export async function importLeads(parsed: Lead[]): Promise<{ imported: number }> {
  if (parsed.length === 0) return { imported: 0 };

  // Idempotent on sourceKey: re-pasting an updated export refreshes rows rather than
  // duplicating them, and never clobbers pipeline status the operator has moved on.
  for (const lead of parsed) {
    await db()
      .insert(leads)
      .values({
        sourceKey: lead.sourceKey,
        business: lead.business,
        slug: lead.slug,
        industry: lead.industry,
        phone: lead.phone,
        waLink: lead.waLink,
        rating: lead.rating,
        reviews: lead.reviews,
        pctFive: lead.pctFive,
        photos: lead.photos,
        social: lead.social,
        mapsPlace: lead.mapsPlace,
        photo: lead.photo,
        neighborhood: lead.neighborhood,
        district: lead.district,
        lat: lead.lat,
        lng: lead.lng,
        contacted: lead.contacted,
      })
      .onConflictDoUpdate({
        target: leads.sourceKey,
        set: {
          business: lead.business,
          industry: lead.industry,
          phone: lead.phone,
          waLink: lead.waLink,
          rating: lead.rating,
          reviews: lead.reviews,
          pctFive: lead.pctFive,
          photos: lead.photos,
          social: lead.social,
          mapsPlace: lead.mapsPlace,
          photo: lead.photo,
          neighborhood: lead.neighborhood,
          district: lead.district,
          lat: lead.lat,
          lng: lead.lng,
        },
      });
  }
  return { imported: parsed.length };
}

export type LeadWithSignals = LeadRow & { hasSite: boolean; views: number; taps: number };

export async function listLeads(): Promise<LeadWithSignals[]> {
  const rows = await db().select().from(leads).orderBy(asc(leads.business));
  const built = new Set((await db().select({ slug: sites.slug }).from(sites)).map((r) => r.slug));

  const counts = await db()
    .select({ slug: events.slug, type: events.type, total: sql<number>`count(*)::int` })
    .from(events)
    .groupBy(events.slug, events.type);

  return rows.map((row) => {
    const mine = counts.filter((c) => c.slug === row.slug);
    return {
      ...row,
      hasSite: built.has(row.slug),
      views: mine.find((c) => c.type === "view")?.total ?? 0,
      taps: mine
        .filter((c) => c.type === "whatsapp" || c.type === "call")
        .reduce((sum, c) => sum + c.total, 0),
    };
  });
}

export async function getLead(id: string): Promise<LeadRow | null> {
  const rows = await db().select().from(leads).where(eq(leads.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function setLeadStatus(id: string, status: string): Promise<void> {
  await db().update(leads).set({ status }).where(eq(leads.id, id));
}

export async function recordEvent(slug: string, type: string, referrer: string | null) {
  await db().insert(events).values({ slug, type, referrer });
}

export async function signalsFor(slug: string): Promise<{ views: number; taps: number }> {
  const rows = await db()
    .select({ type: events.type, total: sql<number>`count(*)::int` })
    .from(events)
    .where(eq(events.slug, slug))
    .groupBy(events.type);
  return {
    views: rows.find((r) => r.type === "view")?.total ?? 0,
    taps: rows
      .filter((r) => r.type === "whatsapp" || r.type === "call")
      .reduce((sum, r) => sum + r.total, 0),
  };
}
