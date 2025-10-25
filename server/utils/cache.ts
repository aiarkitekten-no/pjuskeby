/**
 * Phase 8: CACHING INFRASTRUKTUR - Cache Utility
 * 
 * High-level cache operations with mandatory TTL on all keys.
 * Implements all cache_keys patterns from koblinger.json.
 */

import { getRedisClient } from './redis';

// ============================================================================
// Types
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (mandatory for set operations)
  tags?: string[]; // Tags for grouped invalidation
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

// ============================================================================
// Configuration
// ============================================================================

// Default TTL values (in seconds)
export const DEFAULT_TTL = {
  INDEX: 300, // 5 minutes for index listings
  DETAIL: 600, // 10 minutes for detail pages
  GEO: 3600, // 1 hour for geo data
  STATS: 60, // 1 minute for statistics
  SESSION: 86400, // 24 hours for sessions
};

// Cache key prefixes (from koblinger.json)
export const CACHE_KEYS = {
  GEO: 'geo:',
  PEOPLE_INDEX: 'people:index',
  PEOPLE_DETAIL: 'people:detail:',
  PLACES_INDEX: 'places:index',
  PLACES_DETAIL: 'places:detail:',
  STREETS_INDEX: 'streets:index',
  STREETS_DETAIL: 'streets:detail:',
  BUSINESSES_INDEX: 'businesses:index',
  BUSINESSES_DETAIL: 'businesses:detail:',
  ORGANIZATIONS_INDEX: 'organizations:index',
  ORGANIZATIONS_DETAIL: 'organizations:detail:',
  EVENTS_INDEX: 'events:index',
  EVENTS_DETAIL: 'events:detail:',
  LAKES_INDEX: 'lakes:index',
  LAKES_DETAIL: 'lakes:detail:',
  STORIES_INDEX: 'stories:index',
  STORIES_DETAIL: 'stories:detail:',
  COMMENTS: 'comments:post:',
};

// Statistics tracking
let cacheStats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  hitRate: 0,
};

// ============================================================================
// Core Cache Operations
// ============================================================================

/**
 * Get value from cache
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const value = await redis.get(key);

    if (value === null) {
      cacheStats.misses++;
      return null;
    }

    cacheStats.hits++;
    updateHitRate();

    try {
      return JSON.parse(value) as T;
    } catch {
      // If not JSON, return as string
      return value as unknown as T;
    }
  } catch (error: any) {
    console.error(`[Cache] Error getting key ${key}:`, error.message);
    return null;
  }
}

/**
 * Set value in cache with mandatory TTL
 */
export async function cacheSet<T = any>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const ttl = options.ttl || DEFAULT_TTL.INDEX;

    // GUARDRAIL: TTL is mandatory
    if (!ttl || ttl <= 0) {
      console.error(`[Cache] TTL is mandatory and must be > 0 for key: ${key}`);
      return false;
    }

    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Set with TTL (EX = seconds)
    await redis.set(key, serialized, 'EX', ttl);

    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, ttl); // Tags expire with same TTL
      }
    }

    cacheStats.sets++;
    return true;
  } catch (error: any) {
    console.error(`[Cache] Error setting key ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete key from cache
 */
export async function cacheDelete(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const result = await redis.del(key);
    
    if (result > 0) {
      cacheStats.deletes++;
      return true;
    }
    return false;
  } catch (error: any) {
    console.error(`[Cache] Error deleting key ${key}:`, error.message);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }

    const result = await redis.del(...keys);
    cacheStats.deletes += result;
    return result;
  } catch (error: any) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error.message);
    return 0;
  }
}

/**
 * Invalidate cache by tags
 */
export async function cacheInvalidateByTag(tag: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = await redis.smembers(`tag:${tag}`);
    
    if (keys.length === 0) {
      return 0;
    }

    // Delete all keys with this tag
    const result = await redis.del(...keys);
    
    // Delete the tag set itself
    await redis.del(`tag:${tag}`);
    
    cacheStats.deletes += result;
    return result;
  } catch (error: any) {
    console.error(`[Cache] Error invalidating tag ${tag}:`, error.message);
    return 0;
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const result = await redis.exists(key);
    return result === 1;
  } catch (error: any) {
    console.error(`[Cache] Error checking existence of key ${key}:`, error.message);
    return false;
  }
}

/**
 * Get TTL for a key
 */
export async function cacheGetTTL(key: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const ttl = await redis.ttl(key);
    return ttl;
  } catch (error: any) {
    console.error(`[Cache] Error getting TTL for key ${key}:`, error.message);
    return -1;
  }
}

// ============================================================================
// Specific Cache Operations (koblinger.json patterns)
// ============================================================================

/**
 * Cache people index
 */
export async function cachePeopleIndex(data: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.PEOPLE_INDEX, data, {
    ttl: DEFAULT_TTL.INDEX,
    tags: ['people'],
  });
}

/**
 * Get people index from cache
 */
export async function getCachedPeopleIndex(): Promise<any[] | null> {
  return cacheGet<any[]>(CACHE_KEYS.PEOPLE_INDEX);
}

/**
 * Cache person detail
 */
export async function cachePerson(id: string, data: any): Promise<boolean> {
  return cacheSet(`${CACHE_KEYS.PEOPLE_DETAIL}${id}`, data, {
    ttl: DEFAULT_TTL.DETAIL,
    tags: ['people', `person:${id}`],
  });
}

/**
 * Get person detail from cache
 */
export async function getCachedPerson(id: string): Promise<any | null> {
  return cacheGet(`${CACHE_KEYS.PEOPLE_DETAIL}${id}`);
}

/**
 * Invalidate all people cache
 */
export async function invalidatePeopleCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.PEOPLE_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.PEOPLE_DETAIL}*`);
  count += await cacheInvalidateByTag('people');
  return count;
}

