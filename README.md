# Pjuskeby Installation & Setup

## Fase 0: Guardrails-boot ✅

Denne fasen er **fullført**. Følgende er på plass:

### ✅ Opprettet filer

1. **`koblinger.json`** - Single source of truth for moduler, relasjoner og guardrails
2. **`AI-learned/`** katalog med:
   - `fungerer.json` - Ting som fungerer
   - `feil.json` - Ting som har feilet
   - `usikkert.json` - Ting vi er usikre på
   - `godekilder.json` - Pålitelige kilder
   - `antimønstre.json` - Forbudte mønstre
   - `beslutninger.json` - Arkitektoniske valg
3. **`phase.json`** - Gjeldende fase og mål
4. **`donetoday.json`** - Append-only audit log
5. **`.env`** - Environment variables (DB credentials)
6. **`.gitignore`** - Sikrer at sensitive filer ikke committes
7. **`docs/GUARDRAILS.md`** - Komplett dokumentasjon av guardrails

### ✅ Scripts

1. **`scripts/validate-koblinger.ts`** - Validerer koblinger.json
2. **`scripts/lint-no-placeholder.ts`** - Skanner for forbudte placeholders
3. **`scripts/pre-commit.sh`** - Pre-commit hook
4. **`scripts/lib/log-action.ts`** - Logger til donetoday.json
5. **`scripts/wipe-dynamic-data.ts`** - Slett-alt-mekanisme med dobbel-bekreftelse

### ✅ package.json

Inkluderer scripts for validering og basic dependencies.

---

## Neste steg: Installasjon

### 1. Installer dependencies

```bash
cd /var/www/vhosts/pjuskeby.org
npm install
```

### 2. Sett opp pre-commit hook

```bash
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 3. Sikre .env-filen

```bash
chmod 640 .env
chown root:psacln .env
```

### 4. Valider oppsettet

```bash
npm run validate:all
```

Dette vil sjekke:
- At `koblinger.json` er gyldig
- At ingen forbudte placeholders finnes i koden

---

## Akseptansekrav for Fase 0

- [x] `koblinger.json` finnes og beskriver alle moduler
- [x] `AI-learned/*` katalog med 6 påkrevde filer
- [x] `phase.json` og `donetoday.json` opprettet
- [x] Pre-commit hooks definert (må installeres manuelt)
- [x] Validerings-scripts fungerer
- [x] Guardrails-kommentar template dokumentert
- [x] `.env` opprettet med DB credentials
- [x] Slett-alt-mekanisme implementert
- [ ] CI/CD pipeline (kommer i senere fase)

---

## Guardrails i praksis

### Hver ny fil må starte med:

```typescript
/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

// COPILOT: Ikke foreslå "mock data". Les baseline fra httpdocs/json, ellers avbryt.
```

### Før commit:

Pre-commit hooken vil automatisk:
1. Blokkere commits med `TODO`, `FIXME`, `mock`, etc.
2. Hindre at `.env` committes
3. Validere `koblinger.json` hvis endret

### Ved mutasjoner:

Alle scripts som endrer data **må** logge:

```typescript
import { logAction } from './scripts/lib/log-action';

await logAction({
  phase: '1',
  actor: 'copilot',
  action: 'normalized people.json',
  why: 'added id, slug, street_id fields',
  files: ['content/data/people.normalized.json']
});
```

---

## Sikkerhet

### .env må sikres i Plesk

Legg til i **Nginx Additional Directives**:

```nginx
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
```

---

## Neste fase: Fase 1 - Datafundament

Når Fase 0 er bekreftet:

```bash
# Oppdater phase.json til fase 1
# Begynn normalisering av baseline-JSON
npm run normalize:baseline
```

Se `docs/PHASE-1.md` for detaljer (kommer).

---

**Fase 0 er ferdig! 🎉**

Alt infrastruktur for guardrails er på plass. Du kan nå trygt gå videre til Fase 1.
