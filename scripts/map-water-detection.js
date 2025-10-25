/**
 * 🗺️ MAP WATER DETECTION - HONEST VERSION
 * 
 * IMPORTANT: Automatic water detection is NOT working correctly.
 * User feedback: "fremdeles ligger MYE i vannet" 
 * 
 * This file provides:
 * 1. Manual water area tools (user must define coordinates)
 * 2. Conservative "safe zone" placement only
 * 3. Tools to help user manually identify water areas
 */

// Water-related keywords for detection
const WATER_KEYWORDS = [
  'bay', 'beach', 'shore', 'ocean', 'sea', 'fjord', 'waterfall', 
  'falls', 'lake', 'pond', 'river', 'stream', 'harbor', 'harbour',
  'pier', 'wharf', 'dock', 'marina', 'reef', 'island', 'coast',
  'splash', 'waves', 'tide', 'maritime', 'aquatic'
];

// Water area categories that should be treated as water zones
const WATER_CATEGORIES = [
  'water', 'ocean', 'sea', 'bay', 'lake', 'river', 'beach', 
  'waterfall', 'marina', 'harbor', 'pier'
];

/**
 * Detect if a place/location is a water area
 */
export function isWaterArea(entity) {
  if (!entity) return false;
  
  // Check explicit category
  if (entity.category && WATER_CATEGORIES.includes(entity.category.toLowerCase())) {
    return true;
  }
  
  // Check name for water keywords
  const name = entity.name?.toLowerCase() || '';
  const hasWaterKeyword = WATER_KEYWORDS.some(keyword => name.includes(keyword));
  
  // Check description for water indicators
  const description = entity.description?.toLowerCase() || '';
  const hasWaterDescription = WATER_KEYWORDS.some(keyword => description.includes(keyword));
  
  // Water area if name OR description contains water keywords
  return hasWaterKeyword || hasWaterDescription;
}

/**
 * Get water boundary polygons for the map area
 * Returns GeoJSON polygon features that define water areas
 * UPDATED: Based on actual map screenshot showing extensive water coverage
 */
export function getWaterBoundaries() {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          name: "Main Water Body - Central",
          type: "water_boundary"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [10.670, 59.470],   // Northwest
            [10.750, 59.470],   // Northeast
            [10.770, 59.430],   // Southeast
            [10.650, 59.420],   // Southwest
            [10.620, 59.440],   // West shore
            [10.630, 59.460],   // West-northwest
            [10.670, 59.470]    // Close polygon
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "Southern Water Area",
          type: "water_boundary"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [10.620, 59.420],   
            [10.780, 59.410],   
            [10.790, 59.380],   
            [10.600, 59.390],   
            [10.620, 59.420]    
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "Northern Coastal Waters",
          type: "water_boundary"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [10.630, 59.480],   
            [10.780, 59.480],   
            [10.790, 59.500],   
            [10.610, 59.510],   
            [10.600, 59.490],   
            [10.630, 59.480]    
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "Western Water Body",
          type: "water_boundary"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [10.580, 59.430],   
            [10.630, 59.440],   
            [10.640, 59.470],   
            [10.590, 59.480],   
            [10.560, 59.450],   
            [10.580, 59.430]    
          ]]
        }
      },
      {
        type: "Feature",
        properties: {
          name: "Eastern Fjord Area",
          type: "water_boundary"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [10.750, 59.440],   
            [10.800, 59.430],   
            [10.820, 59.460],   
            [10.780, 59.480],   
            [10.750, 59.470],   
            [10.750, 59.440]    
          ]]
        }
      }
    ]
  };
}

/**
 * Check if coordinates are in a water area
 */
export function isInWaterArea(lng, lat) {
  const waterBoundaries = getWaterBoundaries();
  
  for (const feature of waterBoundaries.features) {
    if (pointInPolygon([lng, lat], feature.geometry.coordinates[0])) {
      return true;
    }
  }
  
  return false;
}

/**
 * Point-in-polygon algorithm
 */
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Suggest alternative coordinates for entities placed in water
 * IMPROVED: Multiple safe land zones and smart positioning
 */
export function suggestLandCoordinates(originalLng, originalLat) {
  // Define safe land zones (areas definitely not in water based on map)
  const safeLandZones = [
    // Central Pjuskeby - main town area
    { centerLng: 10.720, centerLat: 59.520, radius: 0.015 },
    // Northern residential area
    { centerLng: 10.705, centerLat: 59.540, radius: 0.012 },
    // Eastern district
    { centerLng: 10.740, centerLat: 59.525, radius: 0.010 },
    // Western hills
    { centerLng: 10.690, centerLat: 59.515, radius: 0.008 },
    // Southern outskirts
    { centerLng: 10.715, centerLat: 59.500, radius: 0.010 }
  ];
  
  // Find the closest safe land zone
  let closestZone = safeLandZones[0];
  let minDistance = Infinity;
  
  for (const zone of safeLandZones) {
    const distance = Math.sqrt(
      Math.pow(zone.centerLng - originalLng, 2) + 
      Math.pow(zone.centerLat - originalLat, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestZone = zone;
    }
  }
  
  // Generate random position within the safe zone
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * closestZone.radius;
  
  const newLng = closestZone.centerLng + (Math.cos(angle) * distance);
  const newLat = closestZone.centerLat + (Math.sin(angle) * distance);
  
  return [newLng, newLat];
}

/**
 * Enhanced entity data with water detection for map display
 */
export function enrichEntityForMap(entity) {
  const enriched = { ...entity };
  
  // Add water area flag
  enriched.isWaterArea = isWaterArea(entity);
  
  // Add special map styling for water areas
  if (enriched.isWaterArea) {
    enriched.mapStyle = {
      color: '#0ea5e9',      // Ocean blue
      borderColor: '#0284c7', // Darker blue border
      icon: '🌊'             // Water wave emoji
    };
  }
  
  // Check if coordinates are in water (for non-water entities)
  if (entity.coordinates && !enriched.isWaterArea) {
    const [lng, lat] = entity.coordinates;
    if (isInWaterArea(lng, lat)) {
      enriched.coordinateWarning = "This entity appears to be placed in a water area";
      enriched.suggestedCoordinates = suggestLandCoordinates(lng, lat);
    }
  }
  
  return enriched;
}

/**
 * Generate map layer configuration for water boundaries  
 */
export function getWaterLayerConfig() {
  return {
    id: 'water-boundaries',
    type: 'fill',
    source: 'water-boundaries',
    layout: {},
    paint: {
      'fill-color': '#0ea5e9',
      'fill-opacity': 0.2,
      'fill-outline-color': '#0284c7'
    }
  };
}

/**
 * Enhanced clustering configuration that respects water boundaries
 */
export function getEntityClusterConfig(entityType) {
  const baseConfig = {
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  };
  
  // Add water-aware clustering options
  if (entityType === 'places') {
    return {
      ...baseConfig,
      // Separate water and land clusters
      clusterProperties: {
        'water_count': ['+', ['case', ['get', 'isWaterArea'], 1, 0]],
        'land_count': ['+', ['case', ['get', 'isWaterArea'], 0, 1]]
      }
    };
  }
  
  return baseConfig;
}

export {
  WATER_KEYWORDS,
  WATER_CATEGORIES
};