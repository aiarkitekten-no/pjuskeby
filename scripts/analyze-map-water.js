#!/usr/bin/env node

/**
 * 🌊 MAP WATER ANALYSIS & ENTITY VALIDATION
 * 
 * Analyzes current map data to:
 * 1. Identify water areas and entities placed incorrectly in water
 * 2. Validate entity cross-reference system integration with map
 * 3. Generate enhanced GeoJSON with water detection metadata
 */

import fs from 'fs';
import { isWaterArea, isInWaterArea, suggestLandCoordinates, enrichEntityForMap } from './map-water-detection.js';

// Load GeoJSON data
function loadGeoJSON(filename) {
  try {
    const data = fs.readFileSync(`httpdocs/client/geojson/${filename}`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message);
    return { type: "FeatureCollection", features: [] };
  }
}

// Analyze water placement issues
async function analyzeWaterPlacement() {
  console.log('🌊 ANALYZING WATER PLACEMENT ON PJUSKEBY MAP');
  console.log('============================================\n');
  
  const entityTypes = ['places', 'people', 'businesses', 'streets'];
  const results = {
    total: 0,
    waterAreas: 0,
    landEntitiesInWater: 0,
    suggestions: []
  };
  
  for (const entityType of entityTypes) {
    console.log(`📍 Analyzing ${entityType}...`);
    
    const geoData = loadGeoJSON(`${entityType}.geojson`);
    const typeStats = {
      total: geoData.features.length,
      waterAreas: 0,
      inWater: 0,
      warnings: []
    };
    
    for (const feature of geoData.features) {
      results.total++;
      typeStats.total++;
      
      const entity = {
        name: feature.properties.name,
        category: feature.properties.category,
        description: feature.properties.description,
        coordinates: feature.geometry.coordinates,
        type: entityType.slice(0, -1) // Remove 's' (places -> place)
      };
      
      // Check if this is a water area
      const isWater = isWaterArea(entity);
      if (isWater) {
        results.waterAreas++;
        typeStats.waterAreas++;
        console.log(`   🌊 Water area: ${entity.name}`);
      }
      
      // Check if non-water entity is placed in water
      if (!isWater && entity.coordinates) {
        const [lng, lat] = entity.coordinates;
        if (isInWaterArea(lng, lat)) {
          results.landEntitiesInWater++;
          typeStats.inWater++;
          
          const suggested = suggestLandCoordinates(lng, lat);
          const warning = {
            entity: entity.name,
            type: entityType,
            issue: 'Land entity placed in water area',
            currentCoords: [lng, lat],
            suggestedCoords: suggested
          };
          
          typeStats.warnings.push(warning);
          results.suggestions.push(warning);
          
          console.log(`   ⚠️  ${entity.name} is in water! Current: [${lng.toFixed(4)}, ${lat.toFixed(4)}] → Suggested: [${suggested[0].toFixed(4)}, ${suggested[1].toFixed(4)}]`);
        }
      }
    }
    
    console.log(`   📊 ${entityType}: ${typeStats.total} total, ${typeStats.waterAreas} water areas, ${typeStats.inWater} placement issues\n`);
  }
  
  return results;
}

// Validate entity database integration with map
async function validateEntityIntegration() {
  console.log('🔗 VALIDATING ENTITY-MAP INTEGRATION');
  console.log('=====================================\n');
  
  // Check which entity types have both database entries AND GeoJSON representations
  const entityTypes = ['people', 'places', 'businesses', 'streets'];
  const integration = {};
  
  // Import from our database sync to get counts
  console.log('📊 Entity Database vs. Map Coverage:');
  console.log('Entity Type      | DB Count | Map Count | Coverage');
  console.log('-----------------|----------|-----------|----------');
  
  for (const entityType of entityTypes) {
    const geoData = loadGeoJSON(`${entityType}.geojson`);
    const mapCount = geoData.features.length;
    
    // These numbers come from our previous sync
    const dbCounts = {
      people: 25,
      places: 51, 
      businesses: 25,
      streets: 25,
      lakes: 26  // Note: lakes not yet in map
    };
    
    const dbCount = dbCounts[entityType] || 0;
    const coverage = dbCount > 0 ? ((mapCount / dbCount) * 100).toFixed(1) : '0.0';
    
    console.log(`${entityType.padEnd(16)} | ${dbCount.toString().padStart(8)} | ${mapCount.toString().padStart(9)} | ${coverage.padStart(7)}%`);
    
    integration[entityType] = {
      database: dbCount,
      map: mapCount,
      coverage: parseFloat(coverage)
    };
  }
  
  // Check for missing lake integration
  const lakesDb = 26;
  console.log(`lakes            | ${lakesDb.toString().padStart(8)} | ${'0'.padStart(9)} | ${'0.0'.padStart(7)}% ⚠️  Missing!`);
  
  return integration;
}

