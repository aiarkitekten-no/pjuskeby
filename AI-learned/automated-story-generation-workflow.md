# Automatisert Historiegenerering - Komplett Workflow
**Dato:** 23. oktober 2025  
**Status:** Testet og verifisert fungerende

---

## 🎯 Mål: Helt Automatisk Historiegenerering

Brukeren skal kunne kjøre:
```sh
sh scripts/generate-complete-story.sh agatha-diary
```

Og scriptet skal gjøre ABSOLUTT ALT uten manuelle steg.

---

## ✅ Hva Scriptet MÅ Gjøre Automatisk

### 1. Generer Historie (✓ Fungerer)
```sh
node --import tsx scripts/generate-story.ts "$STORY_TYPE"
```
- ✓ Lager MDX fil i `src/content/stories/`
- ✓ Auto-publish hvis confidence >= 0.70
- ✓ Renser summary for YAML newlines
- ✓ Fuzzy Norwegian matching for entities

### 2. Generer Bilder (✓ Fungerer MED FIX)
```sh
# Slett eksisterende /tmp filer først (fikser permission issues)
rm -f /tmp/${SLUG}-*.png 2>/dev/null || sudo rm -f /tmp/${SLUG}-*.png

# Generer med retry hvis det feiler
if ! node scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY"; then
  sudo node scripts/generate-story-images.mjs "$SLUG" "$TITLE" "$SUMMARY"
fi
```
**Kritisk fix i generate-story-images.mjs:**
- ✓ Lagt til `unlinkSync()` før `writeFileSync()` for å unngå EACCES
- ✓ Alle 3 bilder genereres (featured, inline1, inline2)

### 3. Kopier Bilder til Public (✓ Fungerer)
```sh
sh scripts/copy-story-images.sh "$SLUG"
```
- ✓ Bruker `sudo-wrapper.sh` automatisk
- ✓ Kopierer til `public/assets/agatha/story/`
- ✓ Setter riktig ownership (pjuskebysverden:psacln)

### 4. Fiks Permissions og Build (❌ MANGLET - NÅ FIKSET)
```sh
# FIX .astro cache ownership (ofte eid av root)
if [ -d ".astro" ]; then
  ASTRO_OWNER=$(stat -c '%U' .astro 2>/dev/null || echo "unknown")
  if [ "$ASTRO_OWNER" = "root" ]; then
    sudo rm -rf .astro
  else
    rm -rf .astro
  fi
fi

# FIX dist ownership hvis root
if [ -d "dist" ]; then
  DIST_OWNER=$(stat -c '%U' dist 2>/dev/null || echo "unknown")
  if [ "$DIST_OWNER" = "root" ]; then
    sudo chown -R pjuskebysverden:psacln dist/
  fi
fi

# Build
npm run build
```

### 5. Kopier Bilder til Dist (✓ Fungerer)
```sh
cp public/assets/agatha/story/${SLUG}-*.png dist/client/assets/agatha/story/
```
**Hvorfor:** Bilder generert ETTER build må kopieres manuelt til dist

### 6. Deploy til Httpdocs (❌ MANGLET SUDO - NÅ FIKSET)
```sh
# Må bruke sudo pga map-tiles permissions
sudo rsync -a dist/client/ httpdocs/
```
**Kritisk:** Vanlig rsync feiler på map-tiles directories som er eid av root

### 7. Restart PM2 og Verifiser (✓ Fungerer)
```sh
pm2 restart pjuskeby-web
sleep 5

# Verifiser server er online
if pm2 list | grep -q "pjuskeby-web.*online"; then
  echo "✓ Server online"
fi

# Verifiser server svarer
curl -sf https://pjuskeby.org/historier
```

### 8. HTTP Verifisering (✓ Fungerer)
```sh
# Sjekk historie vises på /historier
curl -s https://pjuskeby.org/historier | grep -q "/historier/${SLUG}"

# Sjekk alle 3 bilder laster (HTTP 200)
for img in featured inline1 inline2; do
  curl -s -o /dev/null -w "%{http_code}" \
    "https://pjuskeby.org/assets/agatha/story/${SLUG}-${img}.png"
done

# Sjekk entity mentions
curl -s https://pjuskeby.org/historier/${SLUG} | \
  grep -c 'href="/personer/\|href="/steder/\|href="/bedrifter/'
```

---

## 🚨 Kritiske Mangler Vi Oppdaget

### Problem 1: .astro Cache Eid av Root
**Symptom:** `rm -rf .astro` feiler med "Permission denied"  
**Årsak:** Tidligere build kjørt med sudo  
**Løsning:**
```sh
if [ -d ".astro" ]; then
  ASTRO_OWNER=$(stat -c '%U' .astro 2>/dev/null || echo "unknown")
  if [ "$ASTRO_OWNER" = "root" ]; then
    sudo rm -rf .astro
  else
    rm -rf .astro
  fi
fi
```

### Problem 2: dist/ Eid av Root
**Symptom:** Build feiler eller permission denied  
**Årsak:** Tidligere build kjørt med sudo  
**Løsning:**
```sh
if [ -d "dist" ]; then
  DIST_OWNER=$(stat -c '%U' dist 2>/dev/null || echo "unknown")
  if [ "$DIST_OWNER" = "root" ]; then
    sudo chown -R pjuskebysverden:psacln dist/
  fi
fi
```

