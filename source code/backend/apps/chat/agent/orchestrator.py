import logging
from .schemas import HybridAgentAction
from .agent_planner import plan_with_gemini
from .guards import validate_agent_action
from ..conversation.intent_router import local_intent_route

logger = logging.getLogger(__name__)

class HybridAgentOrchestrator:
    def plan(self, text: str) -> HybridAgentAction:
        """
        Plans the next action using the Hybrid Gemini Agent with local fallback.
        """
        # 1. Try Gemini Hybrid Planner first
        action = plan_with_gemini(text)
        
        if action and validate_agent_action(action) and action.confidence >= 0.70:
            logger.info(f"Hybrid Agent Planner success: Mode={action.mode}, Intent={action.intent}")
            return action
            
        # 2. Fallback to Local Router
        logger.info("Hybrid Agent Planner failed or low confidence. Falling back to local router.")
        local_result = local_intent_route(text)
        
        return self._map_local_to_action(local_result)

    def _map_local_to_action(self, local_result) -> HybridAgentAction:
        """
        Maps the legacy IntentResult to the new HybridAgentAction.
        """
        intent = local_result.intent
        mode = "BACKEND_TOOL"
        action = "call_tool"
        tool = "none"
        direct_response = None
        clarification_question = None
        
        if intent == "greeting":
            mode = "GENERAL_CHAT"
            action = "answer_direct"
            direct_response = "Hello! I am Mazaj+, how can I help you today?"
        elif intent == "thanks":
            mode = "GENERAL_CHAT"
            action = "answer_direct"
            direct_response = "You're welcome! Let me know if you need anything else."
        elif intent == "help":
            mode = "BACKEND_TOOL"
            action = "call_tool" 
            tool = "help"
        elif intent == "out_of_scope":
            mode = "OUT_OF_SCOPE"
            action = "out_of_scope"
            direct_response = "Mazaj+ cannot diagnose, treat, or prescribe medication. Please consult a qualified healthcare professional. I can only provide general nutrition decision-support within the app scope."
        elif intent == "mood_recommendation":
            tool = "mood_recommendation"
        elif intent == "healthy_alternative":
            tool = "healthy_alternative"
        elif intent == "hydration":
            tool = "hydration_status"
        elif intent == "nutrition_plan_request":
            tool = "nutrition_plan"
        elif intent == "clarification":
            mode = "CLARIFICATION"
            action = "ask_clarification"
            clarification_question = local_result.clarification_question or "I'm not sure I understand. Could you please clarify?"
            
        return HybridAgentAction(
            mode=mode,
            action=action,
            intent=intent,
            tool=tool,
            arguments={
                "mood": local_result.mood,
                "food_name": local_result.food_name
            },
            direct_response=direct_response,
            clarification_question=clarification_question,
            confidence=local_result.confidence,
            source="local"
        )

# Singleton instance
orchestrator = HybridAgentOrchestrator()

def get_orchestrator():
    return orchestrator
