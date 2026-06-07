import logging
import re
from typing import Optional
from .schemas import IntentResult

logger = logging.getLogger(__name__)


# --- Normalizer ---

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s؀-ۿ]', '', text)
    return text


def handle_typos(text: str) -> str:
    typo_map = {
        r'stress+ed+': 'stressed', r'stres+ed': 'stressed',
        r'tierd': 'tired', r'tired+': 'tired',
        r'focuss+': 'focus', r'mazaj+': 'mazaj',
        r'brun+ed out': 'burned out', r'burn+ed out': 'burned out',
        r'n[utr]*io[n]*\s+plan': 'nutrition plan',
        r'nutr[it]*on': 'nutrition', r'ntrion': 'nutrition',
    }
    for pattern, replacement in typo_map.items():
        text = re.sub(pattern, replacement, text)
    return text


def translate_arabic_to_canonical(text: str) -> str:
    arabic_map = {
        'تعبان': 'fatigue', 'مرهق': 'fatigue', 'مضغوط': 'stress', 'ضغط': 'stress',
        'زعلان': 'sadness', 'حزين': 'sadness', 'عايز اركز': 'focus',
        'أركز': 'focus', 'محتاج اركز': 'focus', 'بديل': 'alternative',
        'اشرب مياه': 'water', 'محتاج مياه': 'water',
        'خطة غذائية': 'nutrition plan', 'خطة اكل': 'nutrition plan',
    }
    for ar, en in arabic_map.items():
        if ar in text:
            text += f" {en}"
    return text


# --- Intent Router ---

def local_intent_route(text: str) -> IntentResult:
    normalized = normalize_text(text)
    normalized = handle_typos(normalized)
    normalized = translate_arabic_to_canonical(normalized)

    medical_keywords = [
        'diagnose', 'diagnosis', 'treat', 'treatment', 'prescribe', 'medicine',
        'medication', 'cure', 'doctor', 'physician', 'hospital',
        'علاج', 'تشخيص', 'دواء', 'وصفة', 'دكتور', 'مستشفى'
    ]
    if any(kw in normalized for kw in medical_keywords):
        return IntentResult(intent='out_of_scope', confidence=0.95, source='local')

    greetings = [
        r'hello', r'hi', r'hey', r'salam', r'السلام عليكم', r'ازيك',
        r'good morning', r'good afternoon', r'good evening', r'good night',
        r'morning', r'afternoon', r'evening', r'night', r'صباح الخير', r'مساء الخير'
    ]
    if any(re.search(rf'\b{word}\b', normalized) for word in greetings):
        return IntentResult(intent='greeting', confidence=0.95, source='local')

    smalltalk_phrases = [
        'how are you', 'how you doing', 'how r u', 'whats up', "what's up",
        'sup', 'how is it going', "how's it going", 'hows it going',
        'good to see you', 'long time no see',
    ]
    if any(p in normalized for p in smalltalk_phrases):
        return IntentResult(intent='smalltalk', confidence=0.9, source='local')

    thanks_keywords = ['thanks', 'thank you', 'ok', 'okay', 'شكرا', 'تمام', 'ماشي']
    if any(re.search(rf'\b{kw}\b', normalized) for kw in thanks_keywords):
        return IntentResult(intent='thanks', confidence=0.95, source='local')

    help_keywords = [
        'help', 'what can you do', 'how does this work', 'what is mazaj',
        'what you can do', 'what can you make', 'what you can make',
        'what can you make for me', 'what you can make to me',
        'what can you help', 'how can you help', 'what do you do',
        'explain mazaj', 'about mazaj', 'who are you',
        'مساعدة', 'ايه هو مزاج', 'تقدر تعمل ايه', 'تقدر تساعدني في ايه',
        'تقدر تعمل لي ايه', 'تعمل ايه', 'بتعمل ايه', 'ساعدني'
    ]
    if any(kw in normalized for kw in help_keywords) or normalized in ('mazaj', 'what mazaj'):
        return IntentResult(intent='help', confidence=0.95, source='local')

    plan_keywords = ['plan', 'diet', 'meal plan', 'nutrition plan', 'خطة', 'خطة غذائية', 'خطة اكل']
    if any(kw in normalized for kw in plan_keywords):
        explanation_keywords = [
            'how', 'how can', 'how do', 'how will', 'explain', 'tell me how',
            'what happens', 'steps', 'process', 'before you',
            'ازاي', 'كيف', 'اشرح', 'هتعمل', 'حتعمل', 'الطريقة', 'الخطوات'
        ]
        if any(kw in normalized for kw in explanation_keywords):
            return IntentResult(intent='nutrition_plan_info', confidence=0.92, source='local')
        return IntentResult(intent='nutrition_plan_request', confidence=0.90, source='local')

    alt_keywords = ['alternative', 'instead of', 'replace', 'بديل']
    if any(kw in normalized for kw in alt_keywords):
        food_name = _extract_food_name(normalized)
        return IntentResult(
            intent='healthy_alternative', food_name=food_name,
            confidence=0.85 if food_name else 0.75, source='local'
        )

    water_keywords = ['water', 'hydration', 'drink', 'اشرب مياه', 'مياه']
    if any(kw in normalized for kw in water_keywords):
        return IntentResult(intent='hydration', confidence=0.90, source='local')

    mood_map = {
        'stress': ['stress', 'stressed', 'anxious', 'burnout', 'burned out', 'مضغوط', 'ضغط'],
        'sadness': ['sad', 'sadness', 'depressed', 'not happy', 'unhappy', 'down', 'not feeling good', 'not feeling well', 'زعلان', 'حزين', 'مش مبسوط'],
        'fatigue': ['tired', 'fatigue', 'exhausted', 'تعبان', 'مرهق'],
        'low_energy': ['low energy', 'energy', 'weak'],
        'focus': ['focus', 'studying', 'exam', 'concentration', 'اركز', 'أركز']
    }
    for mood, keywords in mood_map.items():
        if any(kw in normalized for kw in keywords):
            return IntentResult(intent='mood_recommendation', mood=mood, confidence=0.85, source='local')

    # "More options" / "another food" detection
    more_keywords = [
        'another food', 'another option', 'another one', 'give me another',
        'not this', 'i do not like this', 'i dont like this', "i don't like this",
        'different food', 'more options', 'more suggestions', 'something else',
        'other food', 'other options', 'try again', 'next',
        'غيره', 'مش عاجبني', 'اكل تاني', 'غيرها', 'ابغى غير',
        'حاجة تانية', 'اختيار تاني',
    ]
    if any(kw in normalized for kw in more_keywords):
        return IntentResult(intent='more_options', confidence=0.90, source='local')

    return IntentResult(intent='clarification', confidence=0.5, source='local', needs_clarification=True)


