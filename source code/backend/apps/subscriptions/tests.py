import json
from django.test import TestCase, Client
from apps.users.services import register_user
from apps.subscriptions.models import Subscription, SubscriptionCheckout
from apps.subscriptions.services import check_and_increment_usage, upgrade_subscription
from apps.common.enums import Tier, FeatureKey, SubscriptionStatus


def make_user(email='sub@example.com'):
    return register_user({
        'email': email, 'password': 'StrongPass123!',
        'full_name': 'Sub User', 'advisory_terms_accepted': True,
    })


class TestSubscriptionUpgrade(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = make_user()

    def test_upgrade_to_pro(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/subscription/upgrade/',
            data=json.dumps({'target_tier': 'PRO', 'payment_confirmed': True}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        self.user.subscription.refresh_from_db()
        self.assertEqual(self.user.subscription.tier, Tier.PRO)

    def test_upgrade_without_payment_confirmation_returns_402(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/subscription/upgrade/',
            data=json.dumps({'target_tier': 'PRO', 'payment_confirmed': False}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 402)

    def test_invalid_tier_returns_400(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/subscription/upgrade/',
            data=json.dumps({'target_tier': 'DIAMOND', 'payment_confirmed': True}),
            content_type='application/json',
        )
        self.assertIn(res.status_code, [400, 422])


class TestUsageCap(TestCase):
    def setUp(self):
        self.user = make_user('cap@example.com')

    def test_free_tier_blocked_after_limit(self):
        for _ in range(3):
            check_and_increment_usage(self.user, FeatureKey.CHAT_GUIDANCE, limit=3)

        with self.assertRaises(Exception) as ctx:
            check_and_increment_usage(self.user, FeatureKey.CHAT_GUIDANCE, limit=3)
        self.assertIn('USAGE_LIMIT_EXCEEDED', str(ctx.exception))

    def test_pro_tier_bypasses_limit(self):
        upgrade_subscription(self.user, Tier.PRO)
        from django.contrib.auth import get_user_model
        user = get_user_model().objects.get(pk=self.user.pk)
        for _ in range(10):
            result = check_and_increment_usage(user, FeatureKey.CHAT_GUIDANCE, limit=3)
            self.assertTrue(result)

class TestSubscriptionCheckoutFlow(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = make_user('checkout@example.com')

    def test_checkout_and_simulate_payment(self):
        self.client.force_login(self.user)
        
        # 1. Create pending checkout
        res = self.client.post(
            '/api/v1/subscription/checkout/',
            data=json.dumps({'target_tier': 'PRO'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data['success'])
        checkout_id = data['data']['checkout_id']
        self.assertEqual(data['data']['target_tier'], 'PRO')
        self.assertEqual(data['data']['status'], 'PENDING')
        
        # Verify user is still Free
        self.user.subscription.refresh_from_db()
        self.assertEqual(self.user.subscription.tier, Tier.FREE)
        self.assertEqual(self.user.subscription.status, SubscriptionStatus.ACTIVE)

        # 2. Simulate payment success
        res = self.client.post(
            '/api/v1/subscription/mock-payment-success/',
            data=json.dumps({'checkout_id': checkout_id}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['tier'], 'PRO')
        self.assertTrue(data['data']['is_active'])

        # Verify database updates
        self.user.subscription.refresh_from_db()
        self.assertEqual(self.user.subscription.tier, Tier.PRO)
        self.assertEqual(self.user.subscription.status, SubscriptionStatus.ACTIVE)
        
        checkout = SubscriptionCheckout.objects.get(checkout_id=checkout_id)
        self.assertEqual(checkout.status, 'COMPLETED')
        self.assertIsNotNone(checkout.completed_at)

    def test_checkout_invalid_tier(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/subscription/checkout/',
            data=json.dumps({'target_tier': 'DIAMOND'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 400)

    def test_payment_simulation_invalid_checkout(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/subscription/mock-payment-success/',
            data=json.dumps({'checkout_id': '00000000-0000-0000-0000-000000000000'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 404)
