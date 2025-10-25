/* Phase 19: Service Worker Registration
 * Registers the service worker for offline functionality and performance caching
 */

// Register service worker when page loads
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('🔧 Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service worker registered successfully:', registration.scope);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('🔄 New service worker available. Reload to update.');
              
              // Optionally show a toast notification to user
              showUpdateNotification();
            }
          });
        }
      });
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from service worker:', event.data);
      });
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
      
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  });
  
  // Handle when page is controlled by service worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service worker controller changed');
    // Optionally reload the page to get the latest version
    // window.location.reload();
  });
}

// Show update notification to user
function showUpdateNotification() {
  // Create a simple notification element
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2563eb;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.4;
    max-width: 320px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="flex: 1;">
        <strong>Oppdatering tilgjengelig</strong><br>
        <small>Ny versjon av siden er klar</small>
      </div>
      <button id="sw-update-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      ">
        Oppdater
      </button>
      <button id="sw-dismiss-btn" style="
        background: none;
        border: none;
        color: rgba(255,255,255,0.8);
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
      ">
        ×
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Handle update button
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    window.location.reload();
  });
  
  // Handle dismiss button
  document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById('sw-update-notification')) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 10000);
}

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    // Log performance metrics
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      if (perfData) {
        console.log('📊 Performance Metrics:');
        console.log(`  DNS Lookup: ${Math.round(perfData.domainLookupEnd - perfData.domainLookupStart)}ms`);
        console.log(`  TCP Connect: ${Math.round(perfData.connectEnd - perfData.connectStart)}ms`);
        console.log(`  Request: ${Math.round(perfData.responseStart - perfData.requestStart)}ms`);
        console.log(`  Response: ${Math.round(perfData.responseEnd - perfData.responseStart)}ms`);
        console.log(`  DOM Load: ${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`);
        console.log(`  Total Load Time: ${Math.round(perfData.loadEventEnd - perfData.navigationStart)}ms`);
      }
      
      // Log Core Web Vitals if available
      if ('web-vitals' in window) {
        // This would require importing web-vitals library
        // For now, we'll use PerformanceObserver for basic metrics
      }
    }, 0);
  });
}

console.log('🚀 Service Worker registration script loaded');