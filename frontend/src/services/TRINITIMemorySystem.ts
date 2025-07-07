/**
 * TRINITI Memory System
 *
 * A comprehensive memory management system for tracking task executions,
 * results, and metadata with persistence and search capabilities.
 */

import {
  MemoryEntry,
  MemorySearchOptions,
  MemoryCapabilities,
  MemoryStats
} from '../types/memory';
import { safeguardString, safeguardNumber, safeguardBoolean } from '../utils/defensive-programming';

export class TRINITIMemorySystem {
  private storage: Map<string, MemoryEntry> = new Map();
  private readonly MAX_ENTRIES = 1000;
  private readonly STORAGE_KEY_PREFIX = 'triniti_memory_';
  private readonly STATS_KEY = 'triniti_memory_stats';

  // Memory system capabilities
  public readonly capabilities: MemoryCapabilities = {
    storageLimit: this.MAX_ENTRIES,
    persistenceSupport: true,
    searchCapability: true,
    metadataTracking: true,
    tagSupport: true,
    prioritySupport: true
  };

  constructor() {
    this.loadFromDisk();
    this.initializeStats();
  }

  /**
   * Record a new task execution
   */
  public record(
    task: string,
    result: unknown,
    options?: {
      success?: boolean;
      tags?: string[];
      priority?: number;
      duration?: number;
    }
  ): string {
    const startTime = performance.now();

    const entry: MemoryEntry = {
      id: this.generateUniqueId(),
      timestamp: Date.now(),
      task: safeguardString(task, ''),
      result,
      metadata: {
        success: safeguardBoolean(options?.success, true),
        duration: safeguardNumber(options?.duration, 0),
        errors: this.extractErrors(result),
        tags: options?.tags || [],
        priority: safeguardNumber(options?.priority, 5)
      }
    };

    // Measure actual execution time if not provided
    if (!options?.duration) {
      entry.metadata.duration = performance.now() - startTime;
    }

    this.prune();
    this.storage.set(entry.id, entry);
    this.persistToDisk(entry);
    this.updateStats(entry);

    return entry.id;
  }

  /**
   * Retrieve recent memory entries
   */
  public getRecentTasks(limit: number = 10): MemoryEntry[] {
    const safeLimit = safeguardNumber(limit, 10);
    return Array.from(this.storage.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, safeLimit);
  }

