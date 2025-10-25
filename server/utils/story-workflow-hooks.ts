/**
 * GUARDRAILS CHECKPOINT v3.0 - UBRYTELIG
 * Story Publication Workflow Hook
 * Automatically processes entity mentions when stories are published
 */

import { crossReferenceManager } from '../utils/cross-reference-manager.js';

export interface StoryWorkflowHook {
  onStoryPublished: (storyId: string, storyData: any) => Promise<void>;
  onStoryUnpublished: (storyId: string) => Promise<void>;
  onStoryUpdated: (storyId: string, storyData: any) => Promise<void>;
}

export class EntityMentionWorkflowHook implements StoryWorkflowHook {
  /**
   * Called when a story is published
   */
  async onStoryPublished(storyId: string, storyData: any): Promise<void> {
    console.log(`🔗 Processing entity mentions for published story: ${storyId}`);
    
    try {
      const content = storyData.content || storyData.text || '';
      if (!content) {
        console.warn(`No content found for story ${storyId}, skipping entity mention processing`);
        return;
      }

      // Process entity mentions
      await crossReferenceManager.onStoryPublished(storyId, content);
      
      console.log(`✅ Successfully processed entity mentions for story ${storyId}`);
    } catch (error) {
      console.error(`❌ Error processing entity mentions for story ${storyId}:`, error);
      // Don't throw error - entity mention processing shouldn't block story publication
    }
  }

  /**
   * Called when a story is unpublished or deleted
   */
  async onStoryUnpublished(storyId: string): Promise<void> {
    console.log(`🗑️ Cleaning up entity mentions for unpublished story: ${storyId}`);
    
    try {
      await crossReferenceManager.onStoryUnpublished(storyId);
      console.log(`✅ Successfully cleaned up entity mentions for story ${storyId}`);
    } catch (error) {
      console.error(`❌ Error cleaning up entity mentions for story ${storyId}:`, error);
      // Don't throw error - cleanup shouldn't block unpublishing
    }
  }

  /**
   * Called when a story is updated (and is published)
   */
  async onStoryUpdated(storyId: string, storyData: any): Promise<void> {
    // Only reprocess if the story is published
    if (storyData.status === 'published') {
      console.log(`📝 Reprocessing entity mentions for updated story: ${storyId}`);
      await this.onStoryPublished(storyId, storyData);
    }
  }
}

// Create workflow integration helper
export class StoryWorkflowManager {
  private hooks: StoryWorkflowHook[] = [];

  constructor() {
    // Register the entity mention hook by default
    this.registerHook(new EntityMentionWorkflowHook());
  }

  /**
   * Register a new workflow hook
   */
  registerHook(hook: StoryWorkflowHook): void {
    this.hooks.push(hook);
  }

  /**
   * Trigger all hooks when a story is published
   */
  async triggerStoryPublished(storyId: string, storyData: any): Promise<void> {
    console.log(`🚀 Triggering publication workflow for story: ${storyId}`);
    
    const promises = this.hooks.map(hook => 
      hook.onStoryPublished(storyId, storyData).catch(error => {
        console.error(`Hook failed for story ${storyId}:`, error);
        return null; // Continue with other hooks even if one fails
      })
    );

    await Promise.all(promises);
    console.log(`✅ Completed publication workflow for story: ${storyId}`);
  }

  /**
   * Trigger all hooks when a story is unpublished
   */
  async triggerStoryUnpublished(storyId: string): Promise<void> {
    console.log(`📤 Triggering unpublication workflow for story: ${storyId}`);
    
    const promises = this.hooks.map(hook => 
      hook.onStoryUnpublished(storyId).catch(error => {
        console.error(`Hook failed for story ${storyId}:`, error);
        return null;
      })
    );

    await Promise.all(promises);
    console.log(`✅ Completed unpublication workflow for story: ${storyId}`);
  }

  /**
   * Trigger all hooks when a story is updated
   */
  async triggerStoryUpdated(storyId: string, storyData: any): Promise<void> {
    console.log(`📝 Triggering update workflow for story: ${storyId}`);
    
    const promises = this.hooks.map(hook => 
      hook.onStoryUpdated(storyId, storyData).catch(error => {
        console.error(`Hook failed for story ${storyId}:`, error);
        return null;
      })
    );

    await Promise.all(promises);
    console.log(`✅ Completed update workflow for story: ${storyId}`);
  }
}

// Export singleton instance
export const storyWorkflowManager = new StoryWorkflowManager();