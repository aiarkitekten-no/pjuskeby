# Pjuskeby System Reference - Critical Knowledge Base
**Date Created:** October 23, 2025  
**Purpose:** Comprehensive reference to prevent future errors and misunderstandings

---

## 🗂️ File Structure & Locations

### Source Code Structure
```
/var/www/vhosts/pjuskeby.org/
├── src/                          # Main source (Astro SSR)
│   ├── content/
│   │   └── stories/              # ✅ CORRECT: Story MDX files location
│   ├── pages/
│   │   └── historier/
│   │       └── index.astro       # Story list page
│   └── ...
├── .server-src/                  # TypeScript server code
│   ├── routes/
│   │   └── stories.ts            # Story creation API
│   └── utils/
│       ├── entity-extraction.ts   # Entity mention extraction
│       └── mdx-image-injection.ts # Image path injection
├── server/                       # ✅ Compiled JavaScript from .server-src/
│   ├── routes/
│   │   └── stories.js            # ⚠️ Must recompile after .server-src changes
│   └── utils/
│       ├── entity-extraction.js
│       └── mdx-image-injection.js
├── public/                       # Static assets (copied to dist during build)
│   └── assets/
│       └── agatha/
│           ├── story/            # ✅ Story images go here first
│           ├── people/           # Person images
│           └── places/           # Place images
├── dist/                         # ⚠️ Build output (often owned by root)
│   ├── client/                   # Static assets for serving
│   │   └── assets/
│   │       └── agatha/
│   │           └── story/        # ✅ Images must be copied here if generated AFTER build
│   └── server/                   # SSR server code
├── httpdocs/                     # ✅ PM2 serves from here
│   ├── assets/                   # Rsync'd from dist/client/assets/
│   │   └── agatha/
│   │       └── story/            # ✅ Final image location for web serving
│   └── src/                      # ❌ WRONG: Stories are NOT here
└── scripts/
    ├── generate-story.ts          # AI story generation
    ├── generate-story-images.mjs  # Runware image generation
    ├── copy-story-images.sh       # Copy images to public/
    └── generate-complete-story.sh # ✅ Master automation script
```

### Critical Path Corrections
- **Stories:** `/var/www/vhosts/pjuskeby.org/src/content/stories/` (NOT `httpdocs/src/content/stories/`)
- **Compiled Server Code:** `server/` directory (NOT `.server-src/` in production)
- **Image Serving:** `httpdocs/assets/agatha/story/` (PM2 serves from httpdocs)
- **Image Source:** `public/assets/agatha/story/` → `dist/client/assets/agatha/story/` → `httpdocs/assets/agatha/story/`

---

## 🖼️ Image Workflow & Paths

### Complete Image Pipeline
```
1. Runware API generates images
   ↓
2. Download to /tmp/${SLUG}-featured.png (+ inner.png, outro.png)
   ↓
3. Copy to public/assets/agatha/story/
   ↓
4a. npm run build → copies to dist/client/assets/agatha/story/
   OR
4b. Manual copy if images generated AFTER build
   ↓
5. rsync dist/client/ → httpdocs/
   ↓
6. PM2 serves from httpdocs/assets/agatha/story/
```

### Image Path References in Code
- **Featured images:** `/assets/agatha/story/${slug}-featured.png`
- **Person images:** `/assets/agatha/people/${personSlug}.png`
- **Place images:** `/assets/agatha/places/${placeSlug}.png`
- **❌ NEVER USE:** `/images/` (old incorrect path)

### Image Path Fixes Applied
**File:** `.server-src/utils/mdx-image-injection.ts` (lines 119-138)
```typescript
// CORRECT:
personPath = `/assets/agatha/people/${personSlug}.png`
placePath = `/assets/agatha/places/${placeSlug}.png`

// WRONG (old):
personPath = `/images/people/${personSlug}.png`
```

---

## 🔐 Permissions & Ownership

### Critical Permission Rules
1. **Agent has NO sudo access** - Always request user help for sudo operations
2. **Correct ownership:** `pjuskebysverden:psacln`
3. **dist/ directory often owned by root** - Causes build failures if not chowned
4. **/tmp/ can have permission issues** - May need `sudo chmod 1777 /tmp`
5. **Generated images need ownership fix** after copying

