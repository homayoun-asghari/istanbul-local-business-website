# Plan: first-demo

- [x] 1. Content schema and the real fixture — files: `lib/content/schema.ts`,
      `lib/content/schema.test.ts`, `lib/content/fixtures/melike.ts` — verified by:
      `vitest lib/content`
- [x] 2. Opening-hours logic in Europe/Istanbul — files: `lib/content/hours.ts`,
      `lib/content/hours.test.ts` — verified by: `vitest lib/content/hours`
- [x] 3. Design tokens, Turkish-safe fonts and the beauty preset — files: `app/globals.css`,
      `packs/beauty/preset.ts`, `packs/beauty/fonts.ts`, `packs/beauty/fonts.test.ts` —
      verified by: `vitest packs/beauty`
- [x] 4. Render layer: sections and page shell — files: `components/site/*.tsx`,
      `components/site/render.test.tsx` — verified by: `vitest components/site` and
      `./scripts/check-boundary.sh`
- [x] 5. Conversion furniture: WhatsApp, call, live open state, map, sticky mobile bar —
      files: `components/site/ContactBar.tsx`, `components/site/Hours.tsx`,
      `components/site/Map.tsx`, tests alongside — verified by: `vitest components/site`
- [x] 6. Route, metadata and robots — files: `app/(site)/[slug]/page.tsx`,
      `app/robots.ts`, `app/(site)/[slug]/metadata.test.ts` — verified by: `vitest app` and
      `npm run build`
- [ ] 7. Neon schema, loader and seed — files: `lib/db/schema.ts`, `lib/db/client.ts`,
      `lib/db/sites.ts`, `drizzle.config.ts`, `scripts/seed.ts`, `scripts/db-check.ts` —
      verified by: `./scripts/verify.sh` green with no DATABASE_URL, and the operator running
      `db:push && db:seed && db:check`
