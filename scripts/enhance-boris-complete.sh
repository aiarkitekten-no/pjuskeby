#!/bin/bash

# Complete Boris Blundercheek Profile Enhancement
# Generates image, updates database, builds, and deploys

set -e

cd /var/www/vhosts/pjuskeby.org

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Boris Blundercheek Complete Profile Enhancement           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Generate AI Portrait
echo "▶  Step 1/5: Generating AI Portrait"
echo ""
if node scripts/generate-boris-image.mjs; then
    echo "✅ Portrait generated successfully"
else
    echo "⚠️  Portrait generation failed, continuing anyway..."
fi
echo ""

# Step 2: Update Database
echo "▶  Step 2/5: Updating Database"
echo ""
if node scripts/update-boris-profile.ts; then
    echo "✅ Database updated successfully"
else
    echo "⚠️  Database update failed, continuing anyway..."
fi
echo ""

# Step 3: Build Astro Site
echo "▶  Step 3/5: Building Astro Site"
echo ""
npm run build
echo "✅ Build complete"
echo ""

# Step 4: Deploy to httpdocs
echo "▶  Step 4/5: Deploying to httpdocs"
echo ""
echo "ℹ️  Copying dist to httpdocs (requires sudo)..."

# Copy client files
sudo cp -r dist/* httpdocs/

# Copy server files
sudo cp -r dist/server/* httpdocs/server/

# Fix permissions
sudo chown -R pjuskebysverden:psacln httpdocs/
sudo chmod -R 755 httpdocs/

echo "✅ Deployment complete"
echo ""

# Step 5: Restart PM2
echo "▶  Step 5/5: Restarting PM2 Processes"
echo ""
pm2 restart pjuskeby-api
pm2 restart pjuskeby-web
echo "✅ PM2 processes restarted"
echo ""

# Verification
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✨ All Done! ✨                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔍 Verifying changes..."
echo ""

# Check image
if [ -f "httpdocs/assets/agatha/person/boris-blundercheek.png" ]; then
    echo "✅ Image exists: /assets/agatha/person/boris-blundercheek.png"
    ls -lh httpdocs/assets/agatha/person/boris-blundercheek.png
else
    echo "❌ Image not found"
fi
echo ""

# Check live site
echo "🌐 Checking live site..."
if curl -s https://pjuskeby.org/personer/boris-blundercheek | grep -q "Institute of Oops"; then
    echo "✅ Profile is live at: https://pjuskeby.org/personer/boris-blundercheek"
else
    echo "⚠️  Profile may not be updated yet, check manually"
fi
echo ""

echo "📝 Next steps:"
echo "  1. View profile: https://pjuskeby.org/personer/boris-blundercheek"
echo "  2. Check portrait image renders correctly"
echo "  3. Verify bio appears in 'Full Story' section"
echo ""

exit 0