### Required Permission Fixes
```sh
# Before build (if dist owned by root):
sudo chown -R pjuskebysverden:psacln /var/www/vhosts/pjuskeby.org/dist/

# After copying images to dist/client/assets:
sudo chown -R pjuskebysverden:psacln /var/www/vhosts/pjuskeby.org/dist/client/assets/agatha/story/

# Fix /tmp if needed:
sudo chmod 1777 /tmp
```

### Common Permission Errors
- **EACCES: permission denied, open '/tmp/...'** → /tmp permissions issue
- **EACCES during npm run build** → dist/ owned by root
- **404 on images** → Images not copied to dist/client/assets/ or ownership wrong

---

## 🗄️ Database Access

### Credentials
- **User:** `Terje_Pjusken`
- **Password:** `Klokken!12!?!`
- **Database:** `pjuskeby`

### Known Issues
- User `Terje_Pjusken` has access denied issues for database `pjuskeby`
- Use MDX file reads as fallback when DB access fails

### Key Tables
- **stories:** slug, title, type, content, status, publishedAt, metadata (JSON)
- **entity_mentions:** Links stories to people/places/businesses
- **workflow_log:** Story workflow state tracking

---

## 🚀 Deployment & PM2

### PM2 Configuration
- **Process Name:** `pjuskeby-web` (id 2)
- **Port:** 3100
- **Status Command:** `pm2 list`
- **Correct Restart:** `pm2 restart pjuskeby-web`
- **❌ WRONG:** `pjuskeby-api` (this is errored, id 3)

### PM2 Restart Behavior
- **Warning appears even when successful:** `[PM2][ERROR] Process or Namespace pjuskeby-web not found`
- **Must verify with:** `pm2 list | grep "pjuskeby-web.*online"`
- **Must verify server responds:** `curl -sf https://pjuskeby.org/historier`
- **Wait time needed:** 5 seconds for server to stabilize

### Deployment Workflow
```sh
1. npm run build                           # Creates dist/client + dist/server
2. rsync -a dist/client/ httpdocs/         # Copies to PM2 serving directory
3. pm2 restart pjuskeby-web                # Restarts Node.js server
4. Verify: curl https://pjuskeby.org/historier
```

### Rsync vs CP
- **✅ Use rsync -a:** Handles symlinks correctly, preserves permissions
- **❌ Don't use cp -r:** Can break symlinks
- **Correct command:** `rsync -a --delete-after dist/client/ httpdocs/`

---

## 🔧 Astro Build System

### Astro Cache Issues
- **Problem:** New stories not detected after adding to `src/content/stories/`
- **Solution:** Clear `.astro/` cache before build
- **Command:** `rm -rf .astro`
- **When needed:** Every build in automation scripts

### Build Process
```sh
# Correct build sequence:
rm -rf .astro                    # Clear cache
npm run build                    # Build Astro SSR
# Images copied AFTER build need manual copy to dist/client/assets/
```

### SSR vs Static
- **Mode:** SSR (Server-Side Rendering) with @astrojs/node adapter
- **Content Collections:** Used for stories in `src/content/stories/`
- **Dynamic Routes:** `/historier/[slug]` generated from content collection
- **Static Assets:** Copied from `public/` to `dist/client/` during build

---

## 🇳🇴 Norwegian Language Handling

### Character Normalization
**File:** `.server-src/utils/entity-extraction.ts`

```typescript
function normalizeNorwegian(str: string): string {
  return str.toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'aa');
}
```

### Fuzzy Matching
- **Threshold:** 70% similarity required
- **Use case:** Matching "Pjuskeby" vs "pjuskeby" in text
- **Algorithm:** Levenshtein distance-based

```typescript
function fuzzyIndexOf(text: string, search: string, threshold = 0.7): number {
  const normalizedText = normalizeNorwegian(text);
  const normalizedSearch = normalizeNorwegian(search);
  // ... fuzzy matching logic
}
```

### YAML Frontmatter Issues
- **Problem:** Multi-line strings with newlines break YAML parsing
- **Solution:** Clean summary field before writing to MDX

```typescript
const cleanSummary = story.summary
  .replace(/\n/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
```

---

## 📝 Story Workflow & Auto-Publishing

### Workflow States
1. **draft** - Initial creation, not visible
2. **review** - Awaiting human review
3. **approved** - Approved but not published
4. **published** - Live on website

