#!/bin/bash
# System backup script

BACKUP_DIR="/var/backups/pjuskeby"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "🔄 Creating system backup..."

# Backup files
tar -czf "$BACKUP_DIR/files-$DATE.tar.gz" httpdocs/ AI-learned/

# Backup database
mysqldump pjuskeby_db > "$BACKUP_DIR/database-$DATE.sql"

# Create manifest
cat > "$BACKUP_DIR/manifest-$DATE.json" << MANIFEST
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "files_backup": "files-$DATE.tar.gz",
  "database_backup": "database-$DATE.sql",
  "system_hash": "$(find httpdocs/ -type f -exec md5sum {} \; | md5sum | cut -d' ' -f1)"
}
MANIFEST

echo "✅ Backup completed: $BACKUP_DIR/"
echo "Files: files-$DATE.tar.gz"
echo "Database: database-$DATE.sql"
echo "Manifest: manifest-$DATE.json"
