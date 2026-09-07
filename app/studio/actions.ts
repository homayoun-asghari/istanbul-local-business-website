"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, createSession, safeEqual, sessionCookieOptions } from "@/lib/studio/auth";
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
  redirect(String(data.get("next") || "/studio"));
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
