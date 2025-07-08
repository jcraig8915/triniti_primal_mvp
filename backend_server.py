from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import time
import uuid
import asyncio
from datetime import datetime

app = FastAPI(title="TRINITI Backend Server", version="1.0.0")

# CORS middleware - Updated for unified development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Backend
        "http://localhost:3001",  # Frontend
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Task Execution Models
class TaskExecutionRequest(BaseModel):
    task: str
    timestamp: Optional[int] = None

class TaskExecutionResponse(BaseModel):
    id: str
    task: str
    result: Any
    success: bool
    executionTime: int
    timestamp: int

# In-memory storage for tasks (in production, use database)
task_memory: List[Dict[str, Any]] = []

class TaskExecutor:
    """TRINITI Task Executor for MVP implementation"""

    def __init__(self):
        self.task_history = []

    async def execute_task(self, task_request: TaskExecutionRequest) -> TaskExecutionResponse:
        """Execute a task and record results in memory"""
        start_time = time.time()
        task_id = f"task_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"

        try:
            # Execute the task
            result = await self.run_task_simulation(task_request.task)

            execution_response = TaskExecutionResponse(
                id=task_id,
                task=task_request.task,
                result=result,
                success=True,
                executionTime=int((time.time() - start_time) * 1000),
                timestamp=int(time.time() * 1000)
            )

            # Record successful execution in memory
            self.record_task_execution(execution_response, success=True)

            return execution_response

        except Exception as error:
            failure_response = TaskExecutionResponse(
                id=task_id,
                task=task_request.task,
                result={"error": str(error), "type": "execution_error"},
                success=False,
                executionTime=int((time.time() - start_time) * 1000),
                timestamp=int(time.time() * 1000)
            )

            # Record failed execution in memory
            self.record_task_execution(failure_response, success=False)

            return failure_response

    async def run_task_simulation(self, task: str) -> Dict[str, Any]:
        """MVP: Basic task simulation with common operations"""
        task_lower = task.lower()

        # Simulate processing delay
        await asyncio.sleep(0.1)

        # Greeting tasks
        if any(word in task_lower for word in ['hello', 'hi', 'greet']):
            return {
                "type": "greeting",
                "message": f"Hello! I processed your greeting: '{task}'",
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }

        # File operations
        elif any(word in task_lower for word in ['create file', 'new file', 'touch']):
            filename = f"triniti_file_{int(time.time())}.txt"
            return {
                "type": "file_operation",
                "action": "file_created",
                "filename": filename,
                "path": f"/tmp/{filename}",
                "message": f"Created file: {filename}",
                "status": "completed"
            }

        # List operations
        elif any(word in task_lower for word in ['list', 'ls', 'dir', 'show files']):
            return {
                "type": "list_operation",
                "files": [
                    "/home/user/document1.txt",
                    "/home/user/project/main.py",
                    "/home/user/triniti/config.json"
                ],
                "count": 3,
                "status": "completed"
            }

        # Search operations
        elif any(word in task_lower for word in ['search', 'find', 'grep']):
            return {
                "type": "search_operation",
                "query": task,
                "results": [
                    {"file": "main.py", "line": 15, "match": "def search_function"},
                    {"file": "utils.py", "line": 8, "match": "search_pattern"}
                ],
                "count": 2,
                "status": "completed"
            }

        # Git operations
        elif any(word in task_lower for word in ['git', 'commit', 'push', 'pull']):
            return {
                "type": "git_operation",
                "command": task,
                "output": f"Executed git command: {task}",
                "status": "completed",
                "branch": "main"
            }

        # Code generation
        elif any(word in task_lower for word in ['generate', 'create code', 'write function']):
            return {
                "type": "code_generation",
                "language": "python",
                "code": f"# Generated code for: {task}\ndef generated_function():\n    return 'Hello from generated code'",
                "status": "completed"
            }

        # Default response
        else:
            return {
                "type": "general",
                "raw_output": f"Processed task: {task}",
                "message": f"Task '{task}' has been processed successfully",
                "status": "completed",
                "timestamp": datetime.now().isoformat()
            }

    def record_task_execution(self, response: TaskExecutionResponse, success: bool):
        """Record task execution in memory for TRINITI Memory System"""
        memory_entry = {
            "id": response.id,
            "timestamp": response.timestamp,
            "task": response.task,
            "result": response.result,
            "metadata": {
                "success": success,
                "duration": response.executionTime,
                "errors": [] if success else [str(response.result.get("error", "Unknown error"))],
                "tags": self.extract_tags(response.task),
                "priority": 5
            }
        }

        task_memory.append(memory_entry)

        # Keep only last 1000 tasks in memory
        if len(task_memory) > 1000:
            task_memory.pop(0)

    def extract_tags(self, task: str) -> List[str]:
        """Extract relevant tags from task description"""
        tags = []
        task_lower = task.lower()

        if any(word in task_lower for word in ['file', 'create', 'delete']):
            tags.append('file_operations')
        if any(word in task_lower for word in ['git', 'commit', 'push']):
            tags.append('git')
        if any(word in task_lower for word in ['search', 'find']):
            tags.append('search')
        if any(word in task_lower for word in ['code', 'generate', 'function']):
            tags.append('code_generation')
        if any(word in task_lower for word in ['hello', 'greet']):
            tags.append('greeting')

        return tags

