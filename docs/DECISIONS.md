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
