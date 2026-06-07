from rest_framework import serializers
from .models import ChatSession, ChatMessage, ChatRecommendation

class ChatMessageRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    session_id = serializers.IntegerField(required=False, allow_null=True)

class ChatMessageSerializer(serializers.ModelSerializer):
    foods = serializers.SerializerMethodField()
    warnings = serializers.SerializerMethodField()
    nutrition_plan = serializers.SerializerMethodField()
    mood_name = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'created_at', 'foods', 'warnings', 'nutrition_plan', 'mood_name']

    def get_foods(self, obj):
        if hasattr(obj, 'recommendation') and obj.recommendation:
            return obj.recommendation.recommended_foods
        return []

    def get_warnings(self, obj):
        if hasattr(obj, 'recommendation') and obj.recommendation:
            return obj.recommendation.warnings
        return []

    def get_nutrition_plan(self, obj):
        if hasattr(obj, 'recommendation') and obj.recommendation:
            return obj.recommendation.nutrition_plan
        return None

    def get_mood_name(self, obj):
        if hasattr(obj, 'recommendation') and obj.recommendation:
            return obj.recommendation.mood_name
        return ""

class ChatRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRecommendation
        # Only safe fields — no health condition names, no allergy names, no profile data.
        # recommended_foods and warnings are pre-sanitised JSONFields written by services.py.
        fields = ['id', 'mood_name', 'recommended_foods', 'blocked_foods', 'warnings', 'created_at']

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    recommendations = ChatRecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'mode', 'created_at', 'updated_at', 'messages', 'recommendations']

