from rest_framework import serializers

class SubscriptionResponseSerializer(serializers.Serializer):
    tier = serializers.CharField()
    is_active = serializers.BooleanField()
    features = serializers.DictField()
    limits = serializers.DictField()

class SubscriptionUpgradeSerializer(serializers.Serializer):
    target_tier = serializers.CharField()
