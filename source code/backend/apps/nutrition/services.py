from django.db import transaction
from django.db.models import Q
from apps.common.enums import SafetyRiskLevel
from .models import (
    FoodItem, MoodTag, FoodMoodMapping, FoodAllergenTag,
    FoodHealthConditionRule, HealthyAlternative, DailyTip,
    UserHealthCondition, UserAllergy
)

def get_foods_for_mood(mood_name):
    """Return active foods mapped to the given mood."""
    return FoodItem.objects.filter(
        is_active=True,
        usage_policy__recommendation_allowed=True,
        mood_mappings__mood__name__iexact=mood_name,
        mood_mappings__is_active=True
    ).order_by('-mood_mappings__priority').distinct()

def filter_foods_for_user_safety(foods, user):
    """
    Filter out foods that violate user's allergies or have a BLOCKED or WARNING
    risk level for the user's health conditions.
    Safety-first: both BLOCKED and WARNING foods are fully excluded.
    Returns (safe_foods_queryset, warnings_dict).
    warnings_dict is always empty because unsafe foods are never returned.
    """
    if not user or not user.is_authenticated:
        return foods, {}

    user_allergy_ids = UserAllergy.objects.filter(user=user).values_list('allergy_id', flat=True)
    user_health_condition_ids = UserHealthCondition.objects.filter(user=user).values_list('health_condition_id', flat=True)

    # 1. Exclude Allergen matches
    blocked_by_allergy = FoodAllergenTag.objects.filter(
        allergy_id__in=user_allergy_ids,
        food__in=foods
    ).values_list('food_id', flat=True)

    # 2. Exclude BLOCKED and WARNING health condition rules (safety over quantity)
    blocked_by_health = FoodHealthConditionRule.objects.filter(
        health_condition_id__in=user_health_condition_ids,
        risk_level__in=[SafetyRiskLevel.BLOCKED, SafetyRiskLevel.WARNING],
        is_active=True,
        food__in=foods
    ).values_list('food_id', flat=True)

    blocked_food_ids = set(blocked_by_allergy) | set(blocked_by_health)

    safe_foods = foods.exclude(id__in=blocked_food_ids)

    # No warnings collected — unsafe foods are fully excluded, not flagged.
    return safe_foods, {}

def get_healthy_alternatives(original_food_name, user=None):
    """Return alternative foods, filtered for safety if user is provided."""
    import re
    from .models import FoodAlias
    from django.db.models import Q
    
    normalized_name = original_food_name.strip().lower()
    normalized_name = re.sub(r"\s+", " ", normalized_name)

    allowed_alias_filter = Q(food__usage_policy__safety_review_status='CURATED_EXISTING_DATASET') | Q(food__usage_policy__recommendation_allowed=True) | Q(food__usage_policy__plan_allowed=True)
    allowed_food_filter = Q(usage_policy__safety_review_status='CURATED_EXISTING_DATASET') | Q(usage_policy__recommendation_allowed=True) | Q(usage_policy__plan_allowed=True)

    # 1. Map the input name to FoodItem (case-insensitive, exact lookups)
    alias_match = FoodAlias.objects.filter(
        alias__iexact=normalized_name,
        food__is_active=True
    ).filter(allowed_alias_filter).select_related('food').first()
    
    food_item = None
    if alias_match:
        food_item = alias_match.food
    else:
        food_item = FoodItem.objects.filter(
            name__iexact=normalized_name,
            is_active=True
        ).filter(allowed_food_filter).first()
        if not food_item:
            food_item = FoodItem.objects.filter(
                food_key__iexact=normalized_name,
                is_active=True
            ).filter(allowed_food_filter).first()

    if not food_item:
        return HealthyAlternative.objects.none()

    alternatives = HealthyAlternative.objects.filter(
        original_food_name=food_item.food_key,
        is_active=True,
        alternative_food__is_active=True
    ).filter(
        Q(alternative_food__usage_policy__safety_review_status='CURATED_EXISTING_DATASET') |
        Q(alternative_food__usage_policy__recommendation_allowed=True) |
        Q(alternative_food__usage_policy__plan_allowed=True)
    )
    
    # Filter for safety
    food_ids = alternatives.values_list('alternative_food_id', flat=True)
    foods = FoodItem.objects.filter(
        id__in=food_ids
    ).filter(allowed_food_filter)

    if user and user.is_authenticated:
        foods, _ = filter_foods_for_user_safety(foods, user)

    safe_food_ids = foods.values_list('id', flat=True)
    return alternatives.filter(alternative_food_id__in=safe_food_ids)

