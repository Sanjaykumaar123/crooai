from backend.services.gemini_service import GeminiService

class ReportAgent:
    def __init__(self):
        self.agent_id = 5  # report-agent NFT id / Registry ID

    def run(self, query: str, news_data: str, analytics_data: str, verification_data: str) -> dict:
        system_instruction = (
            "You are an executive reporter. Compile a polished, publication-ready "
            "financial report. Combine news, quantitative analytics, and audit "
            "verification results. Use professional markdown layouts, bullet points, "
            "and summaries. Do not omit crucial disclaimers."
        )
        
        prompt = (
            f"Synthesize the final report for '{query}'.\n\n"
            f"### News Input:\n{news_data}\n\n"
            f"### Analytics Input:\n{analytics_data}\n\n"
            f"### Verification Audit:\n{verification_data}\n"
        )
        
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        return {
            "agent_id": self.agent_id,
            "name": "Report Agent",
            "raw_output": raw_output,
            "status": "completed"
        }
