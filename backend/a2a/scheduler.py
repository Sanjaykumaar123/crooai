import concurrent.futures
import time
import uuid
from datetime import datetime
from typing import Dict, Any, List

from backend.agents.research_agent import ResearchAgent
from backend.agents.news_agent import NewsAgent
from backend.agents.analytics_agent import AnalyticsAgent
from backend.agents.verification_agent import VerificationAgent
from backend.agents.report_agent import ReportAgent
from backend.agents.code_review_agent import CodeReviewAgent
from backend.agents.security_agent import SecurityAgent

from backend.services.supabase_service import SessionLocal
from backend.a2a.state import AgentJob

class AgentScheduler:
    @staticmethod
    def get_agent_instance(agent_name: str) -> Any:
        """Instantiate agent class by name."""
        name_map = {
            "Research": ResearchAgent,
            "News": NewsAgent,
            "Analytics": AnalyticsAgent,
            "Verification": VerificationAgent,
            "Report": ReportAgent,
            "Code Review": CodeReviewAgent,
            "Security": SecurityAgent
        }
        agent_class = name_map.get(agent_name)
        if not agent_class:
            raise ValueError(f"Unknown agent: {agent_name}")
        return agent_class()

    @staticmethod
    def execute_agent_with_retry(
        execution_id: str, 
        agent_name: str, 
        query: str, 
        extra_context: str = "",
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """Runs a single agent, logs to the agent_jobs table, and handles retries."""
        db = SessionLocal()
        job_id = str(uuid.uuid4())
        
        # Log job pending
        job_record = AgentJob(
            job_id=job_id,
            execution_id=execution_id,
            agent_name=agent_name,
            status="running",
            started=datetime.utcnow()
        )
        db.add(job_record)
        db.commit()
        db.close()
        
        start_time = time.time()
        agent = AgentScheduler.get_agent_instance(agent_name)
        
        attempt = 0
        success = False
        result = None
        error_msg = ""
        
        while attempt <= max_retries and not success:
            try:
                # Run the agent
                if agent_name == "Verification":
                    # Verification agent requires extra context
                    res = agent.run(query, extra_context)
                elif agent_name == "Report":
                    # Report agent requires news, analytics, verification outputs passed separately
                    # We will pass them inside a custom format if necessary
                    res = agent.run(query, extra_context, "", "") 
                else:
                    res = agent.run(query)
                
                success = True
                result = res.get("raw_output") or str(res)
            except Exception as e:
                attempt += 1
                error_msg = str(e)
                time.sleep(0.5) # small backoff
                
        duration = time.time() - start_time
        
        db = SessionLocal()
        job_record = db.query(AgentJob).filter_by(job_id=job_id).first()
        if job_record:
            job_record.status = "completed" if success else "failed"
            job_record.completed = datetime.utcnow()
            job_record.duration = duration
            job_record.response = result if success else f"Error: {error_msg}"
            db.commit()
        db.close()
        
        return {
            "agent_name": agent_name,
            "status": "completed" if success else "failed",
            "duration": duration,
            "response": result if success else f"Error: {error_msg}",
            "agent_id": getattr(agent, "agent_id", 0)
        }

    @staticmethod
    def run_parallel_jobs(
        execution_id: str, 
        agent_names: List[str], 
        query: str
    ) -> List[Dict[str, Any]]:
        """Run all chosen agents in parallel using a thread pool."""
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(agent_names)) as executor:
            future_to_agent = {
                executor.submit(
                    AgentScheduler.execute_agent_with_retry, 
                    execution_id, 
                    name, 
                    query
                ): name for name in agent_names
            }
            for future in concurrent.futures.as_completed(future_to_agent):
                agent_name = future_to_agent[future]
                try:
                    res = future.result()
                    results.append(res)
                except Exception as exc:
                    results.append({
                        "agent_name": agent_name,
                        "status": "failed",
                        "duration": 0.0,
                        "response": f"Exception in worker: {exc}",
                        "agent_id": 0
                    })
        return results
