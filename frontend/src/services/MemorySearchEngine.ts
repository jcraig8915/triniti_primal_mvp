/**
 * Advanced Memory Search Engine for TRINITI Memory System
 *
 * Provides sophisticated search capabilities including:
 * - Multi-dimensional search with filters
 * - Intelligent task similarity matching
 * - Time-based filtering
 * - Success/failure filtering
 * - Fuzzy text matching
 */

import { MemoryEntry, MemorySearchOptions } from '../types/memory';

export interface SearchOptions {
  query?: string;
  timeframe?: {
    start?: number;
    end?: number;
  };
  successOnly?: boolean;
  tags?: string[];
  minDuration?: number;
  maxDuration?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'duration' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface SimilarityResult {
  entry: MemoryEntry;
  similarity: number;
  matchedTerms: string[];
}

export interface SearchResult {
  entries: MemoryEntry[];
  totalCount: number;
  searchTime: number;
  filters: SearchOptions;
  suggestions?: string[];
}

export class MemorySearchEngine {
  private memoryEntries: MemoryEntry[];
  private searchIndex: Map<string, Set<string>>;
  private tagIndex: Map<string, Set<string>>;

  constructor(entries: MemoryEntry[]) {
    this.memoryEntries = entries;
    this.searchIndex = new Map();
    this.tagIndex = new Map();
    this.buildSearchIndex();
  }

  /**
   * Multi-dimensional search with advanced filtering
   */
  search(options: SearchOptions): SearchResult {
    const startTime = performance.now();

    try {
      let results = this.memoryEntries.filter(entry => {
        // Text query matching
        const textMatch = !options.query || this.matchesTextQuery(entry, options.query);

        // Timeframe filtering
        const timeframeMatch = this.matchTimeframe(entry, options.timeframe);

        // Success/failure filtering
        const successMatch = options.successOnly === undefined ||
          entry.metadata.success === options.successOnly;

        // Tag filtering
        const tagMatch = !options.tags || options.tags.length === 0 ||
          this.matchTags(entry, options.tags);

        // Duration filtering
        const durationMatch = this.matchDuration(entry, options.minDuration, options.maxDuration);

        return textMatch && timeframeMatch && successMatch && tagMatch && durationMatch;
      });

      // Apply sorting
      results = this.sortResults(results, options.sortBy, options.sortOrder);

      // Apply limit
      if (options.limit && options.limit > 0) {
        results = results.slice(0, options.limit);
      }

      const searchTime = performance.now() - startTime;

      return {
        entries: results,
        totalCount: results.length,
        searchTime,
        filters: options,
        suggestions: this.generateSuggestions(options.query)
      };
    } catch (error) {
      console.error('Search operation failed', error);
      return {
        entries: [],
        totalCount: 0,
        searchTime: performance.now() - startTime,
        filters: options
      };
    }
  }

  /**
   * Find similar tasks using intelligent similarity matching
   */
  findSimilarTasks(
    task: string,
    threshold: number = 0.7,
    limit: number = 10
  ): SimilarityResult[] {
    const results: SimilarityResult[] = [];

    for (const entry of this.memoryEntries) {
      const similarity = this.calculateSimilarity(entry.task, task);

      if (similarity >= threshold) {
        const matchedTerms = this.findMatchedTerms(entry.task, task);
        results.push({
          entry,
          similarity,
          matchedTerms
        });
      }
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, limit);
  }

  /**
   * Search for patterns in task execution
   */
  findPatterns(): {
    commonTasks: Array<{ task: string; count: number; avgDuration: number }>;
    timePatterns: Array<{ hour: number; count: number; successRate: number }>;
    tagPatterns: Array<{ tag: string; count: number; avgDuration: number }>;
  } {
    const commonTasks = this.findCommonTasks();
    const timePatterns = this.findTimePatterns();
    const tagPatterns = this.findTagPatterns();

    return {
      commonTasks,
      timePatterns,
      tagPatterns
    };
  }

  /**
   * Get search suggestions based on query
   */
  getSuggestions(query: string): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Find matching tasks
    for (const entry of this.memoryEntries) {
      if (entry.task.toLowerCase().includes(queryLower)) {
        suggestions.add(entry.task);
      }
    }

