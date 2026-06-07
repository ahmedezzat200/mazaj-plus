from apps.common.errors import (
    AuthenticationError, 
    AuthorizationError, 
    OnboardingRequiredError, 
    SubscriptionRequiredError
)
from apps.common.enums import UserRole, SubscriptionStatus

def require_authenticated(user):
    """Ensure user is authenticated."""
    if not user or not user.is_authenticated:
        raise AuthenticationError("User must be authenticated.")
    return True

def require_user_role(user):
    """Ensure user has USER role."""
    if not hasattr(user, 'profile') or user.profile.role != UserRole.USER:
        raise AuthorizationError("User must have the USER role.")
    return True

def require_admin_role(user):
    """Ensure user has ADMIN role."""
    is_django_admin = getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False)
    has_admin_profile = hasattr(user, 'profile') and user.profile.role == UserRole.ADMIN
    if not (is_django_admin or has_admin_profile):
        raise AuthorizationError("User must have the ADMIN role.")
    return True

def require_onboarding_complete(profile):
    """Ensure profile.onboarding_complete is True."""
    if not profile or not profile.onboarding_complete:
        raise OnboardingRequiredError("User onboarding must be complete.")
    return True

def require_tier(user, allowed_tiers):
    """Ensure user's subscription tier is in allowed_tiers."""
    if not hasattr(user, 'subscription') or user.subscription.tier not in allowed_tiers:
        raise SubscriptionRequiredError(f"User subscription tier must be one of {allowed_tiers}.")
    return True

def require_active_subscription(subscription):
    """Ensure subscription status is ACTIVE."""
    if not subscription or subscription.status != SubscriptionStatus.ACTIVE:
        raise SubscriptionRequiredError("User must have an active subscription.")
    return True
