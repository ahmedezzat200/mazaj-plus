import logging
import re
from .schemas import HybridAgentAction

logger = logging.getLogger(__name__)

# Nutrition-related keywords that should NOT appear in a GENERAL_CHAT direct response
SENSITIVE_KEYWORDS = [
    r'\bkcal\b', r'\bcalorie', r'\bprotein', r'\bcarb', r'\bfat\b', 
    r'\bgram\b', r'\bmeal plan', r'\bdiet plan', r'\bnutrition plan',
    r'\bdiagnose', r'\btreat\b', r'\bcure\b', r'\bprescription\b',
    r'\ballergy\b', r'\ballergic\b', r'\bdiabetic\b', r'\bhypertension\b'
]

def validate_direct_response(text: str) -> bool:
    """
    Ensures Gemini's direct response does not contain unauthorized nutrition advice.
    """
    if not text:
        return True
    
    text_lower = text.lower()
    for pattern in SENSITIVE_KEYWORDS:
        if re.search(pattern, text_lower):
            logger.warning(f"Direct response rejected due to sensitive keyword: {pattern}")
            return False
    return True

def validate_agent_action(action: HybridAgentAction) -> bool:
    """
    Strictly validates the HybridAgentAction against allowlists.
    """
    allowed_modes = ["GENERAL_CHAT", "BACKEND_TOOL", "OUT_OF_SCOPE", "CLARIFICATION"]
    if action.mode not in allowed_modes:
        return False
        
    if action.mode == "GENERAL_CHAT":
        if not validate_direct_response(action.direct_response):
            return False
            
    allowed_tools = ["mood_recommendation", "healthy_alternative", "hydration_status", "nutrition_plan", "daily_tip", "none"]
    if action.tool not in allowed_tools:
        return False
        
    return True
