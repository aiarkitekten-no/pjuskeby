#!/usr/bin/env node

/**
 * 🎨 DALL-E ADVENTURE MAP GENERATOR
 * 
 * Generates beautiful cartoon/adventure map tiles for Pjuskeby
 * using DALL-E API across multiple zoom levels.
 */

import fs from 'fs';
import { DALLE_PROMPTS, ZOOM_LAYERS, ADVENTURE_MAP_CONFIG } from './adventure-map-system.js';

// DALL-E API configuration (placeholder - needs actual API key)
const DALLE_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
  model: 'dall-e-3',
  size: '1024x1024', // Standard size
  quality: 'hd'
};

// Generate map tiles for all zoom levels
async function generateAllAdventureMapTiles() {
  console.log('🎨 PJUSKEBY ADVENTURE MAP GENERATION');
  console.log('====================================');
  console.log('🗺️  Creating cartoon/adventure style map tiles with DALL-E\n');
  
  const results = [];
  
  for (const layer of ZOOM_LAYERS) {
    console.log(`🖼️  Generating ${layer.name} (zoom ${layer.minZoom}-${layer.maxZoom})...`);
    console.log(`📝 Description: ${layer.description}`);
    
    const tileSpec = {
      layerName: layer.name,
      zoomRange: `${layer.minZoom}-${layer.maxZoom}`,
      prompt: layer.prompt,
      timestamp: new Date().toISOString(),
      style: 'cartoon-adventure'
    };
    
    // For demonstration, we'll create the full prompts
    // In production, these would be sent to DALL-E API
    const enhancedPrompt = createEnhancedPrompt(layer);
    
    console.log(`✨ Enhanced prompt created (${enhancedPrompt.length} chars)`);
    console.log('---');
    
    results.push({
      ...tileSpec,
      enhancedPrompt,
      outputPath: `map-tiles/${layer.name}/`,
      status: 'ready-for-generation'
    });
  }
  
  return results;
}

// Create enhanced DALL-E prompt with specific Pjuskeby details
function createEnhancedPrompt(layer) {
  const basePrompt = layer.prompt;
  
  const pjuskebyDetails = `
    Specific Pjuskeby world details to include:
    - Norwegian coastal town atmosphere with fjords
    - Quirky, absurd elements (like businesses named "Blubber & Crumb", "Sock Exchange")
    - Winding cobblestone streets with Norwegian character
    - Mix of traditional Norwegian architecture and whimsical fantasy buildings
    - Small harbors with fishing boats and docks
    - Forest areas with Nordic trees (pine, spruce)
    - Rolling hills typical of Norwegian landscape
    - Weather: partly cloudy, Nordic light
  `;
  
  const styleGuide = `
    Art style requirements:
    - Cartoon/adventure game map aesthetic similar to fantasy RPG overworld maps
    - Bright, saturated colors: ocean blue (#4FC3F7), forest green (#4CAF50), road yellow (#FFD54F)
    - Hand-drawn illustration feel, NOT photorealistic
    - Cheerful and inviting atmosphere suitable for storytelling
    - Clear visual hierarchy: water=blue, land=green, roads=yellow, buildings=warm colors
    - No UI elements or text labels (added programmatically later)
    - Top-down perspective with slight 3D building effect
  `;
  
  const technicalSpecs = `
    Technical requirements:
    - High contrast for web display
    - Tile-friendly design (seamless edges where possible)
    - Optimized for zoom level ${layer.minZoom}-${layer.maxZoom}
    - 1024x1024 resolution
    - Suitable for overlay with interactive elements
  `;
  
  return `${basePrompt}\n\n${pjuskebyDetails}\n\n${styleGuide}\n\n${technicalSpecs}`;
}

// Generate tile specifications for MapLibre integration
function generateMapLibreTileConfig(results) {
  const config = {
    version: 8,
    name: 'Pjuskeby Adventure Map',
    metadata: {
      'pjuskeby:type': 'adventure-cartoon',
      'pjuskeby:generated': new Date().toISOString(),
      'pjuskeby:zoom-layers': ZOOM_LAYERS.length
    },
    sources: {},
    layers: []
  };
  
  // Add sources for each zoom layer
  results.forEach(result => {
    config.sources[result.layerName] = {
      type: 'raster',
      tiles: [`/map-tiles/${result.layerName}/{z}/{x}/{y}.png`],
      tileSize: ZOOM_LAYERS.find(l => l.name === result.layerName).tileSize,
      minzoom: parseInt(result.zoomRange.split('-')[0]),
      maxzoom: parseInt(result.zoomRange.split('-')[1]),
      attribution: 'Generated with DALL-E for Pjuskeby'
    };
    
    // Add layer
    config.layers.push({
      id: `${result.layerName}-layer`,
      type: 'raster',
      source: result.layerName,
      minzoom: parseInt(result.zoomRange.split('-')[0]),
      maxzoom: parseInt(result.zoomRange.split('-')[1]),
      paint: {
        'raster-opacity': 1.0,
        'raster-fade-duration': 300
      }
    });
  });
  
  return config;
}

