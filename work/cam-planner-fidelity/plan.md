# cam planner fidelity

Three things, from the user's own list, each checked against the reference recording
(`Screen Recording 2026-09-12 at 4.39.44 PM.mov`, planner at 13.2–16.0s) and the bug
recording (`2026-09-13 at 3.39.18 PM.mov`).

## What the reference does (measured, not remembered)

- Card grid at 1694 capture px: columns 408 / 694 / 550, gaps 21. All three columns
  start at y=320 and end at y=984.
- Left column: three boxes 284 / 160 / 195 tall, gaps 13.
- Right column: 38 px padding; cards 229+17+228 wide; rows 180 / 127 / 196 tall, gaps 17.
- Middle: glass render centred, arc with end dots under it, "360°" breaking the arc,
  two ~108 px thumbnails, 35 px bottom padding.
- Picking: click a tooth → that tooth fades to soft white inside its own outline over
  ~0.3 s. Several can be on. No hover state, no badge, no box, no ring.

## Steps

1. Trace every visible tooth on `arch-front.webp` and `arch-open.webp` as polygons in
   the image's own 760×760 space (seeded watershed, then hand fixes).
   Verify: overlay image of all polygons on the render, looked at.
2. Picker: render back as the model; an SVG with the same viewBox over it; a tooth's
   polygon fades to white when selected. No focus ring on click; keyboard still works.
   Verify: in the browser, `elementFromPoint` at every polygon's inner point returns
   that tooth; clicking each one selects exactly that FDI; screenshot with all on.
3. Layout: grid 408fr/694fr/550fr with the measured gaps as container units; three
   left boxes (03 is "İlk ziyaretiniz mi?" — loyalty discounts are prohibited); right
   panel in the reference's 2 / 1 / 2 card rows, the price card replaced by the
   WhatsApp card.
   Verify: in the browser, the three columns' top and bottom are equal to the pixel at
   1280, 1440, 1600 and 1920 wide; no horizontal overflow at 390.
4. Side-by-side: reference frame and this page at the same scale, composed into one
   image and looked at; fix what differs; send it to the user.
5. `./scripts/verify.sh`, DECISIONS corrections, PR, CI, merge, production check.
