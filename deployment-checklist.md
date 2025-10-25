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
