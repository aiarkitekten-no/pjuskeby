/**
 * 🗺️ ENHANCED MAP INTEGRATION FOR ENTITY CROSS-REFERENCES
 * 
 * Extends the existing map system with:
 * 1. Entity story linking integration
 * 2. Water boundary visualization
 * 3. Dynamic popup content with cross-references
 * 4. Improved entity clustering and visualization
 */

import { enrichEntityForMap, getWaterBoundaries, getWaterLayerConfig } from './map-water-detection.js';

/**
 * Enhanced popup HTML with entity cross-references
 */
export async function createEntityPopup(entity, entityType) {
  const baseUrl = window.location.origin;
  
  let popupHTML = `
    <div style="max-width: 300px;">
      <h3 style="margin: 0 0 8px 0; color: #1f2937;">
        ${entity.name}
      </h3>
  `;
  
  // Add entity type badge
  const typeColor = {
    person: '#3b82f6',
    place: '#f59e0b', 
    business: '#8b5cf6',
    street: '#10b981'
  }[entityType] || '#6b7280';
  
  popupHTML += `
    <span style="display: inline-block; background: ${typeColor}; color: white; 
                 padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-bottom: 8px;">
      ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}
    </span>
  `;
  
  // Add water area indicator
  if (entity.isWaterArea) {
    popupHTML += `
      <span style="display: inline-block; background: #0ea5e9; color: white; 
                   padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-bottom: 8px; margin-left: 4px;">
        🌊 Water Area
      </span>
    `;
  }
  
  // Add description
  if (entity.description) {
    popupHTML += `
      <p style="margin: 8px 0; color: #4b5563; font-size: 14px; line-height: 1.4;">
        ${entity.description}
      </p>
    `;
  }
  
  // Add coordinate warning if applicable
  if (entity.coordinateWarning) {
    popupHTML += `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; 
                  padding: 8px; margin: 8px 0; font-size: 12px;">
        ⚠️ ${entity.coordinateWarning}
      </div>
    `;
  }
  
  // Add loading placeholder for stories
  popupHTML += `
    <div id="entity-stories-${entity.id}" style="margin-top: 12px;">
      <div style="color: #6b7280; font-size: 12px;">
        📚 Loading stories... <span class="loading-dots">...</span>
      </div>
    </div>
  `;
  
  // Add entity page link
  const entityUrl = entityType === 'person' ? '/personer' : 
                    entityType === 'place' ? '/steder' :
                    entityType === 'business' ? '/bedrifter' : '/gater';
  
  popupHTML += `
    <div style="margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
      <a href="${entityUrl}/${entity.slug}" 
         style="color: ${typeColor}; text-decoration: none; font-size: 13px; font-weight: 500;">
        Visit ${entity.name} →
      </a>
    </div>
  `;
  
  popupHTML += `</div>`;
  
  return popupHTML;
}

/**
 * Load entity stories for popup
 */