def get_daily_tip():
    """Return the topmost active daily tip."""
    return DailyTip.objects.filter(is_active=True).first()

def get_hydration_data(user):
    """Return hydration target and today's total for a user."""
    from .models import WaterIntakeLog
    from django.db.models import Sum
    from django.utils import timezone
    
    weight = user.profile.weight_kg
    target_ml = int(float(weight) * 35) if weight else 2000
    
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_total_ml = WaterIntakeLog.objects.filter(
        user=user, logged_at__gte=today_start
    ).aggregate(total=Sum("amount_ml"))["total"] or 0
    
    return {
        "target_ml": target_ml,
        "today_total_ml": today_total_ml
    }

from decimal import Decimal
from apps.common.enums import FeatureKey
from apps.subscriptions.services import check_and_increment_usage
from .models import NutritionPlan

def generate_nutrition_plan(user, title):
    from apps.common.enums import NutritionGoal
    profile = user.profile

    with transaction.atomic():
        check_and_increment_usage(user, FeatureKey.NUTRITION_PLAN, limit=5)

        bmi = None
        estimated_calories = None

        if profile.height_cm and profile.weight_kg:
            height_m = float(profile.height_cm) / 100.0
            bmi = float(profile.weight_kg) / (height_m * height_m)

            est = float(profile.weight_kg) * 30
            if profile.nutrition_goal == NutritionGoal.WEIGHT_LOSS:
                est -= 300
            elif profile.nutrition_goal == NutritionGoal.WEIGHT_GAIN:
                est += 300

            estimated_calories = Decimal(str(round(est, 2)))
            bmi = Decimal(str(round(bmi, 2)))

        all_foods = FoodItem.objects.filter(is_active=True, usage_policy__plan_allowed=True)
        safe_foods, _ = filter_foods_for_user_safety(all_foods, user)

        plan_data = _compose_meal_plan(safe_foods, profile.nutrition_goal)

        advisory_note = (
            "Advisory only: this plan is built from foods in our curated database that "
            "are safe for your saved profile. It does not replace medical or dietitian advice."
        )

        plan = NutritionPlan.objects.create(
            user=user,
            title=title,
            goal=profile.nutrition_goal or "MAINTENANCE",
            bmi=bmi,
            estimated_daily_calories=estimated_calories,
            plan_data=plan_data,
            advisory_note=advisory_note
        )

        return plan


_CATEGORY_MAPPING = {
    "Grains": ['grains', 'grains_pasta', 'baked_goods', 'cereals_breakfast'],
    "Fruits": ['fruits'],
    "Dairy": ['dairy_eggs'],
    "Protein": ['legumes_beans', 'sausages_meats', 'nuts_seeds', 'poultry', 'beef', 'fish_seafood', 'meat_poultry', 'mixed_meals', 'middle_eastern', 'vegetarian', 'soy', 'poultry_raw', 'beef_raw'],
    "Vegetables": ['vegetables'],
}

_MEAL_TEMPLATES = {
    "breakfast": [("Grains", 1), ("Fruits", 1), ("Dairy", 1)],
    "lunch":     [("Protein", 1), ("Vegetables", 1), ("Grains", 1)],
    "dinner":    [("Protein", 1), ("Vegetables", 2), ("Grains", 1)],
    "snacks":    [("Fruits", 1), ("Protein", 1)],
}

def _compose_meal_plan(safe_foods_qs, goal):
    """Build a coherent plan_data dict from category-aware safe foods.

    Falls back gracefully when a category is empty so the plan never returns
    empty arrays as long as *any* safe food exists.
    """
    import random
    from apps.common.enums import NutritionGoal

    by_category = {}
    for f in safe_foods_qs:
        # Map DB category to template category
        template_cat = None
        for key, vals in _CATEGORY_MAPPING.items():
            if f.category in vals:
                template_cat = key
                break
        if template_cat:
            by_category.setdefault(template_cat, []).append(f)
        else:
            by_category.setdefault(f.category, []).append(f)

    flat_pool = [f for items in by_category.values() for f in items]
    if not flat_pool:
        return {"breakfast": [], "lunch": [], "dinner": [], "snacks": []}

    # Per-goal nudges: weight loss biases toward vegetables + lean protein,
    # weight gain biases toward grains + protein.
    def _pick(category, count, used):
        pool = [f for f in by_category.get(category, []) if f.name not in used]
        if not pool:
            pool = [f for f in flat_pool if f.name not in used] or flat_pool
        random.shuffle(pool)
        return pool[:count]

    plan = {}
    used_today = set()
    for meal, roles in _MEAL_TEMPLATES.items():
        items = []
        for category, count in roles:
            picks = _pick(category, count, used_today)
            for p in picks:
                items.append(p.name)
                used_today.add(p.name)
        # Goal nudges: weight gain → add a starch-heavy extra; weight loss → trim snacks
        if goal == NutritionGoal.WEIGHT_GAIN and meal in ("lunch", "dinner"):
            extra = _pick("Grains", 1, used_today)
            for p in extra:
                if p.name not in items:
                    items.append(p.name)
                    used_today.add(p.name)
        if goal == NutritionGoal.WEIGHT_LOSS and meal == "snacks":
            items = items[:1]
        plan[meal] = items

    return plan


