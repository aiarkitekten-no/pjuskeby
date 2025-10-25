#!/bin/bash

# Phase 19: WebP Image Conversion Script
# Converts PNG/JPG images to WebP format for better performance

echo "🖼️  Phase 19: Converting images to WebP format..."

# Create WebP directory structure
mkdir -p /var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/person
mkdir -p /var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/story
mkdir -p /var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/place
mkdir -p /var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/business
mkdir -p /var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/street

# Convert PNG images to WebP
convert_to_webp() {
    local source_dir=$1
    local target_dir=$2
    
    echo "Converting images from $source_dir to $target_dir"
    
    find "$source_dir" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read -r img; do
        if [ -f "$img" ]; then
            filename=$(basename "$img")
            name_without_ext="${filename%.*}"
            webp_path="$target_dir/${name_without_ext}.webp"
            
            echo "  Converting: $filename → ${name_without_ext}.webp"
            
            # Use sharp-cli if available, otherwise try cwebp
            if command -v sharp &> /dev/null; then
                sharp -i "$img" -o "$webp_path" -f webp -q 85
            elif command -v cwebp &> /dev/null; then
                cwebp -q 85 "$img" -o "$webp_path"
            else
                # Use Node.js with sharp package
                node -e "
                const sharp = require('sharp');
                sharp('$img')
                  .webp({ quality: 85 })
                  .toFile('$webp_path')
                  .then(() => console.log('  ✅ Converted: $filename'))
                  .catch(err => console.error('  ❌ Error converting $filename:', err));
                "
            fi
        fi
    done
}

# Convert Agatha generated images
if [ -d "/var/www/vhosts/pjuskeby.org/public/assets/agatha" ]; then
    convert_to_webp "/var/www/vhosts/pjuskeby.org/public/assets/agatha/person" "/var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/person"
    convert_to_webp "/var/www/vhosts/pjuskeby.org/public/assets/agatha/story" "/var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/story"
    convert_to_webp "/var/www/vhosts/pjuskeby.org/public/assets/agatha/place" "/var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/place"
    convert_to_webp "/var/www/vhosts/pjuskeby.org/public/assets/agatha/business" "/var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/business"
    convert_to_webp "/var/www/vhosts/pjuskeby.org/public/assets/agatha/street" "/var/www/vhosts/pjuskeby.org/public/assets/webp/agatha/street"
fi

echo "✅ WebP conversion completed!"

# Generate size comparison report
echo ""
echo "📊 Size Comparison Report:"
echo "=========================="

original_size=0
webp_size=0

if [ -d "/var/www/vhosts/pjuskeby.org/public/assets/agatha" ]; then
    original_size=$(find /var/www/vhosts/pjuskeby.org/public/assets/agatha -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -exec du -b {} + | awk '{sum += $1} END {print sum}')
fi

if [ -d "/var/www/vhosts/pjuskeby.org/public/assets/webp" ]; then
    webp_size=$(find /var/www/vhosts/pjuskeby.org/public/assets/webp -name "*.webp" -exec du -b {} + | awk '{sum += $1} END {print sum}')
fi

echo "Original PNG/JPG size: $(echo $original_size | numfmt --to=iec-i)B"
echo "WebP size: $(echo $webp_size | numfmt --to=iec-i)B"

if [ $original_size -gt 0 ] && [ $webp_size -gt 0 ]; then
    savings=$((original_size - webp_size))
    percentage=$((savings * 100 / original_size))
    echo "Space saved: $(echo $savings | numfmt --to=iec-i)B ($percentage%)"
fi

echo ""
echo "🎯 Phase 19: WebP conversion complete - Images optimized for better performance!"