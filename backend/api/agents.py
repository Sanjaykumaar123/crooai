from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.services.supabase_service import get_db
from backend.models.agent import AgentModel

router = APIRouter(prefix="/agents", tags=["Agents"])

# Default initial agents list
INITIAL_AGENTS_SEED = [
    {"id": "research-agent", "name": "Research Agent", "description": "Advanced research agent that gathers, analyzes and summarizes information.", "category": "Research", "price": 0.02, "success_rate": 98.2, "tasks_completed": 1245, "rating": 4.9},
    {"id": "news-agent", "name": "News Agent", "description": "Real-time news aggregator and sentiment analyzer.", "category": "Data", "price": 0.015, "success_rate": 96.5, "tasks_completed": 850, "rating": 4.7},
    {"id": "analytics-agent", "name": "Analytics Agent", "description": "Processes large datasets, extracts statistical trends, and builds dynamic visual charts.", "category": "Analytics", "price": 0.025, "success_rate": 97.8, "tasks_completed": 2100, "rating": 4.8},
    {"id": "verification-agent", "name": "Verification Agent", "description": "Decentralized oracle agent that cross-checks facts and audits smart contract code.", "category": "Utility", "price": 0.018, "success_rate": 95.9, "tasks_completed": 920, "rating": 4.6},
    {"id": "report-agent", "name": "Report Agent", "description": "Generates professional corporate reports, newsletters, and PDF presentations.", "category": "Content", "price": 0.015, "success_rate": 94.8, "tasks_completed": 600, "rating": 4.5},
    {"id": "code-review-agent", "name": "Code Review Agent", "description": "Automated GitHub pull request reviewer that optimizes performance, readability, and security.", "category": "Development", "price": 0.022, "success_rate": 99.1, "tasks_completed": 3400, "rating": 4.9}
]

@router.get("")
def get_agents(db: Session = Depends(get_db)):
    agents = db.query(AgentModel).all()
    if not agents:
        # Seed the database if empty
        for item in INITIAL_AGENTS_SEED:
            agent_db = AgentModel(**item)
            db.add(agent_db)
        db.commit()
        agents = db.query(AgentModel).all()
        
    return agents
