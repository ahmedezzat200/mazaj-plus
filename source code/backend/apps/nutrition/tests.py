from django.test import TestCase, Client
from apps.users.services import register_user


def make_onboarded_user(email='nutri@example.com'):
    user = register_user({
        'email': email, 'password': 'StrongPass123!',
        'full_name': 'Nutri User', 'advisory_terms_accepted': True,
    })
    profile = user.profile
    profile.onboarding_complete = True
    profile.weight_kg = 70
    profile.save()
    return user


class TestHydrationTarget(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = make_onboarded_user()

    def test_hydration_target_returns_numeric_fields(self):
        self.client.force_login(self.user)
        res = self.client.get('/api/v1/hydration/target/')
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertIsInstance(data['target_ml'], int)
        self.assertIsInstance(data['today_total_ml'], int)
        self.assertGreater(data['target_ml'], 0)

    def test_hydration_target_anonymous_returns_403(self):
        res = self.client.get('/api/v1/hydration/target/')
        self.assertEqual(res.status_code, 403)

    def test_hydration_target_not_onboarded_returns_400(self):
        user = register_user({
            'email': 'notboarded@example.com', 'password': 'StrongPass123!',
            'full_name': 'Not Boarded', 'advisory_terms_accepted': True,
        })
        self.client.force_login(user)
        res = self.client.get('/api/v1/hydration/target/')
        self.assertEqual(res.status_code, 400)
