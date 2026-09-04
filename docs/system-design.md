# Vitrin — a production system for selling websites to Istanbul businesses

**Status:** proposed design, awaiting approval. No code written.
**Date:** 2026-09-04
**Stack:** Next.js (App Router) · TypeScript · Neon Postgres · Vercel · pnpm monorepo

---

## 1. The one change I'd make to your plan

Your instinct — build once per industry, customise per business — is right, and it is the
whole ballgame. I'd change one thing, and it's the thing that decides whether this works at
10 leads or at 300.

**You planned to pay the deployment cost per lead. Pay it per sale instead.**

In your process, step 3 is "deploy it to Vercel." If 1 in 20 cold WhatsApp messages converts —
optimistic for cold outreach — then 19 of every 20 Vercel projects you create, domains you
wire, and repos you fork are thrown away. That waste is not just time; it's the thing that
caps how many leads you can work in a week.

So the system splits in two, and the split is the core architectural idea:

| | **Sales surface** | **Delivery surface** |
|---|---|---|
| What it is | One multi-tenant Next.js app, one Vercel project | A standalone repo generated per won deal |
| Holds | Every prospect site, as a row in Neon | Exactly one business, content frozen to disk |
| New site costs | An `INSERT` + revalidate — **seconds** | A build + a deploy — **once, after payment** |
| URL | `berrak-guzellik.vitrin.com.tr` | `berrakguzellik.com` |
| Database | Yes | **None** |
| Admin code | Yes | **None** |

A prospect site is a database row. A client site is a repo. Nothing becomes a repo until
someone has paid for it.

### What this buys you

- **Publishing a demo takes ~30 seconds**, not a deploy cycle. You can put twelve demos in
  front of twelve owners in an afternoon.
- **You can fix all your demos at once.** Found a better hero for beauty clinics? Ship it to
  the kernel and all 40 live demos improve on the next revalidate. With per-lead repos, that
  same improvement is 40 pull requests you will never actually make.
- **Handoff becomes a build step, not a cleanup job.** You are not "removing the admin system"
  from a client's site — the client's site never had one. It was generated without one.

---

## 2. The constraint everything else hangs on

There is exactly one rule that makes the handoff work, and if it breaks anywhere the whole
design degrades into manual per-client surgery:

> **The rendering layer consumes a plain, validated `SiteContent` object and nothing else.**
> No section component ever imports the database, the admin, or the tenant resolver.

`packages/kernel` may not depend on `packages/db`. Full stop. In the multi-tenant app,
`SiteContent` is loaded from Postgres. In an ejected repo, the identical object is imported
from a local `site.content.json`. Same components, same output, different loader.

This is enforceable, not aspirational. Two mechanical checks in `scripts/verify.sh`:

1. **Boundary check** — a dependency rule fails the build if anything under `packages/kernel`
   imports from `packages/db`, `apps/studio`, or `next/headers`.
2. **Eject fidelity check** — render tenant `X` from the multi-tenant app, render the ejected
   repo for `X`, normalise hostnames and build IDs, and diff the HTML. **It must be identical.**

Check 2 is the important one. It turns "the handoff will be clean" from a hope into a test
with an exit code. Per the project's own rule — a completion criterion with no exit code will
eventually be reported as passed without being true.

---

## 3. Approaches considered

**A. Fork a repo per lead** *(your original step 3)*
Simple to picture, no infrastructure. But every lead costs a repo, a Vercel project and a
deploy; improvements never propagate; 95% of the work is discarded unsold. Cost per lead stays
flat forever, which is the one thing this system exists to prevent. **Rejected.**

**B. Multi-tenant renderer + eject on sale** *(recommended)*
Demos are rows; clients are repos. Marginal cost per lead collapses to "fill in a form and
press publish." Requires a database and the render seam in §2 — real but bounded complexity.
**Recommended.**

