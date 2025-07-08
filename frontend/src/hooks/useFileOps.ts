/**
 * TRINITI FileOps Hook
 *
 * React hook for file operations: create, read, delete
 * Provides a simple interface for TRINITI file system operations
 */

import { useState, useCallback } from 'react';
import { runFileOperation, FileOperationResponse } from '../api/taskRunner';

export interface UseFileOpsReturn {
  runOp: (operation: "create" | "read" | "delete", path: string, content?: string) => Promise<FileOperationResponse>;
  isLoading: boolean;
  lastResult: FileOperationResponse | null;
  error: string | null;
  clearError: () => void;
  clearResult: () => void;
}

export function useFileOps(): UseFileOpsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FileOperationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runOp = useCallback(async (
    operation: "create" | "read" | "delete",
    path: string,
    content: string = ""
  ): Promise<FileOperationResponse> => {
    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      console.log(`🧠 FileOps: ${operation} -> ${path}`);

      const result = await runFileOperation(operation, path, content);

      setLastResult(result);

      if (result.success) {
        console.log(`✅ FileOps ${operation} successful:`, result.output);
      } else {
        console.warn(`⚠️ FileOps ${operation} failed:`, result.output);
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'File operation failed';
      setError(errorMessage);
      console.error(`❌ FileOps ${operation} error:`, errorMessage);

      // Return error response
      return {
        success: false,
        output: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    runOp,
    isLoading,
    lastResult,
    error,
    clearError,
    clearResult
  };
}
