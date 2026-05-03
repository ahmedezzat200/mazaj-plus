from django.db import models
from django.conf import settings
from apps.common.enums import Tier, SubscriptionStatus, FeatureKey

class Subscription(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(max_length=50, choices=Tier.choices, default=Tier.FREE)
    status = models.CharField(max_length=50, choices=SubscriptionStatus.choices, default=SubscriptionStatus.ACTIVE)
    activation_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Subscription for {self.user} - {self.tier}"

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['tier']),
            models.Index(fields=['status']),
        ]

class UsageLimitCounter(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='usage_limits')
    feature_key = models.CharField(max_length=50, choices=FeatureKey.choices)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Usage for {self.user} ({self.feature_key}): {self.count}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'feature_key', 'period_start', 'period_end'], name='unique_usage_limit_period'),
            models.CheckConstraint(check=models.Q(count__gte=0), name='check_count_non_negative')
        ]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['feature_key']),
            models.Index(fields=['period_start']),
            models.Index(fields=['period_end']),
        ]
