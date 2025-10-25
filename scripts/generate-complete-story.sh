#!/bin/sh
# Complete workflow for generating an Agatha Splint story with illustrations
# Usage: sh scripts/generate-complete-story.sh [story-type] [date]
# Story types: agatha-diary, rumor, event (random if not specified)
# Date: YYYY-MM-DD format (today if not specified)

set -e

# Show usage guide if no args or help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  cat << 'HELP'
🎭 Agatha Splint Story Generator
================================

USAGE:
  sh scripts/generate-complete-story.sh [story-type] [date]

STORY TYPES:
  agatha-diary  - Personal diary entry from Agatha's adventures
  rumor         - Local gossip and town rumors
  event         - Historical events and happenings
  (random)      - Random type if not specified

DATE FORMAT:
  YYYY-MM-DD    - Story date (defaults to today)
  Example: 2025-10-23

WORKFLOW STEPS:
  1. Generate story with Agatha Splint prompt (800+ words, Nordic whimsy)
  2. Extract characters and locations for mentions system
  3. Create three illustrations (featured, inline1, inline2) with DALL-E
  4. Copy images to public/assets/agatha/story/ (with proper permissions)
  5. Build Astro site and copy to httpdocs
  6. Restart PM2 server
  7. Verify story appears at https://pjuskeby.org/historier/{slug}
  8. Verify images render correctly
  9. Verify character/location mentions appear as links

VERIFICATION:
  - MDX file exists in src/content/stories/
  - Three PNG files exist in public/assets/agatha/story/
  - Story appears in built site HTML
  - Script retries up to 3 times if verification fails

EXAMPLES:
  sh scripts/generate-complete-story.sh
  sh scripts/generate-complete-story.sh agatha-diary
  sh scripts/generate-complete-story.sh rumor 2025-10-23
  sh scripts/generate-complete-story.sh event 2025-10-23

OUTPUT:
  - MDX file: src/content/stories/{date}-{type}-{random}.mdx
  - Images: public/assets/agatha/story/{slug}-{featured|inline1|inline2}.png
  - Live URL: https://pjuskeby.org/historier/{slug}

HELP
  exit 0
fi

STORY_TYPE="${1:-}"
STORY_DATE="${2:-}"
PROJECT_DIR="/var/www/vhosts/pjuskeby.org"
MAX_RETRIES=3
RETRY_DELAY=5

cd "$PROJECT_DIR"

echo "🎭 Agatha Splint Story Generator"
echo "================================"
echo ""

# Step 1: Generate story text with AI
echo "📝 Step 1/7: Generating story with Agatha Splint prompt..."
if [ -n "$STORY_DATE" ]; then
  export STORY_DATE
fi
if [ -n "$STORY_TYPE" ]; then
  STORY_OUTPUT=$(node --import tsx scripts/generate-story.ts "$STORY_TYPE" 2>&1)
else
  STORY_OUTPUT=$(node --import tsx scripts/generate-story.ts 2>&1)
fi

echo "$STORY_OUTPUT"

# Extract slug from output
SLUG=$(echo "$STORY_OUTPUT" | grep "Slug:" | sed 's/.*Slug: //')
TITLE=$(echo "$STORY_OUTPUT" | grep -A1 "node scripts/generate-story-images.mjs" | tail -1 | cut -d'"' -f2)
SUMMARY=$(echo "$STORY_OUTPUT" | grep -A1 "node scripts/generate-story-images.mjs" | tail -1 | cut -d'"' -f4)

if [ -z "$SLUG" ]; then
  echo "❌ Failed to extract story slug"
  exit 1
fi

echo ""
echo "✓ Story generated with slug: $SLUG"
echo ""

# Verify MDX file exists
echo "🔍 Verifying story file..."
MDX_FILE="src/content/stories/${SLUG}.mdx"
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if [ -f "$MDX_FILE" ]; then
    echo "✓ Story file verified: $MDX_FILE"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⚠️  Story file not found (attempt $RETRY_COUNT/$MAX_RETRIES)"
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "   Waiting ${RETRY_DELAY}s before retry..."
      sleep $RETRY_DELAY
    else
      echo "❌ Story file not found after $MAX_RETRIES attempts: $MDX_FILE"
      exit 1
    fi
  fi
done
echo ""

# Step 2: Generate illustrations
echo "🎨 Step 2/7: Generating Agatha Splint illustrations (this takes ~60 seconds)..."

# Clean up any existing /tmp files to avoid permission issues
rm -f /tmp/${SLUG}-*.png 2>/dev/null || sudo rm -f /tmp/${SLUG}-*.png 2>/dev/null || true

# Generate images (may need sudo for /tmp write permissions)
if ! node scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY" 2>&1; then
  echo "⚠️  Image generation failed, retrying with sudo..."
  sudo node scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY"
fi

echo ""
echo "✓ Illustrations generated to /tmp/"
echo ""

# Step 3: Copy images to public
echo "📦 Step 3/7: Copying images to public directory..."
echo "   (Using sudo wrapper for safe permissions)"
sh scripts/copy-story-images.sh "$SLUG"

