/**
 * Update all coordinates to Moss area (instead of Oslo)
 * Moss center: [10.6578, 59.4344]
 * Creates a realistic spread around Moss
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'pjuskeby_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Moss center coordinates
const MOSS_CENTER = { lon: 10.6578, lat: 59.4344 };

// Generate random offset around Moss (within ~5km radius)
function generateMossCoordinate() {
  const offsetLon = (Math.random() - 0.5) * 0.08; // ~5km
  const offsetLat = (Math.random() - 0.5) * 0.06; // ~5km
  
  return {
    lon: MOSS_CENTER.lon + offsetLon,
    lat: MOSS_CENTER.lat + offsetLat
  };
}

async function updateCoordinates() {
  try {
    console.log('🗺️  Updating coordinates to Moss area...\n');
    
    // Update places
    const [places] = await pool.query('SELECT id FROM places');
    for (const place of places) {
      const coord = generateMossCoordinate();
      await pool.query(
        'UPDATE places SET geo = ST_GeomFromText(?) WHERE id = ?',
        [`POINT(${coord.lon} ${coord.lat})`, place.id]
      );
    }
    console.log(`✅ Updated ${places.length} places to Moss area`);
    
    // Update people
    const [people] = await pool.query('SELECT id FROM people');
    for (const person of people) {
      const coord = generateMossCoordinate();
      await pool.query(
        'UPDATE people SET home_location = ST_GeomFromText(?) WHERE id = ?',
        [`POINT(${coord.lon} ${coord.lat})`, person.id]
      );
    }
    console.log(`✅ Updated ${people.length} people to Moss area`);
    
    // Update businesses
    const [businesses] = await pool.query('SELECT id FROM businesses');
    for (const business of businesses) {
      const coord = generateMossCoordinate();
      await pool.query(
        'UPDATE businesses SET geo = ST_GeomFromText(?) WHERE id = ?',
        [`POINT(${coord.lon} ${coord.lat})`, business.id]
      );
    }
    console.log(`✅ Updated ${businesses.length} businesses to Moss area`);
    
    // Update streets with LineStrings around Moss
    const [streets] = await pool.query('SELECT id FROM streets');
    for (const street of streets) {
      const start = generateMossCoordinate();
      const end = {
        lon: start.lon + (Math.random() - 0.5) * 0.01,
        lat: start.lat + (Math.random() - 0.5) * 0.01
      };
      
      await pool.query(
        'UPDATE streets SET geo = ST_GeomFromText(?) WHERE id = ?',
        [`LINESTRING(${start.lon} ${start.lat}, ${end.lon} ${end.lat})`, street.id]
      );
    }
    console.log(`✅ Updated ${streets.length} streets to Moss area`);
    
    console.log('\n🎉 All coordinates updated to Moss area!');
    console.log(`📍 Center: Moss [${MOSS_CENTER.lon}, ${MOSS_CENTER.lat}]`);
    
  } catch (error) {
    console.error('❌ Error updating coordinates:', error);
  } finally {
    await pool.end();
  }
}

updateCoordinates();
