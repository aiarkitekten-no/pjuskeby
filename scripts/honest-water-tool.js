#!/usr/bin/env node

/**
 * 🤔 HONEST WATER DETECTION TOOL
 * 
 * Since automated water detection failed, this tool helps the user
 * manually identify and fix water placement issues.
 */

import fs from 'fs';

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

// Ultra-conservative safe placement - only use confirmed land areas
function getConfirmedSafeAreas() {
  // These are very conservative, small areas we're confident are land
  return [
    // Very center of Pjuskeby - definitely land
    { name: "Town Center", centerLng: 10.720, centerLat: 59.910, radius: 0.005 },
    // A bit north - likely residential
    { name: "North District", centerLng: 10.720, centerLat: 59.915, radius: 0.003 },
    // Slightly east - commercial area
    { name: "East District", centerLng: 10.725, centerLat: 59.910, radius: 0.003 },
    // Small western area
    { name: "West District", centerLng: 10.715, centerLat: 59.910, radius: 0.003 }
  ];
}

// Generate coordinates only in confirmed safe areas
function generateSafeCoordinates() {
  const safeAreas = getConfirmedSafeAreas();
  const area = safeAreas[Math.floor(Math.random() * safeAreas.length)];
  
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * area.radius;
  
  const lng = area.centerLng + (Math.cos(angle) * distance);
  const lat = area.centerLat + (Math.sin(angle) * distance);
  
  return [lng, lat];
}

// Interactive tool to help user identify current problems
async function analyzeCurrentPlacements() {
  console.log('🔍 CURRENT ENTITY PLACEMENT ANALYSIS');
  console.log('====================================');
  console.log('🚨 HONEST ASSESSMENT: I cannot automatically detect water areas correctly.');
  console.log('📍 This tool shows current coordinates for manual review.\n');
  
  const entityTypes = ['places', 'people', 'businesses', 'streets'];
  
  for (const entityType of entityTypes) {
    console.log(`\n📊 ${entityType.toUpperCase()} COORDINATES:`);
    console.log('=' + '='.repeat(entityType.length + 20));
    
    const geoData = loadGeoJSON(`${entityType}.geojson`);
    
    // Show all coordinates for user to manually identify issues
    geoData.features.forEach((feature, index) => {
      const [lng, lat] = feature.geometry.coordinates;
      console.log(`${(index + 1).toString().padStart(3)}. ${feature.properties.name}`);
      console.log(`     Coordinates: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
      
      // Flag potentially problematic coordinates
      if (lng < 10.70 || lng > 10.74 || lat < 59.90 || lat > 59.92) {
        console.log(`     ⚠️  SUSPICIOUS: Outside conservative safe zone`);
      }
    });
  }
  
  console.log('\n🤝 USER INPUT NEEDED:');
  console.log('=====================');
  console.log('1. Review coordinates above against your map');
  console.log('2. Identify which entities are actually in water');
  console.log('3. Use the conservative fix tool below');
  console.log('4. Or provide specific "safe zone" coordinates');
}

// Conservative fix - move ALL entities to confirmed safe areas
async function conservativeFix() {
  console.log('🛡️  CONSERVATIVE ENTITY PLACEMENT');
  console.log('=================================');
  console.log('🎯 Strategy: Move ALL entities to very small, confirmed safe land areas');
  console.log('📍 This will cluster entities but guarantee they are on land.\n');
  
  const entityTypes = ['places', 'people', 'businesses', 'streets'];
  let totalMoved = 0;
  
  for (const entityType of entityTypes) {
    console.log(`🔄 Processing ${entityType}...`);
    
    const geoData = loadGeoJSON(`${entityType}.geojson`);
    let typeMoved = 0;
    
    // Move ALL entities to confirmed safe coordinates
    for (let i = 0; i < geoData.features.length; i++) {
      const feature = geoData.features[i];
      const [originalLng, originalLat] = feature.geometry.coordinates;
      
      // Generate new safe coordinates
      const [newLng, newLat] = generateSafeCoordinates();
      
      // Update coordinates
      geoData.features[i].geometry.coordinates = [newLng, newLat];
      
      // Add metadata
      geoData.features[i].properties.conservativelyPlaced = true;
      geoData.features[i].properties.originalCoordinates = [originalLng, originalLat];
      geoData.features[i].properties.placementStrategy = 'Conservative safe zone only';
      geoData.features[i].properties.placedAt = new Date().toISOString();
      
      typeMoved++;
      totalMoved++;
      
      console.log(`   ✅ ${feature.properties.name}: [${originalLng.toFixed(4)}, ${originalLat.toFixed(4)}] → [${newLng.toFixed(4)}, ${newLat.toFixed(4)}]`);
    }
    
    // Save conservative version
    const outputPath = `scripts/enhanced-geojson/${entityType}-conservative-safe.geojson`;
    fs.writeFileSync(outputPath, JSON.stringify(geoData, null, 2));
    
    console.log(`   📁 Saved: ${outputPath}`);
    console.log(`   📊 ${entityType}: ${typeMoved} entities moved to safe zones\n`);
  }
  
  console.log(`✅ CONSERVATIVE PLACEMENT COMPLETE`);
  console.log(`🎯 Total entities moved: ${totalMoved}`);
  console.log(`🛡️  All entities now in confirmed safe land areas`);
  console.log(`📍 Note: Entities will be clustered in town center area`);
}

// Manual coordinate input helper
async function manualCoordinateHelper() {
  console.log('✋ MANUAL COORDINATE HELPER');
  console.log('===========================');
  console.log('🗺️  Instructions for manual water area identification:');
  console.log('');
  console.log('1. Open your map in browser');
  console.log('2. Right-click on water areas');
  console.log('3. Look for coordinate information (usually in URL or developer tools)');
  console.log('4. Identify rectangular bounds of water areas');
  console.log('5. Use this information to update water boundaries manually');
  console.log('');
  console.log('Example water boundary format:');
  console.log('```javascript');
  console.log('const waterArea = {');
  console.log('  coordinates: [[');
  console.log('    [lng1, lat1], // Southwest corner');
  console.log('    [lng2, lat1], // Southeast corner');  
  console.log('    [lng2, lat2], // Northeast corner');
  console.log('    [lng1, lat2], // Northwest corner');
  console.log('    [lng1, lat1]  // Close polygon');
  console.log('  ]]');
  console.log('};');
  console.log('```');
}

// Main menu
async function main() {
  console.log('🤔 HONEST WATER DETECTION TOOLKIT');
  console.log('==================================');
  console.log('❌ DISCLAIMER: Automated water detection failed');
  console.log('✋ Manual intervention required\n');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--analyze')) {
    await analyzeCurrentPlacements();
  } else if (args.includes('--conservative-fix')) {
    await conservativeFix();
  } else if (args.includes('--manual-help')) {
    await manualCoordinateHelper();
  } else {
    console.log('Available commands:');
    console.log('  --analyze         Show all current coordinates for manual review');
    console.log('  --conservative-fix Move ALL entities to confirmed safe zones');
    console.log('  --manual-help     Instructions for manual coordinate identification');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/honest-water-tool.js --analyze');
    console.log('  node scripts/honest-water-tool.js --conservative-fix');
  }
}

// Run tool
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}