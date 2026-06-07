import logging
import time
from django.db import transaction
from .models import ChatSession, ChatMessage, ChatRecommendation, ChatMode, ChatSender
from apps.nutrition.services import (
    get_foods_for_mood, filter_foods_for_user_safety,
    get_healthy_alternatives, get_hydration_data
)
from apps.subscriptions.services import check_and_increment_usage
from apps.common.enums import FeatureKey
from .agent import get_orchestrator, get_tool_registry

logger = logging.getLogger(__name__)


def _looks_arabic(text: str) -> bool:
    return any('\u0600' <= char <= '\u06ff' for char in text or "")


# --- Profile context helpers ---

def _get_sanitized_profile_context(user):
    """
    Returns (goal, allergy_names, condition_names) for the user.
    Only exposes human-readable names — never biometrics, IDs, or raw DB data.
    """
    goal = None
    allergy_names = []
    condition_names = []

    try:
        if hasattr(user, 'profile') and user.profile:
            goal = user.profile.nutrition_goal
    except Exception:
        pass

    try:
        allergy_names = list(
            user.allergies.select_related('allergy')
                          .values_list('allergy__name', flat=True)
        )
    except Exception:
        pass

    try:
        condition_names = list(
            user.health_conditions.select_related('health_condition')
                                  .values_list('health_condition__name', flat=True)
        )
    except Exception:
        pass

    return goal, allergy_names, condition_names


def _get_conversation_history(session):
    """
    Returns recent conversation turns as a list of dicts for the Gemini prompt.
    Fetches the last 10 messages only; the Gemini function will further cap them.
    """
    try:
        messages = (
            session.messages
                   .order_by('-created_at')[:10]
        )
        # Reverse so they are oldest-first
        return [
            {"sender": m.sender, "message": m.message}
            for m in reversed(list(messages))
        ]
    except Exception:
        return []


# --- Tool Implementations ---

def tool_help(**kwargs):
    if _looks_arabic(kwargs.get("message_text", "")):
        return {
            "reply": (
                "أنا معاك. Mazaj+ يساعدك في اقتراحات أكل حسب حالتك المزاجية، بدائل صحية، ترطيب، "
                "وخطط غذائية مبنية على بيانات بروفايلك وقواعد الأمان في المشروع. أي حاجة شخصية هجاوبك فيها من بيانات Mazaj+ فقط."
            ),
            "foods": [],
            "warnings": [],
            "db_lookup_time": 0.0,
            "rule_processing_time": 0.0
        }
    return {
        "reply": (
            "I can help you use Mazaj+ without making it feel like a form. Ask me for mood-based food ideas, "
            "a healthier swap, hydration guidance, or a nutrition plan. For anything personal, I use your saved "
            "Mazaj+ data and safety rules instead of guessing."
        ),
        "foods": [],
        "warnings": [],
        "db_lookup_time": 0.0,
        "rule_processing_time": 0.0
    }

def tool_mood_recommendation(user, session, mood, exclude_ids=None, **kwargs):
    db_start = time.perf_counter()
    if not mood:
        return {
            "reply": "Sure. Tell me how you are feeling right now, and I will look for options that fit your profile.",
            "foods": [],
            "warnings": [],
            "db_lookup_time": time.perf_counter() - db_start,
            "rule_processing_time": 0.0
        }

    foods = get_foods_for_mood(mood)
    db_time = time.perf_counter() - db_start

    rule_start = time.perf_counter()
    safe_foods, _ = filter_foods_for_user_safety(foods, user)

    # Exclude already-shown foods (for "more options" flow)
    if exclude_ids:
        safe_foods = safe_foods.exclude(id__in=exclude_ids)

    # Limit to 4 options for a cleaner UI and pagination
    safe_foods = list(safe_foods[:4])

    foods_data = []

    if safe_foods:
        reply = "I found a few options that look suitable for you. Pick what feels easiest today:"

        # Load mood explanations keyed by food_id for richer reason text
        from apps.nutrition.models import FoodMoodMapping, MoodTag
        mood_tag = MoodTag.objects.filter(name__iexact=mood).first()
        explanation_map = {}
        if mood_tag:
            for fmm in FoodMoodMapping.objects.filter(mood=mood_tag, food__in=safe_foods, is_active=True):
                explanation_map[fmm.food_id] = fmm.explanation

        for food in safe_foods:
            reason = explanation_map.get(food.id, f"May support wellbeing when you feel {mood}.")
            foods_data.append({
                "name": food.name,
                "calories": str(food.calories),
                "protein_g": str(food.protein_g),
                "carbs_g": str(food.carbs_g),
                "fat_g": str(food.fat_g),
                "reason": reason
            })

        ChatRecommendation.objects.create(
            session=session,
            mood_name=mood,
            recommended_foods=foods_data,
            warnings=[]
        )
    else:
        reply = (
            "I do not want to guess here. I could not find enough options that match both this mood and your saved "
            "safety profile. You can try a different mood, update your profile, or ask me for a safer alternative."
        )

    rule_time = time.perf_counter() - rule_start
    return {
        "reply": reply,
        "foods": foods_data,
        "warnings": [],
        "db_lookup_time": db_time,
        "rule_processing_time": rule_time
    }

def tool_healthy_alternative(user, food_name, **kwargs):
    db_start = time.perf_counter()
    if not food_name:
        return {
            "reply": "Tell me the food or drink you want to swap, and I will check Mazaj+ data for safer alternatives.",
            "foods": [],
            "warnings": [],
            "db_lookup_time": time.perf_counter() - db_start,
            "rule_processing_time": 0.0
        }

    alts = get_healthy_alternatives(food_name, user)
    db_time = time.perf_counter() - db_start

    rule_start = time.perf_counter()
    foods_data = []
    if alts.exists():
        reply = f"Yes. Here are some suitable alternatives for {food_name}:"
        for alt in alts:
            foods_data.append({
                "name": alt.alternative_food.name,
                "calories": str(alt.alternative_food.calories),
                "protein_g": str(alt.alternative_food.protein_g),
                "carbs_g": str(alt.alternative_food.carbs_g),
                "fat_g": str(alt.alternative_food.fat_g),
                "reason": alt.reason
            })
            
        session = kwargs.get("session")
        if session:
            ChatRecommendation.objects.create(
                session=session,
                mood_name="healthy_alternative",
                recommended_foods=foods_data,
                warnings=[]
            )
    else:
        reply = (
            "I do not have a verified alternative for this item yet, so I will not invent one. "
            "Try another food name, or ask me for a general healthy swap idea."
        )

    rule_time = time.perf_counter() - rule_start
    return {
        "reply": reply,
        "foods": foods_data,
        "warnings": [],
        "db_lookup_time": db_time,
        "rule_processing_time": rule_time
    }