def get_hydration_guide_for_user(user, mood=None):
    from .models import HydrationGuide, UserHealthCondition
    
    # 1. Check conditions
    if user and user.is_authenticated:
        user_conditions = UserHealthCondition.objects.filter(user=user).select_related('health_condition')
        for uc in user_conditions:
            cond_key = uc.health_condition.key
            guide = HydrationGuide.objects.filter(context_type='condition', context_key=cond_key).first()
            if guide:
                return guide
                
    # 2. Check mood
    if mood:
        guide = HydrationGuide.objects.filter(context_type='mood', context_key=mood.lower()).first()
        if guide:
            return guide
            
    # 3. Fallback to general daily guide
    return HydrationGuide.objects.filter(guide_key='general_daily').first()


def get_safe_alternatives_for_blocked_food(blocked_food_name: str, user):
    """
    Finds safe alternative foods from the database for a blocked food name.
    Applies user allergies, health conditions, allergens, condition rules, and usage policy.
    Excludes the blocked food, foods with the allergen of the blocked food, and USDA lookup-only foods.
    """
    if not blocked_food_name:
        return []
        
    blocked_norm = blocked_food_name.lower().strip()
    
    # Get all active foods allowed for recommendation
    candidates = FoodItem.objects.filter(
        is_active=True,
        usage_policy__recommendation_allowed=True
    )
    
    # Determine terms to exclude
    exclude_terms = [blocked_norm]
    if blocked_norm == 'fish':
        exclude_terms.extend(['seafood', 'salmon', 'tuna', 'cod', 'mackerel', 'sardine', 'trout', 'halibut', 'anchovy', 'herring', 'fish_seafood'])
    elif blocked_norm == 'sesame':
        exclude_terms.extend(['tahini', 'tahina'])
    elif blocked_norm == 'milk' or blocked_norm == 'dairy':
        exclude_terms.extend(['cheese', 'yogurt', 'butter', 'cream', 'milk'])
        
    for term in exclude_terms:
        candidates = candidates.exclude(name__icontains=term).exclude(food_key__icontains=term)
        
    # Exclude foods mapped to the matching allergen tags
    from .models import Allergy, FoodAllergenTag
    matching_allergy = Allergy.objects.filter(Q(key__iexact=blocked_norm) | Q(name__iexact=blocked_norm)).first()
    if matching_allergy:
        allergen_food_ids = FoodAllergenTag.objects.filter(allergy=matching_allergy).values_list('food_id', flat=True)
        candidates = candidates.exclude(id__in=allergen_food_ids)
        
    # Filter for user safety (excludes user's allergies and health condition rules)
    safe_candidates, _ = filter_foods_for_user_safety(candidates, user)
    
    # Group and prioritize candidates based on the category group of the blocked food
    blocked_food_item = FoodItem.objects.filter(
        Q(name__icontains=blocked_norm) | Q(food_key__icontains=blocked_norm)
    ).first()
    
    category_group = None
    if blocked_food_item:
        for group, cats in _CATEGORY_MAPPING.items():
            if blocked_food_item.category in cats:
                category_group = group
                break
                
    preferred = []
    others = []
    
    for food in safe_candidates:
        food_group = None
        for group, cats in _CATEGORY_MAPPING.items():
            if food.category in cats:
                food_group = group
                break
        if category_group and food_group == category_group:
            preferred.append(food)
        else:
            others.append(food)
            
    import random
    random.shuffle(preferred)
    random.shuffle(others)
    
    results = preferred + others
    
    # Return the top 4
    result_ids = [f.id for f in results[:4]]
    final_foods = list(FoodItem.objects.filter(id__in=result_ids))
    final_foods.sort(key=lambda x: result_ids.index(x.id))
    
    return final_foods

