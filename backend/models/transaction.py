from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    agent_id = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    tx_hash = Column(String, nullable=True)
    status = Column(String, default="completed")
    timestamp = Column(DateTime, default=datetime.utcnow)