**C. JSON files in one repo, no database, no admin**
Each business is `content/berrak.json`; the multi-tenant app reads the filesystem; Vercel
preview deploys serve as demo URLs. Genuinely good, and cheaper than B at low volume. It
breaks down when you want the leads pipeline, view analytics, and non-git editing — and every
content change is a git commit and a full rebuild.
**Not rejected — this is Phase 0.** See §11. You get to B by starting at C.

**D. Headless CMS per client (Sanity/Payload)**
A per-client subscription and account you must administer, plus a CMS you'd have to hand over
or strip. Contradicts both "one-time sale" and "frozen static site." **Rejected.**

---

## 4. Industry packs, not templates

An industry is **not** a separate app, and not a fork. It's a data package plus, occasionally,
one or two section components no other industry needs.

```
packages/packs/beauty/
  manifest.ts     which sections, in what order, which are optional
  schema.ts       Zod extension for fields only this industry has
  copy.tr.ts      Turkish default copy + headline formulas
  presets/        2-3 complete design variants (see §6)
  seed.ts         plausible default services, FAQ, trust points
```

What actually differs between industries is smaller than it looks:

| Industry | Sections no one else needs | The thing that sells it |
|---|---|---|
| Güzellik merkezi | Öncesi/sonrası galeri, kampanya şeridi | Visual proof, price transparency |
| Diş kliniği | Tedavi listesi + taksit tablosu, hekim kadrosu | Trust, credentials, payment plans |
| Veteriner | 7/24 acil bandı, evcil hayvan türleri | Reachability at 3am |
| Kuaför | Fiyat listesi, stil galerisi, ekip | Style, personality, walk-in hours |

Everything else — header, hero, hakkımızda, hizmetler, ekip, yorumlar, SSS, iletişim, harita,
çalışma saatleri, footer — is shared kernel, parameterised.

**Adding a new industry later** is: one folder, ~200 lines of Turkish copy and config, three
presets, and at most one new section component. Two to three days, not a rebuild. That is the
direct answer to "how do we add industries without rebuilding the system" — the answer is that
industries are *content*, and only rarely code.

---

## 5. `SiteContent` — the single interchange format

One Zod-validated object is the currency of the entire system. The AI writes it, the studio
edits it, Postgres stores it, the renderer consumes it, and the ejector freezes it.

```ts
SiteContent = {
  version: 3,                      // explicit migrations, never implicit
  pack: "beauty",
  preset: "atolye",                // design variant, see §6
  business: {
    name, legalName?, tagline,
    district, address, mapsUrl, placeId?, lat, lng,
    phone, whatsapp, instagram?, email?,
  },
  hours: { mon..sun: [{ open, close }] | "closed", note? },
  brand: { logo?, tokenOverrides?: Partial<Tokens> },
  sections: Section[],             // discriminated union, ordered
  media: MediaRef[],               // ids into the media table / local files
  seo: { title, description, ogImage },
  legal: { kvkkText, cookieNotice },
}
```

Two decisions worth defending:

**`sections` is an ordered discriminated union, not a fixed page shape.** Reordering or
dropping a section for one business is a data edit, never a code edit. This is what keeps the
per-lead cost near zero.

**`version` with explicit migration functions.** When the dental pack grows a field in week
six, forty published sites must not break. A migration function per version bump, run on read,
is the boring solution that works.

---

## 6. Design tokens and the "AI template" problem

This is where the sale is won or lost, so it gets real design thought rather than a colour
picker.

**A colour swap is not differentiation.** Ten sites in the same layout with different accent
hues read as ten copies of one site — which is precisely the impression that kills the sale.
So a *preset* varies more than colour:

- **Type pairing** — display face, body face, and the scale ratio between them
- **Radius and edge language** — sharp / soft / pill, and whether cards even have edges
- **Section rhythm** — generous editorial whitespace vs dense, information-rich stacking
- **Hero archetype** — full-bleed photo, split, typographic, or collage
- **Image treatment** — duotone, warm grade, hard-cropped, or untouched
- **Motion** — a considered load sequence, or none at all

