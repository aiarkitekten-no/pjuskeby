/**
 * Pjuskeby Interactive Map
 * Initializes MapLibre GL with GeoJSON data
 */

export function initMap(todayData) {
  // Initialize map centered on Pjuskeby
  const map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [{
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }]
    },
    center: [10.720, 59.910], // Pjuskeby center
    zoom: 13,
    minZoom: 11,
    maxZoom: 18
  });
  
  map.on('load', () => {
    // Add GeoJSON sources
    map.addSource('streets', {
      type: 'geojson',
      data: '/geojson/streets.geojson'
    });
    
    map.addSource('places', {
      type: 'geojson',
      data: '/geojson/places.geojson',
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    
    map.addSource('businesses', {
      type: 'geojson',
      data: '/geojson/businesses.geojson',
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    
    map.addSource('people', {
      type: 'geojson',
      data: '/geojson/people.geojson',
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    
    // Add street layers
    map.addLayer({
      id: 'streets-line',
      type: 'line',
      source: 'streets',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 3,
        'line-opacity': 0.6
      }
    });
    
    // Clusters for places
    map.addLayer({
      id: 'places-clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#10b981',
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    
    map.addLayer({
      id: 'places-cluster-count',
      type: 'symbol',
      source: 'places',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    
    // Individual place markers
    map.addLayer({
      id: 'places-points',
      type: 'circle',
      source: 'places',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#10b981',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    
    // Clusters for businesses
    map.addLayer({
      id: 'businesses-clusters',
      type: 'circle',
      source: 'businesses',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#f59e0b',
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    
    map.addLayer({
      id: 'businesses-cluster-count',
      type: 'symbol',
      source: 'businesses',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    
    // Individual business markers
    map.addLayer({
      id: 'businesses-points',
      type: 'circle',
      source: 'businesses',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#f59e0b',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    
    // Clusters for people
    map.addLayer({
      id: 'people-clusters',
      type: 'circle',
      source: 'people',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#8b5cf6',
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    
    map.addLayer({
      id: 'people-cluster-count',
      type: 'symbol',
      source: 'people',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });
    
    // Individual people markers
    map.addLayer({
      id: 'people-points',
      type: 'circle',
      source: 'people',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#8b5cf6',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    
    // Highlight today's featured items
    if (todayData) {
      if (todayData.person) {
        map.addLayer({
          id: 'featured-person',
          type: 'circle',
          source: 'people',
          filter: ['==', ['get', 'id'], todayData.person.id],
          paint: {
            'circle-color': '#ef4444',
            'circle-radius': 14,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fef2f2',
            'circle-opacity': 0.9
          }
        });
      }
      
      if (todayData.place) {
        map.addLayer({
          id: 'featured-place',
          type: 'circle',
          source: 'places',
          filter: ['==', ['get', 'id'], todayData.place.id],
          paint: {
            'circle-color': '#ef4444',
            'circle-radius': 14,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fef2f2',
            'circle-opacity': 0.9
          }
        });
      }
    }
    
    // Click handlers for popups
    const clickableLayers = ['places-points', 'businesses-points', 'people-points', 'streets-line'];
    
    clickableLayers.forEach(layerId => {
      map.on('click', layerId, (e) => {
        const feature = e.features[0];
        const props = feature.properties;
        
        let popupHTML = `<h3 style="margin: 0 0 0.5rem 0;">${props.name}</h3>`;
        
        if (props.description) {
          popupHTML += `<p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">${props.description}</p>`;
        }
        
        if (props.occupation) {
          popupHTML += `<p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;"><strong>${props.age} år</strong> • ${props.occupation}</p>`;
        }
        
        if (props.category) {
          popupHTML += `<p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #64748b;">${props.category}</p>`;
        }
        
        // Add link to detail page
        if (props.type === 'person') {
          popupHTML += `<a href="/personer/${props.slug}" style="color: #3b82f6; text-decoration: none;">Se profil →</a>`;
        } else if (props.type === 'place') {
          popupHTML += `<a href="/steder/${props.slug}" style="color: #3b82f6; text-decoration: none;">Besøk sted →</a>`;
        }
        
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(popupHTML)
          .addTo(map);
      });
      
      // Change cursor on hover
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    });
    
    // Cluster click: zoom in
    ['places-clusters', 'businesses-clusters', 'people-clusters'].forEach(clusterId => {
      map.on('click', clusterId, (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: [clusterId]
        });
        const clusterIdProp = features[0].properties.cluster_id;
        const source = clusterId.includes('places') ? 'places' : 
                      clusterId.includes('businesses') ? 'businesses' : 'people';
        
        map.getSource(source).getClusterExpansionZoom(
          clusterIdProp,
          (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });
    });
    
    // Layer toggles
    document.getElementById('toggle-places').addEventListener('change', (e) => {
      const visibility = e.target.checked ? 'visible' : 'none';
      map.setLayoutProperty('places-clusters', 'visibility', visibility);
      map.setLayoutProperty('places-cluster-count', 'visibility', visibility);
      map.setLayoutProperty('places-points', 'visibility', visibility);
    });
    
    document.getElementById('toggle-businesses').addEventListener('change', (e) => {
      const visibility = e.target.checked ? 'visible' : 'none';
      map.setLayoutProperty('businesses-clusters', 'visibility', visibility);
      map.setLayoutProperty('businesses-cluster-count', 'visibility', visibility);
      map.setLayoutProperty('businesses-points', 'visibility', visibility);
    });
    
    document.getElementById('toggle-people').addEventListener('change', (e) => {
      const visibility = e.target.checked ? 'visible' : 'none';
      map.setLayoutProperty('people-clusters', 'visibility', visibility);
      map.setLayoutProperty('people-cluster-count', 'visibility', visibility);
      map.setLayoutProperty('people-points', 'visibility', visibility);
    });
    
    document.getElementById('toggle-streets').addEventListener('change', (e) => {
      const visibility = e.target.checked ? 'visible' : 'none';
      map.setLayoutProperty('streets-line', 'visibility', visibility);
    });
  });
}