### Auto-Publish Logic
**File:** `.server-src/routes/stories.ts` (lines 117-138)

```typescript
const shouldAutoPublish = confidence.overall >= 0.70;

await db.query(
  `INSERT INTO stories (..., status, publishedAt) VALUES (?, ?, ?, ?, ?, ?)`,
  [
    // ...
    shouldAutoPublish ? 'published' : 'draft',
    shouldAutoPublish ? new Date() : null
  ]
);
```

**Rule:** Stories with confidence ≥ 0.70 bypass workflow and auto-publish

### Rate Limiting
- **Maximum:** 1 story per 2 days
- **Enforced in:** `scripts/generate-story.ts`

---

## 🔗 Entity Mentions

### Entity Types
1. **People (personer)** - Links to `/personer/[slug]`
2. **Places (steder)** - Links to `/steder/[slug]`
3. **Businesses (bedrifter)** - Links to `/bedrifter/[slug]`

### Business Type Normalization
**Problem:** AI generated inconsistent types: "business", "organization", "shop"  
**Solution:** Normalize all to "business"

```typescript
// In entity-extraction.ts:
if (entity.type === 'organization' || entity.type === 'shop') {
  entity.type = 'business';
}
```

### Entity Extraction Flow
1. AI generates story with entity references
2. `entity-extraction.ts` parses content for mentions
3. Fuzzy matching finds entities in text (handles Norwegian chars)
4. `mdx-image-injection.ts` injects image references
5. Links created in rendered HTML

---

## 🤖 Master Automation Script

### generate-complete-story.sh Workflow

```bash
# Step 1: Generate story with AI
node scripts/generate-story.ts "$STORY_TYPE"

# Step 2: Generate images with Runware
node scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY"

# Step 3: Copy images to public
./scripts/copy-story-images.sh "$SLUG"

# Step 4: Clear cache and build
rm -rf .astro
npm run build

# Step 4.5: Copy images to dist (if generated after build)
cp public/assets/agatha/story/${SLUG}-*.png dist/client/assets/agatha/story/

# Step 5: Deploy to httpdocs
rsync -a --delete-after dist/client/ httpdocs/

# Step 6: Restart PM2 with verification
pm2 restart pjuskeby-web
if pm2 list | grep -q "pjuskeby-web.*online"; then
  echo "✓ Server is online"
else
  echo "❌ Server not running!"
  exit 1
fi

# Wait for server to stabilize
sleep 5

# Step 7: Verify server responds
if curl -sf https://pjuskeby.org/historier >/dev/null 2>&1; then
  echo "✓ Server is responding"
else
  echo "⚠️ Server may not be fully ready yet"
fi
```

### Critical Script Improvements
1. **Astro cache clearing** - Ensures new stories detected
2. **Image copying to dist** - Handles post-build image generation
3. **PM2 verification** - Confirms restart succeeded
4. **HTTP verification** - Tests actual server response
5. **Error handling** - Exits on critical failures

---

## ✅ Verification & Testing

### HTTP Response Verification
**✅ CORRECT:** Check actual HTTP responses
```sh
curl -sI https://pjuskeby.org/assets/agatha/story/2025-10-23-agatha-diary-kvqcd-featured.png
# Look for: HTTP/2 200
```

**❌ WRONG:** Check static file existence
```sh
ls httpdocs/historier/${SLUG}/index.html  # Doesn't exist with SSR!
```

### Story Visibility Verification
```sh
# Check if story appears on /historier page:
curl -s https://pjuskeby.org/historier | grep -q "/historier/${SLUG}"

# Check if story page loads:
curl -sf https://pjuskeby.org/historier/${SLUG}
```

### Image 404 Detection
```sh
# Find all story images referenced in content:
grep -r "assets/agatha/story" src/content/stories/ | \
  sed 's/.*\(\/assets\/agatha\/story\/[^"]*\.png\).*/\1/' | \
  sort -u | \
  while read path; do
    url="https://pjuskeby.org${path}"
    code=$(curl -sI "$url" | head -n1 | cut -d' ' -f2)
    if [ "$code" != "200" ]; then
      echo "❌ $code: $url"
    fi
  done
```

---

## 🎯 Story Sorting

### Problem
Stories created on same day sorted alphabetically by slug, not by creation time.

### Solution
**File:** `src/pages/historier/index.astro` (lines 9-16)

