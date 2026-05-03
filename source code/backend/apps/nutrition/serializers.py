from rest_framework import serializers
from .models import NutritionPlan

class NutritionPlanGenerateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)

class NutritionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionPlan
        fields = ['id', 'title', 'goal', 'bmi', 'estimated_daily_calories', 'plan_data', 'advisory_note', 'created_at']

class AlternativeSearchSerializer(serializers.Serializer):
    food_name = serializers.CharField(max_length=255)

class WaterIntakeLogSerializer(serializers.Serializer):
    amount_ml = serializers.IntegerField(min_value=1)

from .models import DailyTip
class DailyTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTip
        fields = ['title', 'content', 'created_at']
