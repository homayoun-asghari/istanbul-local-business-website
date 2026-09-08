import { describe, expect, it } from "vitest";
import * as LeadsTools from "./leads/LeadsTools";

/**
 * The leads page crashed in production with "Element type is invalid … got: undefined",
 * and nothing local caught it: the studio pages are force-dynamic, so `next build` never
 * renders them, and there are no tests that mount them.
 *
 * The cause was three components attached to another component as static properties
 * (`LeadsTools.AddLead = AddLead`) and used from a server component as
 * `<LeadsTools.AddLead />`. Across the server/client boundary a "use client" module is
 * replaced by a reference proxy that only carries its *exports*, so anything hung off a
 * function object arrives undefined and React throws at render.
 *
 * This asserts the shape that mistake breaks: every component the leads page mounts is a
 * real named export of the client module.
 */
describe("the studio's client components", () => {
  for (const name of ["ImportLeads", "AddLead", "BuildButton"] as const) {
    it(`exports ${name} by name, not as a property of another component`, () => {
      expect(typeof LeadsTools[name]).toBe("function");
    });
  }

  it("hangs nothing off a component that would be lost at the boundary", () => {
    for (const value of Object.values(LeadsTools)) {
      if (typeof value !== "function") continue;
      const own = value as unknown as Record<string, unknown>;
      const attached = Object.keys(own).filter((key) => typeof own[key] === "function");
      expect(attached, `${value.name} carries components as static properties`).toEqual([]);
    }
  });
});
