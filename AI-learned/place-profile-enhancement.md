# Place Profile Enhancement - Lessons Learned
**Date:** 2025-10-25  
**Entity:** Makeout Mountain (place)  
**Issue:** Extended profiles not rendering for places/businesses/streets

## Problem Summary

After successfully implementing automated profile enhancement for **persons** (Boris Blundercheek), the system failed completely for **places** (Makeout Mountain). The script would run Steps 1-4, then silently die without deploying files or showing on the website.

## Root Causes Discovered

### 1. **Missing Extended JSON Support in Page Templates**

**Problem:**
- `/src/pages/personer/[slug].astro` had extended JSON loading logic
- `/src/pages/steder/[slug].astro` did NOT - it only read `places.normalized.json`

**Evidence:**
```astro
// BEFORE (steder/[slug].astro)
const placesPath = path.join(process.cwd(), 'content/data/places.normalized.json');
const places = JSON.parse(fs.readFileSync(placesPath, 'utf-8'));
const place = places.find((p: any) => p.slug === slug);
// No extended JSON loading!
```

**Fix:**
```astro
// AFTER - matches personer/[slug].astro pattern
const placesData = JSON.parse(
  await readFile(join(process.cwd(), 'content/data/places.normalized.json'), 'utf-8')
);
const place = placesData.find((p: any) => p.slug === slug);

// Try to load extended data if it exists
let extendedData: any = {};
try {
  const extendedPath = join(process.cwd(), `content/data/${slug}-extended.json`);
  if (existsSync(extendedPath)) {
    extendedData = JSON.parse(await readFile(extendedPath, 'utf-8'));
  }
} catch (e) {}

const fullPlace = { ...place, ...extendedData };
```

### 2. **Silent Script Death from grep Failure**

**Problem:**
Script had `set -euo pipefail` which exits on ANY error. When generating place biographies, the script tried to extract GENDER (which only exists for persons):

```bash
# This line KILLED the script for places:
GENDER=$(echo "$BIO_OUTPUT" | grep "^GENDER=" | cut -d'=' -f2)
```

When `grep` couldn't find "GENDER=" in place output, it returned exit code 1, triggering `set -e` to abort the entire script.

**Evidence from bash -x:**
```
++ grep '^GENDER='
++ cut -d= -f2
+ GENDER=
root@hotell /var/www/vhosts/pjuskeby.org #   # Script dead here
```

**Fix:**
```bash
# Allow grep to fail without killing script
GENDER=$(echo "$BIO_OUTPUT" | grep "^GENDER=" | cut -d'=' -f2 || echo "")
if [ -n "$GENDER" ]; then
    log "Detected gender: $GENDER"
fi
```

### 3. **JQ Command Failure on Null Fields**

**Problem:**
When reading portrait traits for non-person entities, the script tried:

```bash
PORTRAIT_TRAITS=$(jq -r '.features | join(", ") // .description // "whimsical Norwegian location"' "$TEMP_EXTENDED")
```

But `.features` was `null` in the JSON, and `join()` cannot iterate over null.

**Error:**
```
jq: error: Cannot iterate over null (null)
```

**Fix:**
```bash
# Safely handle null arrays and fallback to description fields
PORTRAIT_TRAITS=$(jq -r 'if (.characteristics // []) | length > 0 then (.characteristics | join(", ")) elif (.features // []) | length > 0 then (.features | join(", ")) else (.description_short // .description // "whimsical Norwegian location") end' "$TEMP_EXTENDED")
```

### 4. **Wrong Field Names for Places**

**Problem:**
- Persons use: `bio_full`, `bio_short`, `traits[]`
- Places use: `description_full`, `description_short`, `characteristics[]`

Script tried to validate using `bio_full` for ALL entity types:

```bash
# This returned 1 word for places (just "null"):
BIO_WORD_COUNT=$(jq -r '.bio_full' "$TEMP_EXTENDED" | wc -w | xargs)
```

**Fix:**
```bash
# Use type-specific field names
if [ "$ENTITY_TYPE" = "person" ]; then
    BIO_WORD_COUNT=$(jq -r '.bio_full' "$TEMP_EXTENDED" | wc -w | xargs)
else
    BIO_WORD_COUNT=$(jq -r '.description_full' "$TEMP_EXTENDED" | wc -w | xargs)
fi
```

### 5. **Missing Astro Rebuild**

**Problem:**
Even after fixing all scripts, changes to `/src/pages/steder/[slug].astro` weren't visible because Astro compiles `.astro` files to JavaScript during build.

**Solution Required:**
```bash
npm run build
pm2 restart pjuskeby-web
```

## Field Name Mapping by Entity Type

