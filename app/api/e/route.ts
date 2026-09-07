import { NextResponse, type NextRequest } from "next/server";
import { recordEvent } from "@/lib/db/leads";

/**
 * The warmth beacon. No cookie, no id, no fingerprint — it records that a demo was
 * opened or a button tapped, and nothing about who did it. That is enough to rank
 * tomorrow's follow-ups, which is all it exists for.
 */
const ALLOWED = new Set(["view", "whatsapp", "call", "maps"]);

export async function POST(request: NextRequest) {
  try {
    const { slug, type } = await request.json();
    if (typeof slug !== "string" || !ALLOWED.has(type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await recordEvent(slug, type, request.headers.get("referer"));
  } catch {
    // A demo must never break because analytics did.
  }
  return NextResponse.json({ ok: true });
}
