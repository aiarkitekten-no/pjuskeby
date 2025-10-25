This folder stages API server sources before copying to ../server/.

Run locally (server):
1) rsync -a . ../server/
2) npm run api            # or: npm run api:dev (watch)

Health check:
- curl http://localhost:4100/health

Verify endpoints (read-only by default):
- sh /var/www/vhosts/pjuskeby.org/scripts/verify-api.sh
- Output: httpdocs/AI-learned/api-proof-YYYY-MM-DD.txt
- Optional write-tests: WRITE_OK=1 sh scripts/verify-api.sh

Auth flow (Phase 4 minimal):
- POST /api/auth/login { email, password } → { token }
- Authorization: Bearer <token>
- GET /api/auth/me → current user
- POST /api/auth/logout → revoke session

Roles:
- comments/moderate: admin or moderator
- admin/wipe-all: admin

Safety notes:
- No hardcoded keys. Uses .env.
- Wipe-all requires double confirmation.
- Passwords compared plain temporarily; upgraded in Phase 5.