def tool_hydration_status(user, session=None, **kwargs):
    db_start = time.perf_counter()
    h_data = get_hydration_data(user)
    target = h_data['target_ml']
    total = h_data['today_total_ml']
    
    mood = kwargs.get('mood')
    if not mood and session:
        mood = session.pending_mood

    from apps.nutrition.services import get_hydration_guide_for_user
    guide = get_hydration_guide_for_user(user, mood=mood)
    db_time = time.perf_counter() - db_start

    rule_start = time.perf_counter()
    reply = f"Here is your hydration check: your saved daily target is {target}ml, and you have logged {total}ml today."
    if guide:
        reply += f"\n\n**{guide.title}**\n{guide.message}"
        if guide.min_cups and guide.max_cups:
            reply += f" Recommended daily intake: {guide.min_cups}-{guide.max_cups} cups."

    rule_time = time.perf_counter() - rule_start
    return {
        "reply": reply,
        "foods": [],
        "warnings": [],
        "db_lookup_time": db_time,
        "rule_processing_time": rule_time
    }

def tool_nutrition_plan(user, session, **kwargs):
    db_start = time.perf_counter()
    from apps.nutrition.services import generate_nutrition_plan
    title = "Personalized Nutrition Plan"
    try:
        plan = generate_nutrition_plan(user, title)
        db_time = time.perf_counter() - db_start

        rule_start = time.perf_counter()
        plan_json = {
            "id": plan.id,
            "title": plan.title,
            "goal": plan.goal,
            "bmi": str(plan.bmi) if plan.bmi is not None else None,
            "estimated_daily_calories": str(plan.estimated_daily_calories) if plan.estimated_daily_calories is not None else None,
            "plan_data": plan.plan_data,
            "advisory_note": plan.advisory_note,
        }
        
        ChatRecommendation.objects.create(
            session=session,
            mood_name="nutrition_plan",
            recommended_foods=[],
            warnings=[],
            nutrition_plan=plan_json
        )
        
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": "Done. I built this plan from your saved Mazaj+ profile, goal, and safety rules, so review it as advisory guidance.",
            "foods": [],
            "warnings": [],
            "nutrition_plan": plan_json,
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }
    except Exception as e:
        db_time = time.perf_counter() - db_start
        rule_start = time.perf_counter()
        err_msg = str(e)
        if err_msg == "USAGE_LIMIT_EXCEEDED":
            reply = "You have reached your plan generation limit for now. I can still explain how plans work or help with a simpler food question."
        else:
            reply = (
                "I could not build the plan yet because some profile details seem missing. "
                "Update your height and weight, then tell me to make the plan again."
            )
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": reply,
            "foods": [],
            "warnings": [],
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }

def _get_latest_plan_context(session):
    latest_plan = (
        ChatRecommendation.objects
        .filter(session=session, nutrition_plan__isnull=False)
        .order_by('-created_at')
        .first()
    )
    if not latest_plan or not latest_plan.nutrition_plan:
        return {}, set()

    plan_data = latest_plan.nutrition_plan.get("plan_data") or {}
    names = set()
    for foods in plan_data.values():
        if isinstance(foods, list):
            for food in foods:
                if isinstance(food, str) and food.strip():
                    names.add(food.strip().lower())
    return plan_data, names


def _get_latest_plan_food_names(session):
    _, names = _get_latest_plan_context(session)
    return names


def _get_profile_safety_summary(user):
    allergy_names = []
    condition_names = []
    try:
        allergy_names = list(
            user.allergies.select_related('allergy')
                          .values_list('allergy__name', flat=True)
        )
    except Exception:
        pass
    try:
        condition_names = list(
            user.health_conditions.select_related('health_condition')
                                  .values_list('health_condition__name', flat=True)
        )
    except Exception:
        pass
    return allergy_names, condition_names


def tool_plan_food_swap(user, session, **kwargs):
    db_start = time.perf_counter()
    from apps.nutrition.models import FoodItem
    from apps.nutrition.services import _CATEGORY_MAPPING, _MEAL_TEMPLATES

    plan_data, current_plan_foods = _get_latest_plan_context(session)
    all_foods = FoodItem.objects.filter(is_active=True, usage_policy__plan_allowed=True)
    if current_plan_foods:
        from django.db.models import Q
        used_q = Q()
        for name in current_plan_foods:
            used_q |= Q(name__iexact=name)
        all_foods = all_foods.exclude(used_q)

    safe_foods, _ = filter_foods_for_user_safety(all_foods, user)
    safe_foods = list(safe_foods.order_by('category', 'name'))
    db_time = time.perf_counter() - db_start

    rule_start = time.perf_counter()
    foods_data = []
    allergy_names, condition_names = _get_profile_safety_summary(user)

    checks = []
    if allergy_names:
        checks.append("your saved allergies")
    if condition_names:
        checks.append("your saved health conditions")
    safety_text = " and ".join(checks) if checks else "your needs"

    def meal_for_food(food):
        template_category = None
        for group, categories in _CATEGORY_MAPPING.items():
            if food.category in categories:
                template_category = group
                break
        if not template_category:
            return None
        for meal, roles in _MEAL_TEMPLATES.items():
            if any(role_category == template_category for role_category, _ in roles):
                return meal
        return None

    meal_order = ["breakfast", "lunch", "dinner", "snacks"]
    used_food_ids = set()
    for meal in meal_order:
        meal_foods = plan_data.get(meal) if isinstance(plan_data, dict) else None
        if not meal_foods:
            continue
        candidate = next(
            (
                food for food in safe_foods
                if food.id not in used_food_ids and meal_for_food(food) == meal
            ),
            None,
        )
        if not candidate:
            candidate = next((food for food in safe_foods if food.id not in used_food_ids), None)
        if not candidate:
            continue
        used_food_ids.add(candidate.id)
        foods_data.append({
            "name": candidate.name,
            "meal": meal,
            "calories": str(candidate.calories),
            "protein_g": str(candidate.protein_g),
            "carbs_g": str(candidate.carbs_g),
            "fat_g": str(candidate.fat_g),
            "reason": (
                f"Suggested as a {meal} swap. It is different from the foods already shown in your plan, "
                f"and it passed Mazaj+ checks against {safety_text}."
            )
        })

    if not foods_data:
        for food in safe_foods[:4]:
            foods_data.append({
                "name": food.name,
                "meal": "plan option",
                "calories": str(food.calories),
                "protein_g": str(food.protein_g),
                "carbs_g": str(food.carbs_g),
                "fat_g": str(food.fat_g),
                "reason": (
                    f"Different from the foods already shown in your plan, and it passed Mazaj+ checks against {safety_text}."
                )
            })

    if foods_data:
        ChatRecommendation.objects.create(
            session=session,
            mood_name="plan_food_swap",
            recommended_foods=foods_data,
            warnings=[]
        )
        profile_bits = []
        if allergy_names:
            profile_bits.append("saved allergies")
        if condition_names:
            profile_bits.append("saved health conditions")
        profile_check = ", ".join(profile_bits) if profile_bits else "your needs"
        reply = (
            "Yes. I picked meal-specific swaps that fit what you already told Mazaj+. "
            f"I avoided foods already shown in the plan, then kept the new options aligned with your {profile_check}. "
            "Each card shows whether it fits breakfast, lunch, dinner, or snacks:"
        )
    else:
        reply = (
            "I could not find different suitable foods right now. "
            "Updating your food preferences or health details may open more options."
        )

    rule_time = time.perf_counter() - rule_start
    return {
        "reply": reply,
        "foods": foods_data,
        "warnings": [],
        "db_lookup_time": db_time,
        "rule_processing_time": rule_time
    }


