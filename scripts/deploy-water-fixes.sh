#!/bin/bash

# Safe deployment of water-fixed GeoJSON files
echo "🚀 Deploying water-fixed GeoJSON files..."

# Copy corrected files to production
cp scripts/enhanced-geojson/places-water-fixed.geojson httpdocs/client/geojson/places.geojson
cp scripts/enhanced-geojson/people-water-fixed.geojson httpdocs/client/geojson/people.geojson  
cp scripts/enhanced-geojson/businesses-water-fixed.geojson httpdocs/client/geojson/businesses.geojson
cp scripts/enhanced-geojson/streets-water-fixed.geojson httpdocs/client/geojson/streets.geojson

# Update permissions
chmod 644 httpdocs/client/geojson/*.geojson

echo "✅ Water-fixed GeoJSON files deployed successfully!"
echo "🗺️ Map should now show all entities on land areas"