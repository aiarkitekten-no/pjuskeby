/**
 * GUARDRAILS CHECKPOINT v3.0 - UBRYTELIG
 * Cross-Reference Manager
 * Manages entity mentions and backlinks between stories and entities
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { entityMentions, stories } from '../db/schema.js';
import { entityMentionDetector } from './entity-mention-detector.js';
import { eq, and, desc } from 'drizzle-orm';

// Database connection
const connection = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pjuskeby'
});

const db = drizzle(connection);

export interface EntityMention {
  entityType: 'person' | 'place' | 'business' | 'street';
  entityId: string;
  entityName: string;
  mentionContext: string;
  mentionPosition: number;
  confidenceScore: number;
}

export interface EntityBacklink {
  storyId: string;
  storyTitle: string;
  storySlug: string;
  publishedAt: string;
  mentionContext: string;
  confidenceScore: number;
}

export interface EntityMentionStats {
  totalMentions: number;
  lastMentionedAt: string | null;
  firstMentionedAt: string | null;
  avgConfidence: number;
}

export class CrossReferenceManager {
  /**
   * Process a story for entity mentions and update cross-references
   */
  async processStoryMentions(storyId: string, storyContent: string): Promise<void> {
    console.log(`🔍 Processing entity mentions for story ${storyId}`);
    
    try {
      // Detect mentions in the story content
      const mentions = await entityMentionDetector.detectMentions(storyContent);
      
      // Remove existing mentions for this story
      await this.removeStoryMentions(storyId);
      
      // Insert new mentions
      for (const mention of mentions) {
        await this.insertEntityMention(storyId, mention);
      }
      
      console.log(`✅ Processed ${mentions.length} entity mentions for story ${storyId}`);
    } catch (error) {
      console.error(`❌ Error processing mentions for story ${storyId}:`, error);
      throw error;
    }
  }

  /**
   * Remove all entity mentions for a story
   */
  async removeStoryMentions(storyId: string): Promise<void> {
    await db.delete(entityMentions).where(eq(entityMentions.storyId, storyId));
  }

  /**
   * Insert a single entity mention
   */
  private async insertEntityMention(storyId: string, mention: EntityMention): Promise<void> {
    await db.insert(entityMentions).values({
      id: `mention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      storyId,
      storySlug: `story-${storyId}`, // This would need to be passed in properly
      entityType: mention.entityType,
      entityId: mention.entityId,
      entitySlug: mention.entityId.toLowerCase().replace(/\s+/g, '-'),
      entityName: mention.entityName,
      mentionContext: mention.mentionContext,
      mentionPosition: mention.mentionPosition,
      confidenceScore: mention.confidenceScore.toString()
    });
  }

  /**
   * Get all backlinks for a specific entity
   */
  async getEntityBacklinks(
    entityType: string, 
    entityId: string, 
    limit: number = 10
  ): Promise<EntityBacklink[]> {
    const result = await db
      .select({
        storyId: stories.id,
        storyTitle: stories.title,
        storySlug: stories.slug,
        publishedAt: stories.publishedAt,
        mentionContext: entityMentions.mentionContext,
        confidenceScore: entityMentions.confidenceScore
      })
      .from(entityMentions)
      .innerJoin(stories, eq(entityMentions.storyId, stories.id))
      .where(
        and(
          eq(entityMentions.entityType, entityType),
          eq(entityMentions.entityId, entityId),
          eq(stories.status, 'published')
        )
      )
      .orderBy(desc(stories.publishedAt))
      .limit(limit);

    return result.map((row: any) => ({
      storyId: row.storyId,
      storyTitle: row.storyTitle,
      storySlug: row.storySlug,
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : '',
      mentionContext: row.mentionContext || '',
      confidenceScore: parseFloat(row.confidenceScore) || 0
    }));
  }

  /**
   * Get the most recent backlink for an entity
   */
  async getLatestEntityMention(
    entityType: string, 
    entityId: string
  ): Promise<EntityBacklink | null> {
    const backlinks = await this.getEntityBacklinks(entityType, entityId, 1);
    return backlinks.length > 0 ? backlinks[0] : null;
  }

  /**
   * Get mention statistics for an entity
   */
  async getEntityMentionStats(
    entityType: string, 
    entityId: string
  ): Promise<EntityMentionStats> {
    // Get all mentions for this entity from published stories
    const mentions = await db
      .select({
        publishedAt: stories.publishedAt,
        confidenceScore: entityMentions.confidenceScore
      })
      .from(entityMentions)
      .innerJoin(stories, eq(entityMentions.storyId, stories.id))
      .where(
        and(
          eq(entityMentions.entityType, entityType),
          eq(entityMentions.entityId, entityId),
          eq(stories.status, 'published')
        )
      )
      .orderBy(desc(stories.publishedAt));

    if (mentions.length === 0) {
      return {
        totalMentions: 0,
        lastMentionedAt: null,
        firstMentionedAt: null,
        avgConfidence: 0
      };
    }

    const publishedDates = mentions
      .map((m: any) => m.publishedAt)
      .filter((date: any) => date !== null)
      .sort();

    const avgConfidence = mentions.reduce((sum: number, m: any) => sum + parseFloat(m.confidenceScore), 0) / mentions.length;

    return {
      totalMentions: mentions.length,
      lastMentionedAt: publishedDates[publishedDates.length - 1]?.toISOString() || null,
      firstMentionedAt: publishedDates[0]?.toISOString() || null,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    };
  }

  /**
   * Get all entities mentioned in a story
   */
  async getStoryMentions(storyId: string): Promise<EntityMention[]> {
    const mentions = await db
      .select()
      .from(entityMentions)
      .where(eq(entityMentions.storyId, storyId))
      .orderBy(entityMentions.mentionPosition);

    return mentions.map((mention: any) => ({
      entityType: mention.entityType as 'person' | 'place' | 'business' | 'street',
      entityId: mention.entityId,
      entityName: mention.entityName,
      mentionContext: mention.mentionContext || '',
      mentionPosition: mention.mentionPosition,
      confidenceScore: parseFloat(mention.confidenceScore) || 0
    }));
  }

  /**
   * Update mentions when a story is published
   */
  async onStoryPublished(storyId: string, storyContent: string): Promise<void> {
    console.log(`📚 Story ${storyId} published, updating cross-references`);
    await this.processStoryMentions(storyId, storyContent);
  }

  /**
   * Clean up mentions when a story is unpublished or deleted
   */
  async onStoryUnpublished(storyId: string): Promise<void> {
    console.log(`🗑️ Story ${storyId} unpublished, cleaning up cross-references`);
    await this.removeStoryMentions(storyId);
  }

  /**
   * Get trending entities (most mentioned recently)
   */
  async getTrendingEntities(days: number = 30): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // This would need a more complex query in a real implementation
    // For now, return a placeholder
    return [];
  }

  /**
   * Rebuild all cross-references (for maintenance)
   */
  async rebuildAllCrossReferences(): Promise<void> {
    console.log('🔄 Rebuilding all cross-references...');
    
    // Clear all existing mentions
    await db.delete(entityMentions);
    
    // Get all published stories
    const publishedStories = await db
      .select({
        id: stories.id,
        content: stories.content
      })
      .from(stories)
      .where(eq(stories.status, 'published'));

    let processed = 0;
    for (const story of publishedStories) {
      if (story.content) {
        await this.processStoryMentions(story.id, story.content);
        processed++;
      }
    }
    
    console.log(`✅ Rebuilt cross-references for ${processed} stories`);
  }
}

// Export singleton instance
export const crossReferenceManager = new CrossReferenceManager();