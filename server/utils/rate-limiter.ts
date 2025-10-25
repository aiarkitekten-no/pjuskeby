/**
 * Simple in-memory rate limiter for Fastify v4
 * Phase 5: Security enhancement
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60000);

export interface RateLimitConfig {
  max: number;        // Max requests per window
  windowMs: number;   // Time window in milliseconds
  keyGenerator?: (req: any) => string; // Custom key function
}

/**
 * Rate limit middleware factory
 */
export function rateLimit(config: RateLimitConfig) {
  const { max, windowMs, keyGenerator } = config;

  return async (req: any, reply: any) => {
    // Generate key (default: IP address)
    const key = keyGenerator ? keyGenerator(req) : (req.ip || 'unknown');
    const now = Date.now();
    
    let entry = store.get(key);
    
    // Initialize or reset if window expired
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + windowMs
      };
      store.set(key, entry);
    }
    
    entry.count++;
    
    // Set rate limit headers
    reply.header('X-RateLimit-Limit', max);
    reply.header('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    reply.header('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());
    
    // Check if limit exceeded
    if (entry.count > max) {
      reply.code(429);
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again after ${new Date(entry.resetAt).toISOString()}`,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000)
      };
    }
  };
}

/**
 * Configurable presets for different endpoint types
 */
export const RateLimitPresets = {
  // Strict: 5 requests per minute (auth endpoints)
  strict: {
    max: 5,
    windowMs: 60000
  },
  
  // Standard: 30 requests per minute (general API)
  standard: {
    max: 30,
    windowMs: 60000
  },
  
  // Lenient: 100 requests per minute (read-only endpoints)
  lenient: {
    max: 100,
    windowMs: 60000
  }
};
