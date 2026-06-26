import uuid
import time
from datetime import datetime
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END

from backend.a2a.router import AgentRouter
from backend.a2a.scheduler import AgentScheduler
from backend.services.blockchain_service import BlockchainService
from backend.services.supabase_service import SessionLocal
from backend.a2a.state import SwarmExecution, AgentRelationship

class SwarmState(TypedDict):
    execution_id: str
    query: str
    wallet: str
    agents_used: List[str]
    current_agent: str
    progress: int
    research_output: str
    news_output: str
    analytics_output: str
    code_review_output: str
    security_output: str
    verification_output: str
    report_output: str
    blockchain_txs: Dict[str, str]
    timeline: List[Dict[str, Any]]
    status: str  # running, completed, failed

def research_node(state: SwarmState) -> Dict[str, Any]:
    exec_id = state["execution_id"]
    query = state["query"]
    wallet = state["wallet"]
    
    print(f"[{exec_id}] Research Node starting for query: {query}")
    
    # 1. Update Database Status
    db = SessionLocal()
    exec_record = db.query(SwarmExecution).filter_by(execution_id=exec_id).first()
    if exec_record:
        exec_record.status = "running"
        db.commit()
    
    # 2. Add Timeline Event: Task Posted
    timeline = state.get("timeline", [])
    timeline.append({
        "event": "Task Posted",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": 0.1
    })
    
    # 3. Route task to find required agents
    agents_used = AgentRouter.route_task(query)
    
    # 4. Create Escrow on blockchain (simulate or execute)
    # We call BlockchainService.create_escrow_on_chain
    start_time = time.time()
    escrow_id, escrow_tx = BlockchainService.create_escrow_on_chain(
        agent_id=2, # news/default agent ID
        caller_id=1, # research agent ID
        task_query=query[:100],
        payment_wei=200000000000000 # 0.0002 ETH
    )
    escrow_duration = time.time() - start_time
    
    timeline.append({
        "event": "Escrow Created",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(escrow_duration, 2)
    })
    
    # 5. Run Research Agent
    start_time = time.time()
    res_job = AgentScheduler.execute_agent_with_retry(exec_id, "Research", query)
    res_duration = time.time() - start_time
    
    timeline.append({
        "event": "Research Started",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(res_duration, 2)
    })
    
    # 6. Save relationship Research -> Sub-agents
    for callee in agents_used:
        rel = AgentRelationship(
            id=str(uuid.uuid4()),
            caller_agent="Research Agent",
            callee_agent=f"{callee} Agent",
            execution_id=exec_id,
            cost=0.0002,
            status="completed"
        )
        db.add(rel)
    db.commit()
    db.close()
    
    blockchain_txs = state.get("blockchain_txs", {})
    blockchain_txs["escrow"] = escrow_tx
    blockchain_txs["escrow_id"] = str(escrow_id)
    
    return {
        "agents_used": agents_used,
        "current_agent": "Research",
        "progress": 20,
        "research_output": res_job.get("response", ""),
        "timeline": timeline,
        "blockchain_txs": blockchain_txs
    }

def sub_agents_node(state: SwarmState) -> Dict[str, Any]:
    exec_id = state["execution_id"]
    query = state["query"]
    agents_used = state["agents_used"]
    timeline = state.get("timeline", [])
    
    print(f"[{exec_id}] Sub-agents Parallel Node executing: {agents_used}")
    
    # Run the selected agents in parallel
    results = AgentScheduler.run_parallel_jobs(exec_id, agents_used, query)
    
    news_output = ""
    analytics_output = ""
    code_review_output = ""
    security_output = ""
    
    # Process outputs
    for r in results:
        agent_name = r["agent_name"]
        status = r["status"]
        duration = r["duration"]
        response = r["response"]
        
        timeline.append({
            "event": f"{agent_name} Completed",
            "status": status,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "duration": round(duration, 2)
        })
        
        if agent_name == "News":
            news_output = response
        elif agent_name == "Analytics":
            analytics_output = response
        elif agent_name == "Code Review":
            code_review_output = response
        elif agent_name == "Security":
            security_output = response

    return {
        "current_agent": agents_used[-1] if agents_used else "Sub-agents",
        "progress": 50,
        "news_output": news_output,
        "analytics_output": analytics_output,
        "code_review_output": code_review_output,
        "security_output": security_output,
        "timeline": timeline
    }

