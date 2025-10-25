import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import 'dotenv/config';
import streetsRoutes from './routes/streets.js';
import placesRoutes from './routes/places.js';
import peopleRoutes from './routes/people.js';
import businessesRoutes from './routes/businesses.js';
import lakesRoutes from './routes/lakes.js';
import mapRoutes from './routes/map.js';
import organizationsRoutes from './routes/organizations.js';
import eventsRoutes from './routes/events.js';
import authRoutes from './routes/auth.js';
import commentsRoutes from './routes/comments.js';
import adminRoutes from './routes/admin.js';
import turnstileRoutes from './routes/turnstile.js';
import maintenanceRoutes from './routes/maintenance.js';
import entityStoriesRoutes from './routes/entity-stories.js';

const server = Fastify({ logger: true });

// Phase 5: Security hardening - CSP enabled, CORS restricted
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'https://pjuskeby.org',
  'https://www.pjuskeby.org',
  'http://localhost:3000'
];

await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["https://challenges.cloudflare.com"]
    }
  }
});

await server.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
});

server.get('/health', async () => ({ status: 'ok', ts: Date.now() }));

// Routes
await server.register(async (app) => {
  await app.register(streetsRoutes, { prefix: '/api/streets' });
  await app.register(placesRoutes, { prefix: '/api/places' });
  await app.register(peopleRoutes, { prefix: '/api/people' });
  await app.register(businessesRoutes, { prefix: '/api/businesses' });
  await app.register(lakesRoutes, { prefix: '/api/lakes' });
  await app.register(mapRoutes, { prefix: '/api/map' });
  await app.register(organizationsRoutes, { prefix: '/api/organizations' });
  await app.register(eventsRoutes, { prefix: '/api/events' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(commentsRoutes, { prefix: '/api/comments' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(turnstileRoutes, { prefix: '/api/turnstile' });
  await app.register(maintenanceRoutes, { prefix: '/api/maintenance' });
  await app.register(entityStoriesRoutes, { prefix: '/api' });
});

const PORT = parseInt(process.env.API_PORT || '4100', 10);
const HOST = process.env.API_HOST || '0.0.0.0';

try {
  await server.listen({ port: PORT, host: HOST });
  console.log(`API listening on http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
