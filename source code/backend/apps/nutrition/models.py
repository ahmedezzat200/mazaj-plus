from django.db import models
from django.conf import settings

class HealthCondition(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Allergy(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UserHealthCondition(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='health_conditions')
    health_condition = models.ForeignKey(HealthCondition, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"UserHealthCondition ID: {self.id}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'health_condition'], name='unique_user_health_condition')
        ]

class UserAllergy(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='allergies')
    allergy = models.ForeignKey(Allergy, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"UserAllergy ID: {self.id}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'allergy'], name='unique_user_allergy')
        ]

from apps.common.enums import SafetyRiskLevel

class FoodItem(models.Model):
    name = models.CharField(max_length=255, unique=True)
    category = models.CharField(max_length=100, blank=True)
    calories = models.DecimalField(max_digits=8, decimal_places=2)
    protein_g = models.DecimalField(max_digits=8, decimal_places=2)
    carbs_g = models.DecimalField(max_digits=8, decimal_places=2)
    fat_g = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)
    data_source = models.CharField(max_length=255, default="Manual Demo Data — placeholder")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(calories__gte=0), name='check_calories_non_negative'),
            models.CheckConstraint(check=models.Q(protein_g__gte=0), name='check_protein_non_negative'),
            models.CheckConstraint(check=models.Q(carbs_g__gte=0), name='check_carbs_non_negative'),
            models.CheckConstraint(check=models.Q(fat_g__gte=0), name='check_fat_non_negative'),
        ]
        indexes = [
            models.Index(fields=['is_active', 'category']),
        ]

class MoodTag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class FoodMoodMapping(models.Model):
    food = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name='mood_mappings')
    mood = models.ForeignKey(MoodTag, on_delete=models.CASCADE, related_name='food_mappings')
    explanation = models.TextField()
    priority = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.food.name} -> {self.mood.name}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['food', 'mood'], name='unique_food_mood'),
            models.CheckConstraint(check=models.Q(priority__gte=0), name='check_priority_non_negative')
        ]
        indexes = [
            models.Index(fields=['mood', 'priority']),
        ]

class FoodAllergenTag(models.Model):
    food = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name='allergens')
    allergy = models.ForeignKey(Allergy, on_delete=models.CASCADE, related_name='foods')
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.food.name} contains {self.allergy.name}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['food', 'allergy'], name='unique_food_allergen')
        ]
        indexes = [
            models.Index(fields=['allergy', 'food']),
        ]

class FoodHealthConditionRule(models.Model):
    food = models.ForeignKey(FoodItem, on_delete=models.CASCADE, null=True, blank=True, related_name='health_rules')
    category = models.CharField(max_length=100, blank=True)
    health_condition = models.ForeignKey(HealthCondition, on_delete=models.CASCADE, related_name='food_rules')
    risk_level = models.CharField(max_length=50, choices=SafetyRiskLevel.choices)
    reason = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        target = self.food.name if self.food else f"Category: {self.category}"
        return f"{target} + {self.health_condition.name} = {self.risk_level}"

    class Meta:
        indexes = [
            models.Index(fields=['health_condition', 'risk_level']),
        ]

class HealthyAlternative(models.Model):
    original_food_name = models.CharField(max_length=255)
    alternative_food = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    reason = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.original_food_name} -> {self.alternative_food.name}"

    class Meta:
        indexes = [
            models.Index(fields=['original_food_name']),
        ]

class DailyTip(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['display_order', '-created_at']

class NutritionPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nutrition_plans')
    title = models.CharField(max_length=255)
    goal = models.CharField(max_length=50)
    bmi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    estimated_daily_calories = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    plan_data = models.JSONField(default=dict)
    advisory_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} for {self.user.username}"

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]

class WaterIntakeLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    amount_ml = models.PositiveIntegerField()
    logged_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} logged {self.amount_ml}ml at {self.logged_at}"

    class Meta:
        indexes = [
            models.Index(fields=['user', 'logged_at']),
        ]
