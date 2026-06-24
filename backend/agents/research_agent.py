from backend.services.gemini_service import GeminiService
from backend.services.blockchain_service import BlockchainService

class ResearchAgent:
    def __init__(self):
        self.agent_id = 1  # research-agent NFT id / Registry ID

    def run(self, query: str) -> dict:
        system_instruction = (
            "You are a master research orchestrator agent. Plan the sub-steps "
            "needed to fulfill the query and construct the initial research scope."
        )
        
        prompt = f"Plan and scope the research task for query: '{query}'."
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        return {
            "agent_id": self.agent_id,
            "name": "Research Agent",
            "raw_output": raw_output,
            "status": "completed"
        }
