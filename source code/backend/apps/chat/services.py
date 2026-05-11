import logging
from django.db import transaction
from .models import ChatSession, ChatMessage, ChatRecommendation, ChatMode, ChatSender
from apps.nutrition.services import (
    get_foods_for_mood, filter_foods_for_user_safety, 
    get_healthy_alternatives, get_hydration_data
)
from apps.subscriptions.services import check_and_increment_usage
from apps.common.enums import FeatureKey
from .agent.orchestrator import get_orchestrator
from .agent.tool_registry import get_tool_registry

logger = logging.getLogger(__name__)

# --- Tool Implementations ---

def tool_help(**kwargs):
    return {
        "reply": (
            "Mazaj+ is a chat-based nutrition decision-support assistant. It can help with mood-based food guidance, "
            "nutrition plans, healthy alternatives, hydration, and daily tips. It is advisory only and does not replace "
            "medical professionals."
        ),
        "foods": [],
        "warnings": []
    }

def tool_mood_recommendation(user, session, mood, **kwargs):
    if not mood:
        return {"reply": "Which mood are you feeling? (stress, sadness, fatigue, low energy, or focus)", "foods": [], "warnings": []}
    
    foods = get_foods_for_mood(mood)
    safe_foods, warnings_dict = filter_foods_for_user_safety(foods, user)
    
    foods_data = []
    warnings_data = []
    
    if safe_foods.exists():
        reply = f"Based on your mood ({mood}), these options from our database may help. They have been checked against your safety profile."
        for food in safe_foods:
            foods_data.append({
                "name": food.name,
                "calories": str(food.calories),
                "protein_g": str(food.protein_g),
                "carbs_g": str(food.carbs_g),
                "fat_g": str(food.fat_g),
                "reason": f"Traditionally associated with {mood} support."
            })
        
        for food_id, reasons in warnings_dict.items():
            food_obj = next((f for f in foods if f.id == food_id), None)
            if food_obj:
                warnings_data.append({
                    "food": food_obj.name,
                    "warnings": reasons
                })
        
        ChatRecommendation.objects.create(
            session=session,
            mood_name=mood,
            recommended_foods=foods_data,
            warnings=warnings_data
        )
    else:
        reply = f"I found some suggestions for {mood}, but none of them are safe based on your saved health profile."

    return {"reply": reply, "foods": foods_data, "warnings": warnings_data}

def tool_healthy_alternative(user, food_name, **kwargs):
    if not food_name:
        return {"reply": "Which food or drink would you like a healthier alternative for?", "foods": [], "warnings": []}
    
    alts = get_healthy_alternatives(food_name, user)
    foods_data = []
    if alts.exists():
        reply = f"Here are some healthier alternatives for {food_name} that are safe for you:"
        for alt in alts:
            foods_data.append({
                "name": alt.alternative_food.name,
                "calories": str(alt.alternative_food.calories),
                "reason": alt.reason
            })
    else:
        reply = f"I don't have a safe healthier alternative for '{food_name}' in my current database."

    return {"reply": reply, "foods": foods_data, "warnings": []}

def tool_hydration_status(user, **kwargs):
    h_data = get_hydration_data(user)
    target = h_data['target_ml']
    total = h_data['today_total_ml']
    reply = f"Based on your weight, your daily hydration target is {target}ml. You have logged {total}ml so far today."
    return {"reply": reply, "foods": [], "warnings": []}

def tool_nutrition_plan(**kwargs):
    return {
        "reply": (
            "Nutrition plan generation is currently handled by the dedicated plan module. "
            "Please open the Nutrition Plans page or complete your profile first. "
            "Mazaj+ keeps plan generation backend-controlled and advisory-only."
        ),
        "foods": [],
        "warnings": []
    }

def tool_daily_tip(**kwargs):
    from apps.nutrition.services import get_daily_tip
    tip = get_daily_tip()
    if tip:
        return {"reply": f"Daily Tip: {tip.content}", "foods": [], "warnings": []}
    return {"reply": "I don't have a new tip for you right now.", "foods": [], "warnings": []}

# Register tools
registry = get_tool_registry()
registry.register("help", tool_help)
registry.register("mood_recommendation", tool_mood_recommendation)
registry.register("healthy_alternative", tool_healthy_alternative)
registry.register("hydration_status", tool_hydration_status)
registry.register("nutrition_plan", tool_nutrition_plan)
registry.register("daily_tip", tool_daily_tip)

# --- Main Orchestrator ---

