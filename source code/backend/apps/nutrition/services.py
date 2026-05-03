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
        mood_mappings__mood__name__iexact=mood_name,
        mood_mappings__is_active=True
    ).order_by('-mood_mappings__priority').distinct()

def filter_foods_for_user_safety(foods, user):
    """
    Filter out foods that violate user's allergies or have a BLOCKED risk level
    for the user's health conditions. Collect WARNINGs.
    Returns (safe_foods_queryset, warnings_dict).
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

    # 2. Exclude BLOCKED health condition rules
    blocked_by_health = FoodHealthConditionRule.objects.filter(
        health_condition_id__in=user_health_condition_ids,
        risk_level=SafetyRiskLevel.BLOCKED,
        is_active=True,
        food__in=foods
    ).values_list('food_id', flat=True)

    blocked_food_ids = set(blocked_by_allergy) | set(blocked_by_health)
    
    safe_foods = foods.exclude(id__in=blocked_food_ids)

    # 3. Collect WARNINGs
    warnings_qs = FoodHealthConditionRule.objects.filter(
        health_condition_id__in=user_health_condition_ids,
        risk_level=SafetyRiskLevel.WARNING,
        is_active=True,
        food__in=safe_foods
    )
    
    warnings_dict = {}
    for rule in warnings_qs:
        if rule.food_id:
            if rule.food_id not in warnings_dict:
                warnings_dict[rule.food_id] = []
            warnings_dict[rule.food_id].append("This item may require caution based on your saved profile.")

    return safe_foods, warnings_dict

def get_healthy_alternatives(original_food_name, user=None):
    """Return alternative foods, filtered for safety if user is provided."""
    alternatives = HealthyAlternative.objects.filter(
        original_food_name__icontains=original_food_name,
        is_active=True,
        alternative_food__is_active=True
    )
    
    food_ids = alternatives.values_list('alternative_food_id', flat=True)
    foods = FoodItem.objects.filter(id__in=food_ids)

    if user and user.is_authenticated:
        foods, _ = filter_foods_for_user_safety(foods, user)

    safe_food_ids = foods.values_list('id', flat=True)
    return alternatives.filter(alternative_food_id__in=safe_food_ids)

def get_daily_tip():
    """Return the topmost active daily tip."""
    return DailyTip.objects.filter(is_active=True).first()

from decimal import Decimal
from apps.common.enums import FeatureKey
from apps.subscriptions.services import check_and_increment_usage
from .models import NutritionPlan

def generate_nutrition_plan(user, title):
    from apps.common.enums import NutritionGoal
    profile = user.profile
    
    with transaction.atomic():
        check_and_increment_usage(user, FeatureKey.NUTRITION_PLAN, limit=1)

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

        all_foods = FoodItem.objects.filter(is_active=True)
        safe_foods, _ = filter_foods_for_user_safety(all_foods, user)
        
        safe_list = list(safe_foods)
            
        def safe_sample(lst, count):
            if not lst: return []
            import random
            return [random.choice(lst).name for _ in range(count)]

        plan_data = {
            "breakfast": safe_sample(safe_list, 2),
            "lunch": safe_sample(safe_list, 3),
            "dinner": safe_sample(safe_list, 3),
            "snacks": safe_sample(safe_list, 2)
        }

        advisory_note = "Advisory only: This is a basic demo plan generated purely from safe database items. It is not medical advice."

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
