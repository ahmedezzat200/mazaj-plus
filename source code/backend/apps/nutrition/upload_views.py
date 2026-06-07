import json
import os
import re
import warnings
import logging

from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.enums import UserRole
from apps.common.policies import require_authenticated
from apps.subscriptions.services import get_subscription_data
from apps.users.services import log_audit
from .models import FoodItem, FoodAlias

logger = logging.getLogger(__name__)

IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
INBODY_TYPES = {"application/pdf", "image/jpeg", "image/jpg", "image/png"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_INBODY_SIZE = 20 * 1024 * 1024

GEMINI_MODEL_NAMES = [
    os.getenv("GEMINI_VISION_MODEL", "").strip(),
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash",
    "models/gemini-flash-latest",
    "models/gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
]


def upload_error(code, message, stat=status.HTTP_400_BAD_REQUEST, **extra):
    payload = {"success": False, "code": code, "message": message}
    payload.update(extra)
    return Response(payload, status=stat)


def _block_admin_or_incomplete_profile(user):
    if hasattr(user, "profile"):
        if user.profile.role == UserRole.ADMIN:
            return upload_error(
                "AUTHORIZATION_ERROR",
                "Admins cannot use user-facing upload endpoints.",
                status.HTTP_403_FORBIDDEN,
            )
        if not user.profile.onboarding_complete:
            return upload_error(
                "PROFILE_INCOMPLETE",
                "Please complete your profile first.",
                status.HTTP_403_FORBIDDEN,
            )
    return None


def _require_feature(user, feature_key):
    sub_data = get_subscription_data(user)
    if not sub_data["features"].get(feature_key, False):
        return upload_error(
            "SUBSCRIPTION_REQUIRED",
            "This feature requires Pro or Ultra.",
            status.HTTP_403_FORBIDDEN,
        )
    return None


def _clean_food_label(label):
    cleaned = re.sub(r"[^A-Za-z0-9\u0600-\u06FF \-]", "", label or "").strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    if cleaned.upper() == "NO_FOOD" or len(cleaned) < 2:
        return None
    return cleaned[:80]


def _recognize_food_label(uploaded_file):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("Food image recognition unavailable: GEMINI_API_KEY is missing.")
        raise RuntimeError("FOOD_RECOGNITION_UNAVAILABLE")

    uploaded_file.seek(0)
    image_bytes = uploaded_file.read()
    uploaded_file.seek(0)

    warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
    try:
        import google.generativeai as genai
    except Exception as exc:
        logger.exception("Food image recognition unavailable: google-generativeai import failed.")
        raise RuntimeError("FOOD_RECOGNITION_UNAVAILABLE") from exc

    genai.configure(api_key=api_key)
    prompt = (
        "Identify the main food item in this image. Return only a short food label "
        "such as 'banana', 'cooked pasta', 'penne pasta', or 'grilled chicken'. "
        "If the image shows packaged food, ignore the brand name and return the generic food type only. "
        "Do not return calories, macros, "
        "nutrition advice, safety decisions, explanations, or JSON. If no clear food "
        "is visible, return exactly NO_FOOD."
    )
    image_part = {"mime_type": uploaded_file.content_type, "data": image_bytes}
    model_names = GEMINI_MODEL_NAMES
    last_exc = None
    for model_name in [name for name in model_names if name]:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                [prompt, image_part],
                generation_config={"temperature": 0, "max_output_tokens": 64},
                request_options={"timeout": 12},
            )
            text = _extract_first_text(response)
            if text:
                first_line = text.splitlines()[0] if text.splitlines() else text
                return _clean_food_label(first_line)
            return None
        except Exception as exc:
            last_exc = exc
            logger.warning("Food image recognition failed with model %s: %s", model_name, exc)

    raise RuntimeError("FOOD_RECOGNITION_UNAVAILABLE") from last_exc