Three presets per pack across four packs reads, to an owner, like twelve different studios.

**Turkish typography is a hard constraint, not a detail.** The site must render
*ı İ ş Ş ğ Ğ ç Ç ö Ö ü Ü* correctly. A large share of fashionable display faces have no
dotless ı or no ğ, and fall back mid-word — which looks broken to exactly the person you're
selling to. Every font pairing gets checked once against the full Turkish set and then lives in
a curated list. This is a one-time cost that prevents a recurring embarrassment.

**Their own photos beat any design decision you can make.** You already have Maps photos and
street view in your sheet. An owner who opens a link and sees *their own storefront*, shot from
the street, framed in a premium layout, has a completely different reaction than one who sees
a stock photo of a generic clinic. Street-view exterior in the hero is the highest-leverage
trick in this entire document, and it costs one API call.

**Implementation.** Three token layers: primitives (raw scale) → semantic (`--surface`,
`--brand`, `--muted`, `--on-brand`) → preset (bindings + type + rhythm). Emitted as CSS custom
properties on `<html>` from `SiteContent`; Tailwind reads the variables. Per-business overrides
sit in `brand.tokenOverrides` and are deliberately narrow — accent, logo, maybe a font choice.
Wide-open theming produces ugly sites and support burden.

---

## 7. Conversion furniture (what actually sells to a Turkish SMB owner)

The owner is not evaluating your code. They're asking "would this get me more customers?"
So the kernel ships the things that answer that, and nothing else:

- **Sticky WhatsApp button** with a prefilled Turkish message. WhatsApp *is* the booking
  system in Turkey. Do not build a booking engine.
- **Tıkla-ara** on mobile, always one thumb away.
- **Live open/closed state** — "Şu an açık · 19:00'a kadar". Tiny feature, disproportionately
  convincing, because it's the thing a static template never has.
- **Google yorumları** pulled from Places, with the rating badge.
- **Yol tarifi** — one tap to Maps navigation.
- **Instagram şeridi** — their real feed, which makes it feel like *their* site.
- **Fiyat / hizmet listesi**, because opacity about price is the top complaint in this market.

---

## 8. Data model

Relational for operations, JSONB for content. The reason: content shape changes every week
while you learn what sells; operational data doesn't. Running a DDL migration each time the
dental pack grows a field is a tax you'd pay forever, and Zod already gives you type safety at
the boundary.

```
leads         imported from your sheet. name, industry, district, phone, whatsapp,
              maps_url, place_id, instagram, rating, review_count, has_website,
              raw JSONB (the original row, verbatim),
              status: new|drafting|published|sent|warm|won|lost,
              sheet_row_key UNIQUE  ← makes re-import idempotent

sites         lead_id, slug UNIQUE, pack, preset,
              content JSONB (SiteContent), content_version,
              status: draft|published|archived, published_at

site_versions append-only snapshot of content. Rollback, and the freeze point for eject.

media         site_id, role (logo|hero|gallery|staff), blob_url (Vercel Blob),
              source (streetview|maps|instagram|upload|stock), alt_tr, w, h, license_note

events        site_id, type (view|whatsapp_click|call_click|maps_click|gallery_open),
              ts, ua_hash, referrer          ← see below

outreach      lead_id, channel, template_used, sent_at, video_url, replied_at, notes
```

**`events` is the sleeper feature.** It costs one table and turns every demo into a warmth
sensor. "Owner opened it 6 times over two days and tapped WhatsApp twice" tells you exactly
who to follow up with tomorrow — and that ranking is worth more to your revenue than any
amount of design polish. Ten lines of code.

**There is no `industries` table.** Packs live in code, versioned alongside the components they
depend on. A database-driven template system lets data and code drift apart, and you find out
in production, on a demo you already sent.

---

## 9. Handoff: `pnpm eject <slug>`

One command, run once, after money changes hands:

