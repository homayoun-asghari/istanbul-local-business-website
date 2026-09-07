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
  if (!password || !secret) return "STUDIO_PASSWORD veya STUDIO_SECRET tanımlı değil.";

  const supplied = String(data.get("password") ?? "");
  if (!safeEqual(supplied, password)) return "Parola hatalı.";

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
  if (!site?.content) return "Bu işletme bulunamadı veya içeriği bozuk.";

  const candidate = contentFromFields(site.content, fieldsFromFormData(data));
  const result = validate(candidate);
  if (!result.ok) {
    // Nothing is written when validation fails — a half-valid demo must never go live.
    return result.errors.map((e) => `${e.field}: ${e.message}`).join(" · ");
  }

  await publishSite(slug, result.content);
  revalidatePath(`/${slug}`);
  revalidatePath(`/studio/${slug}`);
  return "Yayınlandı.";
}

export async function importSheet(_state: string | null, data: FormData): Promise<string | null> {
  const { leadsFromCsv } = await import("@/lib/leads/csv");
  const { importLeads } = await import("@/lib/db/leads");

  const csv = String(data.get("csv") ?? "").trim();
  if (!csv) return "Yapıştırılan alan boş.";

  const { leads, skipped } = leadsFromCsv(csv);
  if (leads.length === 0) return "Hiç satır okunamadı. Başlık satırını da yapıştırdınız mı?";

  const { imported } = await importLeads(leads);
  revalidatePath("/studio/leads");
  return `${imported} kayıt alındı${skipped > 0 ? `, ${skipped} boş satır atlandı` : ""}.`;
}

export async function buildDemo(_state: string | null, data: FormData): Promise<string | null> {
  const { getLead, setLeadStatus } = await import("@/lib/db/leads");
  const { packForIndustry } = await import("@/packs/registry");
  const { IncompleteLeadError } = await import("@/packs/build");
  const { createSite } = await import("@/lib/db/sites");

  const lead = await getLead(String(data.get("leadId") ?? ""));
  if (!lead) return "Kayıt bulunamadı.";

  const pack = packForIndustry(lead.industry as "beauty" | "vet");
  if (!pack) return `"${lead.industry}" için henüz bir sektör paketi yok.`;

  try {
    const content = pack.build({
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
    });

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
