/**
 * TRINITI Memory System Types
 *
 * Comprehensive type definitions for the memory management system
 */

export interface MemoryEntry {
  id: string;           // Unique identifier
  timestamp: number;    // Execution timestamp
  task: string;         // Original task description
  result: unknown;      // Task execution result
  metadata: {
    success: boolean;   // Task completion status
    duration: number;   // Execution time in milliseconds
    errors: string[];   // Any encountered errors
    tags?: string[];    // Optional categorization tags
    priority?: number;  // Task priority level (1-10)
  };
}

export interface MemorySearchOptions {
  query?: string;
  includeErrors?: boolean;
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  limit?: number;
  sortBy?: 'timestamp' | 'duration' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface MemoryCapabilities {
  storageLimit: number;
  maxEntrySize: number;
  supportedFormats: string[];
  features: string[];
}

export interface MemoryStats {
  totalEntries: number;
  successfulTasks: number;
  failedTasks: number;
  averageDuration: number;
  storageUsage: number; // Percentage of capacity used
  mostCommonTags: Array<{ tag: string; count: number }>;
}

export interface MemorySearchResult {
  entries: MemoryEntry[];
  totalCount: number;
  searchTime: number;
  suggestions?: string[];
}

export interface MemoryPattern {
  commonTasks: Array<{ task: string; count: number; avgDuration: number }>;
  timePatterns: Array<{ hour: number; count: number; successRate: number }>;
  tagPatterns: Array<{ tag: string; count: number; avgDuration: number }>;
}

export interface MemoryExport {
  version: string;
  timestamp: number;
  entries: MemoryEntry[];
  metadata: {
    totalEntries: number;
    exportDate: string;
  };
}

export interface MemoryImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  warnings: string[];
}
