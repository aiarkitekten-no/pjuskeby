#!/usr/bin/env node
/**
 * Database migration: Add gender column to people table
 * Run: node scripts/db-add-gender-column.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
  console.log('🔄 Starting migration: Add gender column to people table\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Terje_Pjusken',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'Terje_Pjusken'
  });
  
  try {
    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM people LIKE 'gender'"
    );
    
    if (columns.length > 0) {
      console.log('✅ Column "gender" already exists in people table');
      await connection.end();
      return;
    }
    
    // Add gender column
    console.log('📝 Adding gender column...');
    await connection.query(`
      ALTER TABLE people 
      ADD COLUMN gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown' 
      AFTER age
    `);
    
    console.log('✅ Column added successfully!\n');
    
    // Auto-detect gender for existing people based on name
    console.log('🤖 Auto-detecting gender for existing people...\n');
    
    const [people] = await connection.query('SELECT id, name FROM people');
    
    let maleCount = 0;
    let femaleCount = 0;
    
    for (const person of people) {
      const gender = detectGender(person.name);
      await connection.query(
        'UPDATE people SET gender = ? WHERE id = ?',
        [gender, person.id]
      );
      
      if (gender === 'male') maleCount++;
      if (gender === 'female') femaleCount++;
      
      console.log(`  • ${person.name}: ${gender}`);
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`   • Male: ${maleCount}`);
    console.log(`   • Female: ${femaleCount}`);
    console.log(`   • Total: ${people.length}\n`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Gender detection logic (same as in generate-biography.mjs)
function detectGender(name) {
  const femaleEndings = ['a', 'ie', 'y', 'een', 'ina', 'etta', 'elle'];
  const maleNames = ['boris', 'nigel', 'harold', 'bertram', 'winston', 'mortimer'];
  const femaleNames = ['milly', 'franny', 'dotty', 'agnes', 'bertha', 'gladys'];
  
  const firstName = name.toLowerCase().split(' ')[0];
  
  if (femaleNames.some(n => firstName.includes(n))) return 'female';
  if (maleNames.some(n => firstName.includes(n))) return 'male';
  
  // Check name endings
  for (const ending of femaleEndings) {
    if (firstName.endsWith(ending)) return 'female';
  }
  
  return 'male'; // Default
}

migrate();
