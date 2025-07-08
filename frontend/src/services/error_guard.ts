/**
 * TRINITI Error Guard
 * Provides retry logic and failure logging for task execution
 */

import { TaskResult } from "../types/task";

/**
 * Executes a task with retry logic and exponential backoff
 */
export async function guardedExec(
  exec: () => Promise<TaskResult>,
  retries = 2
): Promise<TaskResult> {
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await exec();
      if (res.success) {
        console.log(`✅ Task executed successfully on attempt ${attempt + 1}`);
        return res;
      }
      lastErr = res.error ?? "Unknown failure";
      console.warn(`⚠️ Task failed on attempt ${attempt + 1}:`, lastErr);
    } catch (err) {
      lastErr = err;
      console.error(`❌ Task threw error on attempt ${attempt + 1}:`, err);
    }

    // Exponential backoff (skip delay on last attempt)
    if (attempt < retries) {
      const delay = Math.pow(2, attempt) * 500; // 500ms, 1000ms, 2000ms
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // Final failure handling
  const errorMessage = String(lastErr);
  console.error(`💥 Task failed after ${retries + 1} attempts:`, errorMessage);

  // Record failure in memory system if available
  try {
    await recordTaskFailure(errorMessage);
  } catch (memoryError) {
    console.warn("⚠️ Failed to record task failure in memory:", memoryError);
  }

  return {
    success: false,
    output: "",
    error: errorMessage
  };
}

/**
 * Records task failure in the memory system
 */
async function recordTaskFailure(error: string): Promise<void> {
  try {
    // Try to import and use the memory system
    const { TRINITIMemorySystem } = await import("./TRINITIMemorySystem");
    const memory = new TRINITIMemorySystem();

    await memory.recordTask(
      "Task Execution Failure",
      error,
      {
        success: false,
        errors: [error],
        tags: ["error", "failure"],
        priority: 1
      }
    );
  } catch (importError) {
    // Memory system not available, just log the error
    console.warn("Memory system not available for failure logging:", importError);
  }
}

/**
 * Wraps a function with error handling and logging
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string = "Unknown operation"
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`❌ Error in ${context}:`, error);
      await recordTaskFailure(`Error in ${context}: ${String(error)}`);
      throw error;
    }
  };
}
