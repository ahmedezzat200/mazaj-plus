from rest_framework.views import APIView
from rest_framework import status, permissions
from django.contrib.auth import authenticate, login, logout
from apps.common.responses import success_response, error_response
from .serializers import RegisterSerializer, LoginSerializer, CurrentUserSerializer
from .services import register_user, log_audit

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid registration data.", details=serializer.errors)

        try:
            register_user(serializer.validated_data)
            return success_response({"message": "Registration successful. You can now log in."})
        except Exception as e:
            return error_response("REGISTRATION_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid login data.", details=serializer.errors)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            log_audit(actor=user, action="login_success", resource_type="Session")
            user_data = CurrentUserSerializer(user).data
            return success_response({"user": user_data})
        else:
            return error_response("AUTHENTICATION_FAILED", "Invalid email or password.", stat=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        logout(request)
        if user.is_authenticated:
            log_audit(actor=user, action="logout_success", resource_type="Session")
        return success_response({"message": "Successfully logged out."})

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = CurrentUserSerializer(request.user).data
        return success_response({"user": user_data})
