from django.db import models
from django.conf import settings
from apps.common.enums import UserRole, NutritionGoal, Gender

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=UserRole.choices, default=UserRole.USER)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=50, choices=Gender.choices, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    nutrition_goal = models.CharField(max_length=50, choices=NutritionGoal.choices, null=True, blank=True)
    onboarding_complete = models.BooleanField(default=False)
    advisory_terms_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user}"

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(age__gte=0) | models.Q(age__isnull=True), name='check_age_non_negative'),
            models.CheckConstraint(check=models.Q(height_cm__gt=0) | models.Q(height_cm__isnull=True), name='check_height_positive'),
            models.CheckConstraint(check=models.Q(weight_kg__gt=0) | models.Q(weight_kg__isnull=True), name='check_weight_positive'),
        ]
