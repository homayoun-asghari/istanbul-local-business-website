# istanbul-local-business-website

<!-- Keep this file under 200 lines. Facts and rules only, never procedures.
     Procedures belong in .claude/skills/. -->

## What this is

Vitrin is a production system for selling websites to Istanbul businesses that don't have one.
One website kernel per industry; each business is a configuration of it, published in minutes
as a demo at `vitrin.vercel.app/<slug>` and served from Neon. Outreach is WhatsApp, video
first. When a business buys, `npm run eject <slug>` generates a standalone repository the
client owns — ordinary Next.js, no database, no studio, no other business in it. The whole
system exists to drive the marginal cost of one more demo close to zero.

Sites are in Turkish. Nothing in this project may cost money: free tiers only.

## Commands

| Task                     | Command                      |
| ------------------------ | ---------------------------- |
| Verify everything        | `./scripts/verify.sh`        |
| Verify fast (skip build) | `./scripts/verify.sh --fast` |
| Dev server               | `npm run dev`                |
| Format                   | `npm run format`             |
| Test                     | `npm run test`               |
| Push schema to Neon      | `npm run db:push`            |
| Eject a sold site        | `npm run eject <slug>`       |

## The one rule that must not break

`components/site/` and `packs/` are the render layer. They are copied verbatim into a client's
standalone repository on eject, where no database and no studio exist. They may not import
`lib/db`, `app/studio`, `next/headers`, a database driver, or read `process.env` — they receive
a validated `SiteContent` object and nothing else.

ESLint and `scripts/check-boundary.sh` both enforce this, and both run in `verify.sh`. If a
change seems to need an exception, the change is wrong. See `docs/ARCHITECTURE.md`.

## Never commit lead data

`leads.csv`, exports from the sheet, and anything under `clients/` are real contact details for
businesses that have consented to nothing. They are gitignored. Keep it that way.

## The verify contract

**Work is not done until `./scripts/verify.sh` exits 0.**

Never report a feature complete on a failing or unrun verify. CI runs this exact
script — not a copy of its steps — so local green means CI green.

**Never write a completion criterion that has no exit code.** If a claim cannot fail
mechanically, it will eventually be reported as passed without being true.

## Definition of done

A feature is done when all of these hold:

1. `./scripts/verify.sh` exits 0
2. Every acceptance criterion in `work/<slug>/spec.md` is ticked, each with the
   command output that proves it
3. The `spec-auditor` subagent returns PASS
4. CI is green on the PR
5. The PR is merged and the branch deleted

## Scale the ceremony to the change

| Change                                   | Path                                                      |
| ---------------------------------------- | --------------------------------------------------------- |
| < ~50 lines, one file, obvious           | branch → implement → verify → commit. Skip spec and plan. |
| Multi-file, one sitting                  | plan in `work/<slug>/plan.md`, then implement. Skip spec. |
| New surface, ambiguous, or > one sitting | full loop: spec → plan → implement                        |

Unskippable ceremony gets abandoned. Match the process to the size of the work.

## Build vertically, never horizontally

Every issue must cross the whole stack and end in something a user can do.

- Good: "User can sign up" — schema + server + UI + tests, all in one issue.
- Bad: "Set up the database", then "build the API", then "build the UI".

A horizontal slice cannot be demoed, cannot be verified end to end, and cannot be
merged safely on its own.

## Git rules

- **Never commit to `main`.** Every change goes on `<type>/<slug>` and lands via PR.
- The branch name always matches its `work/<slug>/` folder.
- One commit per plan step. Each commit leaves verify green so `git bisect` works.
- Conventional prefixes: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.
- Squash on merge. Delete the branch.
- Never force-push a shared branch.

## Safety

- **Never deploy.** Deploying is a human action, or CI on merge to `main`.
- Never read or write `.env*`, `*.pem`, or anything under `secrets/`.
- Never pipe a remote script into a shell.
- Run at most 3 subagents at once. Do not let a subagent spawn its own subagents.

## Project state lives on disk

| File                   | Holds                                                        |
| ---------------------- | ------------------------------------------------------------ |
| `docs/PRD.md`          | What we are building and why. Scope and non-goals.           |
| `docs/ARCHITECTURE.md` | Stack, layout, boundaries, and the reasoning behind them.    |
| `docs/DECISIONS.md`    | Append-only. One line per decision, newest last.             |
| `work/<slug>/spec.md`  | Problem, acceptance criteria as checkboxes, out of scope.    |
| `work/<slug>/plan.md`  | Numbered steps, exact files, how each step is verified.      |
| `work/<slug>/notes.md` | Anything learned the hard way. Environment traps especially. |

Read `docs/` before planning. Append to `DECISIONS.md` on merge. `work/<slug>/` is
deleted after merge — git history is the archive.

## Resuming after an interruption

Never resume from memory. Run `git branch --show-current`, `git log --oneline -15`,
and read `work/<slug>/plan.md`. Resume from the last verified state.
