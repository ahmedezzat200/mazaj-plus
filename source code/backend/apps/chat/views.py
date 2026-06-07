import hashlib
import json
from rest_framework.views import APIView
from rest_framework import permissions, status
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.parsers import FormParser, MultiPartParser
from apps.common.responses import success_response, error_response
from apps.common.models import IdempotencyKey
from apps.common.enums import IdempotencyStatus, UserRole
from apps.common.policies import require_authenticated
from apps.nutrition.upload_views import (
    _recognize_food_label, _match_food_item, _block_admin_or_incomplete_profile,
    _require_feature, _analyze_inbody_report, IMAGE_TYPES, INBODY_TYPES, MAX_IMAGE_SIZE, MAX_INBODY_SIZE
)
from apps.users.services import log_audit
from .serializers import ChatMessageRequestSerializer, ChatSessionSerializer, ChatMessageSerializer
from .services import process_chat_message
from .models import ChatSession, ChatMessage, ChatRecommendation, ChatMode, ChatSender

class ChatMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        require_authenticated(request.user)
        
        if hasattr(request.user, 'profile'):
            if request.user.profile.role == UserRole.ADMIN:
                return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing chat.")
            if not request.user.profile.onboarding_complete:
                return error_response("AUTHORIZATION_ERROR", "User must complete onboarding first.")

        idem_key = request.headers.get('Idempotency-Key')
        if not idem_key:
            return error_response("VALIDATION_ERROR", "Idempotency-Key header is required.")

        body_str = json.dumps(request.data, sort_keys=True).encode('utf-8')
        request_hash = hashlib.sha256(body_str).hexdigest()
        endpoint = request.path

        with transaction.atomic():
            record, created = IdempotencyKey.objects.select_for_update().get_or_create(
                user=request.user,
                key=idem_key,
                endpoint=endpoint,
                defaults={'status': IdempotencyStatus.IN_PROGRESS, 'request_hash': request_hash}
            )

            if not created:
                if record.status == IdempotencyStatus.COMPLETED:
                    if record.request_hash == request_hash:
                        return success_response(record.response_body)
                    else:
                        return error_response("IDEMPOTENCY_CONFLICT", "Key used with a different request body.", stat=status.HTTP_409_CONFLICT)
                elif record.status == IdempotencyStatus.IN_PROGRESS:
                    return error_response("IDEMPOTENCY_CONFLICT", "Request is already in progress.", stat=status.HTTP_409_CONFLICT)
                else:
                    record.status = IdempotencyStatus.IN_PROGRESS
                    record.request_hash = request_hash
                    record.save()

        serializer = ChatMessageRequestSerializer(data=request.data)
        if not serializer.is_valid():
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("VALIDATION_ERROR", "Invalid chat data.", details=serializer.errors)

        try:
            response_data = process_chat_message(
                user=request.user, 
                message_text=serializer.validated_data['message'],
                session_id=serializer.validated_data.get('session_id')
            )
            
            record.status = IdempotencyStatus.COMPLETED
            record.response_body = response_data
            record.save()
            return success_response(response_data)
            
        except Exception as e:
            record.status = IdempotencyStatus.FAILED
            record.save()
            if str(e) == "USAGE_LIMIT_EXCEEDED":
                return error_response("USAGE_LIMIT_EXCEEDED", "Daily limit of 3 chat messages exceeded for free tier.", stat=status.HTTP_403_FORBIDDEN)
            if isinstance(e, ObjectDoesNotExist):
                 return error_response("NOT_FOUND", "Session not found.", stat=status.HTTP_404_NOT_FOUND)
            return error_response("CHAT_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatSessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_authenticated(request.user)
        sessions = (
            ChatSession.objects
            .filter(user=request.user)
            .prefetch_related('messages', 'recommendations')
            .order_by('-updated_at')
        )
        serializer = ChatSessionSerializer(sessions, many=True)
        return success_response({"sessions": serializer.data})

class ChatSessionDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        require_authenticated(request.user)
        try:
            session = ChatSession.objects.get(id=id, user=request.user)
            serializer = ChatSessionSerializer(session)
            return success_response({"session": serializer.data})
        except ChatSession.DoesNotExist:
            return error_response("NOT_FOUND", "Session not found.", stat=status.HTTP_404_NOT_FOUND)

class ChatFoodImageUploadView(APIView):
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
        session_id = request.data.get("session_id")

        if not image:
            return error_response("VALIDATION_ERROR", "Image is required.")
        if image.content_type not in IMAGE_TYPES:
            return error_response("VALIDATION_ERROR", "Unsupported format. Please upload a JPG, PNG, or WebP image.")
        if image.size > MAX_IMAGE_SIZE:
            return error_response("VALIDATION_ERROR", "File too large. Maximum size is 10MB.")

        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return error_response("NOT_FOUND", "Session not found.", stat=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(
                user=request.user,
                title="Food Image Analysis",
                mode=ChatMode.HEALTHY_ALTERNATIVE
            )

        try:
            recognized_food = _recognize_food_label(image)
        except RuntimeError:
            return error_response(
                "FOOD_RECOGNITION_UNAVAILABLE",
                (
                    "I could not analyze the image automatically right now. "
                    "You can type the food name instead, and I will check if it looks suitable for you."
                ),
                stat=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not recognized_food:
            return error_response(
                "NO_FOOD_DETECTED",
                (
                    "I could not clearly identify food in this image. "
                    "Try a clearer photo, or type the food name and I will check it for you."
                ),
            )

        matched_food = _match_food_item(recognized_food)
        if not matched_food:
            return error_response(
                "NO_DATABASE_MATCH",
                (
                    "I recognized the food, but I do not have enough trusted nutrition details for it yet. "
                    "Try a clearer photo, type a simpler food name, or ask me for another suitable option."
                ),
                details={"recognized_food": recognized_food}
            )

        # Save messages in DB
        user_msg = ChatMessage.objects.create(
            session=session,
            sender=ChatSender.USER,
            message="[Uploaded Food Image]"
        )

        reply_text = (
            f"I found **{matched_food.name}** in your image. "
            "Here is a simple nutrition guide that looks suitable for you."
        )
        asst_msg = ChatMessage.objects.create(
            session=session,
            sender=ChatSender.ASSISTANT,
            message=reply_text
        )

        # Create food card data structure
        foods_data = [{
            "name": matched_food.name,
            "calories": str(matched_food.calories),
            "protein_g": str(matched_food.protein_g),
            "carbs_g": str(matched_food.carbs_g),
            "fat_g": str(matched_food.fat_g),
            "reason": "This looks like a suitable option for you. Adjust the portion based on your hunger and goal."
        }]

        # Create ChatRecommendation and link to assistant message
        ChatRecommendation.objects.create(
            session=session,
            message=asst_msg,
            mood_name="food_image_analysis",
            recommended_foods=foods_data,
            warnings=[]
        )

        # Save context to session for "another food" flow
        session.pending_food_name = matched_food.name
        session.conversation_state = 'HEALTHY_ALTERNATIVE'
        session.mode = ChatMode.HEALTHY_ALTERNATIVE
        session.save()

        return success_response({
            "session_id": session.id,
            "user_message": ChatMessageSerializer(user_msg).data,
            "assistant_message": ChatMessageSerializer(asst_msg).data
        })

class ChatInBodyUploadView(APIView):
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

        file_obj = request.FILES.get("file")
        session_id = request.data.get("session_id")

        if not file_obj:
            return error_response("VALIDATION_ERROR", "File is required.")
        if file_obj.content_type not in INBODY_TYPES:
            return error_response("VALIDATION_ERROR", "Unsupported format. Please upload a PDF, JPG, or PNG file.")
        if file_obj.size > MAX_INBODY_SIZE:
            return error_response("VALIDATION_ERROR", "File too large. Maximum size is 20MB.")

        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
            except ChatSession.DoesNotExist:
                return error_response("NOT_FOUND", "Session not found.", stat=status.HTTP_404_NOT_FOUND)
        else:
            session = ChatSession.objects.create(
                user=request.user,
                title="InBody Scan",
                mode=ChatMode.HELP
            )

        log_audit(
            actor=request.user,
            action="inbody_upload_received_chat",
            resource_type="InBodyUpload",
            safe_metadata={
                "filename": file_obj.name,
                "size_bytes": file_obj.size,
                "content_type": file_obj.content_type,
                "session_id": session.id
            },
        )

        user_msg = ChatMessage.objects.create(
            session=session,
            sender=ChatSender.USER,
            message=f"[Uploaded InBody Scan: {file_obj.name}]"
        )

        try:
            analysis = _analyze_inbody_report(file_obj, user=request.user)
            reply_text = analysis
        except RuntimeError:
            reply_text = (
                "I received your InBody report, but I could not read the values clearly enough from this upload. "
                "Please upload a sharper full-page image, or type the key values you can see: weight, body fat percentage, "
                "skeletal muscle mass, BMI, and BMR. Once I have those, I can explain what the report says and turn it into practical food guidance."
            )

        asst_msg = ChatMessage.objects.create(
            session=session,
            sender=ChatSender.ASSISTANT,
            message=reply_text
        )

        session.mode = ChatMode.HELP
        session.save()

        return success_response({
            "session_id": session.id,
            "user_message": ChatMessageSerializer(user_msg).data,
            "assistant_message": ChatMessageSerializer(asst_msg).data
        })
