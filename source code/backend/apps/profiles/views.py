import hashlib
import json
from rest_framework.views import APIView
from rest_framework import permissions, status
from django.db import transaction
from apps.common.responses import success_response, error_response
from apps.common.models import IdempotencyKey
from apps.common.enums import IdempotencyStatus, UserRole
from apps.common.policies import require_authenticated
from .serializers import OnboardingSerializer, ProfileSerializer, ProfileUpdateSerializer
from .services import submit_onboarding, update_profile

class OnboardingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        require_authenticated(request.user)

        if hasattr(request.user, 'profile') and request.user.profile.role == UserRole.ADMIN:
            return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user onboarding endpoint.")

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

        serializer = OnboardingSerializer(data=request.data)
        if not serializer.is_valid():
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("VALIDATION_ERROR", "Invalid onboarding data.", details=serializer.errors)

        try:
            profile = submit_onboarding(request.user, serializer.validated_data)
            resp_data = ProfileSerializer(profile).data
            
            record.status = IdempotencyStatus.COMPLETED
            record.response_body = resp_data
            record.save()
            return success_response(resp_data)
        except Exception as e:
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("ONBOARDING_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_authenticated(request.user)
        if hasattr(request.user, 'profile') and request.user.profile.role == UserRole.ADMIN:
            return error_response("AUTHORIZATION_ERROR", "Admins cannot inspect user profiles here.")

        serializer = ProfileSerializer(request.user.profile)
        return success_response(serializer.data)

    def patch(self, request):
        require_authenticated(request.user)
        if hasattr(request.user, 'profile') and request.user.profile.role == UserRole.ADMIN:
            return error_response("AUTHORIZATION_ERROR", "Admins cannot update user profiles here.")

        serializer = ProfileUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid profile update data.", details=serializer.errors)

        try:
            profile = update_profile(request.user, serializer.validated_data)
            resp_data = ProfileSerializer(profile).data
            return success_response(resp_data)
        except Exception as e:
            return error_response("PROFILE_UPDATE_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)
