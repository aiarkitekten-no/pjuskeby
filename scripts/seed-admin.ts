import 'dotenv/config';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getDb } from '../server/db/index.js';
import { users } from '../server/db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const Env = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
});

async function main() {
  const parsed = Env.safeParse(process.env);
  if (!parsed.success) {
    console.error('Missing env vars. Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    console.error(parsed.error.flatten());
    process.exit(1);
  }
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;

  const db = await getDb();
  const existing = await (db as any)
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL))
    .limit(1);

  if (existing[0]) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const id = randomUUID();
  // Phase 5: Hash password with bcrypt (10 rounds)
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
  await (db as any).insert(users).values({
    id,
    email: ADMIN_EMAIL,
    passwordHash,
    username: 'admin',
    displayName: 'Administrator',
    role: 'admin',
    emailVerified: 1,
  });

  console.log('Admin user created:', ADMIN_EMAIL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