  /**
   * Find tasks by partial match with advanced search options
   */
  public searchTasks(query: string, options?: MemorySearchOptions): MemoryEntry[] {
    const safeQuery = safeguardString(query, '');
    let results = Array.from(this.storage.values());

    // Text search
    if (safeQuery) {
      results = results.filter(entry =>
        entry.task.toLowerCase().includes(safeQuery.toLowerCase()) ||
        this.searchInResult(entry.result, safeQuery)
      );
    }

    // Filter by success status
    if (options?.includeErrors === false) {
      results = results.filter(entry => entry.metadata.success);
    }

    // Filter by tags
    if (options?.tags && options.tags.length > 0) {
      results = results.filter(entry =>
        options.tags!.some(tag => entry.metadata.tags?.includes(tag))
      );
    }

    // Filter by date range
    if (options?.dateRange) {
      results = results.filter(entry =>
        entry.timestamp >= options.dateRange!.start &&
        entry.timestamp <= options.dateRange!.end
      );
    }

    // Sort by timestamp and limit results
    const limit = safeguardNumber(options?.limit, results.length);
    return results
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get memory statistics
   */
  public getStats(): MemoryStats {
    const entries = Array.from(this.storage.values());
    const successfulTasks = entries.filter(entry => entry.metadata.success).length;
    const failedTasks = entries.length - successfulTasks;

    const totalDuration = entries.reduce((sum, entry) => sum + entry.metadata.duration, 0);
    const averageDuration = entries.length > 0 ? totalDuration / entries.length : 0;

    // Calculate most common tags
    const tagCounts = new Map<string, number>();
    entries.forEach(entry => {
      entry.metadata.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const mostCommonTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEntries: entries.length,
      successfulTasks,
      failedTasks,
      averageDuration,
      mostCommonTags,
      storageUsage: (entries.length / this.MAX_ENTRIES) * 100
    };
  }

  /**
   * Get a specific memory entry by ID
   */
  public getEntry(id: string): MemoryEntry | undefined {
    return this.storage.get(safeguardString(id, ''));
  }

  /**
   * Delete a memory entry
   */
  public deleteEntry(id: string): boolean {
    const safeId = safeguardString(id, '');
    const deleted = this.storage.delete(safeId);
    if (deleted) {
      this.removeFromDisk(safeId);
      this.updateStats();
    }
    return deleted;
  }

  /**
   * Clear all memory entries
   */
  public clear(): void {
    this.storage.clear();
    this.clearFromDisk();
    this.initializeStats();
  }

  /**
   * Export memory data
   */
  public export(): MemoryEntry[] {
    return Array.from(this.storage.values());
  }

  /**
   * Import memory data
   */
  public import(entries: MemoryEntry[]): void {
    entries.forEach(entry => {
      if (this.validateEntry(entry)) {
        this.storage.set(entry.id, entry);
        this.persistToDisk(entry);
      }
    });
    this.updateStats();
  }

  // Private helper methods

  private prune(): void {
    if (this.storage.size >= this.MAX_ENTRIES) {
      const entries = Array.from(this.storage.entries());
      const oldestEntry = entries.reduce((oldest, current) =>
        current[1].timestamp < oldest[1].timestamp ? current : oldest
      );

      if (oldestEntry) {
        this.storage.delete(oldestEntry[0]);
        this.removeFromDisk(oldestEntry[0]);
      }
    }
  }

  private generateUniqueId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractErrors(result: unknown): string[] {
    if (result instanceof Error) {
      return [result.message];
    }

    if (typeof result === 'object' && result !== null) {
      const errorKeys = ['error', 'errors', 'message', 'msg'];
      const errors: string[] = [];

      errorKeys.forEach(key => {
        if (key in result && typeof (result as any)[key] === 'string') {
          errors.push((result as any)[key]);
        }
      });

      return errors;
    }

    return [];
  }

  private searchInResult(result: unknown, query: string): boolean {
    if (typeof result === 'string') {
      return result.toLowerCase().includes(query.toLowerCase());
    }

    if (typeof result === 'object' && result !== null) {
      const resultStr = JSON.stringify(result).toLowerCase();
      return resultStr.includes(query.toLowerCase());
    }

    return false;
  }

  private persistToDisk(entry: MemoryEntry): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}${entry.id}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('TRINITI.MEMORY_PERSISTENCE_FAILED', error);
    }
  }

  private removeFromDisk(id: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}${id}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('TRINITI.MEMORY_REMOVAL_FAILED', error);
    }
  }

  private loadFromDisk(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.STORAGE_KEY_PREFIX))
        .forEach(key => {
          try {
            const entry = JSON.parse(localStorage.getItem(key)!);
            if (this.validateEntry(entry)) {
              this.storage.set(entry.id, entry);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('TRINITI.MEMORY_LOAD_FAILED', key, error);
            localStorage.removeItem(key);
          }
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('TRINITI.MEMORY_BULK_LOAD_FAILED', error);
    }
  }

  private clearFromDisk(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.STORAGE_KEY_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('TRINITI.MEMORY_CLEAR_FAILED', error);
    }
  }

  private validateEntry(entry: unknown): entry is MemoryEntry {
    if (!entry || typeof entry !== 'object') return false;

    const e = entry as any;
    return (
      typeof e.id === 'string' &&
      typeof e.timestamp === 'number' &&
      typeof e.task === 'string' &&
      typeof e.metadata === 'object' &&
      typeof e.metadata.success === 'boolean' &&
      typeof e.metadata.duration === 'number'
    );
  }

  private initializeStats(): void {
    this.updateStats();
  }

  private updateStats(entry?: MemoryEntry): void {
    // Stats are calculated on-demand, so we don't need to store them
    // This method can be used for future optimizations
  }
}