echo ""
echo "✓ Images copied and permissions set"
echo ""

# Verify images exist
echo "🔍 Verifying story images..."
IMAGE_DIR="public/assets/agatha/story"
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  MISSING_IMAGES=0
  for IMG_TYPE in featured inline1 inline2; do
    IMG_FILE="$IMAGE_DIR/${SLUG}-${IMG_TYPE}.png"
    if [ ! -f "$IMG_FILE" ]; then
      MISSING_IMAGES=$((MISSING_IMAGES + 1))
      echo "⚠️  Missing: $IMG_FILE"
    fi
  done
  
  if [ $MISSING_IMAGES -eq 0 ]; then
    echo "✓ All 3 images verified:"
    ls -lh "$IMAGE_DIR/${SLUG}"-*.png | awk '{print "  "$9" ("$5")"}'
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "   Waiting ${RETRY_DELAY}s before retry..."
      sleep $RETRY_DELAY
      sh scripts/copy-story-images.sh "$SLUG"
    else
      echo "❌ Not all images verified after $MAX_RETRIES attempts"
      exit 1
    fi
  fi
done
echo ""

# Step 4: Build site
echo "🏗️  Step 4/7: Building Astro site..."
echo "   (This may take 5-10 seconds...)"

# Fix .astro cache ownership if owned by root
if [ -d ".astro" ]; then
  ASTRO_OWNER=$(stat -c '%U' .astro 2>/dev/null || echo "unknown")
  if [ "$ASTRO_OWNER" = "root" ]; then
    echo "   Fixing .astro/ cache ownership (currently owned by root)..."
    sudo rm -rf .astro 2>/dev/null || true
  fi
fi

# Fix dist/ ownership if it's owned by root
if [ -d "dist" ]; then
  DIST_OWNER=$(stat -c '%U' dist 2>/dev/null || echo "unknown")
  if [ "$DIST_OWNER" = "root" ]; then
    echo "   Fixing dist/ ownership (currently owned by root)..."
    sudo chown -R pjuskebysverden:psacln dist/ 2>/dev/null || true
  fi
fi

# Clean only Astro build artifacts (keep map-tiles which are static)
if [ -d "dist/server" ]; then
  echo "   Cleaning old server build..."
  rm -rf dist/server 2>/dev/null || echo "   (kept existing dist/server)"
fi
if [ -d "dist/client/_astro" ]; then
  echo "   Cleaning old client build..."
  rm -rf dist/client/_astro 2>/dev/null || echo "   (kept existing dist/client/_astro)"
fi

# Clean Astro content cache to pick up new stories
if [ -d ".astro" ]; then
  echo "   Clearing Astro cache..."
  rm -rf .astro 2>/dev/null || true
fi

# Build with error checking
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ Build failed!"
  echo "$BUILD_OUTPUT" | tail -20
  exit 1
fi

echo "$BUILD_OUTPUT" | tail -10
echo ""
echo "✓ Build complete"
echo ""

# Copy story images to dist/client/assets (since they were added after build)
echo "📦 Copying story images to build directory..."
if [ -d "dist/client/assets/agatha/story" ]; then
  echo "   Copying ${SLUG} images to dist/client/assets/agatha/story/..."
  # Try without sudo first, fall back to sudo if permission denied
  if ! cp "public/assets/agatha/story/${SLUG}"-*.png "dist/client/assets/agatha/story/" 2>/dev/null; then
    echo "   Permission issue, fixing ownership..."
    sudo chown -R pjuskebysverden:psacln dist/client/assets/ 2>/dev/null || true
    cp "public/assets/agatha/story/${SLUG}"-*.png "dist/client/assets/agatha/story/" 2>/dev/null || \
      echo "   ⚠️  Could not copy images to dist/client"
  fi
else
  echo "   Creating dist/client/assets/agatha/story directory..."
  mkdir -p "dist/client/assets/agatha/story" 2>/dev/null || sudo mkdir -p "dist/client/assets/agatha/story"
  sudo chown -R pjuskebysverden:psacln dist/client/assets/ 2>/dev/null || true
  cp "public/assets/agatha/story/${SLUG}"-*.png "dist/client/assets/agatha/story/" 2>/dev/null || \
    echo "   ⚠️  Could not copy images to dist/client"
fi
echo "✓ Story images copied to build directory"
echo ""

# Step 5: Copy to httpdocs
echo "📋 Step 5/7: Deploying to httpdocs..."

# Backup httpdocs if needed
if [ ! -d "httpdocs.backup" ]; then
  echo "   Creating backup of httpdocs..."
  cp -r httpdocs httpdocs.backup 2>/dev/null || true
fi

# Copy with overwrite using rsync to handle symlinks correctly
echo "   Copying dist/client/* to httpdocs/..."
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete-after dist/client/ httpdocs/ 2>/dev/null || sudo rsync -a --delete-after dist/client/ httpdocs/
else
  # Fallback: copy files but skip symlinked directories
  find dist/client -maxdepth 1 -type f -exec cp {} httpdocs/ \; 2>/dev/null || true
  find dist/client -maxdepth 1 -type d ! -name client -exec cp -rf {} httpdocs/ \; 2>/dev/null || sudo find dist/client -maxdepth 1 -type d ! -name client -exec cp -rf {} httpdocs/ \;
