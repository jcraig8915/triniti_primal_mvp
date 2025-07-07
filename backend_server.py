from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="OpenDevin Backend", version="0.48.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "OpenDevin Backend Server",
        "status": "running",
        "version": "0.48.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "opendevin-backend"}

@app.get("/api/status")
async def api_status():
    return {
        "backend": "running",
        "frontend": "http://localhost:3000",
        "ready": True
    }

@app.get("/api/options/config")
async def get_config():
    # Match the expected frontend structure
    return {
        "APP_MODE": "oss",
        "GITHUB_CLIENT_ID": "",
        "POSTHOG_CLIENT_KEY": "phc_3ESMmY9SgqEAGBB6sMGK5ayYHkeUuknH2vP6FmWH9RA",
        "FEATURE_FLAGS": {
            "ENABLE_BILLING": False,
            "HIDE_LLM_SETTINGS": False,
        }
    }

@app.get("/api/options/models")
async def get_models():
    return {
        "providers": {
            "openai": ["gpt-4o", "gpt-3.5-turbo"],
            "anthropic": ["claude-3-haiku"],
        }
    }

@app.get("/api/options/agents")
async def get_agents():
    return ["CodeActAgent"]

@app.get("/api/options/security-analyzers")
async def get_security_analyzers():
    return ["bandit", "semgrep", "safety"]

@app.get("/api/options/settings")
async def get_settings():
    # You can expand later; keeping it minimal for now
    return {"orgName": "TRINITI-Dev", "defaultProvider": "openai"}

@app.get("/api/settings")
async def get_api_settings():
    # Return the proper settings structure that matches the frontend's Settings type
    return {
        "llm_model": "anthropic/claude-sonnet-4-20250514",
        "llm_base_url": "",
        "agent": "CodeActAgent",
        "language": "en",
        "llm_api_key_set": False,
        "search_api_key_set": False,
        "confirmation_mode": False,
        "security_analyzer": "",
        "remote_runtime_resource_factor": 1,
        "provider_tokens_set": {
            "github": None,
            "gitlab": None,
            "bitbucket": None
        },
        "enable_default_condenser": True,
        "enable_sound_notifications": False,
        "enable_proactive_conversation_starters": False,
        "user_consents_to_analytics": False,
        "search_api_key": "",
        "max_budget_per_task": None,
        "email": "",
        "email_verified": True,
        "mcp_config": {
            "sse_servers": [],
            "stdio_servers": []
        }
    }

@app.get("/api/user/info")
async def get_user_info():
    return {
        "id": 1,
        "login": "demo-user",
        "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
        "company": "TRINITI-Dev",
        "name": "Demo User",
        "email": "demo@triniti.dev"
    }

@app.get("/api/user/repositories")
async def get_user_repositories():
    return [
        {
            "id": 1,
            "name": "demo-repo",
            "full_name": "demo-user/demo-repo",
            "private": False,
            "html_url": "https://github.com/demo-user/demo-repo",
            "description": "A demo repository",
            "fork": False,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "pushed_at": "2024-01-01T00:00:00Z",
            "language": "Python",
            "default_branch": "main"
        }
    ]

@app.get("/api/user/search/repositories")
async def search_user_repositories():
    return [
        {
            "id": 1,
            "name": "demo-repo",
            "full_name": "demo-user/demo-repo",
            "private": False,
            "html_url": "https://github.com/demo-user/demo-repo",
            "description": "A demo repository",
            "fork": False,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "pushed_at": "2024-01-01T00:00:00Z",
            "language": "Python",
            "default_branch": "main"
        }
    ]

@app.get("/api/user/repository/branches")
async def get_repository_branches():
    return [
        {
            "name": "main",
            "commit": {
                "sha": "abc123",
                "url": "https://api.github.com/repos/demo-user/demo-repo/commits/abc123"
            },
            "protected": False
        },
        {
            "name": "develop",
            "commit": {
                "sha": "def456",
                "url": "https://api.github.com/repos/demo-user/demo-repo/commits/def456"
            },
            "protected": False
        }
    ]

@app.get("/api/secrets")
async def get_secrets():
    return {
        "secrets": [],
        "total": 0
    }

@app.get("/api/security/policy")
async def get_security_policy():
    return {"enabled": False, "rules": []}

@app.get("/api/security/settings")
async def get_security_settings():
    return {"enabled": False, "analyzers": []}

@app.get("/api/user/suggested-tasks")
async def get_suggested_tasks():
    return {"tasks": []}

@app.get("/api/conversations")
async def list_conversations():
    return []                       # empty history is fine

if __name__ == "__main__":
    print("🚀 Starting OpenDevin Backend Server...")
    print("📍 Backend: http://localhost:3002")
    print("📍 Frontend: http://localhost:3000")
    print("Press CTRL+C to stop")
    uvicorn.run(app, host="0.0.0.0", port=3002, reload=True)
