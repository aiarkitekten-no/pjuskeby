/* Phase 19: Service Worker for Offline Functionality
 * Implements caching strategy for better performance and offline access
 * 
 * Cache Strategy:
 * - Static assets: Cache first with 1 year expiry
 * - API responses: Network first with cache fallback
 * - Pages: Stale while revalidate
 */

const CACHE_NAME = 'pjuskeby-v1';
const STATIC_CACHE = 'pjuskeby-static-v1';
const API_CACHE = 'pjuskeby-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/og-image.svg',
  '/map-init.js',
  // Core CSS and JS files will be added dynamically
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/people',
  '/api/places', 
  '/api/streets',
  '/api/businesses',
  '/api/map/layers',
  '/api/search'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }
  
  // Static assets - Cache First strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // API endpoints - Network First strategy
  if (isApiEndpoint(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  
  // HTML pages - Stale While Revalidate strategy
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }
  
  // Default - Network First
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// Cache First strategy - for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('🌐 Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First error:', error);
    throw error;
  }
}

// Network First strategy - for API and dynamic content
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      console.log('🌐 Network first, fetching:', request.url);
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (networkError) {
      console.log('📦 Network failed, trying cache:', request.url);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('❌ Network First error:', error);
    throw error;
  }
}

// Stale While Revalidate strategy - for HTML pages
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch fresh content in background
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // Network failed, but we might have cache
    });
    
    // Return cached content immediately if available
    if (cachedResponse) {
      console.log('📦 Serving from cache while revalidating:', request.url);
      return cachedResponse;
    }
    
    // No cache, wait for network
    console.log('🌐 No cache, waiting for network:', request.url);
    return await fetchPromise;
  } catch (error) {
    console.error('❌ Stale While Revalidate error:', error);
    throw error;
  }
}

// Helper functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|woff|woff2|ttf|ico)$/) ||
         pathname.startsWith('/assets/') ||
         pathname.startsWith('/_astro/');
}

function isApiEndpoint(pathname) {
  return pathname.startsWith('/api/') ||
         API_ENDPOINTS.some(endpoint => pathname.startsWith(endpoint));
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Implement any background sync logic here
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        data: data.data
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

console.log('🚀 Service Worker: Loaded successfully');