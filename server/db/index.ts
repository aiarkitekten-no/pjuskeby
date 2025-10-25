import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema.js';

// Relax typing to avoid project-wide TS friction while keeping runtime stable
let dbInstance: any = null;
let initError: Error | null = null;

export async function getDb(): Promise<any> {
  if (dbInstance) return dbInstance;
  if (initError) throw initError;
  try {
    const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = (process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '') as string;
    const database = process.env.DB_NAME || 'pjuskeby';
    const port = parseInt(process.env.DB_PORT || '3306', 10);

  const conn = await mysql.createConnection({ host, user, password, database, port });
  dbInstance = drizzle(conn as any, { schema, mode: 'default' });
    return dbInstance;
  } catch (err: any) {
    initError = err instanceof Error ? err : new Error(String(err));
    throw initError;
  }
}

export async function getDbOptional(): Promise<any | null> {
  try {
    return await getDb();
  } catch (_e) {
    return null;
  }
}
