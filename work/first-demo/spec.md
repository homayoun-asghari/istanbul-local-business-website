# first-demo

## What a user can do when this is done

A phone visitor opens Melike Adıgüzel Güzellik Salonu's demo, sees the salon's real Google
rating and review count, and reaches the salon in one tap by WhatsApp or phone.

## Acceptance criteria

- [ ] `SiteContent` accepts the Melike Adıgüzel fixture and rejects content missing a phone,
      missing a slug, or carrying an unknown section type. — `vitest`
- [ ] Rendering the page from the fixture produces HTML containing the business name, the
      district `Bakırköy`, the rating rendered Turkish-style as `4,7`, and the review count
      rendered as `1.273`. — `vitest`
- [ ] The rendered HTML contains a `https://wa.me/905515330919` link carrying a prefilled
      Turkish message, and a `tel:+905515330919` link. — `vitest`
- [ ] `isOpenNow` returns the correct state at the open boundary, the close boundary, one
      minute before close, one minute after close, and on a closed day, in `Europe/Istanbul`.
      — `vitest`
- [ ] Every font used declares the `latin-ext` subset, so `ı İ ş ğ ç ö ü` render rather than
      falling back mid-word. — `vitest`
- [ ] The page's metadata sets `robots: noindex, nofollow`, and `/robots.txt` disallows
      everything. — `vitest`
- [ ] `./scripts/check-boundary.sh` exits 0 with the render layer present: nothing under
      `components/site/` or `packs/` imports a database driver, `lib/db`, `app/studio`,
      `next/headers`, or reads `process.env`. — `./scripts/check-boundary.sh`
- [ ] `./scripts/verify.sh` exits 0 without any database connection configured, so CI stays
      green without secrets. — `./scripts/verify.sh`
- [ ] With `DATABASE_URL` set, `npm run db:push` creates the schema and `npm run db:seed`
      inserts Melike Adıgüzel, after which `npm run db:check` prints the slug and the section
      count. — operator-run; blocked on a Neon credential this session cannot hold.

## Out of scope

- Deploying. `CLAUDE.md` makes deploying a human action; the operator runs `vercel` or
  connects the repo.
- The studio. Content is seeded by script in this slice; editing arrives in `studio-edit`.
- Multiple presets. One beauty preset here; `presets` adds the other two.
- Any second business, and the leads import.
- Real Google review text. Only the aggregate rating and count are available without a paid
  API, so individual reviews are not shown at all rather than faked.
- Instagram feed. This lead has no Instagram handle in the sheet.
