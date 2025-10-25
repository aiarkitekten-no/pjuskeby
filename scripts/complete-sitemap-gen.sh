#!/bin/bash
# Phase 13: Complete sitemap generation for SEO
# Creates all 4 required sitemaps: main, pages, stories, people/places

SITE_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
PUBLIC_DIR="$SITE_DIR/public"
DATE=$(date -u +%Y-%m-%dT%H:%M:%S+00:00)

cd "$SITE_DIR" || exit 1

echo "🗺️ Generating complete sitemap set for Phase 13..."

# 1. Generate main sitemap index
cat > "$PUBLIC_DIR/sitemap.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-pages.xml</loc>
    <lastmod>$DATE</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-stories.xml</loc>
    <lastmod>$DATE</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-people.xml</loc>
    <lastmod>$DATE</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://pjuskeby.org/sitemap-places.xml</loc>
    <lastmod>$DATE</lastmod>
  </sitemap>
</sitemapindex>
EOF

# 2. Generate pages sitemap
cat > "$PUBLIC_DIR/sitemap-pages.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pjuskeby.org/</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/historier</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/personer</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/steder</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/kart</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://pjuskeby.org/search</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
EOF

# 3. Generate stories sitemap from content
cat > "$PUBLIC_DIR/sitemap-stories.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF

if [ -d "src/content/stories" ]; then
    for story in src/content/stories/*.mdx; do
        if [ -f "$story" ]; then
            filename=$(basename "$story" .mdx)
            cat >> "$PUBLIC_DIR/sitemap-stories.xml" << EOF
  <url>
    <loc>https://pjuskeby.org/historier/$filename</loc>
    <lastmod>$DATE</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
EOF
        fi
    done
fi

echo "</urlset>" >> "$PUBLIC_DIR/sitemap-stories.xml"

# 4. Generate people sitemap from JSON data
cat > "$PUBLIC_DIR/sitemap-people.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF

if [ -f "json/people.json" ]; then
    # Extract person slugs from JSON and generate URLs
    node -e "
        const people = JSON.parse(require('fs').readFileSync('json/people.json', 'utf8'));
        people.forEach(person => {
            if (person.slug) {
                console.log('  <url>');
                console.log('    <loc>https://pjuskeby.org/personer/' + person.slug + '</loc>');
                console.log('    <lastmod>$DATE</lastmod>');
                console.log('    <changefreq>monthly</changefreq>');
                console.log('    <priority>0.7</priority>');
                console.log('  </url>');
            }
        });
    " >> "$PUBLIC_DIR/sitemap-people.xml"
fi

echo "</urlset>" >> "$PUBLIC_DIR/sitemap-people.xml"

# 5. Generate places sitemap from JSON data
cat > "$PUBLIC_DIR/sitemap-places.xml" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF

if [ -f "json/places.json" ]; then
    # Extract place slugs from JSON and generate URLs
    node -e "
        const places = JSON.parse(require('fs').readFileSync('json/places.json', 'utf8'));
        places.forEach(place => {
            if (place.slug) {
                console.log('  <url>');
                console.log('    <loc>https://pjuskeby.org/steder/' + place.slug + '</loc>');
                console.log('    <lastmod>$DATE</lastmod>');
                console.log('    <changefreq>monthly</changefreq>');
                console.log('    <priority>0.7</priority>');
                console.log('  </url>');
            }
        });
    " >> "$PUBLIC_DIR/sitemap-places.xml"
fi

echo "</urlset>" >> "$PUBLIC_DIR/sitemap-places.xml"

echo "✅ All 4 sitemaps generated successfully!"
echo "📊 Sitemap summary:"
echo "   • sitemap.xml (main index)"
echo "   • sitemap-pages.xml (static pages)"
echo "   • sitemap-stories.xml (from MDX files)"
echo "   • sitemap-people.xml (from people.json)"
echo "   • sitemap-places.xml (from places.json)"