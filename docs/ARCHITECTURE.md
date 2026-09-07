# Architecture — Vitrin

## The shape of the thing

Two surfaces, one codebase.

**The sales surface** is one Next.js app on one free Vercel project. Every prospect demo is a
row in Neon, served at `vitrin.vercel.app/<slug>`. Publishing a demo is an insert plus a
revalidate — seconds, not a deploy.

**The delivery surface** is a standalone repository generated per sale by `npm run eject`. It
contains one business, no database, no studio, and no trace of anyone else.

The reason for the split is arithmetic. Cold WhatsApp converts at a low single-digit rate, so
deploying per lead throws away most of the work. Demos are rows; only sales become
repositories.

## Stack, and why

| Choice                        | Why                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16, App Router**    | The ejected site must be ordinary, boring, hireable code. Next is what a Turkish freelancer will recognise if the client replaces us.                                                       |
| **TypeScript**                | The content object crosses AI drafting, a form, a database and a renderer. Types plus Zod are what stop that becoming a guessing game.                                                      |
| **Neon Postgres (free tier)** | Free, serverless, no idle cost. Chosen over files because the operator wants to edit in a browser form rather than commit JSON.                                                             |
| **Drizzle**                   | Thin. Schema is TypeScript, migrations are readable, and it does not need to exist in the ejected repo.                                                                                     |
| **Tailwind v4**               | Design tokens are CSS custom properties; Tailwind reads them. Presets swap the variables, not the markup.                                                                                   |
| **Vercel (Hobby)**            | Free. Demos are the operator's own projects. A **sold site deploys on the client's own Vercel account**, which is both correct after a handoff and keeps commercial use off the Hobby plan. |
| **npm workspaces — not used** | A single app with route groups. pnpm is not installed and a monorepo buys nothing at this size. Less to break.                                                                              |
| **Vitest**                    | Tests the schema, the migrations and the eject fidelity. Not the marketing copy.                                                                                                            |

Deliberately absent: Google Places API, Street View Static API, blob storage, a CMS, an auth
provider. All cost money. The leads sheet already carries the photo, rating, review count,
coordinates and WhatsApp link.

## Layout

```
app/
  (site)/[slug]/          the public demo renderer — resolves a business by path
  studio/                 the operator's admin, behind one password
  api/                    event beacon, publish actions
components/
  site/                   THE RENDER LAYER — sections, layout, token runtime
                          ⚠ may not import lib/db, app/studio, next/headers or process.env
lib/
  content/                SiteContent Zod schema, version migrations, defaults
  db/                     Drizzle schema and queries        (studio + route handlers only)
packs/
  beauty/  vet/           per-industry manifest, schema extension, Turkish copy, presets, seed
scripts/
  verify.sh               the single definition of done
  check-boundary.sh       enforces the rule below
  eject.ts                generates a client's standalone repository
clients/                  generated repos, gitignored — never committed here
```

## The boundary that everything depends on

> The render layer consumes a plain, validated `SiteContent` object and nothing else.

`components/site/` and `packs/` are copied verbatim into a client's repository, where no
database and no studio exist. So they may not import `lib/db`, `app/studio`, `next/headers`,
a database driver, or read `process.env`.

This is enforced twice, both wired into `scripts/verify.sh`:

- **ESLint** — a `no-restricted-imports` rule scoped to those directories.
- **`scripts/check-boundary.sh`** — greps for the ways around the import rule: raw driver
  imports, `process.env`, and path-relative reaches into `lib/db`.

A third check arrives with the eject slice: build the ejected repository, render it, and diff
its HTML against the demo. Non-identical output fails the eject. That turns "the handoff will
be clean" into a check with an exit code rather than a hope.

## Data model

Relational for operations, JSONB for content. Content shape changes weekly while we learn what
sells; operational data does not. A schema migration every time a pack grows a field is a tax
paid forever, and Zod already validates at the boundary.

| Table           | Holds                                                                                                                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `leads`         | One row per business from the sheet: business, phone, wa_link, rating, reviews, pct_five, photos count, social, maps_place, streetview, photo, neighborhood, district, industry, pipeline status. `source_key` is unique so re-importing an updated sheet is idempotent. |
| `sites`         | `lead_id`, `slug`, `pack`, `preset`, `content` JSONB, `content_version`, status, `published_at`.                                                                                                                                                                         |
| `site_versions` | Append-only content snapshots. Rollback, and the frozen point for eject.                                                                                                                                                                                                 |
| `media`         | `site_id`, role, local path, source (maps / instagram / upload / stock), Turkish alt text, provenance note.                                                                                                                                                              |
| `events`        | `site_id`, type (`view`, `whatsapp_click`, `call_click`, `maps_click`), timestamp, referrer. The warmth signal behind J4.                                                                                                                                                |

There is no `industries` table. Packs live in code, versioned with the components they depend
on. A database-driven template system lets data and code drift apart, and you discover it in
production on a demo already sent.

**Lead data is never committed.** It is real business contact information for people who have
not consented to anything. It lives in Neon and in the operator's sheet, and `clients/` and any
CSV export are gitignored.

## What is real and what is not

**Real:** the business name, district, neighbourhood, phone, WhatsApp link, Google rating,
review count, five-star percentage, coordinates, Instagram handle and the Maps photo — all
straight from the sheet, all verifiable by the owner in ten seconds.

**Placeholder, and marked as such in the studio:** services, prices, staff, opening hours and
about text, seeded from the industry pack. The owner will read these. They are written to be
plausible and generic — real service names for the industry, never invented prices, never
invented staff, never a clinical claim. The outreach message says content is a starting point.

**Not simulated at all:** there is no fake analytics, no fake reviews carousel, no fake
booking. If we don't have it, the section is dropped rather than faked.

## Compliance

- Demo pages carry `noindex` and a robots disallow. An unsold demo must never rank for a
  business's own name.
- Images from Google Maps are used in a private demo shown to the owner. Before a sold site
  goes live on the client's domain, written consent for imagery is required — one line in the
  handover message.
- The ejected repository ships a Turkish KVKK aydınlatma metni and a cookie notice, because the
  client becomes a data controller the moment their site is live.
