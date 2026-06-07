from django.db import models
from django.conf import settings

class ChatMode(models.TextChoices):
    MOOD_RECOMMENDATION = 'MOOD_RECOMMENDATION', 'Mood Recommendation'
    NUTRITION_PLAN_REQUEST = 'NUTRITION_PLAN_REQUEST', 'Nutrition Plan Request'
    CLARIFICATION = 'CLARIFICATION', 'Clarification'
    GREETING = 'GREETING', 'Greeting'
    HELP = 'HELP', 'Help'
    HEALTHY_ALTERNATIVE = 'HEALTHY_ALTERNATIVE', 'Healthy Alternative'
    HYDRATION = 'HYDRATION', 'Hydration'

class ChatSender(models.TextChoices):
    USER = 'USER', 'User'
    ASSISTANT = 'ASSISTANT', 'Assistant'

class ChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=255, blank=True)
    mode = models.CharField(max_length=50, choices=ChatMode.choices, default=ChatMode.CLARIFICATION)
    
    # New state fields for conversation understanding
    conversation_state = models.CharField(max_length=50, default='READY')
    pending_intent = models.CharField(max_length=50, blank=True, null=True)
    pending_mood = models.CharField(max_length=50, blank=True, null=True)
    pending_food_name = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'updated_at']),
        ]

class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=50, choices=ChatSender.choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['session', 'created_at']),
        ]

class ChatRecommendation(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='recommendations')
    message = models.OneToOneField('ChatMessage', on_delete=models.CASCADE, null=True, blank=True, related_name='recommendation')
    mood_name = models.CharField(max_length=100, blank=True)
    recommended_foods = models.JSONField(default=list)
    blocked_foods = models.JSONField(default=list)
    warnings = models.JSONField(default=list)
    nutrition_plan = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
