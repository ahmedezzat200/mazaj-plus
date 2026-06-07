from rest_framework.views import APIView
from rest_framework import permissions, status
from apps.common.responses import success_response, error_response
from .serializers import (
    SubscriptionResponseSerializer, SubscriptionUpgradeSerializer,
    CheckoutRequestSerializer, CheckoutResponseSerializer, MockPaymentRequestSerializer
)
from .services import (
    get_subscription_data, upgrade_subscription,
    create_subscription_checkout, complete_subscription_checkout
)

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

        if not serializer.validated_data.get('payment_confirmed', False):
            return error_response(
                "PAYMENT_REQUIRED",
                "Payment confirmation is required to upgrade your subscription.",
                stat=status.HTTP_402_PAYMENT_REQUIRED
            )

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

class SubscriptionCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)

        target_tier = serializer.validated_data['target_tier']
        try:
            checkout = create_subscription_checkout(request.user, target_tier)
            return success_response(CheckoutResponseSerializer(checkout).data)
        except ValueError as e:
            if str(e) == "INVALID_TIER":
                return error_response("INVALID_TIER", "Invalid subscription plan selected.")
            return error_response("VALIDATION_ERROR", str(e))
        except Exception as e:
            return error_response("SERVER_ERROR", "Could not start demo checkout. Please try again.", details=str(e))

class SubscriptionMockPaymentSuccessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MockPaymentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)

        checkout_id = serializer.validated_data['checkout_id']
        try:
            data = complete_subscription_checkout(request.user, checkout_id)
            return success_response(data)
        except ValueError as e:
            err_str = str(e)
            if err_str == "CHECKOUT_NOT_FOUND":
                return error_response("NOT_FOUND", "Subscription checkout session not found.", stat=status.HTTP_404_NOT_FOUND)
            if err_str == "CHECKOUT_NOT_PENDING":
                return error_response("VALIDATION_ERROR", "Your checkout is pending. Complete the demo checkout to activate your plan.")
            return error_response("VALIDATION_ERROR", err_str)
        except Exception as e:
            return error_response("SERVER_ERROR", "Could not complete simulated payment. Please try again.", details=str(e))
