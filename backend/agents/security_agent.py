import os
from backend.services.gemini_service import GeminiService

class SecurityAgent:
    def __init__(self):
        self.agent_id = 7  # Security Agent registry ID

    def run(self, query: str) -> dict:
        system_instruction = (
            "You are a critical smart contract security auditor. Scan the code and context "
            "for vulnerability vectors (e.g., Reentrancy, Integer Overflow, Access Control flaws, "
            "Front-running, Unchecked external calls, Flash loan attack vectors). Suggest explicit mitigations."
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
        
        prompt = f"Perform a rigorous security audit and vulnerability analysis for: '{query}'."
        if solidity_code:
            prompt += f"\n\nHere is the actual smart contract source code from the repository workspace to audit:\n{solidity_code}"
            
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        return {
            "agent_id": self.agent_id,
            "name": "Security Agent",
            "raw_output": raw_output,
            "status": "completed"
        }
