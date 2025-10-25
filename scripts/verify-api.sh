#!/bin/sh
# Verifies key API endpoints and writes a report to AI-learned/api-proof-$(date +%F).txt

set -eu

BASE="http://localhost:4100"
OUT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs/AI-learned"
OUT="$OUT_DIR/api-proof-$(date +%F).txt"

pass=0
fail=0

check() {
  name="$1"; url="$2"; method="${3:-GET}"; data="${4:-}"; exp="$5"
  if [ "$method" = "GET" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  else
    if [ -n "$data" ]; then
      code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H 'content-type: application/json' --data "$data" "$url")
    else
      code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
    fi
  fi
  if [ "$code" = "$exp" ]; then
    printf "[PASS] %s -> %s (expected %s)\n" "$name" "$code" "$exp" | tee -a "$OUT"
    pass=$((pass+1))
  else
    printf "[FAIL] %s -> %s (expected %s)\n" "$name" "$code" "$exp" | tee -a "$OUT"
    fail=$((fail+1))
  fi
}

mkdir -p "$OUT_DIR"
echo "API proof run at $(date -Iseconds)" > "$OUT"

# Public endpoints
check "health" "$BASE/health" GET "" 200
check "streets list" "$BASE/api/streets/list" GET "" 200
check "streets index" "$BASE/api/streets" GET "" 200
check "places list" "$BASE/api/places" GET "" 200
check "people list" "$BASE/api/people" GET "" 200
check "businesses list" "$BASE/api/businesses" GET "" 200
check "lakes list" "$BASE/api/lakes" GET "" 200
check "organizations list" "$BASE/api/organizations" GET "" 200
check "events list" "$BASE/api/events" GET "" 200
check "map layer lakes" "$BASE/api/map/layers/lakes" GET "" 200

# Protected / requires body
check "auth me (no token)" "$BASE/api/auth/me" GET "" 401
check "auth logout (no token)" "$BASE/api/auth/logout" POST "" 401
check "comments moderate (no token)" "$BASE/api/comments/123/moderate" PATCH '{"status":"approved"}' 401
check "admin wipe-all (bad confirm)" "$BASE/api/admin/wipe-all" POST '{"confirm":"NO"}' 422

# Optional write tests (set WRITE_OK=1 to enable)
if [ "${WRITE_OK:-0}" = "1" ]; then
  check "streets create" "$BASE/api/streets" POST '{"name":"Test","slug":"test"}' 201
  check "places create" "$BASE/api/places" POST '{"name":"Test","slug":"test","category":"park"}' 201
  check "people create" "$BASE/api/people" POST '{"name":"Alice","slug":"alice","streetId":"x"}' 201
  check "businesses create" "$BASE/api/businesses" POST '{"name":"Shop","slug":"shop","type":"store","streetId":"x"}' 201
  check "lakes create" "$BASE/api/lakes" POST '{"name":"Lake","slug":"lake"}' 201
  check "organizations create" "$BASE/api/organizations" POST '{"name":"Org","slug":"org","type":"ngo"}' 201
  check "events create" "$BASE/api/events" POST '{"title":"Event","slug":"event","placeId":"x","startDate":"2025-01-01T00:00:00.000Z","category":"general"}' 201
fi

echo "Summary: PASS=$pass FAIL=$fail" | tee -a "$OUT"

exit 0