def _call_gemini_file_prompt(uploaded_file, prompt, max_output_tokens=2000, temperature=0.2):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("Gemini file analysis unavailable: GEMINI_API_KEY is missing.")
        raise RuntimeError("GEMINI_ANALYSIS_UNAVAILABLE")

    uploaded_file.seek(0)
    file_bytes = uploaded_file.read()
    uploaded_file.seek(0)

    warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
    try:
        import google.generativeai as genai
    except Exception as exc:
        logger.exception("Gemini file analysis unavailable: google-generativeai import failed.")
        raise RuntimeError("GEMINI_ANALYSIS_UNAVAILABLE") from exc

    genai.configure(api_key=api_key)
    file_part = {"mime_type": uploaded_file.content_type, "data": file_bytes}
    model_names = GEMINI_MODEL_NAMES
    last_exc = None
    for model_name in [name for name in model_names if name]:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                [prompt, file_part],
                generation_config={"temperature": temperature, "max_output_tokens": max_output_tokens},
                request_options={"timeout": 20},
            )
            text = _extract_first_text(response).strip()
            if text:
                return text
        except Exception as exc:
            last_exc = exc
            logger.warning("Gemini file analysis failed with model %s: %s", model_name, exc)

    raise RuntimeError("GEMINI_ANALYSIS_UNAVAILABLE") from last_exc


def _extract_json_object(text):
    if not text:
        return None
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if match:
        cleaned = match.group(0)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Gemini InBody extraction returned non-JSON text: %s", text[:300])
        return None


def _allowed_database_foods_for_user(user, limit=80):
    from django.db.models import Q
    from .services import filter_foods_for_user_safety

    foods = FoodItem.objects.filter(
        Q(usage_policy__plan_allowed=True) | Q(usage_policy__recommendation_allowed=True),
        is_active=True,
    ).order_by("category", "name")
    foods, _ = filter_foods_for_user_safety(foods, user)

    allowed = []
    for food in foods[:limit]:
        allowed.append({
            "name": food.name,
            "category": food.category,
            "calories_per_100g": float(food.calories),
            "protein_g_per_100g": float(food.protein_g),
            "carbs_g_per_100g": float(food.carbs_g),
            "fat_g_per_100g": float(food.fat_g),
        })
    return allowed


def _user_health_profile_context(user):
    if not user or not getattr(user, "is_authenticated", False):
        return {
            "profile_available": False,
            "note": "No authenticated user profile was available.",
        }

    profile = getattr(user, "profile", None)
    allergies = list(
        user.allergies.select_related("allergy")
        .filter(allergy__is_active=True)
        .values_list("allergy__name", flat=True)
    )
    health_conditions = list(
        user.health_conditions.select_related("health_condition")
        .filter(health_condition__is_active=True)
        .values_list("health_condition__name", flat=True)
    )

    context = {
        "profile_available": bool(profile),
        "age": getattr(profile, "age", None),
        "gender": getattr(profile, "gender", None),
        "height_cm": float(profile.height_cm) if getattr(profile, "height_cm", None) is not None else None,
        "weight_kg": float(profile.weight_kg) if getattr(profile, "weight_kg", None) is not None else None,
        "nutrition_goal": getattr(profile, "nutrition_goal", None),
        "allergies": allergies,
        "health_conditions": health_conditions,
        "safety_note": (
            "ALLOWED_DATABASE_FOODS has already been filtered by the backend to exclude foods that conflict "
            "with saved allergies or blocked/warning health-condition rules."
        ),
    }
    return context


