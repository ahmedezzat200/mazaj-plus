from rest_framework import serializers
from .models import ChatSession, ChatMessage, ChatRecommendation

class ChatMessageRequestSerializer(serializers.Serializer):
    message = serializers.CharField()
    session_id = serializers.IntegerField(required=False, allow_null=True)

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'created_at']

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

