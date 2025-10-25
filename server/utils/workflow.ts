/**
 * Phase 7: AI Story Automation - Approval Workflow
 * 
 * Enforces state machine for story approval process.
 * 
 * Workflow States:
 *   draft -> review (any editor)
 *   review -> approved (reviewer with approval permission)
 *   review -> draft (reviewer sends back for revision)
 *   approved -> published (system or admin)
 * 
 * FORBIDDEN (Guardrail): draft -> published (must go through approval)
 */

import { getDb } from '../db';
import { stories, workflowLog, aiDecisions } from '../db/schema';
import { processStoryForEntities } from './entity-extraction';
import { cacheDelete, CACHE_KEYS } from './cache';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Types
// ============================================================================

export type StoryStatus = 'draft' | 'review' | 'approved' | 'published';

export interface StateTransition {
  from: StoryStatus;
  to: StoryStatus;
  requiredPermission?: string;
  description: string;
}

export interface TransitionRequest {
  storyId: string;
  newStatus: StoryStatus;
  userId: string;
  reason?: string;
}

export interface TransitionResult {
  success: boolean;
  message: string;
  previousStatus?: StoryStatus;
  newStatus?: StoryStatus;
  transitionLogId?: string;
}

// ============================================================================
// State Machine Definition
// ============================================================================

const ALLOWED_TRANSITIONS: StateTransition[] = [
  {
    from: 'draft',
    to: 'review',
    description: 'Submit draft for review',
  },
  {
    from: 'review',
    to: 'approved',
    requiredPermission: 'approve_stories',
    description: 'Approve story after review',
  },
  {
    from: 'review',
    to: 'draft',
    description: 'Send back for revision',
  },
  {
    from: 'approved',
    to: 'published',
    requiredPermission: 'publish_stories',
    description: 'Publish approved story',
  },
  {
    from: 'approved',
    to: 'draft',
    requiredPermission: 'unpublish_stories',
    description: 'Unpublish and send back to draft',
  },
];

// FORBIDDEN transitions
const FORBIDDEN_TRANSITIONS = [
  'draft->published',  // Must go through approval
  'review->published', // Must be approved first
];

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a transition is allowed by the state machine
 */
export function isTransitionAllowed(from: StoryStatus, to: StoryStatus): boolean {
  const key = `${from}->${to}`;
  
  // Check forbidden list
  if (FORBIDDEN_TRANSITIONS.includes(key)) {
    return false;
  }

  // Check allowed transitions
  return ALLOWED_TRANSITIONS.some(t => t.from === from && t.to === to);
}

/**
 * Get the transition definition if allowed
 */
function getTransition(from: StoryStatus, to: StoryStatus): StateTransition | null {
  return ALLOWED_TRANSITIONS.find(t => t.from === from && t.to === to) || null;
}

// ============================================================================
// Permission Check (Placeholder)
// ============================================================================

/**
 * Check if user has required permission
 * In a real implementation, this would query user roles/permissions
 */
async function hasPermission(_userId: string, permission: string): Promise<boolean> {
  // For now, assume all authenticated users have basic permissions
  // In production, implement proper role-based access control
  
  if (permission === 'approve_stories') {
    // Check if user is admin or has reviewer role
    // Placeholder: allow all for now
    return true;
  }
  
  if (permission === 'publish_stories') {
    // Check if user is admin
    // Placeholder: allow all for now
    return true;
  }

  if (permission === 'unpublish_stories') {
    // Check if user is admin
    // Placeholder: allow all for now
    return true;
  }

  return true;
}

// ============================================================================
// Transition Logging
// ============================================================================

/**
 * Log a workflow transition
 */
async function logTransition(
  storyId: string,
  fromStatus: StoryStatus | null,
  toStatus: StoryStatus,
  userId: string,
  reason?: string
): Promise<string> {
  const db = await getDb();
  const logId = uuidv4();
  
  await db.insert(workflowLog).values({
    id: logId,
    storyId,
    fromStatus: fromStatus || undefined,
    toStatus,
    transitionedBy: userId,
    transitionReason: reason || undefined,
    createdAt: new Date(),
  });

  return logId;
}

/**
 * Log to AI decisions table for workflow transitions
 */
async function logAIDecision(
  storyId: string,
  fromStatus: StoryStatus | null,
  toStatus: StoryStatus,
  userId: string,
  reasoning: string
): Promise<void> {
  const db = await getDb();
  await db.insert(aiDecisions).values({
    id: uuidv4(),
    timestamp: new Date(),
    action: 'workflow_transition',
    model: 'workflow_engine',
    inputData: { story_id: storyId, from: fromStatus, to: toStatus },
    outputData: { success: true, new_status: toStatus },
    confidenceScore: '1.00', // Workflow transitions are deterministic
    reasoning,
    sourceData: { user_id: userId },
    approved: toStatus === 'published' ? 1 : 0,
    approvedBy: toStatus === 'published' ? userId : undefined,
    approvedAt: toStatus === 'published' ? new Date() : undefined,
  });
}

// ============================================================================
// Main Transition Function
// ============================================================================

/**
 * Transition a story from one status to another
 * Enforces state machine rules and logs all transitions
 */
