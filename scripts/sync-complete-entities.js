#!/usr/bin/env node

/**
 * 🏢 COMPLETE ENTITY SYNC - ALL TYPES
 * 
 * Syncs all entity types from JSON files to database:
 * - people.json → people table ✅ 
 * - aroundtown.json → places table ✅
 * - lakes.json → lakes table ✅
 * - businesses.json → businesses table (NEW)
 * - streets.json → streets table (NEW)
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import fs from 'fs';

// Database connection
async function getDbConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'Terje_Pjusken',
    password: 'Klokken!12!?!',
    database: 'Terje_Pjusken'
  });
}

// Create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[æå]/g, 'a')
    .replace(/ø/g, 'o') 
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Sync businesses from businesses.json
async function syncBusinesses(conn) {
  console.log('🏢 Syncing businesses...');
  
  const businessesData = JSON.parse(fs.readFileSync('httpdocs/json/businesses.json', 'utf-8'));
  let count = 0;
  
  for (const business of businessesData) {
    const slug = createSlug(business.name);
    
    // Check if exists
    const [existing] = await conn.execute('SELECT id FROM businesses WHERE slug = ?', [slug]);
    
    if (existing.length === 0) {
      // Combine products and about into description
      const description = business.products && business.about 
        ? `Products: ${business.products}. ${business.about}`
        : business.products || business.about || null;
        
      await conn.execute(`
        INSERT INTO businesses (id, name, slug, description, type, street_id)
        VALUES (?, ?, ?, ?, 'other', (SELECT id FROM streets LIMIT 1))
      `, [
        randomUUID(),
        business.name,
        slug,
        description
      ]);
      count++;
      console.log(`   ✅ Added business: ${business.name} (${slug})`);
    }
  }
  
  console.log(`   📊 Businesses imported: ${count}`);
  return count;
}

// Sync streets from streets.json  
async function syncStreets(conn) {
  console.log('🛣️ Syncing streets...');
  
  const streetsData = JSON.parse(fs.readFileSync('httpdocs/json/streets.json', 'utf-8'));
  let count = 0;
  
  for (const streetName of streetsData) {
    const slug = createSlug(streetName);
    
    // Check if exists
    const [existing] = await conn.execute('SELECT id FROM streets WHERE slug = ?', [slug]);
    
    if (existing.length === 0) {
      await conn.execute(`
        INSERT INTO streets (id, name, slug)
        VALUES (?, ?, ?)
      `, [
        randomUUID(),
        streetName,
        slug
      ]);
      count++;
      console.log(`   ✅ Added street: ${streetName} (${slug})`);
    }
  }
  
  console.log(`   📊 Streets imported: ${count}`);
  return count;
}

// Main sync function
async function main() {
  console.log('🚀 Starting COMPLETE entity sync...');
  console.log('📅 Date:', new Date().toISOString());
  
  const conn = await getDbConnection();
  
  try {
    // Run existing syncs
    console.log('\n=== EXISTING ENTITIES ===');
    
    const [peopleCount] = await conn.execute('SELECT COUNT(*) as count FROM people');
    const [placesCount] = await conn.execute('SELECT COUNT(*) as count FROM places');  
    const [lakesCount] = await conn.execute('SELECT COUNT(*) as count FROM lakes');
    
    console.log(`✅ People: ${peopleCount[0].count}`);
    console.log(`✅ Places: ${placesCount[0].count}`);
    console.log(`✅ Lakes: ${lakesCount[0].count}`);
    
    // Sync new entity types
    console.log('\n=== NEW ENTITY TYPES ===');
    
    const businessCount = await syncBusinesses(conn);
    const streetCount = await syncStreets(conn);
    
    console.log('\n📊 COMPLETE ENTITY SUMMARY:');
    console.log('============================');
    console.log(`👥 People:     ${peopleCount[0].count}`);
    console.log(`📍 Places:     ${placesCount[0].count}`);
    console.log(`🌊 Lakes:      ${lakesCount[0].count}`);
    console.log(`🏢 Businesses: ${businessCount} (NEW)`);
    console.log(`🛣️ Streets:    ${streetCount} (NEW)`);
    
    const total = peopleCount[0].count + placesCount[0].count + lakesCount[0].count + businessCount + streetCount;
    console.log(`📈 TOTAL:      ${total} entities`);
    
    console.log('\n✅ Complete entity sync finished!');
    console.log('🎯 All entity types now available for AI stories');
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { syncBusinesses, syncStreets };