/**
 * One operator, one password. No accounts, no reset flow, no roles — see docs/PRD.md.
 *
 * Web Crypto rather than node:crypto so the same code runs in middleware, and a
 * constant-time compare rather than `===` so the password cannot be recovered a
 * character at a time from response timing.
 */
const encoder = new TextEncoder();

export const SESSION_COOKIE = "vitrin_studio";
const SESSION_HOURS = 12;

function base64url(bytes: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(bytes))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(secret: string, payload: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return base64url(signature);
}

/** Constant-time string compare. Length is allowed to leak; content is not. */
export function safeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function createSession(secret: string, now = new Date()): Promise<string> {
  const expires = now.getTime() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expires);
  return `${payload}.${await sign(secret, payload)}`;
}

export async function verifySession(
  secret: string,
  token: string | undefined,
  now = new Date(),
): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  if (!safeEqual(provided, await sign(secret, payload))) return false;

  const expires = Number(payload);
  return Number.isFinite(expires) && expires > now.getTime();
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
} as const;

/**
 * `?next=` comes from the URL, so it is attacker-controlled. Only a same-origin path is
 * allowed: a protocol-relative "//evil.com" or an absolute URL would otherwise turn the
 * login page into an open redirect.
 */
export function safeNext(value: unknown): string {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/studio";
}
