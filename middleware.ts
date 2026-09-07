import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/studio/auth";

/**
 * The studio is the only protected surface. Demo pages stay public — a salon owner must
 * be able to open their link with no account and no login wall.
 */
export const config = { matcher: ["/studio/:path*"] };

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/studio/login") return NextResponse.next();

  const secret = process.env.STUDIO_SECRET;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (secret && (await verifySession(secret, token))) return NextResponse.next();

  const login = new URL("/studio/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}