def _legacy_corrupted_inbody_prompt_unused(uploaded_file):
    prompt = (
        "أنت Mazaj+، أخصائي تغذية إكلينيكية ودود ومتخصص في علاقة المزاج بالأكل وتحليل تقارير InBody. "
        "المستخدم رفع صورة أو PDF لتقرير InBody ويتوقع تحليل عملي يقول له يأكل إيه لتحسين الوزن والطاقة، "
        "مش مجرد استخراج أرقام. اقرأ القيم الواضحة فقط من الملف. لا تخترع أي رقم غير واضح، ولا تشخص أمراض، "
        "ولا تصف علاج. لو قيمة غير واضحة اكتب: غير واضح.\n\n"
        "اكتب الرد بالعربي الواضح مع لمسة مصرية خفيفة، ونسقه Markdown بالأقسام دي بالضبط حسب المتاح:\n\n"
        "## 📊 تحليل تقرير الـ InBody\n"
        "- **الوزن:** ...\n"
        "- **نسبة الدهون:** ...\n"
        "- **الكتلة العضلية:** ...\n"
        "- **BMI:** ...\n"
        "- **BMR:** ...\n"
        "- **مستوى الدهون الحشوية:** ...\n\n"
        "### الوضع الحالي\n"
        "- اشرح في 2-3 نقاط بسيطة معنى التوازن بين الوزن والدهون والعضلات. "
        "مثال: لو الوزن عالي والدهون قليلة نسبيًا وضح أن الكتلة العضلية ممكن تكون عامل مهم. "
        "لو الدهون عالية اقترح اتجاه خسارة دهون. لو العضلات قليلة اقترح دعم البروتين وتمارين مقاومة.\n\n"
        "### الاحتياجات اليومية التقريبية\n"
        "- لو BMR واضح، احسب سعرات يومية تقريبية: BMR + 300 إلى 600 حسب النشاط كصيانة تقريبية، "
        "ثم اقترح عجز بسيط 300-500 لخسارة الدهون أو فائض بسيط 200-300 لزيادة العضلات حسب التحليل.\n"
        "- لو الوزن واضح، احسب بروتين تقريبي 1.6 إلى 2.0 جم لكل كجم من الوزن يوميًا.\n"
        "- أعطِ كارب ودهون كمدى تقريبي بسيط، بدون ادعاء دقة طبية كاملة.\n\n"
        "## 🍽️ خطة التغذية والوجبات\n"
        "- **الفطور:** وجبة محددة + فائدتها للمزاج/الطاقة\n"
        "- **الغداء:** وجبة محددة + فائدتها للمزاج/الطاقة\n"
        "- **العشاء:** وجبة محددة + فائدتها للمزاج/النوم\n"
        "- **سناك لتحسين المزاج:** 1-2 اختيارات محددة\n\n"
        "## ✅ أطعمة ركز عليها\n"
        "- اكتب 5-7 أطعمة أو مجموعات غذائية مناسبة للهدف وتحسين المزاج والطاقة.\n\n"
        "## 🚫 أطعمة قللها\n"
        "- اكتب 3-5 أنواع أكل يفضل تقليلها.\n\n"
        "## 💡 نصيحة سريعة لليوم\n"
        "- نصيحة واحدة عملية جدًا يقدر يعملها النهارده.\n\n"
        "## ⚠️ تنبيه طبي\n"
        "هذه النصائح استرشادية بناءً على تحليل الذكاء الاصطناعي ولا تغني عن استشارة طبيب أو أخصائي تغذية مختص. "
        "أي خطة نهائية لازم تتراجع مع الحساسية، الأمراض، والأهداف المحفوظة في بروفايل المستخدم."
    )
    return _call_gemini_file_prompt(uploaded_file, prompt, max_output_tokens=1300)


