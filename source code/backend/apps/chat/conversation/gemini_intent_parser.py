import os
import json
import logging
from .schemas import IntentResult
from django.conf import settings

logger = logging.getLogger(__name__)

def parse_intent_with_gemini(text: str) -> IntentResult:
    """
    Optional Gemini fallback for intent classification.
    Only used when local confidence is low.
    DO NOT pass private user data.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return IntentResult(intent='clarification', confidence=0.0, source='gemini', needs_clarification=True)

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
You are an intent classifier for Mazaj+, a nutrition system.
User message: "{text}"

Return JSON ONLY:
{{
  "intent": "greeting|help|mood_recommendation|nutrition_plan_request|healthy_alternative|hydration|clarification",
  "mood": "stress|sadness|fatigue|focus|low_energy|null",
  "food_name": "string|null",
  "confidence": 0.0,
  "needs_clarification": boolean,
  "clarification_question": "string|null"
}}

Rules:
1. Intent must be from the allowed list.
2. Mood must be from the allowed list or null.
3. Confidence 0-1.
4. If intent is unclear, use "clarification".
5. No extra conversational filler. No advice.
"""
        
        response = model.generate_content(prompt)
        
        if response and response.text:
            # Clean possible markdown block
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_text)
            
            allowed_intents = ['greeting', 'help', 'mood_recommendation', 'nutrition_plan_request', 'healthy_alternative', 'hydration', 'clarification']
            allowed_moods = ['stress', 'sadness', 'fatigue', 'focus', 'low_energy']
            
            intent = data.get('intent', 'clarification')
            if intent not in allowed_intents:
                intent = 'clarification'
            
            mood = data.get('mood')
            if mood not in allowed_moods:
                mood = None
                
            return IntentResult(
                intent=intent,
                mood=mood,
                food_name=data.get('food_name'),
                confidence=float(data.get('confidence', 0.5)),
                needs_clarification=bool(data.get('needs_clarification', False)),
                clarification_question=data.get('clarification_question'),
                source='gemini'
            )
            
        return IntentResult(intent='clarification', confidence=0.0, source='gemini', needs_clarification=True)

    except Exception as e:
        logger.error(f"Gemini intent parser error: {str(e)}")
        return IntentResult(intent='clarification', confidence=0.0, source='gemini', needs_clarification=True)
