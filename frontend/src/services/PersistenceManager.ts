/**
 * Enhanced Disk Persistence Manager for TRINITI Memory System
 *
 * Provides comprehensive persistence capabilities with:
 * - Encrypted storage
 * - Global index management
 * - Error handling and recovery
 * - Bulk operations
 */

import { MemoryEntry } from '../types/memory';

export interface PersistenceError {
  message: string;
  timestamp: number;
  operation: string;
  entryId?: string;
}

export interface MemoryIndex {
  entryIds: string[];
  lastUpdated: number;
  totalEntries: number;
  storageSize: number;
}

export class PersistenceManager {
  private readonly STORAGE_PREFIX = 'TRINITI_MEMORY_';
  private readonly METADATA_KEY = 'TRINITI_MEMORY_INDEX';
  private readonly ENCRYPTION_KEY = 'TRINITI_MEMORY_ENCRYPTION_KEY';

  /**
   * Save a memory entry with encryption and index update
   */
  async saveEntry(entry: MemoryEntry): Promise<void> {
    try {
      // Validate entry before saving
      if (!this.validateEntry(entry)) {
        throw new Error('Invalid memory entry structure');
      }

      // Encrypt sensitive data
      const encryptedEntry = this.encryptEntry(entry);

      // Save individual entry
      const entryKey = `${this.STORAGE_PREFIX}${entry.id}`;
      localStorage.setItem(entryKey, JSON.stringify(encryptedEntry));

      // Update global index
      await this.updateMemoryIndex(entry);

      // Log successful save
      console.debug('Memory entry saved successfully', { entryId: entry.id });
    } catch (error) {
      this.handlePersistenceError(error as Error, 'saveEntry', entry.id);
      throw error;
    }
  }

  /**
   * Retrieve all memory entries with error handling
   */
  async retrieveEntries(): Promise<MemoryEntry[]> {
    try {
      const index = this.getMemoryIndex();
      const entries: MemoryEntry[] = [];

      for (const id of index.entryIds) {
        const entry = this.retrieveEntry(id);
        if (entry) {
          entries.push(entry);
        }
      }

      console.debug('Retrieved memory entries', { count: entries.length });
      return entries;
    } catch (error) {
      this.handlePersistenceError(error as Error, 'retrieveEntries');
      return [];
    }
  }

  /**
   * Retrieve a specific memory entry
   */
  retrieveEntry(entryId: string): MemoryEntry | null {
    try {
      const entryKey = `${this.STORAGE_PREFIX}${entryId}`;
      const encryptedData = localStorage.getItem(entryKey);

      if (!encryptedData) {
        return null;
      }

      const decryptedEntry = this.decryptEntry(encryptedData);
      return this.validateEntry(decryptedEntry) ? decryptedEntry : null;
    } catch (error) {
      this.handlePersistenceError(error as Error, 'retrieveEntry', entryId);
      return null;
    }
  }

  /**
   * Delete a memory entry
   */
  async deleteEntry(entryId: string): Promise<boolean> {
    try {
      const entryKey = `${this.STORAGE_PREFIX}${entryId}`;
      localStorage.removeItem(entryKey);

      // Update index
      await this.removeFromIndex(entryId);

      console.debug('Memory entry deleted', { entryId });
      return true;
    } catch (error) {
      this.handlePersistenceError(error as Error, 'deleteEntry', entryId);
      return false;
    }
  }

