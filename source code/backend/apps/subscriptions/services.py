from django.utils import timezone
from django.db import transaction
from .models import UsageLimitCounter, Subscription, SubscriptionCheckout
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

    is_active = sub.status == SubscriptionStatus.ACTIVE
    is_pro_or_ultra = is_active and sub.tier in [Tier.PRO, Tier.ULTRA]
    is_ultra = is_active and sub.tier == Tier.ULTRA

    features = {
        "core_chat": True,
        "healthy_alternatives": True,
        "hydration": True,
        "daily_tips": True,
        "food_image_upload": is_pro_or_ultra,
        "inbody_upload": is_pro_or_ultra,
        "daily_tracking": is_ultra,
        "weekly_reports": is_ultra,
        "full_history": is_ultra,
        "free_usage_caps_removed": is_pro_or_ultra
    }

    limits = {
        "chat_guidance_daily": 3 if sub.tier == Tier.FREE else None,
        "healthy_alternatives_daily": 2 if sub.tier == Tier.FREE else None,
        "nutrition_plan_weekly": 1 if sub.tier == Tier.FREE else None
    }

    return {
        "tier": sub.tier,
        "is_active": is_active,
        "features": features,
        "limits": limits,
        "expiry_date": sub.expiry_date.isoformat() if sub.expiry_date else None,
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

def create_subscription_checkout(user, target_tier):
    if target_tier not in [Tier.PRO, Tier.ULTRA]:
        raise ValueError("INVALID_TIER")
    
    checkout = SubscriptionCheckout.objects.create(
        user=user,
        target_tier=target_tier,
        status='PENDING'
    )
    return checkout

def complete_subscription_checkout(user, checkout_id):
    try:
        checkout = SubscriptionCheckout.objects.get(checkout_id=checkout_id, user=user)
    except SubscriptionCheckout.DoesNotExist:
        raise ValueError("CHECKOUT_NOT_FOUND")

    if checkout.status != 'PENDING':
        raise ValueError("CHECKOUT_NOT_PENDING")

    with transaction.atomic():
        sub, created = Subscription.objects.get_or_create(
            user=user,
            defaults={'tier': checkout.target_tier, 'status': SubscriptionStatus.ACTIVE, 'activation_date': timezone.now()}
        )
        if not created:
            sub.tier = checkout.target_tier
            sub.status = SubscriptionStatus.ACTIVE
            sub.activation_date = timezone.now()
            sub.save()

        checkout.status = 'COMPLETED'
        checkout.completed_at = timezone.now()
        checkout.save()

        log_audit(
            actor=user,
            action=f"subscription_upgraded_{checkout.target_tier}_via_checkout",
            resource_type="Subscription",
            resource_id=str(sub.id)
        )

    return get_subscription_data(user)
