import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getDbOptional } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { createSession, getSession, revokeSession, requireBearer } from '../utils/sessions.js';
import { rateLimit, RateLimitPresets } from '../utils/rate-limiter.js';

// Phase 5: bcrypt password hashing + rate limiting implemented

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/login (with strict rate limiting)
  fastify.post('/login', { preHandler: rateLimit(RateLimitPresets.strict) }, async (req, reply) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { reply.code(422); return { error: 'Validation failed', details: parsed.error.flatten() }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    const { email, password } = parsed.data;
    const rows = await (db as any).select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];
    if (!user) { reply.code(401); return { error: 'Invalid credentials' }; }
    // Phase 5: bcrypt password verification
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) { reply.code(401); return { error: 'Invalid credentials' }; }
    const sess = createSession(user.id, user.role || 'user');
    return { token: sess.id, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } };
  });

  // POST /api/auth/logout
  fastify.post('/logout', async (req, reply) => {
    const token = requireBearer(req.headers.authorization);
    if (!token) { reply.code(401); return { error: 'Unauthorized' }; }
    revokeSession(token);
    return { ok: true };
  });

  // GET /api/auth/me
  fastify.get('/me', async (req, reply) => {
    const token = requireBearer(req.headers.authorization);
    if (!token) { reply.code(401); return { error: 'Unauthorized' }; }
    const sess = getSession(token);
    if (!sess) { reply.code(401); return { error: 'Unauthorized' }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    const rows = await (db as any).select().from(users).where(eq(users.id, sess.userId)).limit(1);
    const user = rows[0];
    if (!user) { reply.code(404); return { error: 'Not found' }; }
    return { id: user.id, email: user.email, role: user.role, displayName: user.displayName };
  });
}
