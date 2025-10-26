#!/usr/bin/env node

/**
 * Pjuskeby Rumor Generator
 * Phase 6-7: AI Content Generation
 * 
 * Generates 7 daily rumors using GPT-4 and Runware SDK
 */

import 'dotenv/config';
import OpenAI from 'openai';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomInt } from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Source archetypes with credibility ranges
const SOURCE_ARCHETYPES = {
  gossip: {
    name: 'The Gossip',
    credibilityRange: [40, 60],
    voicePatterns: [
      "You didn't hear this from me, but...",
      "Between you and me...",
      "My cousin's neighbor swears...",
      "I'm not one to spread rumors, but..."
    ]
  },
  skeptic: {
    name: 'The Skeptic',
    credibilityRange: [70, 85],
    voicePatterns: [
      "I saw it myself...",
      "The facts are clear...",
      "Don't believe the hype, but...",
      "I'm just saying what I observed..."
    ]
  },
  conspiracist: {
    name: 'The Conspiracist',
    credibilityRange: [25, 45],
    voicePatterns: [
      "They don't want you to know...",
      "Wake up! This is clearly...",
      "It all connects if you think about it...",
      "The evidence is there if you look..."
    ]
  },
  bystander: {
    name: 'The Bystander',
    credibilityRange: [55, 75],
    voicePatterns: [
      "I happened to notice...",
      "Was just passing by when...",
      "Not sure if it matters, but...",
      "Might be nothing, but..."
    ]
  }
};

const CATEGORIES = ['sighting', 'scandal', 'mystery', 'announcement', 'theory'];

/**
 * Get seasonal context based on current date
 */
function getSeasonalContext() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // Christmas season (December 1 - January 6)
  if ((month === 12) || (month === 1 && day <= 6)) {
    return {
      season: 'christmas',
      themes: ['Santa sightings in unusual places', 'gift-related mysteries', 'holiday decoration scandals', 'festive food disasters', 'Christmas traditions gone wrong'],
      keywords: ['Santa', 'gifts', 'Christmas tree', 'lights', 'snow', 'sleigh', 'elves', 'mistletoe']
    };
  }
  
  // Easter season (March 15 - April 30)
  if ((month === 3 && day >= 15) || (month === 4)) {
    return {
      season: 'easter',
      themes: ['egg hunt gone wrong', 'bunny conspiracies', 'Easter candy mysteries', 'spring cleaning discoveries', 'Easter parade mishaps'],
      keywords: ['Easter bunny', 'eggs', 'chocolate', 'basket', 'spring', 'flowers', 'chicks']
    };
  }
  
  // Halloween season (October 1-31)
  if (month === 10) {
    return {
      season: 'halloween',
      themes: ['spooky happenings', 'costume malfunctions', 'supernatural sightings', 'haunted locations', 'trick-or-treat troubles'],
      keywords: ['ghost', 'witch', 'pumpkin', 'costume', 'candy', 'haunted', 'spooky', 'mysterious']
    };
  }
  
  // Summer (June-August)
  if (month >= 6 && month <= 8) {
    return {
      season: 'summer',
      themes: ['beach mysteries', 'tourist troubles', 'ice cream incidents', 'vacation disasters', 'outdoor event chaos'],
      keywords: ['beach', 'sun', 'vacation', 'ice cream', 'swimming', 'boat', 'festival']
    };
  }
  
  // Default (no special season)
  return null;
}

/**
 * Calculate credibility score based on source type and content
 */
function calculateCredibility(sourceType: keyof typeof SOURCE_ARCHETYPES, content: string): number {
  const [min, max] = SOURCE_ARCHETYPES[sourceType].credibilityRange;
  
  // Base score from source type
  let baseScore = randomInt(min, max + 1);
  
  // Adjust based on content factors
  const hasSpecificDetails = /\d{1,2}|exactly|precisely|witnessed/.test(content);
  const hasVagueLanguage = /maybe|perhaps|possibly|might|could be/.test(content);
  const hasNamedSources = /said|told|according to/.test(content);
  
  if (hasSpecificDetails) baseScore += 5;
  if (hasVagueLanguage) baseScore -= 5;
  if (hasNamedSources) baseScore += 3;
  
  return Math.max(0, Math.min(100, baseScore));
}

/**
 * Load existing characters and places for context
 */
async function loadWorldContext() {
  try {
    // Load characters from content/people/
    const peopleFiles = await readFile(join(process.cwd(), 'content/data/people-index.json'), 'utf-8');
    const people = JSON.parse(peopleFiles);
    
    // Load places
    const placesFiles = await readFile(join(process.cwd(), 'public/geojson/places.geojson'), 'utf-8');
    const places = JSON.parse(placesFiles);
    
    return {
      characters: people.slice(0, 20).map((p: any) => p.name),
      places: places.features.slice(0, 20).map((f: any) => f.properties.name)
    };
  } catch (error) {
    console.warn('Could not load world context, using defaults');
    return {
      characters: ['Clive Flumpington', 'Trixie Wobblethorpe', 'Edna Snortwig'],
      places: ['Boingy Beach', 'Giggle Hillock', 'Splashypaint Falls']
    };
  }
}

/**
 * Generate a single rumor using GPT-4
 */
