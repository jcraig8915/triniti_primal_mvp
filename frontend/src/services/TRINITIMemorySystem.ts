/**
 * TRINITI Memory System - Enhanced Version
 *
 * A comprehensive memory management system for AI-assisted development
 * with advanced persistence, search, and pattern recognition capabilities.
 */

import { MemoryEntry, MemorySearchOptions, MemoryStats, MemoryCapabilities } from '../types/memory';
import { PersistenceManager } from './PersistenceManager';
import { MemorySearchEngine, SearchOptions, SimilarityResult } from './MemorySearchEngine';
import { safeguardString, safeguardNumber, safeguardBoolean } from '../utils/defensive-programming';

export class TRINITIMemorySystem {
  private entries: MemoryEntry[] = [];
  private persistenceManager: PersistenceManager;
  private searchEngine: MemorySearchEngine;
  private stats: MemoryStats;
  private capabilities: MemoryCapabilities;
  private isInitialized = false;

  constructor() {
    this.persistenceManager = new PersistenceManager();
    this.searchEngine = new MemorySearchEngine([]);
    this.stats = this.initializeStats();
    this.capabilities = this.initializeCapabilities();
  }

  /**
   * Initialize the memory system
   */
  async initialize(): Promise<void> {
    try {
      // Load existing entries from persistence
      this.entries = await this.persistenceManager.retrieveEntries();

      // Update search engine with loaded entries
      this.searchEngine.updateEntries(this.entries);

      // Update statistics
      this.updateStats();

      this.isInitialized = true;
      console.debug('TRINITI Memory System initialized', {
        entryCount: this.entries.length
      });
    } catch (error) {
      console.error('Failed to initialize TRINITI Memory System', error);
      throw error;
    }
  }

  /**
   * Record a new task execution
   */
  async recordTask(
    task: string,
    result: unknown,
    metadata: Partial<MemoryEntry['metadata']> = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = performance.now();

    try {
      const entry: MemoryEntry = {
        id: this.generateUniqueId(),
        timestamp: Date.now(),
        task: safeguardString(task, 'Unknown task'),
        result: result || {},
        metadata: {
          success: safeguardBoolean(metadata.success, true),
          duration: 0, // Will be calculated after task completion
          errors: Array.isArray(metadata.errors) ? metadata.errors : [],
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          priority: safeguardNumber(metadata.priority, 5)
        }
      };

      // Calculate duration
      entry.metadata.duration = performance.now() - startTime;

      // Validate entry
      if (!this.validateEntry(entry)) {
        throw new Error('Invalid memory entry structure');
      }

      // Save to persistence
      await this.persistenceManager.saveEntry(entry);

      // Add to memory
      this.entries.push(entry);
      this.searchEngine.updateEntries(this.entries);

      // Update statistics
      this.updateStats();

      console.debug('Task recorded successfully', {
        entryId: entry.id,
        task: entry.task
      });

      return entry.id;
    } catch (error) {
      console.error('Failed to record task', error);
      throw error;
    }
  }

  /**
   * Search for memory entries with advanced filtering
   */
  search(options: SearchOptions = {}): {
    entries: MemoryEntry[];
    totalCount: number;
    searchTime: number;
    suggestions?: string[];
  } {
    if (!this.isInitialized) {
      console.warn('Memory system not initialized, returning empty results');
      return { entries: [], totalCount: 0, searchTime: 0 };
    }

    return this.searchEngine.search(options);
  }

  /**
   * Find similar tasks using intelligent similarity matching
   */
  findSimilarTasks(
    task: string,
    threshold: number = 0.7,
    limit: number = 10
  ): SimilarityResult[] {
    if (!this.isInitialized) return [];

    return this.searchEngine.findSimilarTasks(task, threshold, limit);
  }

