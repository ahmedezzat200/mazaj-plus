from django.urls import path
from .views import (
    SubscriptionMeView, SubscriptionUpgradeView,
    SubscriptionCheckoutView, SubscriptionMockPaymentSuccessView
)

urlpatterns = [
    path('me/', SubscriptionMeView.as_view(), name='subscription_me'),
    path('upgrade/', SubscriptionUpgradeView.as_view(), name='subscription_upgrade'),
    path('checkout/', SubscriptionCheckoutView.as_view(), name='subscription_checkout'),
    path('mock-payment-success/', SubscriptionMockPaymentSuccessView.as_view(), name='subscription_mock_payment_success'),
]
