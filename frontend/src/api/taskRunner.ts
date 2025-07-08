/**
 * TRINITI Task Runner API Client
 * Frontend API client for task execution with proper error handling and type safety
 */

import axios, { AxiosResponse } from 'axios';
import { runTask as runTaskNL, runRawCommand } from '../services/task_runner';
import { TaskResult } from '../types/task';

// API Configuration - Use Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL ||
                    import.meta.env.REACT_APP_API_URL ||
                    'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// Configure axios defaults
axios.defaults.timeout = API_TIMEOUT;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export interface TaskRequest {
  command: string;
  metadata?: Record<string, any>;
  timeout?: number;
}

export interface TaskResponse {
  id: string;
  success: boolean;
  result: any;
  execution_time: number;
  timestamp: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface TaskHistoryResponse {
  tasks: Array<{
    id: string;
    task: string;
    result: any;
    timestamp: number;
    metadata: any;
  }>;
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

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

/**
 * Execute a task via natural language processing
 */
export async function runTask(taskRequest: TaskRequest): Promise<TaskResult> {
  try {
    console.debug('Executing task with NL processing:', taskRequest.command);
    return await runTaskNL(taskRequest.command);
  } catch (error: any) {
    console.error('Task execution failed:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'Task execution failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Execute a raw command directly (bypassing NL processing)
 */
export async function runRawTask(taskRequest: TaskRequest): Promise<TaskResult> {
  try {
    console.debug('Executing raw command:', taskRequest.command);
    return await runRawCommand(taskRequest.command);
  } catch (error: any) {
    console.error('Raw task execution failed:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'Raw task execution failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Get task execution history
 */
export async function getTaskHistory(limit: number = 50, offset: number = 0): Promise<TaskHistoryResponse> {
  try {
    const response: AxiosResponse<TaskHistoryResponse> = await axios.get(
      `${API_BASE_URL}/api/tasks`,
      {
        params: { limit, offset }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to get task history:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'Failed to get task history',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Get task execution statistics
 */
export async function getTaskStatistics(): Promise<TaskStatistics> {
  try {
    const response: AxiosResponse<TaskStatistics> = await axios.get(
      `${API_BASE_URL}/api/tasks/stats`
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to get task statistics:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'Failed to get task statistics',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Clear all task history
 */
export async function clearTaskHistory(): Promise<{ message: string }> {
  try {
    const response: AxiosResponse<{ message: string }> = await axios.delete(
      `${API_BASE_URL}/api/tasks`
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to clear task history:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'Failed to clear task history',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<{ status: string; service: string; timestamp: string }> {
  try {
    const response: AxiosResponse<{ status: string; service: string; timestamp: string }> = await axios.get(
      `${API_BASE_URL}/api/health`
    );

    return response.data;
  } catch (error: any) {
    console.error('API health check failed:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'API health check failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Get API status information
 */
export async function getApiStatus(): Promise<{ backend: string; frontend: string; ready: boolean; task_runner: string }> {
  try {
    const response: AxiosResponse<{ backend: string; frontend: string; ready: boolean; task_runner: string }> = await axios.get(
      `${API_BASE_URL}/api/status`
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to get API status:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'Failed to get API status',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}

/**
 * Utility function to format execution time
 */
export function formatExecutionTime(time: number): string {
  if (time < 1000) {
    return `${Math.round(time)}ms`;
  } else {
    return `${(time / 1000).toFixed(2)}s`;
  }
}

/**
 * Utility function to check if API is available
 */
export async function isApiAvailable(): Promise<boolean> {
  try {
    await checkApiHealth();
    return true;
  } catch (error) {
    return false;
  }
}

// TRINITI FileOps Integration - Drop 77
export interface FileOperationRequest {
  operation: "create" | "read" | "delete";
  path: string;
  content?: string;
}

export interface FileOperationResponse {
  success: boolean;
  output: string;
}

/**
 * Execute file operations: create, read, delete
 */
export async function runFileOperation(
  operation: "create" | "read" | "delete",
  path: string,
  content: string = ""
): Promise<FileOperationResponse> {
  try {
    const response: AxiosResponse<FileOperationResponse> = await axios.post(
      `${API_BASE_URL}/api/file-ops`,
      {
        operation,
        path,
        content
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('File operation failed:', error);

    const apiError: ApiError = {
      message: error.response?.data?.detail || error.message || 'File operation failed',
      status: error.response?.status || 500,
      details: error.response?.data
    };

    throw apiError;
  }
}
