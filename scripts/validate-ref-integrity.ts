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

interface ValidationReport {
  timestamp: string;
  valid: boolean;
  summary: {
    total_entities: number;
    total_relations: number;
    broken_relations: number;
    warnings: number;
  };
  entities: {
    streets: number;
    people: number;
    places: number;
    businesses: number;
  };
  broken_relations: Array<{
    entity_type: string;
    entity_id: string;
    entity_name: string;
    relation_field: string;
    target_id: string;
    reason: string;
  }>;
  warnings: string[];
}

async function validateReferentialIntegrity(): Promise<ValidationReport> {
  console.log('🔍 Validerer referential integrity...\n');
  
  const streets = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/streets.normalized.json'), 'utf-8'));
  const people = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/people.normalized.json'), 'utf-8'));
  const places = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/places.normalized.json'), 'utf-8'));
  const businesses = JSON.parse(await readFile(join(PROJECT_ROOT, 'content/data/businesses.normalized.json'), 'utf-8'));
  
  const streetIds = new Set(streets.map((s: any) => s.id));
  const peopleIds = new Set(people.map((p: any) => p.id));
  const placeIds = new Set(places.map((p: any) => p.id));
  const businessIds = new Set(businesses.map((b: any) => b.id));
  
  const brokenRelations: ValidationReport['broken_relations'] = [];
  const warnings: string[] = [];
  
  console.log('📊 Entiteter:');
  console.log(`   - ${streets.length} gater`);
  console.log(`   - ${people.length} personer`);
  console.log(`   - ${places.length} steder`);
  console.log(`   - ${businesses.length} bedrifter\n`);
  
  console.log('🔗 Sjekker relasjoner...\n');
  
  let relationsChecked = 0;
  
  for (const person of people) {
    relationsChecked++;
    if (!streetIds.has(person.street_id)) {
      warnings.push(`Person "${person.name}": street_id ${person.street_id} is orphan (street not in streets.json, needs manual review)`);
    }
    
    if (person.workplace_id && person.workplace_type === 'business') {
      relationsChecked++;
      if (!businessIds.has(person.workplace_id)) {
        brokenRelations.push({
          entity_type: 'person',
          entity_id: person.id,
          entity_name: person.name,
          relation_field: 'workplace_id',
          target_id: person.workplace_id,
          reason: 'workplace_id refererer til ikke-eksisterende bedrift'
        });
      }
    }
  }
  
  for (const business of businesses) {
    relationsChecked++;
    if (!streetIds.has(business.street_id)) {
      warnings.push(`Business "${business.name}": street_id ${business.street_id} is orphan (street not in streets.json, needs manual review)`);
    }
    
    if (business.owner_id) {
      relationsChecked++;
      if (!peopleIds.has(business.owner_id)) {
        brokenRelations.push({
          entity_type: 'business',
          entity_id: business.id,
          entity_name: business.name,
          relation_field: 'owner_id',
          target_id: business.owner_id,
          reason: 'owner_id refererer til ikke-eksisterende person'
        });
      }
    }
  }
  
  for (const place of places) {
    if (place.street_id) {
      relationsChecked++;
      if (!streetIds.has(place.street_id)) {
        brokenRelations.push({
          entity_type: 'place',
          entity_id: place.id,
          entity_name: place.name,
          relation_field: 'street_id',
          target_id: place.street_id,
          reason: 'street_id refererer til ikke-eksisterende gate'
        });
      }
    }
  }
  
  const totalEntities = streets.length + people.length + places.length + businesses.length;
  const valid = brokenRelations.length === 0;
  
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    valid,
    summary: {
      total_entities: totalEntities,
      total_relations: relationsChecked,
      broken_relations: brokenRelations.length,
      warnings: warnings.length
    },
    entities: {
      streets: streets.length,
      people: people.length,
      places: places.length,
      businesses: businesses.length
    },
    broken_relations: brokenRelations,
    warnings
  };
  
  await mkdir(join(PROJECT_ROOT, 'reports'), { recursive: true });
  const reportPath = join(PROJECT_ROOT, 'reports/ref-integrity.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  
  console.log('📋 RESULTAT:');
  console.log(`   - ${relationsChecked} relasjoner sjekket`);
  console.log(`   - ${brokenRelations.length} brutte relasjoner`);
  console.log(`   - ${warnings.length} advarsler\n`);
  
  if (valid) {
    console.log('✅ Referential integrity: OK!\n');
  } else {
    console.log('❌ Referential integrity: BRUDD FUNNET\n');
    console.log('Brutte relasjoner:');
    brokenRelations.slice(0, 10).forEach(br => {
      console.log(`   - ${br.entity_name} (${br.entity_type}): ${br.relation_field} → ${br.reason}`);
    });
    if (brokenRelations.length > 10) {
      console.log(`   ... og ${brokenRelations.length - 10} til\n`);
    }
  }
  
  console.log(`📄 Rapport lagret: reports/ref-integrity.json\n`);
  
  await logAction({
    phase: '1',
    actor: 'copilot',
    action: 'validated referential integrity',
    why: 'ensure all foreign keys are valid',
    files: ['reports/ref-integrity.json'],
    impact: `${relationsChecked} relasjoner sjekket, ${brokenRelations.length} brudd funnet`
  });
  
  return report;
}

validateReferentialIntegrity().catch(console.error);
