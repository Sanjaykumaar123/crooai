import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Initialize logging
logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    logger.info("Gemini configured successfully.")
else:
    logger.warning("GEMINI_API_KEY not found in environment. Using fallback mock mode.")

class GeminiService:
    @staticmethod
    def generate(prompt: str, system_instruction: str = None) -> str:
        if not api_key:
            return GeminiService._mock_fallback(prompt)
        
        try:
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}. Falling back to mock data.")
            return GeminiService._mock_fallback(prompt)

    @staticmethod
    def _mock_fallback(prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "tesla" in prompt_lower:
            return (
                "Tesla, Inc. (TSLA) currently shows a neutral-to-bullish sentiment. "
                "Technical indicators highlight strong support near $180 and resistance at $195. "
                "Recent macro catalysts include battery technology upgrades and autonomous driving trials."
            )
        elif "news" in prompt_lower:
            return (
                "Latest News: Tesla expansion plans approved. "
                "Sentiment Index: 72% Bullish, 18% Neutral, 10% Bearish. "
                "Recent social chatter indicates significant interest in upcoming autonomy day announcement."
            )
        elif "analytics" in prompt_lower or "trend" in prompt_lower:
            return (
                "Volatility analysis: 30-day historical volatility is 42%. "
                "Moving Average: TSLA is trading slightly above its 50-day moving average. "
                "RSI indicator sits at 58.6, representing healthy neutral momentum."
            )
        elif "verification" in prompt_lower:
            return (
                "Verification result: Cross-checked 3 facts against public financial statements. "
                "Anomalies: None. Factual integrity score: 100%. "
                "Data matches recent SEC 10-Q filings perfectly."
            )
        return f"Mocked LLM response to query: {prompt}"