1. Snapshot the site's current `content` into `site_versions` — the frozen point.
2. Scaffold from `templates/standalone/`.
3. **Vendor** `packages/kernel` and the one relevant pack into the new repo as source. Copied,
   not linked — the client must never depend on your monorepo.
4. Download every referenced image from Blob into `public/`, rewrite the references to local
   paths. No hotlinking back to your infrastructure.
5. Write `site.content.json` and swap the loader from "read Postgres" to "import JSON."
6. Emit `robots.txt` + `sitemap.xml` for their real domain, remove the demo `noindex`.
7. Generate a Turkish `README.md`, KVKK aydınlatma metni, and cookie notice.
8. `git init`, initial commit, push to a fresh repo.
9. **Run the fidelity check** from §2 — build the ejected repo, diff its HTML against the
   multi-tenant render. Non-identical output fails the eject.

The result has no database client, no admin routes, no environment variables beyond an
optional analytics key, and no trace of any other business. It is a static Next.js site that
will still build in three years.

Then: new Vercel project, their domain, hand over the repo, archive the tenant, mark won.

---

## 10. The workflow, end to end

```
  SHEET IMPORT ──► TRIAGE ──► ENRICH ──► DRAFT ──► REVIEW ──► PUBLISH
                                                                 │
                     ┌───────────────────────────────────────────┘
                     ▼
              OUTREACH ──► WATCH SIGNALS ──► CLOSE ──► EJECT ──► HAND OFF
```

1. **Import** your Google Sheet → `leads`. Column-mapped, idempotent on `sheet_row_key`, so
   re-importing an updated sheet is safe.
2. **Triage** — pick a lead, assign pack + preset. One click.
3. **Enrich** — Google Places details, photos, street view, reviews, hours. Automatic.
4. **Draft** — AI writes `SiteContent` in Turkish from the enriched data. This is the only
   step that spends meaningful tokens, and it's bounded: a few thousand, producing JSON, not code.
5. **Review** — you edit in the studio with live preview. Target: **five minutes.**
6. **Publish** — `slug.vitrin.com.tr`, `noindex` + `X-Robots-Tag` + robots disallow.
7. **Outreach** — studio gives you the Turkish WhatsApp template and holds the walkthrough
   video link. You send it from your own phone.
8. **Watch** — the leads board sorts by warmth from `events`.
9. **Close**, then **eject**, deploy to their domain, hand over.

**Every per-lead step above is data entry. None of it opens a code editor.** If you ever find
yourself editing code for a specific business, that is a bug in the pack — fix it in the pack
so every future lead in that industry benefits.

---

## 11. Economics

The thesis of this system, stated plainly: **it converts a per-lead cost into a per-industry
cost.** Per-lead work is paid every time forever; per-industry work is paid once.

| | Fork-per-lead (A) | This system (B) |
|---|---|---|
| Build the kernel | — | ~2–3 weeks, once |
| Add an industry | ~1 week each, every time | ~2–3 days, once per industry |
| **Per lead** | **2–4 hours, ~100k+ tokens** | **~10 minutes, ~10–15k tokens** |
| Per sale (handoff) | Manual cleanup, error-prone | One command, verified by test |
| Improve all demos | Impossible in practice | One deploy |
| 50 leads in one industry | ~150 hours | ~10 hours + the 3-week build |

Break-even against forking lands somewhere around **lead 12–15** in the first industry. Every
industry after the first breaks even in single digits, because the kernel is already paid for.

The economics only hold while the per-lead path stays code-free. Guard that number: if a lead
starts costing an hour, something has leaked out of the pack and into the individual site, and
that is the metric worth watching above all others.

---

## 12. Deliberately excluded

Each of these is a real temptation, and each would cost more than it returns:

- **A visual page builder.** The single biggest trap here. Months of work to reproduce a worse
  version of what presets already give you. Presets and section reordering cover it.
- **A client-facing CMS.** You decided: frozen static, changes are billable. Honour that; it
  also removes an entire support surface.
