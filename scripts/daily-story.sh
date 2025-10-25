#!/bin/bash

# Daily Story Generation Script for Pjuskeby
# Runs at 6 AM daily via cron

cd /var/www/vhosts/pjuskeby.org || exit 1

# Load environment
export $(grep -v '^#' .env | xargs)

# Select random story type
TYPES=("agatha-diary" "rumor" "event")
RANDOM_TYPE=${TYPES[$RANDOM % ${#TYPES[@]}]}

echo "$(date): Generating $RANDOM_TYPE story..." >> logs/story-generation.log

# Generate story
node --import tsx scripts/generate-story.ts "$RANDOM_TYPE" >> logs/story-generation.log 2>&1

# Extract slug from last generated story
SLUG=$(ls -t src/content/stories/*.mdx | head -1 | xargs basename | sed 's/.mdx$//')
echo "$(date): Generated story slug: $SLUG" >> logs/story-generation.log

# Generate and copy images
if [ -n "$SLUG" ]; then
  echo "$(date): Generating images for $SLUG..." >> logs/story-generation.log
  
  # Extract title and summary from MDX frontmatter
  TITLE=$(grep "^title:" "src/content/stories/${SLUG}.mdx" | sed 's/title: "\(.*\)"/\1/')
  SUMMARY=$(grep "^summary:" "src/content/stories/${SLUG}.mdx" | sed 's/summary: "\(.*\)"/\1/')
  
  # Generate images
  node scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY" >> logs/story-generation.log 2>&1
  
  # Copy images to public and httpdocs
  sh scripts/copy-story-images.sh "$SLUG" >> logs/story-generation.log 2>&1
  
  # Fix ownership on httpdocs images for nginx
  chown pjuskebysverden:psacln "httpdocs/assets/agatha/story/${SLUG}"-*.png 2>/dev/null || true
  
  echo "$(date): Images generated and copied for $SLUG" >> logs/story-generation.log
fi

# Rebuild Astro site
npm run build >> logs/story-generation.log 2>&1

# Restart PM2 web process to pick up new content
pm2 restart pjuskeby-web >> logs/story-generation.log 2>&1

echo "$(date): Story generation complete" >> logs/story-generation.log
