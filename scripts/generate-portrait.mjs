#!/usr/bin/env node
/**
 * Generate AI portrait using Runware API
 * Usage: node scripts/generate-portrait.mjs <slug> <entity-type> <gender> <age> <traits>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(rootDir, '.env') });

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY;

if (!RUNWARE_API_KEY) {
  console.error('❌ RUNWARE_API_KEY not found in .env');
  process.exit(1);
}

const [,, slug, entityType, gender, age, ...traitsArr] = process.argv;

if (!slug || !entityType) {
  console.error('Usage: node scripts/generate-portrait.mjs <slug> <entity-type> <gender> <age> <traits...>');
  process.exit(1);
}

const traits = traitsArr.join(' ');

async function generatePortrait() {
  console.log(`\n🎨 Generating image for ${slug}...\n`);
  console.log(`ℹ  Entity type: ${entityType}`);
  console.log(`ℹ  Gender: ${gender || 'N/A'}`);
  console.log(`ℹ  Age: ${age || 'N/A'}`);
  console.log(`ℹ  Traits: ${traits}`);
  
  let prompt;
  let negativePrompt;
  
  // Build type-specific prompts
  switch(entityType) {
    case 'person':
      const genderTerm = gender === 'female' ? 'woman' : 'man';
      const genderPronouns = gender === 'female' ? 'she/her' : 'he/him';
      const genderDescriptor = gender === 'female' ? 'feminine' : 'masculine';
      const oppositeGenderDescriptor = gender === 'female' ? 'masculine' : 'feminine';
      
      prompt = `Professional vintage hand-tinted portrait photograph of a ${age}-year-old Norwegian ${genderTerm}, circa 1920s-1930s style.

CRITICAL: This is a ${genderTerm.toUpperCase()} (${genderPronouns}), must have ${genderDescriptor} features.
${gender === 'female' ? 'Female subject with feminine facial features, feminine hairstyle, feminine clothing, soft feminine expression.' : 'Male subject with masculine facial features, masculine hairstyle, masculine clothing, strong masculine expression.'}

Character traits: ${traits}.
Soft Nordic lighting, slightly faded colors, gentle sepia undertones.
Subject (${genderTerm}) looking directly at camera with subtle, knowing expression.
Photographic studio backdrop with subtle quirky details.
Professional portrait composition, head and shoulders.
Authentic vintage photograph aesthetic, NOT illustrated or cartoon style.

GENDER CONFIRMATION: ${genderTerm}, ${genderPronouns}, ${genderDescriptor} features`;
      
      negativePrompt = gender === 'female' 
        ? 'masculine features, male, man, facial hair, beard, mustache, masculine jaw, masculine build, adam\'s apple, illustration, cartoon, anime, drawing, painting, 3d render, digital art, modern photo, ugly, distorted, deformed, extra limbs, ambiguous gender'
        : 'feminine features, female, woman, makeup, lipstick, feminine hairstyle, feminine jaw, feminine build, long eyelashes, illustration, cartoon, anime, drawing, painting, 3d render, digital art, modern photo, ugly, distorted, deformed, extra limbs, ambiguous gender';
      break;
      
    case 'business':
      // Parse business info: name | Keywords: tools, gears | description
      const parts = traits.split('|').map(p => p.trim());
      const businessName = parts[0] || traits;
      let keywords = '';
      let businessDesc = '';
      
      // Extract keywords if present
      for (const part of parts) {
        if (part.toLowerCase().startsWith('keywords:')) {
          keywords = part.replace(/^keywords:\s*/i, '');
        } else if (part !== parts[0]) {
          businessDesc = part;
        }
      }
      
      // Infer business type from keywords OR name
      let inferredType = '';
      const searchText = (keywords + ' ' + businessName + ' ' + businessDesc).toLowerCase();
      
      if (searchText.includes('mechanic') || searchText.includes('repair') || searchText.includes('tool') || searchText.includes('gear') || searchText.includes('spring') || searchText.includes('clockwork')) {
        inferredType = 'REPAIR SHOP/MECHANICS - show tools, machinery, gears, springs, workshop equipment, mechanical parts';
      } else if (searchText.includes('bakery') || searchText.includes('bread') || searchText.includes('pastry') || searchText.includes('oven') || searchText.includes('flour') || searchText.includes('baking')) {
        inferredType = 'BAKERY - show bread loaves, pastries, ovens, baked goods, flour sacks';
      } else if (searchText.includes('tailor') || searchText.includes('cloth') || searchText.includes('fabric') || searchText.includes('sewing') || searchText.includes('needle')) {
        inferredType = 'TAILOR/CLOTHING - show fabrics, sewing equipment, clothing, thread, needles';
      } else if (searchText.includes('book') || searchText.includes('library') || searchText.includes('reading')) {
        inferredType = 'BOOKSHOP - show books, shelves, reading materials, cozy atmosphere';
      } else if (searchText.includes('pub') || searchText.includes('tavern') || searchText.includes('inn') || searchText.includes('ale') || searchText.includes('drink')) {
        inferredType = 'PUB/TAVERN - show bar, drinks, bottles, cozy tavern atmosphere';
      } else if (searchText.includes('apothecary') || searchText.includes('medicine') || searchText.includes('potion') || searchText.includes('herb')) {
        inferredType = 'APOTHECARY - show bottles, herbs, potions, medical supplies, mortars';
      }
      
      prompt = `A whimsical, subtly magical vintage hand-tinted photograph of a charming Norwegian business storefront, circa 1920s-1930s.

BUSINESS NAME (must appear on sign): "${businessName}"
${keywords ? `WHAT THEY SELL/DO: ${keywords}` : ''}
${inferredType ? `INFERRED TYPE: ${inferredType}` : ''}
${businessDesc ? `ADDITIONAL INFO: ${businessDesc}` : ''}

CRITICAL REQUIREMENTS:
1. The shop sign MUST show the name "${businessName}" in vintage Norwegian lettering
2. The storefront MUST match these keywords: ${keywords || 'infer from name'}
3. Window displays MUST show: ${keywords || 'appropriate products for this business'}
4. NO generic shop - be SPECIFIC to what they sell/repair!

NORWEGIAN SETTING:
- Typisk norsk arkitektur: tømmerbygg, laftettre, skiferdekke
- Norske farger: røde, hvite, eller gule fasader med mørke vinduskarmer
- Håndmalt skilt med "${businessName}" i gammeldags norsk skrift
- Brostensgate, trebeplantning, norsk gatebelysning
- Vindu-utstilling som viser NØYAKTIG hva bedriften driver med

WINDOW DISPLAY MUST SHOW:
${keywords ? `Visible items: ${keywords}` : 'Items matching the business type'}
- If mechanics: Tools, gears, springs, machinery parts, wrenches
- If bakery: Bread loaves, pastries, baked goods, flour  
- If tailor: Fabrics, clothing, sewing supplies
- If bookshop: Books, shelves, reading materials
- Match ALL visual elements to the keywords!

SUBTLE MYTHOLOGICAL TOUCHES (norsk folkefortelling):
- En liten nisse som titter rundt dørkarm eller fra vindu
- Fotspor i snøen som går i rare mønstre
- En skygge i vinduet som ser litt for stor ut (hulder? troll?)
- Små detaljer: en hale som stikker ut, mystiske øyne i bakgrunnen
- Kanskje et tre som bøyer seg litt FOR nysgjerrig mot vinduet
- Magiske elementer er SUBTILE - lett å overse, men morsomme å oppdage

ARTISTIC STYLE:
- 1920s-30s håndkolorert fotografi-estetikk
- Myk sepia-base med håndmalte fargeaksenter
- Synlige penselstrøk på skilt og detaljer
- Profesjonell arkitekturfotografi-komposisjon
- Atmosfærisk dybde, varm innbydende følelse

PJUSKEBY CHARACTER:
- Dette er IKKE en vanlig norsk bedrift - den har sjarm og mysterier
- Ser ut som et sted der huldrefolk faktisk handler
- Inviterende, men med små magiske hemmeligheter
- Føles som en bedrift fra et eventyr

Make it CHARMING, INVITING, distinctly NORWEGIAN, subtly MAGICAL, and utterly PJUSKEBY.`;
      
      negativePrompt = 'clear faces, portraits, modern buildings, glass facades, neon signs, cars, smartphones, parking lots, digital art, illustration, cartoon, 3d render, corporate, sterile, franchise, chain store, highways, contemporary architecture';
      break;
      
    case 'place':
      prompt = `A whimsical, absurdly magical vintage hand-tinted photograph of an extraordinary Norwegian location, circa 1920s-1930s.

LOCATION ESSENCE: ${traits}

NORWEGIAN NATURE ELEMENTS:
- Klassisk norsk natur: fjorder, fosser, fjell, dype skoger, kystlandskap
- Typisk nordisk: gråstein, grantrær, bjørkeskoger, mose-dekket stein
- Norske farger: dype blågrønne fjorder, grå fjellsider, mørke barskoger
- Dramatisk norsk topografi: bratte fjellvegger, smale daler, ville strender
- Nordisk lys og atmosfære: lavt sollys, tykk tåke, mystisk skumring

MYTOLOGISKE INNSLAG (subtilt og humoristisk):
- Et troll som NESTEN ser ut som en stein (men øynene glitrer litt for mye)
- En huldres hale som stikker ut bak et tre (hun trodde hun var godt gjemt)
- Nisseaktige fotspor i snøen som går i spiraler
- En bjørk som er LITT for menneskelignende i formen
- Steinformasjoner som ser mistenkelig ut som sovende troll
- Små detaljer som antyder at noen VET du er der og synes det er morsomt
- Kanskje en liten dør i et tre, eller trappesteg som ikke fører noen steder

MAGICAL TWIST (norsk folkefortelling-stil):
- Magien er NORSK: huldreaktig, trollsk, nisseaktig
- Kunne være huldreland - stier som bøyer seg rart, trær som danser
- Litt for perfekte steinformasjoner, som om troll ordnet dem
- Lyset oppfører seg rart - svaberg som glør, vannfall som lyser
- Naturen selv virker levende og litt lunefull

ARTISTIC STYLE:
- 1920s-30s håndkolorert fotografi-estetikk
- Myk sepia-base med håndmalte fargeaksenter
- Synlige penselstrøk på de magiske elementene
- Profesjonell landskapskomposisjon med fantastisk vri
- Atmosfærisk dybde, lagdelt mystikk, teatralsk lyssetting

PJUSKEBY KARAKTER:
- Dette er IKKE et vanlig norsk sted - omfavn det absurde!
- Norsk natur, men med huldres drømmeverden-logikk
- Ser ut som stedet der folkeeventyrene faktisk skjedde
- Inviterende, men litt skremmende - akkurat som trollskog skal være
- Føles som et hemmelig sted fjellvettene kjenner til
- Humoristisk undertone: magien tar seg NESTEN alvorlig

Make it MEMORABLE, STRANGE, PLAYFUL, distinctly NORWEGIAN, and utterly PJUSKEBY.`;
      
      negativePrompt = 'people, faces, humans, portraits, modern elements, cars, smartphones, power lines, parking lots, highways, corporate buildings, realistic proportions, boring, mundane, ordinary, digital art, cartoon, 3d render, photorealistic modern photo, scottish highlands, english countryside, rolling green hills';
      break;
      
    case 'street':
      prompt = `A whimsical vintage hand-tinted photograph of a charming Norwegian street scene, circa 1920s-1930s style.
Street character: ${traits}.
Soft Nordic lighting, slightly faded colors, gentle sepia undertones.
Cobblestones, vintage lampposts, quirky architectural details.
Authentic vintage photograph aesthetic with visible paint strokes.
Inviting pathway, character-filled buildings lining the street.
Professional street photography composition.`;
      
      negativePrompt = 'people, faces, modern cars, asphalt, traffic lights, modern signage, digital art, illustration, cartoon, 3d render, highways, parking lots';
      break;
      
    default:
      prompt = `A whimsical vintage hand-tinted photograph, circa 1920s-1930s style. ${traits}`;
      negativePrompt = 'modern, digital art, illustration, cartoon, 3d render';
  }

  console.log('\n📝 Prompt:', prompt.substring(0, 200) + '...\n');
  console.log('📡 Calling Runware API...\n');
  
  const response = await fetch('https://api.runware.ai/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWARE_API_KEY}`
    },
    body: JSON.stringify([{
      taskType: 'imageInference',
      taskUUID: randomUUID(),
      model: 'runware:100@1',
      positivePrompt: prompt,
      negativePrompt: negativePrompt,
      width: 1024,
      height: 1024,
      numberResults: 1,
      outputType: 'URL',
      outputFormat: 'PNG',
      includeCost: false
    }])
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Runware API error:', error);
    process.exit(1);
  }
  
  const result = await response.json();
  
  if (!result.data || !result.data[0] || !result.data[0].imageURL) {
    console.error('❌ No image URL in response:', JSON.stringify(result, null, 2));
    process.exit(1);
  }
  
  const imageURL = result.data[0].imageURL;
  console.log(`✅ Image generated: ${imageURL}\n`);
  
  // Download image
  console.log('📥 Downloading image...\n');
  const imageResponse = await fetch(imageURL);
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const outputPath = `/tmp/${slug}.png`;
  fs.writeFileSync(outputPath, buffer);
  
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(`✅ Downloaded to: ${outputPath}`);
  console.log(`📦 Size: ${sizeMB} MB`);
  console.log(`✅ Portrait generation complete!`);
}

generatePortrait().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
