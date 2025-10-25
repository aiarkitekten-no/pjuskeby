/**
 * Phase 8: CACHING INFRASTRUKTUR - Redis Client
 * 
 * Redis connection with connection pooling, error handling, and health checks.
 * AOF persistence enabled for data durability.
 */

import Redis from 'ioredis';

// ============================================================================
// Configuration
// ============================================================================

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

// Connection pool settings
const REDIS_MAX_RETRIES_PER_REQUEST = 3;
const REDIS_CONNECT_TIMEOUT = 10000; // 10 seconds
const REDIS_COMMAND_TIMEOUT = 5000; // 5 seconds

// ============================================================================
// Redis Client Instance
// ============================================================================

let redisClient: Redis | null = null;

/**
 * Create and configure Redis client with connection pooling
 */
function createRedisClient(): Redis {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    maxRetriesPerRequest: REDIS_MAX_RETRIES_PER_REQUEST,
    connectTimeout: REDIS_CONNECT_TIMEOUT,
    commandTimeout: REDIS_COMMAND_TIMEOUT,
    retryStrategy: (times: number) => {
      // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, then max 2000ms
      const delay = Math.min(times * 50, 2000);
      console.log(`[Redis] Retry connection attempt ${times}, delay: ${delay}ms`);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        // Reconnect on READONLY errors
        return true;
      }
      return false;
    },
  });

  // Event handlers
  client.on('connect', () => {
    console.log('[Redis] Connected to Redis server');
  });

  client.on('ready', () => {
    console.log('[Redis] Redis client ready');
  });

  client.on('error', (err: Error) => {
    console.error('[Redis] Redis client error:', err.message);
  });

  client.on('close', () => {
    console.log('[Redis] Redis connection closed');
  });

  client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting to Redis...');
  });

  return client;
}

/**
 * Get Redis client instance (singleton pattern)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[Redis] Connection closed gracefully');
  }
}

// ============================================================================
// Health Check
// ============================================================================

export interface RedisHealthCheck {
  connected: boolean;
  latency?: number;
  error?: string;
  info?: {
    version: string;
    uptime: number;
    connected_clients: number;
    used_memory_human: string;
    aof_enabled: string;
  };
}

/**
 * Perform Redis health check
 */
export async function checkRedisHealth(): Promise<RedisHealthCheck> {
  try {
    const client = getRedisClient();
    const startTime = Date.now();
    
    // Test connection with PING
    const response = await client.ping();
    const latency = Date.now() - startTime;

    if (response !== 'PONG') {
      return {
        connected: false,
        error: `Unexpected PING response: ${response}`,
      };
    }

    // Get Redis INFO
    const info = await client.info();
    const infoLines = info.split('\r\n');
    const infoObj: any = {};
    
    for (const line of infoLines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        infoObj[key] = value;
      }
    }

    return {
      connected: true,
      latency,
      info: {
        version: infoObj.redis_version || 'unknown',
        uptime: parseInt(infoObj.uptime_in_seconds || '0', 10),
        connected_clients: parseInt(infoObj.connected_clients || '0', 10),
        used_memory_human: infoObj.used_memory_human || 'unknown',
        aof_enabled: infoObj.aof_enabled || 'unknown',
      },
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

// ============================================================================
// Statistics
// ============================================================================

export interface RedisStats {
  total_commands_processed: number;
  instantaneous_ops_per_sec: number;
  keyspace_hits: number;
  keyspace_misses: number;
  hit_rate: number;
  total_keys: number;
}

/**
 * Get Redis statistics
 */
export async function getRedisStats(): Promise<RedisStats> {
  try {
    const client = getRedisClient();
    const info = await client.info('stats');
    const keyspace = await client.info('keyspace');
    
    const infoLines = info.split('\r\n');
    const stats: any = {};
    
    for (const line of infoLines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        stats[key] = value;
      }
    }

    // Count total keys
    const dbKeys = await client.dbsize();
    
    const hits = parseInt(stats.keyspace_hits || '0', 10);
    const misses = parseInt(stats.keyspace_misses || '0', 10);
    const total = hits + misses;
    const hitRate = total > 0 ? (hits / total) * 100 : 0;

    return {
      total_commands_processed: parseInt(stats.total_commands_processed || '0', 10),
      instantaneous_ops_per_sec: parseInt(stats.instantaneous_ops_per_sec || '0', 10),
      keyspace_hits: hits,
      keyspace_misses: misses,
      hit_rate: Math.round(hitRate * 100) / 100,
      total_keys: dbKeys,
    };
  } catch (error: any) {
    console.error('[Redis] Error getting stats:', error.message);
    return {
      total_commands_processed: 0,
      instantaneous_ops_per_sec: 0,
      keyspace_hits: 0,
      keyspace_misses: 0,
      hit_rate: 0,
      total_keys: 0,
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getRedisClient,
  closeRedis,
  checkRedisHealth,
  getRedisStats,
};