// Create CSS animations for adventure map elements
function generateAdventureMapCSS() {
  return `
/* 🎨 Pjuskeby Adventure Map Styles */

.adventure-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

/* Entity animations based on zoom level */
.entity-marker {
  transition: all 0.3s ease;
  cursor: pointer;
}

.entity-marker:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

/* Zoom-specific entity styles */
.zoom-10-13 .entity-person { display: none; }
.zoom-10-13 .entity-business { display: none; }
.zoom-10-13 .entity-place { 
  font-size: 14px; 
  font-weight: bold;
  text-shadow: 2px 2px 4px white;
}

.zoom-14-15 .entity-person { 
  width: 6px; 
  height: 6px; 
  border-radius: 50%;
  animation: pulse-gentle 2s infinite;
}
.zoom-14-15 .entity-business { 
  width: 12px; 
  height: 12px; 
  border-radius: 2px;
}

.zoom-16-17 .entity-person { 
  width: 16px; 
  height: 16px;
  font-size: 12px;
  animation: bob-slightly 3s ease-in-out infinite;
}
.zoom-16-17 .entity-business { 
  width: 20px; 
  height: 20px; 
  font-size: 14px;
}

.zoom-18-19 .entity-person { 
  width: 24px; 
  height: 24px; 
  font-size: 16px;
  animation: breathe-softly 4s ease-in-out infinite;
}

/* Adventure-style animations */
@keyframes pulse-gentle {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes bob-slightly {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

@keyframes breathe-softly {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Adventure map UI elements */
.adventure-map-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid #8B4513;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-family: 'Comic Sans MS', cursive;
  min-width: 200px;
}

.adventure-map-legend h3 {
  margin: 0 0 10px 0;
  color: #8B4513;
  text-align: center;
  font-size: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size: 14px;
}

.legend-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tooltip styling */
.adventure-tooltip {
  background: rgba(255, 248, 220, 0.95);
  border: 2px solid #8B4513;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Comic Sans MS', cursive;
  font-size: 13px;
  color: #2E2E2E;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  max-width: 250px;
}

.adventure-tooltip h4 {
  margin: 0 0 8px 0;
  color: #8B4513;
  font-size: 15px;
}

/* Story integration */
.entity-story-link {
  color: #4FC3F7;
  text-decoration: none;
  font-weight: bold;
}

.entity-story-link:hover {
  text-decoration: underline;
  color: #0ea5e9;
}

/* Water animation */
.water-areas {
  animation: gentle-waves 6s ease-in-out infinite;
}

@keyframes gentle-waves {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(5deg) brightness(1.1); }
}
`;
}

// Main generation process
async function main() {
  try {
    console.log('🚀 Starting Pjuskeby Adventure Map Generation...\n');
    
    // Generate all tile specifications
    const tileResults = await generateAllAdventureMapTiles();
    
    // Create MapLibre configuration
    const mapConfig = generateMapLibreTileConfig(tileResults);
    
    // Generate CSS styles
    const adventureCSS = generateAdventureMapCSS();
    
    // Create output directory structure
    fs.mkdirSync('map-tiles', { recursive: true });
    
    // Save configuration files
    fs.writeFileSync('scripts/map-tiles/adventure-map-config.json', 
      JSON.stringify(mapConfig, null, 2));
    
    fs.writeFileSync('scripts/map-tiles/adventure-map-styles.css', adventureCSS);
    
    fs.writeFileSync('scripts/map-tiles/dalle-prompts.json', 
      JSON.stringify(tileResults, null, 2));
    
    console.log('\n📋 ADVENTURE MAP GENERATION SUMMARY:');
    console.log('====================================');
    console.log(`🎨 Zoom layers created: ${ZOOM_LAYERS.length}`);
    console.log(`📁 Config files saved to: scripts/map-tiles/`);
    console.log(`🗺️  MapLibre config: adventure-map-config.json`);
    console.log(`🎭 CSS styles: adventure-map-styles.css`);
    console.log(`✨ DALL-E prompts: dalle-prompts.json`);
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Use the prompts in dalle-prompts.json with DALL-E API');
    console.log('2. Save generated images in map-tiles/[layer-name]/ directories');
    console.log('3. Integrate adventure-map-config.json into MapLibre');
    console.log('4. Add adventure-map-styles.css to your website');
    console.log('5. Update entity system to use adventure styling');
    
    console.log('\n🎯 RESULT: Beautiful adventure map system ready!');
    console.log('📖 Perfect for Pjuskeby\'s storytelling and whimsical atmosphere!');
    
  } catch (error) {
    console.error('❌ Adventure map generation failed:', error);
    process.exit(1);
  }
}

// Run generator
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateAllAdventureMapTiles, createEnhancedPrompt, generateMapLibreTileConfig };