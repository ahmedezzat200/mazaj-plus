from django.db import transaction
from .models import ChatSession, ChatMessage, ChatRecommendation, ChatMode, ChatSender
from apps.nutrition.services import get_foods_for_mood, filter_foods_for_user_safety
from apps.subscriptions.services import check_and_increment_usage
from apps.common.enums import FeatureKey

def detect_intent(text):
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['plan', 'diet', 'nutrition plan']):
        return ChatMode.NUTRITION_PLAN_REQUEST, None
        
    mood_map = {
        'stress': 'stress', 'stressed': 'stress', 'anxious': 'stress',
        'sad': 'sadness', 'sadness': 'sadness',
        'tired': 'fatigue', 'fatigue': 'fatigue',
        'low energy': 'low_energy', 'energy': 'low_energy',
        'focus': 'focus', 'concentration': 'focus'
    }
    
    greeting_words = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'how are you']
    # Check exact match or start of word to avoid matching substrings
    if any(text_lower.startswith(word) or text_lower == word for word in greeting_words):
        return 'GREETING', None
        
    for word, mood in mood_map.items():
        if word in text_lower:
            return ChatMode.MOOD_RECOMMENDATION, mood
            
    return ChatMode.CLARIFICATION, None

def process_chat_message(user, message_text, session_id=None):
    mode, mood_name = detect_intent(message_text)
    
    with transaction.atomic():
        if mode in [ChatMode.MOOD_RECOMMENDATION, ChatMode.NUTRITION_PLAN_REQUEST]:
            check_and_increment_usage(user, FeatureKey.CHAT_GUIDANCE)
        
        if session_id:
            session = ChatSession.objects.get(id=session_id, user=user)
        else:
            session = ChatSession.objects.create(
                user=user, 
                title=f"Chat {message_text[:20]}...",
                mode=mode
            )
            
        ChatMessage.objects.create(
            session=session,
            sender=ChatSender.USER,
            message=message_text
        )
        
        reply_text = ""
        foods_data = []
        warnings_data = []
        
        if mode == ChatMode.NUTRITION_PLAN_REQUEST:
            reply_text = "Advisory only: Nutrition plan generation will be handled by the plan module later. I can only provide simple mood-based food guidance right now."
        elif mode == 'GREETING':
            reply_text = "Hello! I can help with mood-based food guidance. Tell me how you feel or what food you want advice about."
        elif mode == ChatMode.CLARIFICATION:
            reply_text = "I'm not sure I understand your mood. Could you clarify if you are feeling stressed, sad, fatigued, or need focus?"
        elif mode == ChatMode.MOOD_RECOMMENDATION:
            foods = get_foods_for_mood(mood_name)
            safe_foods, warnings_dict = filter_foods_for_user_safety(foods, user)
            
            if safe_foods.exists():
                reply_text = f"Advisory only: based on your mood ({mood_name}), these options may help..."
                for food in safe_foods:
                    foods_data.append({
                        "name": food.name,
                        "calories": str(food.calories),
                        "protein_g": str(food.protein_g),
                        "carbs_g": str(food.carbs_g),
                        "fat_g": str(food.fat_g),
                        "reason": "Recommended for your current mood state."
                    })
                
                for food_id, reasons in warnings_dict.items():
                    food_name = foods.filter(id=food_id).first().name
                    warnings_data.append({
                        "food": food_name,
                        "warnings": reasons
                    })
            else:
                reply_text = f"Advisory only: based on your mood ({mood_name}), no safe result found in the demo database that fits your health profile."
                
            ChatRecommendation.objects.create(
                session=session,
                mood_name=mood_name,
                recommended_foods=foods_data,
                warnings=warnings_data
            )
            
        ChatMessage.objects.create(
            session=session,
            sender=ChatSender.ASSISTANT,
            message=reply_text
        )
        
    return {
        "session_id": session.id,
        "mode": mode,
        "reply": reply_text,
        "foods": foods_data,
        "warnings": warnings_data
    }
