from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.profiles.models import UserProfile
from apps.subscriptions.models import Subscription
from apps.nutrition.models import HealthCondition, Allergy
from apps.common.enums import UserRole, Tier, SubscriptionStatus, NutritionGoal, Gender
from django.utils import timezone

User = get_user_model()

USERS = [
    {
        'email': 'user@example.com',
        'password': 'password123',
        'first_name': 'Free',
        'last_name': 'User',
        'role': UserRole.USER,
        'tier': Tier.FREE,
        'onboarding_complete': True,
    },
    {
        'email': 'pro@example.com',
        'password': 'password123',
        'first_name': 'Pro',
        'last_name': 'User',
        'role': UserRole.USER,
        'tier': Tier.PRO,
        'onboarding_complete': True,
    },
    {
        'email': 'ultra@example.com',
        'password': 'password123',
        'first_name': 'Ultra',
        'last_name': 'User',
        'role': UserRole.USER,
        'tier': Tier.ULTRA,
        'onboarding_complete': True,
    },
    {
        'email': 'admin@mazaj.com',
        'password': 'admin123',
        'first_name': 'Mazaj',
        'last_name': 'Admin',
        'role': UserRole.ADMIN,
        'tier': Tier.FREE,
        'onboarding_complete': False,
    },
]


class Command(BaseCommand):
    help = 'Seed test users for development and Playwright e2e tests'

    def handle(self, *args, **options):
        for data in USERS:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    email=data['email'],
                    defaults={
                        'username': data['email'],
                        'first_name': data['first_name'],
                        'last_name': data['last_name'],
                        'is_staff': data['role'] == UserRole.ADMIN,
                    }
                )
                # Always sync password + staff flag so reruns reliably restore demo state.
                user.set_password(data['password'])
                user.is_staff = data['role'] == UserRole.ADMIN
                user.is_active = True
                user.save()

                profile, _ = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'role': data['role'],
                        'age': 28,
                        'gender': Gender.MALE,
                        'height_cm': 175,
                        'weight_kg': 70,
                        'nutrition_goal': NutritionGoal.MAINTENANCE,
                        'onboarding_complete': data['onboarding_complete'],
                        'advisory_terms_accepted': True,
                    }
                )
                if not created:
                    profile.role = data['role']
                    profile.onboarding_complete = data['onboarding_complete']
                    profile.save()

                sub, sub_created = Subscription.objects.get_or_create(
                    user=user,
                    defaults={
                        'tier': data['tier'],
                        'status': SubscriptionStatus.ACTIVE,
                        'activation_date': timezone.now(),
                    }
                )
                if not sub_created:
                    sub.tier = data['tier']
                    sub.status = SubscriptionStatus.ACTIVE
                    sub.save()

                status_str = 'created' if created else 'reset'
                self.stdout.write(self.style.SUCCESS(f"  {data['email']} — {status_str}"))

        self.stdout.write(self.style.SUCCESS('Done seeding test users.'))
