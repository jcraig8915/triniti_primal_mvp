"""
TRINITI Task Runner API
Main API router for task execution with OpenDevin agent integration
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, Optional, Dict
import time
import uuid
from datetime import datetime

# Import our existing memory system
from ...services.TRINITIMemorySystem import TRINITIMemorySystem

router = APIRouter(prefix="/api", tags=["task_execution"])

# Initialize memory system
memory_system = TRINITIMemorySystem()

class TaskRequest(BaseModel):
    command: str
    metadata: Optional[Dict[str, Any]] = None
    timeout: Optional[int] = 30000  # 30 seconds default

class TaskResponse(BaseModel):
    id: str
    success: bool
    result: Any
    execution_time: float
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class TaskExecutionOptions(BaseModel):
    timeout: Optional[int] = 30000
    retry_count: Optional[int] = 3
    priority: Optional[str] = "medium"
    tags: Optional[list[str]] = None

@router.post("/execute", response_model=TaskResponse)
async def execute_task(req: TaskRequest):
    """
    Execute a task using the TRINITI task execution system
    """
    start_time = time.time()
    task_id = f"task_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"

    try:
        # Initialize memory system if needed
        if not memory_system.isInitialized:
            await memory_system.initialize()

        # Execute task using our existing task executor
        from ...backend_server import task_executor

        # Create task execution request
        from ...backend_server import TaskExecutionRequest
        task_request = TaskExecutionRequest(
            task=req.command,
            timestamp=int(time.time() * 1000)
        )

        # Execute the task
        result = await task_executor.execute_task(task_request)

        # Record in memory system
        await memory_system.recordTask(
            task=req.command,
            result=result.result,
            metadata={
                'success': result.success,
                'duration': result.executionTime,
                'taskId': task_id,
                'type': 'task_execution',
                'tags': ['api_execution'] + (req.metadata.get('tags', []) if req.metadata else []),
                'priority': 5
            }
        )

        execution_time = time.time() - start_time

        return TaskResponse(
            id=task_id,
            success=result.success,
            result=result.result,
            execution_time=execution_time,
            timestamp=int(time.time() * 1000),
            metadata=req.metadata,
            error=None if result.success else str(result.result.get('error', 'Unknown error'))
        )

    except Exception as e:
        execution_time = time.time() - start_time
        error_message = str(e)

        # Record error in memory system
        try:
            await memory_system.recordTask(
                task=req.command,
                result={'error': error_message},
                metadata={
                    'success': False,
                    'duration': execution_time * 1000,
                    'taskId': task_id,
                    'type': 'task_execution_error',
                    'tags': ['api_execution', 'error'],
                    'priority': 1,
                    'errors': [error_message]
                }
            )
        except Exception as mem_error:
            print(f"Failed to record error in memory: {mem_error}")

        return TaskResponse(
            id=task_id,
            success=False,
            result={'error': error_message},
            execution_time=execution_time,
            timestamp=int(time.time() * 1000),
            metadata=req.metadata,
            error=error_message
        )

@router.get("/tasks", response_model=Dict[str, Any])
async def get_task_history(limit: int = 50, offset: int = 0):
    """
    Get task execution history from memory system
    """
    try:
        if not memory_system.isInitialized:
            await memory_system.initialize()

        # Get recent tasks from memory system
        recent_tasks = memory_system.getRecentTasks(limit + offset)

        # Apply pagination
        paginated_tasks = recent_tasks[offset:offset + limit]

        # Get total count
        stats = memory_system.getStats()

        return {
            "tasks": [
                {
                    "id": task.id,
                    "task": task.task,
                    "result": task.result,
                    "timestamp": task.timestamp,
                    "metadata": task.metadata
                }
                for task in paginated_tasks
            ],
            "total": stats.totalMemories,
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task history: {str(e)}")

@router.get("/tasks/stats", response_model=Dict[str, Any])
async def get_task_statistics():
    """
    Get task execution statistics from memory system
    """
    try:
        if not memory_system.isInitialized:
            await memory_system.initialize()

        stats = memory_system.getStats()

        return {
            "totalTasks": stats.totalMemories,
            "successfulTasks": stats.successfulTasks,
            "failedTasks": stats.failedTasks,
            "successRate": stats.successRate,
            "averageExecutionTime": stats.averageExecutionTime,
            "mostCommonTags": stats.mostCommonTags
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")

@router.delete("/tasks")
async def clear_task_history():
    """
    Clear all task history from memory system
    """
    try:
        if not memory_system.isInitialized:
            await memory_system.initialize()

        await memory_system.clearAll()

        return {"message": "Task history cleared successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear task history: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the task runner API
    """
    return {
        "status": "healthy",
        "service": "triniti-task-runner",
        "timestamp": datetime.now().isoformat(),
        "memory_system_initialized": memory_system.isInitialized
    }
