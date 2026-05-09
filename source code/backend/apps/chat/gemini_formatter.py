import os
import warnings
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

# Suppress the deprecation warning from google-generativeai if it is installed
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

def format_chat_reply_with_gemini(base_reply: str, foods: list[dict], warnings: list[dict], mode: str) -> str:
    """
    Optional Gemini formatting layer for chat responses.
    Gemini only formats the reply_text; it does not decide foods or safety.
    This function is designed to NEVER crash and always fallback to base_reply.
    """
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return base_reply

        # Internal import to prevent top-level crash if dependency is missing
        try:
            import google.generativeai as genai
        except ImportError:
            logger.debug("Gemini formatter: google-generativeai package not installed. Falling back to base reply.")
            return base_reply

        genai.configure(api_key=api_key)
        
        # We only use gemini-1.5-flash for formatting
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare safe context for Gemini
        # We DO NOT send private user profile data (age, gender, specific allergy names, etc.)
        food_context = ""
        if foods:
            food_context = "Safe foods identified by backend:\n"
            for f in foods:
                food_context += f"- {f['name']}: {f.get('reason', 'Recommended for current state')}\n"
        
        warning_summary = ""
        if warnings:
            warning_summary = f"Note: Backend identified {len(warnings)} items requiring caution due to user health profile. These are handled server-side."

        prompt = f"""
System: You are a text formatter for Mazaj+, a nutrition decision-support system.
Rules:
1. You are only formatting backend-approved nutrition guidance.
2. Use only the provided data.
3. Do not add new foods.
4. Do not remove foods.
5. Do not change calories or macros.
6. Do not invent medical claims or diagnose.
7. Do not mention private user allergies or specific health conditions by name.
8. Keep wording advisory-only.
9. Keep it concise, friendly, and natural.
10. If no foods are provided, ask the user to clarify their mood or food preference.
11. Return plain text only.

Current Backend Reply: {base_reply}
{food_context}
{warning_summary}

Task: Rewrite the 'Current Backend Reply' to be more natural and engaging while strictly following the rules above.
"""
        
        response = model.generate_content(prompt)
        
        if response and response.text:
            formatted_text = response.text.strip()
            if formatted_text:
                return formatted_text
                
        return base_reply

    except Exception as e:
        # Fallback to original text on any error
        # We log the error but do not re-raise it
        logger.error(f"Gemini formatter error: {str(e)}")
        return base_reply
