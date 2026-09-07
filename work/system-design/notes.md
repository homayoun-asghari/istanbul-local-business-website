# system-design — kickoff record

Design and kickoff are **done**. Nothing is being built yet.

## Where things stand
- Branch `chore/kickoff` holds the scaffold, docs and board. `./scripts/verify.sh` exits 0.
- **No git remote exists.** `gh` is authenticated as `homayoun-asghari`. A repo must be created
  before any PR flow works. Not done without explicit permission — creating a remote publishes.
- Next work: slice 1 (`first-demo`) in `work/BOARD.md`, via `/ship-it`.

## Environment traps learned the hard way
- `create-next-app` refuses a non-empty directory. Scaffold into a temp dir and copy in.
- `next typegen` must run before `tsc --noEmit`, or `LayoutProps` is undefined. It is baked
  into the `typecheck` script.
- vitest 5 needs `@types/node` >= 22. The scaffold ships v20; it was bumped to v24.
- `eslint-config-next@16` exports flat configs directly (`eslint-config-next/core-web-vitals`).
  Using `FlatCompat` with it crashes on a circular structure.
- pnpm is not installed. Use npm.
- The leads sheet is readable via the **Google Drive MCP**, not the browser — Brave holds a
  lock on its cookie store, so cookie import returns nothing.
  Sheet id: `1jtc8lCV9Pzw3wOZ0YDUQRIeO23TiWjfG7LX0RiLgmZM`

## Leads sheet shape (42 rows)
`Contacted | Demo built | Demo URL | Reply | business | phone | wa_link | rating | reviews |
pct_five | photos | social | maps_place | streetview | photo | neighborhood | district`

- `photos` is a **count**, `photo` is a single Google-hosted image URL.
- `streetview` is a Maps **pano link**, not an image — but the `lat,lng` in it is usable.
- No address, hours, services or staff columns. Those are pack placeholders.
- Mix: ~25 güzellik/estetik, ~11 veteriner, 2 emlak, 1 diş.
- First target: **Melike Adıgüzel Güzellik Salonu**, Bakırköy/Osmaniye, 4.7★, 1273 reviews.
