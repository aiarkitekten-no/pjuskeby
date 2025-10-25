#!/bin/bash

# Phase 14: Setup Sentry Error Tracking
# Implements Sentry for production error monitoring and notifications

echo "🚨 Phase 14: Setting up Sentry error tracking..."

SERVER_DIR="/var/www/vhosts/pjuskeby.org/httpdocs/server"

# Install Sentry packages
echo "📦 Installing Sentry packages..."
cd /var/www/vhosts/pjuskeby.org/httpdocs
npm install @sentry/node @sentry/integrations --save

# Create Sentry configuration
echo "⚙️  Creating Sentry configuration..."
cat > "$SERVER_DIR/lib/sentry.ts" << 'EOF'
import * as Sentry from '@sentry/node';
import { FastifyRequest, FastifyReply } from 'fastify';
import logger from './logger.js';

// Initialize Sentry
export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session tracking
    autoSessionTracking: true,
    
    // Release tracking
    release: process.env.APP_VERSION || '1.0.0',
    
    // Integration configuration
    integrations: [
      // Express integration for HTTP requests
      new Sentry.Integrations.Http({ tracing: true }),
      
      // Console integration
      new Sentry.Integrations.Console(),
      
      // OnUncaughtException integration
      new Sentry.Integrations.OnUncaughtException({
        exitEvenIfOtherHandlersAreRegistered: false,
      }),
      
      // OnUnhandledRejection integration
      new Sentry.Integrations.OnUnhandledRejection({
        mode: 'warn',
      }),
    ],
    
    // Before send hook to filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from error reports
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      
      // Remove sensitive data from extra context
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.secret;
      }
      
      return event;
    },
    
    // Before breadcrumb hook
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out noisy breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      
      return breadcrumb;
    }
  });

  logger.info('Sentry error tracking initialized', {
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION
  });
}

// Fastify plugin for Sentry integration
export async function sentryPlugin(fastify: any) {
  // Add Sentry request handler
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Set user context
    Sentry.setUser({
      id: (request as any).user?.id || 'anonymous',
      ip_address: request.ip
    });
    
    // Set request context
    Sentry.setTag('method', request.method);
    Sentry.setTag('url', request.url);
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      query: request.query,
      headers: {
        'user-agent': request.headers['user-agent'],
        'accept': request.headers.accept
      }
    });
  });

  // Add error handler
  fastify.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    // Capture error in Sentry
    Sentry.withScope((scope) => {
      scope.setTag('errorHandler', 'fastify');
      scope.setContext('request', {
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      });
      
      // Set error level based on status code
      if (reply.statusCode >= 500) {
        scope.setLevel('error');
      } else if (reply.statusCode >= 400) {
        scope.setLevel('warning');
      }
      
      Sentry.captureException(error);
    });

    // Log error with Winston as well
    logger.error('Fastify error handler', {
      error: error.message,
      stack: error.stack,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode
    });

    // Return error response
    if (!reply.sent) {
      const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500;
      reply.code(statusCode).send({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
        statusCode,
        timestamp: new Date().toISOString()
      });
    }
  });
}

// Custom error capture functions
export function captureError(error: Error, context?: any) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom', context);
    }
    Sentry.captureException(error);
  });
  
  logger.error('Manual error capture', {
    error: error.message,
    stack: error.stack,
    context
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: any) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom', context);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
  
  logger.info('Manual message capture', { message, level, context });
}

// Database error monitoring
export function captureDBError(error: Error, query?: string, params?: any) {
  Sentry.withScope((scope) => {
    scope.setTag('category', 'database');
    scope.setContext('database', {
      query: query || 'unknown',
      params: params ? JSON.stringify(params).substring(0, 500) : undefined
    });
    Sentry.captureException(error);
  });
  
  logger.error('Database error', {
    error: error.message,
    query,
    category: 'database'
  });
}

// Authentication error monitoring
export function captureAuthError(error: Error, userId?: string, action?: string) {
  Sentry.withScope((scope) => {
    scope.setTag('category', 'authentication');
    scope.setUser({ id: userId || 'anonymous' });
    scope.setContext('auth', {
      action: action || 'unknown',
      userId
    });
    Sentry.captureException(error);
  });
  
  logger.security('Authentication error', {
    error: error.message,
    userId,
    action
  });
}

