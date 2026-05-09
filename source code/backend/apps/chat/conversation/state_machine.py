from .schemas import IntentResult
from ..models import ChatSession, ChatMode

def apply_conversation_state(session: ChatSession, result: IntentResult) -> IntentResult:
    """
    Updates session state and handles multi-turn logic.
    """
    # If we are waiting for a specific slot, try to fill it
    if session.conversation_state == 'WAITING_FOR_MOOD' and result.intent == 'clarification':
        # Treat any input as a potential mood if we were waiting for one
        # This is a simple heuristic: if the user was asked for a mood and gave an answer
        # that the router didn't catch, we could try harder or just return the result.
        # But for now, if the router caught the mood, it would have returned mood_recommendation.
        pass

    # Update session with new pending info
    if result.needs_clarification:
        if result.intent == 'mood_recommendation' and not result.mood:
            session.conversation_state = 'WAITING_FOR_MOOD'
        elif result.intent == 'healthy_alternative' and not result.food_name:
            session.conversation_state = 'WAITING_FOR_FOOD_NAME'
        else:
            session.conversation_state = 'READY'
    else:
        session.conversation_state = 'READY'
        session.pending_intent = None
        session.pending_mood = None
        session.pending_food_name = None

    session.save()
    return result

def get_clarification_response(result: IntentResult) -> str:
    """
    Returns a helpful specific clarification question.
    """
    if result.clarification_question:
        return result.clarification_question
        
    if result.intent == 'mood_recommendation' and not result.mood:
        return "Are you feeling stressed, sad, tired, low energy, or trying to focus?"
    
    if result.intent == 'healthy_alternative' and not result.food_name:
        return "Which food or drink do you want a healthier alternative for?"
    
    if result.intent == 'clarification':
        return "I can help with mood-based food suggestions, a nutrition plan, healthy alternatives, or hydration help. Which one do you need?"

    return "Could you please tell me more so I can help you better?"
