#!/usr/bin/env node
/**
 * Generate extended biography using OpenAI API
 * Usage: node scripts/generate-biography.mjs <slug> <entity-type>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(rootDir, '.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in .env');
  process.exit(1);
}

const [,, slug, entityType = 'person'] = process.argv;

if (!slug) {
  console.error('Usage: node scripts/generate-biography.mjs <slug> [entity-type]');
  process.exit(1);
}

// Detect gender from name
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

async function generateBiography() {
  console.log(`\n🤖 Generating biography for ${slug}...\n`);
  
  // Map entity type to data file
  const typeMapping = {
    'person': 'people',
    'business': 'businesses',
    'place': 'places',
    'street': 'streets'
  };
  
  const dataFileName = typeMapping[entityType] || entityType;
  const dataFile = path.join(rootDir, 'content/data', `${dataFileName}.normalized.json`);
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  const entity = data.find(e => e.slug === slug);
  
  if (!entity) {
    console.error(`❌ Entity not found: ${slug}`);
    process.exit(1);
  }
  
  // Read reference profile (Milly Wiggleflap)
  const referencePath = path.join(rootDir, 'content/data/milly-wiggleflap-extended.json');
  const reference = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));
  
  // Build entity-type-specific prompt
  let prompt;
  let gender = 'unknown';
  
  if (entityType === 'person') {
    gender = detectGender(entity.name);
    console.log(`ℹ  Detected gender: ${gender}`);
    console.log(`ℹ  Name: ${entity.name}`);
    console.log(`ℹ  Age: ${entity.age}`);
    console.log(`ℹ  Occupation: ${entity.occupation}`);
    console.log(`ℹ  Traits: ${entity.traits?.join(', ') || 'None'}`);
    console.log(`ℹ  Bio hint: ${entity.bio || 'None'}`);
    
    prompt = `You are a creative writer for Pjuskeby, a whimsical Nordic town full of absurd, deeply human characters.

Write an extended biography for: **${entity.name}**

CHARACTER DATA:
- Name: ${entity.name}
- Gender: ${gender}
- Age: ${entity.age}
- Occupation: ${entity.occupation}
- Personality trait/quirk: ${entity.bio || 'Unknown'}
- Hobbies/traits: ${entity.traits?.join(', ') || 'None'}

STYLE REFERENCE (match this tone exactly):
${reference.bio_full.substring(0, 800)}...

REQUIREMENTS:
1. Write 1000-1200 words total
2. Use these section headers (with ** for bold):
   - **[Creative workplace/theory name]** (about their job/passion)
   - **[Specific hobby/collection]** (quirky detail)
   - **[Daily ritual]** (absurd routine)
   - **What [Name] Loves**
   - **What [Name] Hates**
   - **[Future dreams/legacy]**

3. Tone: Whimsical, absurd, but deeply observant. Like Milly Wiggleflap's bio.
4. Include specific details: numbers, times, made-up theories, named objects
5. Separate sections with \\n\\n
6. Make them DEEPLY weird but emotionally real
7. Nordic setting, Norwegian references welcome
8. Gender: ${gender} (use appropriate pronouns throughout)

Write ONLY the biography text, no preamble.`;
  } else if (entityType === 'place') {
    console.log(`ℹ  Name: ${entity.name}`);
    console.log(`ℹ  Type: Place/Location`);
    console.log(`ℹ  Address: ${entity.address || 'Unknown'}`);
    console.log(`ℹ  Description: ${entity.bio || 'None'}`);
    
    prompt = `You are a creative writer for Pjuskeby, a whimsical Nordic town with magical, living locations.

Write an extended description for this PLACE: **${entity.name}**

PLACE DATA:
- Name: ${entity.name}
- Type: Place/Location
- Address: ${entity.address || 'Unknown location in Pjuskeby'}
- Known for: ${entity.bio || 'Unknown'}

STYLE REFERENCE (match this whimsical tone):
${reference.bio_full.substring(0, 800)}...

REQUIREMENTS:
1. Write 1000-1200 words total about this LOCATION
2. Use these section headers (with ** for bold):
   - **[Origin/History]** (how this place came to be)
   - **[The Landscape/Architecture]** (physical description with quirky details)
   - **[Local Legends]** (stories told about this place)
   - **[What Happens Here]** (activities, events, atmosphere)
   - **[The Mood of the Place]** (emotional quality, what visitors feel)
   - **[Secrets of ${entity.name}]** (hidden details, mysteries)

3. Tone: Whimsical, magical, but grounded. This is a PLACE, not a person.
4. Do NOT personify the location with gender or human traits
5. Focus on: atmosphere, history, physical details, local folklore
6. Include specific details: times of day, weather, seasons, sounds, smells
7. Separate sections with \\n\\n
8. Nordic setting, Norwegian landscape references
9. Make it feel ALIVE without making it a person

Write ONLY the place description text, no preamble.`;
  } else if (entityType === 'business') {
    console.log(`ℹ  Name: ${entity.name}`);
    console.log(`ℹ  Type: Business/Shop`);
    console.log(`ℹ  Address: ${entity.address || 'Unknown'}`);
    console.log(`ℹ  Description: ${entity.bio || 'None'}`);
    
    prompt = `You are a creative writer for Pjuskeby, a whimsical Nordic town with extraordinary businesses.

Write an extended description for this BUSINESS: **${entity.name}**

BUSINESS DATA:
- Name: ${entity.name}
- Type: Shop/Business/Establishment
- Address: ${entity.address || 'Unknown location in Pjuskeby'}
- Known for: ${entity.bio || 'Unknown'}

STYLE REFERENCE (match this whimsical tone):
${reference.bio_full.substring(0, 800)}...

REQUIREMENTS:
1. Write 1000-1200 words total about this BUSINESS
2. Use these section headers (with ** for bold):
   - **[The Establishment]** (what they sell/do, founding story)
   - **[The Shop Interior]** (physical description, atmosphere)
   - **[Signature Products/Services]** (what they're famous for)
   - **[The Clientele]** (who shops here, local culture)
   - **[Business Philosophy]** (their unique approach)
   - **[Local Reputation]** (what townspeople say)

3. Tone: Whimsical, absurd, but believable. This is a BUSINESS, not a person.
4. Do NOT personify the business itself - describe the place and what happens there
5. You CAN mention the owner/staff in passing, but focus on the business
6. Include specific details: prices, products, opening hours, quirky policies
7. Separate sections with \\n\\n
8. Nordic setting, Norwegian business culture
9. Make it memorable and unique

Write ONLY the business description text, no preamble.

AFTER your description, on separate lines output exactly:

BUSINESS_KEYWORDS=<Extract 5-10 keywords that describe what this business sells/does, separated by commas. Be SPECIFIC: tools, machinery, repairs, clockwork, gears NOT just "shop". Examples: "mechanical repairs, clockwork, gears, springs, tools" OR "fresh bread, pastries, ovens, flour, baking" OR "fabrics, sewing, needles, thread, tailoring">
CONTACT_INFO=<funny contact info like "Ring the bell thrice" or "Send a raven" or "Knock in morse code" - be creative and absurd>
OPENING_HOURS=<3 funny opening hours separated by |, like "Mon-Fri: When rooster crows|Weekends: If you can find us|Tuesdays: Closed for existential contemplation">
STATISTICS=<4 quirky statistics separated by |, format "label:value" like "Mysterious Occurrences:42|Troll Sightings:7|Giggles Per Day:23|Unexplained Phenomena:156">
FUN_FACTS=<5 absurd fun facts separated by |, like "Once visited by a troll|WiFi password is TrollsArentReal123|Walls hum at 3:17 PM">`;
  } else if (entityType === 'street') {
    console.log(`ℹ  Name: ${entity.name}`);
    console.log(`ℹ  Type: Street/Road`);
    console.log(`ℹ  Description: ${entity.bio || 'None'}`);
    
    prompt = `You are a creative writer for Pjuskeby, a whimsical Nordic town with streets full of character.

Write an extended description for this STREET: **${entity.name}**

STREET DATA:
- Name: ${entity.name}
- Type: Street/Road
- Known for: ${entity.bio || 'Unknown'}

STYLE REFERENCE (match this whimsical tone):
${reference.bio_full.substring(0, 800)}...

REQUIREMENTS:
1. Write 1000-1200 words total about this STREET
2. Use these section headers (with ** for bold):
   - **[The Street's History]** (naming, development over time)
   - **[The Route]** (where it goes, what it connects)
   - **[Architecture & Character]** (buildings, trees, peculiarities)
   - **[Life on the Street]** (daily rhythms, seasonal changes)
   - **[Street Culture]** (traditions, events, local habits)
   - **[Notable Spots]** (landmarks, gathering places)

3. Tone: Whimsical, observant, atmospheric. This is a STREET, not a person.
4. Do NOT personify the street - describe the physical space and life along it
5. You CAN mention residents/businesses, but focus on the street itself
6. Include specific details: paving, lighting, sounds, smells, time of day
7. Separate sections with \\n\\n
8. Nordic setting, Norwegian street culture
9. Make it feel like a living thoroughfare

Write ONLY the street description text, no preamble.`;
  }

  console.log('\n📡 Calling OpenAI API...\n');
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a creative writer specializing in whimsical, absurdist character biographies in the style of Nordic magical realism.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2500
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('❌ OpenAI API error:', error);
    process.exit(1);
  }
  
  const result = await response.json();
  const bioFull = result.choices[0].message.content.trim();
  
  const wordCount = bioFull.split(/\s+/).length;
  console.log(`✅ Generated biography: ${wordCount} words\n`);
  
  // Build entity-type-specific extended profile
  let extended;
  const outputPath = `/tmp/${slug}-extended.json`;
  
  if (entityType === 'person') {
    // For persons: generate short bio from first 100 words
    const bioShort = bioFull.split(/\s+/).slice(0, 100).join(' ') + '...';
    
    // Calculate birthdate from age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - entity.age;
    const birthdate = `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
    
    extended = {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      age: entity.age,
      birthdate: birthdate,
      gender: gender,
      occupation: entity.occupation || 'Unknown',
      workplace: {
        name: entity.occupation || 'Unknown',
        slug: entity.workplace_id || 'unknown',
        role: entity.occupation || 'Unknown'
      },
      address: {
        street: entity.street_address || 'Unknown Street',
        number: '1',
        full: `${entity.street_address || 'Unknown Street'}, Pjuskeby`
      },
      favorites: {
        places: []
      },
      traits: entity.traits || [],
      bio_short: bioShort,
      bio_full: bioFull,
      personality: {
        traits: entity.traits || []
      }
    };
    
    console.log(`📊 Word count: ${wordCount} words`);
    console.log(`👤 Gender: ${gender}`);
    console.log(`🎂 Birthdate: ${birthdate}`);
    console.log(`\nGENDER=${gender}`);
  } else if (entityType === 'place') {
    // For places: use original description as short, don't excerpt the full text
    extended = {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      type: 'place',
      address: entity.address || 'Unknown location',
      coordinates: entity.coordinates || null,
      description_short: entity.bio || entity.description || `A magical place in Pjuskeby`,
      description_full: bioFull,
      characteristics: entity.traits || [],
      established: entity.established || 'Unknown'
    };
    
    console.log(`📊 Word count: ${wordCount} words`);
    console.log(`🏔️  Type: Place`);
    console.log(`📍 Address: ${extended.address}`);
  } else if (entityType === 'business') {
    // For businesses: parse extra fields from output
    const fullOutput = result.choices[0].message.content; // Get full output before trim
    const businessKeywords = fullOutput.match(/BUSINESS_KEYWORDS=(.+)/)?.[1] || '';
    const contactInfo = fullOutput.match(/CONTACT_INFO=(.+)/)?.[1] || 'Send a raven';
    const openingHours = fullOutput.match(/OPENING_HOURS=(.+)/)?.[1]?.split('|') || ['If the door is open, we\'re open'];
    const statistics = fullOutput.match(/STATISTICS=(.+)/)?.[1]?.split('|').map(s => {
      const [label, value] = s.split(':');
      return { label: label?.trim(), value: value?.trim() };
    }) || [];
    const funFacts = fullOutput.match(/FUN_FACTS=(.+)/)?.[1]?.split('|') || ['Once visited by a troll'];
    
    extended = {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      type: 'business',
      address: entity.address || 'Unknown location',
      category: entity.category || 'Shop',
      description_short: entity.bio || entity.description || `A unique business in Pjuskeby`,
      description_full: bioFull,
      specialties: entity.traits || [],
      established: entity.established || 'Unknown',
      business_keywords: businessKeywords,
      contact_info: contactInfo,
      opening_hours: openingHours,
      statistics: statistics,
      fun_facts: funFacts
    };
    
    console.log(`📊 Word count: ${wordCount} words`);
    console.log(`🏪 Type: Business`);
    console.log(`📍 Address: ${extended.address}`);
    console.log(`🔑 Keywords: ${businessKeywords}`);
    console.log(`📞 Contact: ${contactInfo}`);
  } else if (entityType === 'street') {
    // For streets: use original description as short
    extended = {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      type: 'street',
      description_short: entity.bio || entity.description || `A memorable street in Pjuskeby`,
      description_full: bioFull,
      description: bioFull,
      characteristics: entity.traits || [],
      connects: entity.connects || []
    };
    
    console.log(`📊 Word count: ${wordCount} words`);
    console.log(`🛣️  Type: Street`);
  }
  
  // Save to /tmp (all entity types)
  fs.writeFileSync(outputPath, JSON.stringify(extended, null, 2));
  console.log(`✅ Saved to: ${outputPath}\n`);
}

generateBiography().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
