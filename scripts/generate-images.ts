#!/usr/bin/env node

/**
 * Pjuskeby Rumor Image Generator
 * Phase 6-7: AI Image Generation
 * 
 * Generates whimsical images for rumors using Runware SDK
 */

import { Runware } from '@runware/sdk-js';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Placeholder - will be used when Runware SDK API is updated
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const runware = new Runware({
  apiKey: process.env.RUNWARE_API_KEY || ''
});

interface Rumor {
  id: string;
  title: string;
  content: string;
  category: string;
  characters?: string[];
  locations?: string[];
  imageUrl?: string;
}

/**
 * Generate image prompt from rumor content
 */
function generateImagePrompt(rumor: Rumor): string {
  const baseStyle = 'whimsical illustration, watercolor style, soft colors, Norwegian coastal town, charming and quirky';
  
  // Extract key elements
  const location = rumor.locations?.[0] || 'Pjuskeby town square';
  const character = rumor.characters?.[0] || 'townsperson';
  
  // Category-specific styling
  const categoryStyles: Record<string, string> = {
    sighting: 'mysterious atmosphere, something unusual happening',
    scandal: 'dramatic lighting, gossip scene, animated characters',
    mystery: 'foggy, enigmatic, question mark energy',
    announcement: 'festive, cheerful, town gathering',
    theory: 'abstract elements, thought bubbles, connecting dots'
  };
  
  const categoryStyle = categoryStyles[rumor.category] || '';
  
  // Build prompt
  const prompt = `${baseStyle}, ${categoryStyle}, scene in ${location}, featuring ${character}, inspired by: "${rumor.title.substring(0, 100)}", magical realism, storybook quality, detailed but soft focus, no text`;
  
  return prompt;
}

/**
 * Generate image using Runware SDK
 * 
 * NOTE: Runware SDK API has changed. For now, using placeholder images.
 * TODO: Update to latest Runware SDK API when documentation is available.
 */
async function generateImage(rumor: Rumor): Promise<string> {
  console.log(`🎨 Generating placeholder image for: ${rumor.title}`);
  
  const prompt = generateImagePrompt(rumor);
  console.log(`📝 Prompt (saved for future): ${prompt.substring(0, 150)}...`);
  
  try {
    // TODO: Implement actual Runware SDK call when API is stable
    // For now, return a category-based placeholder using existing images
    const placeholders: Record<string, string> = {
      sighting: '/assets/agatha/place/boingy-beach.png',
      scandal: '/assets/agatha/person/dotty-mcflap.png',
      mystery: '/assets/agatha/place/whisper-swamp.png',
      announcement: '/assets/agatha/place/giggle-hillock.png',
      theory: '/assets/agatha/place/thinky-bay.png'
    };
    
    const imageUrl = placeholders[rumor.category] || '/assets/agatha/place/pjuskeby-square.png';
    console.log(`✅ Using placeholder: ${imageUrl}`);
    
    return imageUrl;
  } catch (error) {
    console.error(`❌ Error generating image:`, error);
    throw error;
  }
}

/**
 * Download image from URL and save locally
 * DISABLED: Using placeholder images for now
 */
async function downloadImage(url: string, _rumorId: string): Promise<string> {
  // Skip download for placeholder images
  console.log(`⏭️  Skipping download (using placeholder)`);
  return url;
}

/**
 * Generate and save image for a rumor
 */
async function processRumor(rumor: Rumor): Promise<string> {
  console.log(`\n🔮 Processing rumor: ${rumor.id}`);
  
  // Check if image already exists
  if (rumor.imageUrl) {
    console.log(`⏭️  Image already exists: ${rumor.imageUrl}`);
    return rumor.imageUrl;
  }
  
  try {
    // Generate image
    const imageUrl = await generateImage(rumor);
    
    // Download and save locally
    const localPath = await downloadImage(imageUrl, rumor.id);
    
    return localPath;
  } catch (error) {
    console.error(`❌ Failed to process rumor ${rumor.id}:`, error);
    // Return placeholder image
    return '/assets/webp/placeholder-rumor.png';
  }
}

/**
 * Generate images for all rumors without images
 */
async function generateMissingImages() {
  console.log('🎨 Starting image generation for rumors...\n');
  
  const dataPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const fileContent = await readFile(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);
  
  const rumorsWithoutImages = data.rumors.filter((r: Rumor) => !r.imageUrl);
  
  console.log(`📊 Found ${rumorsWithoutImages.length} rumors without images`);
  console.log(`📊 Total rumors: ${data.rumors.length}\n`);
  
  if (rumorsWithoutImages.length === 0) {
    console.log('✅ All rumors already have images!');
    return;
  }
  
  for (const rumor of rumorsWithoutImages) {
    try {
      const imagePath = await processRumor(rumor);
      
      // Update rumor with image path
      rumor.imageUrl = imagePath;
      
      // Save to both locations after each image (in case of errors)
      const srcPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
      const prodPath = join(process.cwd(), 'content/data/rumors.normalized.json');
      await writeFile(srcPath, JSON.stringify(data, null, 2), 'utf-8');
      await writeFile(prodPath, JSON.stringify(data, null, 2), 'utf-8');
      
      // Rate limiting delay
      console.log('⏳ Waiting 5 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`❌ Error processing rumor ${rumor.id}:`, error);
      continue;
    }
  }
  
  console.log('\n✨ Image generation complete!');
  console.log(`📊 Updated ${rumorsWithoutImages.length} rumors`);
}

/**
 * Generate image for a specific rumor by ID
 */
async function generateForRumor(rumorId: string) {
  console.log(`🎨 Generating image for rumor: ${rumorId}\n`);
  
  const dataPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const fileContent = await readFile(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);
  
  const rumor = data.rumors.find((r: Rumor) => r.id === rumorId);
  
  if (!rumor) {
    console.error(`❌ Rumor not found: ${rumorId}`);
    process.exit(1);
  }
  
  const imagePath = await processRumor(rumor);
  
  // Update rumor and save to both locations
  rumor.imageUrl = imagePath;
  const srcPath = join(process.cwd(), 'src/content/data/rumors.normalized.json');
  const prodPath = join(process.cwd(), 'content/data/rumors.normalized.json');
  await writeFile(srcPath, JSON.stringify(data, null, 2), 'utf-8');
  await writeFile(prodPath, JSON.stringify(data, null, 2), 'utf-8');
  
  console.log(`\n✅ Image saved to: ${imagePath}`);
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'all') {
    generateMissingImages()
      .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Generation failed:', error);
        process.exit(1);
      });
  } else if (command) {
    // Assume it's a rumor ID
    generateForRumor(command)
      .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Generation failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  npm run generate:images all          # Generate all missing images');
    console.log('  npm run generate:images <rumor-id>   # Generate image for specific rumor');
    process.exit(1);
  }
}

export { generateMissingImages, generateForRumor };
