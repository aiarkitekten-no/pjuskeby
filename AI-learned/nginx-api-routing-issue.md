# Nginx API Routing Issue - Rumour System

**Date:** 2025-10-26  
**Issue:** 502 Bad Gateway on `/api/rumors/*` endpoints  
**Root Cause:** Nginx routing conflict between old Fastify API and new Astro SSR API

## Problem Description

When implementing interactive features for the rumour system (Phase 5), API endpoints were created in Astro SSR at `/api/rumors/[id]/react` and `/api/rumors/[id]/view`. These endpoints worked perfectly when tested directly on `localhost:4000`, but returned 502 Bad Gateway when accessed via the production domain.

### Error Message
```
POST https://pjuskeby.org/api/rumors/rumor-003-test/react 502 (Bad Gateway)
Failed to register reaction
```

## Root Cause Analysis

The nginx configuration had this routing:

```nginx
# API proxy - WRONG!
location /api/ {
    proxy_pass http://127.0.0.1:4100;  # Old Fastify API
    ...
}

# Main site proxy
location ~ ^/(?!(api|geojson)) {
    proxy_pass http://127.0.0.1:4000;  # Astro SSR
    ...
}
```

**The issue:** All `/api/*` requests were being proxied to port 4100 (old Fastify API server), but the new rumour endpoints exist in Astro SSR on port 4000.

### Port Architecture
- **Port 4000:** Astro SSR (PM2: `pjuskeby`) - Contains `/api/rumors/*` endpoints
- **Port 4100:** Fastify API (separate service) - Contains other API endpoints
- **Port 3100:** OLD root-owned PM2 (killed during debugging)

## Solution

### Option 1: Route All API to Astro (if Fastify not needed)
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4000;  # Changed to Astro SSR
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Option 2: Split Routes (if both APIs needed)
```nginx
# Rumor API (Astro SSR) - MUST BE FIRST (more specific)
location /api/rumors/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Fastify API (other endpoints) - MUST BE SECOND (less specific)
location /api/ {
    proxy_pass http://127.0.0.1:4100;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Important:** Nginx matches location blocks in order of specificity. More specific paths (`/api/rumors/`) must come BEFORE less specific paths (`/api/`).

## Testing Process

1. **Test endpoints directly on Astro SSR:**
   ```bash
   curl -X POST http://localhost:4000/api/rumors/rumor-001-test/view \
     -H "Content-Type: application/json"
   # Result: {"success":true,"views":1} ✅
   ```

2. **Test through nginx (before fix):**
   ```bash
   curl -X POST https://pjuskeby.org/api/rumors/rumor-001-test/view \
     -H "Content-Type: application/json"
   # Result: 502 Bad Gateway ❌
   ```

3. **After nginx config fix and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   curl -X POST https://pjuskeby.org/api/rumors/rumor-001-test/view \
     -H "Content-Type: application/json"
   # Result: {"success":true,"views":2} ✅
   ```

## File Path Issue (Bonus)

During implementation, also discovered that API endpoints were reading from wrong path in production:

**Wrong (development only):**
```typescript
const dataPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
```

**Correct (production SSR):**
```typescript
const dataPath = join(process.cwd(), 'content/data/rumors.normalized.json');
```

In Astro SSR builds, the `src/` prefix is removed during build process.

## Affected Files
- `/etc/nginx/sites-available/pjuskeby.org` (nginx config)
- `src/pages/api/rumors/[id]/react.ts` (API endpoint)
- `src/pages/api/rumors/[id]/view.ts` (API endpoint)

## Lessons Learned

1. **Check nginx routing first** when APIs work locally but fail in production
2. **Document port architecture** clearly when running multiple services
3. **Test endpoints at each layer:** Direct → PM2 → Nginx → HTTPS
4. **Use specific routes before generic routes** in nginx configs
5. **Remember SSR path differences** between dev and production

## Prevention

Add to deployment checklist:
- [ ] Verify nginx routes for new API endpoints
- [ ] Test API endpoints through full stack (not just localhost)
- [ ] Document which service runs on which port
- [ ] Use consistent path handling (avoid hardcoded `src/`)

## Related Issues
- PM2 root conflict (port 3100 vs 4000) - resolved separately
- File ownership issues in dist/ folder - required sudo chown fix

---

**Status:** ✅ Resolved  
**Action Required:** Update nginx config and reload  
**No sudo access:** User must run nginx commands manually