async function generateRumor(context: any) {
  const sourceType = Object.keys(SOURCE_ARCHETYPES)[randomInt(0, 4)] as keyof typeof SOURCE_ARCHETYPES;
  const category = CATEGORIES[randomInt(0, CATEGORIES.length)];
  const voicePattern = SOURCE_ARCHETYPES[sourceType].voicePatterns[
    randomInt(0, SOURCE_ARCHETYPES[sourceType].voicePatterns.length)
  ];
  
  const seasonal = getSeasonalContext();
  const seasonalPrompt = seasonal 
    ? `\n\nSEASONAL THEME (${seasonal.season.toUpperCase()}):
- Possible themes: ${seasonal.themes.join(', ')}
- Incorporate keywords: ${seasonal.keywords.slice(0, 3).join(', ')}
- Make it feel appropriate for the ${seasonal.season} season`
    : '';
  
  const prompt = `You are generating a rumor for the whimsical Norwegian coastal town of Pjuskeby, where reality is slightly bent and the absurd is commonplace.

CONTEXT:
- Town characters: ${context.characters.join(', ')}
- Town places: ${context.places.join(', ')}
- Source type: ${SOURCE_ARCHETYPES[sourceType].name}
- Category: ${category}
- Voice pattern to start with: "${voicePattern}"${seasonalPrompt}

REQUIREMENTS:
1. Write a rumor that is 50-150 words long
2. Start with the voice pattern provided
3. Include 1-2 specific character names from the list
4. Mention 1 specific place from the list
5. Keep the tone whimsical, slightly absurd, but believable within Pjuskeby's reality
6. Match the personality of the ${SOURCE_ARCHETYPES[sourceType].name}:
   - ${sourceType === 'gossip' ? 'Dramatic, embellished, loves adding juicy details' : ''}
   - ${sourceType === 'skeptic' ? 'Factual, dry, dismissive of nonsense' : ''}
   - ${sourceType === 'conspiracist' ? 'Connects unrelated things, sees patterns everywhere' : ''}
   - ${sourceType === 'bystander' ? 'Casual, matter-of-fact, not emotionally invested' : ''}
7. For category "${category}":
   - ${category === 'sighting' ? 'Someone spotted something unusual' : ''}
   - ${category === 'scandal' ? 'Questionable behavior or social faux pas' : ''}
   - ${category === 'mystery' ? 'Unexplained event or strange occurrence' : ''}
   - ${category === 'announcement' ? 'Upcoming event or change (possibly exaggerated)' : ''}
   - ${category === 'theory' ? 'Speculation about why something happened' : ''}

Return ONLY the rumor text, nothing else.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 200
  });

  const content = completion.choices[0].message.content?.trim() || '';
  
  // Extract mentioned characters and places
  const mentionedChars = context.characters.filter((char: string) => 
    content.toLowerCase().includes(char.toLowerCase())
  );
  const mentionedPlaces = context.places.filter((place: string) => 
    content.toLowerCase().includes(place.toLowerCase())
  );
  
  const credibility = calculateCredibility(sourceType, content);
  
  return {
    id: `rumor-${Date.now()}-${randomInt(1000, 9999)}`,
    title: content.split('.')[0].substring(0, 60) + '...',
    category,
    sourceType,
    sourceName: randomInt(0, 2) === 0 ? 'Anonymous' : mentionedChars[0] || 'Local Resident',
    credibility,
    date: new Date().toISOString(),
    content,
    characters: mentionedChars,
    locations: mentionedPlaces,
    mentions: [
      ...mentionedChars.map((name: string) => ({
        type: 'person',
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      })),
      ...mentionedPlaces.map((name: string) => ({
        type: 'place',
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-')
      }))
    ],
    references: [],
    interactions: {
      views: 0,
      confirmed: 0,
      debunked: 0,
      shared: 0
    },
    published: true
  };
}

/**
 * Main generation function
 */
async function generateDailyRumors(count: number = 7) {
  console.log('🔮 Starting rumor generation...');
  
  const dataPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const fileContent = await readFile(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);
  
  const context = await loadWorldContext();
  console.log(`📚 Loaded context: ${context.characters.length} characters, ${context.places.length} places`);
  
  const newRumors = [];
  
  for (let i = 0; i < count; i++) {
    console.log(`\n📝 Generating rumor ${i + 1}/${count}...`);
    try {
      const rumor = await generateRumor(context);
      newRumors.push(rumor);
      console.log(`✅ Generated: ${rumor.title}`);
      console.log(`   Category: ${rumor.category}, Credibility: ${rumor.credibility}%`);
      
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error generating rumor ${i + 1}:`, error);
    }
  }
  
  // Add new rumors to data
  data.rumors.push(...newRumors);
  
  // Update metadata
  data.metadata.totalRumors = data.rumors.length;
  data.metadata.lastGenerated = new Date().toISOString();
  
  // Update category counts
  const categoryCounts: Record<string, number> = {};
  data.rumors.forEach((r: any) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });
  data.metadata.categories = categoryCounts;
  
  // Update source type counts
  const sourceTypeCounts: Record<string, number> = {};
  data.rumors.forEach((r: any) => {
    sourceTypeCounts[r.sourceType] = (sourceTypeCounts[r.sourceType] || 0) + 1;
  });
  data.metadata.sourceTypes = sourceTypeCounts;
  
  // Save updated data to both locations
  const srcPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const prodPath = join(process.cwd(), 'content/data/rumors.normalized.json');
  
  await writeFile(srcPath, JSON.stringify(data, null, 2), 'utf-8');
  await writeFile(prodPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\n✨ Successfully generated ${newRumors.length} new rumors!`);
  console.log(`📊 Total rumors in database: ${data.rumors.length}`);
  
  return newRumors;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const count = parseInt(process.argv[2]) || 7;
  generateDailyRumors(count)
    .then(() => {
      console.log('\n🎉 Generation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error);
      process.exit(1);
    });
}

export { generateDailyRumors };