export async function transitionStoryStatus(
  request: TransitionRequest
): Promise<TransitionResult> {
  const { storyId, newStatus, userId, reason } = request;
  const db = await getDb();

  // 1. Get current story status
  const story = await db.query.stories.findFirst({
    where: eq(stories.id, storyId),
  });

  if (!story) {
    return {
      success: false,
      message: `Story ${storyId} not found`,
    };
  }

  const currentStatus = story.status as StoryStatus;

  // 2. Check if transition is allowed
  if (!isTransitionAllowed(currentStatus, newStatus)) {
    const key = `${currentStatus}->${newStatus}`;
    
    if (FORBIDDEN_TRANSITIONS.includes(key)) {
      return {
        success: false,
        message: `FORBIDDEN: Direct transition from ${currentStatus} to ${newStatus} is not allowed. Stories must go through approval workflow.`,
        previousStatus: currentStatus,
      };
    }

    return {
      success: false,
      message: `Invalid transition from ${currentStatus} to ${newStatus}. Allowed transitions from ${currentStatus}: ${
        ALLOWED_TRANSITIONS
          .filter(t => t.from === currentStatus)
          .map(t => t.to)
          .join(', ')
      }`,
      previousStatus: currentStatus,
    };
  }

  // 3. Check permissions
  const transition = getTransition(currentStatus, newStatus);
  if (transition?.requiredPermission) {
    const allowed = await hasPermission(userId, transition.requiredPermission);
    if (!allowed) {
      return {
        success: false,
        message: `Permission denied: User ${userId} does not have '${transition.requiredPermission}' permission`,
        previousStatus: currentStatus,
      };
    }
  }

  // 4. Update story status and metadata
  const updateData: any = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === 'review') {
    updateData.reviewedBy = userId;
    updateData.reviewedAt = new Date();
  }

  if (newStatus === 'approved') {
    updateData.approvedBy = userId;
    updateData.approvedAt = new Date();
  }

  if (newStatus === 'published') {
    updateData.publishedAt = new Date();
  }

  await db.update(stories)
    .set(updateData)
    .where(eq(stories.id, storyId));

  // 5. Log the transition
  const transitionLogId = await logTransition(
    storyId,
    currentStatus,
    newStatus,
    userId,
    reason
  );

  // 6. Log to AI decisions
  await logAIDecision(
    storyId,
    currentStatus,
    newStatus,
    userId,
    reason || transition?.description || `Transition from ${currentStatus} to ${newStatus}`
  );

  return {
    success: true,
    message: `Story transitioned from ${currentStatus} to ${newStatus}`,
    previousStatus: currentStatus,
    newStatus,
    transitionLogId,
  };
}

// ============================================================================
// Rate Limiting: Max 1 Story per 2 Days
// ============================================================================

/**
 * Check if publishing is allowed based on rate limit
 * Enforces: Maximum 1 story published every 2 days
 */
export async function canPublishStory(): Promise<{
  allowed: boolean;
  message: string;
  nextAvailableDate?: Date;
}> {
  const db = await getDb();
  
  // Get most recent published story
  const recentStories = await db.query.stories.findMany({
    where: eq(stories.status, 'published'),
    orderBy: [desc(stories.publishedAt)],
    limit: 1,
  });

  if (recentStories.length === 0) {
    return {
      allowed: true,
      message: 'No recent published stories, publishing allowed',
    };
  }

  const lastPublished = recentStories[0];
  if (!lastPublished.publishedAt) {
    return {
      allowed: true,
      message: 'Last story has no publish date, allowing publish',
    };
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  if (lastPublished.publishedAt < twoDaysAgo) {
    return {
      allowed: true,
      message: 'More than 2 days since last publish, allowed',
    };
  }

  // Calculate next available date
  const nextAvailable = new Date(lastPublished.publishedAt);
  nextAvailable.setDate(nextAvailable.getDate() + 2);

  return {
    allowed: false,
    message: `Cannot publish: Last story published on ${lastPublished.publishedAt.toISOString()}. Next available publish date: ${nextAvailable.toISOString()}`,
    nextAvailableDate: nextAvailable,
  };
}

/**
 * Transition to published with rate limit check
 */
export async function transitionToPublished(
  storyId: string,
  userId: string,
  reason?: string
): Promise<TransitionResult> {
  // Check rate limit
  const rateLimitCheck = await canPublishStory();
  if (!rateLimitCheck.allowed) {
    return {
      success: false,
      message: rateLimitCheck.message,
    };
  }

  // Proceed with normal transition
  const res = await transitionStoryStatus({
    storyId,
    newStatus: 'published',
    userId,
    reason,
  });

  // If successful, load story content and process entity mentions
  if (res.success) {
    try {
  const db = await getDb();
  const story = await db.query.stories.findFirst({ where: eq(stories.id, storyId) });
      if (story) {
        await processStoryForEntities(story.slug, story.content);
        // Invalidate related caches
        try {
          await cacheDelete(CACHE_KEYS.STORIES_INDEX);
          await cacheDelete(`${CACHE_KEYS.STORIES_DETAIL}${story.id}`);
        } catch (e) {
          console.warn('[workflow] Cache invalidation skipped or failed:', (e as any)?.message);
        }
      }
    } catch (e) {
      console.error('[workflow] Post-publish mention processing failed:', (e as any)?.message);
    }
  }

  return res;
}

// ============================================================================
// Workflow History
// ============================================================================

/**
 * Get workflow history for a story
 */
export async function getWorkflowHistory(storyId: string) {
  const db = await getDb();
  return db.query.workflowLog.findMany({
    where: eq(workflowLog.storyId, storyId),
    orderBy: [desc(workflowLog.createdAt)],
  });
}

// ============================================================================
// Exports
// ============================================================================

export default {
  transitionStoryStatus,
  transitionToPublished,
  canPublishStory,
  isTransitionAllowed,
  getWorkflowHistory,
  ALLOWED_TRANSITIONS,
  FORBIDDEN_TRANSITIONS,
};