def _analyze_inbody_report(uploaded_file, user=None, user_input="Uploaded InBody scan."):
    extraction_prompt = (
        "Extract visible data from this InBody/body-composition report. Return JSON only. "
        "Do not explain, do not use Markdown, and do not invent values. If a value is not clear, "
        "use null and set confidence to 'low'. Capture every visible metric you can read.\n\n"
        "Use this schema exactly:\n"
        "{\n"
        '  "summary_confidence": "high|medium|low",\n'
        '  "metrics": {\n'
        '    "weight": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "body_fat_percentage": {"value": null, "unit": "%", "confidence": "low"},\n'
        '    "skeletal_muscle_mass": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "bmi": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "bmr": {"value": null, "unit": "kcal", "confidence": "low"},\n'
        '    "visceral_fat_level": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "body_water": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "protein": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "minerals": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "body_fat_mass": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "inbody_score": {"value": null, "unit": null, "confidence": "low"}\n'
        "  },\n"
        '  "visible_notes": [],\n'
        '  "unclear_sections": []\n'
        "}"
    )
    raw_extraction = _call_gemini_file_prompt(uploaded_file, extraction_prompt, max_output_tokens=1200)
    extracted = _extract_json_object(raw_extraction) or {
        "summary_confidence": "low",
        "metrics": {},
        "visible_notes": [],
        "unclear_sections": ["The report could not be parsed into structured fields."],
        "raw_text": raw_extraction[:1200],
    }
    allowed_foods = _allowed_database_foods_for_user(user)

    explanation_prompt = (
        "ROLE AND PERSONA:\n"
        "You are the advanced Mazaj+ Medical Nutrition Core (Mazaj+ AI Agent), operating as an expert "
        "Clinical Nutritionist, Behavioral Health Coach, and high-precision InBody Analyzer. Your purpose "
        "is to deliver highly personalized, data-driven nutrition plans that directly link the user's "
        "metabolic and physical metrics to psychological well-being through the Mood-Food Connection. "
        "You communicate in an empathetic, encouraging, scientifically grounded tone.\n\n"
        "CRITICAL LANGUAGE RULE:\n"
        "- Reply in ARABIC language only.\n"
        "- Do not use English for headings, labels, explanations, or paragraphs.\n"
        "- Metric abbreviations such as BMR, BMI, SMM are allowed only when needed inside Arabic sentences.\n"
        "- Use friendly professional Arabic with a light Egyptian dialect twist.\n\n"
        "INPUT CONTEXT:\n"
        f"[ALLOWED_DATABASE_FOODS]\n{json.dumps(allowed_foods, ensure_ascii=False, indent=2)}\n\n"
        f"[USER_INPUT]\n{user_input or 'Uploaded InBody scan.'}\n\n"
        f"[INBODY_DATA]\n{json.dumps(extracted, ensure_ascii=False, indent=2)}\n\n"
        "STRICT OPERATIONAL RULES:\n"
        "1. DATABASE ENFORCEMENT:\n"
        "- You MUST ONLY recommend ingredients, meals, and snacks listed under [ALLOWED_DATABASE_FOODS].\n"
        "- Absolutely DO NOT invent, assume, or suggest any food, spice, drink, ingredient, recipe, or snack outside this list.\n"
        "- If the allowed list is limited, say that Mazaj+ needs more safe database options instead of inventing foods.\n\n"
        "2. METRIC-BASED PERSONALIZATION, NO GENERIC ADVICE:\n"
        "- Food recommendations MUST be explicitly based on the visible InBody metrics, not generic healthy meal ideas.\n"
        "- If body fat is high: prioritize calorie-controlled, lean, high-protein foods from [ALLOWED_DATABASE_FOODS].\n"
        "- If SMM is low: prioritize protein-dense foods from [ALLOWED_DATABASE_FOODS] to support muscle synthesis.\n"
        "- If BMR is high: explain clearly how high energy needs affect portions and fuel requirements.\n"
        "- If metrics are unclear or missing: recommend a conservative safe baseline plan using database foods and ask for clearer values.\n\n"
        "3. DATA-DRIVEN JUSTIFICATION:\n"
        "- For EVERY meal or snack recommendation, briefly explain which specific InBody metric it supports, "
        "for example: يدعم الـ BMR المرتفع لديك, يساعد على دعم الكتلة العضلية SMM, or مناسب للتحكم في نسبة الدهون.\n\n"
        "4. MOOD SYNTHESIS:\n"
        "- Map the user's current mood, stress, low energy, anxiety, or cravings to neurochemical benefits of the selected database foods.\n"
        "- Mention serotonin, dopamine, cortisol, magnesium, omega-3, or protein only when relevant and without medical exaggeration.\n\n"
        "5. SAFETY:\n"
        "- Never diagnose, treat, prescribe, or claim medical certainty.\n"
        "- Keep all recommendations advisory and based on the available scan and database foods.\n\n"
        "OUTPUT FORMAT STRICTLY:\n"
        "## 🌟 الحالة المزاجية والتحليل النفسي\n"
        "[أدخل هنا تحليلاً ودوداً يربط حالته النفسية والمزاجية الحالية بتركيبة جسمه الحيوية]\n\n"
        "## 📊 تحليل تقرير الـ InBody المخصص\n"
        "- **الوضع الحالي:** [تقييم احترافي لنسبة الدهون والكتلة العضلية بناءً على الأرقام الظاهرة]\n"
        "- **الاحتياجات اليومية:** [عرض السعرات الحرارية والماكروز المحسوبة بناءً على الـ BMR والنشاط]\n\n"
        "## 🍽️ خطة التغذية والوجبات (من قائمة Mazaj+ المخصصة لك)\n"
        "- **الفطور:** [اسم الوجبة من القائمة متبوعاً بالتبرير الطبي المرتبط بمؤشر الـ InBody + الفائدة المزاجية]\n"
        "- **الغداء:** [اسم الوجبة من القائمة متبوعاً بالتبرير الطبي المرتبط بمؤشر الـ InBody + الفائدة المزاجية]\n"
        "- **العشاء:** [اسم الوجبة من القائمة متبوعاً بالتبرير الطبي المرتبط بمؤشر الـ InBody + الفائدة المزاجية]\n"
        "- **سناك لتحسين المزاج:** [السناك المختار من القائمة مع ربطه بالمؤشر الحيوي والمزاج]\n\n"
        "## 💡 نصيحة سريعة لليوم\n"
        "[نصيحة عملية مخصصة جداً لنمط حياته بناءً على أرقام الـ InBody ومستويات الترطيب والطاقة اليومية]\n\n"
        "## ⚠️ تنبيه طبي\n"
        "\"هذه النصائح استرشادية بناءً على تحليل الذكاء الاصطناعي لتطبيق Mazaj+، ولا تغني عن استشارة طبيب التغذية أو المتخصص المتابع لحالتك بصفة مباشرة.\"\n"
    )
    return _call_gemini_file_prompt(uploaded_file, explanation_prompt, max_output_tokens=2600)


