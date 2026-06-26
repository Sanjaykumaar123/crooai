from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.services.supabase_service import get_db
from backend.models.execution import ExecutionModel
from backend.models.agent_relationship import AgentRelationshipModel

router = APIRouter(tags=["Marketplace"])

@router.get("/analytics")
def get_analytics_metrics(db: Session = Depends(get_db)):
    # Calculate aggregations from executions table
    total_calls = db.query(func.count(ExecutionModel.id)).scalar() or 0
    total_volume = db.query(func.sum(ExecutionModel.execution_cost)).scalar() or 0.0
    
    # We can also compute unique callers/callees interactions (A2A Handoffs)
    a2a_handoffs = db.query(ExecutionModel).filter(
        ExecutionModel.caller_agent_id.isnot(None),
        ExecutionModel.callee_agent_id.isnot(None)
    ).count()

    # Average gas used
    avg_gas = db.query(func.avg(ExecutionModel.gas_used)).scalar() or 0

    # Aggregate relationship hires and values
    relations = db.query(
        AgentRelationshipModel.caller_agent,
        AgentRelationshipModel.callee_agent,
        func.count(AgentRelationshipModel.id).label("total_hires"),
        func.sum(AgentRelationshipModel.cost).label("total_value")
    ).group_by(
        AgentRelationshipModel.caller_agent,
        AgentRelationshipModel.callee_agent
    ).all()
    
    relation_list = []
    for r in relations:
        relation_list.append({
            "caller": r.caller_agent,
            "callee": r.callee_agent,
            "total_hires": r.total_hires,
            "total_value": float(round(r.total_value or 0.0, 5))
        })
    
    return {
        "total_volume_croo": float(round(total_volume, 5)),
        "total_api_calls": total_calls,
        "a2a_handoffs": a2a_handoffs,
        "avg_gas_used": int(avg_gas),
        "relationships": relation_list,
        "status_distribution": {
            "completed": db.query(ExecutionModel).filter(ExecutionModel.status == "completed").count(),
            "failed": db.query(ExecutionModel).filter(ExecutionModel.status == "failed").count()
        }
    }
