from django.contrib.auth.models import User
from django.db import transaction
from apps.profiles.models import UserProfile
from apps.subscriptions.models import Subscription
from apps.common.enums import UserRole, SubscriptionStatus, Tier
from apps.common.models import AuditLog

def log_audit(actor, action, resource_type, resource_id=None, safe_metadata=None):
    AuditLog.objects.create(
        actor=actor if actor and actor.is_authenticated else None,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        safe_metadata=safe_metadata or {}
    )

def register_user(validated_data):
    email = validated_data['email']
    password = validated_data['password']
    full_name = validated_data['full_name']
    advisory_terms_accepted = validated_data['advisory_terms_accepted']

    parts = full_name.split(' ', 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ''

    with transaction.atomic():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        UserProfile.objects.create(
            user=user,
            role=UserRole.USER,
            onboarding_complete=False,
            advisory_terms_accepted=advisory_terms_accepted
        )

        Subscription.objects.create(
            user=user,
            tier=Tier.FREE,
            status=SubscriptionStatus.ACTIVE
        )

        log_audit(
            actor=user,
            action="registration_completed",
            resource_type="User",
            resource_id=str(user.id),
            safe_metadata={"email": email}
        )

    return user