    // Find matching tags
    for (const entry of this.memoryEntries) {
      if (entry.metadata.tags) {
        for (const tag of entry.metadata.tags) {
          if (tag.toLowerCase().includes(queryLower)) {
            suggestions.add(tag);
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Update search engine with new entries
   */
  updateEntries(entries: MemoryEntry[]): void {
    this.memoryEntries = entries;
    this.buildSearchIndex();
  }

  /**
   * Check if entry matches text query
   */
  private matchesTextQuery(entry: MemoryEntry, query: string): boolean {
    const queryLower = query.toLowerCase();

    // Check task description
    if (entry.task.toLowerCase().includes(queryLower)) {
      return true;
    }

    // Check result content
    if (this.searchInResult(entry.result, queryLower)) {
      return true;
    }

    // Check tags
    if (entry.metadata.tags) {
      for (const tag of entry.metadata.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if entry matches timeframe
   */
  private matchTimeframe(
    entry: MemoryEntry,
    timeframe?: { start?: number; end?: number }
  ): boolean {
    if (!timeframe) return true;

    const { start, end } = timeframe;
    return (!start || entry.timestamp >= start) &&
           (!end || entry.timestamp <= end);
  }

  /**
   * Check if entry matches tag requirements
   */
  private matchTags(entry: MemoryEntry, requiredTags: string[]): boolean {
    if (!entry.metadata.tags) return false;

    return requiredTags.every(tag =>
      entry.metadata.tags!.includes(tag)
    );
  }

  /**
   * Check if entry matches duration requirements
   */
  private matchDuration(
    entry: MemoryEntry,
    minDuration?: number,
    maxDuration?: number
  ): boolean {
    const duration = entry.metadata.duration;

    if (minDuration && duration < minDuration) return false;
    if (maxDuration && duration > maxDuration) return false;

    return true;
  }

  /**
   * Sort results based on criteria
   */
  private sortResults(
    results: MemoryEntry[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): MemoryEntry[] {
    if (!sortBy) return results;

    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'timestamp':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'duration':
          comparison = a.metadata.duration - b.metadata.duration;
          break;
        case 'relevance':
          // For relevance, we'll use a simple heuristic
          comparison = b.metadata.success ? 1 : -1;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Calculate similarity between two strings using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const editDistance = this.levenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase()
    );
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (editDistance / maxLength);
  }

  /**
   * Find matched terms between two strings
   */
  private findMatchedTerms(str1: string, str2: string): string[] {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    const matched: string[] = [];

    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2 && word1.length > 2) {
          matched.push(word1);
        }
      }
    }

    return [...new Set(matched)];
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length, n = s2.length;
    const dp: number[][] = Array.from(
      { length: m + 1 },
      () => new Array(n + 1).fill(0)
    );

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return dp[m][n];
  }

  /**
   * Search within result object
   */
  private searchInResult(result: unknown, query: string): boolean {
    if (typeof result === 'string') {
      return result.toLowerCase().includes(query);
    }

    if (typeof result === 'object' && result !== null) {
      const resultStr = JSON.stringify(result).toLowerCase();
      return resultStr.includes(query);
    }

    return false;
  }

  /**
   * Generate search suggestions
   */
  private generateSuggestions(query?: string): string[] {
    if (!query) return [];
    return this.getSuggestions(query);
  }

  /**
   * Build search index for performance
   */
  private buildSearchIndex(): void {
    this.searchIndex.clear();
    this.tagIndex.clear();

    for (const entry of this.memoryEntries) {
      // Index task words
      const words = entry.task.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 2) {
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set());
          }
          this.searchIndex.get(word)!.add(entry.id);
        }
      }

      // Index tags
      if (entry.metadata.tags) {
        for (const tag of entry.metadata.tags) {
          if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
          }
          this.tagIndex.get(tag)!.add(entry.id);
        }
      }
    }
  }

  /**
   * Find common tasks
   */
  private findCommonTasks(): Array<{ task: string; count: number; avgDuration: number }> {
    const taskMap = new Map<string, { count: number; totalDuration: number }>();

    for (const entry of this.memoryEntries) {
      const task = entry.task;
      const existing = taskMap.get(task);

      if (existing) {
        existing.count++;
        existing.totalDuration += entry.metadata.duration;
      } else {
        taskMap.set(task, { count: 1, totalDuration: entry.metadata.duration });
      }
    }

    return Array.from(taskMap.entries())
      .map(([task, { count, totalDuration }]) => ({
        task,
        count,
        avgDuration: totalDuration / count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Find time patterns
   */
  private findTimePatterns(): Array<{ hour: number; count: number; successRate: number }> {
    const hourMap = new Map<number, { count: number; successCount: number }>();

    for (const entry of this.memoryEntries) {
      const hour = new Date(entry.timestamp).getHours();
      const existing = hourMap.get(hour);

      if (existing) {
        existing.count++;
        if (entry.metadata.success) existing.successCount++;
      } else {
        hourMap.set(hour, {
          count: 1,
          successCount: entry.metadata.success ? 1 : 0
        });
      }
    }

    return Array.from(hourMap.entries())
      .map(([hour, { count, successCount }]) => ({
        hour,
        count,
        successRate: successCount / count
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Find tag patterns
   */
  private findTagPatterns(): Array<{ tag: string; count: number; avgDuration: number }> {
    const tagMap = new Map<string, { count: number; totalDuration: number }>();

    for (const entry of this.memoryEntries) {
      if (entry.metadata.tags) {
        for (const tag of entry.metadata.tags) {
          const existing = tagMap.get(tag);

          if (existing) {
            existing.count++;
            existing.totalDuration += entry.metadata.duration;
          } else {
            tagMap.set(tag, { count: 1, totalDuration: entry.metadata.duration });
          }
        }
      }
    }

    return Array.from(tagMap.entries())
      .map(([tag, { count, totalDuration }]) => ({
        tag,
        count,
        avgDuration: totalDuration / count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
