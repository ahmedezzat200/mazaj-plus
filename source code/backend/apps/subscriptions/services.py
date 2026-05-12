from django.utils import timezone
from django.db import transaction
from .models import UsageLimitCounter, Subscription
from apps.common.enums import Tier, SubscriptionStatus, FeatureKey
from apps.users.services import log_audit

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

def get_subscription_data(user):
    if not hasattr(user, 'subscription'):
        # Auto-create FREE subscription if missing
        sub = Subscription.objects.create(user=user, tier=Tier.FREE, status=SubscriptionStatus.ACTIVE)
    else:
        sub = user.subscription

    features = {
        "core_chat": True,
        "healthy_alternatives": True,
        "hydration": True,
        "daily_tips": True,
        "food_image_upload": sub.tier in [Tier.PRO, Tier.ULTRA],
        "inbody_upload": sub.tier in [Tier.PRO, Tier.ULTRA],
        "daily_tracking": sub.tier == Tier.ULTRA,
        "weekly_reports": sub.tier == Tier.ULTRA,
        "full_history": sub.tier == Tier.ULTRA,
        "free_usage_caps_removed": sub.tier in [Tier.PRO, Tier.ULTRA]
    }

    limits = {
        "chat_guidance_daily": 3 if sub.tier == Tier.FREE else None,
        "healthy_alternatives_daily": 2 if sub.tier == Tier.FREE else None,
        "nutrition_plan_weekly": 1 if sub.tier == Tier.FREE else None
    }

    return {
        "tier": sub.tier,
        "is_active": sub.status == SubscriptionStatus.ACTIVE,
        "features": features,
        "limits": limits
    }

def upgrade_subscription(user, target_tier):
    if target_tier not in [Tier.PRO, Tier.ULTRA]:
        raise ValueError("INVALID_TIER")

    with transaction.atomic():
        sub, created = Subscription.objects.get_or_create(
            user=user,
            defaults={'tier': target_tier, 'status': SubscriptionStatus.ACTIVE, 'activation_date': timezone.now()}
        )
        if not created:
            sub.tier = target_tier
            sub.status = SubscriptionStatus.ACTIVE
            sub.activation_date = timezone.now()
            sub.save()
        
        log_audit(
            actor=user,
            action=f"subscription_upgraded_{target_tier}",
            resource_type="Subscription",
            resource_id=str(sub.id)
        )
    
    return get_subscription_data(user)
