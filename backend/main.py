import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.services.supabase_service import init_db
from backend.api.agents import router as agents_router
from backend.api.executions import router as executions_router
from backend.api.marketplace import router as marketplace_router

# Initialize database tables
print("[FastAPI] Initializing Database Schema...")
init_db()

app = FastAPI(
    title="AgentChain Marketplace Swarm API",
    description="Decentralized Multi-Agent Swarm Orchestrator and Billing Engine Backend",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/testing ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(agents_router)
app.include_router(executions_router)
app.include_router(marketplace_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to AgentChain Marketplace Swarm API",
        "endpoints": {
            "execute": "POST /execute",
            "agents": "GET /agents",
            "executions": "GET /executions",
            "analytics": "GET /analytics"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