def tool_nutrition_plan_info(**kwargs):
    session = kwargs.get("session")
    message_text = kwargs.get("message_text", "")
    if session:
        session.conversation_state = 'WAITING_FOR_PLAN_CONFIRMATION'
        session.pending_intent = 'nutrition_plan_request'
        session.save()

    if _looks_arabic(message_text):
        reply = (
            "أكيد. أنا مش هعمل الخطة فجأة من غير ما تبقى فاهم. هستخدم بيانات بروفايلك في Mazaj+ زي الهدف، "
            "بيانات الجسم الأساسية، الحساسية، والحالات الصحية، وبعدها أراجع الاختيارات على قواعد الأمان والداتا الموجودة في المشروع. "
            "لو تمام معاك، قلّي: اعملها، وساعتها أولّد الخطة."
        )
    else:
        reply = (
            "Of course. I will not create it behind your back. I use the details saved in your Mazaj+ profile, "
            "like your goal, basic body data, allergies, and health considerations, then check the plan against "
            "your food preferences and safety needs. If that sounds good, say \"make it\" and I will generate it."
        )

    return {
        "reply": reply,
        "foods": [],
        "warnings": [],
        "db_lookup_time": 0.0,
        "rule_processing_time": 0.0
    }

def tool_daily_tip(**kwargs):
    db_start = time.perf_counter()
    from apps.nutrition.services import get_daily_tip
    tip = get_daily_tip()
    db_time = time.perf_counter() - db_start
    if tip:
        return {"reply": f"Here is today's Mazaj+ tip: {tip.content}", "foods": [], "warnings": [], "db_lookup_time": db_time, "rule_processing_time": 0.0}
    return {"reply": "I do not have a new tip ready right now. Ask me about a food, mood, or hydration instead.", "foods": [], "warnings": [], "db_lookup_time": db_time, "rule_processing_time": 0.0}

def tool_safety_check(user, session, food_name, **kwargs):
    db_start = time.perf_counter()
    if not food_name:
        return {
            "reply": "Tell me the food or drink you want to check, and I will tell you if it looks suitable for you.",
            "foods": [],
            "warnings": [],
            "db_lookup_time": time.perf_counter() - db_start,
            "rule_processing_time": 0.0
        }

    from apps.nutrition.models import FoodItem, Allergy, UserAllergy, UserHealthCondition, FoodAllergenTag, FoodHealthConditionRule, FoodAlias
    from apps.common.enums import SafetyRiskLevel
    from django.db.models import Q
    import re

    # Clean and normalize food_name
    normalized_name = food_name.strip().lower()
    normalized_name = re.sub(r"\s+", " ", normalized_name)

    # State variables
    session.pending_food_name = food_name
    session.conversation_state = 'SAFETY_CHECK'
    session.save()

    # 1. Check if the query matches an allergy that the user explicitly has
    matching_allergy = Allergy.objects.filter(
        Q(key__iexact=normalized_name) | Q(name__iexact=normalized_name),
        is_active=True
    ).first()
    
    user_allergy_ids = list(UserAllergy.objects.filter(user=user).values_list('allergy_id', flat=True))
    db_time = time.perf_counter() - db_start
    
    rule_start = time.perf_counter()
    if matching_allergy and matching_allergy.id in user_allergy_ids:
        # User has this allergy, so it is UNSAFE
        reply_text = f"I would avoid {food_name}. It matches a saved allergy in your profile, so I cannot recommend it safely."
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": reply_text,
            "foods": [],
            "warnings": [f"Triggers saved allergy: {matching_allergy.name}"],
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }

    # 2. Look up the food item in the database
    db_lookup_start = time.perf_counter()
    food_item = None
    alias_match = FoodAlias.objects.filter(
        alias__iexact=normalized_name,
        food__is_active=True
    ).select_related('food').first()
    
    if alias_match:
        food_item = alias_match.food
    else:
        food_item = FoodItem.objects.filter(
            name__iexact=normalized_name,
            is_active=True
        ).first()
        if not food_item:
            food_item = FoodItem.objects.filter(
                food_key__iexact=normalized_name,
                is_active=True
            ).first()
        if not food_item:
            food_item = (
                FoodItem.objects
                .filter(name__icontains=normalized_name, is_active=True)
                .order_by('name')
                .first()
            )

    db_time += time.perf_counter() - db_lookup_start

    rule_start = time.perf_counter()
    if not food_item:
        # Unknown food
        reply_text = (
            "I do not have enough verified Mazaj+ data for this food yet, so I cannot safely confirm it for your profile. "
            "Try a more common name, or ask me for an alternative."
        )
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": reply_text,
            "foods": [],
            "warnings": [],
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }

    # 3. Check for specific allergens of this food item that the user has
    db_lookup_start = time.perf_counter()
    allergens_matched = FoodAllergenTag.objects.filter(
        food=food_item,
        allergy_id__in=user_allergy_ids
    ).select_related('allergy')
    db_time += time.perf_counter() - db_lookup_start

    rule_start = time.perf_counter()
    if allergens_matched.exists():
        allergen_names = [a.allergy.name for a in allergens_matched]
        reply_text = f"I would skip {food_item.name}. It may conflict with something you saved in Mazaj+, so I cannot recommend it."
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": reply_text,
            "foods": [],
            "warnings": [f"Triggers allergen(s): {', '.join(allergen_names)}"],
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }

    # 4. Check for health condition rules matching this food item (or its category)
    db_lookup_start = time.perf_counter()
    user_health_condition_ids = list(UserHealthCondition.objects.filter(user=user).values_list('health_condition_id', flat=True))
    
    health_rules = FoodHealthConditionRule.objects.filter(
        health_condition_id__in=user_health_condition_ids,
        risk_level__in=[SafetyRiskLevel.BLOCKED, SafetyRiskLevel.WARNING],
        is_active=True
    ).filter(
        Q(food=food_item) | Q(category=food_item.category, food__isnull=True)
    ).select_related('health_condition')
    db_time += time.perf_counter() - db_lookup_start

    rule_start = time.perf_counter()
    if health_rules.exists():
        rule = health_rules.first()
        condition_name = rule.health_condition.name
        reason = rule.reason or "not recommended for your health condition"
        reply_text = f"I would avoid {food_item.name} for now. Mazaj+ found a safety rule in your profile, so a safer alternative is a better move."
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": reply_text,
            "foods": [],
            "warnings": [f"Violates rule for {condition_name}: {reason}"],
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }

    # 5. Food is safe!
    foods_data = [{
        "name": food_item.name,
        "calories": str(food_item.calories),
        "protein_g": str(food_item.protein_g),
        "carbs_g": str(food_item.carbs_g),
        "fat_g": str(food_item.fat_g),
        "reason": f"{food_item.name} is safe and fits your health profile."
    }]

    # Create ChatRecommendation for the UI card
    ChatRecommendation.objects.create(
        session=session,
        mood_name="safety_check",
        recommended_foods=foods_data,
        warnings=[]
    )

    reply_text = f"{food_item.name} looks suitable for you. Keep it as advisory guidance, and adjust portions to your needs."
    rule_time = time.perf_counter() - rule_start
    return {
        "reply": reply_text,
        "foods": foods_data,
        "warnings": [],
        "db_lookup_time": db_time,
        "rule_processing_time": rule_time
    }

