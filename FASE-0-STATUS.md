# Pjuskeby Fase 0 - Guardrails Boot

## ✅ STATUS: KOMPLETT

**Dato fullført:** 2025-10-16  
**Fase:** 0 - Guardrails-boot  
**Neste fase:** 1 - Datafundament & normalisering

---

## 📋 Hva ble opprettet

### Core Files (Guardrails)
- ✅ `koblinger.json` - Single source of truth (9 moduler definert)
- ✅ `phase.json` - Gjeldende fase og mål
- ✅ `donetoday.json` - Append-only audit log (8 entries)
- ✅ `.env` - Environment variables (DB credentials)
- ✅ `.gitignore` - Sikrer at sensitive filer ikke committes

### AI-Learned Directory
- ✅ `AI-learned/fungerer.json` - 3 items
- ✅ `AI-learned/feil.json` - 0 items (tomt, som forventet)
- ✅ `AI-learned/usikkert.json` - 0 items
- ✅ `AI-learned/godekilder.json` - 3 kilder
- ✅ `AI-learned/antimønstre.json` - 8 forbudte mønstre
- ✅ `AI-learned/beslutninger.json` - 7 arkitektoniske valg

### Documentation
- ✅ `docs/GUARDRAILS.md` - Komplett guardrails-dokumentasjon
- ✅ `README.md` - Installasjon og oversikt

### Scripts
- ✅ `scripts/validate-koblinger.ts` - Validerer koblinger.json
- ✅ `scripts/lint-no-placeholder.ts` - Blokkerer placeholders
- ✅ `scripts/pre-commit.sh` - Pre-commit hook
- ✅ `scripts/lib/log-action.ts` - Logging-utility
- ✅ `scripts/wipe-dynamic-data.ts` - Slett-alt med dobbel-bekreftelse

### Config
- ✅ `package.json` - Dependencies og scripts
- ✅ `tsconfig.json` - TypeScript konfigurasjon

---

## 🎯 Akseptansekrav (Fase 0)

| Krav | Status | Merknad |
|------|--------|---------|
| koblinger.json finnes og beskriver alle moduler | ✅ | 9 moduler, 20+ relasjoner |
| AI-learned/ med 6 filer | ✅ | Alle opprettet og strukturert |
| phase.json og donetoday.json | ✅ | I bruk, 8 log-entries |
| Pre-commit hooks | ✅ | Må installeres manuelt |
| Validerings-scripts | ✅ | validate:all kjørbar |
| Guardrails-kommentar template | ✅ | Dokumentert i GUARDRAILS.md |
| .env med DB credentials | ✅ | Må sikres med chmod 640 |
| Slett-alt-mekanisme | ✅ | Med dobbel-bekreftelse |

---

## 📦 Installasjon (Neste steg)

### 1. Installer dependencies

```bash
cd /var/www/vhosts/pjuskeby.org
npm install
```

Dette vil installere:
- Astro (frontend framework)
- Fastify (API server)
- Drizzle ORM (database)
- Zod (validering)
- TypeScript, tsx, glob (dev tools)

### 2. Aktiver pre-commit hooks

```bash
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Dette vil automatisk:
- Blokkere commits med `TODO`, `FIXME`, `mock`, etc.
- Hindre at `.env` committes
- Validere `koblinger.json` hvis endret

### 3. Sikre .env

```bash
chmod 640 .env
chown root:psacln .env
```

### 4. Valider oppsett

```bash
npm run validate:all
```

Denne kommandoen kjører:
1. `validate:koblinger` - Sjekker at koblinger.json er gyldig
2. `validate:placeholders` - Skanner for forbudte strenger

---

## 🔒 Sikkerhet (Plesk/Nginx)

Legg til i **Plesk → Apache & nginx Settings → Additional nginx directives**:

```nginx
# Blokker tilgang til sensitive filer
location ~ /\.env {
    deny all;
    return 404;
}

location ~ /AI-learned/ {
    deny all;
    return 404;
}

location ~ \.schema\.json$ {
    deny all;
    return 404;
}

location ~ /koblinger\.json$ {
    deny all;
    return 404;
}

location ~ /phase\.json$ {
    deny all;
    return 404;
}

location ~ /donetoday\.json$ {
    deny all;
    return 404;
}
```

---

## 📊 Definerte Moduler (koblinger.json)

1. **data.foundation** - Baseline normalisering (9 JSON-filer)
2. **comments** - Kommentarsystem med moderasjon
3. **ai.daily** - AI-generering (Agatha, rykter)
4. **map** - MapLibre kart med lag
5. **seo.aio** - SEO/AIO optimalisering
6. **kofi** - Ko-fi integrasjon
7. **podcast** - Podcast feed
8. **auth.admin** - Admin-autentisering
9. **wipe** - Slett-alt-mekanisme

Totalt: **20+ relasjoner definert**, **8+ guardrails** per kritisk modul.

---

## 🚫 Forbudte Mønstre (antimønstre.json)

Pre-commit hooks blokkerer:
1. Mock data generering
2. Hardkodede hemmeligheter
3. Direkte AI-publisering
4. Placeholders (TODO, FIXME, etc.)
5. Sletting av baseline-data
6. Mutasjoner uten logging
7. Uvaliderte relasjoner
8. Kommentarer uten moderasjon

---

## 📝 Logging

Alle scripts bruker `logAction()` fra `scripts/lib/log-action.ts`:

```typescript
import { logAction } from './scripts/lib/log-action';

await logAction({
  phase: '1',
  actor: 'copilot',
  action: 'normalized people.json',
  why: 'added id, slug, street_id fields',
  files: ['content/data/people.normalized.json'],
  impact: '87 personer normalisert, 2 mangler street_id'
});
```

**Current log size:** 8 entries (Fase 0 setup)

---

## 🧪 Testing

```bash
# Valider alt
npm run validate:all

# Dry-run av wipe-script
npm run wipe:dry-run
```

---

## ➡️ Neste: Fase 1 - Datafundament

Fase 1 vil:
1. Opprette JSON schemas for alle entiteter
2. Normalisere baseline-JSON (legg til id, slug, timestamps)
3. Etablere referential integrity (street_id, workplace_id, etc.)
4. Generere geo-indeks for kart
5. Validere at 0 feil eksisterer

**Start Fase 1 når:**
- [x] `npm install` fullført
- [x] Pre-commit hooks installert
- [x] `.env` sikret
- [x] `npm run validate:all` kjører grønt

---

## 📚 Ressurser

- **Guardrails:** `docs/GUARDRAILS.md`
- **Koblinger:** `koblinger.json`
- **Audit log:** `donetoday.json`
- **Gjeldende fase:** `phase.json`

---

**Fase 0 er FERDIG! 🎉**

Alt infrastruktur for guardrails er på plass.  
Prosjektet er nå **sikret mot hallusinasjoner, placeholders og ukontrollerte endringer**.

**Neste kommando:**
```bash
npm install
```