def _analyze_inbody_report(uploaded_file, user=None, user_input="Uploaded InBody scan."):
    extraction_prompt = (
        "Extract visible data from this InBody/body-composition report. Return JSON only. "
        "Do not explain, do not use Markdown, and do not invent values. If a value is not clear, "
        "use null and set confidence to 'low'. Capture every visible metric you can read.\n\n"
        "Use this schema exactly:\n"
        "{\n"
        '  "summary_confidence": "high|medium|low",\n'
        '  "metrics": {\n'
        '    "weight": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "height": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "body_fat_percentage": {"value": null, "unit": "%", "confidence": "low"},\n'
        '    "skeletal_muscle_mass": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "bmi": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "bmr": {"value": null, "unit": "kcal", "confidence": "low"},\n'
        '    "visceral_fat_level": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "body_water": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "protein": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "minerals": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "body_fat_mass": {"value": null, "unit": null, "confidence": "low"},\n'
        '    "inbody_score": {"value": null, "unit": null, "confidence": "low"}\n'
        "  },\n"
        '  "visible_notes": [],\n'
        '  "unclear_sections": []\n'
        "}"
    )
    raw_extraction = _call_gemini_file_prompt(
        uploaded_file,
        extraction_prompt,
        max_output_tokens=1200,
        temperature=0,
    )
    extracted = _extract_json_object(raw_extraction) or {
        "summary_confidence": "low",
        "metrics": {},
        "visible_notes": [],
        "unclear_sections": ["The report could not be parsed into structured fields."],
        "raw_text": raw_extraction[:1200],
    }
    allowed_foods = _allowed_database_foods_for_user(user)
    health_profile = _user_health_profile_context(user)

    system_prompt = """
# Role & Persona
You are the "Mazaj+ Medical Nutrition Core", an expert Clinical Nutritionist and empathetic Health Educator. Your mission is to analyze InBody scans, explain the results clearly to the user in simple terms, and provide a tailored nutrition plan using ONLY our database foods.
CRITICAL RULE: You must respond EXCLUSIVELY in clear, encouraging, and friendly ENGLISH. Do not output a single word in Arabic.

# Input Context
- [ALLOWED_DATABASE_FOODS]: A strict list of safe foods available in the Mazaj+ database.
- [USER_HEALTH_PROFILE]: The user's saved goal, body data, allergies, and health conditions.
- [USER_INPUT]: The user's mood or question.
- [INBODY_DATA]: Structured values extracted from the uploaded InBody scan.
- [INBODY_DATA/IMAGE]: The uploaded InBody scan.

# Core Instructions
1. EXPLAIN THE INBODY (Educate the User):
   - Read the visible InBody metrics, especially Weight, Skeletal Muscle Mass, Body Fat %, BMI, BMR, and visceral fat when available.
   - Explain what these specific numbers mean in simple, non-medical English so the user understands their body's current state.
   - Example: "Your BMR is 2074 kcal, which means your body burns around this many calories just to keep you alive at rest."
   - If a metric is unclear or missing, say it is unclear instead of inventing a value.
2. STRICT DATABASE ENFORCEMENT:
   - You MUST ONLY recommend meals and snacks listed under [ALLOWED_DATABASE_FOODS].
   - DO NOT invent or suggest any food, ingredient, drink, recipe, spice, or snack outside this list.
   - If the list is limited, use the safest available options and say Mazaj+ needs more database foods instead of inventing options.
3. METRIC-BASED RECOMMENDATIONS:
   - Tie every food recommendation to the InBody findings you just explained.
   - Example: "I selected this high-protein chicken meal from the database to support your skeletal muscle mass of 45.6 kg."
4. HEALTH-PROFILE PERSONALIZATION:
   - Use [USER_HEALTH_PROFILE] when choosing meals.
   - Match meals to the user's saved nutrition goal, body measurements, allergies, and health conditions.
   - The meal plan must help the user move toward their saved goal. For WEIGHT_GAIN, choose higher-calorie and protein-supportive database foods. For WEIGHT_LOSS, choose calorie-controlled and protein-supportive database foods. For MAINTENANCE, choose balanced database foods that preserve energy and body composition.
   - The backend has already filtered [ALLOWED_DATABASE_FOODS] for allergy and health-condition safety. Do not recommend anything outside that safe list.
   - When relevant, explain that a meal was chosen because it is compatible with the user's saved health profile.
   - If allergies or health conditions are present, mention that the plan avoids conflicting foods without listing unnecessary private details.
5. DAILY NEEDS:
   - Use BMR as the base. Estimate daily calories as BMR plus an activity buffer when the goal is not explicit.
   - If weight is visible, estimate protein as about 1.6 to 2.0 g per kg body weight.
   - Keep calorie and macro calculations advisory and easy to understand.
6. SAFETY AND COMPLETENESS:
   - Be warm, supportive, and practical.
   - Keep the first section short, no more than 2 friendly sentences, so the full plan is always included.
   - Never diagnose, prescribe treatment, or claim medical certainty.
   - Do not cut off the response. Complete all sections.

# Output Formatting Template (STRICT)
You must format your response EXACTLY like this using Markdown and emojis in English. DO NOT cut off the response:

## 🌟 Mood & Well-being
[A friendly, empathetic message connecting their stated mood to their health journey]

## 📊 Understanding Your InBody Scan
- **What your numbers mean:** [Explain their Muscle Mass, Body Fat %, and BMR in simple English so they understand the paper]
- **Your Daily Needs:** [State their caloric and macronutrient targets based on their BMR]

## 🍽️ Your Mazaj+ Nutrition Plan 
- **Breakfast:** [Meal from ALLOWED_DATABASE_FOODS] - *Why: [Brief explanation linking this meal to a specific InBody metric and the user's health profile/goal]*
- **Lunch:** [Meal from ALLOWED_DATABASE_FOODS] - *Why: [Brief explanation linking this meal to a specific InBody metric and the user's health profile/goal]*
- **Dinner:** [Meal from ALLOWED_DATABASE_FOODS] - *Why: [Brief explanation linking this meal to a specific InBody metric and the user's health profile/goal]*
- **Mood-Boosting Snack:** [Snack from ALLOWED_DATABASE_FOODS] - *Why: [Brief explanation linking this snack to their mood, metrics, and health profile]*

## 💡 Quick Tip of the Day
[One actionable lifestyle or hydration tip tailored to their scan results]

## ⚠️ Advisory
"This guidance is generated by Mazaj+ AI based on your scan and is not a substitute for professional medical advice."
"""
    explanation_prompt = (
        f"{system_prompt}\n\n"
        f"[ALLOWED_DATABASE_FOODS]\n{json.dumps(allowed_foods, ensure_ascii=False, indent=2)}\n\n"
        f"[USER_HEALTH_PROFILE]\n{json.dumps(health_profile, ensure_ascii=False, indent=2)}\n\n"
        f"[USER_INPUT]\n{user_input or 'Uploaded InBody scan.'}\n\n"
        f"[INBODY_DATA]\n{json.dumps(extracted, ensure_ascii=False, indent=2)}\n"
    )
    return _call_gemini_file_prompt(
        uploaded_file,
        explanation_prompt,
        max_output_tokens=4096,
        temperature=0.2,
    )


