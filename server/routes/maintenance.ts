import type { FastifyPluginAsync } from 'fastify';
import { getDb } from '../db/index.js';
import { stories } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { processStoryForEntities } from '../utils/entity-extraction.js';
import { CACHE_KEYS, cacheDelete, cacheDeletePattern } from '../utils/cache.js';

const maintenanceRoutes: FastifyPluginAsync = async (server) => {
  // Rebuild entity mentions for all published stories
  server.post('/rebuild-mentions', async (request, reply) => {
    // Simple header token guard (optional)
    const token = request.headers['x-maintenance-token'];
    const expected = process.env.MAINTENANCE_TOKEN;
    if (expected && token !== expected) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const db = await getDb();
    const published = await db.query.stories.findMany({ where: eq(stories.status, 'published') });

    const results: Array<{ slug: string; processed: boolean; mentions: number }> = [];
    for (const s of published) {
      try {
        const res = await processStoryForEntities(s.slug, s.content);
        results.push({ slug: s.slug, processed: res.success, mentions: res.count });
      } catch (e) {
        results.push({ slug: s.slug, processed: false, mentions: 0 });
      }
    }

    // Invalidate stories caches
    try {
      await cacheDelete(CACHE_KEYS.STORIES_INDEX);
      await cacheDeletePattern(`${CACHE_KEYS.STORIES_DETAIL}*`);
    } catch (cacheErr) {
      console.warn('[maintenance] Cache invalidation failed:', cacheErr);
    }

    return reply.code(200).send({
      total: published.length,
      updated: results.filter(r => r.processed).length,
      results,
      timestamp: new Date().toISOString(),
    });
  });
};

export default maintenanceRoutes;
