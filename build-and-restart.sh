#!/bin/bash
set -e

echo "🔨 Building Astro project..."
cd /var/www/vhosts/pjuskeby.org
npm run build

echo ""
echo "� Copying build to httpdocs..."
rsync -av --delete dist/ httpdocs/ --exclude=assets

echo ""
echo "�🔄 Restarting PM2 as pjuskebysverden..."
sudo -u pjuskebysverden pm2 restart 2

echo ""
echo "✅ Build complete and PM2 restarted!"
echo ""
