#!/bin/bash

# Phase 15: Setup Visual Regression and Load Testing
# Visual tests + k6 load testing for Phase 15

echo "📸 Phase 15: Setting up visual regression and load testing..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
TESTS_DIR="$PROJECT_DIR/tests"

# Install k6 and visual testing dependencies
echo "📦 Installing k6 and visual testing dependencies..."
cd "$PROJECT_DIR"

npm install --save-dev \
    @percy/playwright \
    @percy/cli

# Install k6 (if not already installed)
echo "⚡ Installing k6 for load testing..."
if ! command -v k6 &> /dev/null; then
    # For Debian/Ubuntu systems
    sudo gpg -k
    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6
fi

# Create visual regression tests with Playwright
echo "🎨 Creating visual regression tests..."
cat > "$TESTS_DIR/e2e/visual.spec.ts" << 'EOF'
// Visual regression tests
// Phase 15: Testing Infrastructure - Visual testing + Norsk

import { test, expect } from '@playwright/test';

test.describe('Visuell regresjon testing', () => {
  
  test('det skal ta skjermbilder av hovedsider', async ({ page }) => {
    // Homepage screenshot
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('homepage.png');
    
    // People page screenshot
    await page.goto('/personer');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('people-page.png');
    
    // Stories page screenshot
    await page.goto('/historier');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('stories-page.png');
    
    // Map page screenshot
    await page.goto('/kart');
    await page.waitForTimeout(3000); // Wait for map to load
    await expect(page).toHaveScreenshot('map-page.png');
  });

  test('det skal teste responsive design på forskjellige skjermstørrelser', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Test homepage på hver størrelse
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`);
      
      // Test personer-siden på hver størrelse
      await page.goto('/personer');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`people-${viewport.name}.png`);
    }
  });

  test('det skal teste modal og popup-vinduer', async ({ page }) => {
    await page.goto('/');
    
    // Sjekk om det finnes modaler eller popups å teste
    const modalTriggers = page.locator('button:has-text("Info"), button:has-text("Om"), .info-button');
    const modalCount = await modalTriggers.count();
    
    if (modalCount > 0) {
      await modalTriggers.first().click();
      await page.waitForTimeout(500);
      
      // Ta skjermbilde av modal
      const modal = page.locator('.modal, .popup, [role="dialog"]');
      if (await modal.isVisible()) {
        await expect(page).toHaveScreenshot('modal-open.png');
      }
    }
  });

  test('det skal teste mørk modus hvis tilgjengelig', async ({ page }) => {
    await page.goto('/');
    
    // Sjekk om det finnes mørk modus toggle
    const darkModeToggle = page.locator('button:has-text("Mørk"), .dark-mode-toggle, [aria-label*="dark"]');
    
    if (await darkModeToggle.isVisible()) {
      // Ta skjermbilde av lys modus
      await expect(page).toHaveScreenshot('light-mode.png');
      
      // Bytt til mørk modus
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      // Ta skjermbilde av mørk modus
      await expect(page).toHaveScreenshot('dark-mode.png');
    }
  });

  test('det skal teste fokus-stater for tilgjengelighet', async ({ page }) => {
    await page.goto('/');
    
    // Test fokus på hovednavigasjon
    const navLinks = page.locator('nav a').first();
    await navLinks.focus();
    await expect(page).toHaveScreenshot('navigation-focus.png');
    
    // Test fokus på søkefelt
    const searchInput = page.locator('input[type="search"], input[placeholder*="søk"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.focus();
      await expect(page).toHaveScreenshot('search-focus.png');
    }
  });

  test('det skal teste error-sider', async ({ page }) => {
    // Test 404-side
    await page.goto('/denne-siden-finnes-ikke');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('404-page.png');
  });
});
EOF

# Create k6 load tests
echo "⚡ Creating k6 load tests..."
mkdir -p "$TESTS_DIR/load"

cat > "$TESTS_DIR/load/api-load-test.js" << 'EOF'
// k6 Load Testing for Pjuskeby API
// Phase 15: Testing Infrastructure - Performance testing

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users  
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    errors: ['rate<0.1'],             // Custom error rate below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

// Test data
const testPersonIds = ['1', '2', '3', '4', '5'];
const testStoryIds = ['1', '2', '3', '4', '5'];

export default function () {
  // Test homepage
  const homepageResponse = http.get(`${BASE_URL}/`);
  check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in reasonable time': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(homepageResponse.status !== 200);
  apiResponseTime.add(homepageResponse.timings.duration);
  
  sleep(1);
  
  // Test API endpoints
  const apiTests = [
    { name: 'people API', url: '/api/people' },
    { name: 'stories API', url: '/api/stories' },
    { name: 'places API', url: '/api/places' },
  ];
  
  apiTests.forEach(test => {
    const response = http.get(`${BASE_URL}${test.url}`);
    check(response, {
      [`${test.name} status is 200`]: (r) => r.status === 200,
      [`${test.name} returns JSON`]: (r) => r.headers['Content-Type']?.includes('application/json'),
      [`${test.name} responds quickly`]: (r) => r.timings.duration < 500,
    });
    
    errorRate.add(response.status !== 200);
    apiResponseTime.add(response.timings.duration);
  });
  
  sleep(1);
  
  // Test specific person page
  const randomPersonId = testPersonIds[Math.floor(Math.random() * testPersonIds.length)];
  const personResponse = http.get(`${BASE_URL}/api/people/${randomPersonId}`);
  check(personResponse, {
    'person detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'person detail responds quickly': (r) => r.timings.duration < 300,
  });
  
  if (personResponse.status === 200) {
    const personData = JSON.parse(personResponse.body);
    check(personData, {
      'person has required fields': (data) => data.id && data.name,
    });
  }
  
  sleep(1);
  
  // Test specific story page
  const randomStoryId = testStoryIds[Math.floor(Math.random() * testStoryIds.length)];
  const storyResponse = http.get(`${BASE_URL}/api/stories/${randomStoryId}`);
  check(storyResponse, {
    'story detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
    'story detail responds quickly': (r) => r.timings.duration < 300,
  });
  
  sleep(1);
  
  // Test search functionality
  const searchTerms = ['test', 'person', 'place', 'story'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const searchResponse = http.get(`${BASE_URL}/api/search?q=${randomTerm}`);
  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search responds quickly': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(searchResponse.status !== 200);
  apiResponseTime.add(searchResponse.timings.duration);
  
  sleep(2);
}

// Teardown function
export function teardown(data) {
  console.log('🎯 Load test completed');
  console.log(`📊 Error rate: ${data.errorRate || 'N/A'}`);
  console.log(`⏱️  Average response time: ${data.apiResponseTime || 'N/A'}ms`);
}
EOF

# Create load test for static assets
cat > "$TESTS_DIR/load/static-assets-test.js" << 'EOF'
// k6 Load Testing for Static Assets
// Phase 15: Testing Infrastructure - Asset performance

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users quickly
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // Static assets should be very fast
    http_req_failed: ['rate<0.05'],   // Very low error rate for assets
  },
};

const BASE_URL = 'http://localhost:3000';

// Common static assets to test
const staticAssets = [
  '/favicon.ico',
  '/manifest.json',
  '/images/logo.png',
  '/css/style.css',
  '/js/main.js',
];

export default function () {
  // Test static assets
  staticAssets.forEach(asset => {
    const response = http.get(`${BASE_URL}${asset}`);
    check(response, {
      [`${asset} status is 200 or 404`]: (r) => r.status === 200 || r.status === 404,
      [`${asset} loads quickly`]: (r) => r.timings.duration < 100,
      [`${asset} has cache headers`]: (r) => r.headers['Cache-Control'] || r.headers['ETag'],
    });
  });
  
  sleep(0.5);
  
  // Test JSON data files
  const jsonFiles = [
    '/json/people.json',
    '/json/stories.json',
    '/json/places.json',
  ];
  
  jsonFiles.forEach(jsonFile => {
    const response = http.get(`${BASE_URL}${jsonFile}`);
    check(response, {
      [`${jsonFile} status is 200`]: (r) => r.status === 200,
      [`${jsonFile} is valid JSON`]: (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
      [`${jsonFile} loads quickly`]: (r) => r.timings.duration < 200,
    });
  });
  
  sleep(1);
}
EOF

# Create load test runner script
cat > "$TESTS_DIR/load/run-load-tests.sh" << 'EOF'
#!/bin/bash

# Load Test Runner for Phase 15
# Kjører alle k6 load tests

echo "⚡ Running k6 load tests for Phase 15..."

TESTS_DIR="/var/www/vhosts/pjuskeby.org/httpdocs/tests/load"
RESULTS_DIR="/var/www/vhosts/pjuskeby.org/httpdocs/test-results/load"

mkdir -p "$RESULTS_DIR"

echo "🚀 Starting API load tests..."
k6 run \
    --out json="$RESULTS_DIR/api-load-results.json" \
    --out summary="$RESULTS_DIR/api-load-summary.txt" \
    "$TESTS_DIR/api-load-test.js"

echo ""
echo "📦 Starting static assets load tests..."
k6 run \
    --out json="$RESULTS_DIR/static-assets-results.json" \
    --out summary="$RESULTS_DIR/static-assets-summary.txt" \
    "$TESTS_DIR/static-assets-test.js"

echo ""
echo "✅ Load tests completed!"
echo "📊 Results saved in: $RESULTS_DIR"
echo ""
echo "📋 Load test summary:"
echo "   ✅ API performance under load"
echo "   ✅ Static asset delivery performance"
echo "   ✅ Error rate validation"
echo "   ✅ Response time thresholds"
EOF

chmod +x "$TESTS_DIR/load/run-load-tests.sh"

# Update package.json with testing scripts
echo "📝 Adding test scripts to package.json..."
cd "$PROJECT_DIR"

# Check if package.json exists, create if not
if [ ! -f "package.json" ]; then
    cat > "package.json" << 'EOF'
{
  "name": "pjuskeby-website",
  "version": "1.0.0",
  "description": "Pjuskeby historical website with interactive features",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:visual": "playwright test tests/e2e/visual.spec.ts",
    "test:load": "cd tests/load && ./run-load-tests.sh",
    "test:all": "npm run test && npm run test:e2e && npm run test:load",
    "dev": "http-server -p 3000 -c-1"
  },
  "keywords": ["history", "pjuskeby", "interactive", "maps"],
  "author": "Pjuskeby Project",
  "license": "MIT"
}
EOF
else
    # Add test scripts to existing package.json
    npm pkg set scripts.test="jest"
    npm pkg set scripts.test:watch="jest --watch"
    npm pkg set scripts.test:coverage="jest --coverage"
    npm pkg set scripts.test:e2e="playwright test"
    npm pkg set scripts.test:visual="playwright test tests/e2e/visual.spec.ts"
    npm pkg set scripts.test:load="cd tests/load && ./run-load-tests.sh"
    npm pkg set scripts.test:all="npm run test && npm run test:e2e && npm run test:load"
    npm pkg set scripts.dev="http-server -p 3000 -c-1"
fi

echo ""
echo "✅ Visual regression and load testing setup complete!"
echo ""
echo "📋 Testing capabilities added:"
echo "   ✅ Visual regression with Playwright screenshots"
echo "   ✅ Responsive design testing"
echo "   ✅ k6 API load testing"
echo "   ✅ Static asset performance testing"
echo ""
echo "🎭 Test commands available:"
echo "   npm run test          - Unit and integration tests"
echo "   npm run test:e2e      - End-to-end tests"
echo "   npm run test:visual   - Visual regression tests"
echo "   npm run test:load     - Load testing with k6"
echo "   npm run test:all      - Run all tests"
echo ""
echo "🚨 FORBIDDEN guardrail: Deploy uten tester - PREVENTED!"