import re
import json
from typing import List, Dict, Any
from backend.services.gemini_service import GeminiService

class AgentRouter:
    @staticmethod
    def route_task(query: str) -> List[str]:
        """
        Determine which agents are required to execute this task based on the query.
        Returns a list of agent names (excluding Research and Report, which are added automatically
        at the start and end of the workflow).
        """
        classification = AgentRouter.classify_query(query)
        selected = classification["selected_agents"]
        # Filter out Research and Report for backward compatibility in routing nodes
        sub_agents = [s for s in selected if s not in ["Research", "Report"]]
        return sub_agents

    @staticmethod
    def classify_query(query: str) -> Dict[str, Any]:
        """
        Classifies the query domain, estimates confidence, selects appropriate agents,
        calculates estimated costs & times, and explains fallback decisions.
        Uses fast rule-based matching for recognized domains and only calls LLM
        for completely unrecognized queries.
        """
        q_lower = query.lower()

        # Rule-based domain detection - returns instantly without LLM
        domain = None
        confidence = 98
        selected = None
        explanation = ""

        if any(keyword in q_lower for keyword in [
            "zoho", "tesla", "stock", "market", "ev", "nvidia", "apple",
            "finance", "crypto", "price", "valuation", "nifty", "sensex",
            "share", "invest", "portfolio", "equity", "ipo", "bull", "bear"
        ]):
            domain = "Finance"
            confidence = 99
            selected = ["Research", "News", "Analytics", "Verification", "Report"]

        elif any(keyword in q_lower for keyword in [
            "solidity", "contract", "audit", "smart contract", "reentrancy", "exploit", "defi", "bytecode", "evm"
        ]) or "audit solidity contract" in q_lower:
            domain = "Smart Contract Audit"
            confidence = 98
            selected = ["Research", "Code Review", "Verification", "Report"]

        elif any(keyword in q_lower for keyword in [
            "compare", "comparison", "openai", "anthropic", "gpt", "claude", "gemini", "versus", "vs", "llm"
        ]) or "compare gpt and claude" in q_lower:
            domain = "AI Comparison"
            confidence = 97
            selected = ["Research", "Analytics", "Report"]
            explanation = "Analytics Agent computes comparative performance and cost metrics."

        elif any(keyword in q_lower for keyword in [
            "quantum", "physics", "computing", "explain"
        ]) or "explain quantum computing" in q_lower:
            domain = "Quantum Computing"
            confidence = 95
            selected = ["Research", "Report"]

        # Rule-based match: return immediately without calling LLM
        if domain is not None:
            sub_agents = [s for s in selected if s not in ["Research", "Report"]]
            est_time = 6 + len(sub_agents) * 3
            est_cost = 0.010 + len(sub_agents) * 0.004
            return {
                "domain": domain,
                "confidence": confidence,
                "selected_agents": selected,
                "estimated_cost": round(est_cost, 3),
                "estimated_time": est_time,
                "expected_parallel_jobs": len(sub_agents),
                "explanation": explanation
            }

        # For unrecognized queries, use LLM for smarter routing
        system_instruction = (
            "You are a routing orchestrator for a decentralized AI workforce swarm. "
            "Classify the query into a domain, choose the required agents "
            "(from: News, Analytics, Code Review, Security, Verification), "
            "assign an integer confidence percentage (0-100), and write a one-sentence "
            "explanation if a specialized agent is not available and you are fallback routing "
            "to generic agents.\n\n"
            "Return ONLY a valid JSON block with these keys:\n"
            "{\n"
            "  \"domain\": \"Domain Name\",\n"
            "  \"confidence\": 92,\n"
            "  \"selected_agents\": [\"News\", \"Analytics\"],\n"
            "  \"explanation\": \"No dedicated agent found. Reusing News & Analytics.\"\n"
            "}"
        )

        try:
            response = GeminiService.generate(
                prompt=f"Task: '{query}'",
                system_instruction=system_instruction
            )
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1].split("```")[0].strip()

            data = json.loads(cleaned)

            sub_agents = data.get("selected_agents", [])
            valid_agents = ["News", "Analytics", "Code Review", "Security", "Verification"]
            filtered_sub = [s for s in sub_agents if s in valid_agents]

            selected_all = ["Research"] + filtered_sub + ["Report"]
            est_time = 6 + len(filtered_sub) * 3
            est_cost = 0.010 + len(filtered_sub) * 0.004

            return {
                "domain": data.get("domain", "General Knowledge"),
                "confidence": data.get("confidence", 92),
                "selected_agents": selected_all,
                "estimated_cost": round(est_cost, 3),
                "estimated_time": est_time,
                "expected_parallel_jobs": len(filtered_sub),
                "explanation": data.get("explanation", "No specialized agent matched. Using General Knowledge Pipeline.")
            }
        except Exception:
            pass  # fall through to final fallback

        # Final fallback: minimal General Knowledge pipeline
        return {
            "domain": "General Knowledge",
            "confidence": 92,
            "selected_agents": ["Research", "Report"],
            "estimated_cost": 0.010,
            "estimated_time": 6,
            "expected_parallel_jobs": 0,
            "explanation": "No specialized agent found. Using General Knowledge Pipeline."
        }
