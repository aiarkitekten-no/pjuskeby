import type { FastifyInstance } from 'fastify';
import { readLayer } from '../utils/fallback.js';

export default async function mapRoutes(fastify: FastifyInstance) {
  fastify.get('/layers/:layer', async (req, reply) => {
    // @ts-ignore
    const { layer } = req.params as { layer: string };
    const data = await readLayer(layer);
    if ((data as any)?.error) { reply.code(404); return data; }
    return data;
  });
}
