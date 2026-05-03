from django.contrib import admin
from .models import (
    HealthCondition, Allergy, UserHealthCondition, UserAllergy,
    FoodItem, MoodTag, FoodMoodMapping, FoodAllergenTag,
    FoodHealthConditionRule, HealthyAlternative, DailyTip
)

@admin.register(HealthCondition)
class HealthConditionAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')

@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'calories', 'is_active')
    search_fields = ('name', 'category')

@admin.register(MoodTag)
class MoodTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')

@admin.register(FoodMoodMapping)
class FoodMoodMappingAdmin(admin.ModelAdmin):
    list_display = ('food', 'mood', 'priority', 'is_active')

@admin.register(FoodAllergenTag)
class FoodAllergenTagAdmin(admin.ModelAdmin):
    list_display = ('food', 'allergy')

@admin.register(FoodHealthConditionRule)
class FoodHealthConditionRuleAdmin(admin.ModelAdmin):
    list_display = ('food', 'category', 'health_condition', 'risk_level', 'is_active')

@admin.register(HealthyAlternative)
class HealthyAlternativeAdmin(admin.ModelAdmin):
    list_display = ('original_food_name', 'alternative_food', 'is_active')

@admin.register(DailyTip)
class DailyTipAdmin(admin.ModelAdmin):
    list_display = ('title', 'display_order', 'is_active')

# User-specific health/allergy mappings are intentionally excluded from Django admin 
# for privacy and security. The admin must never access user-specific health conditions, 
# allergies, body measurements, or private health data.
