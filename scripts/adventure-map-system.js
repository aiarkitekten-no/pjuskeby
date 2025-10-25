/**
 * 🗺️ PJUSKEBY ADVENTURE MAP - ZOOM SYSTEM
 * 
 * Creates a beautiful cartoon/adventure map style similar to the attached image
 * with multiple zoom levels using DALL-E generated tiles.
 * 
 * Zoom Levels:
 * 1. World Overview (z10-11) - Pjuskeby region in landscape
 * 2. City Overview (z12-13) - Full Pjuskeby town with surroundings  
 * 3. District View (z14-15) - Neighborhoods and main streets
 * 4. Street View (z16-17) - Individual buildings and entities
 * 5. Detail View (z18-19) - Close-up with fine details
 */

// DALL-E prompt templates for different zoom levels
export const DALLE_PROMPTS = {
  worldOverview: `
    Top-down view of a whimsical Norwegian coastal town called Pjuskeby, 
    cartoon adventure map style, similar to fantasy game maps. 
    Features: bright blue water areas, lush green forests with cartoon trees, 
    winding yellow roads, small colorful house clusters representing the town center, 
    fjords and small lakes, rolling hills. 
    Art style: cheerful, colorful, hand-drawn illustration feel, 
    like a storybook or children's adventure map.
    Colors: bright blues for water, vibrant greens for land, yellow for roads.
  `,
  
  cityOverview: `
    Detailed top-down cartoon map of Pjuskeby town center and immediate surroundings.
    Adventure map style with individual colorful buildings (red roofs, varied colors),
    clear winding yellow streets forming a network, blue water areas (bays, small lakes),
    green parks and forest areas with cartoon trees, 
    small bridges connecting land areas across water.
    Style: whimsical, bright colors, storybook illustration, 
    buildings as cute 3D blocks with character.
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
  `,
  
  streetView: `
    Very detailed cartoon street-level map view of Pjuskeby.
    Individual buildings with signs and character (bakeries, mysterious shops, quirky houses),
    cobblestone-textured roads in yellow/beige, 
    detailed water areas with gentle waves, small docks,
    trees with individual leaves visible, street furniture,
    people and activities suggested through small details.
    Style: storybook illustration with fine details, 
    warm and inviting atmosphere.
  `,
  
  detailView: `
    Ultra-detailed cartoon map showing individual Pjuskeby building interiors and courtyards.
    Zoom level showing building details like windows, doors, garden areas,
    fine water details with ripples and reflections,
    individual garden plants and decorations,
    tiny pathways and secret corners, hidden details and easter eggs.
    Style: magical realism, treasure map aesthetic, 
    rich in small discoveries and whimsical details.
  `
};

// Map layer configuration for each zoom level
export const ZOOM_LAYERS = [
  {
    name: 'world-overview',
    minZoom: 10,
    maxZoom: 11,
    tileSize: 512,
    prompt: DALLE_PROMPTS.worldOverview,
    description: 'Wide region view of Pjuskeby and surrounding landscape'
  },
  {
    name: 'city-overview', 
    minZoom: 12,
    maxZoom: 13,
    tileSize: 512,
    prompt: DALLE_PROMPTS.cityOverview,
    description: 'Full town with districts and main roads'
  },
  {
    name: 'district-view',
    minZoom: 14, 
    maxZoom: 15,
    tileSize: 256,
    prompt: DALLE_PROMPTS.districtView,
    description: 'Neighborhood level with individual buildings'
  },
  {
    name: 'street-view',
    minZoom: 16,
    maxZoom: 17, 
    tileSize: 256,
    prompt: DALLE_PROMPTS.streetView,
    description: 'Street level with building details'
  },
  {
    name: 'detail-view',
    minZoom: 18,
    maxZoom: 19,
    tileSize: 128, 
    prompt: DALLE_PROMPTS.detailView,
    description: 'Ultra close-up with fine details'
  }
];

// Entity styling for adventure map
export const ADVENTURE_ENTITY_STYLES = {
  person: {
    icon: '👤',
    color: '#3b82f6',
    size: 'dynamic', // Larger at higher zoom levels
    style: 'cartoon-character',
    zoomBehavior: {
      z10_13: 'hidden',      // Too zoomed out to see individuals
      z14_15: 'small-dot',   // Small colored dot
      z16_17: 'icon',        // Character icon
      z18_19: 'detailed'     // Full character representation
    }
  },
  
  place: {
    icon: '📍',
    color: '#f59e0b',
    size: 'dynamic',
    style: 'landmark-marker',
    zoomBehavior: {
      z10_13: 'label-only',   // Just name labels
      z14_15: 'marker',       // Simple marker
      z16_17: 'detailed',     // Detailed representation
      z18_19: 'immersive'     // Part of the map illustration
    }
  },
  
  business: {
    icon: '🏪',
    color: '#8b5cf6', 
    size: 'dynamic',
    style: 'building-shop',
    zoomBehavior: {
      z10_13: 'hidden',
      z14_15: 'building',     // Show as buildings
      z16_17: 'shop-front',   // Detailed shop fronts
      z18_19: 'interior-hint' // Suggest interior details
    }
  },
  
  street: {
    icon: '🛣️',
    color: '#10b981',
    size: 'linear',
    style: 'winding-path',
    zoomBehavior: {
      z10_13: 'main-roads',   // Only major streets
      z14_15: 'street-grid',  // Full street network  
      z16_17: 'detailed-roads', // Road texture and details
      z18_19: 'cobblestones'  // Individual stone texture
    }
  },
  
  lake: {
    icon: '🏞️',
    color: '#0ea5e9',
    size: 'area',
    style: 'water-body',
    zoomBehavior: {
      z10_13: 'water-areas',  // Blue areas
      z14_15: 'lakes-ponds',  // Defined water bodies
      z16_17: 'water-details', // Waves and shores
      z18_19: 'ripples'       // Water surface details
    }
  }
};

