### Proof — captured 2026-09-07 09:07 UTC

```
$ npx vitest run
 Test Files  4 passed (4)
      Tests  46 passed (46)

$ ./scripts/check-boundary.sh
  render layer is free of db, env and studio references

$ npm run db:check
/melike-adiguzel-guzellik  status=published  pack=beauty  preset=atolye  sections=7  valid=true

$ ./scripts/verify.sh
  ok  format
  ok  lint
  ok  typecheck
  ok  test
  ok  boundary
  ok  build
VERIFY PASSED
```
