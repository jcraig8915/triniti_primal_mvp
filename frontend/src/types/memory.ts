/**
 * TRINITI Memory System Types
 *
 * Defines the core interfaces and types for the memory management system
 * that tracks task executions, results, and metadata.
 */

export interface MemoryEntry {
  id: string;           // Unique identifier
  timestamp: number;    // Execution timestamp
  task: string;         // Original task description
  result: unknown;      // Task execution result
  metadata: {
    success: boolean;   // Task completion status
    duration: number;   // Execution time in milliseconds
    errors?: string[];  // Any encountered errors
    tags?: string[];    // Optional categorization tags
    priority?: number;  // Task priority level (1-10)
  };
}

export interface MemorySearchOptions {
  limit?: number;       // Maximum number of results
  includeErrors?: boolean; // Include failed tasks
  tags?: string[];      // Filter by tags
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface MemoryCapabilities {
  storageLimit: number;
  persistenceSupport: boolean;
  searchCapability: boolean;
  metadataTracking: boolean;
  tagSupport: boolean;
  prioritySupport: boolean;
}

export interface MemoryStats {
  totalEntries: number;
  successfulTasks: number;
  failedTasks: number;
  averageDuration: number;
  mostCommonTags: Array<{ tag: string; count: number }>;
  storageUsage: number; // Percentage of capacity used
}
