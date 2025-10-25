#!/usr/bin/env node

/**
 * 🎨 SIMPLIFIED DALL-E ADVENTURE MAP GENERATOR
 * 
 * Generates prompts and configuration for beautiful cartoon/adventure map tiles
 */

import fs from 'fs';

// DALL-E prompt templates for different zoom levels
const DALLE_PROMPTS = {
  worldOverview: `
    Top-down view of a whimsical Norwegian coastal town called Pjuskeby, 
    cartoon adventure map style, similar to fantasy game maps. 
    Features: bright blue water areas, lush green forests with cartoon trees, 
    winding yellow roads, small colorful house clusters representing the town center, 
    fjords and small lakes, rolling hills. 
    Art style: cheerful, colorful, hand-drawn illustration feel, 
    like a storybook or children's adventure map.
    Colors: bright blues for water, vibrant greens for land, yellow for roads.
    NO TEXT LABELS OR UI ELEMENTS.
  `,
  
  cityOverview: `
    Detailed top-down cartoon map of Pjuskeby town center and immediate surroundings.
    Adventure map style with individual colorful buildings (red roofs, varied colors),
    clear winding yellow streets forming a network, blue water areas (bays, small lakes),
    green parks and forest areas with cartoon trees, 
    small bridges connecting land areas across water.
    Style: whimsical, bright colors, storybook illustration, 
    buildings as cute 3D blocks with character.
    NO TEXT OR LABELS.
  `,
  
  districtView: `
    Close-up cartoon map of a Pjuskeby neighborhood district.
    Shows individual buildings with distinct personalities (cafes, shops, houses),
    detailed yellow road network with curves and intersections,
    small parks with cartoon trees and benches, 
    water features (ponds, streams) in bright blue,
    walking paths, small details like lamp posts and signs.
    Style: charming village aesthetic, bright cheerful colors, 
    each building unique and characterful.
    NO TEXT LABELS.
  `,
  
  streetView: `
    Very detailed cartoon street-level map view of Pjuskeby.
    Individual buildings with character (bakeries, mysterious shops, quirky houses),
    cobblestone-textured roads in yellow/beige, 
    detailed water areas with gentle waves, small docks,
    trees with individual leaves visible, street furniture,
    people and activities suggested through small details.
    Style: storybook illustration with fine details, 
    warm and inviting atmosphere.
    NO TEXT LABELS.
  `
};

// Map layer configuration for each zoom level
const ZOOM_LAYERS = [
  {
    name: 'world-overview',
    minZoom: 10,
    maxZoom: 11,
    prompt: DALLE_PROMPTS.worldOverview,
    description: 'Wide region view of Pjuskeby and surrounding landscape'
  },
  {
    name: 'city-overview', 
    minZoom: 12,
    maxZoom: 13,
    prompt: DALLE_PROMPTS.cityOverview,
    description: 'Full town with districts and main roads'
  },
  {
    name: 'district-view',
    minZoom: 14, 
    maxZoom: 15,
    prompt: DALLE_PROMPTS.districtView,
    description: 'Neighborhood level with individual buildings'
  },
  {
    name: 'street-view',
    minZoom: 16,
    maxZoom: 17, 
    prompt: DALLE_PROMPTS.streetView,
    description: 'Street level with building details'
  }
];

