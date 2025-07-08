/**
 * TRINITI Task Runner Service
 * Integrates natural language processing, command routing, and error recovery
 */

import axios from "axios";
import { routeTask, parseFileOperation } from "./task_router";
import { guardedExec } from "./error_guard";
import { TaskResult, TaskExecutionRequest, TaskExecutionResponse } from "../types/task";
import { runFileOperation } from "../api/taskRunner";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL ||
                    import.meta.env.REACT_APP_API_URL ||
                    'http://localhost:3000';

/**
 * Execute file operations directly via FileOps API
 */
export async function executeFileOperation(
  operation: "create" | "read" | "delete",
  path: string,
  content: string = ""
): Promise<TaskResult> {
  console.log(`🧠 Executing file operation: ${operation} -> ${path}`);

  return guardedExec(async () => {
    try {
      const result = await runFileOperation(operation, path, content);

      console.log(`✅ File operation result:`, {
        success: result.success,
        output: result.output
      });

      return {
        success: result.success,
        output: result.output,
        error: result.success ? undefined : result.output
      };
    } catch (error: any) {
      console.error(`❌ File operation failed:`, error);
      return {
        success: false,
        output: "",
        error: error.message || "File operation failed"
      };
    }
  });
}

/**
 * Execute a task from natural language input
 */
export async function runTask(nlRequest: string): Promise<TaskResult> {
  console.log(`🤖 Processing natural language request: "${nlRequest}"`);

  // First, check if this is a file operation
  const fileOp = parseFileOperation(nlRequest);
  if (fileOp && fileOp.operation && fileOp.path) {
    console.log(`🧠 Detected file operation: ${fileOp.operation} -> ${fileOp.path}`);
    return executeFileOperation(fileOp.operation, fileOp.path, fileOp.content || "");
  }

  // Natural language to concrete command for other operations
  const task = routeTask(nlRequest);
  console.log(`🔧 Routed to command: "${task.raw}"`);

  // Guarded execution with retries
  return guardedExec(async () => {
    const request: TaskExecutionRequest = {
      command: task.raw,
      metadata: {
        originalRequest: nlRequest,
        routedCommand: task.raw,
        timestamp: Date.now()
      },
      timeout: 30000
    };

    console.log(`🚀 Executing task via API:`, request);

    const response = await axios.post<TaskExecutionResponse>(
      `${API_BASE_URL}/api/execute`,
      request,
      {
        timeout: request.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result: TaskResult = {
      success: response.data.success,
      output: response.data.result || "",
      error: response.data.error
    };

    console.log(`✅ Task execution result:`, {
      success: result.success,
      outputLength: result.output?.length || 0,
      hasError: !!result.error
    });

    return result;
  });
}

/**
 * Execute a raw command directly (bypassing natural language processing)
 */
export async function runRawCommand(command: string): Promise<TaskResult> {
  console.log(`🔧 Executing raw command: "${command}"`);

  return guardedExec(async () => {
    const request: TaskExecutionRequest = {
      command: command,
      metadata: {
        type: "raw_command",
        timestamp: Date.now()
      },
      timeout: 30000
    };

    const response = await axios.post<TaskExecutionResponse>(
      `${API_BASE_URL}/api/execute`,
      request,
      {
        timeout: request.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: response.data.success,
      output: response.data.result || "",
      error: response.data.error
    };
  });
}

/**
 * Get task execution history
 */
export async function getTaskHistory(limit: number = 50, offset: number = 0) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
      params: { limit, offset }
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to get task history:', error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to get task history');
  }
}

/**
 * Get task execution statistics
 */
export async function getTaskStatistics() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tasks/stats`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get task statistics:', error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to get task statistics');
  }
}

/**
 * Clear all task history
 */
export async function clearTaskHistory() {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/tasks`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to clear task history:', error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to clear task history');
  }
}

/**
 * Check API health status
 */
export async function checkApiHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    return response.data;
  } catch (error: any) {
    console.error('API health check failed:', error);
    throw new Error(error.response?.data?.detail || error.message || 'API health check failed');
  }
}

/**
 * Get API status information
 */
export async function getApiStatus() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/status`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get API status:', error);
    throw new Error(error.response?.data?.detail || error.message || 'Failed to get API status');
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