def tool_more_options(user, session, **kwargs):
    db_start = time.perf_counter()
    from apps.nutrition.services import _CATEGORY_MAPPING
    
    # Collect all food names already shown in this session's recommendations
    all_recs = ChatRecommendation.objects.filter(session=session)
    already_shown_names = set()
    for rec in all_recs:
        for food_data in rec.recommended_foods:
            if isinstance(food_data, dict) and 'name' in food_data:
                already_shown_names.add(food_data['name'].lower())

    # Check conversation state / context
    state = session.conversation_state
    food_name = session.pending_food_name
    mood = session.pending_mood
    
    last_rec = ChatRecommendation.objects.filter(
        session=session
    ).order_by('-created_at').first()
    
    if not mood and last_rec and last_rec.mood_name:
        mood = last_rec.mood_name

    db_time = time.perf_counter() - db_start
    rule_start = time.perf_counter()

    # 1. SAFETY CHECK CONTEXT
    if state == 'SAFETY_CHECK' and food_name:
        from apps.nutrition.services import get_safe_alternatives_for_blocked_food
        safe_alts = get_safe_alternatives_for_blocked_food(food_name, user)
        
        # Filter out already shown foods
        if already_shown_names:
            safe_alts = [f for f in safe_alts if f.name.lower() not in already_shown_names]
            
        foods_data = []
        for food in safe_alts:
            # Determine reason
            category_group = None
            for group, cats in _CATEGORY_MAPPING.items():
                if food.category in cats:
                    category_group = group
                    break
            reason = "Provides healthy nutrients and does not trigger your saved health conditions or allergies."
            if category_group == "Protein":
                reason = "Provides high-quality protein and is free of your allergy/condition triggers."
            elif category_group == "Fruits":
                reason = "A delicious, vitamin-rich alternative that fits your saved health profile."
            elif category_group == "Vegetables":
                reason = "A nutritious vegetable alternative that fits your saved health profile."
            elif category_group == "Dairy":
                reason = "A dairy alternative that is safe for your saved health profile."
            elif category_group == "Grains":
                reason = "A whole grain alternative that is safe for your saved health profile."
                
            foods_data.append({
                "name": food.name,
                "calories": str(food.calories),
                "protein_g": str(food.protein_g),
                "carbs_g": str(food.carbs_g),
                "fat_g": str(food.fat_g),
                "reason": reason
            })
            
        if foods_data:
            ChatRecommendation.objects.create(
                session=session,
                mood_name="safe_alternative",
                recommended_foods=foods_data,
                warnings=[]
            )
            reply = "Sure — here are some safe alternatives based on your profile:"
        else:
            reply = "I could not find any other safe options that fit your profile."
            
        rule_time = time.perf_counter() - rule_start
        return {"reply": reply, "foods": foods_data, "warnings": [], "db_lookup_time": db_time, "rule_processing_time": rule_time}

    # 2. HEALTHY ALTERNATIVE CONTEXT
    elif (state == 'HEALTHY_ALTERNATIVE' or not mood) and food_name:
        from apps.nutrition.services import get_healthy_alternatives
        alts = get_healthy_alternatives(food_name, user)
        
        # Exclude already shown foods
        if already_shown_names:
            alts = alts.exclude(alternative_food__name__in=already_shown_names)
            
        foods_data = []
        if alts.exists():
            reply = f"Sure — here are some healthier alternatives for {food_name}:"
            for alt in alts:
                foods_data.append({
                    "name": alt.alternative_food.name,
                    "calories": str(alt.alternative_food.calories),
                    "protein_g": str(alt.alternative_food.protein_g),
                    "carbs_g": str(alt.alternative_food.carbs_g),
                    "fat_g": str(alt.alternative_food.fat_g),
                    "reason": alt.reason
                })
                
            ChatRecommendation.objects.create(
                session=session,
                mood_name="healthy_alternative",
                recommended_foods=foods_data,
                warnings=[]
            )
        else:
            reply = f"I do not have any other healthy alternatives for {food_name}."
            
        rule_time = time.perf_counter() - rule_start
        return {"reply": reply, "foods": foods_data, "warnings": [], "db_lookup_time": db_time, "rule_processing_time": rule_time}

    # 3. MOOD RECOMMENDATION CONTEXT
    elif mood:
        exclude_ids = []
        if already_shown_names:
            from apps.nutrition.models import FoodItem
            from django.db.models import Q
            q = Q()
            for n in already_shown_names:
                q |= Q(name__iexact=n)
            exclude_ids = list(FoodItem.objects.filter(q).values_list('id', flat=True))
            
        res = tool_mood_recommendation(user=user, session=session, mood=mood, exclude_ids=exclude_ids)
        res["db_lookup_time"] += db_time
        return res

    # 4. NO CONTEXT FALLBACK
    else:
        rule_time = time.perf_counter() - rule_start
        return {
            "reply": "Sure — what are you looking for: mood support, a healthy alternative, or a nutrition plan?",
            "foods": [],
            "warnings": [],
            "db_lookup_time": db_time,
            "rule_processing_time": rule_time
        }


CLASSIFIER_SYSTEM_PROMPT = """
You are a routing classifier for Mazaj+, a nutrition decision-support app.
Classify the user message into either PATH_A or PATH_B.

PATH_A (Mazaj decision/action path) is for queries that:
- Ask about Mazaj+, the app, project features, pricing, subscriptions, limits, uploads, profile data, chat history, saved plans, or any data that should come from the project's backend/database.
- Ask for personalized food recommendations, meal plans, or recipes based on their profile, goal, mood, allergies, or health conditions.
- Ask for personal calculations (e.g. "How much water should I drink?").
- Ask safety-related questions about whether they can/should eat a specific food based on their profile, allergies, or conditions (e.g. "Is rice safe for diabetes?", "Can I eat fish?").
- Ask to retrieve or use their saved profile, history, tracking, or plans.
- Request system actions (e.g. plan generation, uploads, "another food", alternatives).

PATH_B (General AI path) is for queries that:
- Ask for general educational nutrition or health information (e.g. "What is protein?", "What is diabetes?", "How does hydration help energy?", "What are healthy breakfast ideas?").
- Ask general non-personalized lifestyle questions or broad definitions.
- Normal conversation, small talk, jokes, or non-nutrition topics that do not need Mazaj+ project data.

If the query asks about the project or requires project data, choose PATH_A.
If the query is unsafe, medical, or if it might affect user safety, allergies, diseases, nutrition plans, or personal food choices, default to PATH_A as a fail-safe.

Return JSON only in the following schema:
{
  "path": "PATH_A" | "PATH_B",
  "reason": "short explanation",
  "intent": "greeting|general_education|safety_check|mood_recommendation|hydration_check|nutrition_plan|healthy_alternative|other",
  "requires_profile": true | false,
  "requires_database": true | false,
  "requires_safety_rules": true | false
}
"""

def classify_path_with_external_ai(message_text: str) -> dict | None:
    """
    Calls the external AI API to classify the path as PATH_A or PATH_B.
    """
    import os
    import json
    import logging
    
    logger = logging.getLogger(__name__)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
        except Exception:
            model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"{CLASSIFIER_SYSTEM_PROMPT}\n\nUser message: \"{message_text}\"\n\nJSON output:"
        
        response = model.generate_content(prompt, request_options={"timeout": 2.5})
        if response and response.text:
            cleaned_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned_text)
            return data
    except Exception as e:
        logger.warning(f"External AI classifier failed or timed out: {e}")
        return None


