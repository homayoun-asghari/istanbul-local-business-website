# Decisions

Append-only. One line per decision, newest last.

2026-09-04 — Build one multi-tenant renderer instead of one repo per lead — cold outreach converts in the low single digits, so a deploy per lead discards most of the work and makes fixing all live demos impossible.
2026-09-04 — Prospect demos are database rows; only sold sites become repositories — pays the deployment cost per sale rather than per lead.
2026-09-04 — The render layer consumes a validated SiteContent object and may not import the database, the studio or request context — this single rule is what makes client handoff a build step rather than a manual rewrite.
2026-09-04 — Handoff fidelity is verified by diffing the ejected repo's HTML against the demo render — a completion criterion with no exit code eventually gets reported as passed without being true.
2026-09-04 — Industries are data packs, not forks — adding one must cost days, not a rebuild.
2026-09-04 — Revenue model is one-time sale plus handoff; no recurring hosting — user's decision, and it makes eject the default path for every won deal.
2026-09-04 — Single operator indefinitely; no roles, no audit log, one password — user's decision.
2026-09-04 — Sold sites are frozen static; the client cannot self-edit and changes are billable — user's decision; removes an entire support surface.
2026-09-07 — Zero spend: free tiers only, no paid APIs, no purchased domains — user's constraint. Rules out Google Places and Street View Static enrichment; the leads sheet already carries photo, rating, reviews and coordinates.
2026-09-07 — Demos are paths on one free Vercel project, not subdomains — without a purchased domain there is no wildcard DNS, so hostname routing is unavailable.
2026-09-07 — Demos stay on the operator's Vercel Hobby account; a sold site deploys on the client's own Vercel account — Hobby forbids commercial use, and post-handoff the client's account is where it belongs anyway.
2026-09-07 — Neon plus a minimal studio form from day one, rather than JSON files first — user chose this over the recommended file-first phase, accepting the risk of building the editor before the content shape has settled.
2026-09-07 — No automated screenshot or walkthrough-video generation — user records outreach assets by hand.
2026-09-07 — Demo content combines verified sheet facts with clearly-marked industry placeholders; never invented prices, staff or clinical claims — owners read these and a wrong specific is worse than a missing section.
2026-09-07 — Outreach is video-first: a WhatsApp video plays inline with no click, and the link is sent only after interest — an unrecognised vercel.app link in a cold message reads as a scam and risks the number being banned.
2026-09-07 — First industry is güzellik/estetik — it is 25 of the 42 leads and the first row; veteriner is second at 11.
2026-09-07 — First demo is Melike Adıgüzel Güzellik Salonu (Bakırköy/Osmaniye) — 4.7 stars across 1,273 reviews is the strongest verified social proof in the sheet.
2026-09-07 — Single Next.js app with route groups, not a monorepo — pnpm is absent and workspaces buy nothing at this size; eject copies directories rather than resolving workspace links.
2026-09-07 — Leads are imported by pasting CSV, not via the Google Sheets API — avoids OAuth setup and a paid quota, and the sheet stays the operator's own pipeline tracker.
2026-09-07 — Lead contact data is never committed to git — it is real contact information for businesses that have consented to nothing.
2026-09-07 — Assumption recorded in place of a sixth question: the operator writes and edits Turkish copy in the studio; AI drafting is a later convenience slice, not a dependency.
2026-09-07 — Turkish time suffixes are derived from the spoken form of the number, not hardcoded — "19:00’a" is right only because nineteen ends in "dokuz"; the 08:00–20:00 hours of the veteriner pack would have rendered "08:00’a kadar", which a Turkish reader reads instantly as machine-written.
2026-09-07 — Gallery images already used in the hero are dropped, and an empty gallery is skipped — most leads arrive with exactly one Google photo, so the same picture would otherwise appear twice on nearly every demo.
2026-09-07 — Images are served with a plain <img> from Google's CDN rather than next/image — Vercel's Hobby plan meters image transformations and 40 demos would exhaust the quota; eject downloads images locally.
2026-09-07 — The site has no dark mode — these are real business websites that commit to one look, not documents that follow the reader's theme.
2026-09-07 — The Next.js agent-rules block in CLAUDE.md is committed deliberately, not stripped — `next dev` rewrites it on every run, so removing it only produces a permanently dirty tree.
2026-09-07 — scripts/check-boundary.sh also greps for next/headers and server-only — the spec audit found the rule was claimed in the proof but enforced only by ESLint.
2026-09-07 — Turkish letters are folded before any keyword match, not just in slugs — JavaScript's /i flag does not fold İ, so /veteriner/i silently missed "VETERİNER" and every 7/24 clinic in the sheet.
2026-09-07 — Content drafting is deterministic pack seeding rather than an LLM call — free, instant, identical every run, and structurally unable to invent a price or a treatment.
2026-09-07 — Presets are spread across leads by a hash of the slug — three salons in the same district receiving the same layout in one week is how a demo reads as a reused template.
2026-09-07 — Image src accepts an http(s) URL or a root-relative path — a demo points at the business's Google photo, an ejected client site at its own public/ folder; both are valid states of one field.
2026-09-07 — The ejected repo pins turbopack.root and outputFileTracingRoot — without it Next walks up, adopts the operator's project as the workspace root and compiles its middleware into the client's site.
2026-09-07 — Deploy denials and permission prompts were removed from the project settings at the owner's explicit instruction; the guard hook (no commits to main, no force-push to trunk, no piping remote scripts to a shell) is kept.
2026-09-08 — Every stock photograph was regenerated with gpt-image-2 as a plain photograph — the earlier assets were crops of AI _website mockups_, so "DISCOVER YOUR STYLE", "NAIL CARE" and a BOOK NOW button were baked into the pixels of the Gece and Makro heroes.
2026-09-08 — Kesim's cut-out keeps its own backdrop, flattened to the exact page ground (#ECD6BF) by modelling the studio gradient from the margins — keying a transparent PNG risks a haloed edge, and a flat colour that matches the section behind it is invisible without any keying.
2026-09-08 — The team grid gets four generated staff portraits rather than treatment close-ups — a photo of hands captioned "Melike — Kurucu" reads as a broken page.
2026-09-08 — The map is composed from OpenStreetMap raster tiles in-page, not embedded — Google retired the keyless embed (301 + X-Frame-Options: SAMEORIGIN, so an empty box) and OSM's own embed now demands WebGL and apologises in English when it is missing.
2026-09-08 — Scroll reveals are driven by a shared rAF pass over pending elements, not IntersectionObserver — an observer only reports at frame boundaries, so a fling scroll can carry a section from below the fold to above it without ever reporting an intersection, leaving it invisible.
2026-09-08 — Hero motion is one custom property, --sy, written per frame by ScrollScene and read by the stylesheet — no transition on it, because an eased parallax lags the finger.
2026-09-08 — .salon-word sets display:inline-block, .salon-in does not — the shared class silently turned the Menü hero's flex price rows back into inline-block and ran the whole list onto one line.
2026-09-08 — The salon nav is filtered to sections the site actually has — a lead with no price list was being given a "Fiyatlar" link that scrolled nowhere.
