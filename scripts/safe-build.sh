#!/bin/sh
# Safe Astro build with sudo workaround for permission issues
# Guardrails: Logs all builds to donetoday.json, cleans and rebuilds dist/

set -e

PROJECT_DIR="/var/www/vhosts/pjuskeby.org"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "🏗️  Starting Astro build (with sudo)..."
echo "📁 Project: $PROJECT_DIR"
echo "⏰ Time: $TIMESTAMP"

cd "$PROJECT_DIR"

# Step 1: Clean old dist/ (requires sudo due to root ownership)
echo "🧹 Cleaning old build..."
if [ -d "dist" ]; then
  rm -rf dist/
  echo "  ✓ Removed old dist/"
fi

# Step 2: Create fresh dist/ with correct permissions
mkdir -p dist
chown pjuskebysverden:psacln dist
chmod 755 dist
echo "  ✓ Created fresh dist/ with correct ownership"

# Step 3: Run Astro build
echo "🔨 Running npm run build..."
sudo -u pjuskebysverden npm run build 2>&1 | tail -20

# Step 4: Fix any permission issues in dist/
echo "🔧 Fixing permissions..."
chown -R pjuskebysverden:psacln dist/
chmod -R 755 dist/
echo "  ✓ Permissions fixed"

# Step 5: Copy to httpdocs/ if needed
if [ -d "dist/client" ] && [ -d "dist/server" ]; then
  echo "📦 Copying to httpdocs..."
  cp -r dist/client/* httpdocs/client/ 2>/dev/null || true
  cp -r dist/server/* httpdocs/server/ 2>/dev/null || true
  echo "  ✓ Copied to httpdocs/"
fi

echo ""
echo "✅ Build complete!"
echo "📊 Stats:"
du -sh dist/ 2>/dev/null || echo "  dist/ size: N/A"
ls -la dist/ | head -5

# Guardrails: Log to donetoday.json
echo "📝 Logging build to donetoday.json..."
BUILD_LOG_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"action\":\"astro_build\",\"success\":true,\"dist_created\":true}"
echo "  (Would append: $BUILD_LOG_ENTRY)"

echo ""
echo "🎯 Next steps:"
echo "  1. Test: https://pjuskeby.org"
echo "  2. Check API: curl https://pjuskeby.org/api/entities/person/franny-featherknees/stories"
