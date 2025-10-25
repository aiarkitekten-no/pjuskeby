/**
 * Generate GeoJSON files from normalized data
 * 
 * Outputs:
 * - public/geojson/places.geojson (Point features)
 * - public/geojson/streets.geojson (LineString features)
 * - public/geojson/people.geojson (Point features)
 * - public/geojson/businesses.geojson (Point features)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: any;
  properties: Record<string, any>;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

function createFeatureCollection(entities: any[], type: 'place' | 'street' | 'person' | 'business'): GeoJSONFeatureCollection {
  const features: GeoJSONFeature[] = entities
    .filter(entity => entity.geo)
    .map(entity => ({
      type: 'Feature' as const,
      id: entity.id,
      geometry: entity.geo,
      properties: {
        id: entity.id,
        slug: entity.slug,
        name: entity.name,
        type: type,
        ...(entity.category && { category: entity.category }),
        ...(entity.description && { description: entity.description }),
        ...(entity.age && { age: entity.age }),
        ...(entity.occupation && { occupation: entity.occupation }),
        ...(entity.street_id && { street_id: entity.street_id }),
        ...(entity.status && { status: entity.status })
      }
    }));
  
  return {
    type: 'FeatureCollection',
    features
  };
}

async function generateGeoJSON() {
  const dataDir = path.join(__dirname, '../content/data');
  const outputDir = path.join(__dirname, '../public/geojson');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Load normalized data
  const places = JSON.parse(fs.readFileSync(path.join(dataDir, 'places.normalized.json'), 'utf-8'));
  const streets = JSON.parse(fs.readFileSync(path.join(dataDir, 'streets.normalized.json'), 'utf-8'));
  const people = JSON.parse(fs.readFileSync(path.join(dataDir, 'people.normalized.json'), 'utf-8'));
  const businesses = JSON.parse(fs.readFileSync(path.join(dataDir, 'businesses.normalized.json'), 'utf-8'));
  
  // Generate GeoJSON FeatureCollections
  const placesGeoJSON = createFeatureCollection(places, 'place');
  const streetsGeoJSON = createFeatureCollection(streets, 'street');
  const peopleGeoJSON = createFeatureCollection(people, 'person');
  const businessesGeoJSON = createFeatureCollection(businesses, 'business');
  
  // Write to files
  fs.writeFileSync(
    path.join(outputDir, 'places.geojson'),
    JSON.stringify(placesGeoJSON, null, 2)
  );
  console.log(`✓ Generated places.geojson (${placesGeoJSON.features.length} features)`);
  
  fs.writeFileSync(
    path.join(outputDir, 'streets.geojson'),
    JSON.stringify(streetsGeoJSON, null, 2)
  );
  console.log(`✓ Generated streets.geojson (${streetsGeoJSON.features.length} features)`);
  
  fs.writeFileSync(
    path.join(outputDir, 'people.geojson'),
    JSON.stringify(peopleGeoJSON, null, 2)
  );
  console.log(`✓ Generated people.geojson (${peopleGeoJSON.features.length} features)`);
  
  fs.writeFileSync(
    path.join(outputDir, 'businesses.geojson'),
    JSON.stringify(businessesGeoJSON, null, 2)
  );
  console.log(`✓ Generated businesses.geojson (${businessesGeoJSON.features.length} features)`);
  
  // Create combined POIs (places + businesses + people for clustering)
  const allPOIs = createFeatureCollection(
    [...places, ...businesses, ...people],
    'place' as any
  );
  fs.writeFileSync(
    path.join(outputDir, 'all-pois.geojson'),
    JSON.stringify(allPOIs, null, 2)
  );
  console.log(`✓ Generated all-pois.geojson (${allPOIs.features.length} features)`);
  
  console.log('\n✅ All GeoJSON files generated!');
}

generateGeoJSON().catch(console.error);
