import { describe, expect, it } from "vitest";
import { config } from "@/middleware";
import { melike } from "@/lib/content/fixtures/melike";
import { placeholderCount } from "./form";

describe("what the middleware protects", () => {
  const matches = (path: string) =>
    config.matcher.some((pattern) =>
      new RegExp(`^${pattern.replace("/:path*", "(/.*)?")}$`).test(path),
    );

  it("guards the studio and everything under it", () => {
    expect(matches("/studio")).toBe(true);
    expect(matches("/studio/melike-adiguzel-guzellik")).toBe(true);
    expect(matches("/studio/login")).toBe(true);
  });

  it("leaves the public demo, robots.txt and the root page open", () => {
    // A salon owner must reach their demo with no account and no login wall.
    expect(matches("/melike-adiguzel-guzellik")).toBe(false);
    expect(matches("/robots.txt")).toBe(false);
    expect(matches("/")).toBe(false);
  });
});

describe("placeholder badging", () => {
  it("counts sections whose copy came from the pack, not the business", () => {
    // The Melike fixture ships hero, services, about and gallery as pack defaults.
    expect(placeholderCount(melike)).toBe(4);
  });

  it("counts nothing once every section carries real content", () => {
    const answered = {
      ...melike,
      sections: melike.sections.map((section) => ({ ...section, placeholder: false })),
    };
    expect(placeholderCount(answered)).toBe(0);
  });
});
