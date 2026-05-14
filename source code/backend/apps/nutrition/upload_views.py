import os
import re
import warnings

from rest_framework import permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.enums import UserRole
from apps.common.policies import require_authenticated
from apps.subscriptions.services import get_subscription_data
from .models import FoodItem


IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
INBODY_TYPES = {"application/pdf", "image/jpeg", "image/jpg", "image/png"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_INBODY_SIZE = 20 * 1024 * 1024


def upload_error(code, message, stat=status.HTTP_400_BAD_REQUEST, **extra):
    payload = {"success": False, "code": code, "message": message}
    payload.update(extra)
    return Response(payload, status=stat)


def _block_admin_or_incomplete_profile(user):
    if hasattr(user, "profile"):
        if user.profile.role == UserRole.ADMIN:
            return upload_error(
                "AUTHORIZATION_ERROR",
                "Admins cannot use user-facing upload endpoints.",
                status.HTTP_403_FORBIDDEN,
            )
        if not user.profile.onboarding_complete:
            return upload_error(
                "PROFILE_INCOMPLETE",
                "Please complete your profile first.",
                status.HTTP_403_FORBIDDEN,
            )
    return None


def _require_feature(user, feature_key):
    sub_data = get_subscription_data(user)
    if not sub_data["features"].get(feature_key, False):
        return upload_error(
            "SUBSCRIPTION_REQUIRED",
            "This feature requires Pro or Ultra.",
            status.HTTP_403_FORBIDDEN,
        )
    return None


def _clean_food_label(label):
    cleaned = re.sub(r"[^A-Za-z0-9 \-]", "", label or "").strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    if cleaned.upper() == "NO_FOOD" or len(cleaned) < 2:
        return None
    return cleaned[:80]


def _recognize_food_label(uploaded_file):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("FOOD_RECOGNITION_UNAVAILABLE")

    uploaded_file.seek(0)
    image_bytes = uploaded_file.read()
    uploaded_file.seek(0)

    try:
        warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            [
                (
                    "Identify the main food item in this image. Return only a short food label "
                    "such as 'banana' or 'grilled chicken'. Do not return calories, macros, "
                    "nutrition advice, safety decisions, explanations, or JSON. If no clear food "
                    "is visible, return exactly NO_FOOD."
                ),
                {"mime_type": uploaded_file.content_type, "data": image_bytes},
            ],
            generation_config={"temperature": 0, "max_output_tokens": 20},
        )
    except Exception as exc:
        raise RuntimeError("FOOD_RECOGNITION_UNAVAILABLE") from exc

    text = getattr(response, "text", "") or ""
    first_line = text.splitlines()[0] if text.splitlines() else text
    return _clean_food_label(first_line)


def _match_food_item(label):
    foods = FoodItem.objects.filter(is_active=True)
    exact = foods.filter(name__iexact=label).first()
    if exact:
        return exact

    contains = foods.filter(name__icontains=label).first()
    if contains:
        return contains

    label_tokens = [token for token in re.split(r"\s+", label.lower()) if len(token) >= 3]
    for token in label_tokens:
        token_match = foods.filter(name__icontains=token).first()
        if token_match:
            return token_match

    return None


def _food_payload(food):
    return {
        "id": food.id,
        "name": food.name,
        "calories": float(food.calories),
        "protein": float(food.protein_g),
        "fat": float(food.fat_g),
        "carbs": float(food.carbs_g),
    }


class FoodImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        require_authenticated(request.user)

        blocked = _block_admin_or_incomplete_profile(request.user)
        if blocked:
            return blocked

        blocked = _require_feature(request.user, "food_image_upload")
        if blocked:
            return blocked

        image = request.FILES.get("image")
        if not image:
            return upload_error("VALIDATION_ERROR", "Image is required.")
        if image.content_type not in IMAGE_TYPES:
            return upload_error("VALIDATION_ERROR", "Unsupported format. Please upload a JPG, PNG, or WebP image.")
        if image.size > MAX_IMAGE_SIZE:
            return upload_error("VALIDATION_ERROR", "File too large. Maximum size is 10MB.")

        try:
            recognized_food = _recognize_food_label(image)
        except RuntimeError:
            return upload_error(
                "FOOD_RECOGNITION_UNAVAILABLE",
                "Food recognition is currently unavailable. Please try again later.",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not recognized_food:
            return upload_error(
                "NO_FOOD_DETECTED",
                "We could not identify a food item in this image. Please upload a clear food image.",
            )

        matched_food = _match_food_item(recognized_food)
        if not matched_food:
            return upload_error(
                "NO_DATABASE_MATCH",
                "Nutritional data is not currently available for this food in the Mazaj+ database.",
                recognized_food=recognized_food,
            )

        return Response(
            {
                "success": True,
                "recognized_food": recognized_food,
                "matched_food": _food_payload(matched_food),
                "source": "Mazaj+ database",
                "message": "Nutrition values are retrieved from the Mazaj+ database and are advisory only.",
            }
        )


class InBodyUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        require_authenticated(request.user)

        blocked = _block_admin_or_incomplete_profile(request.user)
        if blocked:
            return blocked

        blocked = _require_feature(request.user, "inbody_upload")
        if blocked:
            return blocked

        report = request.FILES.get("file")
        if not report:
            return upload_error("VALIDATION_ERROR", "File is required.")
        if report.content_type not in INBODY_TYPES:
            return upload_error("VALIDATION_ERROR", "Unsupported format. Please upload a PDF, JPG, or PNG file.")
        if report.size > MAX_INBODY_SIZE:
            return upload_error("VALIDATION_ERROR", "File too large. Maximum size is 20MB.")

        return Response(
            {
                "success": True,
                "message": (
                    "InBody upload is available for your tier, but automated parsing is still under development. "
                    "No body composition analysis is generated yet."
                ),
                "status": "under_development",
            }
        )
