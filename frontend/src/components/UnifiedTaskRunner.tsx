/**
 * TRINITI Unified Task Runner Component
 *
 * Integrated component that connects the frontend UI with the backend API
 * using the new task runner API client.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTaskHistory,
  getTaskStatistics,
  clearTaskHistory,
  checkApiHealth,
  getApiStatus,
  formatExecutionTime,
  TaskRequest,
  TaskHistoryResponse,
  TaskStatistics as ApiTaskStatistics
} from '../api/taskRunner';
import { TaskResult } from '../types/task';
import { useTaskSubmission } from '../hooks/useTaskSubmission';

interface UnifiedTaskRunnerProps {
  className?: string;
  showHistory?: boolean;
  showStatistics?: boolean;
  showApiStatus?: boolean;
}

export function UnifiedTaskRunner({
  className = '',
  showHistory = true,
  showStatistics = true,
  showApiStatus = true
}: UnifiedTaskRunnerProps) {
  const [taskInput, setTaskInput] = useState('');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [taskHistory, setTaskHistory] = useState<TaskHistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [statistics, setStatistics] = useState<ApiTaskStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [apiStatus, setApiStatus] = useState<{ backend: string; frontend: string; ready: boolean; task_runner: string } | null>(null);
  const [apiHealth, setApiHealth] = useState<{ status: string; service: string; timestamp: string } | null>(null);

  const [suggestedTasks] = useState([
    'TASK_SUGGESTIONS.GREETING',
    'TASK_SUGGESTIONS.CREATE_FILE',
    'TASK_SUGGESTIONS.LIST_FILES',
    'TASK_SUGGESTIONS.SEARCH_FUNCTIONS',
    'TASK_SUGGESTIONS.GENERATE_COMPONENT',
    'TASK_SUGGESTIONS.GIT_COMMIT'
  ]);

  // Use the task submission hook
  const { submitTask, isSubmitting, submissionCount } = useTaskSubmission();

  // Load initial data
  useEffect(() => {
    loadApiStatus();
    loadTaskHistory();
    loadStatistics();
  }, []);

  const loadApiStatus = useCallback(async () => {
    try {
      const status = await getApiStatus();
      setApiStatus(status);

      const health = await checkApiHealth();
      setApiHealth(health);
    } catch (error: any) {
      console.error('Failed to load API status:', error);
    }
  }, []);

  const loadTaskHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const history = await getTaskHistory(50, 0);
      setTaskHistory(history);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load task history:', error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const stats = await getTaskStatistics();
      setStatistics(stats);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to load statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Simplified submit handler using the hook
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling

    if (!taskInput.trim()) {
      console.log('🚫 Submission blocked: No input');
      return;
    }

    console.log('🚀 Task submission initiated:', taskInput.trim());

    setError(null);
    setResult(null);

    try {
      const taskResult = await submitTask(taskInput.trim());

      if (taskResult) {
        setResult(taskResult);

        if (taskResult.success) {
          setTaskInput(''); // Clear input on success
        }

        // Refresh data
        await Promise.all([
          loadTaskHistory(),
          loadStatistics()
        ]);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('💥 Task execution failed:', error);
    }
  }, [taskInput, submitTask, loadTaskHistory, loadStatistics]);

  const handleSuggestedTask = useCallback((task: string) => {
    setTaskInput(task);
  }, []);

  const handleClearHistory = useCallback(async () => {
    try {
      await clearTaskHistory();
      setTaskHistory(null);
      setStatistics(null);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  const getResultIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getResultColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderTaskResult = (taskResult: TaskResult) => {
    const { success, output, error } = taskResult;

    return (
      <div className={`p-4 rounded-lg border ${success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getResultIcon(success)}</span>
            <span className={`font-semibold ${getResultColor(success)}`}>
              {success ? 'Task Completed' : 'Task Failed'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {success ? 'Completed' : 'Failed'}
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">Output:</span>
            <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
              {output || 'No output'}
            </pre>
          </div>

          {error && (
            <div>
              <span className="font-medium text-red-700">Error:</span>
              <span className="ml-2 text-red-600">{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 UNIFIED_TASK_RUNNER.TITLE
        </h2>
        <p className="text-gray-600">
          UNIFIED_TASK_RUNNER.DESCRIPTION
        </p>
      </div>

      {/* API Status */}
      {showApiStatus && (apiStatus || apiHealth) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">🔗 API Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {apiStatus && (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Backend: {apiStatus.backend}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Task Runner: {apiStatus.task_runner}</span>
                </div>
              </div>
            )}
            {apiHealth && (
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Health: {apiHealth.status}</span>
                </div>
                <div className="text-gray-600 text-xs">
                  Last check: {new Date(apiHealth.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Input Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taskInput" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Task Command
            </label>
            <textarea
              id="taskInput"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter a task command... (e.g., 'echo Hello World', 'ls -la')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isSubmitting || !taskInput.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Execute Task</span>
                </>
              )}
            </button>

            {error && (
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Error
              </button>
            )}
          </div>
        </form>

        {/* Suggested Tasks */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Suggested Tasks:</h3>
          <div className="flex flex-wrap gap-2">
            {suggestedTasks.map((task, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedTask(task)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {task}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Task Result */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Latest Result</h3>
            <button
              onClick={() => setResult(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          {renderTaskResult(result)}
        </div>
      )}

      {/* Statistics */}
      {showStatistics && statistics && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Task Statistics</h3>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistics.totalTasks}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.successfulTasks}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.failedTasks}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{statistics.successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task History */}
      {showHistory && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📋 Task History</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadTaskHistory}
                disabled={historyLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={handleClearHistory}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : taskHistory && taskHistory.tasks.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {taskHistory.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{getResultIcon(task.metadata?.success ?? false)}</span>
                      <span className="font-medium text-gray-900 truncate max-w-xs">
                        {task.task}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatTimestamp(task.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tasks executed yet. Try running your first task!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
