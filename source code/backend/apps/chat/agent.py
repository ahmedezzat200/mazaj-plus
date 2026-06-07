import os
import json
import logging
import re
import time
from typing import Dict, Any, Callable, Optional
from .schemas import HybridAgentAction, IntentResult

logger = logging.getLogger(__name__)


# --- Guards ---

SENSITIVE_KEYWORDS = [
    r'\bkcal\b', r'\bcalorie', r'\bprotein', r'\bcarb', r'\bfat\b',
    r'\bgram\b', r'\bmeal plan', r'\bdiet plan', r'\bnutrition plan',
    r'\bdiagnose', r'\btreat\b', r'\bcure\b', r'\bprescription\b',
    r'\ballergy\b', r'\ballergic\b', r'\bdiabetic\b', r'\bhypertension\b'
]


def validate_direct_response(text: str) -> bool:
    if not text:
        return True
    text_lower = text.lower()
    for pattern in SENSITIVE_KEYWORDS:
        if re.search(pattern, text_lower):
            logger.warning(f"Direct response rejected due to sensitive keyword: {pattern}")
            return False
    return True


def validate_agent_action(action: HybridAgentAction) -> bool:
    allowed_modes = ["GENERAL_CHAT", "BACKEND_TOOL", "OUT_OF_SCOPE", "CLARIFICATION"]
    if action.mode not in allowed_modes:
        return False
    if action.mode == "GENERAL_CHAT":
        if not validate_direct_response(action.direct_response):
            return False
    allowed_tools = ["mood_recommendation", "healthy_alternative", "hydration_status", "nutrition_plan", "plan_food_swap", "nutrition_plan_info", "daily_tip", "more_options", "safety_check", "none"]
    if action.tool not in allowed_tools:
        return False
    return True


# --- Tool Registry ---

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}

    def register(self, name: str, func: Callable):
        self._tools[name] = func

    def execute(self, name: str, **kwargs) -> Any:
        if name not in self._tools:
            logger.error(f"Attempted to execute unauthorized or unknown tool: {name}")
            raise ValueError(f"Tool '{name}' not found in registry.")
        return self._tools[name](**kwargs)


registry = ToolRegistry()


def get_tool_registry():
    return registry


# --- Gemini Planner ---

# When Gemini hits a quota error, we mark it unavailable until this timestamp.
# Avoids hammering a rate-limited endpoint while letting service auto-recover
# without a process restart.
_GEMINI_COOLDOWN_SECONDS = 300
_gemini_unavailable_until: float = 0.0


def is_gemini_available():
    return time.time() >= _gemini_unavailable_until


