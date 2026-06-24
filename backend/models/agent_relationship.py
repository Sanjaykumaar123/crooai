from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class AgentRelationshipModel(Base):
    __tablename__ = "agent_relationships"

    id = Column(String, primary_key=True)
    caller_agent = Column(String, nullable=False)
    callee_agent = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    status = Column(String, default="completed")
    timestamp = Column(DateTime, default=datetime.utcnow)
