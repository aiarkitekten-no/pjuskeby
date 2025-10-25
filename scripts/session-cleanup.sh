#!/bin/bash
# Phase 12: Session cleanup cron job
# Runs daily at 4 AM to clean up expired sessions and temporary files

LOG_FILE="/var/www/vhosts/pjuskeby.org/logs/session-cleanup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
CLEANED=0

echo "[$DATE] Starting session cleanup..." >> "$LOG_FILE"

# Clean expired sessions (older than 7 days)
if [ -d "/tmp/pjuskeby_sessions" ]; then
    echo "[$DATE] Cleaning expired sessions..." >> "$LOG_FILE"
    BEFORE=$(find /tmp/pjuskeby_sessions -name "session_*" 2>/dev/null | wc -l)
    find /tmp/pjuskeby_sessions -name "session_*" -mtime +7 -delete 2>/dev/null
    AFTER=$(find /tmp/pjuskeby_sessions -name "session_*" 2>/dev/null | wc -l)
    REMOVED=$((BEFORE - AFTER))
    echo "[$DATE] Removed $REMOVED expired session files" >> "$LOG_FILE"
    CLEANED=$((CLEANED + REMOVED))
fi

# Clean temporary files
if [ -d "/tmp" ]; then
    echo "[$DATE] Cleaning temporary files..." >> "$LOG_FILE"
    BEFORE=$(find /tmp -name "pjuskeby_*" -o -name "astro_*" 2>/dev/null | wc -l)
    find /tmp -name "pjuskeby_*" -mtime +1 -delete 2>/dev/null
    find /tmp -name "astro_*" -mtime +1 -delete 2>/dev/null
    AFTER=$(find /tmp -name "pjuskeby_*" -o -name "astro_*" 2>/dev/null | wc -l)
    REMOVED=$((BEFORE - AFTER))
    echo "[$DATE] Removed $REMOVED temporary files" >> "$LOG_FILE"
    CLEANED=$((CLEANED + REMOVED))
fi

# Clean old log files (keep last 30 days)
LOG_DIR="/var/www/vhosts/pjuskeby.org/logs"
if [ -d "$LOG_DIR" ]; then
    echo "[$DATE] Cleaning old log files..." >> "$LOG_FILE"
    BEFORE=$(find "$LOG_DIR" -name "*.log.*" 2>/dev/null | wc -l)
    find "$LOG_DIR" -name "*.log.*" -mtime +30 -delete 2>/dev/null
    AFTER=$(find "$LOG_DIR" -name "*.log.*" 2>/dev/null | wc -l)
    REMOVED=$((BEFORE - AFTER))
    echo "[$DATE] Removed $REMOVED old log files" >> "$LOG_FILE"
    CLEANED=$((CLEANED + REMOVED))
fi

# Clean MeiliSearch old task logs
if [ -d "/var/www/vhosts/pjuskeby.org/httpdocs/meili_data" ]; then
    echo "[$DATE] Cleaning MeiliSearch task logs..." >> "$LOG_FILE"
    find /var/www/vhosts/pjuskeby.org/httpdocs/meili_data -name "*.log" -mtime +7 -delete 2>/dev/null
fi

# Rotate current logs if they're too large
for logfile in "$LOG_DIR"/*.log; do
    if [ -f "$logfile" ] && [ "$(stat -c%s "$logfile" 2>/dev/null || echo 0)" -gt 52428800 ]; then  # 50MB
        echo "[$DATE] Rotating large log file: $logfile" >> "$LOG_FILE"
        mv "$logfile" "${logfile}.$(date +%Y%m%d)"
        touch "$logfile"
        CLEANED=$((CLEANED + 1))
    fi
done

echo "[$DATE] Session cleanup completed - $CLEANED items cleaned" >> "$LOG_FILE"