- **Booking / payments / e-commerce.** WhatsApp and cash. Adding these means support calls.
- **Multi-user admin, roles, audit log.** One operator. A password is enough.
- **i18n machinery.** Turkish only, hardcoded `tr-TR`. Add a locale layer the day you need a
  second language and not one day sooner.
- **A blog / content system in v1.** Nobody buys a website for the blog they'll never write.
- **Publishing the design system to npm.** It has one consumer.
- **Automated tests on marketing copy.** Test the schema, the eject fidelity, and the
  boundary rule. Not the words.

---

## 13. Project layout

```
apps/
  studio/            single-operator admin: leads, editor, preview, publish, eject, signals
  showcase/          multi-tenant public renderer — every demo site, resolved by hostname
packages/
  kernel/            sections, layout, token runtime, SEO, a11y, hours + WhatsApp logic
                     ⚠ may not import db, studio, or next/headers
  content/           SiteContent Zod schema, version migrations, defaults
  packs/             beauty/ dental/ vet/ salon/
  db/                Drizzle schema + queries   (studio + showcase only)
  eject/             generator + fidelity differ
templates/
  standalone/        the skeleton repo eject fills in
scripts/
  verify.sh          the single definition of done
```

---

## 14. Risk and compliance

- **Demo sites must not be indexed.** `noindex`, `X-Robots-Tag`, and a robots disallow on the
  whole demo domain. An unsold demo outranking a business for its own name is a real problem
  and an awkward conversation.
- **Photos before consent.** Public Maps/Instagram photos in a private demo shown to the owner
  is fine. Before a delivered site goes live on their domain, get consent in writing — one line
  in the handover message.
- **KVKK.** Once their site is live they are a data controller. Ship an aydınlatma metni and a
  cookie notice in the ejected repo. Cheap, and it's the kind of detail that reads as
  professional.
- **WhatsApp outreach.** Cold-messaging at volume from one number gets it banned. Use a
  dedicated WhatsApp Business number, keep messages genuinely personal, keep daily volume low.
  The demo link does the selling; the message just has to earn the click.

---

## 15. Phasing — and the trap to avoid

The most likely failure mode of this project is **building the studio first.** It's the most
enjoyable part to build and the most likely to be thrown away, because you don't yet know what
`SiteContent` should contain. You learn that by making real sites for real businesses.

**Phase 0 — Kernel + three real demos, by hand (approach C).**
No database, no studio. `content/*.json` files in the repo. Build the kernel, the beauty pack,
three presets. Hand-write three real Istanbul beauty clinics from your sheet and send them.
*Exit:* three demos in front of three owners, and a `SiteContent` shape that survived contact.

**Phase 1 — Neon + studio.**
Migrate the JSON files into Postgres unchanged. Leads board, content editor, live preview,
publish, events. *Exit:* publishing a demo takes under ten minutes with no code editor open.

**Phase 2 — Eject.**
Build it when the first deal is close. Design for it from day one (§2); build it on demand.
*Exit:* the fidelity diff passes on a real client.

**Phase 3 — Enrichment + AI drafting.**
Places API, street view, Instagram, AI copy. *Exit:* per-lead time under five minutes.

**Phase 4 — Industries two, three, four.** Each one now costs days.

Do them in this order. Each phase is independently useful, and each one is vertical — it ends
in something you can actually put in front of a business owner.

---

## 16. What I need from you

1. **Approve or push back on §1** — the demos-are-rows / clients-are-repos split. It's the load-bearing decision.
2. **Your sheet's header row** (or a CSV export). I couldn't read it — it's behind a Google
   login. Needed to build the importer; not needed to start Phase 0.
3. **First industry.** I'd start with beauty clinics: most visual, most photo-driven, most
   obviously improved by a good site, and your sheet appears to lead with them.
4. **A demo domain.** Something short and Turkish that doesn't look like a test environment.
