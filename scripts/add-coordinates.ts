/**
 * Add fictional coordinates to normalized entities
 * 
 * Pjuskeby town bounds: approximately 59.90 - 59.92 N, 10.70 - 10.74 E
 * (Fictional Norwegian coastal town near Oslo area)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pjuskeby bounds (fictional coordinates)
const BOUNDS = {
  minLat: 59.900,
  maxLat: 59.920,
  minLng: 10.700,
  maxLng: 10.740
};

// Generate random coordinate within bounds
function randomCoordinate(): [number, number] {
  const lng = BOUNDS.minLng + Math.random() * (BOUNDS.maxLng - BOUNDS.minLng);
  const lat = BOUNDS.minLat + Math.random() * (BOUNDS.maxLat - BOUNDS.minLat);
  return [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))];
}

// Generate street LineString with 2-4 points
function generateStreetGeometry(): { type: 'LineString'; coordinates: number[][] } {
  const numPoints = 2 + Math.floor(Math.random() * 3); // 2-4 points
  const coordinates: number[][] = [];
  
  // Start point
  const [startLng, startLat] = randomCoordinate();
  coordinates.push([startLng, startLat]);
  
  // Generate remaining points in roughly same direction
  const angle = Math.random() * Math.PI * 2;
  const stepSize = 0.002; // ~200m steps
  
  for (let i = 1; i < numPoints; i++) {
    const prevLng = coordinates[i - 1][0];
    const prevLat = coordinates[i - 1][1];
    
    // Add some randomness to create curved streets
    const angleVariation = (Math.random() - 0.5) * 0.5;
    const actualAngle = angle + angleVariation;
    
    const lng = prevLng + Math.cos(actualAngle) * stepSize;
    const lat = prevLat + Math.sin(actualAngle) * stepSize;
    
    coordinates.push([parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))]);
  }
  
  return { type: 'LineString', coordinates };
}

async function addCoordinates() {
  const dataDir = path.join(__dirname, '../content/data');
  
  // Process places
  const placesPath = path.join(dataDir, 'places.normalized.json');
  const places = JSON.parse(fs.readFileSync(placesPath, 'utf-8'));
  
  places.forEach((place: any) => {
    if (!place.geo) {
      place.geo = {
        type: 'Point',
        coordinates: randomCoordinate()
      };
    }
  });
  
  fs.writeFileSync(placesPath, JSON.stringify(places, null, 2));
  console.log(`✓ Added coordinates to ${places.length} places`);
  
  // Process streets
  const streetsPath = path.join(dataDir, 'streets.normalized.json');
  const streets = JSON.parse(fs.readFileSync(streetsPath, 'utf-8'));
  
  streets.forEach((street: any) => {
    if (!street.geo) {
      street.geo = generateStreetGeometry();
    }
  });
  
  fs.writeFileSync(streetsPath, JSON.stringify(streets, null, 2));
  console.log(`✓ Added coordinates to ${streets.length} streets`);
  
  // Process people (add home location)
  const peoplePath = path.join(dataDir, 'people.normalized.json');
  const people = JSON.parse(fs.readFileSync(peoplePath, 'utf-8'));
  
  people.forEach((person: any) => {
    if (!person.geo) {
      person.geo = {
        type: 'Point',
        coordinates: randomCoordinate()
      };
    }
  });
  
  fs.writeFileSync(peoplePath, JSON.stringify(people, null, 2));
  console.log(`✓ Added coordinates to ${people.length} people`);
  
  // Process businesses
  const businessesPath = path.join(dataDir, 'businesses.normalized.json');
  const businesses = JSON.parse(fs.readFileSync(businessesPath, 'utf-8'));
  
  businesses.forEach((business: any) => {
    if (!business.geo) {
      business.geo = {
        type: 'Point',
        coordinates: randomCoordinate()
      };
    }
  });
  
  fs.writeFileSync(businessesPath, JSON.stringify(businesses, null, 2));
  console.log(`✓ Added coordinates to ${businesses.length} businesses`);
  
  console.log('\n✅ All coordinates generated!');
}

addCoordinates().catch(console.error);
