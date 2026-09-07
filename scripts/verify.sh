#!/usr/bin/env bash
# The single definition of "done".
#
# The agent runs this. The pre-merge gate runs this. CI runs THIS FILE, never a
# copy of its steps — that is what stops local green and CI green from drifting
# apart. Add a check here and all three consumers get it at once.
#
#   ./scripts/verify.sh          full run
#   ./scripts/verify.sh --fast   skip the build (inner development loop)
set -uo pipefail

FAST=0
[ "${1:-}" = "--fast" ] && FAST=1

FAILED=()
step() {
  local name=$1; shift
  printf '\n──  %s\n' "$name"
  if "$@"; then
    printf '  ok  %s\n' "$name"
  else
    printf '  FAIL  %s\n' "$name"
    FAILED+=("$name")
  fi
}

if [ ! -f package.json ]; then
  echo "No package.json. Run /kickoff."
  exit 1
fi

step "format"    npm run format:check --silent
step "lint"      npm run lint --silent
step "typecheck" npm run typecheck --silent
step "test"      npm run test --silent

# The boundary that makes client handoff a build step instead of a rewrite:
# the render layer must never reach for the database or the studio. ESLint
# enforces the import rule; this catches the ways around it.
step "boundary"  ./scripts/check-boundary.sh

if [ "$FAST" -eq 0 ]; then
  step "build"   npm run build --silent
fi

echo
if [ ${#FAILED[@]} -gt 0 ]; then
  printf 'VERIFY FAILED: %s\n' "${FAILED[*]}"
  exit 1
fi
echo "VERIFY PASSED"
