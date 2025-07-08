/**
 * React Hook for TRINITI Memory System
 *
 * Provides easy access to the memory system with automatic state management
 * and real-time updates for React components.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TRINITIMemorySystem } from '../services/TRINITIMemorySystem';
import { MemoryEntry, MemorySearchOptions, MemoryStats } from '../types/memory';

// Global memory system instance
let memorySystemInstance: TRINITIMemorySystem | null = null;

const getMemorySystem = (): TRINITIMemorySystem => {
  if (!memorySystemInstance) {
    memorySystemInstance = new TRINITIMemorySystem();
  }
  return memorySystemInstance;
};

export const useMemorySystem = () => {
  const [memorySystem] = useState(() => getMemorySystem());
  const [recentTasks, setRecentTasks] = useState<MemoryEntry[]>([]);
  const [stats, setStats] = useState<MemoryStats>(memorySystem.getStats());
  const [isLoading, setIsLoading] = useState(false);

  // Update recent tasks and stats
  const refreshData = useCallback(() => {
    setRecentTasks(memorySystem.getRecentTasks(10));
    setStats(memorySystem.getStats());
  }, [memorySystem]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Record a new task
  const recordTask = useCallback((
    task: string,
    result: unknown,
    options?: {
      success?: boolean;
      tags?: string[];
      priority?: number;
      duration?: number;
    }
  ) => {
    setIsLoading(true);
    try {
      const id = memorySystem.recordTask(task, result, options);
      refreshData();
      return id;
    } finally {
      setIsLoading(false);
    }
  }, [memorySystem, refreshData]);

  // Search tasks
  const searchTasks = useCallback((
    query: string,
    options?: MemorySearchOptions
  ): MemoryEntry[] => {
    const searchResult = memorySystem.search(options);
    return searchResult.entries;
  }, [memorySystem]);

  // Get a specific entry
  const getEntry = useCallback((id: string): MemoryEntry | undefined => {
    const entries = memorySystem.getRecentTasks(1000); // Get all entries
    return entries.find(entry => entry.id === id);
  }, [memorySystem]);

  // Delete an entry
  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    const deleted = await memorySystem.deleteEntry(id);
    if (deleted) {
      refreshData();
    }
    return deleted;
  }, [memorySystem, refreshData]);

  // Clear all entries
  const clearAll = useCallback(async () => {
    await memorySystem.clearAll();
    refreshData();
  }, [memorySystem, refreshData]);

  // Export data
  const exportData = useCallback(async (): Promise<string> => {
    return await memorySystem.exportData();
  }, [memorySystem]);

  // Import data
  const importData = useCallback(async (jsonData: string) => {
    await memorySystem.importData(jsonData);
    refreshData();
  }, [memorySystem, refreshData]);

  // Get capabilities
  const capabilities = useMemo(() => memorySystem.getCapabilities(), [memorySystem]);

  return {
    // State
    recentTasks,
    stats,
    isLoading,
    capabilities,

    // Actions
    recordTask,
    searchTasks,
    getEntry,
    deleteEntry,
    clearAll,
    exportData,
    importData,
    refreshData,
  };
};

// Specialized hooks for common use cases

export const useRecentTasks = (limit: number = 10) => {
  const { recentTasks, refreshData } = useMemorySystem();
  const [tasks, setTasks] = useState<MemoryEntry[]>([]);

  useEffect(() => {
    const memorySystem = getMemorySystem();
    setTasks(memorySystem.getRecentTasks(limit));
  }, [limit, recentTasks]);

  return { tasks, refreshData };
};

export const useTaskSearch = () => {
  const { searchTasks } = useMemorySystem();
  const [searchResults, setSearchResults] = useState<MemoryEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback((
    query: string,
    options?: MemorySearchOptions
  ) => {
    setIsSearching(true);
    try {
      const results = searchTasks(query, options);
      setSearchResults(results);
      return results;
    } finally {
      setIsSearching(false);
    }
  }, [searchTasks]);

  return {
    searchResults,
    isSearching,
    performSearch,
  };
};

export const useMemoryStats = () => {
  const { stats, refreshData } = useMemorySystem();

  return {
    stats,
    refreshData,
  };
};
