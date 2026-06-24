from pydantic import BaseModel, Field
from backend.services.gemini_service import GeminiService

class NewsSentiment(BaseModel):
    sentiment: str = Field(description="Overall sentiment: Bullish, Bearish, or Neutral")
    score: float = Field(description="Sentiment confidence score between 0.0 and 1.0")
    summary: str = Field(description="Short summary of recent news items and social consensus")

class NewsAgent:
    def __init__(self):
        self.agent_id = 2  # news-agent NFT id / Registry ID

    def run(self, query: str) -> dict:
        system_instruction = (
            "You are an expert financial news aggregator and sentiment analyzer. "
            "Gather recent breaking news, calculate sentiment distribution, and "
            "synthesize a structured consensus summary. Format your response clearly."
        )
        
        prompt = f"Analyze the latest news, social sentiment, and key event drivers for the query: '{query}'."
        raw_output = GeminiService.generate(prompt, system_instruction=system_instruction)
        
        # Determine a mock-extracted sentiment based on content or defaults
        sentiment = "Bullish"
        if "bearish" in raw_output.lower() or "drop" in raw_output.lower():
            sentiment = "Bearish"
        elif "neutral" in raw_output.lower() or "flat" in raw_output.lower():
            sentiment = "Neutral"

        return {
            "agent_id": self.agent_id,
            "name": "News Agent",
            "sentiment": sentiment,
            "raw_output": raw_output,
            "status": "completed"
        }
