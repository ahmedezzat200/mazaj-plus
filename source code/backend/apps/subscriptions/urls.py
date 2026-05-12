from django.urls import path
from .views import SubscriptionMeView, SubscriptionUpgradeView

urlpatterns = [
    path('me/', SubscriptionMeView.as_view(), name='subscription_me'),
    path('upgrade/', SubscriptionUpgradeView.as_view(), name='subscription_upgrade'),
]