```typescript
const sortedStories = allStories.sort((a, b) => {
  const dateCompare = new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
  if (dateCompare !== 0) {
    return dateCompare;
  }
  // Secondary sort by slug (contains timestamp)
  return b.slug.localeCompare(a.slug);
});
```

**Why slug works:** Slugs contain timestamp: `2025-10-23-agatha-diary-kvqcd`  
Later in day = higher alphabetical slug = shows first

---

## 🚨 Common Errors & Solutions

### Error 1: Stories Not Visible on /historier
**Symptoms:** Story created, exists in DB, but not on website  
**Causes:**
1. Status = 'draft' instead of 'published'
2. Astro cache not cleared
3. Build not run after story creation
4. publishedAt = null

**Solutions:**
1. Set auto-publish at confidence ≥ 0.70
2. Clear .astro cache before build
3. Run npm run build
4. Set publishedAt timestamp

---

### Error 2: Images Show as Broken (404)
**Symptoms:** Image tags in HTML, but 404 on image URLs  
**Causes:**
1. Images in `public/` but not copied to `dist/client/assets/`
2. Images generated after build
3. Wrong image paths in code (/images/ instead of /assets/)
4. Images not rsync'd to httpdocs
5. Permission issues preventing file access

**Solutions:**
1. Copy images to dist/client/assets/agatha/story/ manually if generated after build
2. Use correct paths: /assets/agatha/story/
3. rsync dist/client/ to httpdocs/
4. Fix ownership: sudo chown pjuskebysverden:psacln

---

### Error 3: Entity Mentions Not Working
**Symptoms:** Places/people mentioned but no links created  
**Causes:**
1. Norwegian character mismatch (Pjuskeby vs pjuskeby)
2. Exact string matching fails
3. Case sensitivity issues

**Solutions:**
1. Use normalizeNorwegian() function
2. Use fuzzyIndexOf() with 70% threshold
3. Lowercase comparison

---

### Error 4: PM2 Restart Fails
**Symptoms:** PM2 restart shows error but process is online  
**Reality:** PM2 warning messages don't always mean failure

**Solutions:**
1. Check `pm2 list` output for "online" status
2. Verify server responds: curl https://pjuskeby.org/historier
3. Wait 5 seconds after restart before verification
4. Use `pm2 restart pjuskeby-web` (NOT pjuskeby-api)

---

### Error 5: YAML Parsing Errors in MDX
**Symptoms:** Story generation fails with YAML syntax error  
**Cause:** Multi-line summary with newlines in frontmatter

**Solution:**
```typescript
const cleanSummary = story.summary
  .replace(/\n/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
```

---

### Error 6: Permission Denied in /tmp
**Symptoms:** `EACCES: permission denied, open '/tmp/...'`  
**Cause:** /tmp directory permissions too restrictive

**Solutions:**
1. Fix /tmp permissions: `sudo chmod 1777 /tmp`
2. Run image generation with sudo: `sudo node scripts/generate-story-images.mjs`

---

## 📊 Success Metrics

### Verified Working Features (as of Oct 23, 2025)
- ✅ Story 2025-10-23-agatha-diary-kvqcd visible on https://pjuskeby.org/historier
- ✅ Featured image loading: HTTP/2 200
- ✅ Entity mentions working:
  - Nigel Noodlefork → /personer/nigel-noodlefork
  - Reginald Plonksnort → /personer/reginald-plonksnort
  - Giggle Hillock → /steder/giggle-hillock
- ✅ Auto-publish at confidence ≥ 0.70
- ✅ Norwegian fuzzy matching
- ✅ Same-day story sorting
- ✅ PM2 restart verification
- ✅ Bulk image deployment (33 images with HTTP 200)

---

## 🔮 Future Improvements

### Suggested Enhancements
1. **Pre-flight image check** - Verify all 3 images exist before build
2. **Automatic missing image detection** - Script to find and regenerate missing images
3. **Database permission fix** - Grant Terje_Pjusken proper access to pjuskeby DB
4. **Build permission automation** - Auto-chown dist/ before build in script
5. **Image generation retry logic** - Handle Runware API failures gracefully
6. **Story backup system** - Backup MDX files and images periodically

---

## 🎓 Key Lessons Learned