| Entity Type | Description Field | Biography Field | Features Field | Gender Field |
|-------------|------------------|-----------------|----------------|--------------|
| **person** | `bio_short` | `bio_full` | `traits[]` | `gender` ✅ |
| **place** | `description_short` | `description_full` | `characteristics[]` | ❌ |
| **business** | `description_short` | `description_full` | `features[]` | ❌ |
| **street** | `description_short` | `description_full` | `characteristics[]` | ❌ |

## Page Template Status

| Template | Extended JSON Support | Image Support | Full Description | Notes |
|----------|----------------------|---------------|------------------|-------|
| `/src/pages/personer/[slug].astro` | ✅ | ✅ | ✅ `bio_full` | **WORKING** |
| `/src/pages/steder/[slug].astro` | ✅ (fixed) | ✅ (fixed) | ✅ `description_full` | **FIXED 2025-10-25** |
| `/src/pages/bedrifter/[slug].astro` | ❌ TODO | ❌ TODO | ❌ TODO | **NEEDS SAME FIX** |
| `/src/pages/gater/[slug].astro` | ❌ TODO | ❌ TODO | ❌ TODO | **NEEDS SAME FIX** |

## Script Robustness Improvements

### Enhanced Error Handling

**Before:**
- Script would die silently on any error
- No output when commands failed
- Hard to debug

**After:**
```bash
# Allow grep to fail gracefully
GENDER=$(... || echo "")

# Safe jq with null handling
PORTRAIT_TRAITS=$(jq -r 'if (.characteristics // []) | length > 0 then ...' "$TEMP_EXTENDED")

# Type-aware field reading
if [ "$ENTITY_TYPE" = "person" ]; then
    BIO_WORD_COUNT=$(jq -r '.bio_full' "$TEMP_EXTENDED" | wc -w)
else
    BIO_WORD_COUNT=$(jq -r '.description_full' "$TEMP_EXTENDED" | wc -w)
fi
```

## Testing Strategy That Worked

### 1. **Don't Trust Output Alone**
When script appeared to complete but webpage unchanged:
- Check if files were actually deployed: `ls -la /tmp/{slug}*`
- Check if extended JSON exists: `cat /tmp/{slug}-extended.json`
- Verify JSON structure: `jq keys /tmp/{slug}-extended.json`

### 2. **Use bash -x for Silent Failures**
```bash
bash -x scripts/enhance-profile-v2.sh https://... 2>&1 | tail -50
```

This revealed the exact line where script died (grep failure).

### 3. **Test Each jq Command Independently**
```bash
jq -r '.bio_full' /tmp/makeout-mountain-extended.json
# Output: null  ← Wrong field!

jq -r '.description_full' /tmp/makeout-mountain-extended.json | wc -w
# Output: 878  ← Correct!
```

### 4. **Verify PM2 Process Name**
Don't assume - check:
```bash
pm2 list
# Shows actual name: pjuskeby-web (id 2)
```

## Deployment Checklist for New Entity Types

When adding profile enhancement for a new entity type:

1. ✅ **Update `generate-biography.mjs`** with type-specific prompts
2. ✅ **Update `generate-portrait.mjs`** with type-specific image styles
3. ✅ **Update `enhance-profile-v2.sh`** with type-aware field reading
4. ✅ **Update page template** (`/src/pages/{type}/[slug].astro`) to load extended JSON
5. ✅ **Add type-specific sections** to template (description_full, characteristics, etc.)
6. ✅ **Run `npm run build`** to compile Astro changes
7. ✅ **Restart PM2** to load new build
8. ✅ **Test with real entity** before assuming it works

## Success Metrics

**Makeout Mountain Test Results:**
- ✅ Biography: 878 words (target: 800-1200)
- ✅ Image: 4.1MB landscape (not portrait)
- ✅ Extended JSON: Deployed to `content/data/makeout-mountain-extended.json`
- ✅ Image deployed to all 3 locations (public/, dist/client/, httpdocs/)
- ✅ Webpage renders: Image visible, full description shown
- ✅ PM2 restarted: Process id 2, restart count 56

## Key Takeaways

1. **Never assume field names are consistent** across entity types
2. **Always handle null/missing fields** in jq commands
3. **Grep failures kill scripts** with `set -e` - use `|| echo ""` for optional matches
4. **Astro needs rebuilding** when `.astro` files change
5. **Test each entity type** - don't assume it works for all because one works
6. **bash -x is invaluable** for finding silent script deaths
7. **Check deployed files** don't just trust script output

## Files Modified

- ✅ `/src/pages/steder/[slug].astro` - Added extended JSON loading
- ✅ `/scripts/enhance-profile-v2.sh` - Fixed grep, jq, and field name issues
- ✅ `/scripts/generate-biography.mjs` - Already had place support
- ✅ `/scripts/generate-portrait.mjs` - Already had place support

## Next Steps

1. Apply same fixes to `/src/pages/bedrifter/[slug].astro`
2. Apply same fixes to `/src/pages/gater/[slug].astro`
3. Test each entity type with real data
4. Document field mappings in peoplemaker.json
