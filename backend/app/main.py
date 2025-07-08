"""
TRINITI Main Application
FastAPI application with CORS configuration and task runner integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio

# Create FastAPI app
app = FastAPI(
    title="TRINITI Backend Server",
    description="TRINITI AI Development Platform Backend",
    version="1.0.0"
)

# CORS Configuration
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
    allow_headers=["*"]
)

# Include Task Runner Router
try:
    from app.api.task_runner import router as task_runner_router
    app.include_router(task_runner_router)
    print("✅ Task Runner API router included successfully")
except ImportError as e:
    print(f"⚠️  Could not import task runner router: {e}")
    print("   Task execution endpoints will not be available")

# Root endpoint
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

# Health check endpoint
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "triniti-backend",
        "timestamp": "2024-01-15T10:30:00Z"
    }

# API status endpoint
@app.get("/api/status")
async def api_status():
    return {
        "backend": "running",
        "frontend": "http://localhost:3001",
        "ready": True,
        "task_runner": "available"
    }

if __name__ == "__main__":
    print("🚀 Starting TRINITI Backend Server...")
    print("📍 Backend: http://localhost:3000")
    print("📍 Frontend: http://localhost:3001")
    print("📍 API Docs: http://localhost:3000/docs")
    print("Press CTRL+C to stop")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3000,
        reload=True,
        log_level="info"
    )