SYSTEM_PROMPT = """
You are the chat planner for Mazaj+, a friendly nutrition decision-support assistant.
Classify the user message and produce JSON. Be warm and conversational — never robotic.

Modes (pick one):
1. GENERAL_CHAT — Use this for: greetings ("hi", "hello", "good morning"), small talk
   ("how are you", "what's up", "how you doing"), thanks, asking what Mazaj+ is or
   what you can do, or any short friendly message that doesn't require a backend tool.
   Reply in `direct_response` with a warm, natural 1-2 sentence answer in the user's
   language. If small-talk, briefly invite them to share a mood, ask for an alternative,
   or request a nutrition plan — but do NOT bombard them with a menu.

2. BACKEND_TOOL — Use this when the user asks for: food suggestions for a mood, a
   healthy alternative for a specific food, hydration status, a nutrition plan, or a
   daily tip. Pick the matching tool and pass arguments. If the user asks HOW a
   nutrition plan is made, what steps are used, or wants an explanation before creating
   it, use nutrition_plan_info. Only use nutrition_plan when the user clearly asks to
   create/generate/make a plan now.

3. OUT_OF_SCOPE — Use only for medical diagnosis/treatment/prescription requests, or
   topics clearly unrelated to nutrition (politics, coding, etc.). Politely decline.

4. CLARIFICATION — ONLY use when the message is genuinely ambiguous AND points at
   nutrition (e.g., "I want something" with no detail). Never use CLARIFICATION for
   greetings, small talk, thanks, or out-of-scope questions — those are GENERAL_CHAT
   or OUT_OF_SCOPE. Provide a `clarification_question` that is friendly and specific.

Hard rules:
- You are NOT a doctor. Never diagnose, prescribe, or claim to cure.
- Never invent calories, macros, or meal plans. Backend tools own that.
- GENERAL_CHAT replies stay 1-3 sentences, advisory tone, in the user's language.
- Return JSON ONLY — no markdown fences, no commentary outside the JSON.

Allowed tools: mood_recommendation, healthy_alternative, hydration_status, nutrition_plan, nutrition_plan_info, daily_tip, none.
Allowed moods: stress, sadness, fatigue, focus, low_energy.

Examples:
User: "hi" → {"mode":"GENERAL_CHAT","action":"answer_direct","intent":"greeting","direct_response":"Hi there! I'm Mazaj+. How are you feeling today?","confidence":0.95}
User: "how you doing buddy" → {"mode":"GENERAL_CHAT","action":"answer_direct","intent":"smalltalk","direct_response":"Doing great, thanks for asking! What can I help you with — a mood-based suggestion, a healthy swap, or a nutrition plan?","confidence":0.9}
User: "I'm tired" → {"mode":"BACKEND_TOOL","action":"call_tool","intent":"mood_recommendation","tool":"mood_recommendation","arguments":{"mood":"fatigue","food_name":null},"confidence":0.9}
User: "give me an alternative for soda" → {"mode":"BACKEND_TOOL","action":"call_tool","intent":"healthy_alternative","tool":"healthy_alternative","arguments":{"mood":null,"food_name":"soda"},"confidence":0.95}
User: "how can you make me a nutrition plan?" → {"mode":"BACKEND_TOOL","action":"call_tool","intent":"nutrition_plan_info","tool":"nutrition_plan_info","arguments":{"mood":null,"food_name":null},"confidence":0.95}
User: "do I have diabetes" → {"mode":"OUT_OF_SCOPE","action":"out_of_scope","direct_response":"I can't diagnose conditions — please check with a healthcare professional. I can help with food suggestions and nutrition plans though.","confidence":0.95}

JSON Output Schema for BACKEND_TOOL:
{
  "mode": "BACKEND_TOOL",
  "action": "call_tool",
  "intent": "string",
  "tool": "string",
  "arguments": {"mood": "mood_value|null", "food_name": "string|null"},
  "confidence": 0.0
}

JSON Output Schema for GENERAL_CHAT:
{
  "mode": "GENERAL_CHAT",
  "action": "answer_direct",
  "intent": "greeting|smalltalk|help|thanks",
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
    global _gemini_unavailable_until
    if time.time() < _gemini_unavailable_until:
        return None

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except Exception:
            model = genai.GenerativeModel('gemini-2.5-flash')

        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\nUser message: \"{text}\"\n\nJSON output:",
            request_options={"timeout": 4.0}
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
            _gemini_unavailable_until = time.time() + _GEMINI_COOLDOWN_SECONDS
            logger.warning(
                "Gemini API quota exceeded. Falling back to local router for %ss.",
                _GEMINI_COOLDOWN_SECONDS,
            )
        else:
            logger.error(f"Gemini hybrid agent planner error: {err_msg}")
        return None

    return None


# --- Orchestrator ---

class HybridAgentOrchestrator:
    def plan(self, text: str) -> HybridAgentAction:
        from .conversation import local_intent_route
        action = plan_with_gemini(text)

        if action and validate_agent_action(action) and action.confidence >= 0.55:
            logger.info(f"Hybrid Agent Planner success: Mode={action.mode}, Intent={action.intent}")
            return action

        logger.info("Hybrid Agent Planner failed or low confidence. Falling back to local router.")
        local_result = local_intent_route(text)
        return self._map_local_to_action(local_result)

    def _map_local_to_action(self, local_result: IntentResult) -> HybridAgentAction:
        intent = local_result.intent
        mode = "BACKEND_TOOL"
        action = "call_tool"
        tool = "none"
        direct_response = None
        clarification_question = None

        if intent == "greeting":
            mode, action, direct_response = (
                "GENERAL_CHAT",
                "answer_direct",
                "Hi, I am here with you. Tell me what you need today, and I will either answer generally or use your Mazaj+ data when it matters.",
            )
        elif intent == "thanks":
            mode, action, direct_response = (
                "GENERAL_CHAT",
                "answer_direct",
                "You are welcome. We can keep going from here whenever you are ready.",
            )
        elif intent == "help":
            mode, action, tool = "GENERAL_CHAT", "call_tool", "help"
        elif intent == "smalltalk":
            mode, action, direct_response = (
                "GENERAL_CHAT", "answer_direct",
                "I am doing well, thanks for asking. Tell me what is on your mind, and I will keep it simple and useful.",
            )
        elif intent == "out_of_scope":
            mode, action = "OUT_OF_SCOPE", "out_of_scope"
            direct_response = (
                "I cannot diagnose, treat, or prescribe. For anything medical, it is best to speak with a qualified professional. "
                "I can still help you think through food choices safely using Mazaj+ guidance."
            )
        elif intent == "mood_recommendation":
            tool = "mood_recommendation"
        elif intent == "healthy_alternative":
            tool = "healthy_alternative"
        elif intent == "hydration":
            tool = "hydration_status"
        elif intent == "nutrition_plan_request":
            tool = "nutrition_plan"
        elif intent == "nutrition_plan_info":
            tool = "nutrition_plan_info"
        elif intent == "more_options":
            tool = "more_options"
        elif intent == "clarification":
            mode, action = "CLARIFICATION", "ask_clarification"
            clarification_question = (
                local_result.clarification_question
                or "I can help, I just need one more detail. Are you asking about your mood, a specific food, hydration, or a nutrition plan?"
            )

        return HybridAgentAction(
            mode=mode, action=action, intent=intent, tool=tool,
            arguments={"mood": local_result.mood, "food_name": local_result.food_name},
            direct_response=direct_response,
            clarification_question=clarification_question,
            confidence=local_result.confidence, source="local"
        )


orchestrator = HybridAgentOrchestrator()


def get_orchestrator():
    return orchestrator
