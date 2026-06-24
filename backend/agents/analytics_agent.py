from pydantic import BaseModel
from backend.services.gemini_service import GeminiService

class AnalyticsAgent:
    def __init__(self):
        self.agent_id = 3  # analytics-agent NFT id / Registry ID

    def run(self, query: str) -> dict:
        system_instruction = (
            "You are an expert quantitative research analyst. "
            "Calculate key technical indicators, support/resistance bands, "
            "and statistical volatility projections for the asset."
        )
        
        prompt = f"Run detailed analytics, volatility regression, and trend indicators for: '{query}'."
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        return {
            "agent_id": self.agent_id,
            "name": "Analytics Agent",
            "raw_output": raw_output,
            "status": "completed"
        }
