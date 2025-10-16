# Pjuskeby Guardrails

Dette dokumentet beskriver **sikkerhetsnett og regler** som hindrer prosjektet fra å gå off-rails.

## 1. Kode-kommentar standard (Guardrails-blokk)

Hver ny fil i prosjektet **må** starte med følgende kommentar-blokk:

### TypeScript/JavaScript
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

### Python
```python
"""
Pjuskeby Guardrails:
- Ingen placeholders. Ingen ubrukte exports.
- Følg koblinger.json for datakilder og relasjoner.
- All skriving til DB/FS logges i donetoday.json.
- Ved AI-generering: aldri publiser direkte; legg i drafts/.
- Ved valideringsfeil: returner 422, ikke "tøm felt".

COPILOT: Ikke foreslå "mock data". Les baseline fra httpdocs/json, ellers avbryt.
"""
```

### MDX
```mdx
{/*
Pjuskeby Guardrails:
- Denne filen er generert av [script/AI/human] den [dato].
- Aldri fjern frontmatter-felter.
- Ved redigering: oppdater updated_at timestamp.
- Relaterte entiteter må være gyldige (sjekk mot koblinger.json).
*/}
```

## 2. Forbudte strenger (Pre-commit blokkerer disse)

Pre-commit hooks **MÅ** blokkere commits som inneholder:

- `TODO`
- `FIXME`
- `placeholder`
- `coming soon`
- `lorem ipsum` (case-insensitive)
- `mock` (i variabelnavn eller kommentarer)
- `dummy`
- `tbd` / `TBD`
- `her kommer` (norsk placeholder)
- `// ...` (ellipsis i kommentarer som indikerer ufullstendig kode)

**Unntak:** Disse strengene kan forekomme i:
- `AI-learned/antimønstre.json` (der de dokumenteres som forbudte)
- `docs/` (dokumentasjon)
- Tester som eksplisitt tester for disse

## 3. donetoday.json logging-krav

Alle scripts og funksjoner som gjør **mutasjoner** må logge til `donetoday.json`:

```typescript
import fs from 'fs/promises';

async function logAction(action: {
  phase: string;
  actor: 'copilot' | 'human' | 'cron';
  action: string;
  why: string;
  files: string[];
  impact?: string;
}) {
  const logPath = '/var/www/vhosts/pjuskeby.org/donetoday.json';
  const log = JSON.parse(await fs.readFile(logPath, 'utf-8'));
  
  log.entries.push({
    timestamp: new Date().toISOString(),
    ...action
  });
  
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
}

// Eksempel på bruk:
await logAction({
  phase: '1',
  actor: 'copilot',
  action: 'normalized people.json',
  why: 'added id, slug, street_id fields',
  files: ['content/data/people.normalized.json'],
  impact: '87 personer normalisert, 2 mangler street_id'
});
```

## 4. AI-generering guardrails

Når AI genererer innhold (historier, rykter, etc.):

### MÅ gjøre:
1. **Les baseline-data** fra `httpdocs/json/`
2. **Valider mot schemas** før skriving
3. **Skriv til `content/drafts/`**, aldri `content/published/`
4. **Logg beslutning** i `logs/ai/decisions/YYYY-MM-DD.json`
5. **Legg til Guardrails-kommentar** på toppen av generert fil
6. **Respekter auto-slotting** (maks 1 ny historie per 2 dager)

### MÅ IKKE gjøre:
1. ❌ Publiser direkte uten menneske-godkjenning
2. ❌ Oppfinn nye personer, steder eller bedrifter
3. ❌ Bryt referential integrity (alle `_id` felter må eksistere)
4. ❌ Skip validering
5. ❌ Skriv direkte til prod-database

### Beslutningslogg format:
```json
{
  "date": "2025-10-16",
  "time": "06:00:00",
  "input": {
    "today": "2025-10-16",
    "season": "autumn",
    "weather": "regn",
    "available_characters": ["agatha-id", "bjorn-id"],
    "recent_stories": ["story-slug-1", "story-slug-2"]
  },
  "decision": {
    "action": "generate_daily_story",
    "character": "agatha-id",
    "location": "biblioteket-id",
    "theme": "vinterberedskap",
    "confidence": 0.85,
    "reasoning": "Agatha har ikke hatt historie på 3 dager, været passer for innendørs aktivitet"
  },
  "output": {
    "file": "content/drafts/daily/2025-10-16-agatha-vinterberedskap.mdx",
    "status": "pending_approval",
    "word_count": 342
  },
  "sources": [
    "httpdocs/json/people.json (agatha)",
    "httpdocs/json/placespjuskeby.json (biblioteket)",
    "koblinger.json (relation rules)"
  ]
}
```