### Problem 3: Rsync Feiler på Map-Tiles
**Symptom:** `rsync: mkstemp ... Permission denied` på map-tiles  
**Årsak:** map-tiles directories eid av root  
**Løsning:** Bruk `sudo rsync` for deployment
```sh
sudo rsync -a dist/client/ httpdocs/
```

### Problem 4: /tmp Permissions
**Symptom:** `EACCES: permission denied, open '/tmp/...'`  
**Årsak:** Eksisterende fil eid av annen bruker  
**Løsning:** Slett før generering
```sh
rm -f /tmp/${SLUG}-*.png 2>/dev/null || sudo rm -f /tmp/${SLUG}-*.png
```

### Problem 5: Image Generation Overwrite
**Symptom:** writeFileSync feiler på eksisterende filer  
**Løsning:** Lagt til i generate-story-images.mjs:
```javascript
if (existsSync(filename)) {
  try {
    unlinkSync(filename);
  } catch (err) {
    console.warn(`⚠️  Could not delete existing file ${filename}`);
  }
}
writeFileSync(filename, buffer);
```

---

## 📋 Komplett Automation Sjekkliste

### Pre-Flight Checks (Automatisk)
- [ ] Sjekk om .astro er eid av root → sudo rm hvis ja
- [ ] Sjekk om dist er eid av root → sudo chown hvis ja
- [ ] Slett eksisterende /tmp bilder

### Story Generation
- [ ] Generer MDX med AI
- [ ] Verifiser MDX fil eksisterer

### Image Generation
- [ ] Generer 3 bilder med Runware
- [ ] Verifiser alle 3 bilder i /tmp

### Build & Deploy
- [ ] Kopier bilder til public/ (via sudo-wrapper)
- [ ] Clear .astro cache
- [ ] npm run build
- [ ] Kopier bilder til dist/client/assets/
- [ ] sudo rsync til httpdocs/
- [ ] pm2 restart pjuskeby-web

### Verification
- [ ] PM2 process online
- [ ] Server svarer på /historier
- [ ] Historie vises på /historier
- [ ] Historieside laster (HTTP 200)
- [ ] Alle 3 bilder laster (HTTP 200)
- [ ] Entity mentions finnes

---

## 🔧 Nødvendige Script-Endringer

### generate-complete-story.sh Mangler:

1. **Automatisk .astro cleanup med root-sjekk** (linje ~170)
2. **Automatisk dist ownership fix** (linje ~175)  
3. **sudo rsync deployment** (linje ~230)
4. **HTTP image verification** (linje ~300)

### Alle endringene er implementert i denne økten.

---

## ✅ Verifisert Fungerende (23. okt 2025)

**Test-historie:** `2025-10-23-agatha-diary-xin56`

**Resultater:**
- ✓ MDX generert: `src/content/stories/2025-10-23-agatha-diary-xin56.mdx`
- ✓ 3 bilder generert: featured (219K), inline1 (149K), inline2 (112K)
- ✓ Bilder kopiert til public/, dist/, httpdocs/
- ✓ Build vellykket (5.43s)
- ✓ Deploy vellykket med sudo rsync
- ✓ PM2 restart: online
- ✓ Historie synlig: https://pjuskeby.org/historier/2025-10-23-agatha-diary-xin56
- ✓ Alle bilder HTTP 200
- ✓ Entity mentions: Boris Blundercheek, Clive Flumpington, Thinky Bay

**Manuelle steg som ble brukt (MÅ AUTOMATISERES):**
1. `sudo rm -rf .astro` - NÅ AUTOMATISERT
2. `sudo chown -R pjuskebysverden:psacln dist/` - NÅ AUTOMATISERT
3. `sudo rsync -a dist/client/ httpdocs/` - NÅ AUTOMATISERT

---

## 🎓 Lærdom for Fremtiden

### ALDRI Kjør Build med Sudo
Hvis du kjører `sudo npm run build`, vil .astro/ og dist/ bli eid av root, og fremtidige builds vil feile.

### Alltid Bruk sudo-wrapper.sh for Filkopiering
Ikke kjør `sudo cp` direkte - bruk sudo-wrapper.sh som setter riktig ownership automatisk.

### Rsync Krever Sudo for Httpdocs
map-tiles/ og andre directories i httpdocs er eid av root, så deployment MÅ bruke sudo.

### Verifiser Med HTTP, Ikke Filsjekk
For SSR-sider, sjekk alltid med `curl https://...`, ikke `ls httpdocs/historier/...`

### Permission Errors = Skriv med Sudo Først
Hvis image generation feiler med EACCES, retry automatisk med sudo.

---

## 🚀 Neste Kjøring Skal Være 100% Automatisk

Etter alle fixes skal dette fungere:

```sh
sh scripts/generate-complete-story.sh agatha-diary
```

Ingen manuelle steg. Ingen sudo kommandoer fra bruker. Alt automatisk.

**Siste oppdatering:** 23. oktober 2025, 15:10
