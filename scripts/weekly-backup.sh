#!/bin/bash
# Phase 12: Weekly backup cron job
# Runs every Sunday at 2 AM to create system backups

LOG_FILE="/var/www/vhosts/pjuskeby.org/logs/weekly-backup.log"
BACKUP_DIR="/var/www/vhosts/pjuskeby.org/backups"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
BACKUP_DATE=$(date '+%Y%m%d')

echo "[$DATE] Starting weekly backup..." >> "$LOG_FILE"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
echo "[$DATE] Backing up database..." >> "$LOG_FILE"
if mysqldump --single-transaction pjuskeby_db > "$BACKUP_DIR/pjuskeby_db_$BACKUP_DATE.sql" 2>>"$LOG_FILE"; then
    echo "[$DATE] ✅ Database backup completed" >> "$LOG_FILE"
    gzip "$BACKUP_DIR/pjuskeby_db_$BACKUP_DATE.sql"
    echo "[$DATE] ✅ Database backup compressed" >> "$LOG_FILE"
else
    echo "[$DATE] ❌ Database backup failed" >> "$LOG_FILE"
fi

# Backup content and configuration files
echo "[$DATE] Backing up content and configuration..." >> "$LOG_FILE"
cd /var/www/vhosts/pjuskeby.org || exit 1

tar -czf "$BACKUP_DIR/content_$BACKUP_DATE.tar.gz" \
    httpdocs/src/content/ \
    httpdocs/json/ \
    httpdocs/AI-learned/ \
    httpdocs/SKALUTFORES.json \
    httpdocs/donetoday.json \
    httpdocs/koblinger.json \
    scripts/ \
    2>>"$LOG_FILE"

if [ $? -eq 0 ]; then
    echo "[$DATE] ✅ Content backup completed" >> "$LOG_FILE"
else
    echo "[$DATE] ❌ Content backup failed" >> "$LOG_FILE"
fi

# Backup MeiliSearch data
echo "[$DATE] Backing up MeiliSearch data..." >> "$LOG_FILE"
if [ -d "httpdocs/meili_data" ]; then
    tar -czf "$BACKUP_DIR/meilisearch_$BACKUP_DATE.tar.gz" httpdocs/meili_data/ 2>>"$LOG_FILE"
    echo "[$DATE] ✅ MeiliSearch backup completed" >> "$LOG_FILE"
fi

# Clean old backups (keep last 4 weeks)
echo "[$DATE] Cleaning old backups..." >> "$LOG_FILE"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +28 -delete 2>>"$LOG_FILE"
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +28 -delete 2>>"$LOG_FILE"

# Calculate backup sizes and report
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "[$DATE] Weekly backup completed - Total backup size: $TOTAL_SIZE" >> "$LOG_FILE"

# List current backups
echo "[$DATE] Current backups:" >> "$LOG_FILE"
ls -lh "$BACKUP_DIR"/*_$BACKUP_DATE.* >> "$LOG_FILE" 2>/dev/null