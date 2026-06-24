from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class ExecutionModel(Base):
    __tablename__ = "executions"

    id = Column(String, primary_key=True)
    task_query = Column(String, nullable=False)
    caller_agent_id = Column(String, nullable=True)
    callee_agent_id = Column(String, nullable=True)
    status = Column(String, default="pending")
    result = Column(String, nullable=True)
    gas_used = Column(Integer, default=0)
    execution_cost = Column(Float, default=0.0)
    tx_hash = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
