from django.db import transaction
from apps.nutrition.models import UserHealthCondition, UserAllergy
from apps.users.services import log_audit

def update_user_mappings(user, conditions_list, allergies_list):
    if conditions_list is not None:
        UserHealthCondition.objects.filter(user=user).delete()
        new_conditions = [UserHealthCondition(user=user, health_condition_id=cid) for cid in conditions_list]
        UserHealthCondition.objects.bulk_create(new_conditions)

    if allergies_list is not None:
        UserAllergy.objects.filter(user=user).delete()
        new_allergies = [UserAllergy(user=user, allergy_id=aid) for aid in allergies_list]
        UserAllergy.objects.bulk_create(new_allergies)

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
