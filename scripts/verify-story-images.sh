#!/bin/sh
# Verify that all stories have their corresponding images in all required locations
# This script checks public/, dist/client/, and httpdocs/

set -e

PUBLIC_DIR="/var/www/vhosts/pjuskeby.org/public/assets/agatha/story"
DIST_DIR="/var/www/vhosts/pjuskeby.org/dist/client/assets/agatha/story"
HTTPDOCS_DIR="/var/www/vhosts/pjuskeby.org/httpdocs/assets/agatha/story"
STORIES_DIR="/var/www/vhosts/pjuskeby.org/src/content/stories"

echo "🔍 Verifying story images across all locations..."
echo ""

TOTAL=0
MISSING=0
FOUND=0

for mdx_file in "$STORIES_DIR"/*.mdx; do
  [ -e "$mdx_file" ] || continue
  
  SLUG=$(basename "$mdx_file" .mdx)
  TOTAL=$((TOTAL + 1))
  
  # Check if story should have illustrations (default is true now)
  HAS_ILLUSTRATIONS=$(grep -E "^hasIllustrations:\s*false" "$mdx_file" || echo "")
  
  if [ -n "$HAS_ILLUSTRATIONS" ]; then
    echo "⏭️  $SLUG - hasIllustrations: false (skipping)"
    continue
  fi
  
  # Check for featured image in all three locations
  MISSING_LOCATIONS=""
  
  if [ ! -f "$PUBLIC_DIR/${SLUG}-featured.png" ]; then
    MISSING_LOCATIONS="${MISSING_LOCATIONS}public "
  fi
  
  if [ ! -f "$DIST_DIR/${SLUG}-featured.png" ]; then
    MISSING_LOCATIONS="${MISSING_LOCATIONS}dist "
  fi
  
  if [ ! -f "$HTTPDOCS_DIR/${SLUG}-featured.png" ]; then
    MISSING_LOCATIONS="${MISSING_LOCATIONS}httpdocs "
  fi
  
  if [ -n "$MISSING_LOCATIONS" ]; then
    echo "❌ $SLUG - Missing in: $MISSING_LOCATIONS"
    MISSING=$((MISSING + 1))
  else
    echo "✅ $SLUG - All images present"
    FOUND=$((FOUND + 1))
  fi
done

echo ""
echo "📊 Summary:"
echo "  Total stories: $TOTAL"
echo "  ✅ Complete: $FOUND"
echo "  ❌ Missing images: $MISSING"
echo ""

if [ $MISSING -gt 0 ]; then
  echo "⚠️  Some stories are missing images. Run this to fix:"
  echo "  sh scripts/copy-all-story-images.sh"
  exit 1
else
  echo "🎉 All stories have images in all required locations!"
  exit 0
fi
