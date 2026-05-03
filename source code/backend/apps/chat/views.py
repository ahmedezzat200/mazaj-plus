import hashlib
import json
from rest_framework.views import APIView
from rest_framework import permissions, status
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from apps.common.responses import success_response, error_response
from apps.common.models import IdempotencyKey
from apps.common.enums import IdempotencyStatus, UserRole
from apps.common.policies import require_authenticated
from .serializers import ChatMessageRequestSerializer, ChatSessionSerializer
from .services import process_chat_message
from .models import ChatSession

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
            if str(e) == "DAILY_LIMIT_EXCEEDED":
                return error_response("USAGE_LIMIT_EXCEEDED", "Daily limit of 3 chat messages exceeded for free tier.", stat=status.HTTP_403_FORBIDDEN)
            if isinstance(e, ObjectDoesNotExist):
                 return error_response("NOT_FOUND", "Session not found.", stat=status.HTTP_404_NOT_FOUND)
            return error_response("CHAT_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatSessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_authenticated(request.user)
        sessions = ChatSession.objects.filter(user=request.user).order_by('-updated_at')
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
