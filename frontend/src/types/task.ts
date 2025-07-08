/**
 * TRINITI Task Execution Types
 *
 * TypeScript interfaces for the task execution system
 */

export interface TaskExecutionRequest {
  command: string;
  metadata?: Record<string, any>;
  timeout?: number;
}

export interface TaskExecutionResponse {
  id: string;
  success: boolean;
  result: any;
  execution_time: number;
  timestamp: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface TaskHistoryResponse {
  tasks: TaskExecutionResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface TaskStatistics {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  successRate: number;
  averageExecutionTime: number;
  mostCommonTags: Array<{ tag: string; count: number }>;
}

export interface TaskResult {
  success: boolean;
  output: string;
  error?: string;
}

export interface TaskMetadata {
  success: boolean;
  duration: number;
  errors: string[];
  tags: string[];
  priority: number;
  taskId?: string;
  type?: string;
}

export interface TaskExecutionOptions {
  timeout?: number;
  retryCount?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface TaskExecutionError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface TaskExecutionCapabilities {
  supportedTaskTypes: string[];
  maxConcurrentTasks: number;
  maxTaskTimeout: number;
  supportsRetry: boolean;
  supportsPriority: boolean;
  supportsTags: boolean;
}

export interface TaskExecutionMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  lastExecutionTime: number;
  peakConcurrentTasks: number;
  currentConcurrentTasks: number;
}

export interface TaskExecutionConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableMemoryIntegration: boolean;
}

/**
 * TRINITI Task Types
 * Core interfaces for task command routing and execution results
 */

export interface TaskCommand {
  raw: string;          // Actual executable command
  description: string;  // Original natural language description
}
