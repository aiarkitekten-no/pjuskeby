/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logAction } from './lib/log-action';

const PROJECT_ROOT = '/var/www/vhosts/pjuskeby.org';

async function normalizeAll() {
  console.log('🚀 Kjører full normalisering av alle baseline-filer...\n');
  console.log('=' .repeat(60) + '\n');
  
  const results = {
    streets: 0,
    people: 0,
    places: 0,
    businesses: 0
  };
  
  try {
    console.log('1️⃣  STREETS');
    await import('./normalize-streets.js');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('2️⃣  PEOPLE');
    await import('./normalize-people.js');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('3️⃣  PLACES');
    await import('./normalize-places.js');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('4️⃣  BUSINESSES');
    await import('./normalize-businesses.js');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ NORMALISERING FULLFØRT!\n');
    
    const streetData = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/streets.normalized.json'), 'utf-8'));
    const peopleData = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/people.normalized.json'), 'utf-8'));
    const placesData = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/places.normalized.json'), 'utf-8'));
    const businessData = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/businesses.normalized.json'), 'utf-8'));
    
    console.log('📊 OPPSUMMERING:');
    console.log(`   - ${streetData.length} gater`);
    console.log(`   - ${peopleData.length} personer`);
    console.log(`   - ${placesData.length} steder`);
    console.log(`   - ${businessData.length} bedrifter`);
    console.log(`   - TOTALT: ${streetData.length + peopleData.length + placesData.length + businessData.length} entiteter\n`);
    
    await logAction({
      phase: '1',
      actor: 'copilot',
      action: 'completed full normalization',
      why: 'all baseline files normalized with UUIDs, slugs, timestamps',
      files: [
        'content/data/streets.normalized.json',
        'content/data/people.normalized.json',
        'content/data/places.normalized.json',
        'content/data/businesses.normalized.json'
      ],
      impact: `${streetData.length + peopleData.length + placesData.length + businessData.length} entiteter totalt`
    });
    
  } catch (error) {
    console.error('\n❌ FEIL under normalisering:', error);
    process.exit(1);
  }
}

normalizeAll();
