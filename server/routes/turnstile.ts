import type { FastifyInstance } from 'fastify';
import { verifyTurnstile } from '../utils/turnstile.js';

/**
 * Turnstile verification endpoint
 * Phase 5: Security enhancement
 */
export default async function turnstileRoutes(fastify: FastifyInstance) {
  // POST /api/turnstile/verify
  fastify.post('/verify', async (req, reply) => {
    const body = req.body as any;
    const token = body?.token || body?.['cf-turnstile-response'];
    
    if (!token) {
      reply.code(422);
      return {
        error: 'Validation failed',
        message: 'Token is required'
      };
    }
    
    try {
      const result = await verifyTurnstile(token, req.ip);
      
      if (!result.success) {
        reply.code(422);
        return {
          success: false,
          error: 'Verification failed',
          codes: result['error-codes']
        };
      }
      
      return {
        success: true,
        challenge_ts: result.challenge_ts,
        hostname: result.hostname
      };
    } catch (error) {
      reply.code(500);
      return {
        success: false,
        error: 'Verification error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });
}
