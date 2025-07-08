/**
 * TRINITI FileOps Demo Component
 *
 * Demo component showcasing TRINITI's file system operations
 * Allows users to create, read, and delete files through the UI
 */

import React, { useState } from 'react';
import { useFileOps } from '../hooks/useFileOps';

interface FileOpsDemoProps {
  className?: string;
}

export function FileOpsDemo({ className = '' }: FileOpsDemoProps) {
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const { runOp, isLoading, lastResult, error, clearError, clearResult } = useFileOps();

  const handleCreate = async () => {
    if (!path.trim()) {
      alert('Please enter a file path');
      return;
    }
    await runOp('create', path, content);
  };

  const handleRead = async () => {
    if (!path.trim()) {
      alert('Please enter a file path');
      return;
    }
    await runOp('read', path);
  };

  const handleDelete = async () => {
    if (!path.trim()) {
      alert('Please enter a file path');
      return;
    }
    if (!confirm(`Are you sure you want to delete: ${path}?`)) {
      return;
    }
    await runOp('delete', path);
  };

  const getResultIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  const getResultColor = (success: boolean) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🧠 TRINITI FileOps Integration
        </h2>
        <p className="text-gray-600">
          Give TRINITI hands to create, read, and delete files
        </p>
      </div>

      {/* File Operations Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          {/* File Path Input */}
          <div>
            <label htmlFor="filePath" className="block text-sm font-medium text-gray-700 mb-2">
              File Path
            </label>
            <input
              id="filePath"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="Enter file path (e.g., ./test.txt, /tmp/example.txt)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* File Content Input */}
          <div>
            <label htmlFor="fileContent" className="block text-sm font-medium text-gray-700 mb-2">
              File Content (for create operation)
            </label>
            <textarea
              id="fileContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter file content..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Operation Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCreate}
              disabled={isLoading || !path.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>📝</span>
                  <span>Create File</span>
                </>
              )}
            </button>

            <button
              onClick={handleRead}
              disabled={isLoading || !path.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Reading...</span>
                </>
              ) : (
                <>
                  <span>📖</span>
                  <span>Read File</span>
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              disabled={isLoading || !path.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <span>🗑️</span>
                  <span>Delete File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <button
              onClick={clearError}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {lastResult && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Operation Result</h3>
            <button
              onClick={clearResult}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>

          <div className={`p-4 rounded-lg border ${lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xl">{getResultIcon(lastResult.success)}</span>
              <span className={`font-semibold ${getResultColor(lastResult.success)}`}>
                {lastResult.success ? 'Operation Successful' : 'Operation Failed'}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-700">Output:</span>
              <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {lastResult.output || 'No output'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Example Usage */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Example Usage</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Create:</strong> Path: <code>./test.txt</code>, Content: <code>Hello TRINITI!</code></p>
          <p><strong>Read:</strong> Path: <code>./test.txt</code></p>
          <p><strong>Delete:</strong> Path: <code>./test.txt</code></p>
        </div>
      </div>
    </div>
  );
}
