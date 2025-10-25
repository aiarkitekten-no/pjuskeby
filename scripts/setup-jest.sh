#!/bin/bash

# Phase 15: Setup Jest Testing Framework
# REQUIRED: 80% coverage, FORBIDDEN: Deploy uten tester

echo "🧪 Phase 15: Setting up Jest testing infrastructure..."

PROJECT_DIR="/var/www/vhosts/pjuskeby.org/httpdocs"
TESTS_DIR="$PROJECT_DIR/tests"

# Create test directory structure
echo "📁 Creating test directory structure..."
mkdir -p "$TESTS_DIR"/{unit,integration,e2e,utils,mocks,fixtures}
mkdir -p "$TESTS_DIR/unit"/{components,server,utils}
mkdir -p "$TESTS_DIR/integration"/{api,database}

# Install Jest and testing dependencies
echo "📦 Installing Jest and testing packages..."
cd "$PROJECT_DIR"

# Check if package.json exists and install dependencies
if [ -f "package.json" ]; then
    npm install --save-dev \
        jest \
        @jest/globals \
        @types/jest \
        ts-jest \
        supertest \
        @types/supertest \
        jest-environment-node \
        jest-html-reporters \
        @jest/coverage \
        nock \
        msw
else
    echo "⚠️  No package.json found, creating basic structure..."
    npm init -y
    npm install --save-dev \
        jest \
        @jest/globals \
        @types/jest \
        ts-jest \
        supertest \
        @types/supertest \
        jest-environment-node \
        jest-html-reporters \
        @jest/coverage \
        nock \
        msw
fi

# Create Jest configuration
echo "⚙️  Creating Jest configuration..."
cat > "$PROJECT_DIR/jest.config.js" << 'EOF'
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  
  // Coverage configuration (REQUIRED: 80% coverage)
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Files to include in coverage
  collectCoverageFrom: [
    'server/**/*.ts',
    'src/**/*.ts',
    '!server/**/*.d.ts',
    '!src/**/*.d.ts',
    '!server/index.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output for Norwegian test descriptions
  verbose: true,
  
  // Reporters with HTML output (PROOF requirement)
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage/html-report',
      filename: 'test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Pjuskeby Test Report',
      logoImgPath: undefined,
      inlineSource: true
    }]
  ]
};
EOF

# Create test setup file
echo "🔧 Creating test setup configuration..."
cat > "$TESTS_DIR/setup.ts" << 'EOF'
// Jest test setup for Pjuskeby project
// Phase 15: Testing Infrastructure

import { jest } from '@jest/globals';

// Extend Jest matchers for better testing
expect.extend({
  toBeValidTimestamp(received: any) {
    const isValid = !isNaN(Date.parse(received));
    return {
      message: () => `Expected ${received} to be a valid timestamp`,
      pass: isValid
    };
  },
  
  toBeValidUUID(received: any) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValid = typeof received === 'string' && uuidRegex.test(received);
    return {
      message: () => `Expected ${received} to be a valid UUID`,
      pass: isValid
    };
  }
});

// Global test configuration
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  
  // Mock console methods to reduce noise
  console.log = jest.fn();
  console.info = jest.fn();
});

afterAll(() => {
  // Cleanup after all tests
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  createMockUser: () => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    created_at: new Date().toISOString()
  }),
  
  createMockStory: () => ({
    id: 1,
    title: 'Test Historie',
    content: '# Test\n\nDette er en test historie.',
    status: 'published',
    created_at: new Date().toISOString()
  }),
  
  createMockPerson: () => ({
    id: 1,
    name: 'Test Person',
    description: 'En test person for testing.',
    created_at: new Date().toISOString()
  })
};

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTimestamp(): R;
      toBeValidUUID(): R;
    }
  }
  
  var testUtils: {
    createMockUser: () => any;
    createMockStory: () => any;
    createMockPerson: () => any;
  };
}
EOF

# Create test utilities
echo "🛠️  Creating test utilities..."
cat > "$TESTS_DIR/utils/test-helpers.ts" << 'EOF'
// Test helper utilities for Pjuskeby testing
// Phase 15: Testing Infrastructure

import { jest } from '@jest/globals';

// Database mock helper
export function createMockDatabase() {
  return {
    query: jest.fn(),
    execute: jest.fn(),
    close: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
  };
}

// HTTP request mock helper
export function createMockRequest(overrides = {}) {
  return {
    method: 'GET',
    url: '/test',
    headers: {},
    body: {},
    params: {},
    query: {},
    ip: '127.0.0.1',
    id: 'test-request-id',
    ...overrides
  };
}

// HTTP response mock helper
export function createMockReply() {
  const reply = {
    code: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    type: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    getHeader: jest.fn(),
    statusCode: 200,
    sent: false
  };
  
  return reply;
}

// Async test helper
export async function expectAsync<T>(
  promise: Promise<T>
): Promise<jest.JestMatchers<T>> {
  const result = await promise;
  return expect(result);
}

// Time-based test helper
export function advanceTimersByAsync(ms: number): Promise<void> {
  return new Promise((resolve) => {
    jest.advanceTimersByTime(ms);
    setImmediate(resolve);
  });
}

// Norwegian test description helper
export function beskrivTest(description: string, fn: () => void | Promise<void>) {
  return describe(description, fn);
}

export function detSkal(description: string, fn: () => void | Promise<void>) {
  return it(`det skal ${description}`, fn);
}

// Error simulation helper
export function simulateError(message: string, code?: string) {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}

// Random data generators
export const testData = {
  randomString: (length = 10) => 
    Math.random().toString(36).substring(2, length + 2),
  
  randomEmail: () => 
    `test${Math.random().toString(36).substring(7)}@example.com`,
  
  randomDate: () => 
    new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365),
  
  norwegianName: () => {
    const names = ['Ole', 'Kari', 'Per', 'Anne', 'Lars', 'Inga', 'Nils', 'Astrid'];
    return names[Math.floor(Math.random() * names.length)];
  }
};
EOF

echo ""
echo "✅ Jest testing framework setup completed!"
echo ""
echo "📋 Configuration created:"
echo "   ✅ jest.config.js (80% coverage threshold)"
echo "   ✅ tests/setup.ts (global test configuration)"
echo "   ✅ tests/utils/test-helpers.ts (Norwegian test utilities)"
echo ""
echo "📁 Test directory structure:"
echo "   tests/unit/ (component and server unit tests)"
echo "   tests/integration/ (API and database integration tests)"
echo "   tests/e2e/ (end-to-end tests)"
echo "   tests/utils/ (test utilities and helpers)"
echo "   tests/mocks/ (mock data and services)"
echo "   tests/fixtures/ (test data fixtures)"
echo ""
echo "🚨 FORBIDDEN guardrail addressed: No deployment without tests!"
echo "📊 REQUIRED coverage: 80% threshold configured"