// Generate all tile specifications
async function generateAllAdventureMapTiles() {
  console.log('🎨 PJUSKEBY ADVENTURE MAP GENERATION');
  console.log('====================================');
  console.log('🗺️  Creating cartoon/adventure style map tiles with DALL-E\n');
  
  const results = [];
  
  for (const layer of ZOOM_LAYERS) {
    console.log(`🖼️  Generating ${layer.name} (zoom ${layer.minZoom}-${layer.maxZoom})...`);
    console.log(`📝 Description: ${layer.description}`);
    
    // Create enhanced prompt with Pjuskeby-specific details
    const enhancedPrompt = `${layer.prompt}

SPECIFIC PJUSKEBY DETAILS:
- Norwegian coastal town atmosphere with fjords and small harbors
- Quirky, absurd elements fitting the town's character
- Winding cobblestone streets with Scandinavian charm
- Mix of traditional Norwegian architecture and whimsical fantasy buildings
- Small fishing boats and docks along the water
- Nordic forest areas with pine and spruce trees
- Rolling hills typical of Norwegian coastal landscape

ART STYLE REQUIREMENTS:
- Cartoon/adventure game map aesthetic (like fantasy RPG overworld maps)
- Bright, saturated colors: ocean blue (#4FC3F7), forest green (#4CAF50), road yellow (#FFD54F)
- Hand-drawn illustration feel, NOT photorealistic  
- Cheerful and inviting atmosphere perfect for storytelling
- Clear visual hierarchy: water=blue, land=green, roads=yellow, buildings=warm colors
- Top-down perspective with slight 3D effect for buildings
- High contrast for web display
- 1024x1024 resolution
- NO TEXT LABELS, UI ELEMENTS, OR WRITTEN WORDS

TECHNICAL:
- Tile-friendly design with seamless edges where possible
- Optimized for zoom level ${layer.minZoom}-${layer.maxZoom}
- Suitable for overlay with interactive elements`;
    
    const tileSpec = {
      layerName: layer.name,
      zoomRange: `${layer.minZoom}-${layer.maxZoom}`,
      prompt: enhancedPrompt,
      timestamp: new Date().toISOString(),
      style: 'cartoon-adventure',
      outputPath: `map-tiles/${layer.name}/`,
      status: 'ready-for-generation'
    };
    
    console.log(`✨ Enhanced prompt created (${enhancedPrompt.length} chars)`);
    console.log('---');
    
    results.push(tileSpec);
  }
  
  return results;
}

// Generate MapLibre configuration
function generateMapLibreConfig(results) {
  const config = {
    version: 8,
    name: 'Pjuskeby Adventure Map',
    metadata: {
      'pjuskeby:type': 'adventure-cartoon',
      'pjuskeby:generated': new Date().toISOString(),
      'pjuskeby:zoom-layers': ZOOM_LAYERS.length
    },
    center: [10.720, 59.910],
    zoom: 13,
    sources: {},
    layers: []
  };
  
  // Add sources for each zoom layer
  results.forEach(result => {
    const layer = ZOOM_LAYERS.find(l => l.name === result.layerName);
    
    config.sources[result.layerName] = {
      type: 'raster',
      tiles: [`https://pjuskeby.org/map-tiles/${result.layerName}/{z}/{x}/{y}.png`],
      tileSize: 512,
      minzoom: layer.minZoom,
      maxzoom: layer.maxZoom,
      attribution: '🎨 Adventure map generated with DALL-E for Pjuskeby'
    };
    
    // Add layer
    config.layers.push({
      id: `${result.layerName}-layer`,
      type: 'raster',
      source: result.layerName,
      minzoom: layer.minZoom,
      maxzoom: layer.maxZoom,
      paint: {
        'raster-opacity': 1.0,
        'raster-fade-duration': 300
      }
    });
  });
  
  return config;
}

