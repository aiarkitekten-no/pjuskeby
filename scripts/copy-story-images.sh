#!/bin/sh
# Copy generated story images from /tmp to public/assets/agatha/story/
# Uses sudo-wrapper.sh for non-root image copying

set -e

SLUG="$1"

if [ -z "$SLUG" ]; then
  echo "Usage: sh scripts/copy-story-images.sh <story-slug>"
  echo "Example: sh scripts/copy-story-images.sh 2025-10-17-event-abc123"
  exit 1
fi

PUBLIC_DIR="/var/www/vhosts/pjuskeby.org/public/assets/agatha/story"
WRAPPER="/var/www/vhosts/pjuskeby.org/scripts/sudo-wrapper.sh"

# Create directory if it doesn't exist
mkdir -p "$PUBLIC_DIR" 2>/dev/null || sudo mkdir -p "$PUBLIC_DIR"

echo "📦 Copying story images for: $SLUG"

# Copy featured image
if [ -f "/tmp/${SLUG}-featured.png" ]; then
  sudo "$WRAPPER" copy-image "/tmp/${SLUG}-featured.png" "$PUBLIC_DIR/${SLUG}-featured.png"
  echo "✓ Copied featured image"
else
  echo "⚠️  Featured image not found: /tmp/${SLUG}-featured.png"
fi

# Copy first inline image
if [ -f "/tmp/${SLUG}-inline1.png" ]; then
  sudo "$WRAPPER" copy-image "/tmp/${SLUG}-inline1.png" "$PUBLIC_DIR/${SLUG}-inline1.png"
  echo "✓ Copied inline1 image"
else
  echo "⚠️  Inline1 image not found: /tmp/${SLUG}-inline1.png"
fi

# Copy second inline image
if [ -f "/tmp/${SLUG}-inline2.png" ]; then
  sudo "$WRAPPER" copy-image "/tmp/${SLUG}-inline2.png" "$PUBLIC_DIR/${SLUG}-inline2.png"
  echo "✓ Copied inline2 image"
else
  echo "⚠️  Inline2 image not found: /tmp/${SLUG}-inline2.png"
fi

echo "✅ Images copied to public directory!"
echo "📍 Location: $PUBLIC_DIR/"
echo "ℹ️  Note: Run 'npm run build && cp -r dist/* httpdocs/' to deploy to production"
ls -lh "$PUBLIC_DIR/${SLUG}"-*.png 2>/dev/null | awk '{print "  "$9" ("$5")"}'
