/* Pjuskeby Guardrails:
   - Ingen placeholders. Ingen ubrukte exports.
   - Følg koblinger.json for datakilder og relasjoner.
   - All skriving til DB/FS logges i donetoday.json.
   - Ved AI-generering: aldri publiser direkte; legg i drafts/.
   - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

// COPILOT: Ikke foreslå "mock data". Les baseline fra httpdocs/json, ellers avbryt.

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const PROJECT_ROOT = '/var/www/vhosts/pjuskeby.org';

export interface LogEntry {
  timestamp: string;
  phase: string;
  actor: 'copilot' | 'human' | 'cron' | 'system';
  action: string;
  why: string;
  files: string[];
  impact?: string;
  metadata?: Record<string, any>;
}

export async function logAction(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
  const logPath = join(PROJECT_ROOT, 'donetoday.json');
  
  let log: { description: string; entries: LogEntry[] };
  
  try {
    log = JSON.parse(await readFile(logPath, 'utf-8'));
  } catch {
    log = {
      description: 'Append-only audit log av alle endringer i Pjuskeby-prosjektet',
      entries: []
    };
  }

  log.entries.push({
    timestamp: new Date().toISOString(),
    ...entry
  });

  await writeFile(logPath, JSON.stringify(log, null, 2), 'utf-8');
}

export async function getRecentLogs(limit: number = 10): Promise<LogEntry[]> {
  const logPath = join(PROJECT_ROOT, 'donetoday.json');
  
  try {
    const log = JSON.parse(await readFile(logPath, 'utf-8'));
    return log.entries.slice(-limit);
  } catch {
    return [];
  }
}

export async function getLogsByPhase(phase: string): Promise<LogEntry[]> {
  const logPath = join(PROJECT_ROOT, 'donetoday.json');
  
  try {
    const log = JSON.parse(await readFile(logPath, 'utf-8'));
    return log.entries.filter((entry: LogEntry) => entry.phase === phase);
  } catch {
    return [];
  }
}

// Eksempel på bruk:
// await logAction({
//   phase: '1',
//   actor: 'copilot',
//   action: 'normalized people.json',
//   why: 'added id, slug, street_id fields',
//   files: ['content/data/people.normalized.json'],
//   impact: '87 personer normalisert, 2 mangler street_id'
// });