def process_chat_message(user, message_text, session_id=None):
    """
    Orchestrates the chat message processing using the Hybrid Gemini Chat Agent.
    """
    # 1. Get or create session
    if session_id:
        session = ChatSession.objects.get(id=session_id, user=user)
    else:
        session = ChatSession.objects.create(
            user=user, 
            title=f"Chat {message_text[:20]}...",
            mode=ChatMode.CLARIFICATION
        )

    # 2. Record User Message
    ChatMessage.objects.create(
        session=session,
        sender=ChatSender.USER,
        message=message_text
    )

    # 3. Hybrid Agent Planning
    orchestrator = get_orchestrator()
    action = orchestrator.plan(message_text)

    # 4. State Handling: Reset state if a new clear intent is detected
    if session.conversation_state != 'READY':
        # If the mode is GENERAL_CHAT or the tool is clearly defined, reset the pending state
        if action.mode in ['GENERAL_CHAT', 'OUT_OF_SCOPE'] or (action.mode == 'BACKEND_TOOL' and action.tool != 'none'):
            session.conversation_state = 'READY'
            session.pending_mood = None
            session.pending_food_name = None
            session.save()

    # 5. Execute Action
    reply_text = ""
    foods_data = []
    warnings_data = []
    
    # Map intent to ChatMode
    intent_map = {
        'greeting': ChatMode.GREETING,
        'thanks': ChatMode.GREETING,
        'help': ChatMode.HELP,
        'mood_recommendation': ChatMode.MOOD_RECOMMENDATION,
        'nutrition_plan_request': ChatMode.NUTRITION_PLAN_REQUEST,
        'healthy_alternative': ChatMode.HEALTHY_ALTERNATIVE,
        'hydration': ChatMode.HYDRATION,
        'clarification': ChatMode.CLARIFICATION,
        'daily_tip': ChatMode.HELP,
        'out_of_scope': ChatMode.CLARIFICATION
    }
    mode = intent_map.get(action.intent, ChatMode.CLARIFICATION)
    session.mode = mode
    session.save()

    try:
        with transaction.atomic():
            # Usage tracking
            if mode in [ChatMode.MOOD_RECOMMENDATION, ChatMode.NUTRITION_PLAN_REQUEST, ChatMode.HEALTHY_ALTERNATIVE]:
                check_and_increment_usage(user, FeatureKey.CHAT_GUIDANCE)

            if action.mode == "GENERAL_CHAT" or action.mode == "OUT_OF_SCOPE":
                reply_text = action.direct_response or "How can I help you today?"
            
            elif action.mode == "CLARIFICATION":
                reply_text = action.clarification_question or "Could you please clarify your request?"
                # Update state for multi-turn if needed
                if action.intent == "mood_recommendation":
                    session.conversation_state = 'WAITING_FOR_MOOD'
                elif action.intent == "healthy_alternative":
                    session.conversation_state = 'WAITING_FOR_FOOD_NAME'
                session.save()

            elif action.mode == "BACKEND_TOOL":
                tool_registry = get_tool_registry()
                # Execute tool with context
                result = tool_registry.execute(
                    action.tool, 
                    user=user, 
                    session=session,
                    mood=action.arguments.get("mood"),
                    food_name=action.arguments.get("food_name")
                )
                reply_text = result.get("reply", "I processed your request.")
                foods_data = result.get("foods", [])
                warnings_data = result.get("warnings", [])
            
            else:
                reply_text = "I'm not sure how to handle that. Could you try again?"

    except Exception as e:
        err_msg = str(e)
        if "USAGE_LIMIT_EXCEEDED" in err_msg:
            reply_text = "You have reached your weekly limit for nutrition plan requests. Please try again next week or upgrade to PRO for unlimited access."
        elif "User has no subscription" in err_msg:
            reply_text = "Please complete your profile and subscription setup first before requesting a nutrition plan."
        else:
            logger.error(f"Error in hybrid agent execution: {err_msg}")
            reply_text = "I encountered an error while processing your request. Please try again later."

    # 6. Optional Gemini Formatting (only for backend results)
    # General chat and out_of_scope are already formatted by Gemini in the planner
    if action.mode == "BACKEND_TOOL":
        try:
            from .gemini_formatter import format_chat_reply_with_gemini
            formatted_reply = format_chat_reply_with_gemini(
                reply_text, 
                foods_data, 
                warnings_data, 
                mode.value
            )
        except Exception:
            formatted_reply = reply_text
    else:
        formatted_reply = reply_text

    # 7. Record Assistant Message
    ChatMessage.objects.create(
        session=session,
        sender=ChatSender.ASSISTANT,
        message=formatted_reply
    )

    return {
        "session_id": session.id,
        "mode": mode.value,
        "reply": formatted_reply,
        "foods": foods_data,
        "warnings": warnings_data
    }
