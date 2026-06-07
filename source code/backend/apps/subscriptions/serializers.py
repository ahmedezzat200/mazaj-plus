from rest_framework import serializers
from apps.common.enums import Tier

class SubscriptionResponseSerializer(serializers.Serializer):
    tier = serializers.CharField()
    is_active = serializers.BooleanField()
    features = serializers.DictField()
    limits = serializers.DictField()
    expiry_date = serializers.DateTimeField(allow_null=True)

class SubscriptionUpgradeSerializer(serializers.Serializer):
    target_tier = serializers.CharField()
    payment_confirmed = serializers.BooleanField(default=False)

class CheckoutRequestSerializer(serializers.Serializer):
    target_tier = serializers.CharField()

    def validate_target_tier(self, value):
        if value not in [Tier.PRO, Tier.ULTRA]:
            raise serializers.ValidationError("Invalid subscription tier selected.")
        return value

class CheckoutResponseSerializer(serializers.Serializer):
    checkout_id = serializers.UUIDField()
    target_tier = serializers.CharField()
    status = serializers.CharField()

class MockPaymentRequestSerializer(serializers.Serializer):
    checkout_id = serializers.UUIDField()
