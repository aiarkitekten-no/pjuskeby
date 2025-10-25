import type { FastifyInstance } from 'fastify';
import { getDbOptional } from '../db/index.js';
import { streets } from '../db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { readStreets } from '../utils/fallback.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export default async function streetsRoutes(fastify: FastifyInstance) {
  // List streets (raw SQL for now)
  fastify.get('/list', async () => {
    const db = await getDbOptional();
    if (db) {
      const rows = await (db as any).select({ id: streets.id, name: streets.name, slug: streets.slug }).from(streets).orderBy(asc(streets.name)).limit(200);
      return { items: rows };
    }
    const items = await readStreets();
    return { items };
  });

  // Index (alias to list)
  fastify.get('/', async (_req, _reply) => {
    const db = await getDbOptional();
    if (db) {
      const rows = await (db as any).select({ id: streets.id, name: streets.name, slug: streets.slug }).from(streets).orderBy(asc(streets.name)).limit(100);
      return { items: rows };
    }
    const items = await readStreets();
    return { items };
  });

  // Get by id
  fastify.get('/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!params.success) {
      reply.code(400);
      return { error: 'Invalid id' };
    }
    const db = await getDbOptional();
    if (!db) {
      reply.code(503);
      return { error: 'Database unavailable' };
    }
    const [row] = await (db as any).select().from(streets).where(eq(streets.id, params.data.id)).limit(1);
    if (!row) {
      reply.code(404);
      return { error: 'Not found' };
    }
    return row;
  });

  // Create
  fastify.post('/', async (req, reply) => {
    const bodySchema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      postalCode: z.string().length(4).optional(),
      district: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      reply.code(422);
      return { error: 'Validation failed', details: parsed.error.flatten() };
    }
    const db = await getDbOptional();
    if (!db) {
      reply.code(503);
      return { error: 'Database unavailable' };
    }
    const id = randomUUID();
    const row = { id, ...parsed.data };
    await (db as any).insert(streets).values(row);
    reply.code(201);
    return row;
  });

  // Update
  fastify.patch('/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      postalCode: z.string().length(4).optional(),
      district: z.string().optional(),
    }).refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });
    const parsedBody = bodySchema.safeParse(req.body);
    if (!params.success) { reply.code(400); return { error: 'Invalid id' }; }
    if (!parsedBody.success) { reply.code(422); return { error: 'Validation failed', details: parsedBody.error.flatten() }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
  await (db as any).update(streets).set(parsedBody.data).where(eq(streets.id, params.data.id));
    // Drizzle update returns OkPacket in mysql2; we can re-fetch
    const [row] = await (db as any).select().from(streets).where(eq(streets.id, params.data.id)).limit(1);
    if (!row) { reply.code(404); return { error: 'Not found' }; }
    return row;
  });

  // Delete
  fastify.delete('/:id', async (req, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!params.success) { reply.code(400); return { error: 'Invalid id' }; }
    const db = await getDbOptional();
    if (!db) { reply.code(503); return { error: 'Database unavailable' }; }
    await (db as any).delete(streets).where(eq(streets.id, params.data.id));
    reply.code(204);
    return null as any;
  });
}
