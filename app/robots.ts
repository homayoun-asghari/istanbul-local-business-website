import type { MetadataRoute } from "next";

/**
 * Blanket disallow. This host only ever serves unsold demos carrying real businesses'
 * names, plus the operator's studio. A client's own site is a different repository with
 * a different robots.txt — see scripts/eject.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
