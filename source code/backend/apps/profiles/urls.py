from django.urls import path
from .views import OnboardingView, ProfileView

urlpatterns = [
    path('onboarding/', OnboardingView.as_view(), name='onboarding'),
    path('profile/me/', ProfileView.as_view(), name='profile_me'),
]