def _mentions_nutrition_plan(norm: str) -> bool:
    plan_keywords = [
        'plan', 'diet', 'meal plan', 'nutrition plan',
        'خطة', 'خطة غذائية', 'خطة اكل'
    ]
    return any(kw in norm for kw in plan_keywords)


def _is_nutrition_plan_explanation_query(message_text: str) -> bool:
    from .conversation import normalize_text
    norm = normalize_text(message_text)
    if not _mentions_nutrition_plan(norm):
        return False

    explanation_keywords = [
        'how', 'how can', 'how do', 'how will', 'explain', 'tell me how',
        'what happens', 'steps', 'process', 'before you', 'can you explain',
        'ازاي', 'كيف', 'اشرح', 'هتعمل', 'حتعمل', 'الطريقة', 'الخطوات',
        'بتعملها ازاي', 'تعملها ازاي'
    ]
    return any(kw in norm for kw in explanation_keywords)


def _is_positive_plan_confirmation(message_text: str) -> bool:
    from .conversation import normalize_text
    norm = normalize_text(message_text)
    confirmations = [
        'make it', 'do it', 'yes', 'yeah', 'yep', 'ok', 'okay', 'sure',
        'go ahead', 'create it', 'generate it', 'start', 'start it',
        'اعملها', 'اعمله', 'نفذ', 'ابدأ', 'تمام', 'ماشي', 'اه', 'ايوه',
        'يلا', 'ابدأها'
    ]
    return any(kw in norm for kw in confirmations)


def _is_capability_query(norm: str) -> bool:
    words = set(norm.split())
    has_question = any(w in words for w in ["what", "how", "who"]) or any(
        phrase in norm for phrase in ["تقدر", "ايه", "ماذا", "كيف"]
    )
    has_ability = any(w in words for w in ["can", "make", "do", "help", "support"]) or any(
        phrase in norm for phrase in ["تعمل", "تساعد", "ساعد"]
    )
    addresses_assistant = any(w in words for w in ["you", "me", "to", "for"]) or any(
        phrase in norm for phrase in ["لي", "ليا", "انت", "أنت"]
    )
    if has_question and has_ability and addresses_assistant:
        return True

    capability_phrases = [
        'what can you do',
        'what you can do',
        'what can you make',
        'what you can make',
        'what can you make for me',
        'what you can make to me',
        'what can you help',
        'how can you help',
        'help me',
        'what do you do',
        'what are your features',
        'تقدر تعمل ايه',
        'تقدر تساعدني في ايه',
        'تقدر تعمل لي ايه',
        'تعمل ايه',
        'بتعمل ايه',
        'ساعدني'
    ]
    return any(phrase in norm for phrase in capability_phrases)


def _is_plan_request_text(norm: str) -> bool:
    if not _mentions_nutrition_plan(norm):
        return False
    request_words = [
        'make', 'create', 'generate', 'give', 'build', 'start', 'new',
        'اعمل', 'اعملها', 'سوي', 'ابدأ', 'نفذ'
    ]
    return any(word in norm for word in request_words) or len(norm.split()) <= 4


def _is_plan_food_swap_query(norm: str) -> bool:
    food_words = ['food', 'meal', 'eat', 'option', 'اكل', 'أكل', 'وجبة', 'اكلة', 'أكلة']
    change_words = [
        'another', 'other', 'different', 'replace', 'swap', 'instead',
        'غير', 'تاني', 'بدل', 'استبدل', 'مش عاجب'
    ]
    return any(word in norm for word in food_words) and any(word in norm for word in change_words)


def _session_has_nutrition_plan_context(session) -> bool:
    if not session:
        return False
    if session.mode == ChatMode.NUTRITION_PLAN_REQUEST:
        return True
    return ChatRecommendation.objects.filter(
        session=session,
        nutrition_plan__isnull=False,
    ).exists()


def _is_hydration_request(norm: str) -> bool:
    water_words = ['water', 'hydration', 'drink', 'cups', 'ml', 'مياه', 'مية', 'اشرب']
    personal_or_action = [
        'my', 'me', 'today', 'target', 'logged', 'log', 'should i', 'how much',
        'need', 'drink', 'اشرب', 'احتاج', 'انهارده', 'هدفي'
    ]
    return any(word in norm for word in water_words) and any(word in norm for word in personal_or_action)


def _extract_short_food_followup(norm: str):
    """Catch natural follow-ups like "what about egg" without using InBody flow."""
    import re
    patterns = [
        r'^what about\s+([a-zA-Z][a-zA-Z\s]{1,40})$',
        r'^how about\s+([a-zA-Z][a-zA-Z\s]{1,40})$',
        r'^and\s+([a-zA-Z][a-zA-Z\s]{1,40})$',
        r'^(?:can|should)\s+i\s+(?:add|insert|include|put)\s+([a-zA-Z][a-zA-Z\s]{1,40}?)(?:\s+(?:in|into|with|to)\s+(?:it|this|the plan|my plan))?$',
        r'^(?:can|should)\s+we\s+(?:add|insert|include|put)\s+([a-zA-Z][a-zA-Z\s]{1,40}?)(?:\s+(?:in|into|with|to)\s+(?:it|this|the plan|my plan))?$',
    ]
    for pattern in patterns:
        match = re.search(pattern, norm)
        if match:
            food = match.group(1).strip()
            food = re.split(r'\b(?:in|into|with|to)\b', food, flags=re.IGNORECASE)[0].strip()
            food = re.sub(r'\b(a|an|the|some|any)\b', '', food).strip()
            if food:
                return food
    return None


def _is_general_definition_query(norm: str) -> bool:
    definition_starts = [
        'what is ', 'what are ', 'define ', 'explain ', 'يعني ايه ', 'ما هو ', 'ما هي '
    ]
    if not any(norm.startswith(prefix) for prefix in definition_starts):
        return False
    project_context_words = [
        'mazaj', 'app', 'profile', 'subscription', 'plan', 'my', 'me',
        'مزاج', 'التطبيق', 'بروفايل', 'اشتراك', 'خطتي'
    ]
    return not any(word in norm for word in project_context_words)