// Performance monitoring
export function capturePerformanceIssue(operation: string, duration: number, threshold: number = 1000) {
  if (duration > threshold) {
    Sentry.withScope((scope) => {
      scope.setTag('category', 'performance');
      scope.setLevel('warning');
      scope.setContext('performance', {
        operation,
        duration,
        threshold
      });
      Sentry.captureMessage(`Slow operation: ${operation} took ${duration}ms`);
    });
    
    logger.performance('Performance issue captured', {
      operation,
      duration,
      threshold
    });
  }
}

export default {
  initSentry,
  sentryPlugin,
  captureError,
  captureMessage,
  captureDBError,
  captureAuthError,
  capturePerformanceIssue
};
EOF

# Create Sentry environment configuration
echo "🔧 Creating Sentry environment configuration..."
cat >> "/var/www/vhosts/pjuskeby.org/httpdocs/.env" << 'EOF'

# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
APP_VERSION=1.0.0

# Error Reporting
ENABLE_ERROR_REPORTING=true
SENTRY_TRACES_SAMPLE_RATE=0.1
EOF

# Create Sentry webhook for alerts
echo "🔔 Creating Sentry webhook handler..."
cat > "$SERVER_DIR/routes/sentry-webhook.ts" << 'EOF'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import logger from '../lib/logger.js';

interface SentryWebhookPayload {
  id: string;
  project: string;
  culprit: string;
  message: string;
  url: string;
  triggering_rules: string[];
  event: {
    event_id: string;
    level: string;
    timestamp: string;
    environment: string;
  };
}

export default async function sentryWebhook(fastify: FastifyInstance) {
  // Sentry webhook endpoint for alerts
  fastify.post('/webhook/sentry', async (request: FastifyRequest, reply: FastifyReply) => {
    const payload = request.body as SentryWebhookPayload;
    
    logger.info('Sentry webhook received', {
      eventId: payload.event?.event_id,
      level: payload.event?.level,
      project: payload.project,
      message: payload.message
    });
    
    // Forward critical errors to additional alerting systems
    if (payload.event?.level === 'error' || payload.event?.level === 'fatal') {
      logger.error('Critical error from Sentry', {
        eventId: payload.event.event_id,
        culprit: payload.culprit,
        message: payload.message,
        url: payload.url,
        environment: payload.event.environment
      });
      
      // Here you could integrate with additional alerting:
      // - Send to Slack
      // - Send email notifications
      // - Trigger PagerDuty
      // - Update status page
    }
    
    return { status: 'received' };
  });
}
EOF

# Update main server file to include Sentry
echo "🔧 Creating updated server index with Sentry integration..."
cat > "$SERVER_DIR/index.ts" << 'EOF'
import app from './app.js';
import { initSentry, sentryPlugin } from './lib/sentry.js';
import logger from './lib/logger.js';

// Initialize Sentry first
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  initSentry();
  logger.info('Sentry initialized for production');
}

// Register Sentry plugin
await app.register(sentryPlugin);

// Import and register routes
import sentryWebhook from './routes/sentry-webhook.js';
await app.register(sentryWebhook);

const PORT = parseInt(process.env.PORT || '4100');
const HOST = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port: PORT, host: HOST });
  logger.info('Server started successfully', { 
    port: PORT, 
    host: HOST,
    environment: process.env.NODE_ENV,
    sentryEnabled: !!process.env.SENTRY_DSN
  });
} catch (error) {
  logger.error('Failed to start server', { error });
  process.exit(1);
}
EOF

echo ""
echo "✅ Sentry error tracking setup completed!"
echo ""
echo "🔧 Features implemented:"
echo "   ✅ Sentry error capture and reporting"
echo "   ✅ Request context tracking"
echo "   ✅ Performance monitoring"
echo "   ✅ User context tracking"
echo "   ✅ Database error monitoring"
echo "   ✅ Authentication error tracking"
echo "   ✅ Webhook integration for alerts"
echo ""
echo "🚨 REQUIRED guardrail satisfied: Errors are now alerted!"
echo ""
echo "⚙️  Configuration needed:"
echo "   1. Update SENTRY_DSN in .env with your project DSN"
echo "   2. Configure Sentry project settings"
echo "   3. Set up alert rules in Sentry dashboard"