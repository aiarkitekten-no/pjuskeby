/**
 * Phase 7: Workflow API routes
 * Endpoints for managing story approval workflow
 */

import type { FastifyPluginAsync } from 'fastify';
import {
  transitionStoryStatus,
  transitionToPublished,
  canPublishStory,
  getWorkflowHistory,
  isTransitionAllowed,
} from '../utils/workflow';
import workflow from '../utils/workflow';

const workflowRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/workflow/:storyId/transition
   * Transition a story to a new status
   */
  server.post<{
    Params: { storyId: string };
    Body: {
      newStatus: string;
      userId: string;
      reason?: string;
    };
  }>('/api/workflow/:storyId/transition', async (request, reply) => {
    const { storyId } = request.params;
    const { newStatus, userId, reason } = request.body;

    if (!newStatus || !userId) {
      return reply.code(400).send({
        error: 'Missing required fields: newStatus, userId',
      });
    }

    const result = await transitionStoryStatus({
      storyId,
      newStatus: newStatus as any,
      userId,
      reason,
    });

    if (!result.success) {
      return reply.code(400).send({
        error: result.message,
        previousStatus: result.previousStatus,
      });
    }

    return reply.code(200).send(result);
  });

  /**
   * POST /api/workflow/:storyId/publish
   * Publish a story (with rate limit check)
   */
  server.post<{
    Params: { storyId: string };
    Body: {
      userId: string;
      reason?: string;
    };
  }>('/api/workflow/:storyId/publish', async (request, reply) => {
    const { storyId } = request.params;
    const { userId, reason } = request.body;

    if (!userId) {
      return reply.code(400).send({
        error: 'Missing required field: userId',
      });
    }

    const result = await transitionToPublished(storyId, userId, reason);

    if (!result.success) {
      return reply.code(400).send({
        error: result.message,
        previousStatus: result.previousStatus,
      });
    }

    return reply.code(200).send(result);
  });

  /**
   * GET /api/workflow/:storyId/history
   * Get workflow transition history for a story
   */
  server.get<{
    Params: { storyId: string };
  }>('/api/workflow/:storyId/history', async (request, reply) => {
    const { storyId } = request.params;

    const history = await getWorkflowHistory(storyId);

    return reply.code(200).send({
      storyId,
      history,
    });
  });

  /**
   * GET /api/workflow/publish-check
   * Check if publishing is currently allowed (rate limit)
   */
  server.get('/api/workflow/publish-check', async (request, reply) => {
    const check = await canPublishStory();

    return reply.code(200).send(check);
  });

  /**
   * GET /api/workflow/transitions
   * Get allowed workflow transitions
   */
  server.get('/api/workflow/transitions', async (request, reply) => {
    return reply.code(200).send({
      allowed: workflow.ALLOWED_TRANSITIONS,
      description: 'Allowed state transitions for story workflow',
    });
  });

  /**
   * POST /api/workflow/validate-transition
   * Validate if a transition is allowed
   */
  server.post<{
    Body: {
      fromStatus: string;
      toStatus: string;
    };
  }>('/api/workflow/validate-transition', async (request, reply) => {
    const { fromStatus, toStatus } = request.body;

    if (!fromStatus || !toStatus) {
      return reply.code(400).send({
        error: 'Missing required fields: fromStatus, toStatus',
      });
    }

    const allowed = isTransitionAllowed(fromStatus as any, toStatus as any);

    return reply.code(200).send({
      fromStatus,
      toStatus,
      allowed,
      message: allowed
        ? `Transition from ${fromStatus} to ${toStatus} is allowed`
        : `Transition from ${fromStatus} to ${toStatus} is NOT allowed`,
    });
  });
};

export default workflowRoutes;