### Critical Principles
1. **Never assume file locations** - Always verify with find or ls
2. **Never trust file existence for SSR** - Use HTTP checks
3. **Never skip cache clearing** - Astro won't detect new content
4. **Never forget permission fixes** - Root ownership breaks everything
5. **Never trust PM2 error messages** - Check pm2 list output
6. **Always use rsync for deployment** - Not cp -r
7. **Always verify with curl** - HTTP responses don't lie
8. **Always normalize Norwegian text** - æ/ø/å cause matching failures
9. **Always clean YAML strings** - Newlines break frontmatter
10. **Always request sudo help** - Agent has no sudo access

### Evidence-Based Development
- User demanded: "Du kan simpelthen ikke fortsette å bløffe"
- Lesson: Always verify with actual commands before claiming success
- Method: Run curl, check HTTP codes, verify with real data
- Result: Trust built through evidence, not assumptions

---

**Document Maintenance:**  
Update this document whenever new critical learnings emerge from debugging sessions.

**Last Updated:** October 23, 2025

---

## 🎭 Entity Profile Enhancement (Added Oct 25, 2025)

### Boris Blundercheek Case Study

**Task:** Create extended profile with biography and AI portrait for Boris Blundercheek  
**Challenges Encountered:**

1. **Extended JSON Corruption**
   - **Problem:** `create_file` tool generated malformed JSON (each line duplicated, started with `{{`)
   - **Symptom:** `jq` parse errors, biography not loading
   - **Solution:** Use `cat > /tmp/file.json` with heredoc, validate with `jq '.'`
   - **Lesson:** Never trust file creation tools for JSON - always validate after creation

2. **Image 404 Mystery**
   - **Problem:** Image copied to `httpdocs/assets/agatha/person/boris-blundercheek.png` but returned HTTP 404
   - **Wrong Assumptions Tried:**
     - File permissions (they were correct: `pjuskebysverden:psacln`)
     - File size (4.1MB vs others 1.7MB - not the issue)
     - PM2 restart needed (tried, didn't help initially)
     - Cache issue (not the problem)
   - **Root Cause:** Image was added AFTER `npm run build`, so it didn't exist in `dist/client/assets/`
   - **Astro SSR Architecture:** Static assets served from `dist/client/`, not from `httpdocs/` directly
   - **Solution:**
     ```bash
     cp image.png public/assets/agatha/person/
     cp image.png dist/client/assets/agatha/person/  # CRITICAL STEP
     rsync -a dist/client/assets/ httpdocs/assets/
     pm2 restart pjuskeby-web
     ```
   - **Verification:** `curl -sI https://pjuskeby.org/assets/agatha/person/boris-blundercheek.png` → HTTP/2 200

### Critical Paths Discovered

```
Extended Profiles:
  Location: content/data/{slug}-extended.json
  Read by: Astro SSR at runtime from process.cwd()/content/data/
  PM2 CWD: /var/www/vhosts/pjuskeby.org

Images:
  1. Source: public/assets/agatha/{type}/{slug}.png
  2. Build output: dist/client/assets/agatha/{type}/{slug}.png  ← CRITICAL
  3. Deployment: httpdocs/assets/agatha/{type}/{slug}.png
  4. Web URL: https://pjuskeby.org/assets/agatha/{type}/{slug}.png

Image 404 if missing from dist/client/!
```

### Complete Workflow

See **AI-learned/peoplemaker.json** for full documentation.

**Quick Reference:**
1. Create extended JSON in `content/data/{slug}-extended.json` (use heredoc, validate with `jq`)
2. Generate AI portrait with Runware API
3. Deploy image to ALL THREE locations: `public/`, `dist/client/`, `httpdocs/`
4. Restart PM2: `pm2 restart pjuskeby-web`
5. Verify: Biography shows + Image returns HTTP 200

**Biography Standards:**
- Word count: 800-1200 words (reference: Milly Wiggleflap = 971 words)
- Structure: Multiple `**Section Headers**`, bullet lists, narrative paragraphs
- Tone: Whimsical, absurd, deeply observant (match existing personas)

**Image Requirements:**
- Size: 1024x1024 PNG
- Style: Vintage hand-tinted photograph aesthetic
- Elements: Agatha Splint signature, Stickman character, Nordic light
- Model: `runware:100@1` (SDXL Base)

---

**Last Updated:** October 25, 2025 (Added Entity Profile Enhancement system)