def _extract_food_name(text: str) -> Optional[str]:
    text = text.replace('cola', 'soda').replace('coke', 'soda').replace('pepsi', 'soda').replace('soft drink', 'soda')
    text = text.replace('كولا', 'soda').replace('بيبسي', 'soda')
    for food in ['soda', 'chips', 'cookie', 'pizza', 'burger', 'fries']:
        if food in text:
            return food
    return None


def extract_food_from_safety_query(text: str) -> Optional[str]:
    if not text:
        return None
    norm = normalize_text(text)
    
    patterns = [
        r'\bcan\s+i\s+eat\s+([a-zA-Z\s]+)',
        r'\bis\s+([a-zA-Z\s]+)\s+safe\b',
        r'\bshould\s+i\s+eat\s+([a-zA-Z\s]+)',
        r'\bcan\s+i\s+have\s+([a-zA-Z\s]+)',
        r'\bcan\s+we\s+eat\s+([a-zA-Z\s]+)',
        r'\bis\s+([a-zA-Z\s]+)\s+ok\b',
        r'\bis\s+([a-zA-Z\s]+)\s+okay\b',
        r'\bcan\s+i\s+try\s+([a-zA-Z\s]+)',
        r'\bcan\s+i\s+add\s+([a-zA-Z\s]+)',
        r'\bcan\s+i\s+insert\s+([a-zA-Z\s]+)',
        r'\bcan\s+i\s+include\s+([a-zA-Z\s]+)',
        r'\bcan\s+i\s+put\s+([a-zA-Z\s]+)',
        r'\bshould\s+i\s+add\s+([a-zA-Z\s]+)',
        r'\bshould\s+i\s+insert\s+([a-zA-Z\s]+)',
        r'\bshould\s+i\s+include\s+([a-zA-Z\s]+)',
        r'\bshould\s+i\s+put\s+([a-zA-Z\s]+)',
        r'\bهل\s+اقدر\s+اكل\s+([\w\s]+)',
        r'\bينفع\s+اكل\s+([\w\s]+)',
        r'\bهل\s+([\w\s]+)\s+امن\b',
        r'\bمسموح\s+([\w\s]+)',
        r'\bهل\s+يمكنني\s+اكل\s+([\w\s]+)',
    ]
    for pat in patterns:
        m = re.search(pat, norm)
        if m:
            food = m.group(1).strip()
            # Split at common prepositions/conjunctions/adverbials that indicate conditions or context
            split_patterns = [
                r'\bif\b', r'\bwith\b', r'\bfor\b', r'\bbased\b', r'\bbecause\b', 
                r'\bwhen\b', r'\bhaving\b', r'\bdue\b', r'\bin\b', r'\binto\b', r'\bat\b', r'\bon\b',
                r'\bمن\b', r'\bعشان\b', r'\بلو\b', r'\bفي\b', r'\bاذا\b', r'\bإذا\b', r'\bعندما\b'
            ]
            for pat_split in split_patterns:
                food = re.split(pat_split, food, flags=re.IGNORECASE)[0].strip()
            food = re.sub(r'\b(a|an|the|some|any)\b', '', food).strip()
            food = re.sub(r'[^\w\s]', '', food).strip()
            if food:
                return food
    return None


def is_more_options_followup(text: str) -> bool:
    if not text:
        return False
    norm = normalize_text(text)
    
    followup_keywords = [
        'another food',
        'another option',
        'give me another food',
        'give me another',
        'what can i eat instead',
        'what can i eat instead of this',
        'different food',
        'more options',
        'more suggestions',
        'something else',
        'other food',
        'other options',
        'try again',
        'next',
        'بديل',
        'غيره',
        'اكل تاني',
        'غيرها',
        'ابغى غير',
        'حاجة تانية',
        'اختيار تاني',
        'مش عاجبني',
    ]
    
    for kw in followup_keywords:
        if kw in norm:
            if kw in ['بديل', 'alternative', 'instead of', 'replace']:
                words = norm.split()
                if len(words) > 2:
                    return False
            return True
    return False