  /**
   * Get recent tasks
   */
  getRecentTasks(limit: number = 20): MemoryEntry[] {
    if (!this.isInitialized) return [];

    return this.entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Get system capabilities
   */
  getCapabilities(): MemoryCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Clear all memory entries
   */
  async clearAll(): Promise<void> {
    try {
      await this.persistenceManager.clearAllEntries();
      this.entries = [];
      this.searchEngine.updateEntries([]);
      this.updateStats();
      console.debug('All memory entries cleared');
    } catch (error) {
      console.error('Failed to clear memory entries', error);
      throw error;
    }
  }

  /**
   * Export all data
   */
  async exportData(): Promise<string> {
    return this.persistenceManager.exportData();
  }

  /**
   * Import data
   */
  async importData(jsonData: string): Promise<number> {
    try {
      const importCount = await this.persistenceManager.importData(jsonData);

      // Reload entries after import
      this.entries = await this.persistenceManager.retrieveEntries();
      this.searchEngine.updateEntries(this.entries);
      this.updateStats();

      return importCount;
    } catch (error) {
      console.error('Failed to import data', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalEntries: number;
    storageSize: number;
    lastUpdated: number;
    availableSpace: number;
  } {
    return this.persistenceManager.getStorageStats();
  }

  /**
   * Find patterns in task execution
   */
  findPatterns(): {
    commonTasks: Array<{ task: string; count: number; avgDuration: number }>;
    timePatterns: Array<{ hour: number; count: number; successRate: number }>;
    tagPatterns: Array<{ tag: string; count: number; avgDuration: number }>;
  } {
    if (!this.isInitialized) {
      return {
        commonTasks: [],
        timePatterns: [],
        tagPatterns: []
      };
    }

    return this.searchEngine.findPatterns();
  }

  /**
   * Get search suggestions
   */
  getSuggestions(query: string): string[] {
    if (!this.isInitialized) return [];
    return this.searchEngine.getSuggestions(query);
  }

  /**
   * Delete a specific entry
   */
  async deleteEntry(entryId: string): Promise<boolean> {
    try {
      const success = await this.persistenceManager.deleteEntry(entryId);
      if (success) {
        this.entries = this.entries.filter(entry => entry.id !== entryId);
        this.searchEngine.updateEntries(this.entries);
        this.updateStats();
      }
      return success;
    } catch (error) {
      console.error('Failed to delete entry', error);
      return false;
    }
  }

  /**
   * Generate a unique ID for memory entries
   */
  private generateUniqueId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract error information from a result object
   */
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

  /**
   * Search within a result object for matching text
   */
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

  /**
   * Validate a memory entry
   */
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

  /**
   * Update statistics based on current entries
   */
  private updateStats(): void {
    const successful = this.entries.filter(entry => entry.metadata.success);
    const failed = this.entries.filter(entry => !entry.metadata.success);

    this.stats = {
      totalEntries: this.entries.length,
      successfulTasks: successful.length,
      failedTasks: failed.length,
      averageDuration: this.entries.length > 0
        ? this.entries.reduce((sum, entry) => sum + entry.metadata.duration, 0) / this.entries.length
        : 0,
      storageUsage: (this.entries.length / this.capabilities.storageLimit) * 100,
      mostCommonTags: this.getMostCommonTags(this.entries)
    };
  }

  /**
   * Get most common tags from entries
   */
  private getMostCommonTags(entries: MemoryEntry[]): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();

    entries.forEach(entry => {
      if (entry.metadata.tags) {
        entry.metadata.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Initialize default statistics
   */
  private initializeStats(): MemoryStats {
    return {
      totalEntries: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageDuration: 0,
      storageUsage: 0,
      mostCommonTags: []
    };
  }

  /**
   * Initialize system capabilities
   */
  private initializeCapabilities(): MemoryCapabilities {
    return {
      storageLimit: 10000,
      maxEntrySize: 1024 * 1024, // 1MB
      supportedFormats: ['json', 'text'],
      features: ['persistence', 'search', 'patterns', 'similarity']
    };
  }
}
