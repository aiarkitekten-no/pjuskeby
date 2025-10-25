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

interface BaselinePlace {
  name: string;
  description?: string;
  type?: string;
  [key: string]: any;
}

interface NormalizedPlace {
  id: string;
  slug: string;
  name: string;
  category: 'residential' | 'commercial' | 'public' | 'nature' | 'historic' | 'fictional';
  description: string | null;
  street_id: string | null;
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

function categorizePlace(place: BaselinePlace): 'residential' | 'commercial' | 'public' | 'nature' | 'historic' | 'fictional' {
  const name = place.name.toLowerCase();
  const desc = (place.description || '').toLowerCase();
  const type = (place.type || '').toLowerCase();
  
  if (type.includes('shop') || type.includes('café') || type.includes('restaurant')) return 'commercial';
  if (type.includes('park') || type.includes('forest') || type.includes('lake')) return 'nature';
  if (type.includes('library') || type.includes('school') || type.includes('museum')) return 'public';
  if (type.includes('historic')) return 'historic';
  if (name.includes('house') || name.includes('home')) return 'residential';
  
  return 'fictional';
}

async function normalizePlaces() {
  console.log('🔄 Normaliserer placespjuskeby.json...\n');
  
  // Load baseline
  const placesBaseline = JSON.parse(
    await readFile(join(PROJECT_ROOT, 'content/data/placespjuskeby.json'), 'utf-8')
  ) as BaselinePlace[];  const normalized: NormalizedPlace[] = [];
  const now = new Date().toISOString();
  
  for (const place of placesBaseline) {
    normalized.push({
      id: randomUUID(),
      slug: slugify(place.name),
      name: place.name,
      category: categorizePlace(place),
      description: place.description || null,
      street_id: null,
      geo: null,
      created_at: now,
      updated_at: now,
      status: 'active'
    });
  }
  
  await mkdir(join(PROJECT_ROOT, 'content/data'), { recursive: true });
  const outputPath = join(PROJECT_ROOT, 'content/data/places.normalized.json');
  await writeFile(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');
  
  await logAction({
    phase: '1',
    actor: 'copilot',
    action: 'normalized placespjuskeby.json',
    why: 'added id, slug, category, timestamps, status fields',
    files: ['content/data/places.normalized.json'],
    impact: `${normalized.length} steder normalisert`
  });
  
  console.log(`✅ Normalisert ${normalized.length} steder\n`);
  return normalized;
}

normalizePlaces().catch(console.error);
