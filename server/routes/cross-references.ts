/**
 * GUARDRAILS CHECKPOINT v3.0 - UBRYTELIG
 * Cross-Reference API Endpoints
 * Handles entity mentions and backlinks between stories and entities
 */

import { FastifyInstance } from 'fastify';
import { crossReferenceManager } from '../utils/cross-reference-manager.js';

export async function crossReferenceRoutes(fastify: FastifyInstance) {
  // Get backlinks for a specific entity
  fastify.get('/api/entities/:type/:id/backlinks', async (request, reply) => {
    const { type, id } = request.params as { type: string; id: string };
    const limit = parseInt((request.query as any)?.limit || '10');

    try {
      const backlinks = await crossReferenceManager.getEntityBacklinks(type, id, limit);
      
      return {
        success: true,
        entity: { type, id },
        backlinks,
        count: backlinks.length
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch entity backlinks',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get the latest mention for an entity
  fastify.get('/api/entities/:type/:id/latest-mention', async (request, reply) => {
    const { type, id } = request.params as { type: string; id: string };

    try {
      const latestMention = await crossReferenceManager.getLatestEntityMention(type, id);
      
      return {
        success: true,
        entity: { type, id },
        latestMention
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch latest mention',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get mention statistics for an entity
  fastify.get('/api/entities/:type/:id/stats', async (request, reply) => {
    const { type, id } = request.params as { type: string; id: string };

    try {
      const stats = await crossReferenceManager.getEntityMentionStats(type, id);
      
      return {
        success: true,
        entity: { type, id },
        stats
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch entity statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get all entities mentioned in a story
  fastify.get('/api/stories/:id/mentions', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const mentions = await crossReferenceManager.getStoryMentions(id);
      
      return {
        success: true,
        storyId: id,
        mentions,
        count: mentions.length
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch story mentions',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Manually reprocess a story's entity mentions
  fastify.post('/api/stories/:id/reprocess-mentions', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { content } = request.body as { content: string };

    if (!content) {
      reply.code(400);
      return {
        success: false,
        error: 'Story content is required'
      };
    }

    try {
      await crossReferenceManager.processStoryMentions(id, content);
      
      return {
        success: true,
        message: `Reprocessed entity mentions for story ${id}`,
        storyId: id
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to reprocess story mentions',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Rebuild all cross-references (admin endpoint)
  fastify.post('/api/admin/rebuild-cross-references', async (request, reply) => {
    try {
      await crossReferenceManager.rebuildAllCrossReferences();
      
      return {
        success: true,
        message: 'Successfully rebuilt all cross-references'
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to rebuild cross-references',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Get entity mention statistics summary
  fastify.get('/api/cross-references/summary', async (request, reply) => {
    try {
      // This would need more complex aggregation queries
      // For now, return basic info
      return {
        success: true,
        summary: {
          message: 'Cross-reference system active',
          endpoints: [
            'GET /api/entities/:type/:id/backlinks',
            'GET /api/entities/:type/:id/latest-mention', 
            'GET /api/entities/:type/:id/stats',
            'GET /api/stories/:id/mentions',
            'POST /api/stories/:id/reprocess-mentions',
            'POST /api/admin/rebuild-cross-references'
          ]
        }
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Failed to fetch summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}