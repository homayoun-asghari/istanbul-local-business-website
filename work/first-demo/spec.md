# first-demo

## What a user can do when this is done

A phone visitor opens Melike Adıgüzel Güzellik Salonu's demo, sees the salon's real Google
rating and review count, and reaches the salon in one tap by WhatsApp or phone.

## Acceptance criteria

- [x] `SiteContent` accepts the Melike Adıgüzel fixture and rejects content missing a phone,
      → `vitest lib/content/schema.test.ts` — rejects a missing phone, a non-E.164 phone, a **missing** slug, a capitalised slug, an unknown section type and a rating above five
      missing a slug, or carrying an unknown section type. — `vitest`
- [x] Rendering the page from the fixture produces HTML containing the business name, the
      → `vitest components/site/render.test.tsx` — asserts "Melike Adıgüzel Güzellik Salonu", "Bakırköy", "4,7", "1.273", "%92"
      district `Bakırköy`, the rating rendered Turkish-style as `4,7`, and the review count
      rendered as `1.273`. — `vitest`
- [x] The rendered HTML contains a `https://wa.me/905515330919` link carrying a prefilled
      → `vitest components/site/render.test.tsx` — asserts the wa.me href with `?text=`, `tel:+905515330919`, and `0551 533 09 19` as displayed
      Turkish message, and a `tel:+905515330919` link. — `vitest`
- [x] `isOpenNow` returns the correct state at the open boundary, the close boundary, one
      → `vitest lib/content/hours.test.ts` — 12 passed, incl. open boundary, close boundary, ±1 minute, closed Sunday, an overnight shift, and a 23:30Z case that is already tomorrow in Istanbul
      minute before close, one minute after close, and on a closed day, in `Europe/Istanbul`.
      — `vitest`
- [x] Every font used declares the `latin-ext` subset, so `ı İ ş ğ ç ö ü` render rather than
      → `vitest packs/presets.test.ts` — reads components/site/fonts.ts and asserts latin-ext on every next/font call, plus registry membership
      falling back mid-word. — `vitest`
- [x] The page's metadata sets `robots: noindex, nofollow`, and `/robots.txt` disallows
      → `vitest app/seo.test.ts` — asserts `robots()` disallows `/` with no allow rule, that `NOINDEX` is `{index:false, follow:false, nocache:true}`, and that both layout and route take the directive from the shared constant rather than inlining their own. Added after the spec audit found this criterion had no test at all.
      everything. — `vitest`
- [x] `./scripts/check-boundary.sh` exits 0 with the render layer present: nothing under
      → `./scripts/check-boundary.sh` exits 0; proved falsifiable by adding a `next/headers` import, which fails it with exit 1. The `next/headers` pattern was added after the spec audit found the script claimed that rule but never checked it — until then it lived only in the ESLint rule.
      `components/site/` or `packs/` imports a database driver, `lib/db`, `app/studio`,
      `next/headers`, or reads `process.env`. — `./scripts/check-boundary.sh`
- [x] `./scripts/verify.sh` exits 0 without any database connection configured, so CI stays
      → `./scripts/verify.sh` → VERIFY PASSED (format, lint, typecheck, test, boundary, build). CI ran it green on PR #1 with no secrets
      green without secrets. — `./scripts/verify.sh`
- [x] With `DATABASE_URL` set, `npm run db:push` creates the schema and `npm run db:seed`
      → Neon provisioned via `vercel integration add neon --plan free_v3`. `npm run db:push` → "Changes applied"; `npm run db:seed` → "seeded /melike-adiguzel-guzellik"; `npm run db:check` → "status=published pack=beauty preset=atolye sections=7 valid=true"
      inserts Melike Adıgüzel, after which `npm run db:check` prints the slug and the section
      count. 
## Out of scope

- Deploying by hand. The repo is connected to Vercel, so a merge to `main` deploys.
- The studio. Content is seeded by script in this slice; editing arrives in `studio-edit`.
- Multiple presets. One beauty preset here; `presets` adds the other two.
- Any second business, and the leads import.
- Real Google review text. Only the aggregate rating and count are available without a paid
  API, so individual reviews are not shown at all rather than faked.
- Instagram feed. This lead has no Instagram handle in the sheet.
