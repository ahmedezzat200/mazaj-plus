from django.db import models

class UserRole(models.TextChoices):
    USER = 'USER', 'User'
    ADMIN = 'ADMIN', 'Admin'

class Tier(models.TextChoices):
    FREE = 'FREE', 'Free'
    PRO = 'PRO', 'Pro'
    ULTRA = 'ULTRA', 'Ultra'

class SubscriptionStatus(models.TextChoices):
    ACTIVE = 'ACTIVE', 'Active'
    INACTIVE = 'INACTIVE', 'Inactive'
    PENDING = 'PENDING', 'Pending'
    CANCELLED = 'CANCELLED', 'Cancelled'

class FeatureKey(models.TextChoices):
    CHAT_GUIDANCE = 'CHAT_GUIDANCE', 'Chat Guidance'
    NUTRITION_PLAN = 'NUTRITION_PLAN', 'Nutrition Plan'
    HEALTHY_ALTERNATIVE = 'HEALTHY_ALTERNATIVE', 'Healthy Alternative'
    FOOD_IMAGE_UPLOAD = 'FOOD_IMAGE_UPLOAD', 'Food Image Upload'
    INBODY_UPLOAD = 'INBODY_UPLOAD', 'InBody Upload'
    DAILY_TRACKING = 'DAILY_TRACKING', 'Daily Tracking'
    WEEKLY_REPORT = 'WEEKLY_REPORT', 'Weekly Report'

class IdempotencyStatus(models.TextChoices):
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'

class NutritionGoal(models.TextChoices):
    WEIGHT_LOSS = 'WEIGHT_LOSS', 'Weight Loss'
    MAINTENANCE = 'MAINTENANCE', 'Maintenance'
    WEIGHT_GAIN = 'WEIGHT_GAIN', 'Weight Gain'

class Gender(models.TextChoices):
    MALE = 'MALE', 'Male'
    FEMALE = 'FEMALE', 'Female'
    OTHER = 'OTHER', 'Other'
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY', 'Prefer Not To Say'

class SafetyRiskLevel(models.TextChoices):
    SAFE = 'SAFE', 'Safe'
    WARNING = 'WARNING', 'Warning'
    BLOCKED = 'BLOCKED', 'Blocked'