// Generate enhanced GeoJSON with water metadata
async function generateEnhancedGeoJSON() {
  console.log('\n🔧 GENERATING ENHANCED GEOJSON WITH WATER METADATA');
  console.log('===================================================\n');
  
  const entityTypes = ['places', 'people', 'businesses', 'streets'];
  
  for (const entityType of entityTypes) {
    const geoData = loadGeoJSON(`${entityType}.geojson`);
    const enhanced = {
      type: "FeatureCollection",
      metadata: {
        enhanced: true,
        waterDetection: true,
        generatedAt: new Date().toISOString(),
        totalFeatures: geoData.features.length
      },
      features: []
    };
    
    let waterCount = 0;
    let warningCount = 0;
    
    for (const feature of geoData.features) {
      const entity = {
        name: feature.properties.name,
        category: feature.properties.category,
        description: feature.properties.description,
        coordinates: feature.geometry.coordinates
      };
      
      const enrichedEntity = enrichEntityForMap(entity);
      
      // Add enriched metadata to GeoJSON properties
      const enhancedFeature = {
        ...feature,
        properties: {
          ...feature.properties,
          isWaterArea: enrichedEntity.isWaterArea,
          waterDetected: enrichedEntity.isWaterArea,
          mapStyle: enrichedEntity.mapStyle,
          coordinateWarning: enrichedEntity.coordinateWarning,
          suggestedCoordinates: enrichedEntity.suggestedCoordinates
        }
      };
      
      if (enrichedEntity.isWaterArea) waterCount++;
      if (enrichedEntity.coordinateWarning) warningCount++;
      
      enhanced.features.push(enhancedFeature);
    }
    
    enhanced.metadata.waterAreas = waterCount;
    enhanced.metadata.coordinateWarnings = warningCount;
    
    // Save enhanced version
    const outputPath = `scripts/enhanced-geojson/${entityType}-enhanced.geojson`;
    fs.writeFileSync(outputPath, JSON.stringify(enhanced, null, 2));
    
    console.log(`✅ Enhanced ${entityType}: ${enhanced.features.length} features, ${waterCount} water areas, ${warningCount} warnings`);
    console.log(`   📁 Saved to: ${outputPath}`);
  }
}

// Main analysis function
async function main() {
  console.log('🗺️ PJUSKEBY MAP WATER DETECTION & ENTITY ANALYSIS');
  console.log('==================================================');
  console.log(`📅 Analysis Date: ${new Date().toISOString()}\n`);
  
  try {
    // 1. Analyze water placement issues
    const waterResults = await analyzeWaterPlacement();
    
    // 2. Validate entity integration  
    const integration = await validateEntityIntegration();
    
    // 3. Generate enhanced GeoJSON
    await generateEnhancedGeoJSON();
    
    // 4. Summary report
    console.log('\n📋 ANALYSIS SUMMARY');
    console.log('===================');
    console.log(`🏢 Total entities analyzed: ${waterResults.total}`);
    console.log(`🌊 Water areas identified: ${waterResults.waterAreas}`);
    console.log(`⚠️  Entities in water: ${waterResults.landEntitiesInWater}`);
    console.log(`🗂️ Enhanced GeoJSON files generated: 4`);
    
    if (waterResults.landEntitiesInWater > 0) {
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      console.log('1. Review entities placed in water areas');
      console.log('2. Update coordinates using suggested positions');
      console.log('3. Add lakes.geojson to map visualization');
      console.log('4. Implement water boundary layer in map');
    }
    
    console.log('\n✅ Analysis complete! Enhanced GeoJSON files ready for map integration.');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeWaterPlacement, validateEntityIntegration };