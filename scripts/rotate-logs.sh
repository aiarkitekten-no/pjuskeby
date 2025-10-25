#!/bin/bash

# Log rotation for Winston logs
# Removes logs older than retention period

LOGS_DIR="/var/www/vhosts/pjuskeby.org/logs"

echo "🔄 Rotating Winston logs..."

# Remove old app logs (keep 14 days)
find "$LOGS_DIR/app" -name "*.log" -mtime +14 -delete

# Remove old access logs (keep 7 days)  
find "$LOGS_DIR/access" -name "*.log" -mtime +7 -delete

# Remove old error logs (keep 30 days)
find "$LOGS_DIR/error" -name "*.log" -mtime +30 -delete

# Remove old security logs (keep 90 days)
find "$LOGS_DIR/security" -name "*.log" -mtime +90 -delete

# Compress logs older than 1 day
find "$LOGS_DIR" -name "*.log" -mtime +1 ! -name "*$(date +%Y-%m-%d)*" -exec gzip {} \;

echo "✅ Log rotation completed"
