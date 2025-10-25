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

# Rebuild Astro site
npm run build >> logs/story-generation.log 2>&1

# Restart PM2 web process to pick up new content
pm2 restart pjuskeby-web >> logs/story-generation.log 2>&1

echo "$(date): Story generation complete" >> logs/story-generation.log
