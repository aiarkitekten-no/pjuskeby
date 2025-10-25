#!/usr/bin/env node

/**
 * Simple Adventure Tile Creator
 * Creates a single adventure tile to test the system
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createSampleAdventureTile() {
  console.log('🎨 Creating simple adventure tile for testing...');
  
  // Create a simple 256x256 adventure-style tile with Sharp
  const tileBuffer = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 79, g: 195, b: 247, alpha: 1 } // Ocean blue #4FC3F7
    }
  })
  .composite([
    // Add some green land areas
    {
      input: Buffer.from(
        `<svg width="256" height="256">
          <circle cx="128" cy="128" r="60" fill="#4CAF50"/>
          <circle cx="80" cy="80" r="30" fill="#66BB6A"/>  
          <circle cx="180" cy="180" r="40" fill="#388E3C"/>
          <path d="M50 50 L100 70 L90 120 L60 100 Z" fill="#FFD54F"/>
          <path d="M150 50 L200 80 L180 130 L140 100 Z" fill="#FFD54F"/>
        </svg>`
      ),
      top: 0,
      left: 0
    }
  ])
  .png()
  .toBuffer();
  
  // Create directory structure for zoom 13 (where map starts)
  const outputDir = path.join(__dirname, 'public', 'map-tiles', 'city-overview', '13', '4286');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, '2609.png');
  fs.writeFileSync(outputPath, tileBuffer);
  
  console.log(`✅ Sample adventure tile created: ${outputPath}`);
  console.log('🎯 This tile will be displayed at zoom 13 for Moss coordinates');
  
  return outputPath;
}

createSampleAdventureTile().catch(console.error);