import re

def normalize_text(text: str) -> str:
    """
    Normalizes input text for better matching.
    - lowercase
    - trim spaces
    - remove repeated spaces
    - handles simple punctuation
    """
    if not text:
        return ""
    
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\u0600-\u06FF]', '', text) # Keep Arabic and Alphanumeric
    return text

def handle_typos(text: str) -> str:
    """
    Maps common typos and variations to canonical forms.
    """
    # Simple regex based replacements for common variations
    typo_map = {
        r'stress+ed+': 'stressed',
        r'stres+ed': 'stressed',
        r'tierd': 'tired',
        r'tired+': 'tired',
        r'focuss+': 'focus',
        r'mazaj+': 'mazaj',
        r'brun+ed out': 'burned out',
        r'burn+ed out': 'burned out',
    }
    
    for pattern, replacement in typo_map.items():
        text = re.sub(pattern, replacement, text)
    
    return text

def translate_arabic_to_canonical(text: str) -> str:
    """
    Maps common Arabic phrases to English canonical intent keywords.
    """
    arabic_map = {
        'تعبان': 'fatigue',
        'مرهق': 'fatigue',
        'مضغوط': 'stress',
        'ضغط': 'stress',
        'زعلان': 'sadness',
        'حزين': 'sadness',
        'عايز اركز': 'focus',
        'أركز': 'focus',
        'محتاج اركز': 'focus',
        'بديل': 'alternative',
        'اشرب مياه': 'water',
        'محتاج مياه': 'water',
        'خطة غذائية': 'nutrition plan',
        'خطة اكل': 'nutrition plan',
    }
    
    for ar, en in arabic_map.items():
        if ar in text:
            # We append the English equivalent to help the local router
            text += f" {en}"
            
    return text
