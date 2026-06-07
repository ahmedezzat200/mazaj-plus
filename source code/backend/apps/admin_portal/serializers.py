from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.nutrition.models import FoodItem, DailyTip, HealthyAlternative
from apps.subscriptions.models import Subscription
from apps.common.models import AuditLog

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    tier = serializers.SerializerMethodField()
    account_status = serializers.SerializerMethodField()
    onboarding_status = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'date_joined',
                  'tier', 'account_status', 'onboarding_status', 'role']

    def get_tier(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.tier
        return 'FREE'

    def get_account_status(self, obj):
        return 'Active' if obj.is_active else 'Inactive'

    def get_onboarding_status(self, obj):
        if hasattr(obj, 'profile') and obj.profile.onboarding_complete:
            return 'Completed'
        return 'Pending'

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return 'USER'


class AdminFoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'category', 'calories', 'protein_g', 'carbs_g', 'fat_g',
                  'description', 'data_source', 'is_active', 'created_at']


class AdminFoodItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ['name', 'category', 'calories', 'protein_g', 'carbs_g', 'fat_g',
                  'description', 'data_source', 'is_active']


class AdminDailyTipSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTip
        fields = ['id', 'title', 'content', 'is_active', 'display_order', 'created_at']


class AdminDailyTipCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTip
        fields = ['title', 'content', 'is_active', 'display_order']


class AdminSubscriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['id', 'user_email', 'user_name', 'tier', 'status',
                  'activation_date', 'expiry_date', 'created_at']

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


class AdminAuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'actor_email', 'action', 'resource_type', 'resource_id', 'created_at']

    def get_actor_email(self, obj):
        return obj.actor.email if obj.actor else 'system'


class AdminHealthyAlternativeSerializer(serializers.ModelSerializer):
    alternative_food = serializers.SerializerMethodField()

    class Meta:
        model = HealthyAlternative
        fields = ['id', 'original_food_name', 'alternative_food', 'reason',
                  'is_active', 'created_at', 'updated_at']

    def get_alternative_food(self, obj):
        food = obj.alternative_food
        if not food:
            return None
        return {
            'id': food.id,
            'name': food.name,
            'category': food.category,
            'calories': float(food.calories),
            'protein_g': float(food.protein_g),
            'carbs_g': float(food.carbs_g),
            'fat_g': float(food.fat_g),
        }


class AdminHealthyAlternativeCreateSerializer(serializers.ModelSerializer):
    alternative_food = serializers.PrimaryKeyRelatedField(
        queryset=FoodItem.objects.filter(is_active=True)
    )

    class Meta:
        model = HealthyAlternative
        fields = ['original_food_name', 'alternative_food', 'reason', 'is_active']
