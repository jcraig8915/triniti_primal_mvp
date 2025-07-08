/**
 * TRINITI Task Submission Hook
 * Provides submission guards and duplicate prevention for task execution
 */

import { useState, useRef, useCallback } from 'react';
import { runTask } from '../api/taskRunner';
import { TaskResult } from '../types/task';

interface UseTaskSubmissionReturn {
  submitTask: (task: string) => Promise<TaskResult | null>;
  isSubmitting: boolean;
  lastSubmissionTime: number;
  submissionCount: number;
}

export function useTaskSubmission(): UseTaskSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const lastSubmissionTime = useRef<number>(0);
  const currentSubmission = useRef<string | null>(null);

  const submitTask = useCallback(async (task: string): Promise<TaskResult | null> => {
    const now = Date.now();
    const taskId = `${task}_${now}`;

    // Prevent duplicate submissions
    if (currentSubmission.current === taskId) {
      console.warn('🚫 Duplicate task submission prevented:', task);
      return null;
    }

    // Prevent rapid successive submissions (within 1 second)
    if (now - lastSubmissionTime.current < 1000) {
      console.warn('🚫 Rapid submission prevented:', task);
      return null;
    }

    // Prevent concurrent submissions
    if (isSubmitting) {
      console.warn('🚫 Concurrent submission prevented:', task);
      return null;
    }

    console.group('🔧 Task Submission Hook');
    console.log('📝 Submitting task:', task);
    console.log('🆔 Task ID:', taskId);
    console.log('📊 Submission count:', submissionCount + 1);
    console.trace('📍 Submission stack');
    console.time('⏱️ Submission time');

    try {
      setIsSubmitting(true);
      currentSubmission.current = taskId;
      lastSubmissionTime.current = now;

      const result = await runTask({
        command: task.trim(),
        metadata: {
          source: 'useTaskSubmission_hook',
          timestamp: now,
          taskId: taskId,
          submissionCount: submissionCount + 1
        }
      });

      setSubmissionCount(prev => prev + 1);

      console.log('✅ Task submitted successfully:', result);
      console.timeEnd('⏱️ Submission time');
      console.groupEnd();

      return result;
    } catch (error: any) {
      console.error('❌ Task submission failed:', error);
      console.timeEnd('⏱️ Submission time');
      console.groupEnd();
      throw error;
    } finally {
      setIsSubmitting(false);
      currentSubmission.current = null;
    }
  }, [isSubmitting, submissionCount]);

  return {
    submitTask,
    isSubmitting,
    lastSubmissionTime: lastSubmissionTime.current,
    submissionCount
  };
}
