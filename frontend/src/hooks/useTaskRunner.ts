/**
 * TRINITI Task Runner Hook
 *
 * React hook for task submission and execution with backend API integration.
 * Provides loading states, error handling, and result management.
 */

import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  TaskExecutionRequest,
  TaskExecutionResponse,
  TaskHistoryResponse,
  TaskStatistics,
  TaskExecutionConfig
} from '../types/task';

export interface UseTaskRunnerReturn {
  // Task execution
  runTask: (task: string) => Promise<TaskExecutionResponse | null>;
  isLoading: boolean;
  result: TaskExecutionResponse | null;
  error: string | null;

  // Task history
  taskHistory: TaskExecutionResponse[];
  loadTaskHistory: (limit?: number, offset?: number) => Promise<void>;
  historyLoading: boolean;

  // Task statistics
  statistics: TaskStatistics | null;
  loadStatistics: () => Promise<void>;
  statsLoading: boolean;

  // Utility functions
  clearError: () => void;
  clearResult: () => void;
  clearHistory: () => Promise<void>;
}

export function useTaskRunner(config?: Partial<TaskExecutionConfig>): UseTaskRunnerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TaskExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [taskHistory, setTaskHistory] = useState<TaskExecutionResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Default configuration
  const defaultConfig: TaskExecutionConfig = {
    baseUrl: '/api',
    timeout: 30000,
    retryCount: 3,
    enableLogging: true,
    enableMetrics: true,
    enableMemoryIntegration: true,
    ...config
  };

  /**
   * Execute a task via the backend API
   */
  const runTask = useCallback(async (task: string): Promise<TaskExecutionResponse | null> => {
    if (!task || !task.trim()) {
      setError('Task description is required');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: TaskExecutionRequest = {
        task: task.trim(),
        timestamp: Date.now()
      };

      const response = await axios.post<TaskExecutionResponse>(
        `${defaultConfig.baseUrl}/run-task`,
        request,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: defaultConfig.timeout
        }
      );

      const taskResult = response.data;
      setResult(taskResult);

      // Automatically refresh task history after successful execution
      await loadTaskHistory();

      // Refresh statistics
      await loadStatistics();

      if (defaultConfig.enableLogging) {
        console.debug('Task executed successfully', {
          taskId: taskResult.id,
          task: taskResult.task,
          success: taskResult.success,
          executionTime: taskResult.executionTime
        });
      }

      return taskResult;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Task execution failed';
      setError(errorMessage);

      if (defaultConfig.enableLogging) {
        console.error('Task execution failed', {
          task,
          error: errorMessage,
          details: err
        });
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [defaultConfig]);

  /**
   * Load task execution history
   */
  const loadTaskHistory = useCallback(async (limit: number = 50, offset: number = 0): Promise<void> => {
    setHistoryLoading(true);

    try {
      const response = await axios.get<TaskHistoryResponse>(`${defaultConfig.baseUrl}/tasks`, {
        params: { limit, offset },
        timeout: defaultConfig.timeout
      });

      setTaskHistory(response.data.tasks);

      if (defaultConfig.enableLogging) {
        console.debug('Task history loaded', {
          count: response.data.tasks.length,
          total: response.data.total
        });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load task history';
      setError(errorMessage);

      if (defaultConfig.enableLogging) {
        console.error('Failed to load task history', err);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, [defaultConfig]);

  /**
   * Load task execution statistics
   */
  const loadStatistics = useCallback(async (): Promise<void> => {
    setStatsLoading(true);

    try {
      const response = await axios.get<TaskStatistics>(`${defaultConfig.baseUrl}/tasks/stats`, {
        timeout: defaultConfig.timeout
      });
      setStatistics(response.data);

      if (defaultConfig.enableLogging) {
        console.debug('Task statistics loaded', response.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load statistics';
      setError(errorMessage);

      if (defaultConfig.enableLogging) {
        console.error('Failed to load task statistics', err);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [defaultConfig]);

  /**
   * Clear task history
   */
  const clearHistory = useCallback(async (): Promise<void> => {
    try {
      await axios.delete(`${defaultConfig.baseUrl}/tasks`, {
        timeout: defaultConfig.timeout
      });
      setTaskHistory([]);
      setStatistics(null);

      if (defaultConfig.enableLogging) {
        console.debug('Task history cleared');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to clear history';
      setError(errorMessage);

      if (defaultConfig.enableLogging) {
        console.error('Failed to clear task history', err);
      }
    }
  }, [defaultConfig]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear result state
   */
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    // Task execution
    runTask,
    isLoading,
    result,
    error,

    // Task history
    taskHistory,
    loadTaskHistory,
    historyLoading,

    // Task statistics
    statistics,
    loadStatistics,
    statsLoading,

    // Utility functions
    clearError,
    clearResult,
    clearHistory
  };
}
