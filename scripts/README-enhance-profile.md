# Profile Enhancement Tool

**Version:** 2.0  
**Created:** October 25, 2025  
**Status:** ✅ Production Ready

## Quick Start

```bash
# As root:
sudo scripts/fix.sh https://pjuskeby.org/personer/boris-blundercheek
```

## What It Does

Automatically enhances Pjuskeby entity profiles with:

1. **Extended Biography** (800-1200 words, Agatha Splint style)
2. **AI-Generated Portrait** (1024x1024, vintage hand-tinted aesthetic)
3. **Complete Deployment** to all required locations
4. **Verification** that everything works

## Critical Steps

The script handles the **complete deployment chain**:

```
Extended Profile:
  → content/data/{slug}-extended.json

Portrait Image:
  → public/assets/agatha/{type}/{slug}.png        (source)
  → dist/client/assets/agatha/{type}/{slug}.png   ← CRITICAL! (Astro SSR)
  → httpdocs/assets/agatha/{type}/{slug}.png      (web serving)
```

**Why dist/client/ is critical:** Images added after `npm run build` won't be in `dist/client/`, causing HTTP 404 errors. This was the root cause of the Boris Blundercheek image issue.

## Usage

### Preview (Dry Run)

```bash
sudo scripts/fix.sh https://pjuskeby.org/personer/nigel-noodlefork --dry-run
```

Shows exactly what would be done without making changes.

### Execute

```bash
sudo scripts/fix.sh https://pjuskeby.org/personer/nigel-noodlefork
```

**Important:** Script requires manual intervention for Step 4 (biography generation). You must create the extended JSON file at `/tmp/{slug}-extended.json` before pressing Enter.

## Biography Requirements

See `content/data/milly-wiggleflap-extended.json` for reference.

**Structure:**
```json
{
  "id": "<uuid>",
  "slug": "<slug>",
  "name": "<Full Name>",
  "age": <number>,
  "birthdate": "YYYY-MM-DD",
  "occupation": "<job title>",
  "workplace": {
    "name": "<Business Name>",
    "slug": "<business-slug>",
    "role": "<Detailed Title>"
  },
  "address": {
    "street": "<Street Name>",
    "number": "<17B>",
    "full": "<Full Address, Pjuskeby>"
  },
  "favorites": {
    "places": []
  },
  "traits": ["hobby1", "hobby2", "hobby3"],
  "bio_short": "<One sentence, 80-120 words>",
  "bio_full": "<Biography with \\n\\n sections and **Headers**>",
  "personality": {
    "traits": ["trait1", "trait2"]
  }
}
```

**bio_full Format:**
- 800-1200 words (Milly: 971 words)
- Sections separated by `\n\n`
- Headers as `**Header Text**` (renders as `<strong>`)
- Bullet lists starting with `- `
- Tone: Whimsical, absurd, deeply observant

**Typical Sections:**
1. **The Workplace** - Introduction
2. **The Theory/Hobby** - Their passion
3. **The Collection** - What they collect
4. **Daily Ritual** - Strange routine
5. **What [Name] Loves** - Bullet list
6. **What [Name] Hates** - Bullet list  
7. **Relationships & Daily Life** - Pjuskeby interactions

## Verification

After running, verify:

1. **Biography visible:** https://pjuskeby.org/{type}/{slug}  
   Check for "The Full Story of {Name}" section

2. **Image accessible:**  
   ```bash
   curl -sI https://pjuskeby.org/assets/agatha/{type}/{slug}.png | head -1
   # Should return: HTTP/2 200
   ```

3. **Files in all locations:**
   ```bash
   ls -lh content/data/{slug}-extended.json
   ls -lh public/assets/agatha/{type}/{slug}.png
   ls -lh dist/client/assets/agatha/{type}/{slug}.png     # CRITICAL
   ls -lh httpdocs/assets/agatha/{type}/{slug}.png
   ```

## Troubleshooting

### Biography Not Showing

**Symptoms:** Page loads but no "The Full Story" section

**Fixes:**
1. Check file exists: `ls content/data/{slug}-extended.json`
2. Validate JSON: `jq '.' content/data/{slug}-extended.json`
3. Check bio_full: `jq -r '.bio_full' content/data/{slug}-extended.json | wc -w`
4. Restart PM2: `pm2 restart pjuskeby-web`

### Image Returns 404

**Symptoms:** Image exists in httpdocs/ but returns HTTP 404

**Root Cause:** Image not in `dist/client/assets/`

**Fix:**
```bash
cp public/assets/agatha/{type}/{slug}.png dist/client/assets/agatha/{type}/{slug}.png
chown pjuskebysverden:psacln dist/client/assets/agatha/{type}/{slug}.png
rsync -a dist/client/assets/agatha/{type}/{slug}.png httpdocs/assets/agatha/{type}/
pm2 restart pjuskeby-web
```

### JSON Parse Error

**Symptoms:** `jq: parse error: Expected separator between values`

**Cause:** Corrupted JSON (often from automated tools duplicating content)

**Fix:** Recreate file manually:
```bash
cat > /tmp/{slug}-extended.json << 'EOF'
{
  "id": "...",
  ...
}
EOF

# Validate
jq '.' /tmp/{slug}-extended.json
```

## Documentation

- **Complete Guide:** `AI-learned/peoplemaker.json`
- **System Reference:** `AI-learned/pjuskeby-system-reference.md`
- **Case Study:** Boris Blundercheek enhancement (Oct 25, 2025)

## Examples

### Boris Blundercheek (Success Case)

**URL:** https://pjuskeby.org/personer/boris-blundercheek

**Results:**
- ✅ Biography: 513 words (below target, but working)
- ✅ Portrait: 4.1MB PNG, HTTP 200
- ✅ Deployed to all 4 locations
- ✅ PM2 restarted successfully

**Challenges Solved:**
1. Corrupted extended.json (duplicated lines) → Recreated with heredoc
2. Image 404 despite file existing → Added to dist/client/

**Learnings:**
- Never skip `dist/client/` deployment
- Always validate JSON with `jq`
- Biography target: 800-1200 words (Milly standard)

## Future Improvements

- [ ] Automated biography generation with AI (currently manual)
- [ ] Support for bedrifter/steder/gater entity types
- [ ] Automatic word count expansion if below 800
- [ ] Pre-flight checks for all dependencies
- [ ] Rollback capability on errors

---

**Maintained by:** Pjuskeby Development Team  
**Last Updated:** October 25, 2025