/**
 * Cache places index
 */
export async function cachePlacesIndex(data: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.PLACES_INDEX, data, {
    ttl: DEFAULT_TTL.INDEX,
    tags: ['places'],
  });
}

/**
 * Get places index from cache
 */
export async function getCachedPlacesIndex(): Promise<any[] | null> {
  return cacheGet<any[]>(CACHE_KEYS.PLACES_INDEX);
}

/**
 * Cache place detail
 */
export async function cachePlace(id: string, data: any): Promise<boolean> {
  return cacheSet(`${CACHE_KEYS.PLACES_DETAIL}${id}`, data, {
    ttl: DEFAULT_TTL.DETAIL,
    tags: ['places', `place:${id}`],
  });
}

/**
 * Get place detail from cache
 */
export async function getCachedPlace(id: string): Promise<any | null> {
  return cacheGet(`${CACHE_KEYS.PLACES_DETAIL}${id}`);
}

/**
 * Invalidate all places cache
 */
export async function invalidatePlacesCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.PLACES_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.PLACES_DETAIL}*`);
  count += await cacheInvalidateByTag('places');
  return count;
}

/**
 * Cache streets index
 */
export async function cacheStreetsIndex(data: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.STREETS_INDEX, data, {
    ttl: DEFAULT_TTL.INDEX,
    tags: ['streets'],
  });
}

/**
 * Get streets index from cache
 */
export async function getCachedStreetsIndex(): Promise<any[] | null> {
  return cacheGet<any[]>(CACHE_KEYS.STREETS_INDEX);
}

/**
 * Invalidate all streets cache
 */
export async function invalidateStreetsCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.STREETS_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.STREETS_DETAIL}*`);
  count += await cacheInvalidateByTag('streets');
  return count;
}

/**
 * Cache businesses index
 */
export async function cacheBusinessesIndex(data: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.BUSINESSES_INDEX, data, {
    ttl: DEFAULT_TTL.INDEX,
    tags: ['businesses'],
  });
}

/**
 * Get businesses index from cache
 */
export async function getCachedBusinessesIndex(): Promise<any[] | null> {
  return cacheGet<any[]>(CACHE_KEYS.BUSINESSES_INDEX);
}

/**
 * Invalidate all businesses cache
 */
export async function invalidateBusinessesCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.BUSINESSES_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.BUSINESSES_DETAIL}*`);
  count += await cacheInvalidateByTag('businesses');
  return count;
}

/**
 * Cache geo data
 */
export async function cacheGeoData(key: string, data: any): Promise<boolean> {
  return cacheSet(`${CACHE_KEYS.GEO}${key}`, data, {
    ttl: DEFAULT_TTL.GEO,
    tags: ['geo'],
  });
}

/**
 * Get geo data from cache
 */
export async function getCachedGeoData(key: string): Promise<any | null> {
  return cacheGet(`${CACHE_KEYS.GEO}${key}`);
}

/**
 * Invalidate all geo cache
 */
export async function invalidateGeoCache(): Promise<number> {
  return cacheDeletePattern(`${CACHE_KEYS.GEO}*`);
}

/**
 * Invalidate lakes cache
 */
export async function invalidateLakesCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.LAKES_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.LAKES_DETAIL}*`);
  return count;
}

/**
 * Invalidate organizations cache
 */
export async function invalidateOrganizationsCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.ORGANIZATIONS_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.ORGANIZATIONS_DETAIL}*`);
  return count;
}

/**
 * Invalidate events cache
 */
export async function invalidateEventsCache(): Promise<number> {
  let count = 0;
  count += (await cacheDelete(CACHE_KEYS.EVENTS_INDEX)) ? 1 : 0;
  count += await cacheDeletePattern(`${CACHE_KEYS.EVENTS_DETAIL}*`);
  return count;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Update hit rate calculation
 */
function updateHitRate(): void {
  const total = cacheStats.hits + cacheStats.misses;
  if (total > 0) {
    cacheStats.hitRate = Math.round((cacheStats.hits / total) * 10000) / 100;
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  return { ...cacheStats };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Core operations
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  cacheInvalidateByTag,
  cacheExists,
  cacheGetTTL,
  
  // Specific operations
  cachePeopleIndex,
  getCachedPeopleIndex,
  cachePerson,
  getCachedPerson,
  invalidatePeopleCache,
  
  cachePlacesIndex,
  getCachedPlacesIndex,
  cachePlace,
  getCachedPlace,
  invalidatePlacesCache,
  
  cacheStreetsIndex,
  getCachedStreetsIndex,
  invalidateStreetsCache,
  
  cacheBusinessesIndex,
  getCachedBusinessesIndex,
  invalidateBusinessesCache,
  
  cacheGeoData,
  getCachedGeoData,
  invalidateGeoCache,
  
  // Statistics
  getCacheStats,
  resetCacheStats,
  
  // Constants
  DEFAULT_TTL,
  CACHE_KEYS,
};
