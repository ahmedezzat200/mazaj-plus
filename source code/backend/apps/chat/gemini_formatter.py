import logging
import os
import warnings

logger = logging.getLogger(__name__)

warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")

GEMINI_TEXT_MODELS = [
    os.getenv("GEMINI_TEXT_MODEL", "").strip(),
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]

_MAZAJ_SYSTEM_PROMPT = """
You are Mazaj+, a warm nutrition decision-support assistant.
Your job is to make users feel understood, then give clear advisory nutrition guidance.

Rules:
1. Never diagnose, treat, prescribe medication, or claim medical certainty.
2. Keep answers advisory and practical.
3. Do not invent profile details, allergies, conditions, calories, or macros.
4. If backend-provided profile context exists, use it carefully without exposing private details unnecessarily.
5. For project/account/upload/subscription questions, do not invent. Say project data must come from Mazaj+ backend tools.
6. For general wellness questions, answer from general knowledge in a concise, helpful way.
7. Match the user's language when possible.
8. Sound like a calm coach: acknowledge, answer, then offer a useful next step.
"""


def _get_genai_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        for model_name in [name for name in GEMINI_TEXT_MODELS if name]:
            try:
                return genai.GenerativeModel(model_name)
            except Exception as exc:
                logger.warning("External AI API model init failed for %s: %s", model_name, exc)
        return None
    except ImportError:
        logger.debug("External AI API package is not installed.")
        return None
    except Exception as exc:
        logger.error("External AI API model init error: %s", exc)
        return None


def generate_gemini_chat_response(
    user_message: str,
    conversation_history: list[dict],
    user_goal: str | None,
    allergy_names: list[str],
    condition_names: list[str],
) -> str | None:
    model = _get_genai_model()
    if model is None:
        return None

    try:
        profile_lines = []
        if user_goal:
            profile_lines.append(f"Nutrition goal: {user_goal}")
        if allergy_names:
            profile_lines.append(f"Allergies to be aware of: {', '.join(allergy_names)}")
        if condition_names:
            profile_lines.append(f"Health considerations: {', '.join(condition_names)}")

        prompt_parts = [_MAZAJ_SYSTEM_PROMPT]
        if profile_lines:
            prompt_parts.append("User profile context:\n" + "\n".join(profile_lines))

        recent = conversation_history[-8:] if len(conversation_history) > 8 else conversation_history
        if recent:
            history_lines = []
            for turn in recent:
                role = "User" if turn.get("sender") == "USER" else "Assistant"
                history_lines.append(f"{role}: {turn.get('message', '')}")
            prompt_parts.append("Conversation so far:\n" + "\n".join(history_lines))

        prompt_parts.append(f"User: {user_message}")
        prompt_parts.append("Assistant:")

        response = model.generate_content("\n\n".join(prompt_parts), request_options={"timeout": 5.0})
        text = getattr(response, "text", "") or ""
        return text.strip() or None
    except Exception as exc:
        logger.error("Gemini conversational response error: %s", exc)
        return None


def generate_chat_reply(user_message: str, user_context: dict) -> str:
    return generate_gemini_chat_response(
        user_message=user_message,
        conversation_history=[],
        user_goal=user_context.get("goal"),
        allergy_names=user_context.get("allergies", []) or [],
        condition_names=user_context.get("health_conditions", []) or [],
    ) or _fallback_reply(user_message)


def _fallback_reply(user_message: str) -> str:
    return (
        "I am with you. The general AI reply service is not available right now, "
        "but I can still help with Mazaj+ features, food checks, nutrition plans, and upload-based guidance."
    )


def format_chat_reply_with_gemini(base_reply: str, foods: list[dict], warnings: list[dict], mode: str) -> str:
    model = _get_genai_model()
    if model is None:
        return base_reply

    try:
        food_context = ""
        if foods:
            food_context = "Backend-approved foods:\n"
            for food in foods:
                food_context += f"- {food['name']}: {food.get('reason', 'Recommended by backend rules')}\n"

        warning_summary = ""
        if warnings:
            warning_summary = (
                f"Backend returned {len(warnings)} caution item(s). Keep the warning meaning intact."
            )

        prompt = f"""System: You format backend-approved Mazaj+ nutrition replies.
Rules:
1. Make the wording warm, natural, and clear.
2. Do not add foods, remove foods, change macros, or invent medical claims.
3. Do not reveal private allergy or condition names unless already present in the backend reply.
4. Keep safety refusals firm but helpful.
5. Return plain text only.

Mode: {mode}
Backend reply:
{base_reply}

{food_context}
{warning_summary}

Rewrite the backend reply without changing its meaning.
"""

        response = model.generate_content(prompt, request_options={"timeout": 5.0})
        text = getattr(response, "text", "") or ""
        return text.strip() or base_reply
    except Exception as exc:
        logger.error("Gemini formatter error: %s", exc)
        return base_reply
