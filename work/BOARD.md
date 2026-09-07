# Board

Source of truth for remaining work. `/ship-it` works top to bottom.
Status: `todo` -> `doing` -> `done`

Every slice crosses the whole stack and ends in something a person can do.

| #   | Slug              | Slice (what a user can do)                                                                                                       | PRD    | Status |
| --- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| 1   | `first-demo`      | A phone visitor opens Melike Adıgüzel Güzellik Salonu's demo on a live Vercel URL, sees their real 4.7★/1273 rating and photo, and reaches them in one tap by WhatsApp or phone. Content comes from Neon. | J3     | doing  |
| 2   | `studio-edit`     | The operator logs into `/studio`, edits that business's Turkish content in a form, publishes, and sees the change live.           | J2     | todo   |
| 3   | `leads-import`    | The operator pastes CSV from the leads sheet and sees all 42 businesses as a working list with industry and pipeline status.      | J1     | todo   |
| 4   | `demo-from-lead`  | The operator turns any lead row into a published demo in under ten minutes, pre-filled from the pack, without opening a code editor. | J2     | todo   |
| 5   | `presets`         | The operator switches a business between three visually distinct designs and picks the one that fits.                            | J5     | todo   |
| 6   | `warmth-signals`  | The operator sees how many times each demo was opened and whether WhatsApp was tapped, and sorts the follow-up list by it.        | J4     | todo   |
| 7   | `eject`           | `npm run eject <slug>` produces a standalone repo that builds green on its own and renders HTML identical to the demo.            | J6     | todo   |
| 8   | `vet-pack`        | The operator publishes a veteriner demo, including the 7/24 acil band, without any change under `components/site/`.               | J7     | todo   |
| 9   | `ai-draft`        | The operator generates a Turkish first draft for a lead and edits it, instead of writing every section from scratch.              | J2     | todo   |

## Notes on ordering

Slice 1 is deliberately the whole vertical for one real business — schema, database, render
layer, beauty preset, conversion furniture, deploy. It is shippable alone: at the end of it
there is a URL that can actually be sent to an owner, which is the only thing that produces
revenue.

Slices 2–4 remove the operator's manual work. Slice 7 is built when the first deal gets close,
but the boundary it depends on is enforced from slice 1 by `scripts/check-boundary.sh`.

Slice 8 is the real test of the pack abstraction. If it needs changes under `components/site/`,
the abstraction is wrong and that is worth knowing before there are four industries.
