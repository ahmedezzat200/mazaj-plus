import logging
from django.db import transaction
from .models import ChatSession, ChatMessage, ChatRecommendation, ChatMode, ChatSender
from apps.nutrition.services import (
    get_foods_for_mood, filter_foods_for_user_safety, 
    get_healthy_alternatives, get_hydration_data
)
from apps.subscriptions.services import check_and_increment_usage
from apps.common.enums import FeatureKey
from .conversation.intent_router import local_intent_route
from .conversation.gemini_intent_parser import parse_intent_with_gemini
from .conversation.state_machine import apply_conversation_state, get_clarification_response

logger = logging.getLogger(__name__)

def process_chat_message(user, message_text, session_id=None):
    """
    Orchestrates the conversation understanding and routing layer.
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

    # 3. Intent Detection & Routing
    # a. Local Router first
    result = local_intent_route(message_text)
    
    # b. Check if we need Gemini fallback (confidence < 0.75)
    if result.confidence < 0.75:
        import os
        if os.getenv("GEMINI_API_KEY"):
            gemini_result = parse_intent_with_gemini(message_text)
            if gemini_result.confidence > result.confidence:
                result = gemini_result

    # 4. Handle Conversation State & Missing Slots
    result = apply_conversation_state(session, result)

    # 5. Route to Backend Services
    reply_text = ""
    foods_data = []
    warnings_data = []
    
    # Map internal intent string to ChatMode enum
    intent_map = {
        'greeting': ChatMode.GREETING,
        'help': ChatMode.HELP,
        'mood_recommendation': ChatMode.MOOD_RECOMMENDATION,
        'nutrition_plan_request': ChatMode.NUTRITION_PLAN_REQUEST,
        'healthy_alternative': ChatMode.HEALTHY_ALTERNATIVE,
        'hydration': ChatMode.HYDRATION,
        'clarification': ChatMode.CLARIFICATION
    }
    mode = intent_map.get(result.intent, ChatMode.CLARIFICATION)
    session.mode = mode
    session.save()

    with transaction.atomic():
        # Check usage for paid features
        if mode in [ChatMode.MOOD_RECOMMENDATION, ChatMode.NUTRITION_PLAN_REQUEST, ChatMode.HEALTHY_ALTERNATIVE]:
            # Use a generic CHAT_GUIDANCE feature key for all chat-based advice
            check_and_increment_usage(user, FeatureKey.CHAT_GUIDANCE)

        if result.needs_clarification:
            reply_text = get_clarification_response(result)
        
        elif mode == ChatMode.GREETING:
            reply_text = "Hello! I am Mazaj+, your nutrition decision-support system. I can help with mood-based food suggestions, nutrition plans, healthy alternatives, or hydration. How are you feeling today?"
            
        elif mode == ChatMode.HELP:
            reply_text = (
                "Mazaj+ is an advisory nutrition system. I help with:\n"
                "- Mood-based food suggestions (stress, fatigue, focus, etc.)\n"
                "- Basic nutrition plans based on your profile\n"
                "- Healthier alternatives for common foods\n"
                "- Hydration tracking and targets\n"
                "- Daily nutritional tips\n\n"
                "All advice is database-driven and safety-checked against your profile. I am not a doctor; please consult a professional for medical needs."
            )
            
        elif mode == ChatMode.MOOD_RECOMMENDATION:
            mood_name = result.mood
            if not mood_name:
                reply_text = "Which mood are you feeling? (stress, sadness, fatigue, low energy, or focus)"
            else:
                foods = get_foods_for_mood(mood_name)
                safe_foods, warnings_dict = filter_foods_for_user_safety(foods, user)
                
                if safe_foods.exists():
                    reply_text = f"Based on your mood ({mood_name}), these options from our database may help. They have been checked against your safety profile."
                    for food in safe_foods:
                        foods_data.append({
                            "name": food.name,
                            "calories": str(food.calories),
                            "protein_g": str(food.protein_g),
                            "carbs_g": str(food.carbs_g),
                            "fat_g": str(food.fat_g),
                            "reason": f"Traditionally associated with {mood_name} support."
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
                        mood_name=mood_name,
                        recommended_foods=foods_data,
                        warnings=warnings_data
                    )
                else:
                    reply_text = f"I found some suggestions for {mood_name}, but none of them are safe based on your saved health profile (allergies or conditions)."

        elif mode == ChatMode.HEALTHY_ALTERNATIVE:
            food_name = result.food_name
            if not food_name:
                reply_text = "Which food or drink would you like a healthier alternative for?"
            else:
                alts = get_healthy_alternatives(food_name, user)
                if alts.exists():
                    reply_text = f"Here are some healthier alternatives for {food_name} that are safe for you:"
                    for alt in alts:
                        foods_data.append({
                            "name": alt.alternative_food.name,
                            "calories": str(alt.alternative_food.calories),
                            "reason": alt.reason
                        })
                else:
                    reply_text = f"I don't have a safe healthier alternative for '{food_name}' in my current database."

        elif mode == ChatMode.HYDRATION:
            h_data = get_hydration_data(user)
            target = h_data['target_ml']
            total = h_data['today_total_ml']
            reply_text = f"Based on your weight, your daily hydration target is {target}ml. You have logged {total}ml so far today. Remember to stay hydrated!"

        elif mode == ChatMode.NUTRITION_PLAN_REQUEST:
            reply_text = "I can generate a basic nutrition plan for you in the Nutrition Plans section, or I can provide mood-based guidance here. Would you like a mood-based suggestion now?"

        else:
            reply_text = get_clarification_response(result)

    # 6. Optional Gemini Formatting
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
