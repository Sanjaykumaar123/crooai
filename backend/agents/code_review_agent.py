import os
from backend.services.gemini_service import GeminiService

class CodeReviewAgent:
    def __init__(self):
        self.agent_id = 6  # Code Review Agent registry ID

    def run(self, query: str) -> dict:
        system_instruction = (
            "You are an expert Solidity code reviewer. Analyze smart contract quality, "
            "standards (ERC-20, ERC-721, etc.), logic correctness, optimization opportunities, "
            "and structural flow. Suggest improvements for readability and gas efficiency."
        )
        
        # Read actual Solidity files from workspace to supply real-time context
        solidity_code = ""
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        contracts_dir = os.path.join(base_dir, "contracts")
        if os.path.exists(contracts_dir):
            for file in os.listdir(contracts_dir):
                if file.endswith(".sol"):
                    file_path = os.path.join(contracts_dir, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            solidity_code += f"\n\n--- File: {file} ---\n" + f.read()
                    except Exception:
                        pass
        
        prompt = f"Perform a comprehensive Solidity code review and structure analysis for: '{query}'."
        if solidity_code:
            prompt += f"\n\nHere is the actual smart contract source code from the repository workspace to review:\n{solidity_code}"
            
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        return {
            "agent_id": self.agent_id,
            "name": "Code Review Agent",
            "raw_output": raw_output,
            "status": "completed"
        }
