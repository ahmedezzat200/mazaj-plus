from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .responses import success_response

class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return success_response({
            "status": "ok",
            "service": "mazaj-backend"
        })

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

class CsrfCookieView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return success_response({
            "csrf": "set"
        })
