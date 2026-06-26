from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.services.supabase_service import get_db
from backend.models.execution import ExecutionModel
from backend.graph.agent_graph import agent_graph

router = APIRouter(tags=["Executions"])

class ExecuteRequest(BaseModel):
    query: str

@router.post("/execute")
def run_agent_workflow(payload: ExecuteRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        # Run LangGraph pipeline
        initial_state = {
            "query": payload.query,
            "research_plan": "",
            "news_output": "",
            "analytics_output": "",
            "verification_output": "",
            "report_output": "",
            "executions": []
        }
        
        result_state = agent_graph.invoke(initial_state)
        
        return {
            "report": result_state.get("report_output", ""),
            "execution_id": result_state.get("executions", [])[-1]["id"] if result_state.get("executions") else "unknown",
            "executions": result_state.get("executions", [])
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/executions")
def get_executions(db: Session = Depends(get_db)):
    return db.query(ExecutionModel).order_by(ExecutionModel.timestamp.desc()).all()
