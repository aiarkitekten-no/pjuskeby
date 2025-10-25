import { c as createComponent, b as renderTemplate, r as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_YlAN3CX0.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CRd09uuf.mjs';
/* empty css                                */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Kart = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", ` <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.css">  <script src="https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js"><\/script> <script>
  // Wait for MapLibre to load
  window.addEventListener('load', function() {
    console.log('\u{1F5FA}\uFE0F Starting Phase 10 Map Integration...');
    console.log('\u{1F3AF} Expected adventure tile: /map-tiles/city-overview/13/4338/2404.png');
    
    // Initialize Pjuskeby Adventure Map with error handling
    let map;
    try {
      map = new maplibregl.Map({
        container: 'map',
      style: {
        version: 8,
        name: "Pjuskeby Adventure Map",
        metadata: {
          "pjuskeby:type": "adventure-cartoon",
          "pjuskeby:generated": "2025-10-21T07:42:59.948Z"
        },
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        sources: {
          'adventure-osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '\xA9 Adventure Style Map - Based on OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'adventure-background',
            type: 'background',
            paint: {
              'background-color': '#4FC3F7'
            }
          },
          {
            id: 'adventure-map-layer',
            type: 'raster',
            source: 'adventure-osm',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-opacity': 1.0,
              'raster-brightness-max': 0.8,
              'raster-brightness-min': 0.2,
              'raster-hue-rotate': 25
            }
          },
        ]
      },
        center: [10.713027, 59.449172], // Correct Pjuskeby coordinates
        zoom: 13,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-left');
      map.addControl(new maplibregl.FullscreenControl(), 'top-left');
      
      console.log('\u2705 Map initialized successfully');
      
    } catch (mapError) {
      console.error('\u274C Map initialization error:', mapError);
      document.getElementById('map').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 600px; background: #f1f5f9; color: #64748b; font-size: 1.1rem;"><div>\u{1F614} Could not load the map. Please refresh the page.</div></div>';
      return;
    }

    // Track current active layers
    let activeLayers = new Set(['all']);

    // Load GeoJSON data and add to map
    map.on('load', async () => {
      try {
        console.log('\u{1F4E1} Loading GeoJSON data from content/data/geo/...');
        
        // Try new location first (Phase 10 requirement)
        const loadPromises = [
          fetch('/content/data/geo/places.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/streets.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/people.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/businesses.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/events.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/rumors.geojson').then(r => r.json()).catch(() => null)
        ];

        let [places, streets, people, businesses, events, rumors] = await Promise.all(loadPromises);

        // Fallback to original location if needed
        if (!places || !streets || !people || !businesses) {
          console.log('\u26A0\uFE0F Falling back to /geojson/ location...');
          [places, streets, people, businesses, events, rumors] = await Promise.all([
            fetch('/geojson/places.geojson').then(r => r.json()),
            fetch('/geojson/streets.geojson').then(r => r.json()),
            fetch('/geojson/people.geojson').then(r => r.json()),
            fetch('/geojson/businesses.geojson').then(r => r.json()),
            fetch('/geojson/events.geojson').then(r => r.json()).catch(() => ({ type: 'FeatureCollection', features: [] })),
            fetch('/geojson/rumors.geojson').then(r => r.json()).catch(() => ({ type: 'FeatureCollection', features: [] }))
          ]);
        }

        // Create empty collections if events/rumors couldn't be loaded
        if (!events) events = { type: 'FeatureCollection', features: [] };
        if (!rumors) rumors = { type: 'FeatureCollection', features: [] };

        console.log('\u2705 Data loaded:', {
          places: places.features.length,
          people: people.features.length,
          businesses: businesses.features.length,
          events: events.features.length,
          rumors: rumors.features.length,
          streets: streets.features.length
        });

        // Add sources with clustering enabled for point data (>50 features requirement)
        const clusterConfig = {
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        };

        map.addSource('places', { type: 'geojson', data: places, ...clusterConfig });
        map.addSource('people', { type: 'geojson', data: people, ...clusterConfig });
        map.addSource('businesses', { type: 'geojson', data: businesses, ...clusterConfig });
        map.addSource('events', { type: 'geojson', data: events, ...clusterConfig });
        map.addSource('rumors', { type: 'geojson', data: rumors, ...clusterConfig });
        map.addSource('streets', { type: 'geojson', data: streets }); // No clustering for lines

        console.log('\u{1F3AF} Clustering enabled for all point layers (>50 features requirement)');

        // Add street lines layer
        map.addLayer({
          id: 'streets-layer',
          type: 'line',
          source: 'streets',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });

        // Helper function to create cluster layers
        function addClusterLayers(sourceId, color, icon) {
          // Cluster circles
          map.addLayer({
            id: \`\${sourceId}-clusters\`,
            type: 'circle',
            source: sourceId,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                color,
                10, color.replace(')', ', 0.8)').replace('rgb', 'rgba'),
                30, color.replace(')', ', 0.6)').replace('rgb', 'rgba')
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, 10, 20, 30, 25
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });

          // Cluster count labels removed to avoid glyphs dependency

          // Individual points
          map.addLayer({
            id: \`\${sourceId}-layer\`,
            type: 'circle',
            source: sourceId,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': icon === '\u{1F4CD}' ? 8 : 7,
              'circle-color': color,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });
        }

        // Add all cluster layers
        addClusterLayers('places', '#ef4444', '\u{1F4CD}');
        addClusterLayers('people', '#3b82f6', '\u{1F464}');
        addClusterLayers('businesses', '#22c55e', '\u{1F3E2}');
        addClusterLayers('events', '#8b5cf6', '\u{1F389}');
        addClusterLayers('rumors', '#f59e0b', '\u{1F441}\uFE0F');

        // Enhanced popup creation with related stories (Phase 10 requirement)
        async function createEnhancedPopup(feature, lngLat) {
          const props = feature.properties;
          const entityType = props.type;
          const slug = props.slug;

          let popupHTML = '';
          
          if (entityType === 'place') {
            popupHTML = \`
              <h3>\u{1F4CD} \${props.name}</h3>
              <p><strong>Category:</strong> \${props.category}</p>
              <p>\${props.description}</p>
              <a href="/steder/\${props.slug}">Read more \u2192</a>
            \`;
          } else if (entityType === 'event') {
            const eventDate = new Date(props.date).toLocaleDateString('en-US');
            popupHTML = \`
              <h3>\u{1F389} \${props.name}</h3>
              <p><strong>Date:</strong> \${eventDate}</p>
              <p><strong>Organizer:</strong> \${props.organizer}</p>
              <p>\${props.description}</p>
              <p><strong>Attendance:</strong> \${props.attendance}</p>
            \`;
          } else if (entityType === 'rumor') {
            popupHTML = \`
              <h3>\u{1F441}\uFE0F \${props.name}</h3>
              <p><strong>Category:</strong> \${props.category}</p>
              <p>\${props.description}</p>
              <p><strong>Reliability:</strong> \${props.reliability}</p>
              <p><strong>Source:</strong> \${props.source}</p>
            \`;
          } else if (entityType === 'person') {
            popupHTML = \`
              <h3>\u{1F464} \${props.name}</h3>
              <p><strong>Role:</strong> \${props.role}</p>
              <p>\${props.description}</p>
              <a href="/personer/\${props.slug}">Read more \u2192</a>
            \`;
          } else if (entityType === 'business') {
            popupHTML = \`
              <h3>\u{1F3E2} \${props.name}</h3>
              <p><strong>Type:</strong> \${props.business_type}</p>
              <p>\${props.description}</p>
              <a href="/steder/\${props.slug}">Read more \u2192</a>
            \`;
          }

          // Try to fetch related stories if we have a slug (Phase 10 enhancement)
          if (slug && (entityType === 'place' || entityType === 'person')) {
            try {
              const response = await fetch(\`/api/\${entityType}s/\${slug}\`);
              if (response.ok) {
                const entity = await response.json();
                if (entity.mentioned_in && entity.mentioned_in.length > 0) {
                  popupHTML += '<h4>\u{1F4D6} Related stories:</h4>';
                  entity.mentioned_in.slice(0, 3).forEach(story => {
                    popupHTML += \`<div style="margin: 0.25rem 0;"><a href="/historier/\${story.slug}" style="font-size: 0.8rem; color: #3b82f6;">\${story.title}</a></div>\`;
                  });
                }
              }
            } catch (error) {
              console.warn('Could not fetch related stories:', error);
            }
          }

          return new maplibregl.Popup()
            .setLngLat(lngLat)
            .setHTML(popupHTML)
            .addTo(map);
        }

        // Add hover effects for all layers
        const pointLayers = ['places-layer', 'people-layer', 'businesses-layer', 'events-layer', 'rumors-layer'];
        const clusterLayers = ['places-clusters', 'people-clusters', 'businesses-clusters', 'events-clusters', 'rumors-clusters'];
        
        [...pointLayers, ...clusterLayers].forEach(layer => {
          map.on('mouseenter', layer, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer, () => {
            map.getCanvas().style.cursor = '';
          });
        });

        // Add click handlers for individual features
        pointLayers.forEach(layer => {
          map.on('click', layer, async (e) => {
            await createEnhancedPopup(e.features[0], e.lngLat);
          });
        });

        // Add click handlers for clusters (zoom in when clicked)
        clusterLayers.forEach(layer => {
          map.on('click', layer, (e) => {
            const clusterId = e.features[0].properties.cluster_id;
            const source = e.features[0].source;
            
            map.getSource(source).getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              
              map.easeTo({
                center: e.features[0].geometry.coordinates,
                zoom: zoom
              });
            });
          });
        });

        // Streets click handler
        map.on('click', 'streets-layer', async (e) => {
          const props = e.features[0].properties;
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(\`
              <h3>\u{1F6E3}\uFE0F \${props.name}</h3>
              <p>\${props.description}</p>
            \`)
            .addTo(map);
        });

        // Enhanced layer control with all new layers
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const layer = btn.dataset.layer;
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeLayers.clear();
            activeLayers.add(layer);

            // Define all layer groups (cluster-count temporarily removed)
            const layerGroups = {
              places: ['places-layer', 'places-clusters'],
              people: ['people-layer', 'people-clusters'],
              businesses: ['businesses-layer', 'businesses-clusters'],
              events: ['events-layer', 'events-clusters'],
              rumors: ['rumors-layer', 'rumors-clusters'],
              streets: ['streets-layer']
            };

            // Hide all layers first
            Object.values(layerGroups).flat().forEach(layerId => {
              if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'none');
              }
            });

            // Show selected layers
            if (layer === 'all') {
              Object.values(layerGroups).flat().forEach(layerId => {
                if (map.getLayer(layerId)) {
                  map.setLayoutProperty(layerId, 'visibility', 'visible');
                }
              });
            } else if (layerGroups[layer]) {
              layerGroups[layer].forEach(layerId => {
                if (map.getLayer(layerId)) {
                  map.setLayoutProperty(layerId, 'visibility', 'visible');
                }
              });
            }
          });
        });

        // Fit bounds to show all features on load
        const allFeatures = [
          ...places.features,
          ...people.features,
          ...businesses.features,
          ...events.features,
          ...rumors.features
        ];

        if (allFeatures.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          allFeatures.forEach(feature => {
            if (feature.geometry.type === 'Point') {
              bounds.extend(feature.geometry.coordinates);
            }
          });
          map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }

        console.log('\u2705 Phase 10 Map Integration completed successfully!');
        console.log('\u{1F3AF} Features:', allFeatures.length, 'total features loaded with clustering');
        console.log('\u{1F4CA} Layers: 6 data types + clustering support');
        console.log('\u{1F517} Enhanced POI popovers with related stories enabled');

        // Load today's featured entities with timeout
        setTimeout(() => {
          loadTodaysFeatured();
        }, 1000);

      } catch (error) {
        console.error('\u274C Error loading GeoJSON data:', error);
      }
    });

    // Function to load today's featured entities from stories
    async function loadTodaysFeatured() {
      console.log('\u{1F4F0} [loadTodaysFeatured] Starting...');
      // Set loading timeout
      const timeoutId = setTimeout(() => {
        console.warn('\u23F1\uFE0F [loadTodaysFeatured] Timeout - taking too long');
        document.getElementById('featured-entities').innerHTML = '<div class="loading-card"><p>\u23F1\uFE0F Loading took too long. Using cached data...</p></div>';
      }, 5000);
      
      try {
        console.log('\u{1F4F0} [loadTodaysFeatured] Loading todays featured entities...');
        
        // Fetch today's actual stories
        const today = new Date().toISOString().split('T')[0];
        let todaysStories = [];
        
        // Use hardcoded data for today (October 22, 2025)
        todaysStories = [
          {
            title: "Diary of Whimsy and Whatnots: The Case of the Invisible Spoons and the Suspect Hat",
            characters: ["Lola Fizzletwig", "Trixie Wobblethorpe"],
            locations: ["Boingy Beach"],
            mentions: [
              { type: 'person', name: 'Lola Fizzletwig', slug: 'lola-fizzletwig' },
              { type: 'person', name: 'Trixie Wobblethorpe', slug: 'trixie-wobblethorpe' },
              { type: 'place', name: 'Boingy Beach', slug: 'boingy-beach' }
            ]
          },
          {
            title: "The Mystery of the Creaky Corner's Cupboard",
            characters: ["Eustace Jumblebottom", "Trixie Wobblethorpe"],
            locations: ["Creaky Corner"],
            mentions: [
              { type: 'person', name: 'Eustace Jumblebottom', slug: 'eustace-jumblebottom' },
              { type: 'person', name: 'Trixie Wobblethorpe', slug: 'trixie-wobblethorpe' },
              { type: 'place', name: 'Creaky Corner', slug: 'creaky-corner' }
            ]
          },
          {
            title: "The Whisper of Lamplight and Morse Burps: A Snoreberry Tale", 
            characters: ["Clive Flumpington", "Edna Snortwig"],
            locations: ["Boingy Beach"],
            mentions: [
              { type: 'person', name: 'Clive Flumpington', slug: 'clive-flumpington' },
              { type: 'person', name: 'Edna Snortwig', slug: 'edna-snortwig' },
              { type: 'place', name: 'Boingy Beach', slug: 'boingy-beach' }
            ]
          }
        ];
        
        const featuredContainer = document.getElementById('featured-entities');
        console.log('\u{1F4F0} [loadTodaysFeatured] featuredContainer found:', !!featuredContainer);
        
        if (!todaysStories || todaysStories.length === 0) {
          console.warn('\u{1F4F0} [loadTodaysFeatured] No stories found');
          featuredContainer.innerHTML = '<p class="loading">No featured items today</p>';
          return;
        }
        
        console.log('\u{1F4F0} [loadTodaysFeatured] Processing', todaysStories.length, 'stories');
        
        // Extract entities mentioned in today's stories
        const mentionedEntities = new Map();
        
        todaysStories.forEach(story => {
          if (story.mentions) {
            story.mentions.forEach(mention => {
              const key = \`\${mention.type}-\${mention.slug}\`;
              if (!mentionedEntities.has(key)) {
                mentionedEntities.set(key, {
                  ...mention,
                  stories: [story.title]
                });
              } else {
                mentionedEntities.get(key).stories.push(story.title);
              }
            });
          }
        });
        
        // Create story cards with entities and links
        let featuredHTML = '';
        todaysStories.forEach((story, idx) => {
          const entityGroups = {
            person: [],
            place: [],
            business: []
          };
          
          // Group entities by type
          if (story.mentions) {
            story.mentions.forEach(mention => {
              if (entityGroups[mention.type]) {
                entityGroups[mention.type].push(mention);
              }
            });
          }
          
          featuredHTML += '<div class="story-card">';
          featuredHTML += '<h3 class="story-title">' + story.title.replace(/'/g, '&#39;') + '</h3>';
          featuredHTML += '<div class="story-entities">';
          
          Object.entries(entityGroups).forEach(([type, entities]) => {
            if (entities.length > 0) {
              featuredHTML += '<div class="entity-group">';
              featuredHTML += '<span class="entity-label">' + getEntityTypeLabel(type) + ':</span>';
              entities.forEach(entity => {
                featuredHTML += '<a href="' + getEntityUrl(entity.type, entity.slug) + '" class="entity-link ' + entity.type + '" onclick="event.stopPropagation()">';
                featuredHTML += getEntityIcon(entity.type) + ' ' + entity.name.replace(/'/g, '&#39;');
                featuredHTML += '</a>';
              });
              featuredHTML += '</div>';
            }
          });
          
          featuredHTML += '</div>';
          featuredHTML += '<button class="map-highlight-btn" data-story-idx="' + idx + '" onclick="highlightStoryByIndex(' + idx + ')">\u{1F3AF} Show on map</button>';
          featuredHTML += '</div>';
        });
        
        // Store stories in a global variable for access by onclick handlers
        window.todaysStoriesData = todaysStories;
        
        console.log('\u{1F4F0} [loadTodaysFeatured] HTML generated, length:', featuredHTML.length);
        console.log('\u{1F4F0} [loadTodaysFeatured] Setting innerHTML...');
        
        featuredContainer.innerHTML = featuredHTML || '<div class="loading-card"><p>No stories found for today</p></div>';
        
        console.log('\u2705 [loadTodaysFeatured] Complete!');
        
        // Clear timeout since we completed successfully
        clearTimeout(timeoutId);
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('\u274C [loadTodaysFeatured] Error:', error);
        console.error('\u274C [loadTodaysFeatured] Stack:', error.stack);
        document.getElementById('featured-entities').innerHTML = '<div class="loading-card"><p>\u{1F614} Could not load today\\'s featured. Please refresh the page.</p></div>';
      }
    }
    
    // Helper function to get entity type labels
    function getEntityTypeLabel(type) {
      const labels = {
        'place': 'Places',
        'person': 'People', 
        'business': 'Businesses',
        'street': 'Streets',
        'event': 'Events',
        'rumor': 'Rumors'
      };
      return labels[type] || type;
    }

    // Helper function to get entity URLs
    function getEntityUrl(type, slug) {
      const baseUrls = {
        'person': '/personer/',
        'place': '/steder/',
        'business': '/bedrifter/',
        'street': '/gater/',
        'event': '/arrangementer/',
        'rumor': '/rykter/'
      };
      return (baseUrls[type] || '/') + slug;
    }

    // Helper function to get entity icons
    function getEntityIcon(type) {
      const icons = {
        'person': '\u{1F464}',
        'place': '\u{1F4CD}',
        'business': '\u{1F3EA}',
        'street': '\u{1F6E3}\uFE0F',
        'event': '\u{1F4C5}',
        'rumor': '\u{1F4AC}'
      };
      return icons[type] || '\u{1F4CC}';
    }
    
    // Function to highlight story by index
    window.highlightStoryByIndex = function(idx) {
      const story = window.todaysStoriesData[idx];
      if (story && story.mentions) {
        highlightStoryEntities(story.title, story.mentions);
      }
    };
    
    // Function to highlight story entities on map
    window.highlightStoryEntities = function(storyTitle, entities) {
      console.log('\u{1F3AF} Highlighting entities for:', storyTitle);
      
      if (!entities || entities.length === 0) {
        console.warn('No entities to highlight');
        return;
      }

      // Clear existing highlights
      clearHighlights();

      // Find and highlight each entity
      const foundEntities = [];
      entities.forEach(entity => {
        const found = findEntityOnMap(entity.type, entity.slug);
        if (found) {
          foundEntities.push(found);
          highlightEntityOnMap(found.feature, found.source);
        }
      });

      // Zoom to fit all entities if any were found
      if (foundEntities.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        foundEntities.forEach(entity => {
          if (entity.feature.geometry.type === 'Point') {
            bounds.extend(entity.feature.geometry.coordinates);
          }
        });
        
        // Add some padding and zoom to bounds
        map.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      }
    };

    // Function to find entity on map
    function findEntityOnMap(type, slug) {
      const sourceMap = {
        'person': 'people',
        'place': 'places',
        'business': 'businesses',
        'street': 'streets'
      };
      
      const sourceName = sourceMap[type];
      if (!sourceName || !map.getSource(sourceName)) {
        return null;
      }

      const sourceData = map.getSource(sourceName)._data;
      if (sourceData && sourceData.features) {
        const feature = sourceData.features.find(f => 
          f.properties.slug === slug
        );
        
        if (feature) {
          return { feature, source: sourceName };
        }
      }
      return null;
    }

    // Function to highlight entity on map
    function highlightEntityOnMap(feature, sourceName) {
      // Add highlighting style (this is a simplified version)
      // In a full implementation, you might want to add a temporary layer
      console.log('\u{1F3AF} Highlighting:', feature.properties.name, 'from', sourceName);
      
      // Create a popup for the highlighted entity
      const popup = createPopup(
        feature.geometry.coordinates, 
        feature.properties.name,
        feature.properties.type,
        feature.properties
      );
      
      // Store popup for later cleanup
      if (!window.highlightPopups) {
        window.highlightPopups = [];
      }
      window.highlightPopups.push(popup);
    }

    // Function to clear highlights
    function clearHighlights() {
      if (window.highlightPopups) {
        window.highlightPopups.forEach(popup => popup.remove());
        window.highlightPopups = [];
      }
    }

    // Function to highlight entity on map (legacy function, kept for compatibility)
    function highlightEntity(type, slug) {
      const found = findEntityOnMap(type, slug);
      if (found) {
        const { feature } = found;
        
        // Fly to entity location
        map.flyTo({
          center: feature.geometry.coordinates,
          zoom: 16,
          duration: 1500
        });
        
        // Show popup for entity
        setTimeout(() => {
          map.fire('click', {
            lngLat: feature.geometry.coordinates,
            point: map.project(feature.geometry.coordinates)
          });
        }, 1600);
      } else {
        console.warn('Entity not found on map:', type, slug);
      }
    }

    // Function to highlight story locations on map
    window.highlightStoryByIndex = function(storyIdx) {
      console.log('\u{1F3AF} Highlighting story index:', storyIdx);
      
      if (!window.todaysStoriesData || !window.todaysStoriesData[storyIdx]) {
        console.warn('Story not found:', storyIdx);
        return;
      }
      
      const story = window.todaysStoriesData[storyIdx];
      console.log('\u{1F4D6} Story:', story.title);
      
      // Clear previous highlights
      clearHighlights();
      
      // Collect all entity locations from the story
      const locations = [];
      
      // Check both 'mentions' and 'entities' fields for compatibility
      const entityList = story.mentions || story.entities || [];
      
      if (entityList.length > 0) {
        entityList.forEach(mention => {
          // Only highlight entities that have coordinates (places, people, businesses)
          const found = findEntityOnMap(mention.type, mention.slug);
          if (found) {
            locations.push(found);
            
            // Create simple popup for each entity
            const icon = mention.type === 'person' ? '\u{1F464}' : mention.type === 'place' ? '\u{1F4CD}' : '\u{1F3E2}';
            const popupHTML = \`<h3>\${icon} \${mention.name}</h3>\`;
            
            const popup = new maplibregl.Popup({
              closeButton: true,
              closeOnClick: false
            })
              .setLngLat(found.feature.geometry.coordinates)
              .setHTML(popupHTML)
              .addTo(map);
            
            if (!window.highlightPopups) {
              window.highlightPopups = [];
            }
            window.highlightPopups.push(popup);
          }
        });
      }
      
      if (locations.length === 0) {
        console.warn('No locations found for story');
        return;
      }
      
      // If single location, fly to it
      if (locations.length === 1) {
        map.flyTo({
          center: locations[0].feature.geometry.coordinates,
          zoom: 16,
          duration: 1500
        });
      } else {
        // If multiple locations, fit bounds to show all
        const bounds = new maplibregl.LngLatBounds();
        locations.forEach(loc => {
          bounds.extend(loc.feature.geometry.coordinates);
        });
        map.fitBounds(bounds, {
          padding: 100,
          maxZoom: 15,
          duration: 1500
        });
      }
    };
    
  }); // End of window.addEventListener('load')
<\/script>`], ["", ` <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.css">  <script src="https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js"><\/script> <script>
  // Wait for MapLibre to load
  window.addEventListener('load', function() {
    console.log('\u{1F5FA}\uFE0F Starting Phase 10 Map Integration...');
    console.log('\u{1F3AF} Expected adventure tile: /map-tiles/city-overview/13/4338/2404.png');
    
    // Initialize Pjuskeby Adventure Map with error handling
    let map;
    try {
      map = new maplibregl.Map({
        container: 'map',
      style: {
        version: 8,
        name: "Pjuskeby Adventure Map",
        metadata: {
          "pjuskeby:type": "adventure-cartoon",
          "pjuskeby:generated": "2025-10-21T07:42:59.948Z"
        },
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        sources: {
          'adventure-osm': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '\xA9 Adventure Style Map - Based on OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'adventure-background',
            type: 'background',
            paint: {
              'background-color': '#4FC3F7'
            }
          },
          {
            id: 'adventure-map-layer',
            type: 'raster',
            source: 'adventure-osm',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-opacity': 1.0,
              'raster-brightness-max': 0.8,
              'raster-brightness-min': 0.2,
              'raster-hue-rotate': 25
            }
          },
        ]
      },
        center: [10.713027, 59.449172], // Correct Pjuskeby coordinates
        zoom: 13,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-left');
      map.addControl(new maplibregl.FullscreenControl(), 'top-left');
      
      console.log('\u2705 Map initialized successfully');
      
    } catch (mapError) {
      console.error('\u274C Map initialization error:', mapError);
      document.getElementById('map').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 600px; background: #f1f5f9; color: #64748b; font-size: 1.1rem;"><div>\u{1F614} Could not load the map. Please refresh the page.</div></div>';
      return;
    }

    // Track current active layers
    let activeLayers = new Set(['all']);

    // Load GeoJSON data and add to map
    map.on('load', async () => {
      try {
        console.log('\u{1F4E1} Loading GeoJSON data from content/data/geo/...');
        
        // Try new location first (Phase 10 requirement)
        const loadPromises = [
          fetch('/content/data/geo/places.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/streets.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/people.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/businesses.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/events.geojson').then(r => r.json()).catch(() => null),
          fetch('/content/data/geo/rumors.geojson').then(r => r.json()).catch(() => null)
        ];

        let [places, streets, people, businesses, events, rumors] = await Promise.all(loadPromises);

        // Fallback to original location if needed
        if (!places || !streets || !people || !businesses) {
          console.log('\u26A0\uFE0F Falling back to /geojson/ location...');
          [places, streets, people, businesses, events, rumors] = await Promise.all([
            fetch('/geojson/places.geojson').then(r => r.json()),
            fetch('/geojson/streets.geojson').then(r => r.json()),
            fetch('/geojson/people.geojson').then(r => r.json()),
            fetch('/geojson/businesses.geojson').then(r => r.json()),
            fetch('/geojson/events.geojson').then(r => r.json()).catch(() => ({ type: 'FeatureCollection', features: [] })),
            fetch('/geojson/rumors.geojson').then(r => r.json()).catch(() => ({ type: 'FeatureCollection', features: [] }))
          ]);
        }

        // Create empty collections if events/rumors couldn't be loaded
        if (!events) events = { type: 'FeatureCollection', features: [] };
        if (!rumors) rumors = { type: 'FeatureCollection', features: [] };

        console.log('\u2705 Data loaded:', {
          places: places.features.length,
          people: people.features.length,
          businesses: businesses.features.length,
          events: events.features.length,
          rumors: rumors.features.length,
          streets: streets.features.length
        });

        // Add sources with clustering enabled for point data (>50 features requirement)
        const clusterConfig = {
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        };

        map.addSource('places', { type: 'geojson', data: places, ...clusterConfig });
        map.addSource('people', { type: 'geojson', data: people, ...clusterConfig });
        map.addSource('businesses', { type: 'geojson', data: businesses, ...clusterConfig });
        map.addSource('events', { type: 'geojson', data: events, ...clusterConfig });
        map.addSource('rumors', { type: 'geojson', data: rumors, ...clusterConfig });
        map.addSource('streets', { type: 'geojson', data: streets }); // No clustering for lines

        console.log('\u{1F3AF} Clustering enabled for all point layers (>50 features requirement)');

        // Add street lines layer
        map.addLayer({
          id: 'streets-layer',
          type: 'line',
          source: 'streets',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });

        // Helper function to create cluster layers
        function addClusterLayers(sourceId, color, icon) {
          // Cluster circles
          map.addLayer({
            id: \\\`\\\${sourceId}-clusters\\\`,
            type: 'circle',
            source: sourceId,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                color,
                10, color.replace(')', ', 0.8)').replace('rgb', 'rgba'),
                30, color.replace(')', ', 0.6)').replace('rgb', 'rgba')
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, 10, 20, 30, 25
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });

          // Cluster count labels removed to avoid glyphs dependency

          // Individual points
          map.addLayer({
            id: \\\`\\\${sourceId}-layer\\\`,
            type: 'circle',
            source: sourceId,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': icon === '\u{1F4CD}' ? 8 : 7,
              'circle-color': color,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });
        }

        // Add all cluster layers
        addClusterLayers('places', '#ef4444', '\u{1F4CD}');
        addClusterLayers('people', '#3b82f6', '\u{1F464}');
        addClusterLayers('businesses', '#22c55e', '\u{1F3E2}');
        addClusterLayers('events', '#8b5cf6', '\u{1F389}');
        addClusterLayers('rumors', '#f59e0b', '\u{1F441}\uFE0F');

        // Enhanced popup creation with related stories (Phase 10 requirement)
        async function createEnhancedPopup(feature, lngLat) {
          const props = feature.properties;
          const entityType = props.type;
          const slug = props.slug;

          let popupHTML = '';
          
          if (entityType === 'place') {
            popupHTML = \\\`
              <h3>\u{1F4CD} \\\${props.name}</h3>
              <p><strong>Category:</strong> \\\${props.category}</p>
              <p>\\\${props.description}</p>
              <a href="/steder/\\\${props.slug}">Read more \u2192</a>
            \\\`;
          } else if (entityType === 'event') {
            const eventDate = new Date(props.date).toLocaleDateString('en-US');
            popupHTML = \\\`
              <h3>\u{1F389} \\\${props.name}</h3>
              <p><strong>Date:</strong> \\\${eventDate}</p>
              <p><strong>Organizer:</strong> \\\${props.organizer}</p>
              <p>\\\${props.description}</p>
              <p><strong>Attendance:</strong> \\\${props.attendance}</p>
            \\\`;
          } else if (entityType === 'rumor') {
            popupHTML = \\\`
              <h3>\u{1F441}\uFE0F \\\${props.name}</h3>
              <p><strong>Category:</strong> \\\${props.category}</p>
              <p>\\\${props.description}</p>
              <p><strong>Reliability:</strong> \\\${props.reliability}</p>
              <p><strong>Source:</strong> \\\${props.source}</p>
            \\\`;
          } else if (entityType === 'person') {
            popupHTML = \\\`
              <h3>\u{1F464} \\\${props.name}</h3>
              <p><strong>Role:</strong> \\\${props.role}</p>
              <p>\\\${props.description}</p>
              <a href="/personer/\\\${props.slug}">Read more \u2192</a>
            \\\`;
          } else if (entityType === 'business') {
            popupHTML = \\\`
              <h3>\u{1F3E2} \\\${props.name}</h3>
              <p><strong>Type:</strong> \\\${props.business_type}</p>
              <p>\\\${props.description}</p>
              <a href="/steder/\\\${props.slug}">Read more \u2192</a>
            \\\`;
          }

          // Try to fetch related stories if we have a slug (Phase 10 enhancement)
          if (slug && (entityType === 'place' || entityType === 'person')) {
            try {
              const response = await fetch(\\\`/api/\\\${entityType}s/\\\${slug}\\\`);
              if (response.ok) {
                const entity = await response.json();
                if (entity.mentioned_in && entity.mentioned_in.length > 0) {
                  popupHTML += '<h4>\u{1F4D6} Related stories:</h4>';
                  entity.mentioned_in.slice(0, 3).forEach(story => {
                    popupHTML += \\\`<div style="margin: 0.25rem 0;"><a href="/historier/\\\${story.slug}" style="font-size: 0.8rem; color: #3b82f6;">\\\${story.title}</a></div>\\\`;
                  });
                }
              }
            } catch (error) {
              console.warn('Could not fetch related stories:', error);
            }
          }

          return new maplibregl.Popup()
            .setLngLat(lngLat)
            .setHTML(popupHTML)
            .addTo(map);
        }

        // Add hover effects for all layers
        const pointLayers = ['places-layer', 'people-layer', 'businesses-layer', 'events-layer', 'rumors-layer'];
        const clusterLayers = ['places-clusters', 'people-clusters', 'businesses-clusters', 'events-clusters', 'rumors-clusters'];
        
        [...pointLayers, ...clusterLayers].forEach(layer => {
          map.on('mouseenter', layer, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layer, () => {
            map.getCanvas().style.cursor = '';
          });
        });

        // Add click handlers for individual features
        pointLayers.forEach(layer => {
          map.on('click', layer, async (e) => {
            await createEnhancedPopup(e.features[0], e.lngLat);
          });
        });

        // Add click handlers for clusters (zoom in when clicked)
        clusterLayers.forEach(layer => {
          map.on('click', layer, (e) => {
            const clusterId = e.features[0].properties.cluster_id;
            const source = e.features[0].source;
            
            map.getSource(source).getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              
              map.easeTo({
                center: e.features[0].geometry.coordinates,
                zoom: zoom
              });
            });
          });
        });

        // Streets click handler
        map.on('click', 'streets-layer', async (e) => {
          const props = e.features[0].properties;
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(\\\`
              <h3>\u{1F6E3}\uFE0F \\\${props.name}</h3>
              <p>\\\${props.description}</p>
            \\\`)
            .addTo(map);
        });

        // Enhanced layer control with all new layers
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const layer = btn.dataset.layer;
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeLayers.clear();
            activeLayers.add(layer);

            // Define all layer groups (cluster-count temporarily removed)
            const layerGroups = {
              places: ['places-layer', 'places-clusters'],
              people: ['people-layer', 'people-clusters'],
              businesses: ['businesses-layer', 'businesses-clusters'],
              events: ['events-layer', 'events-clusters'],
              rumors: ['rumors-layer', 'rumors-clusters'],
              streets: ['streets-layer']
            };

            // Hide all layers first
            Object.values(layerGroups).flat().forEach(layerId => {
              if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', 'none');
              }
            });

            // Show selected layers
            if (layer === 'all') {
              Object.values(layerGroups).flat().forEach(layerId => {
                if (map.getLayer(layerId)) {
                  map.setLayoutProperty(layerId, 'visibility', 'visible');
                }
              });
            } else if (layerGroups[layer]) {
              layerGroups[layer].forEach(layerId => {
                if (map.getLayer(layerId)) {
                  map.setLayoutProperty(layerId, 'visibility', 'visible');
                }
              });
            }
          });
        });

        // Fit bounds to show all features on load
        const allFeatures = [
          ...places.features,
          ...people.features,
          ...businesses.features,
          ...events.features,
          ...rumors.features
        ];

        if (allFeatures.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          allFeatures.forEach(feature => {
            if (feature.geometry.type === 'Point') {
              bounds.extend(feature.geometry.coordinates);
            }
          });
          map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }

        console.log('\u2705 Phase 10 Map Integration completed successfully!');
        console.log('\u{1F3AF} Features:', allFeatures.length, 'total features loaded with clustering');
        console.log('\u{1F4CA} Layers: 6 data types + clustering support');
        console.log('\u{1F517} Enhanced POI popovers with related stories enabled');

        // Load today's featured entities with timeout
        setTimeout(() => {
          loadTodaysFeatured();
        }, 1000);

      } catch (error) {
        console.error('\u274C Error loading GeoJSON data:', error);
      }
    });

    // Function to load today's featured entities from stories
    async function loadTodaysFeatured() {
      console.log('\u{1F4F0} [loadTodaysFeatured] Starting...');
      // Set loading timeout
      const timeoutId = setTimeout(() => {
        console.warn('\u23F1\uFE0F [loadTodaysFeatured] Timeout - taking too long');
        document.getElementById('featured-entities').innerHTML = '<div class="loading-card"><p>\u23F1\uFE0F Loading took too long. Using cached data...</p></div>';
      }, 5000);
      
      try {
        console.log('\u{1F4F0} [loadTodaysFeatured] Loading todays featured entities...');
        
        // Fetch today's actual stories
        const today = new Date().toISOString().split('T')[0];
        let todaysStories = [];
        
        // Use hardcoded data for today (October 22, 2025)
        todaysStories = [
          {
            title: "Diary of Whimsy and Whatnots: The Case of the Invisible Spoons and the Suspect Hat",
            characters: ["Lola Fizzletwig", "Trixie Wobblethorpe"],
            locations: ["Boingy Beach"],
            mentions: [
              { type: 'person', name: 'Lola Fizzletwig', slug: 'lola-fizzletwig' },
              { type: 'person', name: 'Trixie Wobblethorpe', slug: 'trixie-wobblethorpe' },
              { type: 'place', name: 'Boingy Beach', slug: 'boingy-beach' }
            ]
          },
          {
            title: "The Mystery of the Creaky Corner's Cupboard",
            characters: ["Eustace Jumblebottom", "Trixie Wobblethorpe"],
            locations: ["Creaky Corner"],
            mentions: [
              { type: 'person', name: 'Eustace Jumblebottom', slug: 'eustace-jumblebottom' },
              { type: 'person', name: 'Trixie Wobblethorpe', slug: 'trixie-wobblethorpe' },
              { type: 'place', name: 'Creaky Corner', slug: 'creaky-corner' }
            ]
          },
          {
            title: "The Whisper of Lamplight and Morse Burps: A Snoreberry Tale", 
            characters: ["Clive Flumpington", "Edna Snortwig"],
            locations: ["Boingy Beach"],
            mentions: [
              { type: 'person', name: 'Clive Flumpington', slug: 'clive-flumpington' },
              { type: 'person', name: 'Edna Snortwig', slug: 'edna-snortwig' },
              { type: 'place', name: 'Boingy Beach', slug: 'boingy-beach' }
            ]
          }
        ];
        
        const featuredContainer = document.getElementById('featured-entities');
        console.log('\u{1F4F0} [loadTodaysFeatured] featuredContainer found:', !!featuredContainer);
        
        if (!todaysStories || todaysStories.length === 0) {
          console.warn('\u{1F4F0} [loadTodaysFeatured] No stories found');
          featuredContainer.innerHTML = '<p class="loading">No featured items today</p>';
          return;
        }
        
        console.log('\u{1F4F0} [loadTodaysFeatured] Processing', todaysStories.length, 'stories');
        
        // Extract entities mentioned in today's stories
        const mentionedEntities = new Map();
        
        todaysStories.forEach(story => {
          if (story.mentions) {
            story.mentions.forEach(mention => {
              const key = \\\`\\\${mention.type}-\\\${mention.slug}\\\`;
              if (!mentionedEntities.has(key)) {
                mentionedEntities.set(key, {
                  ...mention,
                  stories: [story.title]
                });
              } else {
                mentionedEntities.get(key).stories.push(story.title);
              }
            });
          }
        });
        
        // Create story cards with entities and links
        let featuredHTML = '';
        todaysStories.forEach((story, idx) => {
          const entityGroups = {
            person: [],
            place: [],
            business: []
          };
          
          // Group entities by type
          if (story.mentions) {
            story.mentions.forEach(mention => {
              if (entityGroups[mention.type]) {
                entityGroups[mention.type].push(mention);
              }
            });
          }
          
          featuredHTML += '<div class="story-card">';
          featuredHTML += '<h3 class="story-title">' + story.title.replace(/'/g, '&#39;') + '</h3>';
          featuredHTML += '<div class="story-entities">';
          
          Object.entries(entityGroups).forEach(([type, entities]) => {
            if (entities.length > 0) {
              featuredHTML += '<div class="entity-group">';
              featuredHTML += '<span class="entity-label">' + getEntityTypeLabel(type) + ':</span>';
              entities.forEach(entity => {
                featuredHTML += '<a href="' + getEntityUrl(entity.type, entity.slug) + '" class="entity-link ' + entity.type + '" onclick="event.stopPropagation()">';
                featuredHTML += getEntityIcon(entity.type) + ' ' + entity.name.replace(/'/g, '&#39;');
                featuredHTML += '</a>';
              });
              featuredHTML += '</div>';
            }
          });
          
          featuredHTML += '</div>';
          featuredHTML += '<button class="map-highlight-btn" data-story-idx="' + idx + '" onclick="highlightStoryByIndex(' + idx + ')">\u{1F3AF} Show on map</button>';
          featuredHTML += '</div>';
        });
        
        // Store stories in a global variable for access by onclick handlers
        window.todaysStoriesData = todaysStories;
        
        console.log('\u{1F4F0} [loadTodaysFeatured] HTML generated, length:', featuredHTML.length);
        console.log('\u{1F4F0} [loadTodaysFeatured] Setting innerHTML...');
        
        featuredContainer.innerHTML = featuredHTML || '<div class="loading-card"><p>No stories found for today</p></div>';
        
        console.log('\u2705 [loadTodaysFeatured] Complete!');
        
        // Clear timeout since we completed successfully
        clearTimeout(timeoutId);
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('\u274C [loadTodaysFeatured] Error:', error);
        console.error('\u274C [loadTodaysFeatured] Stack:', error.stack);
        document.getElementById('featured-entities').innerHTML = '<div class="loading-card"><p>\u{1F614} Could not load today\\\\'s featured. Please refresh the page.</p></div>';
      }
    }
    
    // Helper function to get entity type labels
    function getEntityTypeLabel(type) {
      const labels = {
        'place': 'Places',
        'person': 'People', 
        'business': 'Businesses',
        'street': 'Streets',
        'event': 'Events',
        'rumor': 'Rumors'
      };
      return labels[type] || type;
    }

    // Helper function to get entity URLs
    function getEntityUrl(type, slug) {
      const baseUrls = {
        'person': '/personer/',
        'place': '/steder/',
        'business': '/bedrifter/',
        'street': '/gater/',
        'event': '/arrangementer/',
        'rumor': '/rykter/'
      };
      return (baseUrls[type] || '/') + slug;
    }

    // Helper function to get entity icons
    function getEntityIcon(type) {
      const icons = {
        'person': '\u{1F464}',
        'place': '\u{1F4CD}',
        'business': '\u{1F3EA}',
        'street': '\u{1F6E3}\uFE0F',
        'event': '\u{1F4C5}',
        'rumor': '\u{1F4AC}'
      };
      return icons[type] || '\u{1F4CC}';
    }
    
    // Function to highlight story by index
    window.highlightStoryByIndex = function(idx) {
      const story = window.todaysStoriesData[idx];
      if (story && story.mentions) {
        highlightStoryEntities(story.title, story.mentions);
      }
    };
    
    // Function to highlight story entities on map
    window.highlightStoryEntities = function(storyTitle, entities) {
      console.log('\u{1F3AF} Highlighting entities for:', storyTitle);
      
      if (!entities || entities.length === 0) {
        console.warn('No entities to highlight');
        return;
      }

      // Clear existing highlights
      clearHighlights();

      // Find and highlight each entity
      const foundEntities = [];
      entities.forEach(entity => {
        const found = findEntityOnMap(entity.type, entity.slug);
        if (found) {
          foundEntities.push(found);
          highlightEntityOnMap(found.feature, found.source);
        }
      });

      // Zoom to fit all entities if any were found
      if (foundEntities.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        foundEntities.forEach(entity => {
          if (entity.feature.geometry.type === 'Point') {
            bounds.extend(entity.feature.geometry.coordinates);
          }
        });
        
        // Add some padding and zoom to bounds
        map.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      }
    };

    // Function to find entity on map
    function findEntityOnMap(type, slug) {
      const sourceMap = {
        'person': 'people',
        'place': 'places',
        'business': 'businesses',
        'street': 'streets'
      };
      
      const sourceName = sourceMap[type];
      if (!sourceName || !map.getSource(sourceName)) {
        return null;
      }

      const sourceData = map.getSource(sourceName)._data;
      if (sourceData && sourceData.features) {
        const feature = sourceData.features.find(f => 
          f.properties.slug === slug
        );
        
        if (feature) {
          return { feature, source: sourceName };
        }
      }
      return null;
    }

    // Function to highlight entity on map
    function highlightEntityOnMap(feature, sourceName) {
      // Add highlighting style (this is a simplified version)
      // In a full implementation, you might want to add a temporary layer
      console.log('\u{1F3AF} Highlighting:', feature.properties.name, 'from', sourceName);
      
      // Create a popup for the highlighted entity
      const popup = createPopup(
        feature.geometry.coordinates, 
        feature.properties.name,
        feature.properties.type,
        feature.properties
      );
      
      // Store popup for later cleanup
      if (!window.highlightPopups) {
        window.highlightPopups = [];
      }
      window.highlightPopups.push(popup);
    }

    // Function to clear highlights
    function clearHighlights() {
      if (window.highlightPopups) {
        window.highlightPopups.forEach(popup => popup.remove());
        window.highlightPopups = [];
      }
    }

    // Function to highlight entity on map (legacy function, kept for compatibility)
    function highlightEntity(type, slug) {
      const found = findEntityOnMap(type, slug);
      if (found) {
        const { feature } = found;
        
        // Fly to entity location
        map.flyTo({
          center: feature.geometry.coordinates,
          zoom: 16,
          duration: 1500
        });
        
        // Show popup for entity
        setTimeout(() => {
          map.fire('click', {
            lngLat: feature.geometry.coordinates,
            point: map.project(feature.geometry.coordinates)
          });
        }, 1600);
      } else {
        console.warn('Entity not found on map:', type, slug);
      }
    }

    // Function to highlight story locations on map
    window.highlightStoryByIndex = function(storyIdx) {
      console.log('\u{1F3AF} Highlighting story index:', storyIdx);
      
      if (!window.todaysStoriesData || !window.todaysStoriesData[storyIdx]) {
        console.warn('Story not found:', storyIdx);
        return;
      }
      
      const story = window.todaysStoriesData[storyIdx];
      console.log('\u{1F4D6} Story:', story.title);
      
      // Clear previous highlights
      clearHighlights();
      
      // Collect all entity locations from the story
      const locations = [];
      
      // Check both 'mentions' and 'entities' fields for compatibility
      const entityList = story.mentions || story.entities || [];
      
      if (entityList.length > 0) {
        entityList.forEach(mention => {
          // Only highlight entities that have coordinates (places, people, businesses)
          const found = findEntityOnMap(mention.type, mention.slug);
          if (found) {
            locations.push(found);
            
            // Create simple popup for each entity
            const icon = mention.type === 'person' ? '\u{1F464}' : mention.type === 'place' ? '\u{1F4CD}' : '\u{1F3E2}';
            const popupHTML = \\\`<h3>\\\${icon} \\\${mention.name}</h3>\\\`;
            
            const popup = new maplibregl.Popup({
              closeButton: true,
              closeOnClick: false
            })
              .setLngLat(found.feature.geometry.coordinates)
              .setHTML(popupHTML)
              .addTo(map);
            
            if (!window.highlightPopups) {
              window.highlightPopups = [];
            }
            window.highlightPopups.push(popup);
          }
        });
      }
      
      if (locations.length === 0) {
        console.warn('No locations found for story');
        return;
      }
      
      // If single location, fly to it
      if (locations.length === 1) {
        map.flyTo({
          center: locations[0].feature.geometry.coordinates,
          zoom: 16,
          duration: 1500
        });
      } else {
        // If multiple locations, fit bounds to show all
        const bounds = new maplibregl.LngLatBounds();
        locations.forEach(loc => {
          bounds.extend(loc.feature.geometry.coordinates);
        });
        map.fitBounds(bounds, {
          padding: 100,
          maxZoom: 15,
          duration: 1500
        });
      }
    };
    
  }); // End of window.addEventListener('load')
<\/script>`])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Map of Pjuskeby", "data-astro-cid-ja3wf7ge": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="map-container adventure-map-container" data-astro-cid-ja3wf7ge> <div class="map-header" data-astro-cid-ja3wf7ge> <h1 data-astro-cid-ja3wf7ge>🗺️ Map of Pjuskeby</h1> <p data-astro-cid-ja3wf7ge>Explore all places, streets, people, businesses, events and rumors in our small, absurd world</p> </div> <div class="map-controls" data-astro-cid-ja3wf7ge> <button class="control-btn active" data-layer="all" data-astro-cid-ja3wf7ge>🌍 All</button> <button class="control-btn" data-layer="places" data-astro-cid-ja3wf7ge>📍 Places</button> <button class="control-btn" data-layer="streets" data-astro-cid-ja3wf7ge>🛣️ Streets</button> <button class="control-btn" data-layer="people" data-astro-cid-ja3wf7ge>👥 People</button> <button class="control-btn" data-layer="businesses" data-astro-cid-ja3wf7ge>🏢 Businesses</button> <button class="control-btn" data-layer="events" data-astro-cid-ja3wf7ge>🎉 Events</button> <button class="control-btn" data-layer="rumors" data-astro-cid-ja3wf7ge>👁️ Rumors</button> </div> <div id="map" data-astro-cid-ja3wf7ge></div> <div class="map-legend" data-astro-cid-ja3wf7ge> <h3 data-astro-cid-ja3wf7ge>Legend</h3> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-marker place" data-astro-cid-ja3wf7ge></span> Places</div> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-marker person" data-astro-cid-ja3wf7ge></span> People</div> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-marker business" data-astro-cid-ja3wf7ge></span> Businesses</div> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-marker event" data-astro-cid-ja3wf7ge></span> Events</div> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-marker rumor" data-astro-cid-ja3wf7ge></span> Rumors</div> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-line" data-astro-cid-ja3wf7ge></span> Streets</div> <div class="legend-item" data-astro-cid-ja3wf7ge><span class="legend-cluster" data-astro-cid-ja3wf7ge></span> Clustered (click to zoom)</div> </div> </div>  <div class="todays-featured-section" data-astro-cid-ja3wf7ge> <div class="todays-featured-header" data-astro-cid-ja3wf7ge> <h2 data-astro-cid-ja3wf7ge>📰 Today's Featured in Pjuskeby</h2> <p class="featured-subtitle" data-astro-cid-ja3wf7ge>Places, people and stories mentioned in today's tales</p> </div> <div id="featured-entities" class="featured-grid" data-astro-cid-ja3wf7ge> <div class="loading-card" data-astro-cid-ja3wf7ge> <div class="loading-spinner" data-astro-cid-ja3wf7ge></div> <p data-astro-cid-ja3wf7ge>Loading today's featured...</p> </div> </div> </div> ` }));
}, "/var/www/vhosts/pjuskeby.org/src/pages/kart.astro", void 0);

const $$file = "/var/www/vhosts/pjuskeby.org/src/pages/kart.astro";
const $$url = "/kart";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Kart,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
