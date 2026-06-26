from sqlalchemy import Column, String, Float, DateTime, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class SwarmExecution(Base):
    __tablename__ = "swarm_execution"

    execution_id = Column(String, primary_key=True)
    wallet = Column(String, nullable=True)
    query = Column(String, nullable=False)
    status = Column(String, default="running")  # running, completed, failed, cancelled
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    execution_time = Column(Float, nullable=True)

class AgentJob(Base):
    __tablename__ = "agent_jobs"

    job_id = Column(String, primary_key=True)
    execution_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    started = Column(DateTime, default=datetime.utcnow)
    completed = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)
    response = Column(String, nullable=True)

class AgentRelationship(Base):
    __tablename__ = "agent_relationships"

    # We add a unique primary key ID since SQLAlchemy requires it, or we use composite keys
    id = Column(String, primary_key=True)
    caller_agent = Column(String, nullable=False)
    callee_agent = Column(String, nullable=False)
    execution_id = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    status = Column(String, default="completed")
    timestamp = Column(DateTime, default=datetime.utcnow)
