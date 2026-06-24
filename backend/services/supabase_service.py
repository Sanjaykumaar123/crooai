import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# We can fall back to sqlite locally if SUPABASE_DB_URL is not set
DATABASE_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Use SQLite inside the workspace
    DATABASE_URL = "sqlite:///c:/Users/Sanjay Kumaar/croo/agentchain.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables if they don't exist (e.g. for sqlite/local dev testing)
def init_db():
    from backend.models.agent import Base as AgentBase
    from backend.models.execution import Base as ExecutionBase
    
    AgentBase.metadata.create_all(bind=engine)
    ExecutionBase.metadata.create_all(bind=engine)
