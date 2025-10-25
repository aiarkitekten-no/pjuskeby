/**
 * Phase 8: Cache API Routes
 * Health checks and statistics for Redis caching
 */

import type { FastifyPluginAsync } from 'fastify';
import { checkRedisHealth, getRedisStats } from '../utils/redis';
import { getCacheStats, resetCacheStats } from '../utils/cache';
import { getPoolStats } from '../db/index';
import { getRedisClient } from '../utils/redis';

const cacheRoutes: FastifyPluginAsync = async (server) => {
  /**
   * GET /api/cache/health
   * Check Redis health status
   */
  server.get('/api/cache/health', async (request, reply) => {
    const health = await checkRedisHealth();
    
    if (!health.connected) {
      return reply.code(503).send({
        status: 'unhealthy',
        ...health,
      });
    }

    return reply.code(200).send({
      status: 'healthy',
      ...health,
    });
  });

  /**
   * GET /api/cache/stats
   * Get cache statistics
   */
  server.get('/api/cache/stats', async (request, reply) => {
    const redisStats = await getRedisStats();
    const cacheStats = getCacheStats();
    const poolStats = await getPoolStats();

    return reply.code(200).send({
      redis: redisStats,
      cache: cacheStats,
      database: poolStats,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * POST /api/cache/stats/reset
   * Reset cache statistics
   */
  server.post('/api/cache/stats/reset', async (request, reply) => {
    resetCacheStats();

    return reply.code(200).send({
      message: 'Cache statistics reset',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /api/cache/keys
   * List all cache keys (for debugging)
   */
  server.get('/api/cache/keys', async (request, reply) => {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys('*');

      return reply.code(200).send({
        total: keys.length,
        keys: keys.sort(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: 'Failed to retrieve cache keys',
        message: error.message,
      });
    }
  });

  /**
   * DELETE /api/cache/flush
   * Flush all cache keys (use with caution)
   */
  server.delete('/api/cache/flush', async (request, reply) => {
    try {
      const redis = getRedisClient();
      await redis.flushdb();

      return reply.code(200).send({
        message: 'All cache keys flushed',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return reply.code(500).send({
        error: 'Failed to flush cache',
        message: error.message,
      });
    }
  });
};

export default cacheRoutes;
