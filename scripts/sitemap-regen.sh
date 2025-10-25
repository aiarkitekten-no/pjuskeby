#!/bin/bash
# Phase 12: Sitemap regeneration cron job
# Runs daily at 3 AM to keep search engines updated

LOG_FILE="/var/www/vhosts/pjuskeby.org/logs/sitemap-regen.log"
SITE_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting sitemap regeneration..." >> "$LOG_FILE"

cd "$SITE_DIR" || {
    echo "[$DATE] ERROR: Cannot change to site directory" >> "$LOG_FILE"
    exit 1
}

# Generate main sitemap
echo "[$DATE] Generating main sitemap..." >> "$LOG_FILE"

# Create sitemap with all static pages
cat > public/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-pages.xml</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-stories.xml</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-people.xml</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-places.xml</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
  </sitemap>
</sitemapindex>
EOF

# Generate pages sitemap
cat > public/sitemap-pages.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pjuskeby.org/</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/historier</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/personer</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/steder</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/kart</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/search</loc>
    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
EOF

# Generate stories sitemap from content
if [ -d "src/content/stories" ]; then
    echo "[$DATE] Generating stories sitemap..." >> "$LOG_FILE"
    cat > public/sitemap-stories.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF
    
    for story in src/content/stories/*.mdx; do
        if [ -f "$story" ]; then
            filename=$(basename "$story" .mdx)
            echo "  <url>" >> public/sitemap-stories.xml
            echo "    <loc>https://pjuskeby.org/historier/$filename</loc>" >> public/sitemap-stories.xml
            echo "    <lastmod>$(date -u +%Y-%m-%dT%H:%M:%S+00:00)</lastmod>" >> public/sitemap-stories.xml
            echo "    <changefreq>monthly</changefreq>" >> public/sitemap-stories.xml
            echo "    <priority>0.8</priority>" >> public/sitemap-stories.xml
            echo "  </url>" >> public/sitemap-stories.xml
        fi
    done
    
    echo "</urlset>" >> public/sitemap-stories.xml
fi

echo "[$DATE] Sitemap regeneration completed successfully" >> "$LOG_FILE"
echo "[$DATE] Files generated: sitemap.xml, sitemap-pages.xml, sitemap-stories.xml" >> "$LOG_FILE"