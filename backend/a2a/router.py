import re
from typing import List
from backend.services.gemini_service import GeminiService

class AgentRouter:
    @staticmethod
    def route_task(query: str) -> List[str]:
        """
        Determine which agents are required to execute this task based on the query.
        Returns a list of agent names (excluding Research and Report, which are added automatically
        at the start and end of the workflow).
        """
        q_lower = query.lower()
        
        # Rule-based routing to ensure strict compliance with user examples
        if any(keyword in q_lower for keyword in ["tesla", "stock", "market", "ev", "nvidia", "apple", "finance", "crypto", "price", "valuation"]):
            # Analyze Tesla Stock or EV Market, etc.
            # "Analyze Tesla Stock" -> Research, News, Analytics, Verification
            return ["News", "Analytics", "Verification"]
            
        if any(keyword in q_lower for keyword in ["solidity", "contract", "audit", "security", "smart contract", "code", "bug"]):
            # Audit Solidity Contract -> Code Review, Security, Verification
            return ["Code Review", "Security", "Verification"]
            
        if any(keyword in q_lower for keyword in ["news", "summarize", "ai news", "feed", "latest"]):
            # Summarize AI News -> News, Report (which has Report anyway, but News is the main worker agent)
            return ["News"]
            
        # Fallback to LLM router to dynamically analyze the task
        system_instruction = (
            "You are a routing orchestrator for an AI agent swarm. "
            "Select the minimum required specialized agents to complete the query. "
            "The available agents are:\n"
            "- News: Gathers latest information, news, sentiment.\n"
            "- Analytics: Calculations, volatility regression, financial trends.\n"
            "- Code Review: Analyzes code structure, compliance, standard protocols.\n"
            "- Security: Vulnerabilities, smart contract auditing, exploits.\n"
            "- Verification: Verifies facts, cross-checks claims, compliance checks.\n"
            "\n"
            "Respond ONLY with a comma-separated list of the selected agents (e.g. 'News, Analytics, Verification'). "
            "Do not include Research or Report agents in your response."
        )
        
        try:
            response = GeminiService.generate(
                prompt=f"Task: '{query}'\nDetermine the list of required agents.",
                system_instruction=system_instruction
            )
            # Parse response
            selected = [name.strip() for name in response.split(",") if name.strip()]
            valid_agents = ["News", "Analytics", "Code Review", "Security", "Verification"]
            filtered = [s for s in selected if s in valid_agents]
            if filtered:
                return filtered
        except Exception:
            pass
            
        # Default fallback
        return ["News", "Analytics", "Verification"]
