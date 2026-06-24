from backend.services.gemini_service import GeminiService

class VerificationAgent:
    def __init__(self):
        self.agent_id = 4  # verification-agent NFT id / Registry ID

    def run(self, query: str, context_to_verify: str) -> dict:
        system_instruction = (
            "You are a rigorous financial fact-checker and consensus auditor. "
            "Scan the provided context for logical contradictions, hallucinations, "
            "exaggerated figures, or outdated facts. Provide a factual score out of 100."
        )
        
        prompt = (
            f"Audit and verify the claims made for query '{query}' based on "
            f"the following synthesized findings:\n\n{context_to_verify}"
        )
        
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        # Simple extraction of a trust score
        trust_score = 100
        if "warning" in raw_output.lower() or "discrepancy" in raw_output.lower():
            trust_score = 85
            
        return {
            "agent_id": self.agent_id,
            "name": "Verification Agent",
            "trust_score": trust_score,
            "raw_output": raw_output,
            "status": "completed"
        }
