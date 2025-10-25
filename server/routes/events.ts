import type { FastifyInstance } from 'fastify';
import { getDbOptional } from '../db/index.js';
import { events } from '../db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export default async function eventsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const db = await getDbOptional();
    if (db) {
      const rows = await (db as any).select({ id: events.id, title: events.title, slug: events.slug, category: events.category }).from(events).orderBy(asc(events.title)).limit(200);
      return { items: rows };
    }
    return { items: [] };
  });

  fastify.get('/:id', async (req, reply) => {
    const parsed = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!parsed.success) { reply.code(400); return { error: 'Invalid id' }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    const [row] = await (db as any).select().from(events).where(eq(events.id, parsed.data.id)).limit(1);
    if (!row) { reply.code(404); return { error: 'Not found' }; }
    return row;
  });

  fastify.post('/', async (req, reply) => {
    const schema = z.object({ title: z.string().min(1), slug: z.string().min(1), category: z.string().min(1).optional(), description: z.string().optional(), placeId: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) { reply.code(422); return { error: 'Validation failed', details: parsed.error.flatten() }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    const id = randomUUID();
    const row = { id, ...parsed.data };
    await (db as any).insert(events).values(row);
    reply.code(201);
    return row;
  });

  fastify.patch('/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    const body = z.object({ title: z.string().min(1).optional(), slug: z.string().min(1).optional(), category: z.string().optional(), description: z.string().optional() })
      .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' }).safeParse(req.body);
    if (!params.success) { reply.code(400); return { error: 'Invalid id' }; }
    if (!body.success) { reply.code(422); return { error: 'Validation failed', details: body.error.flatten() }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    await (db as any).update(events).set(body.data).where(eq(events.id, params.data.id));
    const [row] = await (db as any).select().from(events).where(eq(events.id, params.data.id));
    if (!row) { reply.code(404); return { error: 'Not found' }; }
    return row;
  });

  fastify.delete('/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!params.success) { reply.code(400); return { error: 'Invalid id' }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    await (db as any).delete(events).where(eq(events.id, params.data.id));
    reply.code(204);
    return null as any;
  });
}
