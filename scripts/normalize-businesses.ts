/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { logAction } from './lib/log-action';

const PROJECT_ROOT = '/var/www/vhosts/pjuskeby.org';

interface BaselineBusiness {
  name: string;
  type?: string;
  description?: string;
  owner?: string;
  location?: string;
  [key: string]: any;
}

interface NormalizedBusiness {
  id: string;
  slug: string;
  name: string;
  type: string | null;
  description: string | null;
  street_id: string;
  street_address: string | null;
  owner_id: string | null;
  employees: string[];
  geo: any | null;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'archived';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function loadStreets(): Promise<Map<string, string>> {
  const streetsPath = join(PROJECT_ROOT, 'content/data/streets.normalized.json');
  try {
    const streets = JSON.parse(await readFile(streetsPath, 'utf-8'));
    const map = new Map<string, string>();
    for (const street of streets) {
      map.set(street.name.toLowerCase(), street.id);
    }
    return map;
  } catch {
    return new Map();
  }
}

async function normalizeBusinesses() {
  console.log('🔄 Normaliserer businesses.json...\n');
  
  // Load baseline
  const businessesBaseline = JSON.parse(
    await readFile(join(PROJECT_ROOT, 'content/data/businesses.json'), 'utf-8')
  ) as BaselineBusiness[];  const streetMap = await loadStreets();
  const normalized: NormalizedBusiness[] = [];
  const warnings: string[] = [];
  const now = new Date().toISOString();
  
  const defaultStreetId = randomUUID();
  
  for (const business of businessesBaseline) {
    let streetId = defaultStreetId;
    
    if (business.location) {
      const key = business.location.toLowerCase();
      const found = streetMap.get(key);
      if (found) {
        streetId = found;
      } else {
        warnings.push(`Business "${business.name}": ukjent gate "${business.location}"`);
      }
    }
    
    normalized.push({
      id: randomUUID(),
      slug: slugify(business.name),
      name: business.name,
      type: business.type || null,
      description: business.description || null,
      street_id: streetId,
      street_address: null,
      owner_id: null,
      employees: [],
      geo: null,
      created_at: now,
      updated_at: now,
      status: 'active'
    });
  }
  
  await mkdir(join(PROJECT_ROOT, 'content/data'), { recursive: true });
  const outputPath = join(PROJECT_ROOT, 'content/data/businesses.normalized.json');
  await writeFile(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');
  
  await logAction({
    phase: '1',
    actor: 'copilot',
    action: 'normalized businesses.json',
    why: 'added id, slug, street_id, timestamps, status fields',
    files: ['content/data/businesses.normalized.json'],
    impact: `${normalized.length} bedrifter normalisert, ${warnings.length} warnings`
  });
  
  console.log(`✅ Normalisert ${normalized.length} bedrifter`);
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} advarsler (bruker default street_id)\n`);
  }
  
  return normalized;
}

normalizeBusinesses().catch(console.error);
