#!/bin/bash
# Generate missing story images for all stories that need them

set -e

STORIES_DIR="/var/www/vhosts/pjuskeby.org/src/content/stories"
PUBLIC_DIR="/var/www/vhosts/pjuskeby.org/public/assets/agatha/story"

echo "🎨 Generating missing story images..."
echo ""

GENERATED=0

for mdx_file in "$STORIES_DIR"/*.mdx; do
  [ -e "$mdx_file" ] || continue
  
  SLUG=$(basename "$mdx_file" .mdx)
  
  # Check if story should have illustrations
  HAS_ILLUSTRATIONS=$(grep -E "^hasIllustrations:\s*false" "$mdx_file" || echo "")
  
  if [ -n "$HAS_ILLUSTRATIONS" ]; then
    continue
  fi
  
  # Check if featured image already exists
  if [ -f "$PUBLIC_DIR/${SLUG}-featured.png" ]; then
    continue
  fi
  
  echo "📸 Generating images for: $SLUG"
  
  # Extract title and summary from frontmatter
  TITLE=$(grep "^title:" "$mdx_file" | sed 's/title: "\(.*\)"/\1/' | head -1)
  SUMMARY=$(grep "^summary:" "$mdx_file" | sed 's/summary: "\(.*\)"/\1/' | head -1)
  
  if [ -z "$TITLE" ]; then
    echo "⚠️  Could not extract title from $mdx_file, skipping"
    continue
  fi
  
  if [ -z "$SUMMARY" ]; then
    # Use first 200 characters of content as summary
    SUMMARY=$(sed -n '/^---$/,/^---$/!p' "$mdx_file" | head -c 200)
  fi
  
  echo "  Title: $TITLE"
  echo "  Summary: ${SUMMARY:0:100}..."
  
  # Generate images
  node /var/www/vhosts/pjuskeby.org/scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY" || {
    echo "❌ Failed to generate images for $SLUG"
    continue
  }
  
  # Copy images to all locations
  sh /var/www/vhosts/pjuskeby.org/scripts/copy-story-images.sh "$SLUG" || {
    echo "❌ Failed to copy images for $SLUG"
    continue
  }
  
  GENERATED=$((GENERATED + 1))
  
  echo "✅ Generated and copied images for $SLUG"
  echo ""
  
  # Sleep to avoid API rate limits
  sleep 10
done

echo ""
echo "📊 Summary:"
echo "  Generated images for $GENERATED stories"
echo ""

if [ $GENERATED -gt 0 ]; then
  echo "🔄 Rebuilding site to include new images..."
  cd /var/www/vhosts/pjuskeby.org
  npm run build
  rsync -av --delete dist/ httpdocs/ --exclude=assets
  pm2 restart pjuskeby
  echo "✅ Site rebuilt and restarted!"
fi
