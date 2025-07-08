/**
 * TRINITI Task Runner Demo
 *
 * Demo component showcasing the Task Runner functionality with examples
 * and integration with the TRINITI Memory System.
 */

import React, { useState } from 'react';
import { TaskRunnerComponent } from '../components/TaskRunnerComponent';
import { TRINITIMemorySystem } from '../services/TRINITIMemorySystem';
import { TaskExecutionResponse } from '../types/task';

interface TaskRunnerDemoProps {
  className?: string;
}

export function TaskRunnerDemo({ className = '' }: TaskRunnerDemoProps) {
  const [memorySystem] = useState(() => new TRINITIMemorySystem());
  const [showMemoryIntegration, setShowMemoryIntegration] = useState(false);
  const [memoryStats, setMemoryStats] = useState<any>(null);

  const exampleTasks = [
    {
      name: 'Greeting',
      task: 'Hello, how are you today?',
      description: 'Simple greeting task to test basic communication'
    },
    {
      name: 'File Creation',
      task: 'Create a new file called test.txt',
      description: 'Simulate file system operations'
    },
    {
      name: 'Directory Listing',
      task: 'List files in the current directory',
      description: 'Show file system navigation capabilities'
    },
    {
      name: 'Code Search',
      task: 'Search for React components in the codebase',
      description: 'Demonstrate search functionality'
    },
    {
      name: 'Git Operations',
      task: 'Git commit with message "Update task runner"',
      description: 'Simulate version control operations'
    },
    {
      name: 'Code Generation',
      task: 'Generate a TypeScript interface for User data',
      description: 'Show code generation capabilities'
    }
  ];

  const handleTaskCompleted = (result: TaskExecutionResponse) => {
    if (result.success) {
      // Record successful task in memory system
      memorySystem.recordTask(
        `Task Execution: ${result.task}`,
        result.result,
        {
          success: true,
          duration: result.executionTime,
          tags: ['task_execution'],
          priority: 5
        }
      );

      // Update memory stats
      const stats = memorySystem.getStats();
      setMemoryStats(stats);
    }
  };

  const loadMemoryStats = () => {
    const stats = memorySystem.getStats();
    setMemoryStats(stats);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 TRINITI Task Execution Layer MVP
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience the power of AI-driven task execution with real-time feedback,
          comprehensive history tracking, and seamless memory integration.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 MVP Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Execution</h3>
            <p className="text-sm text-gray-600">
              Execute tasks instantly with live feedback and progress indicators
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Task Analytics</h3>
            <p className="text-sm text-gray-600">
              Comprehensive statistics and performance metrics for all executed tasks
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">Memory Integration</h3>
            <p className="text-sm text-gray-600">
              Seamless integration with TRINITI Memory System for persistent learning
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Task History</h3>
            <p className="text-sm text-gray-600">
              Complete audit trail of all task executions with detailed results
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Error Handling</h3>
            <p className="text-sm text-gray-600">
              Robust error handling with detailed error messages and recovery options
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Modern UI</h3>
            <p className="text-sm text-gray-600">
              Beautiful, responsive interface with intuitive task management
            </p>
          </div>
        </div>
      </div>

      {/* Example Tasks */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Example Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleTasks.map((example, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{example.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Example
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{example.description}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                {example.task}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Integration Toggle */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">🧠 Memory Integration</h2>
            <p className="text-gray-600">
              Enable TRINITI Memory System integration to persist task execution data
            </p>
          </div>
          <button
            onClick={() => setShowMemoryIntegration(!showMemoryIntegration)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {showMemoryIntegration ? 'Hide' : 'Show'} Memory Stats
          </button>
        </div>

        {showMemoryIntegration && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Memory Statistics</h3>
              <button
                onClick={loadMemoryStats}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                Refresh
              </button>
            </div>

            {memoryStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{memoryStats.totalMemories}</div>
                  <div className="text-sm text-gray-600">Total Memories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{memoryStats.successfulTasks}</div>
                  <div className="text-sm text-gray-600">Successful Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{memoryStats.averagePriority}</div>
                  <div className="text-sm text-gray-600">Avg Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{memoryStats.uniqueTags}</div>
                  <div className="text-sm text-gray-600">Unique Tags</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No memory data available. Execute some tasks to see statistics.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Task Runner */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Task Runner</h2>
        <TaskRunnerComponent
          showHistory={true}
          showStatistics={true}
        />
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Technical Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Backend Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• FastAPI-based task execution engine</li>
              <li>• Real-time task simulation with multiple operation types</li>
              <li>• Comprehensive error handling and validation</li>
              <li>• Task history persistence and retrieval</li>
              <li>• Performance metrics and statistics</li>
              <li>• RESTful API with proper HTTP status codes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Frontend Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React hooks for state management</li>
              <li>• Real-time UI updates and loading states</li>
              <li>• Comprehensive error handling and user feedback</li>
              <li>• Task history with search and filtering</li>
              <li>• Statistics dashboard with visual metrics</li>
              <li>• Responsive design with modern UI components</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🌐 API Endpoints</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">POST</span>
            <code className="text-sm">/api/run-task</code>
            <span className="text-gray-600 text-sm">Execute a new task</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/tasks</code>
            <span className="text-gray-600 text-sm">Retrieve task history</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/tasks/stats</code>
            <span className="text-gray-600 text-sm">Get task statistics</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-mono rounded">DELETE</span>
            <code className="text-sm">/api/tasks</code>
            <span className="text-gray-600 text-sm">Clear task history</span>
          </div>
        </div>
      </div>
    </div>
  );
}
