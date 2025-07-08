/**
 * TRINITI Task Runner Component
 *
 * Main component for task submission, execution, and result display.
 * Features a modern UI with real-time feedback and task history.
 */

import React, { useState, useEffect } from 'react';
import { useTaskRunner } from '../hooks/useTaskRunner';
import { TaskExecutionResponse, TaskResult } from '../types/task';

// Simple date formatting function (replace with date-fns when available)
const formatDistanceToNow = (timestamp: number, options?: { addSuffix?: boolean }) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

interface TaskRunnerComponentProps {
  className?: string;
  showHistory?: boolean;
  showStatistics?: boolean;
}

export function TaskRunnerComponent({
  className = '',
  showHistory = true,
  showStatistics = true
}: TaskRunnerComponentProps) {
  const {
    runTask,
    isLoading,
    result,
    error,
    taskHistory,
    loadTaskHistory,
    historyLoading,
    statistics,
    loadStatistics,
    statsLoading,
    clearError,
    clearResult,
    clearHistory
  } = useTaskRunner();

  const [taskInput, setTaskInput] = useState('');
  const [suggestedTasks] = useState([
    'TASK_SUGGESTIONS.GREETING',
    'TASK_SUGGESTIONS.CREATE_FILE',
    'TASK_SUGGESTIONS.LIST_FILES',
    'TASK_SUGGESTIONS.SEARCH_FUNCTIONS',
    'TASK_SUGGESTIONS.GENERATE_COMPONENT',
    'TASK_SUGGESTIONS.GIT_COMMIT'
  ]);

  // Load initial data
  useEffect(() => {
    loadTaskHistory();
    loadStatistics();
  }, [loadTaskHistory, loadStatistics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim() || isLoading) return;

    const taskResult = await runTask(taskInput);
    if (taskResult?.success) {
      setTaskInput(''); // Clear input on success
    }
  };

  const handleSuggestedTask = (task: string) => {
    setTaskInput(task);
  };

  const getResultIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getResultColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const formatExecutionTime = (time: number) => {
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`;
  };

  const renderTaskResult = (taskResult: TaskExecutionResponse) => {
    const { success, result, executionTime } = taskResult;

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
            {formatExecutionTime(executionTime)}
          </span>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">Task:</span>
            <span className="ml-2 text-gray-900">{taskResult.task}</span>
          </div>

          <div>
            <span className="font-medium text-gray-700">Result:</span>
            <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 TASK_RUNNER.TITLE
        </h2>
        <p className="text-gray-600">
          TASK_RUNNER.DESCRIPTION
        </p>
      </div>

      {/* Task Input Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taskInput" className="block text-sm font-medium text-gray-700 mb-2">
              TASK_RUNNER.ENTER_TASK
            </label>
            <textarea
              id="taskInput"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="TASK_RUNNER.PLACEHOLDER"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || !taskInput.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>TASK_RUNNER.RUNNING</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>TASK_RUNNER.RUN_TASK</span>
                </>
              )}
            </button>

            {error && (
              <button
                type="button"
                onClick={clearError}
                className="text-sm text-red-600 hover:text-red-800"
              >
                TASK_RUNNER.CLEAR_ERROR
              </button>
            )}
          </div>
        </form>

        {/* Suggested Tasks */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Tasks:</h3>
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
              onClick={clearResult}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h3>
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
            <h3 className="text-lg font-semibold text-gray-900">Task History</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadTaskHistory()}
                disabled={historyLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={clearHistory}
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
          ) : taskHistory.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {taskHistory.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{getResultIcon(task.success)}</span>
                      <span className="font-medium text-gray-900 truncate max-w-xs">
                        {task.task}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{formatExecutionTime(task.executionTime)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(task.timestamp)}</span>
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
