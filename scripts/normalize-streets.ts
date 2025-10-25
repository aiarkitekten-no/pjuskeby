/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID as uuidv4 } from 'crypto';
import { logAction } from './lib/log-action';

const PROJECT_ROOT = '/var/www/vhosts/pjuskeby.org';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function normalizeStreets(): Promise<void> {
  console.log('🔄 Normaliserer streets.json...\n');
  
  const rawData: string[] = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/streets.json'), 'utf-8'));
  
  const normalized = rawData.map((streetName: string) => {
    const slug = slugify(streetName);
    
    return {
      id: uuidv4(),
      name: streetName,
      slug,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  await mkdir(join(PROJECT_ROOT, 'content/data'), { recursive: true });
  await writeFile(
    join(PROJECT_ROOT, 'content/data/streets.normalized.json'),
    JSON.stringify(normalized, null, 2),
    'utf-8'
  );
  
  console.log(`✅ Normalisert ${normalized.length} gater\n`);
  
  await logAction({
    phase: '1',
    actor: 'copilot',
    action: 'normalized streets.json',
    why: 'convert baseline street names to structured format with UUIDs and slugs',
    files: ['content/data/streets.normalized.json'],
    impact: `${normalized.length} streets normalized`
  });
}

normalizeStreets().catch(console.error);