// Adventure map configuration
export const ADVENTURE_MAP_CONFIG = {
  style: 'cartoon-adventure',
  colorScheme: {
    water: '#4FC3F7',        // Bright cartoon blue
    land: '#8BC34A',         // Vibrant green
    roads: '#FFD54F',        // Golden yellow
    buildings: '#FF7043',    // Warm orange/red roofs
    forests: '#4CAF50',      // Forest green
    text: '#2E2E2E'          // Dark readable text
  },
  
  animations: {
    zoomTransition: 'smooth', // Smooth transitions between zoom levels
    entityAppearance: 'fade-in', // How entities appear/disappear
    waterMovement: 'gentle-waves', // Subtle water animation
    treeSwaying: 'light-breeze'   // Subtle tree movement
  },
  
  interactivity: {
    clickableBuildings: true,
    hoverEffects: 'glow',
    soundEffects: 'optional', // Gentle ambient sounds
    storytelling: 'popup-tales' // Stories appear on interaction
  }
};

// Generate DALL-E images for zoom levels
async function generateAdventureMapTiles(zoomLevel, bounds) {
  const layer = ZOOM_LAYERS.find(l => 
    zoomLevel >= l.minZoom && zoomLevel <= l.maxZoom
  );
  
  if (!layer) {
    throw new Error(`No layer defined for zoom level ${zoomLevel}`);
  }
  
  const prompt = `${layer.prompt}
    
    Specific requirements:
    - Pjuskeby town should be centrally located
    - Water areas should be clearly defined in bright blue
    - Buildings should have character and charm
    - Roads should be winding and natural, not geometric
    - Include whimsical details appropriate for zoom level
    - Style: adventure game map, storybook illustration
    - Colors: bright and cheerful, high contrast for readability
    - No text labels (entities will be added programmatically)
  `;
  
  return {
    prompt,
    layer: layer.name,
    zoomLevel,
    bounds,
    tileSize: layer.tileSize,
    description: layer.description
  };
}

// Integration with existing entity system
function adaptEntitiesToAdventureMap(entities, zoomLevel) {
  return entities.map(entity => {
    const style = ADVENTURE_ENTITY_STYLES[entity.type];
    const zoomBehavior = getZoomBehavior(zoomLevel);
    
    return {
      ...entity,
      adventureStyle: {
        ...style,
        currentBehavior: style.zoomBehavior[zoomBehavior],
        visibility: shouldShowAtZoom(entity.type, zoomLevel),
        renderStyle: getAdventureRenderStyle(entity.type, zoomLevel)
      }
    };
  });
}

function getZoomBehavior(zoomLevel) {
  if (zoomLevel <= 13) return 'z10_13';
  if (zoomLevel <= 15) return 'z14_15'; 
  if (zoomLevel <= 17) return 'z16_17';
  return 'z18_19';
}

function shouldShowAtZoom(entityType, zoomLevel) {
  const style = ADVENTURE_ENTITY_STYLES[entityType];
  const behavior = getZoomBehavior(zoomLevel);
  return style.zoomBehavior[behavior] !== 'hidden';
}

function getAdventureRenderStyle(entityType, zoomLevel) {
  // Returns CSS/styling for entities at different zoom levels
  const baseStyle = ADVENTURE_ENTITY_STYLES[entityType];
  const behavior = getZoomBehavior(zoomLevel);
  
  return {
    display: shouldShowAtZoom(entityType, zoomLevel) ? 'block' : 'none',
    size: getEntitySize(zoomLevel),
    color: baseStyle.color,
    icon: baseStyle.icon,
    animation: getEntityAnimation(behavior)
  };
}

function getEntitySize(zoomLevel) {
  if (zoomLevel <= 13) return 'small';
  if (zoomLevel <= 15) return 'medium';
  if (zoomLevel <= 17) return 'large';
  return 'extra-large';
}

function getEntityAnimation(behavior) {
  const animations = {
    'small-dot': 'pulse-gentle',
    'icon': 'bob-slightly', 
    'detailed': 'breathe-softly',
    'building': 'none'
  };
  
  return animations[behavior] || 'none';
}

export {
  ZOOM_LAYERS,
  ADVENTURE_ENTITY_STYLES, 
  ADVENTURE_MAP_CONFIG,
  generateAdventureMapTiles,
  adaptEntitiesToAdventureMap
};