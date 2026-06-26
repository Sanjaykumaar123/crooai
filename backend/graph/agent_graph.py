import uuid
from typing import TypedDict, List, Dict, Any
from datetime import datetime
from langgraph.graph import StateGraph, END

from backend.agents.research_agent import ResearchAgent
from backend.agents.news_agent import NewsAgent
from backend.agents.analytics_agent import AnalyticsAgent
from backend.agents.verification_agent import VerificationAgent
from backend.agents.report_agent import ReportAgent

from backend.services.blockchain_service import BlockchainService
from backend.services.supabase_service import SessionLocal
from backend.models.execution import ExecutionModel
from backend.models.agent_relationship import AgentRelationshipModel

class AgentState(TypedDict):
    query: str
    research_plan: str
    news_output: str
    analytics_output: str
    verification_output: str
    report_output: str
    executions: List[Dict[str, Any]]

# Initialize agents
research_agent = ResearchAgent()
news_agent = NewsAgent()
analytics_agent = AnalyticsAgent()
verification_agent = VerificationAgent()
report_agent = ReportAgent()

def research_node(state: AgentState) -> Dict[str, Any]:
    print("Research Agent Started")
    res = research_agent.run(state["query"])
    return {
        "research_plan": res["raw_output"],
        "executions": state.get("executions", []) + [res]
    }

def news_node(state: AgentState) -> Dict[str, Any]:
    print("News Agent Executed")
    res = news_agent.run(state["query"])
    return {
        "news_output": res["raw_output"],
        "executions": state.get("executions", []) + [res]
    }

def analytics_node(state: AgentState) -> Dict[str, Any]:
    print("Analytics Agent Executed")
    res = analytics_agent.run(state["query"])
    return {
        "analytics_output": res["raw_output"],
        "executions": state.get("executions", []) + [res]
    }

def verification_node(state: AgentState) -> Dict[str, Any]:
    print("Verification Agent Executed")
    combined_context = f"NEWS:\n{state['news_output']}\n\nANALYTICS:\n{state['analytics_output']}"
    res = verification_agent.run(state["query"], combined_context)
    return {
        "verification_output": res["raw_output"],
        "executions": state.get("executions", []) + [res]
    }

def report_node(state: AgentState) -> Dict[str, Any]:
    print("Report Agent Executed")
    res = report_agent.run(
        state["query"], 
        state["news_output"], 
        state["analytics_output"], 
        state["verification_output"]
    )
    return {
        "report_output": res["raw_output"],
        "executions": state.get("executions", []) + [res]
    }

def logging_node(state: AgentState) -> Dict[str, Any]:
    print("Execution Logged On Chain")
    db = SessionLocal()
    
    # Define A2A paths to log
    # Path 1: Research -> News
    # Path 2: Research -> Analytics
    # Path 3: Research -> Verification
    # Path 4: Verification -> Report
    
    # Fetch initial transaction count nonce
    from web3 import Web3
    import os
    RPC_URL = os.getenv("RPC_URL") or "https://sepolia.base.org"
    PRIVATE_KEY = os.getenv("PRIVATE_KEY")
    start_nonce = None
    if PRIVATE_KEY and RPC_URL:
        try:
            w3 = Web3(Web3.HTTPProvider(RPC_URL))
            from eth_account import Account
            account = Account.from_key(PRIVATE_KEY)
            start_nonce = w3.eth.get_transaction_count(account.address)
        except Exception:
            pass

    handoffs = [
        {"caller": 1, "callee": 2, "task": "Fetch breaking sentiment feed", "gas": 48250, "cost": 0.00024},
        {"caller": 1, "callee": 3, "task": "Calculate volatility and regression metrics", "gas": 54100, "cost": 0.00027},
        {"caller": 1, "callee": 4, "task": "Audit claims for hallucinations", "gas": 92400, "cost": 0.00046},
        {"caller": 4, "callee": 5, "task": "Publish verified performance executive brief", "gas": 62100, "cost": 0.00031}
    ]
    
    logged_steps = []
    
    for i, handoff in enumerate(handoffs):
        caller_id = handoff["caller"]
        callee_id = handoff["callee"]
        task_desc = f"{state['query']}: {handoff['task']}"
        gas_wei = int(handoff["gas"] * 5 * 10**9) # converted to gas-cost in wei
        
        escrow_nonce = start_nonce + (i * 3) if start_nonce is not None else None
        release_nonce = start_nonce + (i * 3) + 1 if start_nonce is not None else None
        reputation_nonce = start_nonce + (i * 3) + 2 if start_nonce is not None else None
        
        # 1. Create Escrow on-chain (hiring callee agent)
        price_wei = int(handoff["cost"] * 10**18)
        escrow_id, escrow_tx = BlockchainService.create_escrow_on_chain(
            agent_id=callee_id,
            caller_id=caller_id,
            task_query=task_desc,
            payment_wei=price_wei,
            nonce=escrow_nonce
        )
        
        # 2. Release Escrow on-chain (payout callee agent and log execution)
        tx_hash = BlockchainService.release_escrow_on_chain(
            escrow_id=escrow_id,
            nonce=release_nonce
        )
        
        # 3. Update Reputation on-chain
        reputation_tx = BlockchainService.update_reputation_on_chain(
            agent_id=callee_id,
            points=2, # +2 for success
            is_success=True,
            nonce=reputation_nonce
        )
        
        # Save to database (Supabase/SQLite)
        exec_id = str(uuid.uuid4())
        db_exec = ExecutionModel(
            id=exec_id,
            task_query=task_desc,
            caller_agent_id=str(caller_id),
            callee_agent_id=str(callee_id),
            status="completed",
            result=state["report_output"][:1000] + "...", # Truncate large output
            gas_used=handoff["gas"],
            execution_cost=handoff["cost"],
            tx_hash=tx_hash,
            timestamp=datetime.utcnow()
        )
        
        db.add(db_exec)
        
        # Save A2A Relationship to database
        agent_names = {
            1: "Research Agent",
            2: "News Agent",
            3: "Analytics Agent",
            4: "Verification Agent",
            5: "Report Agent"
        }
        caller_name = agent_names.get(caller_id, "User")
        callee_name = agent_names.get(callee_id, "Agent")
        
        db_rel = AgentRelationshipModel(
            id=str(uuid.uuid4()),
            caller_agent=caller_name,
            callee_agent=callee_name,
            cost=handoff["cost"],
            status="completed",
            timestamp=datetime.utcnow()
        )
        db.add(db_rel)
        logged_steps.append({
            "id": exec_id,
            "caller": caller_id,
            "callee": callee_id,
            "task": task_desc,
            "tx_hash": tx_hash,
            "gas_used": handoff["gas"],
            "cost": handoff["cost"]
        })
        
    db.commit()
    db.close()
    
    return {
        "executions": logged_steps
    }

# Build StateGraph workflow
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("research", research_node)
workflow.add_node("news", news_node)
workflow.add_node("analytics", analytics_node)
workflow.add_node("verification", verification_node)
workflow.add_node("report", report_node)
workflow.add_node("logger", logging_node)

# Set entry point
workflow.set_entry_point("research")

# Define edges
workflow.add_edge("research", "news")
workflow.add_edge("news", "analytics")
workflow.add_edge("analytics", "verification")
workflow.add_edge("verification", "report")
workflow.add_edge("report", "logger")
workflow.add_edge("logger", END)

# Compile graph
agent_graph = workflow.compile()
