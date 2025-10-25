# Backup Strategy for Pjuskeby

## Overview
Comprehensive backup strategy to protect data, content, and configuration for the Pjuskeby platform.

## 1. Database Backups

### MariaDB Database: `pjuskeby_db`

**Automated Daily Backups:**
```bash
# Add to crontab (daily at 2 AM)
0 2 * * * mysqldump -u root pjuskeby_db | gzip > /var/www/vhosts/pjuskeby.org/backups/db/pjuskeby_db_$(date +\%Y\%m\%d).sql.gz
```

**Manual Backup Command:**
```bash
mysqldump -u root pjuskeby_db | gzip > pjuskeby_db_backup.sql.gz
```

**Restore Command:**
```bash
gunzip < backup.sql.gz | mysql -u root pjuskeby_db
```

**Retention Policy:**
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks  
- Monthly backups: Keep 12 months

## 2. Content Backups

### Stories Content: `src/content/stories/`
- **Location:** `/var/www/vhosts/pjuskeby.org/src/content/stories/`
- **Format:** MDX files with frontmatter
- **Backup:** Included in code repository (Git)

### Data Files: `content/data/`
- **Location:** `/var/www/vhosts/pjuskeby.org/content/data/`
- **Files:** 
  - `people.normalized.json`
  - `places.normalized.json`
  - `streets.normalized.json`
  - `businesses.normalized.json`
- **Backup:** Git + daily file system backup

### GeoJSON Files: `public/geojson/`
- **Location:** `/var/www/vhosts/pjuskeby.org/public/geojson/`
- **Backup:** Git repository

## 3. Configuration Backups

### Critical Configuration Files:
```bash
# PM2 process configuration
/var/www/vhosts/pjuskeby.org/ecosystem.config.json

# Environment variables (SENSITIVE - DO NOT COMMIT)
/var/www/vhosts/pjuskeby.org/.env

# Astro configuration
/var/www/vhosts/pjuskeby.org/astro.config.mjs

# Package dependencies
/var/www/vhosts/pjuskeby.org/package.json
/var/www/vhosts/pjuskeby.org/package-lock.json
```

**Backup Command:**
```bash
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  ecosystem.config.json \
  astro.config.mjs \
  package.json \
  package-lock.json \
  phase.json
```

**⚠️ IMPORTANT:** `.env` file contains secrets - backup separately and encrypt!

## 4. Cron Jobs

### AI Story Generation
```bash
# Runs daily at 6 AM
0 6 * * * /var/www/vhosts/pjuskeby.org/scripts/daily-story.sh >> /var/www/vhosts/pjuskeby.org/logs/cron.log 2>&1
```

**Backup cron configuration:**
```bash
crontab -l > crontab_backup_$(date +%Y%m%d).txt
```

## 5. PM2 Process State

### PM2 Save & Restore:
```bash
# Save current PM2 process list
pm2 save

# Restore after server restart
pm2 resurrect
```

### PM2 Logs Location:
- Logs directory: `/var/www/vhosts/pjuskeby.org/logs/`
- PM2 logs: `~/.pm2/logs/`

## 6. Full System Backup

### Complete Site Backup Script:
```bash
#!/bin/bash
BACKUP_DIR="/var/www/vhosts/pjuskeby.org/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR/full

# Backup database
mysqldump -u root pjuskeby_db | gzip > $BACKUP_DIR/full/db_$DATE.sql.gz

# Backup code and content
tar -czf $BACKUP_DIR/full/site_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='backups' \
  /var/www/vhosts/pjuskeby.org/

# Backup configuration (encrypted)
tar -czf - ecosystem.config.json .env | \
  gpg --symmetric --cipher-algo AES256 > $BACKUP_DIR/full/config_$DATE.tar.gz.gpg

echo "Backup completed: $DATE"
```

## 7. Disaster Recovery Plan

### Recovery Steps:

1. **Restore Database:**
```bash
gunzip < backup.sql.gz | mysql -u root pjuskeby_db
```

2. **Restore Code:**
```bash
cd /var/www/vhosts/pjuskeby.org
git pull origin main
npm install
npm run build
```

3. **Restore Configuration:**
```bash
# Decrypt and extract config
gpg --decrypt config_backup.tar.gz.gpg | tar -xz
```

4. **Restart Services:**
```bash
pm2 restart all
pm2 save
```

5. **Verify:**
```bash
curl https://pjuskeby.org/health
```

## 8. Off-site Backups

**Recommendations:**
- ✅ Git repository (GitHub/GitLab) - Already in place
- 🔜 Cloud storage (AWS S3, Google Cloud Storage, Backblaze B2)
- 🔜 Automated upload script for database dumps
- 🔜 Weekly off-site backup verification

## 9. Backup Verification

**Weekly Verification Checklist:**
- [ ] Test database restore on staging environment
- [ ] Verify backup file integrity (`md5sum`, `sha256sum`)
- [ ] Check backup file sizes (detect corruption)
- [ ] Ensure backups are accessible and not corrupted
- [ ] Document any restoration issues

## 10. Security Considerations

**Encryption:**
- Database backups should be encrypted before off-site transfer
- `.env` file must NEVER be committed to Git
- Use GPG or similar encryption for sensitive data

**Access Control:**
- Backup directory: `chmod 700`
- Backup files: `chmod 600`
- Only root and service account should access backups

## Backup Storage Requirements

- Database backups: ~5-10MB per day (compressed)
- Full site backups: ~50-100MB per backup
- Estimated monthly storage: ~1-2GB
- Recommended available space: 10GB minimum

---

**Last Updated:** October 17, 2025  
**Maintained by:** GitHub Copilot (Fase 8 Implementation)
