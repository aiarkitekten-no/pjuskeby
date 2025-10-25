#!/usr/bin/env node

/**
 * 🤖 MDX STORY SYNC - AI WORKFLOW INTEGRATION
 * 
 * ALTERNATIV 1: MDX som Source of Truth
 * 
 * Workflow:
 * 1. AI genererar stories → MDX files i drafts/
 * 2. Approval → copy till src/content/stories/ 
 * 3. Auto-sync → Database + Entity extraction
 * 4. Build → Cross-references active
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

// Parse MDX frontmatter manually
function parseFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return { frontmatter: {}, body: content };
  
  const frontmatterText = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length).trim();
  
  const frontmatter = {};
  
  // Parse YAML-like frontmatter
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let inArray = false;
  let arrayItems = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Handle arrays
    if (inArray) {
      if (trimmedLine.startsWith('- ')) {
        const item = trimmedLine.slice(2).replace(/["']/g, '');
        arrayItems.push(item);
        continue;
      } else {
        // End of array
        frontmatter[currentKey] = arrayItems;
        inArray = false;
        arrayItems = [];
        currentKey = null;
      }
    }
    
    // Key: value pairs
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.slice(0, colonIndex).trim();
      let value = trimmedLine.slice(colonIndex + 1).trim();
      
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
      
      // Check if this starts an array
      if (value === '' && lines[lines.indexOf(line) + 1]?.trim().startsWith('- ')) {
        currentKey = key;
        inArray = true;
        arrayItems = [];
        continue;
      }
      
      // Parse inline JSON arrays like ["Item1", "Item2"]
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
          console.log(`🎯 Parsed array for ${key}:`, value);
        } catch (e) {
          console.warn(`⚠️ Failed to parse array for ${key}:`, value);
          // Keep as string if JSON parse fails
        }
      }
      // Handle different value types
      else if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) value = new Date(value);
      
      frontmatter[key] = value;
    }
  }
  
  // Handle final array if we ended in one
  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayItems;
  }
  
  return { frontmatter, body };
}

// Sync a single story from MDX to database
async function syncStoryToDatabase(conn, filePath) {
  const fileName = path.basename(filePath);
  const slug = path.basename(fileName, '.mdx');
  
  console.log(`📄 Processing: ${fileName}`);
  
  // Read and parse MDX
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  
  // Check if story already exists
  const [existing] = await conn.execute('SELECT id FROM stories WHERE slug = ?', [slug]);
  
  const storyData = {
    id: existing.length > 0 ? existing[0].id : randomUUID(),
    slug: slug,
    title: frontmatter.title || slug,
    content: body,
    excerpt: frontmatter.summary || body.substring(0, 400).replace(/[*#]/g, '') + '...',
    featured_image_url: frontmatter.featuredImage || null,
    status: frontmatter.published ? 'published' : 'draft',
    published_at: frontmatter.date ? new Date(frontmatter.date).toISOString().slice(0, 19).replace('T', ' ') : null
  };
  
  if (existing.length > 0) {
    // Update existing
    await conn.execute(`
      UPDATE stories SET 
        title = ?, content = ?, excerpt = ?, 
        featured_image_url = ?, status = ?, published_at = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      storyData.title, storyData.content, storyData.excerpt,
      storyData.featured_image_url, storyData.status, storyData.published_at,
      storyData.id
    ]);
    console.log(`   ♻️  Updated story: ${storyData.title}`);
  } else {
    // Insert new
    await conn.execute(`
      INSERT INTO stories (id, slug, title, content, excerpt, featured_image_url, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      storyData.id, storyData.slug, storyData.title, storyData.content,
      storyData.excerpt, storyData.featured_image_url, storyData.status, storyData.published_at
    ]);
    console.log(`   ✅ Created story: ${storyData.title}`);
  }
  
  // Extract and sync entities from frontmatter
  await syncEntityMentions(conn, slug, frontmatter);
  
  return storyData;
}

// Extract entity mentions from story frontmatter and create database entries
async function syncEntityMentions(conn, storySlug, frontmatter) {
  const mentions = [];
  
  console.log(`🔍 Extracting entities for story: ${storySlug}`);
  console.log(`   Characters:`, frontmatter.characters);
  console.log(`   Locations:`, frontmatter.locations);
  
  // Process characters (people)
  if (frontmatter.characters && Array.isArray(frontmatter.characters)) {
    console.log(`   👥 Processing ${frontmatter.characters.length} characters...`);
    for (const characterName of frontmatter.characters) {
      const slug = createSlug(characterName);
      console.log(`      "${characterName}" → slug: "${slug}"`);
      
      // Find matching person in database
      const [person] = await conn.execute('SELECT id FROM people WHERE slug = ?', [slug]);
      if (person.length > 0) {
        mentions.push({
          entity_type: 'person',
          entity_id: person[0].id,
          entity_slug: slug,
          entity_name: characterName,
          mention_context: `Featured character in the story`
        });
      } else {
        console.log(`   ⚠️  Person not found in database: ${characterName} (${slug})`);
      }
    }
  }
  
  // Process locations (places)
  if (frontmatter.locations && Array.isArray(frontmatter.locations)) {
    console.log(`   📍 Processing ${frontmatter.locations.length} locations...`);
    for (const locationName of frontmatter.locations) {
      const slug = createSlug(locationName);
      console.log(`      "${locationName}" → slug: "${slug}"`);
      
      // Find matching place in database
      const [place] = await conn.execute('SELECT id FROM places WHERE slug = ?', [slug]);
      if (place.length > 0) {
        mentions.push({
          entity_type: 'place',
          entity_id: place[0].id,
          entity_slug: slug,
          entity_name: locationName,
          mention_context: `Featured location in the story`
        });
      } else {
        console.log(`   ⚠️  Place not found in database: ${locationName} (${slug})`);
      }
    }
  }
  
  // Clear existing mentions for this story
  await conn.execute('DELETE FROM entity_mentions WHERE story_slug = ?', [storySlug]);
  
  // Insert new mentions
  for (const mention of mentions) {
    await conn.execute(`
      INSERT INTO entity_mentions (id, story_slug, entity_type, entity_id, entity_slug, entity_name, mention_context)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      randomUUID(), storySlug, mention.entity_type, mention.entity_id,
      mention.entity_slug, mention.entity_name, mention.mention_context
    ]);
  }
  
  if (mentions.length > 0) {
    console.log(`   🔗 Created ${mentions.length} entity mentions`);
  }
  
  return mentions;
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

// Sync all MDX stories to database
async function syncMdxStories() {
  console.log('🚀 Starting MDX → Database sync...');
  console.log('📅 Date:', new Date().toISOString());
  console.log();
  
  const conn = await getDbConnection();
  const results = { created: 0, updated: 0, mentions: 0 };
  
  try {
    // Find all MDX files in src/content/stories
    const storiesDir = 'src/content/stories';
    if (!fs.existsSync(storiesDir)) {
      console.log(`❌ Stories directory not found: ${storiesDir}`);
      return results;
    }
    
    const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.mdx'));
    console.log(`📁 Found ${files.length} MDX files`);
    console.log();
    
    for (const file of files) {
      const filePath = path.join(storiesDir, file);
      
      // Check if exists before processing
      const slug = path.basename(file, '.mdx');
      const [existing] = await conn.execute('SELECT id FROM stories WHERE slug = ?', [slug]);
      
      await syncStoryToDatabase(conn, filePath);
      
      if (existing.length > 0) {
        results.updated++;
      } else {
        results.created++;
      }
    }
    
    // Count total mentions created
    const [mentionCount] = await conn.execute('SELECT COUNT(*) as count FROM entity_mentions');
    results.mentions = mentionCount[0].count;
    
    console.log();
    console.log('📊 SYNC SUMMARY:');
    console.log('================');
    console.log(`Stories created: ${results.created}`);
    console.log(`Stories updated: ${results.updated}`);
    console.log(`Total mentions:  ${results.mentions}`);
    
    // Show story-entity connections
    console.log();
    console.log('🔗 ENTITY CONNECTIONS:');
    const [connections] = await conn.execute(`
      SELECT entity_type, COUNT(*) as count 
      FROM entity_mentions 
      GROUP BY entity_type 
      ORDER BY count DESC
    `);
    
    connections.forEach(conn => {
      console.log(`${conn.entity_type.padEnd(12)}: ${conn.count} mentions`);
    });
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    throw error;
  } finally {
    await conn.end();
  }
  
  console.log();
  console.log('✅ MDX sync complete!');
  console.log('🎯 Cross-references are now active');
  
  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncMdxStories().catch(console.error);
}

export { syncMdxStories };