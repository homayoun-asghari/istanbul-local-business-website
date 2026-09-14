"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  createSession,
  safeEqual,
  safeNext,
  sessionCookieOptions,
} from "@/lib/studio/auth";
import { contentFromFields, fieldsFromFormData, validate } from "@/lib/studio/form";
import { getSite, publishSite } from "@/lib/db/sites";

export async function signIn(_state: string | null, data: FormData): Promise<string | null> {
  const password = process.env.STUDIO_PASSWORD;
  const secret = process.env.STUDIO_SECRET;
  if (!password || !secret) return "STUDIO_PASSWORD or STUDIO_SECRET is not set.";

  const supplied = String(data.get("password") ?? "");
  if (!safeEqual(supplied, password)) return "Wrong password.";

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSession(secret), sessionCookieOptions);
  redirect(safeNext(data.get("next")));
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/studio/login");
}

export async function publish(_state: string | null, data: FormData): Promise<string | null> {
  const slug = String(data.get("slug") ?? "");
  const site = await getSite(slug);
  if (!site?.content) return "No such business, or its content is corrupt.";

  const candidate = contentFromFields(site.content, fieldsFromFormData(data));
  const result = validate(candidate);
  if (!result.ok) {
    // Nothing is written when validation fails — a half-valid demo must never go live.
    return result.errors.map((e) => `${e.field}: ${e.message}`).join(" · ");
  }

  await publishSite(slug, result.content);
  revalidatePath(`/${slug}`);
  revalidatePath(`/studio/${slug}`);
  return "Published.";
}

export async function importSheet(_state: string | null, data: FormData): Promise<string | null> {
  const { leadsFromCsv } = await import("@/lib/leads/csv");
  const { importLeads } = await import("@/lib/db/leads");

  const csv = String(data.get("csv") ?? "").trim();
  if (!csv) return "Nothing pasted.";

  const { leads, skipped } = leadsFromCsv(csv);
  if (leads.length === 0) return "No rows read. Did you include the header row?";

  const { imported } = await importLeads(leads);
  revalidatePath("/studio/leads");
  return `Imported ${imported} leads${skipped > 0 ? `, skipped ${skipped} blank rows` : ""}.`;
}

export async function buildDemo(_state: string | null, data: FormData): Promise<string | null> {
  const { getLead, setLeadStatus } = await import("@/lib/db/leads");
  const { packForIndustry } = await import("@/packs/registry");
  const { IncompleteLeadError } = await import("@/packs/build");
  const { createSite } = await import("@/lib/db/sites");

  const lead = await getLead(String(data.get("leadId") ?? ""));
  if (!lead) return "Lead not found.";

  const pack = packForIndustry(lead.industry as "beauty" | "vet");
  if (!pack) return `No industry pack for "${lead.industry}" yet.`;

  try {
    const input = {
      business: lead.business,
      slug: lead.slug,
      phone: lead.phone,
      waLink: lead.waLink,
      rating: lead.rating,
      reviews: lead.reviews,
      pctFive: lead.pctFive,
      social: lead.social,
      mapsPlace: lead.mapsPlace,
      photo: lead.photo,
      neighborhood: lead.neighborhood,
      district: lead.district,
      lat: lead.lat,
      lng: lead.lng,
    };
    const content = pack.build(input, pack.pickPreset?.(input));

    const validated = validate(content);
    if (!validated.ok) {
      return validated.errors.map((e) => `${e.field}: ${e.message}`).join(" · ");
    }

    await createSite(validated.content);
    await setLeadStatus(lead.id, "published");
    revalidatePath("/studio");
    revalidatePath("/studio/leads");
  } catch (error) {
    if (error instanceof IncompleteLeadError) return error.message;
    throw error;
  }

  redirect(`/studio/${lead.slug}`);
}

/**
 * Adding one lead by hand. Most leads arrive by CSV, but a lead found on the street or
 * sent by a friend should not require building a spreadsheet first.
 */
export async function addLead(_state: string | null, data: FormData): Promise<string | null> {
  const { normalisePhone } = await import("@/lib/leads/csv");
  const { inferIndustry } = await import("@/lib/leads/industry");
  const { slugify } = await import("@/lib/leads/slug");
  const { importLeads } = await import("@/lib/db/leads");

  const text = (name: string) => String(data.get(name) ?? "").trim();
  const number = (name: string) => {
    const raw = text(name).replace(",", ".");
    return raw === "" ? null : Number.isFinite(Number(raw)) ? Number(raw) : null;
  };

  const business = text("business");
  if (!business) return "Business name is required.";

  const phone = normalisePhone(text("phone"));
  if (!phone) return "Phone must be a Turkish mobile number, e.g. 0551 533 09 19.";

  const slug = slugify(business);
  if (!slug) return "That business name does not produce a usable web address.";

  // The operator can override the guess; blank means infer it from the name.
  const chosen = text("industry");
  const industry = chosen === "" ? inferIndustry(business) : chosen;

  await importLeads([
    {
      sourceKey: slug,
      business,
      slug,
      industry: industry as ReturnType<typeof inferIndustry>,
      phone,
      waLink: `https://wa.me/${phone.replace("+", "")}`,
      rating: number("rating"),
      reviews: number("reviews"),
      pctFive: number("pctFive"),
      photos: null,
      social: text("social") || null,
      mapsPlace: text("mapsPlace") || null,
      photo: text("photo") || null,
      neighborhood: text("neighborhood") || null,
      district: text("district") || null,
      lat: number("lat"),
      lng: number("lng"),
      contacted: false,
      demoBuilt: false,
      demoUrl: null,
    },
  ]);

  revalidatePath("/studio/leads");
  return `Added ${business}.`;
}
