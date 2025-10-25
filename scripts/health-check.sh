#!/bin/bash
# Phase 12: Health check cron job
# Runs every 5 minutes to monitor system status

LOG_FILE="/var/www/vhosts/pjuskeby.org/logs/health-check.log"
ALERT_LOG="/var/www/vhosts/pjuskeby.org/logs/health-alerts.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
ERRORS=0

# Function to log with timestamp
log() {
    echo "[$DATE] $1" >> "$LOG_FILE"
}

# Function to alert on errors
alert() {
    echo "[$DATE] ALERT: $1" >> "$ALERT_LOG"
    ERRORS=$((ERRORS + 1))
}

log "Starting health check..."

# Check if MeiliSearch is running (Phase 11 requirement)
if ! curl -s http://127.0.0.1:7700/health | grep -q "available"; then
    alert "MeiliSearch is not responding on port 7700"
else
    log "✅ MeiliSearch is healthy"
fi

# Check disk space
DISK_USAGE=$(df /var/www/vhosts/pjuskeby.org | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    alert "Disk usage is ${DISK_USAGE}% (>85%)"
else
    log "✅ Disk usage is ${DISK_USAGE}%"
fi

# Check if website is responding
if ! curl -s -f http://localhost:3000/ > /dev/null; then
    alert "Main website is not responding on port 3000"
else
    log "✅ Main website is responding"
fi

# Check log file sizes (prevent runaway logs)
for logfile in /var/www/vhosts/pjuskeby.org/logs/*.log; do
    if [ -f "$logfile" ]; then
        SIZE=$(stat -c%s "$logfile" 2>/dev/null || echo 0)
        if [ "$SIZE" -gt 104857600 ]; then  # 100MB
            alert "Log file $logfile is larger than 100MB (${SIZE} bytes)"
        fi
    fi
done

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    alert "Memory usage is ${MEMORY_USAGE}% (>90%)"
else
    log "✅ Memory usage is ${MEMORY_USAGE}%"
fi

# Summary
if [ "$ERRORS" -eq 0 ]; then
    log "Health check completed successfully - all systems operational"
else
    log "Health check completed with $ERRORS errors - check $ALERT_LOG"
fi