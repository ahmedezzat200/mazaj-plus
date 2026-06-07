import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model

User = get_user_model()


class TestRegister(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)

    def test_register_success_returns_200(self):
        res = self.client.post(
            '/api/v1/auth/register/',
            data=json.dumps({'email': 'new@example.com', 'password': 'StrongPass123!', 'full_name': 'Test User', 'advisory_terms_accepted': True}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body['success'])

    def test_duplicate_email_returns_400(self):
        User.objects.create_user(username='dup@example.com', email='dup@example.com', password='pass')
        res = self.client.post(
            '/api/v1/auth/register/',
            data=json.dumps({'email': 'dup@example.com', 'password': 'AnotherPass1!', 'full_name': 'Dup User'}),
            content_type='application/json',
        )
        self.assertIn(res.status_code, [400, 409])
        self.assertFalse(res.json()['success'])

    def test_missing_email_returns_400(self):
        res = self.client.post(
            '/api/v1/auth/register/',
            data=json.dumps({'password': 'pass'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 400)


class TestLogin(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username='login@example.com', email='login@example.com', password='Correct123!'
        )

    def test_valid_credentials_returns_200(self):
        res = self.client.post(
            '/api/v1/auth/login/',
            data=json.dumps({'email': 'login@example.com', 'password': 'Correct123!'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])

    def test_wrong_password_returns_400(self):
        res = self.client.post(
            '/api/v1/auth/login/',
            data=json.dumps({'email': 'login@example.com', 'password': 'WrongPass!'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 400)
        self.assertFalse(res.json()['success'])

    def test_unknown_email_returns_400(self):
        res = self.client.post(
            '/api/v1/auth/login/',
            data=json.dumps({'email': 'nobody@example.com', 'password': 'Whatever1!'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 400)


class TestLogout(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username='logout@example.com', email='logout@example.com', password='Pass123!'
        )

    def test_logout_authenticated_returns_200(self):
        self.client.force_login(self.user)
        res = self.client.post('/api/v1/auth/logout/', content_type='application/json')
        self.assertEqual(res.status_code, 200)

    def test_logout_unauthenticated_returns_403(self):
        res = self.client.post('/api/v1/auth/logout/', content_type='application/json')
        self.assertEqual(res.status_code, 403)
