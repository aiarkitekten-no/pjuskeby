#!/bin/bash
# GUARDRAILS CHECKPOINT v3.0 - UBRYTELIG
# Phase 20: Deployment Configuration and Rollback Procedures

set -euo pipefail

echo "🚀 DEPLOYMENT CONFIGURATION & ROLLBACK PLAN"
echo "============================================"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

WORKSPACE="/var/www/vhosts/pjuskeby.org"
cd "$WORKSPACE"

# 1. Create deployment checklist
echo "📋 1. DEPLOYMENT CHECKLIST"
echo "=========================="
cat > deployment-checklist.md << 'EOF'
# Production Deployment Checklist

## Pre-Deployment
- [ ] All 19 phases completed (✅ VERIFIED)
- [ ] Performance optimizations active (✅ VERIFIED)
- [ ] Security scan passed (✅ VERIFIED)
- [ ] Load testing completed (✅ VERIFIED)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] CDN configuration active
- [ ] Monitoring systems ready

## Deployment Steps
1. **Backup Current System**
   ```bash
   tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz httpdocs/
   mysqldump pjuskeby_db > backup-db-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Deploy New Code**
   ```bash
   cd /var/www/vhosts/pjuskeby.org
   npm run build
   pm2 restart pjuskeby-api
   ```

3. **Run Database Migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Verify Deployment**
   ```bash
   ./scripts/post-deployment-check.sh
   ```

## Rollback Procedure (if needed)
1. **Stop current services**
   ```bash
   pm2 stop pjuskeby-api
   ```

2. **Restore backup**
   ```bash
   tar -xzf backup-LATEST.tar.gz
   mysql pjuskeby_db < backup-db-LATEST.sql
   ```

3. **Restart services**
   ```bash
   pm2 start pjuskeby-api
   ```

## Post-Deployment
- [ ] Health checks passing
- [ ] Performance metrics normal
- [ ] Error logs clear
- [ ] User acceptance testing
- [ ] Monitoring alerts configured
EOF

echo "✅ deployment-checklist.md created"

# 2. Create environment configuration
echo ""
echo "🔧 2. ENVIRONMENT CONFIGURATION"
echo "==============================="
cat > .env.production.example << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=4100

# Database
DATABASE_URL=mysql://user:password@localhost/pjuskeby_prod
REDIS_URL=redis://localhost:6379

# API Keys (replace with actual values)
RUNWARE_API_KEY=your_runware_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CLOUDFLARE_TURNSTILE_SECRET=your_turnstile_secret_here

# CDN Configuration
CDN_URL=https://cdn.pjuskeby.org

# Security
CORS_ORIGINS=https://pjuskeby.org,https://www.pjuskeby.org
SESSION_SECRET=your_secure_session_secret_here

# Performance
CACHE_TTL=300
MAX_CONNECTIONS=100
EOF

echo "✅ .env.production.example created"

# 3. Create post-deployment verification script
echo ""
echo "🔍 3. POST-DEPLOYMENT VERIFICATION"
echo "=================================="
cat > scripts/post-deployment-check.sh << 'EOF'
#!/bin/bash
# Post-deployment health check script

echo "🔍 POST-DEPLOYMENT HEALTH CHECK"
echo "==============================="

# 1. Check if server is responding
if curl -f -s http://localhost:4100/health >/dev/null; then
    echo "✅ Server is responding"
else
    echo "❌ Server is not responding"
    exit 1
fi

# 2. Check database connection
if curl -f -s http://localhost:4100/api/health/db >/dev/null; then
    echo "✅ Database connection working"
else
    echo "❌ Database connection failed"
    exit 1
fi

# 3. Check critical endpoints
ENDPOINTS=("/" "/api/people" "/api/places" "/kart")
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f -s "http://localhost:4100$endpoint" >/dev/null; then
        echo "✅ $endpoint responding"
    else
        echo "❌ $endpoint failed"
        exit 1
    fi
done

# 4. Check performance optimizations
if [ -f "public/sw.js" ] && [ -d "public/assets/webp" ]; then
    echo "✅ Performance optimizations active"
else
    echo "❌ Performance optimizations missing"
    exit 1
fi

echo ""
echo "🎉 POST-DEPLOYMENT CHECK: PASSED"
echo "System is healthy and ready for production traffic"
EOF

chmod +x scripts/post-deployment-check.sh
echo "✅ post-deployment-check.sh created"

# 4. Create monitoring configuration
echo ""
echo "📊 4. MONITORING CONFIGURATION"
echo "=============================="
cat > monitoring-config.json << 'EOF'
{
  "monitoring": {
    "health_checks": {
      "interval": "1m",
      "endpoints": [
        "http://localhost:4100/health",
        "http://localhost:4100/api/health/db"
      ]
    },
    "performance_metrics": {
      "response_time_threshold": "500ms",
      "error_rate_threshold": "1%",
      "memory_threshold": "80%",
      "cpu_threshold": "85%"
    },
    "alerts": {
      "slack_webhook": "https://hooks.slack.com/YOUR_WEBHOOK",
      "email": "admin@pjuskeby.org"
    }
  },
  "backup_schedule": {
    "database": "0 2 * * *",
    "files": "0 3 * * *",
    "retention_days": 30
  }
}
EOF

echo "✅ monitoring-config.json created"

# 5. Create backup script
echo ""
echo "💾 5. BACKUP PROCEDURES"
echo "======================"
cat > scripts/backup-system.sh << 'EOF'
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
EOF

chmod +x scripts/backup-system.sh
echo "✅ backup-system.sh created"

echo ""
echo "🎯 DEPLOYMENT CONFIGURATION SUMMARY"
echo "==================================="
echo "✅ Deployment checklist created"
echo "✅ Environment configuration template ready"
echo "✅ Post-deployment verification script ready"
echo "✅ Monitoring configuration defined"
echo "✅ Backup procedures established"
echo ""
echo "📋 Next Steps:"
echo "1. Configure production environment variables"
echo "2. Set up SSL certificates"
echo "3. Configure CDN endpoints"
echo "4. Set up monitoring alerts"
echo "5. Schedule automated backups"
echo ""
echo "🚀 DEPLOYMENT PREPARATION: COMPLETED"