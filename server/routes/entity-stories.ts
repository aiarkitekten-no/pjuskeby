/**
 * API endpoint to get stories mentioning a specific entity
 * Used by person/place/business pages to show backlinks
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../db/index.js';
import { entityMentions } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

interface EntityParams {
  type: 'person' | 'place' | 'business' | 'organization' | 'street' | 'lake';
  slug: string;
}

// Simple frontmatter parser
function parseFrontmatter(content: string): { data: any; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, content };
  }
  
  const [, frontmatterStr, bodyContent] = match;
  const data: any = {};
  
  // Parse YAML-like frontmatter
  const lines = frontmatterStr.split('\n');
  let currentKey = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes(':')) {
      const colonIndex = trimmed.indexOf(':');
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      currentKey = key;
      data[key] = value.replace(/^["']|["']$/g, '');
      // Parse booleans
      if (data[key] === 'true') data[key] = true;
      if (data[key] === 'false') data[key] = false;
    }
  }
  
  return { data, content: bodyContent };
}

// Get story metadata from MDX file
async function getStoryMetadata(storySlug: string): Promise<any | null> {
  try {
    const storiesDir = join(process.cwd(), 'src/content/stories');
    const filePath = join(storiesDir, `${storySlug}.mdx`);
    const content = await readFile(filePath, 'utf-8');
    const { data } = parseFrontmatter(content);
    
    if (!data.published) {
      return null; // Don't return unpublished stories
    }
    
    return {
      slug: storySlug,
      title: data.title || storySlug,
      excerpt: data.excerpt || data.preheader || '',
      publishedAt: data.date || new Date().toISOString(),
      url: `/historier/${storySlug}`
    };
  } catch (error) {
    console.error(`Failed to read story ${storySlug}:`, error);
    return null;
  }
}

export default async function entityStoriesRoutes(fastify: FastifyInstance) {
  
  /**
   * GET /api/entities/:type/:slug/stories
   * Get all stories that mention this entity
   */
  fastify.get<{
    Params: EntityParams;
  }>('/entities/:type/:slug/stories', async (request: FastifyRequest<{ Params: EntityParams }>, reply: FastifyReply) => {
    const { type, slug } = request.params;
    
    try {
      const db = await getDb();
      
      // Get all mentions for this entity
      const mentions = await db
        .select({
          storySlug: entityMentions.storySlug,
          mentionContext: entityMentions.mentionContext,
          createdAt: entityMentions.createdAt
        })
        .from(entityMentions)
        .where(
          and(
            eq(entityMentions.entityType, type),
            eq(entityMentions.entitySlug, slug)
          )
        )
        .orderBy(desc(entityMentions.createdAt));
      
      if (mentions.length === 0) {
        return reply.send({
          entity: { type, slug },
          stories: [],
          count: 0
        });
      }
      
      // Get unique story slugs
      const uniqueStorySlugs = [...new Set(mentions.map((m: any) => m.storySlug))] as string[];
      
      // Fetch story details from MDX files
      const storyPromises = uniqueStorySlugs.map((slug: string) => getStoryMetadata(slug));
      const storyResults = await Promise.all(storyPromises);
      const storyRecords = storyResults.filter(s => s !== null);
      
      // Match stories with mentions
      const mentionedStories = storyRecords
        .map((story: any) => ({
          slug: story.slug,
          title: story.title,
          excerpt: story.excerpt,
          publishedAt: story.publishedAt,
          url: story.url,
          mentions: mentions
            .filter((m: any) => m.storySlug === story.slug)
            .map((m: any) => ({
              context: m.mentionContext,
              date: m.createdAt
            }))
        }))
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      
      return reply.send({
        entity: { type, slug },
        stories: mentionedStories,
        count: mentionedStories.length
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to fetch entity stories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
