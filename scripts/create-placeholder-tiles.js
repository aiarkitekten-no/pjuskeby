#!/usr/bin/env node

/**
 * Create placeholder tiles for adventure map
 * These will be replaced with actual DALL-E generated images
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TILE_DIRS = [
  'map-tiles/world-overview/13/4286',
  'map-tiles/city-overview/13/4286', 
  'map-tiles/district-view/13/4286',
  'map-tiles/street-view/13/4286'
];

const PLACEHOLDER_SVG = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4FC3F7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4CAF50;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <text x="256" y="200" font-family="Comic Sans MS, cursive" font-size="24" 
        text-anchor="middle" fill="white" stroke="#333" stroke-width="1">
    🎨 ÄVENTYRSKARTOR
  </text>
  <text x="256" y="240" font-family="Comic Sans MS, cursive" font-size="18" 
        text-anchor="middle" fill="white" stroke="#333" stroke-width="1">
    Skapas med DALL-E...
  </text>
  <text x="256" y="280" font-family="Comic Sans MS, cursive" font-size="16" 
        text-anchor="middle" fill="#FFD54F" stroke="#333" stroke-width="1">
    Tecknade kartor kommer snart!
  </text>
  <circle cx="256" cy="320" r="20" fill="#FFD54F" opacity="0.8"/>
  <text x="256" y="328" font-family="Arial" font-size="16" 
        text-anchor="middle" fill="#8B4513">
    ⏳
  </text>
</svg>
`;

async function createPlaceholderTiles() {
  console.log('🎨 Creating adventure map placeholder tiles...');
  
  const baseDir = path.join(process.cwd(), 'httpdocs');
  
  for (const tileDir of TILE_DIRS) {
    const fullPath = path.join(baseDir, tileDir);
    
    try {
      // Create directory structure
      await fs.mkdir(fullPath, { recursive: true });
      
      // Create placeholder tile
      const tilePath = path.join(fullPath, '2609.svg');
      await fs.writeFile(tilePath, PLACEHOLDER_SVG);
      
      console.log(`✅ Created: ${tilePath}`);
    } catch (error) {
      console.error(`❌ Error creating ${tileDir}:`, error.message);
    }
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Generate DALL-E images using prompts from dalle-prompts.json');
  console.log('2. Convert to 512x512 PNG tiles');
  console.log('3. Replace SVG placeholders with PNG tiles');
  console.log('4. Update map configuration to use PNG tiles');
  
  console.log('\n📋 DALL-E Generation Commands:');
  console.log('- Use prompts from: ../scripts/map-tiles/dalle-prompts.json');
  console.log('- Generate 4 images (1024x1024 HD quality)');
  console.log('- Save as: map-tiles/[layer]/13/4286/2609.png');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createPlaceholderTiles().catch(console.error);
}

export { createPlaceholderTiles };