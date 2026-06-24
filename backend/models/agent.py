from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    category = Column(String)
    price = Column(Float, default=0.0)
    success_rate = Column(Float, default=100.0)
    tasks_completed = Column(Integer, default=0)
    rating = Column(Float, default=5.0)
