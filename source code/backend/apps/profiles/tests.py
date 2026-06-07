import json
import uuid
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from apps.users.services import register_user
from apps.profiles.models import UserProfile

User = get_user_model()

ONBOARD_PAYLOAD = {
    'age': 25, 'gender': 'MALE', 'height_cm': '175.00', 'weight_kg': '70.00',
    'nutrition_goal': 'WEIGHT_LOSS', 'advisory_terms_accepted': True,
    'health_conditions': [], 'allergies': [],
}


def make_user(email='profile@example.com'):
    return register_user({
        'email': email, 'password': 'StrongPass123!',
        'full_name': 'Profile User', 'advisory_terms_accepted': True,
    })


class TestOnboarding(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = make_user()

    def _post_onboard(self, data=None, key=None):
        return self.client.post(
            '/api/v1/onboarding/',
            data=json.dumps(data or ONBOARD_PAYLOAD),
            content_type='application/json',
            HTTP_IDEMPOTENCY_KEY=key or str(uuid.uuid4()),
        )

    def test_onboarding_saves_profile(self):
        self.client.force_login(self.user)
        res = self._post_onboard()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])
        self.user.profile.refresh_from_db()
        self.assertTrue(self.user.profile.onboarding_complete)

    def test_onboarding_requires_idempotency_key(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/onboarding/',
            data=json.dumps(ONBOARD_PAYLOAD),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 400)

    def test_onboarding_is_idempotent(self):
        self.client.force_login(self.user)
        key = str(uuid.uuid4())
        res1 = self._post_onboard(key=key)
        res2 = self._post_onboard(key=key)
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(UserProfile.objects.filter(user=self.user).count(), 1)

    def test_onboarding_requires_auth(self):
        res = self._post_onboard()
        self.assertEqual(res.status_code, 403)


class TestProfileView(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = make_user('profileview@example.com')
        profile = self.user.profile
        profile.onboarding_complete = True
        profile.save()

    def test_get_profile_authenticated(self):
        self.client.force_login(self.user)
        res = self.client.get('/api/v1/profile/me/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])

    def test_get_profile_anonymous_returns_403(self):
        res = self.client.get('/api/v1/profile/me/')
        self.assertEqual(res.status_code, 403)
