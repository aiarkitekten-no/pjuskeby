#!/usr/bin/env node

/**
 * 🌊 COMPREHENSIVE WATER CLEANUP - MOVE ALL ENTITIES OUT OF WATER
 * 
 * Based on user feedback showing many entities still in water areas,
 * this script will:
 * 1. Use improved water detection with actual map boundaries
 * 2. Move ALL entities found in water to safe land areas
 * 3. Update the GeoJSON files with corrected coordinates
 * 4. Generate a detailed report of all moves made
 */

import fs from 'fs';
import { isInWaterArea, suggestLandCoordinates } from './map-water-detection.js';

// Load and save GeoJSON safely
function loadGeoJSON(filename) {
  try {
    const data = fs.readFileSync(`httpdocs/client/geojson/${filename}`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message);
    return { type: "FeatureCollection", features: [] };
  }
}

function saveGeoJSON(filename, data) {
  const backupPath = `scripts/backup-geojson/${filename.replace('.geojson', '')}-backup-${Date.now()}.geojson`;
  const outputPath = `scripts/enhanced-geojson/${filename.replace('.geojson', '')}-water-fixed.geojson`;
  
  try {
    // Create backup directory
    fs.mkdirSync('scripts/backup-geojson', { recursive: true });
    
    // Backup original
    const original = loadGeoJSON(filename);
    fs.writeFileSync(backupPath, JSON.stringify(original, null, 2));
    
    // Save corrected version
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    return { backupPath, outputPath };
  } catch (error) {
    console.error(`❌ Failed to save ${filename}:`, error.message);
    return null;
  }
}

// Comprehensive water cleanup
async function performWaterCleanup() {
  console.log('🌊 COMPREHENSIVE WATER CLEANUP OPERATION');
  console.log('========================================');
  console.log(`📅 Operation Date: ${new Date().toISOString()}\n`);
  
  const entityTypes = ['places', 'people', 'businesses', 'streets'];
  const cleanupReport = {
    totalProcessed: 0,
    totalMoved: 0,
    byType: {},
    moves: []
  };
  
  for (const entityType of entityTypes) {
    console.log(`🔍 Processing ${entityType}...`);
    
    const geoData = loadGeoJSON(`${entityType}.geojson`);
    const typeReport = {
      processed: geoData.features.length,
      moved: 0,
      entities: []
    };
    
    // Process each feature
    for (let i = 0; i < geoData.features.length; i++) {
      const feature = geoData.features[i];
      const [originalLng, originalLat] = feature.geometry.coordinates;
      
      cleanupReport.totalProcessed++;
      typeReport.processed++;
      
      // Check if entity is in water (excluding intentional water areas)
      const isWater = feature.properties.category === 'water' || 
                      feature.properties.isWaterArea === true ||
                      (feature.properties.name && 
                       ['bay', 'beach', 'shore', 'ocean', 'sea', 'fjord', 'waterfall', 
                        'falls', 'lake', 'pond', 'river', 'pier', 'dock'].some(water => 
                         feature.properties.name.toLowerCase().includes(water)));
      
      if (!isWater && isInWaterArea(originalLng, originalLat)) {
        // Entity is in water and shouldn't be - move it!
        const [newLng, newLat] = suggestLandCoordinates(originalLng, originalLat);
        
        // Update coordinates
        geoData.features[i].geometry.coordinates = [newLng, newLat];
        
        // Add metadata about the move
        geoData.features[i].properties.wasMovedFromWater = true;
        geoData.features[i].properties.originalCoordinates = [originalLng, originalLat];
        geoData.features[i].properties.movedAt = new Date().toISOString();
        geoData.features[i].properties.moveReason = 'Entity was placed in water area';
        
        const moveRecord = {
          entity: feature.properties.name,
          type: entityType,
          from: [originalLng, originalLat],
          to: [newLng, newLat],
          distance: Math.sqrt(Math.pow(newLng - originalLng, 2) + Math.pow(newLat - originalLat, 2))
        };
        
        typeReport.moved++;
        cleanupReport.totalMoved++;
        typeReport.entities.push(moveRecord);
        cleanupReport.moves.push(moveRecord);
        
        console.log(`   🚚 MOVED: ${feature.properties.name}`);
        console.log(`      From: [${originalLng.toFixed(6)}, ${originalLat.toFixed(6)}]`);
        console.log(`      To:   [${newLng.toFixed(6)}, ${newLat.toFixed(6)}]`);
        console.log(`      Distance: ${(moveRecord.distance * 111000).toFixed(0)}m`);
      }
    }
    
    // Add metadata to GeoJSON
    geoData.metadata = {
      ...geoData.metadata,
      waterCleanupPerformed: true,
      cleanupDate: new Date().toISOString(),
      entitiesMoved: typeReport.moved,
      totalEntities: typeReport.processed
    };
    
    // Save corrected GeoJSON
    const saveResult = saveGeoJSON(`${entityType}.geojson`, geoData);
    if (saveResult) {
      console.log(`   ✅ Saved corrected ${entityType} to: ${saveResult.outputPath}`);
      console.log(`   💾 Backup created: ${saveResult.backupPath}`);
    }
    
    console.log(`   📊 ${entityType}: ${typeReport.processed} processed, ${typeReport.moved} moved\n`);
    cleanupReport.byType[entityType] = typeReport;
  }
  
  return cleanupReport;
}

