import os
import json
import logging
from typing import Optional
from .schemas import HybridAgentAction

logger = logging.getLogger(__name__)

# Simple in-memory circuit breaker for the current run
_gemini_unavailable = False

def is_gemini_available():
    return not _gemini_unavailable

SYSTEM_PROMPT = """
You are a controlled chat planner for Mazaj+, a nutrition decision-support system.
Your job is to classify the user's message and decide if you can answer directly or if a backend tool is needed.

Modes:
1. GENERAL_CHAT: Simple greetings, thanks, or "What is Mazaj?" / "What can you do?". You may answer these directly.
2. BACKEND_TOOL: Any request for food suggestions, alternatives, hydration, or nutrition plans.
3. OUT_OF_SCOPE: Medical diagnosis, treatment, or requests unrelated to nutrition/Mazaj+.
4. CLARIFICATION: The message is too vague to classify.

Rules:
1. You are NOT a doctor or nutritionist.
2. Do NOT recommend foods, calculate calories, or generate plans directly.
3. For ANY nutrition-related request, you MUST use BACKEND_TOOL mode and select a tool.
4. Direct responses for GENERAL_CHAT must be short, friendly, and advisory-only.
5. Return JSON ONLY.

Allowed Tools: mood_recommendation, healthy_alternative, hydration_status, nutrition_plan, daily_tip, none.
Allowed Moods: stress, sadness, fatigue, focus, low_energy.

JSON Output Schema for BACKEND_TOOL:
{
  "mode": "BACKEND_TOOL",
  "action": "call_tool",
  "intent": "string",
  "tool": "string",
  "arguments": {
    "mood": "mood_value|null",
    "food_name": "string|null"
  },
  "confidence": 0.0
}

JSON Output Schema for GENERAL_CHAT:
{
  "mode": "GENERAL_CHAT",
  "action": "answer_direct",
  "intent": "greeting|help|thanks",
  "direct_response": "Friendly response here",
  "confidence": 0.0
}

JSON Output Schema for OUT_OF_SCOPE:
{
  "mode": "OUT_OF_SCOPE",
  "action": "out_of_scope",
  "direct_response": "Safe refusal/advisory message",
  "confidence": 0.0
}
"""

def plan_with_gemini(text: str) -> Optional[HybridAgentAction]:
    """
    Calls Gemini to classify and plan the response path.
    """
    global _gemini_unavailable
    if _gemini_unavailable:
        return None

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Using gemini-2.0-flash (if available) or fallback to latest
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
        except:
            model = genai.GenerativeModel('gemini-flash-latest')
            
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\nUser message: \"{text}\"\n\nJSON output:"
        )
        
        if response and response.text:
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_text)
            
            return HybridAgentAction(
                mode=data.get('mode', 'CLARIFICATION'),
                action=data.get('action', 'ask_clarification'),
                intent=data.get('intent', 'unknown'),
                tool=data.get('tool', 'none'),
                arguments=data.get('arguments', {}),
                direct_response=data.get('direct_response'),
                clarification_question=data.get('clarification_question'),
                confidence=float(data.get('confidence', 0.0)),
                source='gemini'
            )
            
    except Exception as e:
        err_msg = str(e)
        if "429" in err_msg or "quota" in err_msg.lower():
            if not _gemini_unavailable:
                logger.warning("Gemini API quota exceeded. Falling back to local router for this run.")
                _gemini_unavailable = True
        else:
            logger.error(f"Gemini hybrid agent planner error: {err_msg}")
        return None
        
    return None
