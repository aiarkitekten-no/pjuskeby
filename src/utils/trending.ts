/**
 * Trending Algorithm for Pjuskeby Rumors
 * 
 * Calculates a trending score based on:
 * - View count (recent activity)
 * - Confirmations (positive signal)
 * - Debunks (negative signal)
 * - Shares (strong engagement)
 * - Age decay (newer = better)
 */

interface Rumor {
  id: string;
  date: string;
  interactions: {
    views: number;
    confirmed: number;
    debunked: number;
    shared: number;
  };
}

interface TrendingRumor extends Rumor {
  trendingScore: number;
}

/**
 * Calculate trending score for a rumor
 * 
 * Formula:
 * score = (views * 0.3) + (confirmed * 2) + (debunked * -1) + (shared * 3) - (ageInDays * 0.5)
 * 
 * This balances recency with engagement quality
 */
export function calculateTrendingScore(rumor: Rumor): number {
  const now = new Date();
  const rumorDate = new Date(rumor.date);
  const ageInDays = (now.getTime() - rumorDate.getTime()) / (1000 * 60 * 60 * 24);
  
  const { views, confirmed, debunked, shared } = rumor.interactions;
  
  const score = 
    (views * 0.3) +          // Views show interest
    (confirmed * 2) +        // Confirmations boost credibility
    (debunked * -1) +        // Debunks reduce score
    (shared * 3) +           // Shares are the strongest signal
    (ageInDays * -0.5);      // Decay over time
  
  return Math.max(0, score); // Never go negative
}

/**
 * Sort rumors by trending score
 */
export function sortByTrending(rumors: Rumor[]): TrendingRumor[] {
  return rumors
    .map(rumor => ({
      ...rumor,
      trendingScore: calculateTrendingScore(rumor)
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore);
}

/**
 * Get top N trending rumors
 */
export function getTopTrending(rumors: Rumor[], count: number = 5): TrendingRumor[] {
  return sortByTrending(rumors).slice(0, count);
}

/**
 * Check if a rumor is "hot" (trending score > threshold)
 */
export function isHotRumor(rumor: Rumor, threshold: number = 10): boolean {
  return calculateTrendingScore(rumor) > threshold;
}

/**
 * Get trending badge emoji
 */
export function getTrendingBadge(score: number): string {
  if (score > 50) return '🔥🔥🔥';
  if (score > 25) return '🔥🔥';
  if (score > 10) return '🔥';
  return '';
}
