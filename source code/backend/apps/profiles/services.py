from django.db import transaction
from apps.nutrition.models import UserHealthCondition, UserAllergy
from apps.users.services import log_audit

def update_user_mappings(user, conditions_list, allergies_list):
    """
    Atomically replaces the user's health condition and allergy mappings.

    Both lists are replaced in full (delete-then-insert pattern) to keep the
    stored data consistent with what the client submitted.  The caller is
    responsible for ensuring IDs are valid before this function is called.

    Args:
        conditions_list: list of HealthCondition PKs, or None to skip update.
        allergies_list:  list of Allergy PKs, or None to skip update.
    """
    if conditions_list is not None:
        UserHealthCondition.objects.filter(user=user).delete()
        new_conditions = [
            UserHealthCondition(user=user, health_condition_id=cid)
            for cid in conditions_list
        ]
        if new_conditions:
            UserHealthCondition.objects.bulk_create(
                new_conditions, ignore_conflicts=True
            )

    if allergies_list is not None:
        UserAllergy.objects.filter(user=user).delete()
        new_allergies = [
            UserAllergy(user=user, allergy_id=aid)
            for aid in allergies_list
        ]
        if new_allergies:
            UserAllergy.objects.bulk_create(
                new_allergies, ignore_conflicts=True
            )

def submit_onboarding(user, validated_data):
    conditions = validated_data.pop('health_conditions', [])
    allergies = validated_data.pop('allergies', [])
    
    with transaction.atomic():
        profile = user.profile
        for key, value in validated_data.items():
            setattr(profile, key, value)
        profile.onboarding_complete = True
        profile.save()

        update_user_mappings(user, conditions, allergies)

        log_audit(
            actor=user,
            action="onboarding_completed",
            resource_type="Profile",
            resource_id=str(profile.id)
        )
    return profile

def update_profile(user, validated_data):
    conditions = validated_data.pop('health_conditions', None)
    allergies = validated_data.pop('allergies', None)
    
    with transaction.atomic():
        profile = user.profile
        for key, value in validated_data.items():
            setattr(profile, key, value)
        profile.save()

        update_user_mappings(user, conditions, allergies)

        log_audit(
            actor=user,
            action="profile_updated",
            resource_type="Profile",
            resource_id=str(profile.id)
        )
    return profile
