import hashlib
import json
from django.db.models import Sum
from rest_framework.views import APIView
from rest_framework import permissions, status
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from apps.common.responses import success_response, error_response
from apps.common.models import IdempotencyKey
from apps.common.enums import IdempotencyStatus, UserRole
from apps.common.policies import require_authenticated
from .serializers import NutritionPlanGenerateSerializer, NutritionPlanSerializer
from .services import generate_nutrition_plan
from .models import NutritionPlan, HealthCondition, Allergy

class NutritionPlanGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        require_authenticated(request.user)
        
        if hasattr(request.user, 'profile'):
            if request.user.profile.role == UserRole.ADMIN:
                return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing plan generator.")
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

        serializer = NutritionPlanGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)

        try:
            plan = generate_nutrition_plan(
                user=request.user, 
                title=serializer.validated_data['title']
            )
            
            response_data = NutritionPlanSerializer(plan).data
            
            record.status = IdempotencyStatus.COMPLETED
            record.response_body = response_data
            record.save()
            return success_response(response_data)
            
        except Exception as e:
            record.status = IdempotencyStatus.FAILED
            record.save()
            if str(e) == "USAGE_LIMIT_EXCEEDED":
                return error_response("USAGE_LIMIT_EXCEEDED", "Weekly limit of 1 nutrition plan exceeded for free tier.", stat=status.HTTP_403_FORBIDDEN)
            return error_response("PLAN_GENERATION_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NutritionPlanListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_authenticated(request.user)
        if hasattr(request.user, 'profile') and request.user.profile.role == UserRole.ADMIN:
            return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing plan endpoints.")
        plans = NutritionPlan.objects.filter(user=request.user).order_by('-created_at')
        serializer = NutritionPlanSerializer(plans, many=True)
        return success_response({"plans": serializer.data})

class NutritionPlanDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        require_authenticated(request.user)
        if hasattr(request.user, 'profile') and request.user.profile.role == UserRole.ADMIN:
            return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing plan endpoints.")
        try:
            plan = NutritionPlan.objects.get(id=id, user=request.user)
            serializer = NutritionPlanSerializer(plan)
            return success_response({"plan": serializer.data})
        except NutritionPlan.DoesNotExist:
            return error_response("NOT_FOUND", "Plan not found.", stat=status.HTTP_404_NOT_FOUND)

from .serializers import AlternativeSearchSerializer, WaterIntakeLogSerializer, DailyTipSerializer
from .models import WaterIntakeLog
from apps.common.enums import FeatureKey
from django.utils import timezone
from apps.subscriptions.services import check_and_increment_usage
from .services import get_healthy_alternatives, get_daily_tip

class AlternativeSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        require_authenticated(request.user)
        
        if hasattr(request.user, 'profile'):
            if request.user.profile.role == UserRole.ADMIN:
                return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing alternatives endpoint.")
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

        serializer = AlternativeSearchSerializer(data=request.data)
        if not serializer.is_valid():
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)

        try:
            with transaction.atomic():
                check_and_increment_usage(request.user, FeatureKey.HEALTHY_ALTERNATIVE, limit=2)
                
            food_name = serializer.validated_data['food_name']
            alts = get_healthy_alternatives(food_name, request.user)
            
            alt_list = []
            for alt in alts:
                alt_list.append({
                    "original_food_name": alt.original_food_name,
                    "alternative_food": { "name": alt.alternative_food.name, "calories": str(alt.alternative_food.calories), "protein_g": str(alt.alternative_food.protein_g), "carbs_g": str(alt.alternative_food.carbs_g), "fat_g": str(alt.alternative_food.fat_g) },
                    "reason": alt.reason
                })

            if not alt_list:
                response_data = {"advisory": "Advisory only: No safe alternatives found.", "alternatives": []}
            else:
                response_data = {"advisory": "Advisory only: These are safe healthy alternatives.", "alternatives": alt_list}
            
            record.status = IdempotencyStatus.COMPLETED
            record.response_body = response_data
            record.save()
            return success_response(response_data)
            
        except Exception as e:
            record.status = IdempotencyStatus.FAILED
            record.save()
            if str(e) == "USAGE_LIMIT_EXCEEDED":
                return error_response("USAGE_LIMIT_EXCEEDED", "Daily limit of 2 alternative requests exceeded for free tier.", stat=status.HTTP_403_FORBIDDEN)
            return error_response("SEARCH_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)

class HydrationTargetView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_authenticated(request.user)
        if hasattr(request.user, 'profile'):
            if request.user.profile.role == UserRole.ADMIN:
                return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing hydration endpoint.")
            if not request.user.profile.onboarding_complete:
                return error_response("AUTHORIZATION_ERROR", "User must complete onboarding first.")

        weight = request.user.profile.weight_kg
        target_ml = int(float(weight) * 35) if weight else 2000
        
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_total_ml = WaterIntakeLog.objects.filter(
            user=request.user, logged_at__gte=today_start
        ).aggregate(total=Sum("amount_ml"))["total"] or 0

        return success_response({
            "advisory": "Advisory only. Not medical advice.",
            "target_ml": target_ml,
            "today_total_ml": today_total_ml
        })

class HydrationLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        require_authenticated(request.user)
        if hasattr(request.user, 'profile'):
            if request.user.profile.role == UserRole.ADMIN:
                return error_response("AUTHORIZATION_ERROR", "Admins cannot use the user-facing hydration endpoint.")
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

        serializer = WaterIntakeLogSerializer(data=request.data)
        if not serializer.is_valid():
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)

        try:
            with transaction.atomic():
                WaterIntakeLog.objects.create(
                    user=request.user,
                    amount_ml=serializer.validated_data['amount_ml']
                )

            weight = request.user.profile.weight_kg
            target_ml = int(float(weight) * 35) if weight else 2000
            
            now = timezone.now()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            today_total_ml = WaterIntakeLog.objects.filter(
                user=request.user, logged_at__gte=today_start
            ).aggregate(total=Sum("amount_ml"))["total"] or 0

            response_data = {
                "advisory": "Advisory only. Not medical advice.",
                "today_total_ml": today_total_ml,
                "target_ml": target_ml
            }

            record.status = IdempotencyStatus.COMPLETED
            record.response_body = response_data
            record.save()
            return success_response(response_data)
        except Exception as e:
            record.status = IdempotencyStatus.FAILED
            record.save()
            return error_response("HYDRATION_LOG_FAILED", "An error occurred.", details={}, stat=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DailyTipView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tip = get_daily_tip()
        if not tip:
            return success_response({"tip": None, "advisory": "Advisory only. No tips available."})
        serializer = DailyTipSerializer(tip)
        return success_response({"tip": serializer.data, "advisory": "Advisory only."})

class HealthConditionListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        conditions = HealthCondition.objects.filter(is_active=True).order_by('id')
        data = [{'id': c.id, 'name': c.name} for c in conditions]
        return success_response({'health_conditions': data})

class AllergyListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        allergies = Allergy.objects.filter(is_active=True).order_by('id')
        data = [{'id': a.id, 'name': a.name} for a in allergies]
        return success_response({'allergies': data})

