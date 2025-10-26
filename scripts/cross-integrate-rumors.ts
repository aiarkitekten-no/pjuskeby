#!/usr/bin/env node

/**
 * Phase 9: Cross-Integration
 * 
 * Generates story seeds from trending rumors
 * Updates character profiles with rumor mentions
 * Creates location events based on rumors
 */

import 'dotenv/config';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { calculateTrendingScore } from '../src/utils/trending.js';

interface Rumor {
  id: string;
  title: string;
  content: string;
  category: string;
  credibility: number;
  characters: string[];
  locations: string[];
  interactions: {
    views: number;
    confirmed: number;
    debunked: number;
    shared: number;
  };
  date: string;
}

/**
 * Get top trending rumors
 */
async function getTrendingRumors(limit: number = 5) {
  const dataPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const fileContent = await readFile(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);
  
  const rumorsWithScores = data.rumors.map((rumor: Rumor) => ({
    ...rumor,
    trendingScore: calculateTrendingScore(rumor)
  }));
  
  return rumorsWithScores
    .sort((a: any, b: any) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}

/**
 * Generate story seeds from trending rumors
 */
async function generateStorySeedsFromRumors() {
  console.log('📖 Generating story seeds from trending rumors...\n');
  
  const trendingRumors = await getTrendingRumors(3);
  
  const seeds = trendingRumors.map((rumor: any) => ({
    id: `seed-from-${rumor.id}`,
    type: 'rumor-inspired',
    title: `Story idea: ${rumor.title}`,
    premise: `Based on the ${rumor.category} rumor about ${rumor.characters.join(', ')}, explore what really happened at ${rumor.locations[0]}.`,
    characters: rumor.characters,
    locations: rumor.locations,
    mood: rumor.category === 'mystery' ? 'mysterious' : rumor.category === 'scandal' ? 'dramatic' : 'whimsical',
    credibilityHook: rumor.credibility > 70 ? 'This might actually be true...' : 'Or is it all just nonsense?',
    generatedFrom: {
      rumorId: rumor.id,
      trendingScore: rumor.trendingScore,
      date: new Date().toISOString()
    }
  }));
  
  console.log(`✅ Generated ${seeds.length} story seeds:`);
  seeds.forEach((seed: any) => {
    console.log(`   - ${seed.title}`);
  });
  
  // Save to file
  const seedsPath = join(process.cwd(), 'content/data/story-seeds-from-rumors.json');
  await writeFile(seedsPath, JSON.stringify({ seeds, generated: new Date().toISOString() }, null, 2));
  
  console.log(`\n💾 Saved to: content/data/story-seeds-from-rumors.json`);
  
  return seeds;
}

/**
 * Update character profiles with rumor mentions
 */
async function updateCharacterProfiles() {
  console.log('\n👥 Updating character profiles with rumor mentions...\n');
  
  const rumorsPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const rumorsData = JSON.parse(await readFile(rumorsPath, 'utf-8'));
  
  // Count mentions per character
  const characterMentions: Record<string, any[]> = {};
  
  rumorsData.rumors.forEach((rumor: Rumor) => {
    rumor.characters?.forEach(char => {
      if (!characterMentions[char]) {
        characterMentions[char] = [];
      }
      characterMentions[char].push({
        rumorId: rumor.id,
        rumorTitle: rumor.title,
        category: rumor.category,
        credibility: rumor.credibility,
        date: rumor.date
      });
    });
  });
  
  console.log(`✅ Found mentions for ${Object.keys(characterMentions).length} characters:`);
  Object.entries(characterMentions).forEach(([char, mentions]) => {
    console.log(`   - ${char}: ${mentions.length} rumors`);
  });
  
  // Save character rumor index
  const indexPath = join(process.cwd(), 'content/data/character-rumor-index.json');
  await writeFile(indexPath, JSON.stringify({
    characters: characterMentions,
    updated: new Date().toISOString(),
    totalCharacters: Object.keys(characterMentions).length
  }, null, 2));
  
  console.log(`\n💾 Saved to: content/data/character-rumor-index.json`);
  
  return characterMentions;
}

/**
 * Create location events from rumors
 */
async function createLocationEvents() {
  console.log('\n📍 Creating location events from rumors...\n');
  
  const rumorsPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const rumorsData = JSON.parse(await readFile(rumorsPath, 'utf-8'));
  
  // Group by location
  const locationEvents: Record<string, any[]> = {};
  
  rumorsData.rumors.forEach((rumor: Rumor) => {
    rumor.locations?.forEach(loc => {
      if (!locationEvents[loc]) {
        locationEvents[loc] = [];
      }
      locationEvents[loc].push({
        id: `event-${rumor.id}`,
        type: 'rumor-event',
        title: rumor.title,
        description: rumor.content.substring(0, 200) + '...',
        category: rumor.category,
        credibility: rumor.credibility,
        date: rumor.date,
        rumorId: rumor.id,
        involvedCharacters: rumor.characters
      });
    });
  });
  
  console.log(`✅ Created events for ${Object.keys(locationEvents).length} locations:`);
  Object.entries(locationEvents).forEach(([loc, events]) => {
    console.log(`   - ${loc}: ${events.length} events`);
  });
  
  // Save location events
  const eventsPath = join(process.cwd(), 'content/data/location-rumor-events.json');
  await writeFile(eventsPath, JSON.stringify({
    locations: locationEvents,
    updated: new Date().toISOString(),
    totalLocations: Object.keys(locationEvents).length
  }, null, 2));
  
  console.log(`\n💾 Saved to: content/data/location-rumor-events.json`);
  
  return locationEvents;
}

/**
 * Generate timeline entries from rumors
 */
async function generateTimelineEntries() {
  console.log('\n⏰ Generating timeline entries...\n');
  
  const rumorsPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const rumorsData = JSON.parse(await readFile(rumorsPath, 'utf-8'));
  
  const timelineEntries = rumorsData.rumors.map((rumor: Rumor) => ({
    id: `timeline-${rumor.id}`,
    type: 'rumor',
    date: rumor.date,
    title: rumor.title,
    description: rumor.content,
    category: rumor.category,
    credibility: rumor.credibility,
    relatedEntities: {
      characters: rumor.characters,
      locations: rumor.locations
    },
    metadata: {
      rumorId: rumor.id,
      interactions: rumor.interactions
    }
  }));
  
  // Sort by date
  timelineEntries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  console.log(`✅ Generated ${timelineEntries.length} timeline entries`);
  
  // Save timeline
  const timelinePath = join(process.cwd(), 'content/data/rumor-timeline.json');
  await writeFile(timelinePath, JSON.stringify({
    entries: timelineEntries,
    updated: new Date().toISOString(),
    totalEntries: timelineEntries.length
  }, null, 2));
  
  console.log(`💾 Saved to: content/data/rumor-timeline.json`);
  
  return timelineEntries;
}

/**
 * Main integration function
 */
async function runCrossIntegration() {
  console.log('🔗 Phase 9: Cross-Integration\n');
  console.log('=' .repeat(50) + '\n');
  
  try {
    // 1. Generate story seeds
    await generateStorySeedsFromRumors();
    
    // 2. Update character profiles
    await updateCharacterProfiles();
    
    // 3. Create location events
    await createLocationEvents();
    
    // 4. Generate timeline
    await generateTimelineEntries();
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Cross-integration complete!\n');
    
    console.log('📊 Generated files:');
    console.log('   - content/data/story-seeds-from-rumors.json');
    console.log('   - content/data/character-rumor-index.json');
    console.log('   - content/data/location-rumor-events.json');
    console.log('   - content/data/rumor-timeline.json');
    
  } catch (error) {
    console.error('\n❌ Error during cross-integration:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCrossIntegration()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

export { runCrossIntegration, getTrendingRumors, generateStorySeedsFromRumors };