// Generate detailed cleanup report
function generateCleanupReport(report) {
  console.log('📋 WATER CLEANUP SUMMARY REPORT');
  console.log('===============================');
  console.log(`🏢 Total entities processed: ${report.totalProcessed}`);
  console.log(`🚚 Total entities moved: ${report.totalMoved}`);
  console.log(`📊 Success rate: ${((report.totalProcessed - report.totalMoved) / report.totalProcessed * 100).toFixed(1)}% already correctly placed`);
  
  console.log('\n📊 BREAKDOWN BY ENTITY TYPE:');
  console.log('Entity Type      | Processed | Moved | Cleanup Rate');
  console.log('-----------------|-----------|-------|-------------');
  
  Object.entries(report.byType).forEach(([type, data]) => {
    const cleanupRate = ((data.processed - data.moved) / data.processed * 100).toFixed(1);
    const status = data.moved === 0 ? '✅' : '🔧';
    console.log(`${type.padEnd(16)} | ${data.processed.toString().padStart(9)} | ${data.moved.toString().padStart(5)} | ${cleanupRate.padStart(10)}% ${status}`);
  });
  
  if (report.totalMoved > 0) {
    console.log('\n🚚 TOP ENTITIES MOVED (by distance):');
    const topMoves = report.moves
      .sort((a, b) => b.distance - a.distance)
      .slice(0, 10);
      
    topMoves.forEach((move, index) => {
      const distanceM = (move.distance * 111000).toFixed(0);
      console.log(`   ${index + 1}. ${move.entity} (${move.type}) - ${distanceM}m`);
    });
  }
  
  console.log('\n✅ WATER CLEANUP COMPLETE!');
  console.log('🗺️ All entities should now be on land areas');
  console.log('📁 Corrected GeoJSON files available in scripts/enhanced-geojson/');
  console.log('💾 Original files backed up in scripts/backup-geojson/');
}

// Main cleanup operation
async function main() {
  try {
    const report = await performWaterCleanup();
    generateCleanupReport(report);
    
    if (report.totalMoved > 0) {
      console.log('\n🔧 NEXT STEPS:');
      console.log('1. Review corrected entity positions');
      console.log('2. Copy corrected files from scripts/enhanced-geojson/ to httpdocs/client/geojson/');
      console.log('3. Test map to verify no entities remain in water');
      console.log('4. Update any hardcoded coordinates in database if needed');
    } else {
      console.log('\n🎉 NO ENTITIES WERE IN WATER - MAP IS CLEAN!');
    }
    
  } catch (error) {
    console.error('❌ Water cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { performWaterCleanup };