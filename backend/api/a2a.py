from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy import func

from backend.services.supabase_service import get_db
from backend.a2a.state import SwarmExecution, AgentJob, AgentRelationship
from backend.a2a.orchestrator import SwarmOrchestrator

router = APIRouter(prefix="/api/a2a", tags=["A2A Swarm"])

class SwarmExecuteRequest(BaseModel):
    query: str
    wallet: str
    protocol_mode: str = "custom"

class SwarmClassifyRequest(BaseModel):
    query: str

@router.post("/classify")
def classify_swarm_api(payload: SwarmClassifyRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    from backend.a2a.router import AgentRouter
    res = AgentRouter.classify_query(payload.query)
    return res

@router.post("/execute")
def execute_swarm_api(payload: SwarmExecuteRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Trigger orchestrator
    res = SwarmOrchestrator.execute_swarm(payload.query, payload.wallet, payload.protocol_mode)
    return res

@router.get("/status/{execution_id}")
def get_swarm_status_api(execution_id: str):
    status = SwarmOrchestrator.get_status(execution_id)
    return status

@router.get("/report/{execution_id}")
def get_swarm_report_api(execution_id: str):
    report = SwarmOrchestrator.get_report(execution_id)
    return report

@router.get("/history")
def get_swarm_history_api(db: Session = Depends(get_db)):
    executions = db.query(SwarmExecution).order_by(SwarmExecution.started_at.desc()).all()
    return [
        {
            "execution_id": e.execution_id,
            "wallet": e.wallet,
            "query": e.query,
            "status": e.status,
            "started_at": e.started_at.isoformat() + "Z" if e.started_at else None,
            "completed_at": e.completed_at.isoformat() + "Z" if e.completed_at else None,
            "execution_time": e.execution_time
        }
        for e in executions
    ]

@router.get("/network")
def get_agent_network_api():
    # Return edges showing relationships in the A2A network
    # For a fully dynamic representation, we can show common flows:
    return [
        {"from": "Research", "to": "News"},
        {"from": "Research", "to": "Analytics"},
        {"from": "Research", "to": "Code Review"},
        {"from": "Research", "to": "Security"},
        {"from": "News", "to": "Verification"},
        {"from": "Analytics", "to": "Verification"},
        {"from": "Code Review", "to": "Verification"},
        {"from": "Security", "to": "Verification"},
        {"from": "Verification", "to": "Report"},
        {"from": "Report", "to": "Blockchain"}
    ]

@router.get("/analytics")
def get_swarm_analytics_api(db: Session = Depends(get_db)):
    # 1. Total execution count
    count = db.query(func.count(SwarmExecution.execution_id)).scalar() or 0
    
    # 2. Average duration
    avg_duration = db.query(func.avg(SwarmExecution.execution_time)).scalar() or 0.0
    avg_duration = round(float(avg_duration), 2)
    
    # 3. Revenue generated (sum of relationships cost)
    revenue = db.query(func.sum(AgentRelationship.cost)).scalar() or 0.0
    revenue = round(float(revenue), 5)
    
    # 4. Most used agent
    most_used = "News"
    agent_counts = db.query(
        AgentJob.agent_name, func.count(AgentJob.job_id)
    ).group_by(AgentJob.agent_name).order_by(func.count(AgentJob.job_id).desc()).first()
    if agent_counts:
        most_used = agent_counts[0]
        
    # 5. Fastest agent (average duration)
    fastest_agent = "News"
    fastest_data = db.query(
        AgentJob.agent_name, func.avg(AgentJob.duration)
    ).filter(AgentJob.status == "completed").group_by(AgentJob.agent_name).order_by(func.avg(AgentJob.duration).asc()).first()
    if fastest_data:
        fastest_agent = fastest_data[0]
        
    return {
        "most_used_agent": most_used,
        "fastest_agent": fastest_agent,
        "revenue": revenue,
        "execution_count": count,
        "average_duration": avg_duration
    }
