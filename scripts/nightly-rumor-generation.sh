#!/bin/bash

# Pjuskeby Rumor Nightly Batch
# Phase 8: Automated Nightly Generation
# 
# Generates 7 new rumors every night at 03:00
# Includes error handling, logging, and notifications

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/rumor-generation-$(date +%Y-%m-%d).log"
BACKUP_DIR="$PROJECT_DIR/backups/rumors"
RUMOR_COUNT=7

# Create directories if they don't exist
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handler
error_handler() {
    log "❌ ERROR: Rumor generation failed at line $1"
    log "Last command: $BASH_COMMAND"
    
    # TODO: Send notification (email, Slack, etc.)
    # curl -X POST "https://hooks.slack.com/..." -d "{\"text\":\"Rumor generation failed!\"}"
    
    exit 1
}

trap 'error_handler $LINENO' ERR

# Start
log "🌙 Starting nightly rumor generation..."
log "📊 Target: $RUMOR_COUNT new rumors"

# Change to project directory
cd "$PROJECT_DIR"

# 1. Backup current data
log "💾 Creating backup..."
BACKUP_FILE="$BACKUP_DIR/rumors-$(date +%Y%m%d-%H%M%S).json"
cp src/content/data/rumors.normalized.json "$BACKUP_FILE"
log "✅ Backup created: $BACKUP_FILE"

# 2. Generate rumors
log "🔮 Generating $RUMOR_COUNT rumors..."
npm run generate:rumors $RUMOR_COUNT >> "$LOG_FILE" 2>&1
log "✅ Rumors generated"

# 3. Generate images
log "🎨 Generating images..."
npm run generate:images all >> "$LOG_FILE" 2>&1
log "✅ Images generated"

# 4. Validate data
log "🔍 Validating data..."
RUMOR_COUNT_AFTER=$(cat src/content/data/rumors.normalized.json | jq '.rumors | length')
log "📊 Total rumors in database: $RUMOR_COUNT_AFTER"

# 5. Cross-integrate with other systems
log "🔗 Running cross-integration..."
npm run integrate:rumors >> "$LOG_FILE" 2>&1
log "✅ Cross-integration complete"

# 6. Update GeoJSON for map
log "🗺️  Updating GeoJSON..."
if [ -f scripts/update-rumors-geojson.ts ]; then
    npm run update:geojson >> "$LOG_FILE" 2>&1
    log "✅ GeoJSON updated"
else
    log "⚠️  GeoJSON update script not found, skipping"
fi

# 7. Build and deploy
log "🏗️  Building site..."
npm run build >> "$LOG_FILE" 2>&1
log "✅ Build complete"

log "🔄 Restarting PM2..."
pm2 restart pjuskeby --update-env >> "$LOG_FILE" 2>&1
log "✅ PM2 restarted"

# 8. Cleanup old backups (keep last 30 days)
log "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "rumors-*.json" -mtime +30 -delete
log "✅ Cleanup complete"

# 9. Summary
log "✨ Nightly generation complete!"
log "📊 Summary:"
log "   - Rumors generated: $RUMOR_COUNT"
log "   - Total rumors: $RUMOR_COUNT_AFTER"
log "   - Backup: $BACKUP_FILE"
log "   - Log: $LOG_FILE"

# TODO: Send success notification
# curl -X POST "https://hooks.slack.com/..." -d "{\"text\":\"Generated $RUMOR_COUNT new rumors! Total: $RUMOR_COUNT_AFTER\"}"

exit 0
