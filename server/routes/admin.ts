import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getDbOptional } from '../db/index.js';
// Table names used directly in SQL during wipe-all for clarity and safety
import { getSession, requireBearer } from '../utils/sessions.js';

export default async function adminRoutes(fastify: FastifyInstance) {
  // POST /api/admin/wipe-all
  fastify.post('/wipe-all', async (req, reply) => {
    const bodySchema = z.object({ confirm: z.literal('WIPE-ALL'), confirmAgain: z.literal('YES-I-AM-SURE') });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) { reply.code(422); return { error: 'Double confirmation required' }; }

    const token = requireBearer(req.headers.authorization);
    if (!token) { reply.code(401); return { error: 'Unauthorized' }; }
    const sess = getSession(token);
    if (!sess || sess.role !== 'admin') { reply.code(403); return { error: 'Forbidden' }; }

    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }

    // We only wipe dynamic content, not reference tables like streets/places unless Phase 4 requires it. Keeping conservative.
    // Use transactions best-effort; drizzle with mysql2 doesn't expose .transaction on typed DB easily; executing sequentially.
  await (db as any).execute('DELETE FROM moderation_log');
  await (db as any).execute('DELETE FROM comments');
  await (db as any).execute('DELETE FROM entity_mentions');
  await (db as any).execute('DELETE FROM donations');
  await (db as any).execute('DELETE FROM supporters');
  await (db as any).execute('DELETE FROM user_prefs');
  await (db as any).execute('DELETE FROM stories');

    return { ok: true };
  });
}
