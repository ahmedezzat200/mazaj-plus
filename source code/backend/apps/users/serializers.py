from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    advisory_terms_accepted = serializers.BooleanField()

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_advisory_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the advisory terms to register.")
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class CurrentUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    tier = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    onboarding_complete = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role', 'tier', 'subscription_status', 'onboarding_complete']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_email(self, obj):
        return obj.email

    def get_role(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.role
        return None

    def get_tier(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.tier
        return None

    def get_subscription_status(self, obj):
        if hasattr(obj, 'subscription'):
            return obj.subscription.status
        return None

    def get_onboarding_complete(self, obj):
        if hasattr(obj, 'profile'):
            return obj.profile.onboarding_complete
        return False
