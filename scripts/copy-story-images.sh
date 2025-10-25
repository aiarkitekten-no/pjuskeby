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
HTTPDOCS_DIR="/var/www/vhosts/pjuskeby.org/httpdocs/assets/agatha/story"

# Create directories if they don't exist
mkdir -p "$PUBLIC_DIR" 2>/dev/null || true
mkdir -p "$HTTPDOCS_DIR" 2>/dev/null || true

echo "📦 Copying story images for: $SLUG"

# Copy featured image to BOTH public and httpdocs
if [ -f "/tmp/${SLUG}-featured.png" ]; then
  cp "/tmp/${SLUG}-featured.png" "$PUBLIC_DIR/${SLUG}-featured.png"
  cp "/tmp/${SLUG}-featured.png" "$HTTPDOCS_DIR/${SLUG}-featured.png"
  chmod 644 "$PUBLIC_DIR/${SLUG}-featured.png" 2>/dev/null || true
  chmod 644 "$HTTPDOCS_DIR/${SLUG}-featured.png" 2>/dev/null || true
  echo "✓ Copied featured image to public/ and httpdocs/"
else
  echo "⚠️  Featured image not found: /tmp/${SLUG}-featured.png"
fi

# Copy first inline image to BOTH public and httpdocs
if [ -f "/tmp/${SLUG}-inline1.png" ]; then
  cp "/tmp/${SLUG}-inline1.png" "$PUBLIC_DIR/${SLUG}-inline1.png"
  cp "/tmp/${SLUG}-inline1.png" "$HTTPDOCS_DIR/${SLUG}-inline1.png"
  chmod 644 "$PUBLIC_DIR/${SLUG}-inline1.png" 2>/dev/null || true
  chmod 644 "$HTTPDOCS_DIR/${SLUG}-inline1.png" 2>/dev/null || true
  echo "✓ Copied inline1 image to public/ and httpdocs/"
else
  echo "⚠️  Inline1 image not found: /tmp/${SLUG}-inline1.png"
fi

# Copy second inline image to BOTH public and httpdocs
if [ -f "/tmp/${SLUG}-inline2.png" ]; then
  cp "/tmp/${SLUG}-inline2.png" "$PUBLIC_DIR/${SLUG}-inline2.png"
  cp "/tmp/${SLUG}-inline2.png" "$HTTPDOCS_DIR/${SLUG}-inline2.png"
  chmod 644 "$PUBLIC_DIR/${SLUG}-inline2.png" 2>/dev/null || true
  chmod 644 "$HTTPDOCS_DIR/${SLUG}-inline2.png" 2>/dev/null || true
  echo "✓ Copied inline2 image to public/ and httpdocs/"
else
  echo "⚠️  Inline2 image not found: /tmp/${SLUG}-inline2.png"
fi

echo "✅ Images copied to public/ and httpdocs/ directories!"
echo "📍 Public: $PUBLIC_DIR/"
echo "📍 Production: $HTTPDOCS_DIR/"
ls -lh "$HTTPDOCS_DIR/${SLUG}"-*.png 2>/dev/null | awk '{print "  "$9" ("$5")"}'