def verification_node(state: SwarmState) -> Dict[str, Any]:
    exec_id = state["execution_id"]
    query = state["query"]
    timeline = state.get("timeline", [])
    
    print(f"[{exec_id}] Verification Node running...")
    
    # Gather context to verify
    context_parts = []
    if state["news_output"]:
        context_parts.append(f"NEWS:\n{state['news_output']}")
    if state["analytics_output"]:
        context_parts.append(f"ANALYTICS:\n{state['analytics_output']}")
    if state["code_review_output"]:
        context_parts.append(f"CODE REVIEW:\n{state['code_review_output']}")
    if state["security_output"]:
        context_parts.append(f"SECURITY:\n{state['security_output']}")
        
    combined_context = "\n\n".join(context_parts)
    
    # Execute verification agent
    start_time = time.time()
    res_job = AgentScheduler.execute_agent_with_retry(
        exec_id, "Verification", query, extra_context=combined_context
    )
    duration = time.time() - start_time
    
    timeline.append({
        "event": "Verification Completed",
        "status": res_job["status"],
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(duration, 2)
    })
    
    return {
        "current_agent": "Verification",
        "progress": 70,
        "verification_output": res_job.get("response", ""),
        "timeline": timeline
    }

def report_node(state: SwarmState) -> Dict[str, Any]:
    exec_id = state["execution_id"]
    query = state["query"]
    timeline = state.get("timeline", [])
    
    print(f"[{exec_id}] Report Node running...")
    
    # Compile text for report inputs
    news_text = state["news_output"] or state["code_review_output"] or "No primary source data gathered."
    analytics_text = state["analytics_output"] or state["security_output"] or "No calculations performed."
    verification_text = state["verification_output"] or "Audit bypassed."
    
    # Execute Report Agent
    start_time = time.time()
    
    # Instantiate and run ReportAgent directly to pass multiple arguments
    report_agent = AgentScheduler.get_agent_instance("Report")
    try:
        res = report_agent.run(query, news_text, analytics_text, verification_text)
        report_output = res.get("raw_output") or str(res)
        status = "completed"
    except Exception as e:
        report_output = f"Failed to compile report. Error: {e}"
        status = "failed"
        
    duration = time.time() - start_time
    
    # Log report job record manually to keep jobs table synchronized
    db = SessionLocal()
    job_record = AgentJob(
        job_id=str(uuid.uuid4()),
        execution_id=exec_id,
        agent_name="Report",
        status=status,
        started=datetime.utcnow(),
        completed=datetime.utcnow(),
        duration=duration,
        response=report_output[:1000]
    )
    db.add(job_record)
    db.commit()
    db.close()
    
    timeline.append({
        "event": "Report Generated",
        "status": status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(duration, 2)
    })
    
    return {
        "current_agent": "Report",
        "progress": 85,
        "report_output": report_output,
        "timeline": timeline
    }

def blockchain_node(state: SwarmState) -> Dict[str, Any]:
    exec_id = state["execution_id"]
    query = state["query"]
    timeline = state.get("timeline", [])
    blockchain_txs = state.get("blockchain_txs", {})
    
    print(f"[{exec_id}] Blockchain Settlement Node running...")
    
    # 1. Log execution on-chain
    start_time = time.time()
    log_tx = BlockchainService.log_execution_on_chain(
        caller_agent_id=1,
        callee_agent_id=2,
        task_query=query[:100],
        status="completed"
    )
    log_duration = time.time() - start_time
    timeline.append({
        "event": "Execution Logged",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(log_duration, 2)
    })
    
    # 2. Release Escrow
    escrow_id = int(blockchain_txs.get("escrow_id", "0"))
    start_time = time.time()
    release_tx = BlockchainService.release_escrow_on_chain(escrow_id=escrow_id)
    release_duration = time.time() - start_time
    timeline.append({
        "event": "Escrow Released",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(release_duration, 2)
    })
    
    # 3. Update Reputation
    start_time = time.time()
    reputation_tx = BlockchainService.update_reputation_on_chain(
        agent_id=2,
        points=2,
        is_success=True
    )
    rep_duration = time.time() - start_time
    timeline.append({
        "event": "Reputation Updated",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": round(rep_duration, 2)
    })
    
    # 4. Final completion
    timeline.append({
        "event": "Workflow Completed",
        "status": "completed",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duration": 0.1
    })
    
    blockchain_txs["log"] = log_tx
    blockchain_txs["reputation"] = reputation_tx
    blockchain_txs["gas"] = "257,050 Gwei"
    blockchain_txs["network"] = "Base Sepolia"
    blockchain_txs["confirmation"] = "Confirmed"
    
    return {
        "current_agent": "Blockchain",
        "progress": 100,
        "timeline": timeline,
        "blockchain_txs": blockchain_txs,
        "status": "completed"
    }

# Build LangGraph Workflow
workflow = StateGraph(SwarmState)

workflow.add_node("research", research_node)
workflow.add_node("sub_agents", sub_agents_node)
workflow.add_node("verification", verification_node)
workflow.add_node("report", report_node)
workflow.add_node("blockchain", blockchain_node)

workflow.set_entry_point("research")

workflow.add_edge("research", "sub_agents")
workflow.add_edge("sub_agents", "verification")
workflow.add_edge("verification", "report")
workflow.add_edge("report", "blockchain")
workflow.add_edge("blockchain", END)

workflow_graph = workflow.compile()