def _local_project_action(message_text: str, session=None):
    """Resolve project/tool intents before the general AI path.

    This layer is deliberately forgiving: users often write short follow-ups
    ("make it") or imperfect English, and those should continue the project flow.
    """
    from .conversation import normalize_text, extract_food_from_safety_query, is_more_options_followup, local_intent_route
    from .schemas import HybridAgentAction

    norm = normalize_text(message_text)

    def action(intent, tool, arguments=None, confidence=0.96, source="local_project"):
        return HybridAgentAction(
            mode="BACKEND_TOOL",
            action="call_tool",
            intent=intent,
            tool=tool,
            arguments=arguments or {},
            direct_response=None,
            clarification_question=None,
            confidence=confidence,
            source=source,
        )

    if session and session.conversation_state == 'WAITING_FOR_PLAN_CONFIRMATION':
        if _is_positive_plan_confirmation(message_text):
            return action("nutrition_plan_request", "nutrition_plan", confidence=0.99, source="local_followup")
        if _is_nutrition_plan_explanation_query(message_text):
            return action("nutrition_plan_info", "nutrition_plan_info", confidence=0.98)

    if _session_has_nutrition_plan_context(session) and _is_plan_food_swap_query(norm):
        return action("plan_food_swap", "plan_food_swap", confidence=0.98, source="local_followup")

    if _is_capability_query(norm):
        return action("help", "help", confidence=0.99)

    if _is_nutrition_plan_explanation_query(message_text):
        return action("nutrition_plan_info", "nutrition_plan_info", confidence=0.98)

    if _is_plan_request_text(norm):
        return action("nutrition_plan_request", "nutrition_plan", confidence=0.97)

    if is_more_options_followup(message_text):
        if _session_has_nutrition_plan_context(session) and not _mentions_nutrition_plan(norm):
            return action("plan_food_swap", "plan_food_swap", confidence=0.96)
        if _mentions_nutrition_plan(norm) or (session and session.mode == ChatMode.NUTRITION_PLAN_REQUEST):
            return action("nutrition_plan_request", "nutrition_plan", confidence=0.95)
        return action("more_options", "more_options", confidence=0.95)

    safety_food = extract_food_from_safety_query(message_text)
    if safety_food:
        return action("safety_check", "safety_check", {"food_name": safety_food}, confidence=0.96)

    followup_food = _extract_short_food_followup(norm)
    if followup_food:
        return action("safety_check", "safety_check", {"food_name": followup_food}, confidence=0.94)

    if _is_hydration_request(norm):
        return action("hydration", "hydration_status", confidence=0.92)

    if _is_general_definition_query(norm):
        return None

    local_res = local_intent_route(message_text)
    if local_res.intent == "help":
        return action("help", "help", confidence=local_res.confidence)
    if local_res.intent == "nutrition_plan_info":
        return action("nutrition_plan_info", "nutrition_plan_info", confidence=local_res.confidence)
    if local_res.intent == "nutrition_plan_request":
        return action("nutrition_plan_request", "nutrition_plan", confidence=local_res.confidence)
    if local_res.intent == "mood_recommendation":
        return action("mood_recommendation", "mood_recommendation", {"mood": local_res.mood}, confidence=local_res.confidence)
    if local_res.intent == "healthy_alternative":
        return action("healthy_alternative", "healthy_alternative", {"food_name": local_res.food_name}, confidence=local_res.confidence)
    if local_res.intent == "hydration" and _is_hydration_request(norm):
        return action("hydration", "hydration_status", confidence=local_res.confidence)
    if local_res.intent == "daily_tip":
        return action("daily_tip", "daily_tip", confidence=local_res.confidence)
    if local_res.intent == "more_options":
        return action("more_options", "more_options", confidence=local_res.confidence)

    return None


def classify_message_path(message_text: str, user, session=None) -> str:
    """
    Layered routing system for Hybrid Chat Architecture.
    1. Deterministic checks for clear Mazaj actions.
    2. Lightweight external AI classifier fallback.
    3. Fail-safe rule to choose PATH_A for health/safety/personal choice queries.
    """
    from .conversation import normalize_text, extract_food_from_safety_query, is_more_options_followup
    import re
    norm = normalize_text(message_text)

    # --- Phase 1: Fast Deterministic PATH_A Checks ---

    if session and session.conversation_state == 'WAITING_FOR_PLAN_CONFIRMATION':
        if _is_positive_plan_confirmation(message_text):
            return 'PATH_A'

    if _is_nutrition_plan_explanation_query(message_text):
        return 'PATH_A'

    if _is_capability_query(norm):
        return 'PATH_A'
    
    # Safety Check: explicit food safety extraction
    if extract_food_from_safety_query(message_text):
        return 'PATH_A'

    if _extract_short_food_followup(norm):
        return 'PATH_A'

    # "another food" context
    if is_more_options_followup(message_text):
        return 'PATH_A'

    # Project/app data must be answered from backend-owned data and tools.
    project_keywords = [
        'mazaj', 'mazaj+', 'app', 'project', 'feature', 'features', 'pricing',
        'subscription', 'subscriptions', 'plan limit', 'limits', 'free tier',
        'pro tier', 'profile', 'history', 'tracking', 'upload', 'uploads',
        'inbody', 'chat history', 'saved plan', 'daily tip', 'what can you do',
        'what you can do', 'what can you make', 'what you can make',
        'how does this work', 'who are you', 'help me use',
        'مزاج', 'التطبيق', 'المشروع', 'اشتراك', 'الاشتراك', 'السعر', 'الاسعار',
        'الباقة', 'الباقات', 'البروفايل', 'الملف الشخصي', 'الرفع', 'الخطة',
        'الخطط', 'تاريخ الشات', 'المحادثات', 'تقدر تعمل ايه', 'مين انت',
        'مساعدة'
    ]
    if any(kw in norm for kw in project_keywords):
        return 'PATH_A'

    # Personal indicators
    personal_indicators = ['i', 'me', 'my', 'mine', 'profile', 'عندي', 'لي', 'أنا', 'انا', 'خطي', 'خطتي', 'نفسي']
    has_personal_ref = any(re.search(rf'\b{pw}\b', norm) for pw in personal_indicators)

    # Safety/Allergy keywords with personal reference
    safety_keywords = ['allergy', 'allergies', 'allergic', 'safe for me', 'is it safe', 'can i eat', 'حساسية', 'مريض', 'سكر', 'ضغط', 'امان', 'امن', 'مسموح']
    if any(kw in norm for kw in safety_keywords) and has_personal_ref:
        return 'PATH_A'

    # Mood food recommendation with personal context
    mood_keywords = ['stress', 'sad', 'tired', 'fatigue', 'energy', 'focus', 'mood', 'depressed', 'happy']
    arabic_moods = ['تعبان', 'مرهق', 'مضغوط', 'ضغط', 'زعلان', 'حزين', 'اركز', 'أركز', 'مش مبسوط']
    if any(kw in norm for kw in mood_keywords + arabic_moods):
        # E.g. "I feel sad", "give me food for fatigue"
        food_recs = ['eat', 'food', 'recommend', 'suggest', 'should i', 'can i', 'feel', 'feeling', 'اكل', 'أكل']
        if any(fr in norm for fr in food_recs) or has_personal_ref:
            return 'PATH_A'

    # Plan actions (e.g. "Make a nutrition plan")
    if _mentions_nutrition_plan(norm):
        plan_actions = ['make', 'create', 'generate', 'give', 'my', 'me', 'new', 'start', 'setup', 'اعمل', 'سوي', 'خطي', 'جديدة', 'عمل']
        if any(pa in norm for pa in plan_actions) or len(norm.split()) <= 3 or has_personal_ref:
            return 'PATH_A'

    # Alternatives/ swaps (e.g., "alternative to X")
    alt_keywords = ['alternative', 'instead of', 'replace', 'swap', 'بديل', 'بدائل']
    if any(kw in norm for kw in alt_keywords):
        return 'PATH_A'

    # Personal Hydration Tracking/Calculation
    water_keywords = ['water', 'hydration', 'drink', 'cup', 'ml', 'مياه', 'مية', 'اشرب']
    personal_water = ['my', 'target', 'today', 'log', 'how much water should i', 'should i drink', 'need to drink', 'logged']
    if any(kw in norm for kw in water_keywords):
        if any(pw in norm for pw in personal_water):
            return 'PATH_A'

    # Active session state requiring tools
    if session:
        if session.conversation_state in ['WAITING_FOR_MOOD', 'WAITING_FOR_FOOD_NAME']:
            greetings = ['hello', 'hi', 'hey', 'salam', 'السلام', 'مساعدة', 'help']
            if not any(g in norm for g in greetings):
                return 'PATH_A'

    # --- Phase 2: Lightweight Classifier Prompt Fallback ---
    ai_classification = classify_path_with_external_ai(message_text)
    if ai_classification:
        path = ai_classification.get("path")
        if path in ["PATH_A", "PATH_B"]:
            return path

    # --- Phase 3: Fail-safe Rule ---
    # If unsure and the query may affect safety, profile, conditions, allergies, or personal nutrition choice, default to PATH_A.
    safety_health_related = [
        'allergy', 'allergies', 'allergic', 'diabetes', 'diabetic', 'hypertension', 'celiac', 'kidney', 'heart',
        'safe', 'safety', 'danger', 'unsafe', 'limit', 'eat', 'drink', 'food', 'profile', 'condition', 'conditions',
        'disease', 'diseases', 'health', 'حساسية', 'مريض', 'سكر', 'ضغط', 'امان', 'امن', 'مسموح', 'اكل', 'شرب'
    ]
    if any(re.search(rf'\b{kw}\b', norm) for kw in safety_health_related):
        return 'PATH_A'

    return 'PATH_B'


