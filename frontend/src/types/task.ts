/**
 * TRINITI Task Execution Types
 *
 * TypeScript interfaces for the task execution system
 */

export interface TaskExecutionRequest {
  task: string;
  timestamp?: number;
}

export interface TaskExecutionResponse {
  id: string;
  task: string;
  result: any;
  success: boolean;
  executionTime: number;
  timestamp: number;
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
  type: 'greeting' | 'file_operation' | 'list_operation' | 'search_operation' | 'git_operation' | 'code_generation' | 'general';
  message?: string;
  action?: string;
  filename?: string;
  path?: string;
  files?: string[];
  count?: number;
  query?: string;
  results?: Array<{ file: string; line: number; match: string }>;
  command?: string;
  output?: string;
  branch?: string;
  language?: string;
  code?: string;
  raw_output?: string;
  status: 'completed' | 'failed' | 'pending';
  timestamp?: string;
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
