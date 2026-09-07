import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import robots from "./robots";
import { NOINDEX } from "@/lib/content/seo";

/**
 * The rule under test is a compliance rule, not a preference: an unsold demo carries a
 * real business's name, so it must never be indexed. It had no test until the spec
 * audit asked for one.
 */
describe("nothing on this host may be indexed", () => {
  it("robots.txt disallows the entire host", () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(rule.userAgent).toBe("*");
    expect(rule.disallow).toBe("/");
    expect(rule.allow).toBeUndefined();
  });

  it("the shared robots directive refuses indexing, following and caching", () => {
    expect(NOINDEX).toEqual({ index: false, follow: false, nocache: true });
  });

  // These two files cannot be imported here — layout.tsx pulls in next/font, which is a
  // build-time transform. Reading them is the mechanical way to prove neither has
  // drifted to its own inline robots object.
  it.each(["app/layout.tsx", "app/(site)/[slug]/page.tsx"])(
    "%s takes its robots directive from the shared constant",
    (file) => {
      const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
      expect(source, `${file} must import NOINDEX`).toContain('from "@/lib/content/seo"');
      expect(source, `${file} must use it`).toContain("robots: NOINDEX");
      expect(source, `${file} must not inline its own robots object`).not.toMatch(
        /robots:\s*\{\s*index:/,
      );
    },
  );
});
