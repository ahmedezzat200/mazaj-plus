import os
import django
import sys
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mazaj_backend.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ['*']

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.chat.services import process_chat_message
from apps.chat.models import ChatSession, ChatMessage, ChatRecommendation
from apps.subscriptions.models import Subscription
from apps.common.enums import Tier

User = get_user_model()
user = User.objects.filter(email='user@example.com').first()
if not user:
    print("ERROR: Test user user@example.com not found")
    sys.exit(1)

# Ensure profile height, weight, and onboarding are complete
if hasattr(user, 'profile'):
    user.profile.height_cm = 180
    user.profile.weight_kg = 75
    user.profile.nutrition_goal = 'WEIGHT_LOSS'
    user.profile.onboarding_complete = True
    user.profile.save()

# Force subscription to ULTRA
sub, created = Subscription.objects.get_or_create(user=user)
sub.tier = Tier.ULTRA
sub.save()

print("Test user profile and subscription updated.")
client = APIClient()
client.force_authenticate(user=user)

print("\n" + "="*80)
print("VERIFICATION: CHAT-FIRST ACTIONS & UPLOADS")
print("="*80)

# -------------------------------------------------------------
# Test 1: Nutrition Plan inside chat
# -------------------------------------------------------------
print("\n--- Test 1: Generate Nutrition Plan via Chat ---")
res1 = process_chat_message(user, "generate nutrition plan")
session1_id = res1['session_id']
print(f"Session Created. ID: {session1_id}")
print(f"Mode returned: {res1['mode']}")
print(f"Reply text: {res1['reply_text']}")

plan_data = res1.get('nutrition_plan')
assert plan_data is not None, "ERROR: Nutrition plan payload not returned!"
print(f"SUCCESS: Nutrition plan generated in chat!")
print(f"Plan Title: '{plan_data['title']}'")
print(f"Daily Calories: {plan_data['estimated_daily_calories']} kcal")
print(f"Plan Meals: {list(plan_data['plan_data'].keys())}")

# Verify ChatRecommendation is linked
asst_msg = ChatMessage.objects.filter(session_id=session1_id, sender='ASSISTANT').first()
assert asst_msg is not None
assert hasattr(asst_msg, 'recommendation') and asst_msg.recommendation is not None
assert asst_msg.recommendation.nutrition_plan is not None
print("SUCCESS: Nutrition plan card linked to ChatMessage via OneToOneField!")


# -------------------------------------------------------------
# Test 2: Food Image Upload inside chat
# -------------------------------------------------------------
print("\n--- Test 2: Upload Food Image inside Chat ---")
# Create a dummy image file (1x1 transparent pixel png or similar)
dummy_png = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
image_file = SimpleUploadedFile("chicken.png", dummy_png, content_type="image/png")

# Perform the API request to our new endpoint mocking the gemini food label recognition
with patch('apps.chat.views._recognize_food_label', return_value='chicken breast'):
    response = client.post(
        '/api/v1/chat/upload-food-image/',
        {'image': image_file, 'session_id': session1_id},
        format='multipart'
    )

print(f"API Response Status: {response.status_code}")
if response.status_code != 200:
    print(f"ERROR: Food image upload failed: {response.json() if response.headers.get('Content-Type') == 'application/json' else response.content}")
    sys.exit(1)

res_data = response.json()['data']
print(f"Recognized Food: {res_data.get('assistant_message', {}).get('foods', [])[0]['name']}")
print(f"Nutrition basis per 100g:")
food_item = res_data['assistant_message']['foods'][0]
print(f"  - Calories: {food_item['calories']} kcal")
print(f"  - Protein: {food_item['protein_g']}g")
print(f"  - Carbs: {food_item['carbs_g']}g")
print(f"  - Fat: {food_item['fat_g']}g")

# Verify session context was updated
session = ChatSession.objects.get(id=session1_id)
assert session.pending_food_name == food_item['name'], f"Expected {food_item['name']}, got {session.pending_food_name}"
assert session.conversation_state == 'HEALTHY_ALTERNATIVE'
print("SUCCESS: Session context updated with recognized food name!")


# -------------------------------------------------------------
# Test 3: InBody Report Upload inside chat
# -------------------------------------------------------------
print("\n--- Test 3: Upload InBody Report inside Chat ---")
pdf_file = SimpleUploadedFile("inbody.pdf", b"%PDF-1.4 mock pdf data", content_type="application/pdf")

response2 = client.post(
    '/api/v1/chat/upload-inbody/',
    {'file': pdf_file, 'session_id': session1_id},
    format='multipart'
)

print(f"API Response Status: {response2.status_code}")
if response2.status_code != 200:
    print(f"ERROR: InBody upload failed: {response2.json() if response2.headers.get('Content-Type') == 'application/json' else response2.content}")
    sys.exit(1)

res_data2 = response2.json()['data']
print(f"Assistant Message: '{res_data2['assistant_message']['message']}'")
assert "InBody report" in res_data2['assistant_message']['message']
print("SUCCESS: InBody report logged inside chat as advisory message!")

print("\nALL CHAT-FIRST ACTION TESTS COMPLETED AND PASSED!")
