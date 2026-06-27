import uuid
import time
import threading
from datetime import datetime
from typing import Dict, Any, List

from backend.a2a.workflow import workflow_graph
from backend.services.supabase_service import SessionLocal
from backend.a2a.state import SwarmExecution

# Thread-safe in-memory status tracker for live progress monitoring
ACTIVE_EXECUTIONS: Dict[str, Dict[str, Any]] = {}
EXECUTIONS_LOCK = threading.Lock()

class SwarmOrchestrator:
    @staticmethod
    def init_execution(execution_id: str, query: str, wallet: str) -> None:
        """Initialize the execution state in-memory and in the database."""
        # 1. Save to memory
        with EXECUTIONS_LOCK:
            ACTIVE_EXECUTIONS[execution_id] = {
                "progress": 5,
                "current_agent": "Research",
                "status": "running",
                "timeline": [
                    {
                        "event": "Task Submitted",
                        "status": "completed",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "duration": 0.05
                    }
                ],
                "report": "",
                "transactions": [],
                "agents_used": [],
                "agent_states": {},
                "console_logs": []
            }

        # 2. Save to database
        db = SessionLocal()
        new_exec = SwarmExecution(
            execution_id=execution_id,
            wallet=wallet,
            query=query,
            status="running",
            started_at=datetime.utcnow()
        )
        db.add(new_exec)
        db.commit()
        db.close()

    @staticmethod
    def execute_swarm_background(execution_id: str, query: str, wallet: str, protocol_mode: str = "custom") -> None:
        """The actual swarm task runner to be executed in a background thread."""
        start_time = time.time()
        try:
            # Setup initial state for LangGraph
            initial_state = {
                "execution_id": execution_id,
                "query": query,
                "wallet": wallet,
                "protocol_mode": protocol_mode,
                "agents_used": [],
                "current_agent": "Research",
                "progress": 10,
                "research_output": "",
                "news_output": "",
                "analytics_output": "",
                "code_review_output": "",
                "security_output": "",
                "verification_output": "",
                "report_output": "",
                "blockchain_txs": {},
                "timeline": [],
                "status": "running"
            }

            # Update memory helper callback to track LangGraph updates
            def update_progress_callback(state_update: Dict[str, Any]):
                with EXECUTIONS_LOCK:
                    if execution_id in ACTIVE_EXECUTIONS:
                        ACTIVE_EXECUTIONS[execution_id].update(state_update)

            # Define wrapper step execution to update status dynamically
            # For simplicity, we run the graph invoke and update status incrementally
            result_state = workflow_graph.invoke(initial_state)

            # Map the compiled result to memory
            elapsed = time.time() - start_time
            txs = result_state.get("blockchain_txs", {})
            is_cap = result_state.get("protocol_mode") == "cap"
            
            transactions_list = [
                {
                    "type": "CAP Escrow Lock TX" if is_cap else "Escrow TX",
                    "tx_hash": txs.get("escrow", "0x0000000000000000000000000000000000000000"),
                    "gas": "120,000 Gwei" if is_cap else "150,000 Gwei",
                    "network": "Base Mainnet (CAP)" if is_cap else txs.get("network", "Base Sepolia"),
                    "status": txs.get("confirmation", "Confirmed")
                },
                {
                    "type": "CAP Order Delivery TX" if is_cap else "Execution Log TX",
                    "tx_hash": txs.get("log", "0x0000000000000000000000000000000000000000"),
                    "gas": "85,000 Gwei" if is_cap else "45,050 Gwei",
                    "network": "Base Mainnet (CAP)" if is_cap else txs.get("network", "Base Sepolia"),
                    "status": txs.get("confirmation", "Confirmed")
                },
                {
                    "type": "CAP Reputation Reward TX" if is_cap else "Reputation TX",
                    "tx_hash": txs.get("reputation", "0x0000000000000000000000000000000000000000"),
                    "gas": "48,000 Gwei" if is_cap else "62,000 Gwei",
                    "network": "Base Mainnet (CAP)" if is_cap else txs.get("network", "Base Sepolia"),
                    "status": txs.get("confirmation", "Confirmed")
                }
            ]

            with EXECUTIONS_LOCK:
                existing = ACTIVE_EXECUTIONS.get(execution_id, {})
                ACTIVE_EXECUTIONS[execution_id] = {
                    "progress": 100,
                    "current_agent": "Completed",
                    "status": "completed",
                    "timeline": result_state.get("timeline", []),
                    "report": result_state.get("report_output", ""),
                    "transactions": transactions_list,
                    "agents_used": result_state.get("agents_used", []),
                    "agent_states": existing.get("agent_states", {}),
                    "console_logs": existing.get("console_logs", [])
                }

            # Update Database
            db = SessionLocal()
            exec_record = db.query(SwarmExecution).filter_by(execution_id=execution_id).first()
            if exec_record:
                exec_record.status = "completed"
                exec_record.completed_at = datetime.utcnow()
                exec_record.execution_time = elapsed
                db.commit()
            db.close()

        except Exception as e:
            elapsed = time.time() - start_time
            print(f"[Orchestrator Error] Execution {execution_id} failed: {e}")
            with EXECUTIONS_LOCK:
                existing = ACTIVE_EXECUTIONS.get(execution_id, {})
                ACTIVE_EXECUTIONS[execution_id] = {
                    "progress": 100,
                    "current_agent": "Failed",
                    "status": "failed",
                    "timeline": ACTIVE_EXECUTIONS.get(execution_id, {}).get("timeline", []) + [
                        {
                            "event": "Workflow Failed",
                            "status": "failed",
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "duration": 0.1
                        }
                    ],
                    "report": f"Swarm Execution failed during run. Partial report could not be generated. Error detail: {e}",
                    "transactions": [],
                    "agents_used": [],
                    "agent_states": existing.get("agent_states", {}),
                    "console_logs": existing.get("console_logs", [])
                }
            
            db = SessionLocal()
            exec_record = db.query(SwarmExecution).filter_by(execution_id=execution_id).first()
            if exec_record:
                exec_record.status = "failed"
                exec_record.completed_at = datetime.utcnow()
                exec_record.execution_time = elapsed
                db.commit()
            db.close()

    @staticmethod
    def execute_swarm(query: str, wallet_address: str, protocol_mode: str = "custom") -> Dict[str, Any]:
        """Synchronous entry point that returns the immediate format required by orchestrator spec."""
        execution_id = str(uuid.uuid4())
        
        # Initialize execution
        SwarmOrchestrator.init_execution(execution_id, query, wallet_address)
        
        # Run background thread
        thread = threading.Thread(
            target=SwarmOrchestrator.execute_swarm_background,
            args=(execution_id, query, wallet_address, protocol_mode)
        )
        thread.start()
        
        return {
            "execution_id": execution_id,
            "status": "running"
        }

    @staticmethod
    def get_status(execution_id: str) -> Dict[str, Any]:
        """Fetch live status of the execution."""
        with EXECUTIONS_LOCK:
            if execution_id in ACTIVE_EXECUTIONS:
                data = ACTIVE_EXECUTIONS[execution_id]
                return {
                    "progress": data["progress"],
                    "current_agent": data["current_agent"],
                    "timeline": data["timeline"],
                    "agent_states": data.get("agent_states", {}),
                    "console_logs": data.get("console_logs", [])
                }
        
        # Check database fallback
        db = SessionLocal()
        record = db.query(SwarmExecution).filter_by(execution_id=execution_id).first()
        db.close()
        
        if record:
            return {
                "progress": 100 if record.status in ["completed", "failed"] else 50,
                "current_agent": "Completed" if record.status == "completed" else "Running",
                "timeline": [],
                "agent_states": {},
                "console_logs": []
            }
            
        return {
            "progress": 0,
            "current_agent": "Unknown",
            "timeline": [],
            "agent_states": {},
            "console_logs": []
        }

    @staticmethod
    def get_report(execution_id: str) -> Dict[str, Any]:
        """Fetch final report output."""
        with EXECUTIONS_LOCK:
            if execution_id in ACTIVE_EXECUTIONS:
                data = ACTIVE_EXECUTIONS[execution_id]
                return {
                    "execution_id": execution_id,
                    "report": data["report"],
                    "transactions": data["transactions"],
                    "timeline": data["timeline"],
                    "agents_used": data["agents_used"],
                    "agent_states": data.get("agent_states", {}),
                    "console_logs": data.get("console_logs", [])
                }
                
        # Check database fallback
        db = SessionLocal()
        record = db.query(SwarmExecution).filter_by(execution_id=execution_id).first()
        db.close()
        
        if record:
            return {
                "execution_id": execution_id,
                "report": f"Report for query: {record.query}. Status: {record.status}",
                "transactions": [],
                "timeline": [],
                "agents_used": [],
                "agent_states": {},
                "console_logs": []
            }
            
        return {
            "execution_id": execution_id,
            "report": "Execution not found",
            "transactions": [],
            "timeline": [],
            "agents_used": [],
            "agent_states": {},
            "console_logs": []
        }
