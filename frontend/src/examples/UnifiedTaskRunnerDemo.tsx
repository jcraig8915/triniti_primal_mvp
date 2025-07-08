/**
 * TRINITI Unified Task Runner Demo
 *
 * Demo component showcasing the unified task runner with API integration,
 * comprehensive examples, and development environment status.
 */

import React, { useState } from 'react';
import { UnifiedTaskRunner } from '../components/UnifiedTaskRunner';
import { checkApiHealth, getApiStatus, isApiAvailable } from '../api/taskRunner';

interface UnifiedTaskRunnerDemoProps {
  className?: string;
}

export function UnifiedTaskRunnerDemo({ className = '' }: UnifiedTaskRunnerDemoProps) {
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [apiHealth, setApiHealth] = useState<any>(null);

  const exampleTasks = [
    {
      name: 'Basic Greeting',
      command: 'Hello, how are you today?',
      description: 'Simple greeting task to test basic communication',
      category: 'communication'
    },
    {
      name: 'File System Operations',
      command: 'Create a new file called test.txt',
      description: 'Simulate file system operations',
      category: 'file_ops'
    },
    {
      name: 'Directory Navigation',
      command: 'List files in the current directory',
      description: 'Show file system navigation capabilities',
      category: 'file_ops'
    },
    {
      name: 'Code Search',
      command: 'Search for React components in the codebase',
      description: 'Demonstrate search functionality',
      category: 'search'
    },
    {
      name: 'Version Control',
      command: 'Git commit with message "Update task runner"',
      description: 'Simulate version control operations',
      category: 'git'
    },
    {
      name: 'Code Generation',
      command: 'Generate a TypeScript interface for User data',
      description: 'Show code generation capabilities',
      category: 'code_gen'
    }
  ];

  const checkApiConnectivity = async () => {
    try {
      const available = await isApiAvailable();
      setApiAvailable(available);

      if (available) {
        const status = await getApiStatus();
        setApiStatus(status);

        const health = await checkApiHealth();
        setApiHealth(health);
      }
    } catch (error) {
      console.error('API connectivity check failed:', error);
      setApiAvailable(false);
    }
  };

  // Check API connectivity on component mount
  React.useEffect(() => {
    checkApiConnectivity();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return '💬';
      case 'file_ops': return '📁';
      case 'search': return '🔍';
      case 'git': return '📝';
      case 'code_gen': return '⚡';
      default: return '🎯';
    }
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'text-gray-500';
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return '⏳';
    return status ? '✅' : '❌';
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 TRINITI Unified Task Runner Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience the complete TRINITI task execution system with unified API integration,
          real-time feedback, and comprehensive development environment monitoring.
        </p>
      </div>

      {/* API Connectivity Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 API Connectivity Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">🌐 API Available</span>
              <span className={`text-xl ${getStatusColor(apiAvailable)}`}>
                {getStatusIcon(apiAvailable)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {apiAvailable === null ? 'Checking...' :
               apiAvailable ? 'Backend API is accessible' : 'Backend API is not accessible'}
            </p>
            <button
              onClick={checkApiConnectivity}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh Status
            </button>
          </div>

          {apiStatus && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">⚙️ Backend Status</span>
                <span className="text-green-600">✅</span>
              </div>
              <p className="text-sm text-gray-600">
                Backend: {apiStatus.backend}<br/>
                Task Runner: {apiStatus.task_runner}
              </p>
            </div>
          )}

          {apiHealth && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">❤️ Health Check</span>
                <span className="text-green-600">✅</span>
              </div>
              <p className="text-sm text-gray-600">
                Status: {apiHealth.status}<br/>
                Service: {apiHealth.service}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Unified System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🔌</div>
            <h3 className="font-semibold text-gray-900 mb-2">API Integration</h3>
            <p className="text-sm text-gray-600">
              Seamless connection between frontend UI and backend task execution engine
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-900 mb-2">Memory System</h3>
            <p className="text-sm text-gray-600">
              Automatic task recording and retrieval with persistent storage
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-sm text-gray-600">
              Live statistics and performance metrics for all executed tasks
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Error Handling</h3>
            <p className="text-sm text-gray-600">
              Comprehensive error handling with detailed error messages and recovery
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
            <p className="text-sm text-gray-600">
              Optimized execution with timeout handling and response caching
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Modern UI</h3>
            <p className="text-sm text-gray-600">
              Beautiful, responsive interface with real-time updates and feedback
            </p>
          </div>
        </div>
      </div>

      {/* Example Tasks */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Example Tasks by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleTasks.map((example, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getCategoryIcon(example.category)}</span>
                  <h3 className="font-semibold text-gray-900">{example.name}</h3>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {example.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{example.description}</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block">
                {example.command}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Development Environment Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Development Environment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Backend Configuration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• FastAPI application with CORS support</li>
              <li>• Task execution engine with simulation</li>
              <li>• Memory system integration</li>
              <li>• Health check and status endpoints</li>
              <li>• Automatic reload for development</li>
              <li>• Comprehensive error handling</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Frontend Configuration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React with TypeScript</li>
              <li>• Axios API client with error handling</li>
              <li>• Real-time UI updates</li>
              <li>• Responsive design with Tailwind CSS</li>
              <li>• Component-based architecture</li>
              <li>• Development server with hot reload</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Endpoints Reference */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🌐 API Endpoints Reference</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-mono rounded">POST</span>
            <code className="text-sm">/api/execute</code>
            <span className="text-gray-600 text-sm">Execute a task command</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/tasks</code>
            <span className="text-gray-600 text-sm">Get task execution history</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/tasks/stats</code>
            <span className="text-gray-600 text-sm">Get task execution statistics</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-mono rounded">DELETE</span>
            <code className="text-sm">/api/tasks</code>
            <span className="text-gray-600 text-sm">Clear task history</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/health</code>
            <span className="text-gray-600 text-sm">Check API health status</span>
          </div>
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">GET</span>
            <code className="text-sm">/api/status</code>
            <span className="text-gray-600 text-sm">Get API status information</span>
          </div>
        </div>
      </div>

      {/* Main Unified Task Runner */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Unified Task Runner</h2>
        <UnifiedTaskRunner
          showHistory={true}
          showStatistics={true}
          showApiStatus={true}
        />
      </div>

      {/* Quick Start Guide */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🚀 Quick Start Guide</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">1. Start Development Environment</h3>
            <code className="text-sm bg-blue-100 px-2 py-1 rounded block">
              .\scripts\dev-up.ps1
            </code>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">2. Verify API Connectivity</h3>
            <p className="text-sm text-blue-800">
              Check that the API status shows as available above
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">3. Execute Your First Task</h3>
            <p className="text-sm text-blue-800">
              Try one of the suggested tasks or enter your own command
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">4. Monitor Results</h3>
            <p className="text-sm text-blue-800">
              View task results, history, and statistics in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
