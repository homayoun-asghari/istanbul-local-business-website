# design-v2 — live state (survives a usage-limit cutoff)

## What the user asked for (2026-09-07)
1. **Add leads by hand.** Today only CSV paste works. Needs a "New lead" form. → in progress on `feat/studio-english`
2. **Studio in English.** Only the client-facing sites stay Turkish. → in progress on same branch
3. **Redesign the client sites.** Design is the whole selling point. Must be jaw-dropping,
   modern, clean; must make the owner feel "we reached a new level".
   - Deep research first, then **an artifact for approval**, then code.
   - **Do not delete the existing 5 presets — add to them.**

## Inspiration he supplied (screenshots)
Forge, Sapforce, Hope Rise, AgroControl, WeveAI, Cedro, Krios, Vertex, Mirko Romanelli, GlobeTrans.
Recurring moves: enormous bold sans headlines with tight leading; type-as-graphic (ghosted
wordmark behind content); an image inset *into* the headline (Hope Rise); one acid accent
block (lime/electric yellow) on a neutral ground; soft rounded media cards with floating
inset cards; pill nav and arrow-in-circle CTAs; bento/asymmetric grids; marquee strips;
a dark premium variant.

## Research agents dispatched (results land as notifications — PASTE THEM INTO research.md)
- beauty / medical-aesthetics premium sites
- veterinary / dental / local-business premium sites
- 2026 design language: typography, layout, colour, motion, detail craft

## Own browsing done
`work/design-v2/insp/` screenshots: smalldoorvet.com (warm cream, orange accent, big bold
sans, alternating image/text rows, trust badges, review row, colour CTA band) — the best
direct reference for the vet pack. remedyplace / beaire / bondvet captured but mostly
lazy-loaded behind cookie walls.

## Hard constraint that governs every font choice
Turkish needs ı İ ş Ş ğ Ğ ç Ç ö Ö ü Ü — the face MUST publish a `latin-ext` subset on
Google Fonts. `packs/fonts.ts` is the allowlist and `packs/presets.test.ts` enforces it.

## Candidate display faces (all Google Fonts, all latin-ext — verify before use)
Archivo (+Expanded), Anton, Unbounded, Bricolage Grotesque, Big Shoulders Display,
Familjen Grotesk, Instrument Sans, Onest, Wix Madefor Display, Fraunces, Newsreader.

## Next step after approval
New presets go in `packs/<pack>/preset.ts` alongside the existing five (atolye, klinik,
gece, vet:klinik, vet:mahalle). New section types go in `lib/content/schema.ts` +
`components/site/`. The render-layer boundary still applies.
