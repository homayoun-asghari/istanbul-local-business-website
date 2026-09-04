# system-design — session state

## Status
Design phase. NO CODE YET. Awaiting user approval of `docs/system-design.md`.

## Decisions locked with the user (2026-09-04)
1. Revenue: **one-time sale + handoff**. Eject is the default path for every won deal.
2. Operators: **just him, indefinitely**. Studio is a single-operator internal tool. No roles, no audit log.
3. Content source: he has a **Google Sheet of Istanbul leads** (Maps links, photos, street view).
   Sheet: docs.google.com/spreadsheets/d/1jtc8lCV9Pzw3wOZ0YDUQRIeO23TiWjfG7LX0RiLgmZM
   Must also be customizable manually AND by AI.
4. Post-sale: **frozen static site**. Client cannot self-edit. Every change is billable work.

## Open items
- Could not read the leads sheet (Brave cookie import returned 0 cookies; Google login wall).
  NEED: the sheet's header row, or a CSV export, before building the importer.
  Importer is designed column-mapped so this is not blocking for design.

## Resume from here
- `git branch --show-current` should be `docs/system-design`
- Read `docs/system-design.md`
- Next step after approval: /kickoff (writes PRD/ARCHITECTURE/DECISIONS + Kanban), then writing-plans.