def _extract_first_text(response):
    """Pull all text parts out of a Gemini response without crashing.

    The newer SDK raises if you access ``.text`` and the response was cut off
    (finish_reason=MAX_TOKENS) or filtered. Walk candidates -> parts manually
    and concatenate them because Gemini can split one answer across parts.
    """
    texts = []
    candidates = getattr(response, "candidates", None) or []
    for cand in candidates:
        content = getattr(cand, "content", None)
        for part in getattr(content, "parts", []) or []:
            text = getattr(part, "text", None)
            if text:
                texts.append(text)
    return "\n".join(texts)


def _match_food_item(label):
    if not label:
        return None
    normalized_label = label.strip().lower()
    normalized_label = re.sub(r"\s+", " ", normalized_label)
    normalized_label = re.sub(r"[^a-z0-9\u0600-\u06ff\s-]", " ", normalized_label)
    normalized_label = re.sub(r"\s+", " ", normalized_label).strip()

    canonical_food_terms = [
        ("penne", "pasta"),
        ("pasta", "pasta"),
        ("macaroni", "pasta"),
        ("spaghetti", "pasta"),
        ("noodle", "noodles"),
        ("noodles", "noodles"),
        ("مكرونة", "pasta"),
        ("مكرونه", "pasta"),
        ("مكارونة", "pasta"),
    ]
    labels_to_try = [normalized_label]
    for marker, canonical in canonical_food_terms:
        if marker in normalized_label and canonical not in labels_to_try:
            labels_to_try.append(canonical)

    package_words = {"package", "pack", "bag", "brand", "el", "maleka", "elmaleka", "queen", "raw", "dry", "dried"}
    filtered_tokens = [token for token in normalized_label.split() if token not in package_words and len(token) > 1]
    if filtered_tokens:
        filtered_label = " ".join(filtered_tokens)
        if filtered_label not in labels_to_try:
            labels_to_try.append(filtered_label)

    def find_exact(candidate):
        alias_match = FoodAlias.objects.filter(
            alias__iexact=candidate,
            food__is_active=True,
            food__usage_policy__image_lookup_allowed=True
        ).select_related('food').first()
        if alias_match:
            return alias_match.food

        exact_name = FoodItem.objects.filter(
            name__iexact=candidate,
            is_active=True,
            usage_policy__image_lookup_allowed=True
        ).first()
        if exact_name:
            return exact_name

        return FoodItem.objects.filter(
            food_key__iexact=candidate,
            is_active=True,
            usage_policy__image_lookup_allowed=True
        ).first()

    for candidate in labels_to_try:
        exact_match = find_exact(candidate)
        if exact_match:
            return exact_match

    # 1. Exact FoodAlias lookup (case-insensitive)
    alias_match = FoodAlias.objects.filter(
        alias__iexact=normalized_label,
        food__is_active=True,
        food__usage_policy__image_lookup_allowed=True
    ).select_related('food').first()
    if alias_match:
        return alias_match.food

    # 2. Exact FoodItem name lookup (case-insensitive)
    exact_name = FoodItem.objects.filter(
        name__iexact=normalized_label,
        is_active=True,
        usage_policy__image_lookup_allowed=True
    ).first()
    if exact_name:
        return exact_name

    # 3. Exact FoodItem food_key lookup (case-insensitive)
    exact_key = FoodItem.objects.filter(
        food_key__iexact=normalized_label,
        is_active=True,
        usage_policy__image_lookup_allowed=True
    ).first()
    if exact_key:
        return exact_key

    contains_name = FoodItem.objects.filter(
        name__icontains=normalized_label,
        is_active=True,
        usage_policy__image_lookup_allowed=True
    ).first()
    if contains_name:
        return contains_name

    label_tokens = [token for token in normalized_label.split() if len(token) > 2]
    if label_tokens:
        token_matches = FoodItem.objects.filter(
            is_active=True,
            usage_policy__image_lookup_allowed=True
        )
        for token in label_tokens[:3]:
            token_matches = token_matches.filter(name__icontains=token)
        token_match = token_matches.first()
        if token_match:
            return token_match

    return None