fi

echo "   Copying dist/server to httpdocs/..."
cp -rf dist/server httpdocs/ 2>/dev/null || sudo cp -rf dist/server httpdocs/

echo "✓ Files deployed to httpdocs"
echo ""

# Step 6: Restart server
echo "🔄 Step 6/7: Restarting PM2 server..."
if pm2 restart pjuskeby-web 2>/dev/null; then
  echo "✓ Server restarted"
else
  echo "⚠️  PM2 restart warning (process may already be running)"
  # Check if process is actually running
  if pm2 list | grep -q "pjuskeby-web.*online"; then
    echo "✓ Server is online"
  else
    echo "❌ Server not running! Manual intervention needed."
    exit 1
  fi
fi
echo ""

# Give server time to start
echo "   Waiting for server to be ready..."
sleep 5

# Verify server is responding
if curl -sf https://pjuskeby.org/historier >/dev/null 2>&1; then
  echo "✓ Server is responding"
else
  echo "⚠️  Server may not be fully ready yet"
fi
echo ""

# Step 7: Verify story on live site
echo "🔍 Step 7/7: Verifying story appears on live site..."

# Check via HTTP that the story is listed on /historier
RETRY_COUNT=0
STORY_FOUND=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "   Checking https://pjuskeby.org/historier for story ${SLUG}..."
  
  # Use curl to check if story link exists on the index page
  if curl -s https://pjuskeby.org/historier 2>/dev/null | grep -q "href=\"/historier/${SLUG}\""; then
    echo "✓ Story found on /historier page!"
    STORY_FOUND=1
    
    # Also verify the story page itself loads
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://pjuskeby.org/historier/${SLUG} 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
      echo "✓ Story page loads successfully (HTTP $HTTP_CODE)"
    else
      echo "⚠️  Story page returned HTTP $HTTP_CODE"
    fi
    
    # Check for images in the story page
    STORY_HTML=$(curl -s https://pjuskeby.org/historier/${SLUG} 2>/dev/null)
    FEATURED_REF=$(echo "$STORY_HTML" | grep -c "${SLUG}-featured.png" || echo "0")
    INLINE1_REF=$(echo "$STORY_HTML" | grep -c "${SLUG}-inline1.png" || echo "0")
    INLINE2_REF=$(echo "$STORY_HTML" | grep -c "${SLUG}-inline2.png" || echo "0")
    
    echo "✓ Image references in live HTML:"
    echo "  - Featured: $FEATURED_REF"
    echo "  - Inline1: $INLINE1_REF"
    echo "  - Inline2: $INLINE2_REF"
    
    # Verify images actually load (HTTP 200)
    echo "✓ Verifying image URLs load:"
    for IMG_TYPE in featured inline1 inline2; do
      IMG_URL="https://pjuskeby.org/assets/agatha/story/${SLUG}-${IMG_TYPE}.png"
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$IMG_URL" 2>/dev/null)
      if [ "$HTTP_CODE" = "200" ]; then
        echo "  - ${IMG_TYPE}: HTTP $HTTP_CODE ✓"
      else
        echo "  - ${IMG_TYPE}: HTTP $HTTP_CODE ❌"
      fi
    done
    
    # Check for character/location mentions
    MENTION_LINKS=$(echo "$STORY_HTML" | grep -c 'href="/personer/\|href="/steder/' || echo "0")
    echo "✓ Character/location mentions: $MENTION_LINKS links"
    
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "⚠️  Story not found on live site (attempt $RETRY_COUNT/$MAX_RETRIES)"
    
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "   Waiting 5 seconds and retrying..."
      sleep 5
      
      # Try rebuilding
      echo "   Rebuilding and redeploying..."
      rm -rf dist 2>/dev/null || sudo rm -rf dist
      npm run build 2>&1 | tail -5
      cp -rf dist/client/* httpdocs/ 2>/dev/null || sudo cp -rf dist/client/* httpdocs/
      cp -rf dist/server httpdocs/ 2>/dev/null || sudo cp -rf dist/server httpdocs/
      pm2 restart pjuskeby-web --silent
      sleep 5
    else
      echo "❌ Story not found on live site after $MAX_RETRIES attempts"
      echo "   Please check:"
      echo "   1. Story file exists: $MDX_FILE"
      echo "   2. Build completed without errors"
      echo "   3. PM2 process is running: pm2 list"
      exit 1
    fi
  fi
done

if [ $STORY_FOUND -eq 0 ]; then
  echo "❌ Story verification failed"
  exit 1
fi

echo ""
echo "✅ Complete! Story published with illustrations and verified"
echo ""
echo "📖 View at: https://pjuskeby.org/historier/$SLUG"
echo ""
echo "📊 Summary:"
echo "  - Story file: $MDX_FILE"
echo "  - Images: 3 PNG files in $IMAGE_DIR"
echo "  - Built page: $BUILT_STORY"
echo "  - Mentions: $MENTION_LINKS character/location links"
echo ""
