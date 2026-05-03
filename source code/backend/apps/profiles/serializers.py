from rest_framework import serializers
from .models import UserProfile
from apps.nutrition.models import HealthCondition, Allergy

class OnboardingSerializer(serializers.Serializer):
    age = serializers.IntegerField(min_value=1, max_value=120)
    gender = serializers.CharField(max_length=50)
    height_cm = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=30.0, max_value=300.0)
    weight_kg = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=10.0, max_value=500.0)
    nutrition_goal = serializers.CharField(max_length=50)
    health_conditions = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    allergies = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)

    def validate_health_conditions(self, value):
        if value:
            existing_ids = set(HealthCondition.objects.filter(id__in=value, is_active=True).values_list('id', flat=True))
            missing = set(value) - existing_ids
            if missing:
                raise serializers.ValidationError(f"Invalid or inactive health condition IDs: {missing}")
        return value

    def validate_allergies(self, value):
        if value:
            existing_ids = set(Allergy.objects.filter(id__in=value, is_active=True).values_list('id', flat=True))
            missing = set(value) - existing_ids
            if missing:
                raise serializers.ValidationError(f"Invalid or inactive allergy IDs: {missing}")
        return value

class ProfileSerializer(serializers.ModelSerializer):
    health_conditions = serializers.SerializerMethodField()
    allergies = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['age', 'gender', 'height_cm', 'weight_kg', 'nutrition_goal', 'onboarding_complete', 'health_conditions', 'allergies']

    def get_health_conditions(self, obj):
        return list(obj.user.health_conditions.values('health_condition_id', 'health_condition__name'))

    def get_allergies(self, obj):
        return list(obj.user.allergies.values('allergy_id', 'allergy__name'))

class ProfileUpdateSerializer(OnboardingSerializer):
    age = serializers.IntegerField(min_value=1, max_value=120, required=False)
    gender = serializers.CharField(max_length=50, required=False)
    height_cm = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=30.0, max_value=300.0, required=False)
    weight_kg = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=10.0, max_value=500.0, required=False)
    nutrition_goal = serializers.CharField(max_length=50, required=False)
    # health_conditions and allergies inherit required=False from OnboardingSerializer