// Generate CSS for adventure map styling
function generateAdventureCSS() {
  return `
/* 🎨 Pjuskeby Adventure Map Styles */

.adventure-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  background: #87CEEB; /* Sky blue fallback */
}

/* Entity markers with adventure styling */
.entity-marker {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.entity-marker:hover {
  transform: scale(1.3);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  z-index: 1000;
}

/* Adventure-style animations */
@keyframes gentle-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes adventure-bob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

/* Entity styling by type */
.entity-person {
  background: #3b82f6;
  animation: gentle-pulse 3s infinite;
}

.entity-place {
  background: #f59e0b;
  animation: adventure-bob 4s infinite;
}

.entity-business {
  background: #8b5cf6;
  border-radius: 3px !important;
}

.entity-street {
  background: #10b981;
  border-radius: 0 !important;
  height: 3px !important;
}

.entity-lake {
  background: #0ea5e9;
  border: 2px solid #0284c7;
}

/* Adventure map legend */
.adventure-legend {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 248, 220, 0.95);
  border: 3px solid #8B4513;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  font-family: 'Comic Sans MS', cursive;
  min-width: 220px;
  backdrop-filter: blur(5px);
}

.adventure-legend h3 {
  margin: 0 0 15px 0;
  color: #8B4513;
  text-align: center;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-size: 14px;
  font-weight: bold;
  color: #2E2E2E;
}

.legend-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

/* Adventure tooltip */
.adventure-tooltip {
  background: rgba(255, 248, 220, 0.98);
  border: 3px solid #8B4513;
  border-radius: 12px;
  padding: 15px;
  font-family: 'Comic Sans MS', cursive;
  font-size: 14px;
  color: #2E2E2E;
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
  max-width: 300px;
  backdrop-filter: blur(3px);
}

.adventure-tooltip h4 {
  margin: 0 0 10px 0;
  color: #8B4513;
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
}

/* Story links */
.story-link {
  color: #4FC3F7;
  text-decoration: none;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.6);
}

.story-link:hover {
  color: #0ea5e9;
  text-decoration: underline;
}

/* Loading animation */
.map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: 'Comic Sans MS', cursive;
  font-size: 18px;
  color: #8B4513;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
    const mapConfig = generateMapLibreConfig(tileResults);
    
    // Generate CSS styles
    const adventureCSS = generateAdventureCSS();
    
    // Create output directory structure
    fs.mkdirSync('scripts/map-tiles', { recursive: true });
    
    // Save configuration files
    fs.writeFileSync('scripts/map-tiles/adventure-map-config.json', 
      JSON.stringify(mapConfig, null, 2));
    
    fs.writeFileSync('scripts/map-tiles/adventure-map-styles.css', adventureCSS);
    
    fs.writeFileSync('scripts/map-tiles/dalle-prompts.json', 
      JSON.stringify(tileResults, null, 2));
    
    // Create sample HTML integration
    const sampleHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Pjuskeby Adventure Map</title>
    <link rel="stylesheet" href="adventure-map-styles.css">
    <link href="https://unpkg.com/maplibre-gl@4.6.0/dist/maplibre-gl.css" rel="stylesheet">
    <script src="https://unpkg.com/maplibre-gl@4.6.0/dist/maplibre-gl.js"></script>
</head>
<body>
    <div id="map" class="adventure-map-container"></div>
    
    <div class="adventure-legend">
        <h3>🗺️ Pjuskeby Kart</h3>
        <div class="legend-item">
            <div class="legend-icon entity-person">👤</div>
            <span>Personer</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon entity-place">📍</div>
            <span>Steder</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon entity-business">🏪</div>
            <span>Bedrifter</span>
        </div>
        <div class="legend-item">
            <div class="legend-icon entity-lake">🏞️</div>
            <span>Sjøer</span>
        </div>
    </div>

    <script>
        // Load adventure map configuration
        fetch('adventure-map-config.json')
            .then(response => response.json())
            .then(config => {
                const map = new maplibregl.Map({
                    container: 'map',
                    style: config,
                    center: config.center,
                    zoom: config.zoom
                });
                
                map.on('load', () => {
                    console.log('🎨 Adventure map loaded!');
                    // Add entity layers here
                });
            })
            .catch(error => {
                console.error('Failed to load adventure map:', error);
                document.getElementById('map').innerHTML = 
                    '<div class="map-loading">❌ Failed to load adventure map</div>';
            });
    </script>
</body>
</html>`;
    
    fs.writeFileSync('scripts/map-tiles/adventure-map-example.html', sampleHTML);
    
    console.log('\n📋 ADVENTURE MAP GENERATION SUMMARY:');
    console.log('====================================');
    console.log(`🎨 Zoom layers created: ${ZOOM_LAYERS.length}`);
    console.log(`📁 Files saved to: scripts/map-tiles/`);
    console.log(`🗺️  MapLibre config: adventure-map-config.json`);
    console.log(`🎭 CSS styles: adventure-map-styles.css`);
    console.log(`✨ DALL-E prompts: dalle-prompts.json`);
    console.log(`🌐 Example HTML: adventure-map-example.html`);
    
    console.log('\n🎯 DALL-E PROMPTS READY:');
    console.log('========================');
    tileResults.forEach(result => {
      console.log(`📸 ${result.layerName} (zoom ${result.zoomRange})`);
      console.log(`   Use this prompt in DALL-E 3:`);
      console.log(`   "${result.prompt.substring(0, 100)}..."`);
      console.log('');
    });
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Copy prompts from dalle-prompts.json');
    console.log('2. Generate images using DALL-E 3 (1024x1024, HD quality)');
    console.log('3. Save images as map-tiles/[layer-name]/tile.png');
    console.log('4. Update your map to use adventure-map-config.json');
    console.log('5. Add adventure-map-styles.css to your website');
    
    console.log('\n🎉 RESULT: Beautiful adventure map system ready!');
    console.log('🏞️ Perfect for Pjuskeby\'s whimsical storytelling atmosphere!');
    
  } catch (error) {
    console.error('❌ Adventure map generation failed:', error);
    process.exit(1);
  }
}

// Run generator
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}