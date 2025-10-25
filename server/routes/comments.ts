import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDbOptional } from '../db/index.js';
import { comments, moderationLog } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { getSession, requireBearer } from '../utils/sessions.js';

export default async function commentsRoutes(fastify: FastifyInstance) {
  // PATCH /api/comments/:id/moderate
  fastify.patch('/:id/moderate', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    const bodySchema = z.object({ status: z.enum(['approved', 'rejected', 'pending']), reason: z.string().optional() });
    const parsedBody = bodySchema.safeParse(req.body);
    if (!params.success) { reply.code(400); return { error: 'Invalid id' }; }
    if (!parsedBody.success) { reply.code(422); return { error: 'Validation failed', details: parsedBody.error.flatten() }; }

    const token = requireBearer(req.headers.authorization);
    if (!token) { reply.code(401); return { error: 'Unauthorized' }; }
    const sess = getSession(token);
    if (!sess || (sess.role !== 'admin' && sess.role !== 'moderator')) { reply.code(403); return { error: 'Forbidden' }; }

    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }

    const [existing] = await (db as any).select().from(comments).where(eq(comments.id, params.data.id)).limit(1);
    if (!existing) { reply.code(404); return { error: 'Not found' }; }

    await (db as any).update(comments).set({ status: parsedBody.data.status, moderatedAt: new Date(), moderatedBy: sess.userId }).where(eq(comments.id, params.data.id));
    const logRow = {
      id: randomUUID(),
      commentId: params.data.id,
      action: `set:${parsedBody.data.status}`,
      reason: parsedBody.data.reason ?? null,
      moderator: sess.userId,
    } as any;
    await (db as any).insert(moderationLog).values(logRow);

    const [updated] = await (db as any).select().from(comments).where(eq(comments.id, params.data.id)).limit(1);
    return updated;
  });
}
