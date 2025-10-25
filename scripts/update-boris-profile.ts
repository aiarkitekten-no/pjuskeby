#!/usr/bin/env node

// Use node with dynamic import instead of tsx
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { readFileSync } = require('fs');

dotenv.config();

const enhancedProfile = JSON.parse(
  readFileSync('/tmp/boris-enhanced-profile.json', 'utf-8')
);

async function updateBorisProfile() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Terje_Pjusken',
    password: process.env.DB_PASS || 'Klokken!12!?!',
    database: process.env.DB_NAME || 'Terje_Pjusken',
  });

  try {
    console.log('📊 Updating Boris Blundercheek profile in database...\n');

    // First, get the street_id for Wobblekollen Lane
    const [streets] = await connection.execute(
      'SELECT id FROM streets WHERE name = ?',
      ['Wobblekollen Lane']
    ) as any;

    let streetId = null;
    if (streets.length > 0) {
      streetId = streets[0].id;
      console.log('✅ Found Wobblekollen Lane street_id:', streetId);
    } else {
      console.log('⚠️  Wobblekollen Lane not found, will use current street_id');
    }

    // Get The Institute of Oops business (or create it if needed)
    let [businesses] = await connection.execute(
      'SELECT id FROM businesses WHERE name = ?',
      ['The Institute of Oops']
    ) as any;

    let workplaceId = null;
    if (businesses.length > 0) {
      workplaceId = businesses[0].id;
      console.log('✅ Found The Institute of Oops business_id:', workplaceId);
    } else {
      // Create The Institute of Oops business
      const { v4: uuidv4 } = await import('uuid');
      workplaceId = uuidv4();
      
      await connection.execute(
        `INSERT INTO businesses (id, name, slug, created_at, updated_at) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [workplaceId, 'The Institute of Oops', 'the-institute-of-oops']
      );
      console.log('✅ Created The Institute of Oops business');
    }

    // Update the person record
    const updateQuery = `
      UPDATE people 
      SET 
        bio = ?,
        age = ?,
        hobbies = ?,
        ${streetId ? 'street_id = ?,' : ''}
        workplace_id = ?,
        workplace_type = ?,
        updated_at = NOW()
      WHERE slug = 'boris-blundercheek'
    `;

    const hobbyJson = JSON.stringify(enhancedProfile.favorites.activities);
    
    const params = [
      enhancedProfile.bio,
      enhancedProfile.age,
      hobbyJson,
    ];

    if (streetId) {
      params.push(streetId);
    }

    params.push(workplaceId, 'business');

    await connection.execute(updateQuery, params);

    console.log('✅ Updated Boris Blundercheek person record\n');

    // Display the updated profile
    const [updated] = await connection.execute(
      `SELECT p.*, s.name as street_name, b.name as workplace_name 
       FROM people p 
       LEFT JOIN streets s ON p.street_id = s.id 
       LEFT JOIN businesses b ON p.workplace_id = b.id 
       WHERE p.slug = 'boris-blundercheek'`
    ) as any;

    console.log('📋 Updated Profile:');
    console.log('==================');
    console.log('Name:', updated[0].name);
    console.log('Age:', updated[0].age);
    console.log('Bio:', updated[0].bio.substring(0, 100) + '...');
    console.log('Address:', updated[0].street_name || 'Not set');
    console.log('Workplace:', updated[0].workplace_name || 'Not set');
    console.log('Hobbies:', updated[0].hobbies);
    console.log('\n✅ Profile update complete!');

    console.log('\n📝 Enhanced Profile Data (stored in /tmp/boris-enhanced-profile.json):');
    console.log('- Personality traits and quirks');
    console.log('- Work history (3 positions)');
    console.log('- Relationships (friends, rivals)');
    console.log('- Skills and fun facts');
    console.log('- Full appearance description');
    console.log('\nThis data can be used for:');
    console.log('• API responses');
    console.log('• Extended profile pages');
    console.log('• Story generation context');
    console.log('• Character consistency');

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

updateBorisProfile().catch(console.error);
