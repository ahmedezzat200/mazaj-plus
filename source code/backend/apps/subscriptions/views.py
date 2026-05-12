from rest_framework.views import APIView
from rest_framework import permissions, status
from apps.common.responses import success_response, error_response
from .serializers import SubscriptionResponseSerializer, SubscriptionUpgradeSerializer
from .services import get_subscription_data, upgrade_subscription

class SubscriptionMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = get_subscription_data(request.user)
            return success_response(data)
        except Exception as e:
            return error_response("SERVER_ERROR", "An unexpected error occurred.", details=str(e))

class SubscriptionUpgradeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscriptionUpgradeSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)
        
        target_tier = serializer.validated_data['target_tier']
        
        try:
            data = upgrade_subscription(request.user, target_tier)
            return success_response(data)
        except ValueError as e:
            if str(e) == "INVALID_TIER":
                return error_response("INVALID_TIER", "Invalid subscription tier selected.")
            return error_response("VALIDATION_ERROR", str(e))
        except Exception as e:
            return error_response("SERVER_ERROR", "Something went wrong while updating your subscription.", details=str(e))
