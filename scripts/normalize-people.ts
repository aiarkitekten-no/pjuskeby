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

interface BaselinePerson {
  name: string;
  bio: string;
  street: string;
  age: number;
  hobbies: string[];
  workplace: string;
}

interface NormalizedPerson {
  id: string;
  slug: string;
  name: string;
  age: number;
  occupation: string | null;
  street_id: string;
  street_address: string | null;
  workplace_type: 'organization' | 'business' | null;
  workplace_id: string | null;
  traits: string[];
  bio: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'archived';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractOccupation(workplace: string): string | null {
  if (!workplace || workplace === 'N/A' || workplace === '') return null;
  return workplace;
}

async function loadStreets(): Promise<Map<string, { id: string; slug: string; name: string }>> {
  const streetsPath = join(PROJECT_ROOT, 'content/data/streets.json');
  const streets = JSON.parse(await readFile(streetsPath, 'utf-8')) as string[];
  
  const streetMap = new Map<string, { id: string; slug: string; name: string }>();
  
  for (const street of streets) {
    const id = randomUUID();
    const slug = slugify(street);
    const name = street;
    
    streetMap.set(name.toLowerCase(), { id, slug, name });
  }
  
  return streetMap;
}

async function normalizePeople() {
  console.log('🔄 Normalizer people.json...\n');
  
  // Load baseline
  const peopleBaseline = JSON.parse(
    await readFile(join(PROJECT_ROOT, 'content/data/people.json'), 'utf-8')
  ) as BaselinePerson[];
  
  // Load streets for mapping
  const streetMap = await loadStreets();
  
  const normalized: NormalizedPerson[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const now = new Date().toISOString();
  
  for (const person of peopleBaseline) {
    const slug = slugify(person.name);
    
    // Find street_id - try exact match first, then fuzzy
    const streetKey = person.street.toLowerCase();
    let street = streetMap.get(streetKey);
    
    if (!street) {
      // Fuzzy match: find closest street name
      const allStreets = Array.from(streetMap.keys());
      const closest = allStreets.find(s => {
        return s.includes(streetKey.split(' ')[0]) || streetKey.includes(s.split(' ')[0]);
      });
      
      if (closest) {
        street = streetMap.get(closest)!;
        warnings.push(`Person "${person.name}": mapped "${person.street}" → "${street.name}"`);
      }
    }
    
    if (!street) {
      // Create temporary street for this person (will need manual review)
      const tempId = randomUUID();
      street = {
        id: tempId,
        slug: slugify(person.street),
        name: person.street
      };
      streetMap.set(person.street.toLowerCase(), street);
      warnings.push(`Person "${person.name}": street "${person.street}" not found in streets.json (orphan ID: ${tempId}, needs review)`);
    }
    
    normalized.push({
      id: randomUUID(),
      slug,
      name: person.name,
      age: person.age,
      occupation: extractOccupation(person.workplace),
      street_id: street.id,
      street_address: null,
      workplace_type: null,
      workplace_id: null,
      traits: person.hobbies || [],
      bio: person.bio,
      created_at: now,
      updated_at: now,
      status: 'active'
    });
  }
  
  // Write normalized data
  await mkdir(join(PROJECT_ROOT, 'content/data'), { recursive: true });
  const outputPath = join(PROJECT_ROOT, 'content/data/people.normalized.json');
  await writeFile(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');
  
  // Log action
  await logAction({
    phase: '1',
    actor: 'copilot',
    action: 'normalized people.json',
    why: 'added id, slug, street_id, timestamps, status fields',
    files: ['content/data/people.normalized.json'],
    impact: `${normalized.length} personer normalisert, ${errors.length} feil, ${warnings.length} warnings`
  });
  
  // Report
  console.log(`✅ Normalisert ${normalized.length} personer`);
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} advarsler:`);
    warnings.slice(0, 10).forEach(warn => console.log(`  - ${warn}`));
    if (warnings.length > 10) console.log(`  ... og ${warnings.length - 10} til`);
  }
  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} feil:`);
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  return { normalized, errors, warnings };
}

normalizePeople().catch(console.error);
