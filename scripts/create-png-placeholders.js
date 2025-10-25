#!/usr/bin/env node

/**
 * Create a simple PNG placeholder image for adventure map tiles
 */

import { promises as fs } from 'fs';
import path from 'path';

// Simple PNG placeholder (1x1 blue pixel in base64)
const BLUE_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Generate a 512x512 blue background PNG
const PLACEHOLDER_PNG_512 = Buffer.from(BLUE_PNG_BASE64, 'base64');

const TILE_PATHS = [
  'httpdocs/map-tiles/world-overview/13/4286/2609.png',
  'httpdocs/map-tiles/city-overview/13/4286/2609.png', 
  'httpdocs/map-tiles/district-view/13/4286/2609.png',
  'httpdocs/map-tiles/street-view/13/4286/2609.png'
];

async function createPNGPlaceholders() {
  console.log('🖼️ Creating PNG placeholder tiles for adventure map...');
  
  for (const tilePath of TILE_PATHS) {
    try {
      const fullPath = path.join(process.cwd(), tilePath);
      const dir = path.dirname(fullPath);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      // Create a simple PNG placeholder
      await fs.writeFile(fullPath, PLACEHOLDER_PNG_512);
      
      console.log(`✅ Created PNG: ${tilePath}`);
    } catch (error) {
      console.error(`❌ Error creating ${tilePath}:`, error.message);
    }
  }
  
  console.log('\n🎨 PNG placeholders ready! These will show a simple blue background until DALL-E images are generated.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createPNGPlaceholders().catch(console.error);
}

export { createPNGPlaceholders };