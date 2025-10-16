/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

// COPILOT: Ikke foreslå "mock data". Les baseline fra httpdocs/json, ellers avbryt.

import { readFile } from 'fs/promises';
import { join } from 'path';

const PROJECT_ROOT = '/var/www/vhosts/pjuskeby.org';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateKoblinger(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  try {
    // Les koblinger.json
    const koblingerPath = join(PROJECT_ROOT, 'httpdocs/koblinger.json');
    const koblinger = JSON.parse(await readFile(koblingerPath, 'utf-8'));

    // Valider struktur
    if (!koblinger.modules) {
      result.errors.push('koblinger.json mangler "modules" feltet');
      result.valid = false;
    }

    // Valider hver modul
    for (const [moduleName, moduleConfig] of Object.entries(koblinger.modules)) {
      const config = moduleConfig as any;

      // Sjekk at påkrevde felter eksisterer
      const requiredFields = ['description', 'reads', 'writes', 'schemas', 'relations', 'db', 'api', 'cron', 'cache_keys'];
      for (const field of requiredFields) {
        if (!(field in config)) {
          result.errors.push(`Modul "${moduleName}" mangler feltet "${field}"`);
          result.valid = false;
        }
      }

      // Valider at guardrails finnes for kritiske moduler
      if (['ai.daily', 'comments', 'wipe'].includes(moduleName) && !config.guardrails) {
        result.errors.push(`Kritisk modul "${moduleName}" mangler "guardrails"`);
        result.valid = false;
      }

      // Valider relasjoner
      if (config.relations && Array.isArray(config.relations)) {
        for (const rel of config.relations) {
          if (!rel.from || !rel.to || !rel.type || typeof rel.required !== 'boolean') {
            result.errors.push(`Ugyldig relasjon i modul "${moduleName}": ${JSON.stringify(rel)}`);
            result.valid = false;
          }
        }
      }

      // Sjekk at baseline-filer i "reads" faktisk eksisterer
      if (config.reads && Array.isArray(config.reads)) {
        for (const readPath of config.reads) {
          if (readPath.startsWith('httpdocs/json/')) {
            const fullPath = join(PROJECT_ROOT, readPath);
            try {
              await readFile(fullPath, 'utf-8');
            } catch {
              result.warnings.push(`Modul "${moduleName}" leser fra "${readPath}" som ikke eksisterer ennå`);
            }
          }
        }
      }
    }

    // Valider global_guardrails
    if (!koblinger.global_guardrails || !Array.isArray(koblinger.global_guardrails)) {
      result.errors.push('koblinger.json mangler "global_guardrails"');
      result.valid = false;
    }

  } catch (error) {
    result.errors.push(`Feil ved lesing av koblinger.json: ${error}`);
    result.valid = false;
  }

  return result;
}

async function main() {
  console.log('🔍 Validerer koblinger.json...\n');

  const result = await validateKoblinger();

  if (result.errors.length > 0) {
    console.error('❌ FEIL:');
    result.errors.forEach(err => console.error(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  ADVARSLER:');
    result.warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  if (result.valid) {
    console.log('\n✅ koblinger.json er gyldig!\n');
    process.exit(0);
  } else {
    console.error('\n❌ koblinger.json har feil. Fix disse før du fortsetter.\n');
    process.exit(1);
  }
}

main();
