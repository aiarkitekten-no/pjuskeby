/**
 * Generate GeoJSON files with Moss coordinates
 * Moss center: [10.6578, 59.4344]
 */

import fs from 'fs';

const MOSS_CENTER = { lon: 10.6578, lat: 59.4344 };

// Read existing GeoJSON to preserve names and properties
const places = JSON.parse(fs.readFileSync('public/geojson/places.geojson', 'utf-8'));
const streets = JSON.parse(fs.readFileSync('public/geojson/streets.geojson', 'utf-8'));
const people = JSON.parse(fs.readFileSync('public/geojson/people.geojson', 'utf-8'));
const businesses = JSON.parse(fs.readFileSync('public/geojson/businesses.geojson', 'utf-8'));

function generateMossCoordinate() {
  const offsetLon = (Math.random() - 0.5) * 0.08; // ~5km radius
  const offsetLat = (Math.random() - 0.5) * 0.06;
  
  return [
    MOSS_CENTER.lon + offsetLon,
    MOSS_CENTER.lat + offsetLat
  ];
}

console.log('🗺️  Regenerating GeoJSON with Moss coordinates...\n');

// Update places
places.features.forEach(feature => {
  feature.geometry.coordinates = generateMossCoordinate();
});
fs.writeFileSync('public/geojson/places.geojson', JSON.stringify(places, null, 2));
console.log(`✅ Updated ${places.features.length} places`);

// Update people
people.features.forEach(feature => {
  feature.geometry.coordinates = generateMossCoordinate();
});
fs.writeFileSync('public/geojson/people.geojson', JSON.stringify(people, null, 2));
console.log(`✅ Updated ${people.features.length} people`);

// Update businesses
businesses.features.forEach(feature => {
  feature.geometry.coordinates = generateMossCoordinate();
});
fs.writeFileSync('public/geojson/businesses.geojson', JSON.stringify(businesses, null, 2));
console.log(`✅ Updated ${businesses.features.length} businesses`);

// Update streets with LineStrings
streets.features.forEach(feature => {
  const start = generateMossCoordinate();
  const end = [
    start[0] + (Math.random() - 0.5) * 0.01,
    start[1] + (Math.random() - 0.5) * 0.01
  ];
  feature.geometry.coordinates = [start, end];
});
fs.writeFileSync('public/geojson/streets.geojson', JSON.stringify(streets, null, 2));
console.log(`✅ Updated ${streets.features.length} streets`);

// Combine all POIs
const allPois = {
  type: 'FeatureCollection',
  features: [
    ...places.features,
    ...people.features,
    ...businesses.features
  ]
};
fs.writeFileSync('public/geojson/all-pois.geojson', JSON.stringify(allPois, null, 2));
console.log(`✅ Updated all-pois.geojson\n`);

console.log('🎉 All GeoJSON files updated to Moss area!');
console.log(`📍 Center: [${MOSS_CENTER.lon}, ${MOSS_CENTER.lat}]`);
