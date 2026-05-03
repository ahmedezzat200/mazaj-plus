from django.urls import path
from .views import HealthCheckView, CsrfCookieView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('csrf/', CsrfCookieView.as_view(), name='csrf_cookie'),
]