# Register tools
registry = get_tool_registry()
registry.register("help", tool_help)
registry.register("mood_recommendation", tool_mood_recommendation)
registry.register("healthy_alternative", tool_healthy_alternative)
registry.register("hydration_status", tool_hydration_status)
registry.register("nutrition_plan", tool_nutrition_plan)
registry.register("plan_food_swap", tool_plan_food_swap)
registry.register("nutrition_plan_info", tool_nutrition_plan_info)
registry.register("daily_tip", tool_daily_tip)
registry.register("safety_check", tool_safety_check)
registry.register("more_options", tool_more_options)

# --- Main Orchestrator ---

def process_chat_message(user, message_text, session_id=None):
    """
    Orchestrates the chat message processing using a Hybrid Chat Architecture.
    
    Flow:
      1. Classify path (PATH_A: Mazaj business logic vs PATH_B: General AI path).
      2. Under PATH_A, execute backend/database/rules first, then optionally format text via external AI.
      3. Under PATH_B, bypass planner, call external AI directly to answer.
      4. Measure and log timing metrics securely.
    """
    from .gemini_formatter import generate_gemini_chat_response, format_chat_reply_with_gemini, _fallback_reply
    from .conversation import extract_food_from_safety_query, is_more_options_followup
    from .schemas import HybridAgentAction

    total_start = time.perf_counter()
    
    intent_routing_time = 0.0
    db_lookup_time = 0.0
    rule_processing_time = 0.0
    ai_call_time = 0.0

    # 1. Get or create session
    db_start = time.perf_counter()
    if session_id:
        session = ChatSession.objects.get(id=session_id, user=user)
    else:
        session = ChatSession.objects.create(
            user=user,
            title=message_text[:40] + ("..." if len(message_text) > 40 else ""),
            mode=ChatMode.CLARIFICATION
        )
    db_lookup_time += time.perf_counter() - db_start

    # 2. Path routing & intent detection
    routing_start = time.perf_counter()
    action = _local_project_action(message_text, session)
    path = 'PATH_A' if action else classify_message_path(message_text, user, session)
    
    if path == 'PATH_A' and action is None:
        from .conversation import normalize_text
        normalized_message = normalize_text(message_text)
        if session.conversation_state == 'WAITING_FOR_PLAN_CONFIRMATION' and _is_positive_plan_confirmation(message_text):
            action = HybridAgentAction(
                mode="BACKEND_TOOL",
                action="call_tool",
                intent="nutrition_plan_request",
                tool="nutrition_plan",
                arguments={},
                direct_response=None,
                clarification_question=None,
                confidence=0.98,
                source="local_followup"
            )
        elif _is_capability_query(normalized_message):
            action = HybridAgentAction(
                mode="BACKEND_TOOL",
                action="call_tool",
                intent="help",
                tool="help",
                arguments={},
                direct_response=None,
                clarification_question=None,
                confidence=0.98,
                source="local_override"
            )
        elif _is_nutrition_plan_explanation_query(message_text):
            action = HybridAgentAction(
                mode="BACKEND_TOOL",
                action="call_tool",
                intent="nutrition_plan_info",
                tool="nutrition_plan_info",
                arguments={},
                direct_response=None,
                clarification_question=None,
                confidence=0.98,
                source="local_override"
            )
        elif is_more_options_followup(message_text) and _mentions_nutrition_plan(normalized_message):
            action = HybridAgentAction(
                mode="BACKEND_TOOL",
                action="call_tool",
                intent="nutrition_plan_request",
                tool="nutrition_plan",
                arguments={},
                direct_response=None,
                clarification_question=None,
                confidence=0.95,
                source="local_override"
            )
        elif is_more_options_followup(message_text):
            action = HybridAgentAction(
                mode="BACKEND_TOOL",
                action="call_tool",
                intent="more_options",
                tool="more_options",
                arguments={},
                direct_response=None,
                clarification_question=None,
                confidence=0.95,
                source="local_override"
            )
        else:
            safety_food = extract_food_from_safety_query(message_text)
            if safety_food:
                action = HybridAgentAction(
                    mode="BACKEND_TOOL",
                    action="call_tool",
                    intent="safety_check",
                    tool="safety_check",
                    arguments={"food_name": safety_food},
                    direct_response=None,
                    clarification_question=None,
                    confidence=0.95,
                    source="local_override"
                )
            else:
                # Use orchestrator planning but enforce tool matching for PATH_A
                orchestrator = get_orchestrator()
                action = orchestrator.plan(message_text)
                if action.mode != "BACKEND_TOOL":
                    # Fallback to local routing tool mapping for PATH_A
                    from .conversation import local_intent_route
                    local_res = local_intent_route(message_text)
                    action = orchestrator._map_local_to_action(local_res)
                    if action.mode != "BACKEND_TOOL":
                        import dataclasses
                        action = dataclasses.replace(action, mode="BACKEND_TOOL", tool="help")
    elif path != 'PATH_A':
        # PATH_B (General AI path)
        action = HybridAgentAction(
            mode="GENERAL_CHAT",
            action="answer_direct",
            intent="general_qa",
            tool="none",
            arguments={},
            direct_response=None,
            clarification_question=None,
            confidence=0.95,
            source="path_b_direct"
        )

    intent_routing_time = time.perf_counter() - routing_start

    # Detect safety/allergy questions context and save to session
    if action.mode == "BACKEND_TOOL" and action.tool == "safety_check" and action.arguments.get("food_name"):
        session.pending_food_name = action.arguments["food_name"]
        session.conversation_state = 'SAFETY_CHECK'
        session.save()

    # Capture conversation history BEFORE recording the new user message,
    # so the history context sent to AI is the prior exchange only.
    db_start = time.perf_counter()
    conversation_history_snapshot = _get_conversation_history(session)
    
    # Record User Message
    ChatMessage.objects.create(
        session=session,
        sender=ChatSender.USER,
        message=message_text
    )
    db_lookup_time += time.perf_counter() - db_start

    # State Handling: Reset state if a new clear intent is detected
    if session.conversation_state != 'READY':
        if action.mode in ['GENERAL_CHAT', 'OUT_OF_SCOPE'] or (action.mode == 'BACKEND_TOOL' and action.tool not in ('none', 'more_options')):
            session.conversation_state = 'READY'
            session.pending_intent = None
            session.pending_mood = None
            session.pending_food_name = None
            session.save()

    # Execute Action
    reply_text = ""
    foods_data = []
    warnings_data = []
    result = {}

    # Map intent to ChatMode
    intent_map = {
        'greeting': ChatMode.GREETING,
        'thanks': ChatMode.GREETING,
        'help': ChatMode.HELP,
        'mood_recommendation': ChatMode.MOOD_RECOMMENDATION,
        'more_options': ChatMode.MOOD_RECOMMENDATION,
        'nutrition_plan_request': ChatMode.NUTRITION_PLAN_REQUEST,
        'plan_food_swap': ChatMode.HEALTHY_ALTERNATIVE,
        'nutrition_plan_info': ChatMode.HELP,
        'healthy_alternative': ChatMode.HEALTHY_ALTERNATIVE,
        'hydration': ChatMode.HYDRATION,
        'clarification': ChatMode.CLARIFICATION,
        'daily_tip': ChatMode.HELP,
        'safety_check': ChatMode.HEALTHY_ALTERNATIVE,
        'out_of_scope': ChatMode.CLARIFICATION,
        'general_qa': ChatMode.HELP
    }
    mode = intent_map.get(action.intent, ChatMode.CLARIFICATION)
    session.mode = mode
    session.save()

    try:
        with transaction.atomic():
            # Usage tracking
            if mode in [ChatMode.MOOD_RECOMMENDATION, ChatMode.NUTRITION_PLAN_REQUEST, ChatMode.HEALTHY_ALTERNATIVE]:
                check_and_increment_usage(user, FeatureKey.CHAT_GUIDANCE)

            if action.mode == "BACKEND_TOOL":
                # Execute backend tool
                tool_registry = get_tool_registry()
                result = tool_registry.execute(
                    action.tool,
                    user=user,
                    session=session,
                    message_text=message_text,
                    mood=action.arguments.get("mood"),
                    food_name=action.arguments.get("food_name")
                )
                
                # Accrue metrics reported by the tool
                db_lookup_time += result.get("db_lookup_time", 0.0)
                rule_processing_time += result.get("rule_processing_time", 0.0)
                
                reply_text = result.get("reply", "I processed your request.")
                foods_data = result.get("foods", [])
                warnings_data = result.get("warnings", [])

                # Save pending_mood on session for "more options" flow
                if action.tool in ("mood_recommendation", "more_options") and action.arguments.get("mood"):
                    session.pending_mood = action.arguments["mood"]
                    session.save()

                if action.tool == "healthy_alternative" and action.arguments.get("food_name"):
                    session.pending_food_name = action.arguments["food_name"]
                    session.conversation_state = 'HEALTHY_ALTERNATIVE'
                    session.save()

                # Optionally send approved reply text to external AI API for friendly wording
                # The structured cards are returned exactly from backend tool result, unmodified.
                formatted_reply_succeeded = False
                ai_start = time.perf_counter()
                try:
                    formatted_reply = format_chat_reply_with_gemini(
                        base_reply=reply_text,
                        foods=foods_data,
                        warnings=warnings_data,
                        mode=mode.value
                    )
                    if formatted_reply and formatted_reply != reply_text:
                        reply_text = formatted_reply
                        formatted_reply_succeeded = True
                except Exception as e:
                    logger.error(f"External AI API formatting failed: {e}. Falling back to backend reply.")
                ai_call_time += time.perf_counter() - ai_start

            else:
                # PATH_B (General AI path / direct call)
                db_start = time.perf_counter()
                # PATH_B is intentionally general. Project/profile-specific questions
                # are routed to PATH_A, so do not send profile context here.
                user_goal, allergy_names, condition_names = None, [], []
                db_lookup_time += time.perf_counter() - db_start

                ai_start = time.perf_counter()
                ai_reply = generate_gemini_chat_response(
                    user_message=message_text,
                    conversation_history=conversation_history_snapshot,
                    user_goal=user_goal,
                    allergy_names=allergy_names,
                    condition_names=condition_names,
                )
                ai_call_time += time.perf_counter() - ai_start

                if ai_reply:
                    reply_text = ai_reply
                else:
                    # Fallback to a clear direct response if the external AI is unavailable.
                    rule_start = time.perf_counter()
                    reply_text = _fallback_reply(message_text)
                    rule_processing_time += time.perf_counter() - rule_start

    except Exception as e:
        err_msg = str(e)
        if "USAGE_LIMIT_EXCEEDED" in err_msg:
            reply_text = (
                "You have reached your daily limit for this feature. "
                "Please try again later or upgrade to PRO for unlimited access."
            )
        elif "User has no subscription" in err_msg:
            reply_text = (
                "Please complete your profile and subscription setup first "
                "before requesting a nutrition plan."
            )
        else:
            logger.error(f"Error in chat agent execution: {err_msg}")
            reply_text = "I encountered an error while processing your request. Please try again later."

    # Record Assistant Message
    db_start = time.perf_counter()
    msg = ChatMessage.objects.create(
        session=session,
        sender=ChatSender.ASSISTANT,
        message=reply_text
    )

    last_rec = ChatRecommendation.objects.filter(session=session, message__isnull=True).order_by('-created_at').first()
    if last_rec:
        last_rec.message = msg
        last_rec.save()
    db_lookup_time += time.perf_counter() - db_start

    total_time = time.perf_counter() - total_start
    
    ai_used = False
    if path == "PATH_B" and 'ai_reply' in locals() and ai_reply:
        ai_used = True
    elif path == "PATH_A" and 'formatted_reply_succeeded' in locals() and formatted_reply_succeeded:
        ai_used = True
    response_source = "external AI API" if ai_used else "backend"

    # Secure logging of durations — no sensitive profile/allergy/message data included.
    logger.info(
        "Chat Response Timings: "
        "intent_routing_time=%.4fs, "
        "db_lookup_time=%.4fs, "
        "rule_processing_time=%.4fs, "
        "external_ai_call_time=%.4fs, "
        "total_response_time=%.4fs",
        intent_routing_time,
        db_lookup_time,
        rule_processing_time,
        ai_call_time,
        total_time
    )

    return {
        "session_id": session.id,
        "mode": mode.value,
        "reply_text": reply_text,
        "recommended_foods": foods_data,
        "warnings": warnings_data,
        "nutrition_plan": result.get("nutrition_plan") if (action.mode == "BACKEND_TOOL" and result) else None,
        "response_source": response_source,
        "selected_tool": action.tool if action else "none"
    }