# Initialize task executor instance
task_executor = TaskExecutor()

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "TRINITI Backend Server",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "task_execution": "/api/execute",
            "task_history": "/api/tasks",
            "task_statistics": "/api/tasks/stats",
            "health_check": "/api/health"
        }
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "triniti-backend",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def api_status():
    return {
        "backend": "running",
        "frontend": "http://localhost:3001",
        "ready": True,
        "task_runner": "available"
    }

# Unified Task Execution API Endpoints
class UnifiedTaskRequest(BaseModel):
    command: str
    metadata: Optional[Dict[str, Any]] = None
    timeout: Optional[int] = 30000

class UnifiedTaskResponse(BaseModel):
    id: str
    success: bool
    result: Any
    execution_time: float
    timestamp: int
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@app.post("/api/execute", response_model=UnifiedTaskResponse)
async def execute_task_unified(req: UnifiedTaskRequest):
    """
    Unified task execution endpoint for frontend integration
    """
    start_time = time.time()
    task_id = f"task_{int(time.time() * 1000)}_{uuid.uuid4().hex[:8]}"

    try:
        # Create task execution request
        task_request = TaskExecutionRequest(
            task=req.command,
            timestamp=int(time.time() * 1000)
        )

        # Execute the task
        result = await task_executor.execute_task(task_request)

        execution_time = time.time() - start_time

        return UnifiedTaskResponse(
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

        return UnifiedTaskResponse(
            id=task_id,
            success=False,
            result={'error': error_message},
            execution_time=execution_time,
            timestamp=int(time.time() * 1000),
            metadata=req.metadata,
            error=error_message
        )

@app.get("/api/tasks", response_model=Dict[str, Any])
async def get_task_history_unified(limit: int = 50, offset: int = 0):
    """
    Get task execution history in unified format
    """
    try:
        # Get recent tasks from memory
        recent_tasks = task_memory[-(limit + offset):]

        # Apply pagination
        paginated_tasks = recent_tasks[offset:offset + limit]

        return {
            "tasks": [
                {
                    "id": task["id"],
                    "task": task["task"],
                    "result": task["result"],
                    "timestamp": task["timestamp"],
                    "metadata": task["metadata"]
                }
                for task in paginated_tasks
            ],
            "total": len(task_memory),
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task history: {str(e)}")

@app.get("/api/tasks/stats", response_model=Dict[str, Any])
async def get_task_statistics_unified():
    """
    Get task execution statistics in unified format
    """
    try:
        if not task_memory:
            return {
                "totalTasks": 0,
                "successfulTasks": 0,
                "failedTasks": 0,
                "successRate": 0,
                "averageExecutionTime": 0,
                "mostCommonTags": []
            }

        total_tasks = len(task_memory)
        successful_tasks = sum(1 for task in task_memory if task["metadata"]["success"])
        failed_tasks = total_tasks - successful_tasks
        success_rate = (successful_tasks / total_tasks) * 100 if total_tasks > 0 else 0

        # Calculate average execution time
        execution_times = [task["metadata"]["duration"] for task in task_memory]
        avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0

        # Get most common tags
        all_tags = []
        for task in task_memory:
            all_tags.extend(task["metadata"].get("tags", []))

        tag_counts = {}
        for tag in all_tags:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

        most_common_tags = [
            {"tag": tag, "count": count}
            for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        return {
            "totalTasks": total_tasks,
            "successfulTasks": successful_tasks,
            "failedTasks": failed_tasks,
            "successRate": success_rate,
            "averageExecutionTime": avg_execution_time,
            "mostCommonTags": most_common_tags
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve statistics: {str(e)}")

@app.delete("/api/tasks")
async def clear_task_history_unified():
    """
    Clear all task history
    """
    try:
        task_memory.clear()
        return {"message": "Task history cleared successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear task history: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint for the task runner API
    """
    return {
        "status": "healthy",
        "service": "triniti-task-runner",
        "timestamp": datetime.now().isoformat(),
        "memory_system_initialized": True
    }

# Existing endpoints (keeping for compatibility)
@app.get("/api/options/config")
async def get_config():
    return {
        "FEATURE_FLAGS": {
            "ENABLE_BILLING": False,
            "ENABLE_MEMORY_SYSTEM": True,
            "ENABLE_TASK_EXECUTION": True
        }
    }

@app.get("/api/options/models")
async def get_models():
    return {
        "models": [
            {"id": "gpt-4", "name": "GPT-4", "provider": "openai"},
            {"id": "claude-3", "name": "Claude 3", "provider": "anthropic"},
            {"id": "gemini-pro", "name": "Gemini Pro", "provider": "google"}
        ]
    }

@app.get("/api/options/agents")
async def get_agents():
    return {
        "agents": [
            {"id": "default", "name": "Default Agent", "type": "general"},
            {"id": "code", "name": "Code Agent", "type": "programming"},
            {"id": "research", "name": "Research Agent", "type": "analysis"}
        ]
    }

@app.get("/api/options/security-analyzers")
async def get_security_analyzers():
    return {
        "analyzers": [
            {"id": "basic", "name": "Basic Security", "type": "static"},
            {"id": "advanced", "name": "Advanced Security", "type": "dynamic"}
        ]
    }

@app.get("/api/settings")
async def get_settings():
    return {
        "PROVIDER_TOKENS_SET": {
            "openai": True,
            "anthropic": True,
            "google": False
        },
        "GITHUB_TOKEN_SET": True,
        "ENABLE_BILLING": False,
        "ENABLE_MEMORY_SYSTEM": True,
        "ENABLE_TASK_EXECUTION": True
    }

@app.get("/api/user/info")
async def get_user_info():
    return {
        "id": "user_123",
        "name": "TRINITI User",
        "email": "user@triniti.dev",
        "preferences": {
            "theme": "dark",
            "language": "en"
        }
    }

@app.get("/api/user/repositories")
async def get_user_repositories(sort: str = "pushed"):
    return {
        "repositories": [
            {
                "id": "repo_1",
                "name": "triniti-project",
                "full_name": "user/triniti-project",
                "description": "TRINITI AI Development Platform",
                "language": "TypeScript",
                "updated_at": "2024-01-15T10:30:00Z"
            },
            {
                "id": "repo_2",
                "name": "demo-repo",
                "full_name": "user/demo-repo",
                "description": "Demo repository for testing",
                "language": "Python",
                "updated_at": "2024-01-10T15:45:00Z"
            }
        ]
    }

@app.get("/api/user/search/repositories")
async def search_repositories(query: str, per_page: int = 5):
    return {
        "repositories": [
            {
                "id": "search_1",
                "name": f"{query}-project",
                "full_name": f"user/{query}-project",
                "description": f"Project related to {query}",
                "language": "JavaScript"
            }
        ]
    }

@app.get("/api/user/repository/branches")
async def get_repository_branches(repository: str):
    return {
        "branches": [
            {"name": "main", "commit": {"sha": "abc123"}},
            {"name": "develop", "commit": {"sha": "def456"}},
            {"name": "feature/new-feature", "commit": {"sha": "ghi789"}}
        ]
    }

@app.get("/api/user/suggested-tasks")
async def get_suggested_tasks():
    return {
        "tasks": [
            "Create a new React component",
            "Fix authentication bug",
            "Add unit tests",
            "Update documentation",
            "Deploy to production"
        ]
    }

@app.get("/api/conversations")
async def get_conversations(limit: int = 20):
    return {
        "conversations": [
            {
                "id": "conv_1",
                "title": "React Component Development",
                "last_message": "Component created successfully",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        ]
    }

@app.get("/api/secrets")
async def get_secrets():
    return {
        "secrets": [
            {
                "id": "secret_1",
                "name": "API_KEY",
                "type": "environment",
                "last_used": "2024-01-15T10:30:00Z"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    import asyncio
    uvicorn.run(app, host="127.0.0.1", port=3000, reload=True)