def _food_payload(food):
    return {
        "id": food.id,
        "name": food.name,
        "calories": float(food.calories),
        "protein": float(food.protein_g),
        "fat": float(food.fat_g),
        "carbs": float(food.carbs_g),
    }


class FoodImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        require_authenticated(request.user)

        blocked = _block_admin_or_incomplete_profile(request.user)
        if blocked:
            return blocked

        blocked = _require_feature(request.user, "food_image_upload")
        if blocked:
            return blocked

        image = request.FILES.get("image")
        if not image:
            return upload_error("VALIDATION_ERROR", "Image is required.")
        if image.content_type not in IMAGE_TYPES:
            return upload_error("VALIDATION_ERROR", "Unsupported format. Please upload a JPG, PNG, or WebP image.")
        if image.size > MAX_IMAGE_SIZE:
            return upload_error("VALIDATION_ERROR", "File too large. Maximum size is 10MB.")

        try:
            recognized_food = _recognize_food_label(image)
        except RuntimeError:
            return upload_error(
                "FOOD_RECOGNITION_UNAVAILABLE",
                (
                    "I could not analyze the image automatically right now. "
                    "Type the food name instead, and I will check it against Mazaj+ data."
                ),
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not recognized_food:
            return upload_error(
                "NO_FOOD_DETECTED",
                "I could not clearly identify food in this image. Try a clearer photo, or type the food name.",
            )

        matched_food = _match_food_item(recognized_food)
        if not matched_food:
            return upload_error(
                "NO_DATABASE_MATCH",
                "I recognized the food, but Mazaj+ does not have verified nutrition data for it yet.",
                recognized_food=recognized_food,
            )

        return Response(
            {
                "success": True,
                "recognized_food": recognized_food,
                "matched_food": _food_payload(matched_food),
                "source": "Mazaj+ database",
                "message": "Nutrition values are database references per 100g and may not represent the full portion shown in the image.",
            }
        )


class InBodyUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        require_authenticated(request.user)

        blocked = _block_admin_or_incomplete_profile(request.user)
        if blocked:
            return blocked

        blocked = _require_feature(request.user, "inbody_upload")
        if blocked:
            return blocked

        report = request.FILES.get("file")
        if not report:
            return upload_error("VALIDATION_ERROR", "File is required.")
        if report.content_type not in INBODY_TYPES:
            return upload_error("VALIDATION_ERROR", "Unsupported format. Please upload a PDF, JPG, or PNG file.")
        if report.size > MAX_INBODY_SIZE:
            return upload_error("VALIDATION_ERROR", "File too large. Maximum size is 20MB.")

        log_audit(
            actor=request.user,
            action="inbody_upload_received",
            resource_type="InBodyUpload",
            safe_metadata={
                "filename": report.name,
                "size_bytes": report.size,
                "content_type": report.content_type,
            },
        )

        try:
            analysis = _analyze_inbody_report(report, user=request.user)
            message = analysis
            upload_status = "analyzed_advisory_only"
        except RuntimeError:
            message = (
                "I received the InBody report, but I could not read the values clearly enough from this upload. "
                "Please upload a sharper full-page image, or enter the trusted values manually in your profile."
            )
            upload_status = "received_analysis_unavailable"

        return Response(
            {
                "success": True,
                "status": upload_status,
                "filename": report.name,
                "size_bytes": report.size,
                "content_type": report.content_type,
                "message": message,
            }
        )
