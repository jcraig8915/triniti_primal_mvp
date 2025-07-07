/**
 * TRINITI Memory System Example
 *
 * Demonstrates basic usage of the memory system with task recording
 * and retrieval capabilities.
 */

import React, { useState } from 'react';
import { useMemorySystem } from '../hooks/useMemorySystem';

export const MemorySystemExample: React.FC = () => {
  const { recordTask, recentTasks, stats, searchTasks } = useMemorySystem();
  const [taskDescription, setTaskDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRecordTask = () => {
    if (!taskDescription.trim()) return;

    // Record a task with some sample data
    recordTask(taskDescription, {
      message: 'MEMORY.TASK_COMPLETED_SUCCESSFULLY',
      timestamp: new Date().toISOString(),
      data: { sample: 'result' }
    }, {
      success: true,
      tags: ['example', 'demo'],
      priority: 5
    });

    setTaskDescription('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchTasks(searchQuery);
      console.log('MEMORY.SEARCH_RESULTS', results);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MEMORY.SYSTEM_EXAMPLE_TITLE</h1>

      {/* Statistics */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>MEMORY.STATS_TITLE</h3>
        <p>MEMORY.TOTAL_TASKS_LABEL {stats.totalEntries}</p>
        <p>MEMORY.SUCCESSFUL_LABEL {stats.successfulTasks}</p>
        <p>MEMORY.FAILED_LABEL {stats.failedTasks}</p>
        <p>MEMORY.STORAGE_USAGE_LABEL {stats.storageUsage.toFixed(1)}%</p>
      </div>

      {/* Task Recording */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>MEMORY.RECORD_TASK_TITLE</h3>
        <input
          type="text"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="MEMORY.TASK_DESCRIPTION_PLACEHOLDER"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button
          onClick={handleRecordTask}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          MEMORY.RECORD_TASK_BUTTON
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>MEMORY.SEARCH_TITLE</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="MEMORY.SEARCH_PLACEHOLDER"
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          MEMORY.SEARCH_BUTTON
        </button>
      </div>

      {/* Recent Tasks */}
      <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>MEMORY.RECENT_TASKS_TITLE</h3>
        {recentTasks.length === 0 ? (
          <p>MEMORY.NO_TASKS_EXAMPLE_MESSAGE</p>
        ) : (
          <div>
            {recentTasks.map((entry) => (
              <div key={entry.id} style={{
                background: 'white',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {entry.task}
                  <span style={{
                    marginLeft: '10px',
                    color: entry.metadata.success ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {entry.metadata.success ? '✓' : '✗'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                  MEMORY.DURATION_LABEL {entry.metadata.duration.toFixed(2)}ms
                  {entry.metadata.tags && entry.metadata.tags.length > 0 && (
                    <span style={{ marginLeft: '10px' }}>
                      MEMORY.TAGS_LABEL {entry.metadata.tags.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
