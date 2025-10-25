#!/usr/bin/env tsx
/**
 * Sync Entity Mentions from MDX Content to Database
 * 
 * This script processes all published stories in src/content/stories/
 * and creates entity mention records in the database based on the
 * frontmatter metadata (characters, locations, etc.)
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
config();

interface StoryFrontmatter {
  title: string;
  published: boolean;
  characters?: string[];
  locations?: string[];
  businesses?: string[];
  streets?: string[];
  date: string;
}

// Simple frontmatter parser
function parseFrontmatter(content: string): { data: any; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content };
  }
  
  const [, frontmatterStr, bodyContent] = match;
  const data: any = {};
  
  // Parse YAML-like frontmatter
  const lines = frontmatterStr.split('\n');
  let currentKey = '';
  let inArray = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('- ')) {
      // Array item
      if (inArray && currentKey) {
        const value = trimmed.substring(2).replace(/^["']|["']$/g, '');
        if (!Array.isArray(data[currentKey])) {
          data[currentKey] = [];
        }
        data[currentKey].push(value);
      }
    } else if (trimmed.includes(':')) {
      // Key-value pair
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      
      currentKey = key;
      
      if (value === '') {
        // Empty value, might be followed by array
        inArray = true;
        data[key] = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        inArray = false;
        const arrayStr = value.substring(1, value.length - 1);
        data[key] = arrayStr.split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        // Regular value
        inArray = false;
        data[key] = value.replace(/^["']|["']$/g, '');
        
        // Parse booleans
        if (data[key] === 'true') data[key] = true;
        if (data[key] === 'false') data[key] = false;
      }
    }
  }
  
  return { data, content: bodyContent };
}

async function getEntitySlugByName(conn: mysql.Connection, entityType: 'person' | 'place' | 'business' | 'street', name: string): Promise<string | null> {
  try {
    let tableName: string;
    
    switch (entityType) {
      case 'person':
        tableName = 'people';
        break;
      case 'place':
        tableName = 'places';
        break;
      case 'business':
        tableName = 'businesses';
        break;
      case 'street':
        tableName = 'streets';
        break;
    }
    
    const [rows] = await conn.execute(`SELECT slug FROM ${tableName} WHERE name = ? LIMIT 1`, [name]) as any;
    
    if (rows && rows.length > 0) {
      return rows[0].slug;
    }
    
    console.warn(`⚠️  Entity not found in DB: ${entityType} "${name}"`);
    return null;
  } catch (error) {
    console.error(`Error looking up ${entityType} "${name}":`, error);
    return null;
  }
}

async function processStory(conn: mysql.Connection, filePath: string, filename: string) {
  const content = await readFile(filePath, 'utf-8');
  const { data: frontmatter, content: bodyContent } = parseFrontmatter(content);
  const fm = frontmatter as StoryFrontmatter;
  
  // Only process published stories
  if (!fm.published) {
    console.log(`⏭️  Skipping unpublished story: ${filename}`);
    return { processed: false, mentions: 0 };
  }
  
  const storySlug = filename.replace('.mdx', '');
  console.log(`\n📖 Processing story: ${fm.title} (${storySlug})`);
  
  // Delete existing mentions for this story
  await conn.execute(`DELETE FROM entity_mentions WHERE story_slug = ?`, [storySlug]);
  console.log(`   🗑️  Cleared old mentions`);
  
  let mentionsCreated = 0;
  
  // Process characters (people)
  if (fm.characters && Array.isArray(fm.characters)) {
    for (const characterName of fm.characters) {
      const slug = await getEntitySlugByName(conn, 'person', characterName);
      if (slug) {
        // Find context in content
        const lowerContent = bodyContent.toLowerCase();
        const index = lowerContent.indexOf(characterName.toLowerCase());
        const context = index !== -1 
          ? bodyContent.substring(Math.max(0, index - 50), Math.min(bodyContent.length, index + characterName.length + 50))
          : `Mentioned in ${fm.title}`;
        
        const mentionId = `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await conn.execute(
          `INSERT INTO entity_mentions (id, story_slug, entity_type, entity_id, entity_slug, entity_name, mention_context) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [mentionId, storySlug, 'person', slug, slug, characterName, context.trim()]
        );
        
        mentionsCreated++;
        console.log(`   ✅ Added person mention: ${characterName} (${slug})`);
      }
    }
  }
  
  // Process locations (places)
  if (fm.locations && Array.isArray(fm.locations)) {
    for (const locationName of fm.locations) {
      const slug = await getEntitySlugByName(conn, 'place', locationName);
      if (slug) {
        // Find context in content
        const lowerContent = bodyContent.toLowerCase();
        const index = lowerContent.indexOf(locationName.toLowerCase());
        const context = index !== -1 
          ? bodyContent.substring(Math.max(0, index - 50), Math.min(bodyContent.length, index + locationName.length + 50))
          : `Mentioned in ${fm.title}`;
        
        const mentionId = `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await conn.execute(
          `INSERT INTO entity_mentions (id, story_slug, entity_type, entity_id, entity_slug, entity_name, mention_context) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [mentionId, storySlug, 'place', slug, slug, locationName, context.trim()]
        );
        
        mentionsCreated++;
        console.log(`   ✅ Added place mention: ${locationName} (${slug})`);
      }
    }
  }
  
  // Process businesses
  if (fm.businesses && Array.isArray(fm.businesses)) {
    for (const businessName of fm.businesses) {
      const slug = await getEntitySlugByName(conn, 'business', businessName);
      if (slug) {
        const lowerContent = bodyContent.toLowerCase();
        const index = lowerContent.indexOf(businessName.toLowerCase());
        const context = index !== -1 
          ? bodyContent.substring(Math.max(0, index - 50), Math.min(bodyContent.length, index + businessName.length + 50))
          : `Mentioned in ${fm.title}`;
        
        const mentionId = `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await conn.execute(
          `INSERT INTO entity_mentions (id, story_slug, entity_type, entity_id, entity_slug, entity_name, mention_context) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [mentionId, storySlug, 'business', slug, slug, businessName, context.trim()]
        );
        
        mentionsCreated++;
        console.log(`   ✅ Added business mention: ${businessName} (${slug})`);
      }
    }
  }
  
  // Process streets
  if (fm.streets && Array.isArray(fm.streets)) {
    for (const streetName of fm.streets) {
      const slug = await getEntitySlugByName(conn, 'street', streetName);
      if (slug) {
        const lowerContent = bodyContent.toLowerCase();
        const index = lowerContent.indexOf(streetName.toLowerCase());
        const context = index !== -1 
          ? bodyContent.substring(Math.max(0, index - 50), Math.min(bodyContent.length, index + streetName.length + 50))
          : `Mentioned in ${fm.title}`;
        
        const mentionId = `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await conn.execute(
          `INSERT INTO entity_mentions (id, story_slug, entity_type, entity_id, entity_slug, entity_name, mention_context) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [mentionId, storySlug, 'street', slug, slug, streetName, context.trim()]
        );
        
        mentionsCreated++;
        console.log(`   ✅ Added street mention: ${streetName} (${slug})`);
      }
    }
  }
  
  console.log(`   📊 Total mentions created: ${mentionsCreated}`);
  
  return { processed: true, mentions: mentionsCreated };
}

async function main() {
  console.log('🔄 Syncing entity mentions from MDX stories to database...\n');
  
  // Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: (process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '') as string,
    database: process.env.DB_NAME || 'pjuskeby'
  });
  
  const storiesDir = join(process.cwd(), 'src/content/stories');
  const files = await readdir(storiesDir);
  const mdxFiles = files.filter(f => f.endsWith('.mdx'));
  
  console.log(`📚 Found ${mdxFiles.length} story files\n`);
  
  let processedCount = 0;
  let totalMentions = 0;
  
  for (const file of mdxFiles) {
    const filePath = join(storiesDir, file);
    const result = await processStory(connection, filePath, file);
    
    if (result.processed) {
      processedCount++;
      totalMentions += result.mentions;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Sync complete!`);
  console.log(`   Stories processed: ${processedCount}/${mdxFiles.length}`);
  console.log(`   Entity mentions created: ${totalMentions}`);
  console.log('='.repeat(60) + '\n');
  
  await connection.end();
}

main().catch(error => {
  console.error('❌ Error syncing entity mentions:', error);
  process.exit(1);
});
