# PRD — Vitrin

## Summary

Vitrin is a production system for selling websites to Istanbul businesses that don't have
one. One excellent website kernel is built per industry; each business is a configuration of
it, published in minutes as a demo. Cold outreach happens over WhatsApp, video first. When a
business buys, its site is ejected into a standalone repository the client owns outright,
with none of the internal tooling attached. The system exists to make the marginal cost of
producing and sending one more demo close to zero.

## Users

**The operator (one person, indefinitely).** Imports leads, produces demos, sends them, tracks
who is interested, closes deals, hands off. Needs speed above everything: the whole system is
worthless if producing a demo takes an hour.

**The business owner (the prospect).** Receives a WhatsApp video, then a link. Opens it on a
phone, in Turkish, usually on mobile data. Is not evaluating code — is asking "would this get
me more customers, and does it look like it's actually mine?"

**The client (a prospect who paid).** Owns the ejected repository. May later want a CMS, a
redesign, or a different developer. Must not be locked to anything the operator runs.

## User journeys

1. **J1 — Import leads.** The operator pastes CSV exported from the leads sheet and sees every
   business as a workable row: name, district, rating, review count, phone, WhatsApp, photo,
   industry, and pipeline status.
2. **J2 — Produce a demo.** From a lead row, the operator creates a site, reviews the
   pre-filled Turkish content, and publishes it to a live URL. Target: under ten minutes, with
   no code editor opened.
3. **J3 — The owner is convinced.** On a phone, the owner sees their own name, district, real
   Google rating and review count, their own photo, and can reach the business in one tap by
   WhatsApp or phone. The site says whether they are open right now.
4. **J4 — Follow up the warm ones.** The operator sees how many times each demo was opened and
   whether WhatsApp was tapped, and works the list in that order.
5. **J5 — Fit the design to the business.** The operator switches a business between visually
   distinct presets, so no two demos sent in the same week look like the same template.
6. **J6 — Hand off a sale.** One command produces a standalone repository for a bought site:
   ordinary Next.js, content in one file, images local, no database, no studio, no other
   business. It builds on its own and renders identically to the demo.
7. **J7 — Add an industry.** The operator adds a new industry pack — sections, Turkish copy,
   presets — without changing the render kernel.

## Non-goals for v1

- A visual page builder. Presets and section ordering cover the need at a fraction of the cost.
- A client-facing CMS. Sold sites are frozen; changes are billable work.
- Booking, payments, e-commerce. WhatsApp is the booking system in this market.
- Multi-user accounts, roles, audit log. One operator, one password.
- Internationalisation machinery. Turkish only, `tr-TR` hardcoded.
- A blog or article system.
- Any paid service. No paid APIs, no paid hosting tier, no purchased domains.
- Custom domains for demos. Demos are paths on one free Vercel project.
- Automated screenshots or walkthrough videos. The operator records those by hand.

## What "v1 is finished" means

1. `./scripts/verify.sh` exits 0.
2. At least one güzellik demo and one veteriner demo are live on real Vercel URLs, built from
   real leads in the sheet.
3. Publishing a demo from an imported lead takes under ten minutes, measured, with no code
   editor opened.
4. `npm run eject <slug>` produces a repository that builds green on its own and whose rendered
   HTML matches the demo.
5. A second industry pack was added without modifying anything under `components/site/`.