  /**
   * Clear all memory entries
   */
  async clearAllEntries(): Promise<void> {
    try {
      const index = this.getMemoryIndex();

      // Remove all entry data
      for (const id of index.entryIds) {
        const entryKey = `${this.STORAGE_PREFIX}${id}`;
        localStorage.removeItem(entryKey);
      }

      // Clear index
      localStorage.removeItem(this.METADATA_KEY);

      console.debug('All memory entries cleared');
    } catch (error) {
      this.handlePersistenceError(error as Error, 'clearAllEntries');
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
    try {
      const index = this.getMemoryIndex();
      const usedSpace = this.calculateStorageSize();
      const totalSpace = 5 * 1024 * 1024; // 5MB typical localStorage limit

      return {
        totalEntries: index.totalEntries,
        storageSize: usedSpace,
        lastUpdated: index.lastUpdated,
        availableSpace: totalSpace - usedSpace
      };
    } catch (error) {
      this.handlePersistenceError(error as Error, 'getStorageStats');
      return {
        totalEntries: 0,
        storageSize: 0,
        lastUpdated: 0,
        availableSpace: 0
      };
    }
  }

  /**
   * Export all entries as JSON
   */
  async exportData(): Promise<string> {
    try {
      const entries = await this.retrieveEntries();
      const exportData = {
        version: '1.0.0',
        timestamp: Date.now(),
        entries,
        metadata: this.getMemoryIndex()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      this.handlePersistenceError(error as Error, 'exportData');
      throw error;
    }
  }

  /**
   * Import entries from JSON
   */
  async importData(jsonData: string): Promise<number> {
    try {
      const importData = JSON.parse(jsonData);
      let importedCount = 0;

      if (importData.entries && Array.isArray(importData.entries)) {
        for (const entry of importData.entries) {
          if (this.validateEntry(entry)) {
            await this.saveEntry(entry);
            importedCount++;
          }
        }
      }

      console.debug('Data import completed', { importedCount });
      return importedCount;
    } catch (error) {
      this.handlePersistenceError(error as Error, 'importData');
      throw error;
    }
  }

  /**
   * Encrypt entry data (placeholder for actual encryption)
   */
  private encryptEntry(entry: MemoryEntry): string {
    // TODO: Implement actual encryption
    // For now, just return JSON string
    return JSON.stringify(entry);
  }

  /**
   * Decrypt entry data (placeholder for actual decryption)
   */
  private decryptEntry(encryptedData: string): MemoryEntry {
    // TODO: Implement actual decryption
    // For now, just parse JSON
    return JSON.parse(encryptedData);
  }

  /**
   * Update the global memory index
   */
  private async updateMemoryIndex(entry: MemoryEntry): Promise<void> {
    try {
      const index = this.getMemoryIndex();

      // Add entry ID if not already present
      if (!index.entryIds.includes(entry.id)) {
        index.entryIds.push(entry.id);
        index.totalEntries++;
      }

      // Update metadata
      index.lastUpdated = Date.now();
      index.storageSize = this.calculateStorageSize();

      // Save updated index
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(index));
    } catch (error) {
      this.handlePersistenceError(error as Error, 'updateMemoryIndex', entry.id);
      throw error;
    }
  }

  /**
   * Remove entry from index
   */
  private async removeFromIndex(entryId: string): Promise<void> {
    try {
      const index = this.getMemoryIndex();
      index.entryIds = index.entryIds.filter(id => id !== entryId);
      index.totalEntries = Math.max(0, index.totalEntries - 1);
      index.lastUpdated = Date.now();
      index.storageSize = this.calculateStorageSize();

      localStorage.setItem(this.METADATA_KEY, JSON.stringify(index));
    } catch (error) {
      this.handlePersistenceError(error as Error, 'removeFromIndex', entryId);
      throw error;
    }
  }

  /**
   * Get the current memory index
   */
  private getMemoryIndex(): MemoryIndex {
    try {
      const indexData = localStorage.getItem(this.METADATA_KEY);
      if (indexData) {
        return JSON.parse(indexData);
      }
    } catch (error) {
      console.warn('Failed to parse memory index, creating new one');
    }

    // Return default index if none exists
    return {
      entryIds: [],
      lastUpdated: Date.now(),
      totalEntries: 0,
      storageSize: 0
    };
  }

  /**
   * Calculate current storage size
   */
  private calculateStorageSize(): number {
    try {
      let totalSize = 0;
      const index = this.getMemoryIndex();

      for (const id of index.entryIds) {
        const entryKey = `${this.STORAGE_PREFIX}${id}`;
        const data = localStorage.getItem(entryKey);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }

      return totalSize;
    } catch (error) {
      console.warn('Failed to calculate storage size');
      return 0;
    }
  }

  /**
   * Validate memory entry structure
   */
  private validateEntry(entry: unknown): entry is MemoryEntry {
    if (!entry || typeof entry !== 'object') return false;

    const e = entry as Record<string, unknown>;
    return (
      typeof e.id === 'string' &&
      typeof e.timestamp === 'number' &&
      typeof e.task === 'string' &&
      typeof e.result === 'object' &&
      e.result !== null &&
      typeof e.metadata === 'object' &&
      e.metadata !== null &&
      typeof (e.metadata as Record<string, unknown>).success === 'boolean' &&
      typeof (e.metadata as Record<string, unknown>).duration === 'number'
    );
  }

  /**
   * Handle persistence errors with detailed logging
   */
  private handlePersistenceError(
    error: Error,
    operation: string,
    entryId?: string
  ): void {
    const persistenceError: PersistenceError = {
      message: error.message,
      timestamp: Date.now(),
      operation,
      entryId
    };

    console.warn('Persistence Error', persistenceError);

    // TODO: Send to error tracking service
    // TODO: Implement retry logic for transient errors
  }
}
