from .schemas import IntentResult
from .normalizer import normalize_text, handle_typos, translate_arabic_to_canonical
import difflib
import re
from typing import Optional

def local_intent_route(text: str) -> IntentResult:
    """
    Deterministic local router using keyword and phrase matching.
    """
    normalized = normalize_text(text)
    normalized = handle_typos(normalized)
    normalized = translate_arabic_to_canonical(normalized)
    
    # 1. Out of Scope (Medical/Diagnosis)
    medical_keywords = [
        'diagnose', 'diagnosis', 'treat', 'treatment', 'prescribe', 'medicine', 
        'medication', 'cure', 'doctor', 'physician', 'hospital',
        'علاج', 'تشخيص', 'دواء', 'وصفة', 'دكتور', 'مستشفى'
    ]
    if any(kw in normalized for kw in medical_keywords):
        return IntentResult(intent='out_of_scope', confidence=0.95, source='local')

    # 2. Greeting
    greetings = [
        r'hello', r'hi', r'hey', r'salam', r'السلام عليكم', r'ازيك',
        r'good morning', r'good afternoon', r'good evening', r'good night',
        r'morning', r'afternoon', r'evening', r'night',
        r'صباح الخير', r'مساء الخير'
    ]
    if any(re.search(rf'\b{word}\b', normalized) for word in greetings):
        return IntentResult(intent='greeting', confidence=0.95, source='local')

    # 3. Thanks
    thanks_keywords = ['thanks', 'thank you', 'ok', 'okay', 'شكرا', 'تمام', 'ماشي']
    if any(re.search(rf'\b{kw}\b', normalized) for kw in thanks_keywords):
        return IntentResult(intent='thanks', confidence=0.95, source='local')

    # 4. Help / About
    help_keywords = [
        'help', 'what can you do', 'how does this work', 'what is mazaj', 
        'explain mazaj', 'about mazaj', 'who are you', 'مساعدة', 'ايه هو مزاج'
    ]
    if any(kw in normalized for kw in help_keywords) or (normalized == 'mazaj') or (normalized == 'what mazaj'):
        return IntentResult(intent='help', confidence=0.95, source='local')

    # 5. Nutrition plan request
    plan_keywords = ['plan', 'diet', 'meal plan', 'خطة غذائية', 'خطة اكل']
    if any(kw in normalized for kw in plan_keywords):
        return IntentResult(intent='nutrition_plan_request', confidence=0.90, source='local')

    # 6. Healthy alternative
    alt_keywords = ['alternative', 'instead of', 'replace', 'بديل']
    if any(kw in normalized for kw in alt_keywords):
        food_name = extract_food_name(normalized)
        return IntentResult(
            intent='healthy_alternative', 
            food_name=food_name, 
            confidence=0.85 if food_name else 0.75,
            source='local'
        )

    # 7. Hydration
    water_keywords = ['water', 'hydration', 'drink', 'اشرب مياه', 'مياه']
    if any(kw in normalized for kw in water_keywords):
        return IntentResult(intent='hydration', confidence=0.90, source='local')

    # 8. Mood Recommendation
    mood_map = {
        'stress': ['stress', 'stressed', 'anxious', 'burnout', 'burned out', 'مضغوط', 'ضغط'],
        'sadness': ['sad', 'sadness', 'depressed', 'زعلان', 'حزين'],
        'fatigue': ['tired', 'fatigue', 'exhausted', 'تعبان', 'مرهق'],
        'low_energy': ['low energy', 'energy', 'weak'],
        'focus': ['focus', 'studying', 'exam', 'concentration', 'اركز', 'أركز']
    }
    
    for mood, keywords in mood_map.items():
        if any(kw in normalized for kw in keywords):
            return IntentResult(intent='mood_recommendation', mood=mood, confidence=0.85, source='local')

    # 9. Fallback to low confidence
    return IntentResult(intent='clarification', confidence=0.5, source='local', needs_clarification=True)

def extract_food_name(text: str) -> Optional[str]:
    """
    Simple extractor for food names in alternative requests.
    """
    # Normalize aliases
    text = text.replace('cola', 'soda').replace('coke', 'soda').replace('pepsi', 'soda').replace('soft drink', 'soda')
    text = text.replace('كولا', 'soda').replace('بيبسي', 'soda')
    
    known_foods = ['soda', 'chips', 'cookie', 'pizza', 'burger', 'fries']
    for food in known_foods:
        if food in text:
            return food
    return None
