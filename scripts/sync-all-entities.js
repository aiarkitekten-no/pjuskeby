#!/usr/bin/env node

/**
 * 🤖 AI-DRIVEN ENTITY SYNC SYSTEM
 * 
 * Synkroniserar ALL entities från JSON-filer til database
 * för att stödja AI-genererat content och cross-references
 * 
 * ALTERNATIV 1: MDX som Source of Truth
 * MDX Stories → Database sync för relationships
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

// Database connection
async function getDbConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'Terje_Pjusken',
    password: 'Klokken!12!?!',
    database: 'Terje_Pjusken'
  });
}

// Utility: Create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[æå]/g, 'a')
    .replace(/ø/g, 'o') 
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Import people from JSON
async function syncPeople(conn) {
  console.log('👥 Syncing people...');
  
  const peopleJson = JSON.parse(fs.readFileSync('httpdocs/json/people.json', 'utf-8'));
  let imported = 0;
  let skipped = 0;

  // Get default street for required field
  const [streets] = await conn.execute('SELECT id FROM streets LIMIT 1');
  const defaultStreetId = streets[0]?.id;

  if (!defaultStreetId) {
    console.log('⚠️  No streets found, creating default street...');
    const streetId = randomUUID();
    await conn.execute(
      'INSERT INTO streets (id, name, slug) VALUES (?, ?, ?)',
      [streetId, 'Hovedgata', 'hovedgata']
    );
  }

  for (const person of peopleJson) {
    const slug = createSlug(person.name);
    
    // Check if exists
    const [existing] = await conn.execute('SELECT id FROM people WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await conn.execute(`
      INSERT INTO people (id, name, slug, bio, street_id)
      VALUES (?, ?, ?, ?, ?)
    `, [
      randomUUID(),
      person.name,
      slug,
      person.description || `Resident of Pjuskeby known for ${person.name}.`,
      defaultStreetId || streets[0].id
    ]);
    
    imported++;
  }

  console.log(`   ✅ Imported ${imported} people, skipped ${skipped}`);
  return { imported, skipped };
}

// Import places from JSON files
async function syncPlaces(conn) {
  console.log('🏢 Syncing places...');
  
  let imported = 0;
  let skipped = 0;

  // Import from aroundtown.json (landmarks/places)
  const placesJson = JSON.parse(fs.readFileSync('httpdocs/json/aroundtown.json', 'utf-8'));
  
  for (const place of placesJson) {
    const slug = createSlug(place.name);
    
    // Check if exists
    const [existing] = await conn.execute('SELECT id FROM places WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await conn.execute(`
      INSERT INTO places (id, name, slug, category, description)
      VALUES (?, ?, ?, ?, ?)
    `, [
      randomUUID(),
      place.name,
      slug,
      place.type || 'landmark',
      place.description || `A notable location in Pjuskeby.`
    ]);
    
    imported++;
  }

  // Also import from placespjuskeby.json if different
  try {
    const moreplacesJson = JSON.parse(fs.readFileSync('httpdocs/json/placespjuskeby.json', 'utf-8'));
    for (const place of moreplacesJson) {
      const slug = createSlug(place.name);
      
      const [existing] = await conn.execute('SELECT id FROM places WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await conn.execute(`
        INSERT INTO places (id, name, slug, category, description)
        VALUES (?, ?, ?, ?, ?)
      `, [
        randomUUID(),
        place.name,
        slug,
        'landmark',
        place.description || `A location in Pjuskeby.`
      ]);
      
      imported++;
    }
  } catch (e) {
    console.log('   ⚠️  placespjuskeby.json not found or invalid');
  }

  console.log(`   ✅ Imported ${imported} places, skipped ${skipped}`);
  return { imported, skipped };
}

// Import businesses from JSON
async function syncBusinesses(conn) {
  console.log('🏪 Syncing businesses...');
  
  let imported = 0;
  let skipped = 0;

  try {
    const businessesJson = JSON.parse(fs.readFileSync('httpdocs/json/businesses.json', 'utf-8'));
    
    for (const business of businessesJson) {
      const slug = createSlug(business.name);
      
      // Check if exists
      const [existing] = await conn.execute('SELECT id FROM businesses WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await conn.execute(`
        INSERT INTO businesses (id, name, slug, category, description)
        VALUES (?, ?, ?, ?, ?)
      `, [
        randomUUID(),
        business.name,
        slug,
        business.category || 'general',
        business.description || `A business in Pjuskeby.`
      ]);
      
      imported++;
    }
  } catch (e) {
    console.log('   ⚠️  businesses.json not found or invalid');
  }

  console.log(`   ✅ Imported ${imported} businesses, skipped ${skipped}`);
  return { imported, skipped };
}

// Import streets from JSON
async function syncStreets(conn) {
  console.log('🛣️  Syncing streets...');
  
  let imported = 0;
  let skipped = 0;

  try {
    const streetsJson = JSON.parse(fs.readFileSync('httpdocs/json/streets.json', 'utf-8'));
    
    for (const street of streetsJson) {
      const slug = createSlug(street.name);
      
      // Check if exists
      const [existing] = await conn.execute('SELECT id FROM streets WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await conn.execute(`
        INSERT INTO streets (id, name, slug, description)
        VALUES (?, ?, ?, ?)
      `, [
        randomUUID(),
        street.name,
        slug,
        street.description || `A street in Pjuskeby.`
      ]);
      
      imported++;
    }
  } catch (e) {
    console.log('   ⚠️  streets.json not found or invalid');
  }

  console.log(`   ✅ Imported ${imported} streets, skipped ${skipped}`);
  return { imported, skipped };
}

// Import lakes from JSON  
async function syncLakes(conn) {
  console.log('🌊 Syncing lakes...');
  
  let imported = 0;
  let skipped = 0;

  try {
    const lakesJson = JSON.parse(fs.readFileSync('httpdocs/json/lakes.json', 'utf-8'));
    
    for (const lake of lakesJson) {
      const slug = createSlug(lake.name);
      
      // Check if exists
      const [existing] = await conn.execute('SELECT id FROM lakes WHERE slug = ?', [slug]);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await conn.execute(`
        INSERT INTO lakes (id, name, slug, description)
        VALUES (?, ?, ?, ?)
      `, [
        randomUUID(),
        lake.name,
        slug,
        lake.description || `A lake in Pjuskeby.`
      ]);
      
      imported++;
    }
  } catch (e) {
    console.log('   ⚠️  lakes.json not found or invalid');
  }

  console.log(`   ✅ Imported ${imported} lakes, skipped ${skipped}`);
  return { imported, skipped };
}

// Main sync function
async function syncAllEntities() {
  console.log('🚀 Starting complete entity sync...');
  console.log('📅 Date:', new Date().toISOString());
  console.log();

  const conn = await getDbConnection();
  const results = {};

  try {
    // Sync all entity types
    results.people = await syncPeople(conn);
    results.places = await syncPlaces(conn);
    results.businesses = await syncBusinesses(conn);
    results.streets = await syncStreets(conn);
    results.lakes = await syncLakes(conn);

    // Summary
    console.log();
    console.log('📊 SYNC SUMMARY:');
    console.log('================');
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    Object.entries(results).forEach(([type, stats]) => {
      console.log(`${type.padEnd(12)}: ${stats.imported.toString().padStart(3)} imported, ${stats.skipped.toString().padStart(3)} skipped`);
      totalImported += stats.imported;
      totalSkipped += stats.skipped;
    });
    
    console.log('----------------');
    console.log(`${'TOTAL'.padEnd(12)}: ${totalImported.toString().padStart(3)} imported, ${totalSkipped.toString().padStart(3)} skipped`);
    
    // Current database counts
    console.log();
    console.log('🗄️  CURRENT DATABASE COUNTS:');
    const [counts] = await conn.execute(`
      SELECT 'people' as table_name, COUNT(*) as count FROM people
      UNION ALL SELECT 'places', COUNT(*) FROM places  
      UNION ALL SELECT 'businesses', COUNT(*) FROM businesses
      UNION ALL SELECT 'streets', COUNT(*) FROM streets
      UNION ALL SELECT 'lakes', COUNT(*) FROM lakes
      UNION ALL SELECT 'stories', COUNT(*) FROM stories
    `);
    
    counts.forEach(row => {
      console.log(`${row.table_name.padEnd(12)}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  } finally {
    await conn.end();
  }

  console.log();
  console.log('✅ Entity sync complete!');
  console.log('🎯 Ready for AI content generation and cross-references');
  
  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAllEntities().catch(console.error);
}

export { syncAllEntities };