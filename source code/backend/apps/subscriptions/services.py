from django.utils import timezone
from django.db import transaction
from .models import UsageLimitCounter
from apps.common.enums import Tier, SubscriptionStatus

def check_and_increment_usage(user, feature_key, limit=3):
    """
    Checks if the user has reached their limit for the given feature.
    If not, increments the counter.
    Bypasses limits for PRO/ULTRA users with ACTIVE subscriptions.
    Raises Exception if limit exceeded.
    """
    if not hasattr(user, 'subscription'):
        raise Exception("User has no subscription.")

    sub = user.subscription
    if sub.tier in [Tier.PRO, Tier.ULTRA] and sub.status == SubscriptionStatus.ACTIVE:
        return True # Unlimited

    now = timezone.now()
    if feature_key == FeatureKey.NUTRITION_PLAN:
        period_start = now - timezone.timedelta(days=now.weekday())
        period_start = period_start.replace(hour=0, minute=0, second=0, microsecond=0)
        period_end = period_start + timezone.timedelta(days=7)
    else:
        period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        period_end = period_start + timezone.timedelta(days=1)

    with transaction.atomic():
        counter, created = UsageLimitCounter.objects.select_for_update().get_or_create(
            user=user,
            feature_key=feature_key,
            period_start=period_start,
            period_end=period_end,
            defaults={'count': 0}
        )

        if counter.count >= limit:
            raise Exception("USAGE_LIMIT_EXCEEDED")

        counter.count += 1
        counter.save()
    
    return True
