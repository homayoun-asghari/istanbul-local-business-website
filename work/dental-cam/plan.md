# Plan: dental-cam

The first dental pack, preset `cam`, built from the Celestia Smiles study in
`work/design-v3/` and approved as direction 01 in the round-one artifact.

Three things make it different from beauty, and all three come from the regulation
(Resmî Gazete 12.11.2025 No. 33075), not from taste:

- **no `pricelist`** (m.5/1-l, m.5/1-m) — the treatment planner replaces it and must
  never print a number
- **no `proof`** (m.5/1-e) — no rating, no review count, no testimonial; the clinic band
  carries verifiable facts instead
- **`beforeAfter` is newly legal** (m.7/1) and carries its own compliance furniture:
  both dates, no retouching, the "sonuçlar kişiden kişiye değişir" line

Motion is the deliverable, not the trim. The glass objects are the product.

- [ ] 1. Glass photography into `public/stock/dental/` — files: `public/stock/dental/*` — verified by: `packs/presets.test.ts` (every preset path exists on disk)
- [ ] 2. Schema: `dental` in the pack enum; `clinic`, `treatments`, `planner`, `beforeAfter` section types; `bio`/`since` on team members; `updatedAt` + `business.editor` for m.5/1-i — files: `lib/content/schema.ts`, `lib/content/schema.test.ts` — verified by: `npm run test`
- [ ] 3. The pack: `packs/dental/preset.ts` (cam tokens + stock), `packs/dental/build.ts`, registry wiring — files: `packs/dental/*`, `packs/registry.ts`, `packs/dental/build.test.ts` — verified by: a test asserting the built content contains no price, no rating and no testimonial anywhere in its JSON
- [ ] 4. Static render layer: `Clinic`, `Treatments`, `BeforeAfter` + the `cam` hero and its booking variant; `Site.tsx` cases — files: `components/site/*`, `components/site/heroes/Cam.tsx` — verified by: `components/site/render.test.tsx`
- [ ] 5. The planner — files: `components/site/Planner.tsx`, `lib/content/planner.ts`, `lib/content/planner.test.ts` — verified by: unit tests on the plan computation and the WhatsApp message it composes
- [ ] 6. Motion: staged hero entrance, scroll parallax on the molar, tile stagger and hover, carousel, slider drag, gauge fill — files: `app/globals.css`, `components/site/ScrollScene.tsx` — verified by: `./scripts/verify.sh` plus a screenshot pass at 1440×900
- [ ] 7. Mandatory footer block (last updated, site editor) — files: `components/site/Footer.tsx` — verified by: a test asserting both appear for a dental site
- [ ] 8. Seed Özel Hesna, build the demo, deploy, screenshot every section — verified by: the live URL

## Out of scope

- The `pastil` direction. Approved as 02, not built here.
- Real before/after photography. The demo ships the mechanic with a clearly labelled
  3D illustration and an empty state for the clinic's own consented images; fabricating
  patient results is the exact thing m.7/1 exists to stop.