export async function loadEntityStories(entityId, entityType, entitySlug) {
  const container = document.getElementById(`entity-stories-${entityId}`);
  if (!container) return;
  
  try {
    const response = await fetch(`/api/entities/${entityType}/${entitySlug}/stories`);
    const data = await response.json();
    
    if (data.stories && data.stories.length > 0) {
      const storiesHTML = `
        <div style="font-size: 12px; color: #374151;">
          <strong>📚 Featured in ${data.count} ${data.count === 1 ? 'story' : 'stories'}:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 16px;">
            ${data.stories.slice(0, 3).map(story => `
              <li style="margin: 2px 0;">
                <a href="${story.url}" style="color: #3b82f6; text-decoration: none;">
                  ${story.title}
                </a>
              </li>
            `).join('')}
            ${data.stories.length > 3 ? `
              <li style="margin: 2px 0; color: #6b7280;">
                ... and ${data.stories.length - 3} more
              </li>
            ` : ''}
          </ul>
        </div>
      `;
      container.innerHTML = storiesHTML;
    } else {
      container.innerHTML = `
        <div style="font-size: 12px; color: #6b7280;">
          📖 No stories yet
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `
      <div style="font-size: 12px; color: #ef4444;">
        ❌ Failed to load stories
      </div>
    `;
  }
}

/**
 * Enhanced map initialization with water detection and entity integration
 */
export function enhanceMapWithEntities(map) {
  // Add water boundaries layer
  const waterBoundaries = getWaterBoundaries();
  
  map.addSource('water-boundaries', {
    type: 'geojson',
    data: waterBoundaries
  });
  
  map.addLayer(getWaterLayerConfig());
  
  // Enhanced entity click handlers with cross-references
  const entityLayers = [
    { layer: 'places-points', type: 'place' },
    { layer: 'people-points', type: 'person' },
    { layer: 'businesses-points', type: 'business' },
    { layer: 'streets-points', type: 'street' }
  ];
  
  entityLayers.forEach(({ layer, type }) => {
    map.on('click', layer, async (e) => {
      const feature = e.features[0];
      const props = feature.properties;
      
      // Enrich entity data with water detection
      const entity = enrichEntityForMap({
        id: props.id,
        name: props.name,
        slug: props.slug,
        description: props.description,
        category: props.category,
        coordinates: feature.geometry.coordinates
      });
      
      // Create enhanced popup
      const popupHTML = await createEntityPopup(entity, type);
      
      const popup = new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupHTML)
        .addTo(map);
      
      // Load stories after popup is shown
      setTimeout(() => {
        loadEntityStories(entity.id, type, entity.slug);
      }, 100);
    });
  });
  
  // Add water boundary toggle
  const waterToggle = document.createElement('div');
  waterToggle.innerHTML = `
    <label style="display: flex; align-items: center; font-size: 14px; margin: 8px 0;">
      <input type="checkbox" id="toggle-water-boundaries" checked style="margin-right: 8px;">
      🌊 Water Boundaries
    </label>
  `;
  
  const legend = document.querySelector('.legend') || document.querySelector('#map');
  if (legend) {
    legend.appendChild(waterToggle);
  }
  
  document.getElementById('toggle-water-boundaries').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    map.setLayoutProperty('water-boundaries', 'visibility', visibility);
  });
}

/**
 * Create lakes GeoJSON from database
 */
export async function generateLakesGeoJSON() {
  try {
    // This would typically fetch from the database
    // For now, create placeholder structure
    const lakes = {
      type: "FeatureCollection",
      features: []
    };
    
    // Example lake coordinates (would come from database)
    const lakesData = [
      { name: "Whisperwind Lake", lat: 59.920, lng: 10.730 },
      { name: "Giggletarn Pond", lat: 59.905, lng: 10.715 },
      { name: "Snortlebubble Lake", lat: 59.895, lng: 10.700 }
    ];
    
    lakesData.forEach((lake, index) => {
      lakes.features.push({
        type: "Feature",
        id: `lake-${index}`,
        geometry: {
          type: "Point",
          coordinates: [lake.lng, lake.lat]
        },
        properties: {
          id: `lake-${index}`,
          name: lake.name,
          type: "lake",
          category: "water",
          isWaterArea: true
        }
      });
    });
    
    return lakes;
  } catch (error) {
    console.error('Failed to generate lakes GeoJSON:', error);
    return { type: "FeatureCollection", features: [] };
  }
}

/**
 * Add entity search functionality to map
 */
export function addEntitySearch(map) {
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 12px;
    min-width: 250px;
  `;
  
  searchContainer.innerHTML = `
    <input type="text" id="entity-search" 
           placeholder="Search entities..." 
           style="width: 100%; padding: 8px; border: 1px solid #d1d5db; 
                  border-radius: 4px; font-size: 14px;">
    <div id="search-results" style="margin-top: 8px; max-height: 200px; overflow-y: auto;"></div>
  `;
  
  map.getContainer().appendChild(searchContainer);
  
  const searchInput = document.getElementById('entity-search');
  const resultsContainer = document.getElementById('search-results');
  
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }
    
    // This would search through all entity data
    // For now, show placeholder
    resultsContainer.innerHTML = `
      <div style="padding: 8px; color: #6b7280; font-size: 12px;">
        Search functionality coming soon...
      </div>
    `;
  });
}

/**
 * Loading animation CSS for popups
 */
export function addMapStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loading-dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }
    
    .loading-dots::after {
      content: '.';
      animation: loading-dots 1.5s infinite;
    }
    
    .maplibregl-popup-content {
      border-radius: 8px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
    }
    
    .maplibregl-popup-close-button {
      font-size: 18px !important;
      padding: 4px !important;
    }
  `;
  
  document.head.appendChild(style);
}

export {
  createEntityPopup,
  loadEntityStories,
  enhanceMapWithEntities,
  generateLakesGeoJSON,
  addEntitySearch,
  addMapStyles
};