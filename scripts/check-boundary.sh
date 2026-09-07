#!/usr/bin/env bash
# components/site and packs/ are copied verbatim into a client's standalone repo
# by `npm run eject`. That repo has no database, no studio and no other business.
# If anything in the render layer reaches for those, the ejected site cannot
# build — and we would only find out while a paying client waits.
#
# ESLint enforces the import rule. This catches the ways around it: raw SQL,
# env access, and direct driver use.
set -uo pipefail

FAIL=0
DIRS=(components/site packs)
EXISTING=()
for d in "${DIRS[@]}"; do [ -d "$d" ] && EXISTING+=("$d"); done
[ ${#EXISTING[@]} -eq 0 ] && { echo "  ·  no render layer yet — nothing to check"; exit 0; }

check() {
  local label=$1 pattern=$2
  local hits
  hits=$(grep -rnE "$pattern" "${EXISTING[@]}" --include='*.ts' --include='*.tsx' 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "  render layer must not $label:"
    echo "$hits" | sed 's/^/    /'
    FAIL=1
  fi
}

check "import a database driver" "from ['\"](drizzle-orm|@neondatabase|pg|postgres)"
check "read environment variables" "process\.env"
check "import the db or studio layer" "from ['\"][^'\"]*(lib/db|app/studio)"

[ $FAIL -eq 0 ] && echo "  render layer is free of db, env and studio references"
exit $FAIL
