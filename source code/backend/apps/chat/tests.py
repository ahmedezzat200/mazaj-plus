import json
import uuid
from unittest.mock import patch, MagicMock
from django.test import TestCase, Client
from apps.users.services import register_user
from apps.chat.models import ChatMessage, ChatSession
from apps.subscriptions.services import check_and_increment_usage
from apps.common.enums import FeatureKey


def make_onboarded_user(email='chat@example.com'):
    user = register_user({
        'email': email, 'password': 'StrongPass123!',
        'full_name': 'Chat User', 'advisory_terms_accepted': True,
    })
    profile = user.profile
    profile.onboarding_complete = True
    profile.save()
    return user


def mock_action(intent='greeting', mode='GENERAL_CHAT'):
    action = MagicMock()
    action.intent = intent
    action.mode = mode
    action.tool = 'none'
    action.arguments = {}
    action.direct_response = 'Hello!'
    action.clarification_question = None
    return action


class TestChatMessage(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=False)
        self.user = make_onboarded_user()

    @patch('apps.chat.gemini_formatter.generate_gemini_chat_response', return_value='Hello there!')
    @patch('apps.chat.services.get_orchestrator')
    def test_sending_message_creates_chat_records(self, mock_orch, mock_gemini):
        mock_orch.return_value.plan.return_value = mock_action()
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/chat/message/',
            data=json.dumps({'message': 'Hi!'}),
            content_type='application/json',
            HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()),
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()['success'])
        self.assertEqual(ChatSession.objects.filter(user=self.user).count(), 1)
        self.assertEqual(ChatMessage.objects.count(), 2)

    def test_message_requires_idempotency_key(self):
        self.client.force_login(self.user)
        res = self.client.post(
            '/api/v1/chat/message/',
            data=json.dumps({'message': 'Hi!'}),
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 400)

    def test_message_requires_auth(self):
        res = self.client.post(
            '/api/v1/chat/message/',
            data=json.dumps({'message': 'Hi!'}),
            content_type='application/json',
            HTTP_IDEMPOTENCY_KEY=str(uuid.uuid4()),
        )
        self.assertEqual(res.status_code, 403)


class TestChatUsageLimit(TestCase):
    def setUp(self):
        self.user = make_onboarded_user('chatlimit@example.com')

    def test_free_tier_chat_blocked_after_limit(self):
        for _ in range(3):
            check_and_increment_usage(self.user, FeatureKey.CHAT_GUIDANCE, limit=3)

        with self.assertRaises(Exception) as ctx:
            check_and_increment_usage(self.user, FeatureKey.CHAT_GUIDANCE, limit=3)
        self.assertIn('USAGE_LIMIT_EXCEEDED', str(ctx.exception))
