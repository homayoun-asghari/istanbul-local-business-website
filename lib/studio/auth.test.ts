import { describe, expect, it } from "vitest";
import { createSession, safeEqual, sessionCookieOptions, verifySession } from "./auth";

const SECRET = "a-secret-that-is-long-enough-to-be-real";

describe("session tokens", () => {
  it("accepts a token it just signed", async () => {
    expect(await verifySession(SECRET, await createSession(SECRET))).toBe(true);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSession("some-other-secret");
    expect(await verifySession(SECRET, token)).toBe(false);
  });

  it("rejects a token whose expiry was edited", async () => {
    const token = await createSession(SECRET);
    const forged = `${Date.now() + 999_999_999}.${token.split(".")[1]}`;
    expect(await verifySession(SECRET, forged)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const issued = new Date("2026-09-07T00:00:00Z");
    const token = await createSession(SECRET, issued);
    const muchLater = new Date("2026-09-09T00:00:00Z");
    expect(await verifySession(SECRET, token, muchLater)).toBe(false);
  });

  it("rejects nonsense and absence", async () => {
    expect(await verifySession(SECRET, undefined)).toBe(false);
    expect(await verifySession(SECRET, "")).toBe(false);
    expect(await verifySession(SECRET, "no-separator")).toBe(false);
    expect(await verifySession(SECRET, ".onlyseparator")).toBe(false);
  });
});

describe("safeEqual", () => {
  it("matches identical strings", () => {
    expect(safeEqual("hunter2", "hunter2")).toBe(true);
  });

  it("rejects different strings, including prefixes and different lengths", () => {
    expect(safeEqual("hunter2", "hunter3")).toBe(false);
    expect(safeEqual("hunter", "hunter2")).toBe(false);
    expect(safeEqual("", "x")).toBe(false);
  });
});

describe("the session cookie", () => {
  it("is not readable by scripts and does not travel over plain http", () => {
    expect(sessionCookieOptions.httpOnly).toBe(true);
    expect(sessionCookieOptions.secure).toBe(true);
    expect(sessionCookieOptions.sameSite).toBe("lax");
  });
});
