#!/bin/bash

# Daily Story Generation Script for Pjuskeby
# Runs at 6 AM daily via cron

cd /var/www/vhosts/pjuskeby.org || exit 1

# Ensure OpenAI API key is available
if [ -f .env ]; then
  export $(grep "^OPENAI_API_KEY=" .env | xargs)
fi

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
  
  # Copy images to all locations using sudo-wrapper
  bash scripts/copy-story-images.sh "$SLUG" >> logs/story-generation.log 2>&1
  
  echo "$(date): Images generated and copied for $SLUG" >> logs/story-generation.log
fi

# Fix permissions before build (using sudo-wrapper)
echo "$(date): Fixing permissions..." >> logs/story-generation.log
sudo scripts/sudo-wrapper.sh fix-permissions dist >> logs/story-generation.log 2>&1

# Rebuild Astro site
npm run build >> logs/story-generation.log 2>&1

# Sync to httpdocs
rsync -av --delete dist/ httpdocs/ --exclude=assets >> logs/story-generation.log 2>&1

# Restart PM2 web process to pick up new content
pm2 restart pjuskeby >> logs/story-generation.log 2>&1

echo "$(date): Story generation complete" >> logs/story-generation.log
