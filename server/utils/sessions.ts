import { randomUUID } from 'crypto';

export type Session = {
  id: string;
  userId: string;
  role: string;
  createdAt: number;
};

const sessions = new Map<string, Session>();

export function createSession(userId: string, role: string): Session {
  const id = randomUUID();
  const sess: Session = { id, userId, role, createdAt: Date.now() };
  sessions.set(id, sess);
  return sess;
}

export function getSession(id: string | undefined | null): Session | null {
  if (!id) return null;
  return sessions.get(id) ?? null;
}

export function revokeSession(id: string): boolean {
  return sessions.delete(id);
}

export function requireBearer(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}
