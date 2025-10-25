import { promises as fs } from 'fs';
import path from 'path';

const HTTPDOCS = '/var/www/vhosts/pjuskeby.org/httpdocs';

export async function readJson<T = unknown>(relPath: string): Promise<T> {
  const p = path.join(HTTPDOCS, relPath);
  const raw = await fs.readFile(p, 'utf8');
  return JSON.parse(raw) as T;
}

export interface StreetItem { id?: string; name: string; slug?: string }
export async function readStreets(): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const data = await readJson<any[]>('json/streets.json');
    // Try to normalize a few expected shapes
    return data.map((x, i) => {
      if (typeof x === 'string') return { id: String(i + 1), name: x, slug: x.toLowerCase().replace(/\s+/g, '-') };
      if (x && typeof x === 'object') {
        const name = x.name || x.title || x.street || String(x);
        const slug = x.slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : String(i + 1));
        const id = x.id ? String(x.id) : String(i + 1);
        return { id, name, slug };
      }
      return { id: String(i + 1), name: String(x), slug: String(i + 1) };
    });
  } catch (e) {
    return [];
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function readPlaces(): Promise<Array<{ id: string; name: string; slug: string; category?: string }>> {
  try {
    const data = await readJson<any[]>('json/placespjuskeby.json');
    return data.map((x, i) => {
      const name = x?.name || x?.title || `place-${i + 1}`;
      return { id: String(x?.id ?? i + 1), name, slug: x?.slug || slugify(name), category: x?.category };
    });
  } catch { return []; }
}

export async function readPeople(): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const data = await readJson<any[]>('json/people.json');
    return data.map((x, i) => {
      const name = x?.name || x?.title || `person-${i + 1}`;
      return { id: String(x?.id ?? i + 1), name, slug: x?.slug || slugify(name) };
    });
  } catch { return []; }
}

export async function readBusinesses(): Promise<Array<{ id: string; name: string; slug: string; type?: string }>> {
  try {
    const data = await readJson<any[]>('json/businesses.json');
    return data.map((x, i) => {
      const name = x?.name || x?.title || `business-${i + 1}`;
      return { id: String(x?.id ?? i + 1), name, slug: x?.slug || slugify(name), type: x?.type };
    });
  } catch { return []; }
}

export async function readLakes(): Promise<Array<{ id: string; name: string; slug: string }>> {
  try {
    const data = await readJson<any[]>('json/lakes.json');
    return data.map((x, i) => {
      const name = x?.name || x?.title || `lake-${i + 1}`;
      return { id: String(x?.id ?? i + 1), name, slug: x?.slug || slugify(name) };
    });
  } catch { return []; }
}

export async function readLayer(layer: string): Promise<any> {
  const map: Record<string, string> = {
    streets: 'json/streets.json',
    lakes: 'json/lakes.json',
    people: 'json/people.json',
    businesses: 'json/businesses.json',
    places: 'json/placespjuskeby.json'
  };
  const rel = map[layer];
  if (!rel) return { error: 'Unknown layer' };
  try {
    return await readJson<any>(rel);
  } catch {
    return { error: 'Layer not available' };
  }
}
