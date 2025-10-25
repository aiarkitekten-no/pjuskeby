/**
 * Entity Extraction for Stories - Phase 6: RELASJONSSYSTEM
 * Extracts mentions of people, places, businesses, organizations from story content
 */

import { getDbOptional } from '../db/index.js';
import { entityMentions, people, places, businesses, organizations, streets, lakes } from '../db/schema.js';
import { randomUUID } from 'crypto';

export interface EntityMatch {
  type: 'person' | 'place' | 'business' | 'organization' | 'street' | 'lake';
  id: string;
  slug: string;
  name: string;
  context: string; // Surrounding text where mention was found
}

/**
 * Extract entities from story content
 */
export async function extractEntitiesFromStory(storySlug: string, content: string): Promise<EntityMatch[]> {
  const db = await getDbOptional();
  if (!db) {
    console.warn('[extractEntities] Database unavailable');
    return [];
  }

  const matches: EntityMatch[] = [];
  const lowerContent = content.toLowerCase();

  try {
    // Fetch all entities
    const [peopleRows, placesRows, businessesRows, orgsRows, streetsRows, lakesRows] = await Promise.all([
      (db as any).select().from(people),
      (db as any).select().from(places),
      (db as any).select().from(businesses),
      (db as any).select().from(organizations),
      (db as any).select().from(streets),
      (db as any).select().from(lakes),
    ]);

    // Check each entity type
    for (const person of peopleRows) {
      const index = lowerContent.indexOf(person.name.toLowerCase());
      if (index !== -1) {
        matches.push({
          type: 'person',
          id: person.id,
          slug: person.slug,
          name: person.name,
          context: extractContext(content, index, person.name.length)
        });
      }
    }

    for (const place of placesRows) {
      const index = lowerContent.indexOf(place.name.toLowerCase());
      if (index !== -1) {
        matches.push({
          type: 'place',
          id: place.id,
          slug: place.slug,
          name: place.name,
          context: extractContext(content, index, place.name.length)
        });
      }
    }

    for (const business of businessesRows) {
      const index = lowerContent.indexOf(business.name.toLowerCase());
      if (index !== -1) {
        matches.push({
          type: 'business',
          id: business.id,
          slug: business.slug,
          name: business.name,
          context: extractContext(content, index, business.name.length)
        });
      }
    }

    for (const org of orgsRows) {
      const index = lowerContent.indexOf(org.name.toLowerCase());
      if (index !== -1) {
        matches.push({
          type: 'organization',
          id: org.id,
          slug: org.slug,
          name: org.name,
          context: extractContext(content, index, org.name.length)
        });
      }
    }

    for (const street of streetsRows) {
      const index = lowerContent.indexOf(street.name.toLowerCase());
      if (index !== -1) {
        matches.push({
          type: 'street',
          id: street.id,
          slug: street.slug,
          name: street.name,
          context: extractContext(content, index, street.name.length)
        });
      }
    }

    for (const lake of lakesRows) {
      const index = lowerContent.indexOf(lake.name.toLowerCase());
      if (index !== -1) {
        matches.push({
          type: 'lake',
          id: lake.id,
          slug: lake.slug,
          name: lake.name,
          context: extractContext(content, index, lake.name.length)
        });
      }
    }

  } catch (error) {
    console.error('[extractEntities] Error:', error);
  }

  return matches;
}

/**
 * Extract context around a match (±50 chars)
 */
function extractContext(content: string, index: number, length: number): string {
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + length + 50);
  return content.substring(start, end).trim();
}

/**
 * Save entity mentions to database
 */
export async function saveEntityMentions(storySlug: string, matches: EntityMatch[]): Promise<number> {
  const db = await getDbOptional();
  if (!db) {
    console.warn('[saveEntityMentions] Database unavailable');
    return 0;
  }

  try {
    // First, delete existing mentions for this story to avoid duplicates
    await (db as any).delete(entityMentions).where({ storySlug });

    // Insert new mentions
    for (const match of matches) {
      await (db as any).insert(entityMentions).values({
        id: randomUUID(),
        storySlug,
        entityType: match.type,
        entityId: match.id,
        entitySlug: match.slug,
        entityName: match.name,
        mentionContext: match.context,
      });
    }

    return matches.length;
  } catch (error) {
    console.error('[saveEntityMentions] Error:', error);
    return 0;
  }
}

/**
 * Get stories that mention a specific entity
 */
export async function getStoriesMentioning(entityType: string, entityId: string): Promise<any[]> {
  const db = await getDbOptional();
  if (!db) {
    return [];
  }

  try {
    const mentions = await (db as any)
      .select()
      .from(entityMentions)
      .where({ entityType, entityId });

    return mentions;
  } catch (error) {
    console.error('[getStoriesMentioning] Error:', error);
    return [];
  }
}

/**
 * Process a story: extract entities and save mentions
 */
export async function processStoryForEntities(storySlug: string, content: string): Promise<{ success: boolean; count: number }> {
  try {
    const matches = await extractEntitiesFromStory(storySlug, content);
    const count = await saveEntityMentions(storySlug, matches);
    
    console.log(`[processStoryForEntities] Processed ${storySlug}: found ${matches.length} entity mentions`);
    
    return { success: true, count };
  } catch (error) {
    console.error('[processStoryForEntities] Error:', error);
    return { success: false, count: 0 };
  }
}