## 5. Slett-alt-mekanisme

### Hva slettes:
- ✅ Dynamiske DB-tabeller: `comments`, `moderation_log`, `rate_limits`, `donations`, `sessions`
- ✅ Genererte filer: `content/drafts/*`, `content/data/*.normalized.json`
- ✅ Cache: alle Redis/memory-cache keys
- ✅ Logs: `logs/ai/decisions/*` (valgfritt, med egen bekreftelse)

### Hva slettes ALDRI (uten eksplisitt dobbel-bekreftelse):
- ❌ `httpdocs/json/*` (baseline data)
- ❌ `AI-learned/*` (læringshistorikk)
- ❌ `koblinger.json`
- ❌ `phase.json` / `donetoday.json`
- ❌ `content/published/*` (publiserte historier)

### Implementasjon:
```typescript
async function wipeAllData(options: {
  confirmation1: string; // Må være "JA, SLETT ALT"
  confirmation2: string; // Må være dagens dato YYYY-MM-DD
  dryRun?: boolean;
}) {
  if (options.confirmation1 !== 'JA, SLETT ALT') {
    throw new Error('Bekreftelse 1 feil');
  }
  
  const today = new Date().toISOString().split('T')[0];
  if (options.confirmation2 !== today) {
    throw new Error('Bekreftelse 2 må være dagens dato');
  }
  
  const wipeLog = {
    timestamp: new Date().toISOString(),
    dryRun: options.dryRun || false,
    actions: []
  };
  
  // Truncate DB tables
  const tablesToTruncate = ['comments', 'moderation_log', 'rate_limits', 'donations', 'sessions'];
  for (const table of tablesToTruncate) {
    if (!options.dryRun) {
      await db.execute(`TRUNCATE TABLE ${table}`);
    }
    wipeLog.actions.push(`Truncated ${table}`);
  }
  
  // Delete generated files
  if (!options.dryRun) {
    await fs.rm('content/drafts/', { recursive: true, force: true });
    await fs.rm('content/data/*.normalized.json', { force: true });
  }
  wipeLog.actions.push('Deleted drafts and normalized data');
  
  // Log wipe
  await fs.writeFile(
    `logs/wipe-${new Date().toISOString()}.json`,
    JSON.stringify(wipeLog, null, 2)
  );
  
  // Log to donetoday.json
  await logAction({
    phase: 'admin',
    actor: 'human',
    action: 'wipe_all_data',
    why: 'Manual reset',
    files: ['db.*', 'content/drafts/*', 'content/data/*.normalized.json']
  });
}
```

## 6. Schema-validering

Alle data-mutasjoner **må** valideres mot JSON Schema (eller Zod):

```typescript
import { z } from 'zod';

const PersonSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  street_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: z.enum(['active', 'inactive', 'archived'])
});

// Ved validering:
try {
  PersonSchema.parse(person);
} catch (error) {
  // Returner 422 Unprocessable Entity
  return { status: 422, error: error.errors };
}
```

## 7. CI/CD validering

GitHub Actions (eller Plesk-basert CI) **må** kjøre:

1. **validate-koblinger**: Sjekk at alle relasjoner i `koblinger.json` eksisterer i kode
2. **validate-schemas**: Alle JSON-filer mot schemas
3. **lint-no-placeholder**: Scan for forbudte strenger
4. **test**: Unit og integrasjonstester
5. **build-dry-run**: Sjekk at build fungerer

**Fail fast**: Hvis én jobb feiler, blokkeres merge.

## 8. Copilot-hint kommentarer

Bruk disse i koden for å guide Copilot:

```typescript
// COPILOT: Ikke foreslå "mock data". Les baseline fra httpdocs/json, ellers avbryt.

// COPILOT: Denne funksjonen MÅ logge til donetoday.json før return.

// COPILOT: Valider mot PersonSchema før skriving til DB.

// COPILOT: Aldri skriv til content/published/, kun content/drafts/.
```

---

## Oppsummering: Guardrails i praksis

1. ✅ **Alle filer har Guardrails-kommentar**
2. ✅ **Pre-commit blokkerer placeholders**
3. ✅ **All mutasjon logges i donetoday.json**
4. ✅ **AI publiserer aldri direkte**
5. ✅ **Schemas valideres før skriving**
6. ✅ **koblinger.json er single source of truth**
7. ✅ **Slett-alt krever dobbel-bekreftelse**
8. ✅ **CI validerer alt før merge**

**Disse reglene er ikke valgfrie. De er fundamentet for prosjektets integritet.**
