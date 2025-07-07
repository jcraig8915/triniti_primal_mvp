/**
 * TRINITI Memory System Dashboard
 *
 * A comprehensive React component that demonstrates the memory system
 * with real-time statistics, task recording, and search capabilities.
 */

import React, { useState } from 'react';
import { useMemorySystem, useTaskSearch, useMemoryStats } from '../../hooks/useMemorySystem';
import { MemoryEntry, MemorySearchOptions } from '../../types/memory';

interface MemoryDashboardProps {
  className?: string;
}

function MemoryDashboard({ className = '' }: MemoryDashboardProps) {
  const { recordTask, recentTasks, clearAll, exportData } = useMemorySystem();
  const { stats, refreshData } = useMemoryStats();
  const { searchResults, isSearching, performSearch } = useTaskSearch();

  const [newTask, setNewTask] = useState('');
  const [newTaskResult, setNewTaskResult] = useState('');
  const [newTaskTags, setNewTaskTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<MemorySearchOptions>({});

  const handleRecordTask = () => {
    if (!newTask.trim()) return;

    const tags = newTaskTags.split(',').map(tag => tag.trim()).filter(Boolean);
    const result = newTaskResult.trim() || { message: 'MEMORY.TASK_COMPLETED' };

    recordTask(newTask, result, {
      success: true,
      tags,
      priority: 5
    });

    // Reset form
    setNewTask('');
    setNewTaskResult('');
    setNewTaskTags('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, searchOptions);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triniti-memory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (duration: number) => {
    return `${duration.toFixed(2)}ms`;
  };

  return (
    <div className={`memory-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>MEMORY.SYSTEM_TITLE</h2>
        <div className="capabilities">
          <span>MEMORY.STORAGE_INFO</span>
          <span>MEMORY.USAGE_INFO</span>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <h3>MEMORY.STATISTICS_TITLE</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalEntries}</div>
            <div className="stat-label">MEMORY.TOTAL_TASKS</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.successfulTasks}</div>
            <div className="stat-label">MEMORY.SUCCESSFUL</div>
          </div>
          <div className="stat-card error">
            <div className="stat-value">{stats.failedTasks}</div>
            <div className="stat-label">MEMORY.FAILED</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatDuration(stats.averageDuration)}</div>
            <div className="stat-label">MEMORY.AVG_DURATION</div>
          </div>
        </div>

        {stats.mostCommonTags.length > 0 && (
          <div className="tags-section">
            <h4>MEMORY.MOST_COMMON_TAGS</h4>
            <div className="tags-list">
              {stats.mostCommonTags.map(({ tag, count }) => (
                <span key={tag} className="tag">
                  {tag} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Recording Section */}
      <div className="task-recording-section">
        <h3>MEMORY.RECORD_TASK_TITLE</h3>
        <div className="task-form">
          <div className="form-group">
            <label htmlFor="task-description">MEMORY.TASK_DESCRIPTION_LABEL</label>
            <input
              id="task-description"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="MEMORY.TASK_DESCRIPTION_PLACEHOLDER"
              className="task-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-result">MEMORY.RESULT_LABEL</label>
            <textarea
              id="task-result"
              value={newTaskResult}
              onChange={(e) => setNewTaskResult(e.target.value)}
              placeholder="MEMORY.RESULT_PLACEHOLDER"
              className="task-textarea"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-tags">MEMORY.TAGS_LABEL</label>
            <input
              id="task-tags"
              type="text"
              value={newTaskTags}
              onChange={(e) => setNewTaskTags(e.target.value)}
              placeholder="MEMORY.TAGS_PLACEHOLDER"
              className="task-input"
            />
          </div>
          <button type="button" onClick={handleRecordTask} className="record-btn">
            MEMORY.RECORD_TASK_BUTTON
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <h3>MEMORY.SEARCH_TITLE</h3>
        <div className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="MEMORY.SEARCH_PLACEHOLDER"
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              {isSearching ? 'MEMORY.SEARCHING' : 'MEMORY.SEARCH_BUTTON'}
            </button>
          </div>
          <div className="search-options">
            <label>
              <input
                type="checkbox"
                checked={searchOptions.includeErrors === false}
                onChange={(e) => setSearchOptions({
                  ...searchOptions,
                  includeErrors: !e.target.checked
                })}
              />
              MEMORY.ONLY_SUCCESSFUL_TASKS
            </label>
            <input
              type="number"
              placeholder="MEMORY.LIMIT_RESULTS"
              value={searchOptions.limit || ''}
              onChange={(e) => setSearchOptions({
                ...searchOptions,
                limit: e.target.value ? parseInt(e.target.value) : undefined
              })}
              className="limit-input"
            />
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>{`MEMORY.SEARCH_RESULTS_TITLE (${searchResults.length})`}</h4>
            <div className="results-list">
              {searchResults.map((entry) => (
                <div key={entry.id} className="result-item">
                  <div className="result-header">
                    <span className="result-task">{entry.task}</span>
                    <span className={`result-status ${entry.metadata.success ? 'success' : 'error'}`}>
                      {entry.metadata.success ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="result-meta">
                    <span>{formatTimestamp(entry.timestamp)}</span>
                    <span>{formatDuration(entry.metadata.duration)}</span>
                    {entry.metadata.tags && entry.metadata.tags.length > 0 && (
                      <div className="result-tags">
                        {entry.metadata.tags.map(tag => (
                          <span key={tag} className="tag small">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Tasks Section */}
      <div className="recent-tasks-section">
        <h3>MEMORY.RECENT_TASKS_TITLE</h3>
        <div className="tasks-list">
          {recentTasks.length === 0 ? (
            <p className="no-tasks">MEMORY.NO_TASKS_MESSAGE</p>
          ) : (
            recentTasks.map((entry) => (
              <div key={entry.id} className="task-item">
                <div className="task-header">
                  <span className="task-description">{entry.task}</span>
                  <span className={`task-status ${entry.metadata.success ? 'success' : 'error'}`}>
                    {entry.metadata.success ? '✓' : '✗'}
                  </span>
                </div>
                <div className="task-meta">
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  <span>{formatDuration(entry.metadata.duration)}</span>
                  {entry.metadata.tags && entry.metadata.tags.length > 0 && (
                    <div className="task-tags">
                      {entry.metadata.tags.map(tag => (
                        <span key={tag} className="tag small">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="actions-section">
        <button type="button" onClick={refreshData} className="action-btn">
          MEMORY.REFRESH_BUTTON
        </button>
        <button type="button" onClick={handleExport} className="action-btn">
          MEMORY.EXPORT_BUTTON
        </button>
        <button type="button" onClick={clearAll} className="action-btn danger">
          MEMORY.CLEAR_ALL_BUTTON
        </button>
      </div>

      <style jsx>{`
        .memory-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e1e5e9;
        }

        .dashboard-header h2 {
          margin: 0;
          color: #2c3e50;
        }

        .capabilities {
          display: flex;
          gap: 15px;
          font-size: 14px;
          color: #7f8c8d;
        }

        .stats-section, .task-recording-section, .search-section, .recent-tasks-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .stats-section h3, .task-recording-section h3, .search-section h3, .recent-tasks-section h3 {
          margin-top: 0;
          color: #2c3e50;
          font-size: 18px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #dee2e6;
        }

        .stat-card.success {
          border-color: #28a745;
          background: #f8fff9;
        }

        .stat-card.error {
          border-color: #dc3545;
          background: #fff8f8;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
        }

        .tags-section {
          margin-top: 20px;
        }

        .tags-section h4 {
          margin-bottom: 10px;
          color: #495057;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          background: #007bff;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }

        .tag.small {
          font-size: 10px;
          padding: 2px 6px;
        }

        .task-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: 500;
          color: #495057;
        }

        .task-input, .task-textarea {
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .task-textarea {
          resize: vertical;
        }

        .record-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .record-btn:hover {
          background: #218838;
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .search-input-group {
          display: flex;
          gap: 10px;
        }

        .search-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .search-btn:hover {
          background: #0056b3;
        }

        .search-options {
          display: flex;
          gap: 20px;
          align-items: center;
          font-size: 14px;
        }

        .limit-input {
          width: 100px;
          padding: 5px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }

        .search-results, .tasks-list {
          margin-top: 20px;
        }

        .result-item, .task-item {
          background: white;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .result-header, .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .result-task, .task-description {
          font-weight: 500;
          color: #2c3e50;
        }

        .result-status, .task-status {
          font-weight: bold;
          font-size: 16px;
        }

        .result-status.success, .task-status.success {
          color: #28a745;
        }

        .result-status.error, .task-status.error {
          color: #dc3545;
        }

        .result-meta, .task-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #6c757d;
          align-items: center;
        }

        .result-tags, .task-tags {
          display: flex;
          gap: 5px;
        }

        .no-tasks {
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }

        .actions-section {
          display: flex;
          gap: 10px;
          justify-content: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .action-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .action-btn:hover {
          background: #5a6268;
        }

        .action-btn.danger {
          background: #dc3545;
        }

        .action-btn.danger:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
}

export { MemoryDashboard };
