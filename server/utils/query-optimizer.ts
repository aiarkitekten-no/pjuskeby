/* Phase 19: Database Query Optimization Utilities
 * Implements performance optimizations for database queries
 */

import { performance } from 'perf_hooks';

export class QueryOptimizer {
  private queryCache = new Map<string, { result: any; timestamp: number; ttl: number }>();
  private queryMetrics = new Map<string, { totalTime: number; count: number; avgTime: number }>();

  constructor(private defaultTTL = 300000) {} // 5 minutes default TTL

  /**
   * Execute a query with caching and performance monitoring
   */
  async executeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      ttl?: number;
      useCache?: boolean;
      logPerformance?: boolean;
    } = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, useCache = true, logPerformance = true } = options;
    
    // Check cache first
    if (useCache && this.queryCache.has(queryKey)) {
      const cached = this.queryCache.get(queryKey)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        console.log(`📦 Query cache hit: ${queryKey}`);
        return cached.result;
      } else {
        this.queryCache.delete(queryKey);
      }
    }

    // Execute query with performance monitoring
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Update performance metrics
      if (logPerformance) {
        this.updateQueryMetrics(queryKey, executionTime);
      }

      // Cache the result
      if (useCache) {
        this.queryCache.set(queryKey, {
          result,
          timestamp: Date.now(),
          ttl
        });
      }

      console.log(`🏃‍♂️ Query executed: ${queryKey} (${executionTime.toFixed(2)}ms)`);
      return result;

    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.error(`❌ Query failed: ${queryKey} (${executionTime.toFixed(2)}ms)`, error);
      throw error;
    }
  }

  /**
   * Build optimized SQL queries with proper indexing hints
   */
  buildOptimizedQuery(baseQuery: string, options: {
    useIndex?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    cacheHint?: boolean;
  } = {}): string {
    let optimizedQuery = baseQuery;

    // Add index hints
    if (options.useIndex) {
      optimizedQuery = optimizedQuery.replace(
        /FROM\s+(\w+)/i,
        `FROM $1 USE INDEX (${options.useIndex})`
      );
    }

    // Add query cache hint for MySQL
    if (options.cacheHint) {
      optimizedQuery = 'SELECT SQL_CACHE ' + optimizedQuery.replace(/^SELECT\s+/i, '');
    }

    // Add ordering
    if (options.orderBy) {
      if (!optimizedQuery.toLowerCase().includes('order by')) {
        optimizedQuery += ` ORDER BY ${options.orderBy}`;
      }
    }

    // Add pagination
    if (options.limit) {
      optimizedQuery += ` LIMIT ${options.limit}`;
      if (options.offset) {
        optimizedQuery += ` OFFSET ${options.offset}`;
      }
    }

    return optimizedQuery;
  }

  /**
   * Create pagination queries with performance optimization
   */
  buildPaginatedQuery(
    baseQuery: string,
    page: number,
    pageSize: number,
    totalCountQuery?: string
  ): {
    dataQuery: string;
    countQuery: string;
    offset: number;
  } {
    const offset = (page - 1) * pageSize;
    
    const dataQuery = this.buildOptimizedQuery(baseQuery, {
      limit: pageSize,
      offset,
      cacheHint: true
    });

    const countQuery = totalCountQuery || 
      `SELECT COUNT(*) as total FROM (${baseQuery}) as count_subquery`;

    return {
      dataQuery,
      countQuery,
      offset
    };
  }

  /**
   * Batch multiple queries for better performance
   */
  async executeBatch<T>(
    queries: Array<{
      key: string;
      fn: () => Promise<T>;
      ttl?: number;
    }>
  ): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    
    // Execute all queries in parallel
    const promises = queries.map(async ({ key, fn, ttl }) => {
      const result = await this.executeQuery(key, fn, { ttl });
      return { key, result };
    });

    const batchResults = await Promise.all(promises);
    
    // Combine results
    batchResults.forEach(({ key, result }) => {
      results[key] = result;
    });

    return results;
  }

  /**
   * Update query performance metrics
   */
  private updateQueryMetrics(queryKey: string, executionTime: number): void {
    const existing = this.queryMetrics.get(queryKey);
    
    if (existing) {
      existing.totalTime += executionTime;
      existing.count += 1;
      existing.avgTime = existing.totalTime / existing.count;
    } else {
      this.queryMetrics.set(queryKey, {
        totalTime: executionTime,
        count: 1,
        avgTime: executionTime
      });
    }
  }

  /**
   * Get performance metrics for all queries
   */
  getPerformanceMetrics(): Record<string, { totalTime: number; count: number; avgTime: number }> {
    const metrics: Record<string, any> = {};
    
    this.queryMetrics.forEach((value, key) => {
      metrics[key] = {
        totalTime: Number(value.totalTime.toFixed(2)),
        count: value.count,
        avgTime: Number(value.avgTime.toFixed(2))
      };
    });

    return metrics;
  }

  /**
   * Get slowest queries for optimization
   */
  getSlowestQueries(limit = 10): Array<{ query: string; avgTime: number; count: number }> {
    const queries = Array.from(this.queryMetrics.entries())
      .map(([query, metrics]) => ({
        query,
        avgTime: metrics.avgTime,
        count: metrics.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);

    return queries;
  }

  /**
   * Clear cache and metrics
   */
  clearCache(): void {
    this.queryCache.clear();
    console.log('🗑️ Query cache cleared');
  }

  clearMetrics(): void {
    this.queryMetrics.clear();
    console.log('🗑️ Query metrics cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalQueries: number;
  } {
    const totalQueries = Array.from(this.queryMetrics.values())
      .reduce((sum, metrics) => sum + metrics.count, 0);
    
    const cacheHits = this.queryCache.size;
    const hitRate = totalQueries > 0 ? (cacheHits / totalQueries) * 100 : 0;

    return {
      size: this.queryCache.size,
      hitRate: Number(hitRate.toFixed(2)),
      totalQueries
    };
  }
}

// Singleton instance
export const queryOptimizer = new QueryOptimizer();

// Common optimized queries for Pjuskeby
export const OptimizedQueries = {
  /**
   * Get people with optimized indexing
   */
  getPeople: (limit = 50, offset = 0) => {
    return queryOptimizer.buildOptimizedQuery(
      'SELECT id, name, slug, description, street_id, workplace_id FROM people WHERE status = "active"',
      {
        useIndex: 'idx_people_status',
        orderBy: 'name ASC',
        limit,
        offset,
        cacheHint: true
      }
    );
  },

  /**
   * Get places with related data
   */
  getPlaces: (limit = 50, offset = 0) => {
    return queryOptimizer.buildOptimizedQuery(
      `SELECT p.id, p.name, p.slug, p.description, p.address, p.category,
              COUNT(pm.entity_id) as mention_count
       FROM places p
       LEFT JOIN entity_mentions pm ON p.id = pm.entity_id AND pm.entity_type = 'place'
       WHERE p.status = 'active'
       GROUP BY p.id`,
      {
        useIndex: 'idx_places_status',
        orderBy: 'mention_count DESC, p.name ASC',
        limit,
        offset,
        cacheHint: true
      }
    );
  },

  /**
   * Search across all entities with full-text search
   */
  searchEntities: (searchTerm: string, limit = 20) => {
    const sanitizedTerm = searchTerm.replace(/['"\\]/g, '');
    
    return queryOptimizer.buildOptimizedQuery(
      `(SELECT 'person' as type, id, name, slug, description, NULL as address
        FROM people 
        WHERE MATCH(name, description) AGAINST('${sanitizedTerm}' IN BOOLEAN MODE)
        AND status = 'active')
       UNION ALL
       (SELECT 'place' as type, id, name, slug, description, address
        FROM places 
        WHERE MATCH(name, description, address) AGAINST('${sanitizedTerm}' IN BOOLEAN MODE)
        AND status = 'active')
       UNION ALL
       (SELECT 'business' as type, id, name, slug, description, address
        FROM businesses 
        WHERE MATCH(name, description, address) AGAINST('${sanitizedTerm}' IN BOOLEAN MODE)
        AND status = 'active')`,
      {
        orderBy: 'type, name',
        limit,
        cacheHint: false // Don't cache searches
      }
    );
  },

  /**
   * Get entity mentions with story context
   */
  getEntityMentions: (entityId: string, entityType: string) => {
    return queryOptimizer.buildOptimizedQuery(
      `SELECT em.story_slug, s.title, s.published_at, em.context
       FROM entity_mentions em
       JOIN stories s ON em.story_slug = s.slug
       WHERE em.entity_id = ? AND em.entity_type = ? AND s.status = 'published'`,
      {
        useIndex: 'idx_entity_mentions_entity',
        orderBy: 's.published_at DESC',
        limit: 10,
        cacheHint: true
      }
    );
  }
};

console.log('🚀 Database Query Optimizer loaded');