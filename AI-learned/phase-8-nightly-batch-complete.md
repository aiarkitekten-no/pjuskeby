# Fase 8: Nightly Batch Generation - FERDIG! ✅

## Implementert

### 1. Nightly Generation Script
**Fil:** `scripts/nightly-rumor-generation.sh`

**Hva den gjør:**
- ✅ Genererer 7 nye rykter med GPT-4
- ✅ Genererer bilder (placeholder for nå)
- ✅ Backup av data før generering
- ✅ Validering etter generering
- ✅ Oppdaterer GeoJSON for kart
- ✅ Bygger og deployer automatisk
- ✅ Logger alt til `logs/rumor-generation-YYYY-MM-DD.log`
- ✅ Cleanup av gamle backups (30+ dager)
- ✅ Error handling med trap

### 2. Cron Job Setup

For å kjøre automatisk hver natt kl 03:00:

```bash
crontab -e
```

Legg til:
```cron
# Pjuskeby Rumor Generation - Every day at 03:00
0 3 * * * /var/www/vhosts/pjuskeby.org/scripts/nightly-rumor-generation.sh

# Alternative times for testing:
# Every hour at :00
# 0 * * * * /var/www/vhosts/pjuskeby.org/scripts/nightly-rumor-generation.sh

# Every 30 minutes
# */30 * * * * /var/www/vhosts/pjuskeby.org/scripts/nightly-rumor-generation.sh
```

### 3. Manual Testing

Test scriptet manuelt før du setter opp cron:

```bash
cd /var/www/vhosts/pjuskeby.org
./scripts/nightly-rumor-generation.sh
```

Sjekk loggen:
```bash
tail -f logs/rumor-generation-$(date +%Y-%m-%d).log
```

### 4. Monitoring & Notifications

**TODO (ikke implementert enda):**
- [ ] Slack webhook for success/error notifications
- [ ] Email alerts ved feil
- [ ] Grafana dashboard for metrics
- [ ] Healthcheck endpoint

**Eksempel Slack notification (kommenter inn i script):**
```bash
curl -X POST "https://hooks.slack.com/services/YOUR/WEBHOOK/URL" \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"✨ Generated $RUMOR_COUNT new rumors! Total: $RUMOR_COUNT_AFTER\"}"
```

### 5. Backup Strategi

- ✅ Backup før hver generering
- ✅ Backups lagres i `backups/rumors/`
- ✅ Automatisk cleanup av backups eldre enn 30 dager
- ✅ Filformat: `rumors-YYYYMMDD-HHMMSS.json`

Gjenopprett fra backup:
```bash
cp backups/rumors/rumors-20251026-030000.json src/content/data/rumors.normalized.json
cp backups/rumors/rumors-20251026-030000.json content/data/rumors.normalized.json
npm run build
pm2 restart pjuskeby
```

### 6. Error Recovery

Scriptet stopper ved første feil (set -e). Hvis noe går galt:

1. **Sjekk loggen:**
   ```bash
   tail -100 logs/rumor-generation-$(date +%Y-%m-%d).log
   ```

2. **Gjenopprett fra backup:**
   ```bash
   ls -lt backups/rumors/ | head -5
   cp backups/rumors/LATEST_BACKUP.json src/content/data/rumors.normalized.json
   ```

3. **Test manuelt:**
   ```bash
   npm run generate:rumors 1  # Test med 1 rykter
   ```

### 7. Disk Space Management

Skript for å sjekke diskplass:

```bash
# Check backup size
du -sh backups/rumors/

# Check log size
du -sh logs/

# Clean old logs manually (>30 days)
find logs/ -name "rumor-generation-*.log" -mtime +30 -delete
```

### 8. Performance Metrics

Forventet kjøretid for 7 rykter:
- Rumor generation: ~1-2 minutter (GPT-4 API calls)
- Image generation: ~5 sekunder (placeholders)
- Build: ~10-20 sekunder
- Total: **~2-3 minutter**

### 9. Rate Limiting

OpenAI API limits:
- Free tier: 3 requests/min
- Paid tier: 60 requests/min

Med 7 rykter og 2s delay mellom hver:
- 7 requests x 2s = 14 sekunder
- Godt innenfor grenser ✅

---

## Status: ✅ FULLFØRT

Fase 8 er komplett. Cron job må settes opp manuelt av bruker (krever ikke sudo hvis user har crontab tilgang).

Neste steg: Fase 9 - Cross-Integration
