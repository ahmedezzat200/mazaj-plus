from rest_framework.views import APIView
from rest_framework import permissions, status
from django.contrib.auth import get_user_model
from apps.common.responses import success_response, error_response
from apps.common.models import AuditLog
from apps.common.enums import UserRole, Tier, SubscriptionStatus
from apps.nutrition.models import FoodItem, DailyTip, HealthyAlternative
from apps.subscriptions.models import Subscription
from .serializers import (
    AdminUserSerializer, AdminFoodItemSerializer, AdminFoodItemCreateSerializer,
    AdminDailyTipSerializer, AdminDailyTipCreateSerializer,
    AdminSubscriptionSerializer, AdminAuditLogSerializer,
    AdminHealthyAlternativeSerializer, AdminHealthyAlternativeCreateSerializer,
)

User = get_user_model()


def _require_admin(user):
    if not hasattr(user, 'profile') or user.profile.role != UserRole.ADMIN:
        return error_response("AUTHORIZATION_ERROR", "Admin access required.", stat=status.HTTP_403_FORBIDDEN)
    return None


class AdminUserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        users = (
            User.objects
            .select_related('profile', 'subscription')
            .order_by('-date_joined')
        )
        serializer = AdminUserSerializer(users, many=True)
        return success_response({'users': serializer.data, 'count': users.count()})


class AdminUserTierView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, user_id):
        err = _require_admin(request.user)
        if err:
            return err
        new_tier = request.data.get('tier')
        if new_tier not in [Tier.FREE, Tier.PRO, Tier.ULTRA]:
            return error_response("VALIDATION_ERROR", "Invalid tier value.")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return error_response("NOT_FOUND", "User not found.", stat=status.HTTP_404_NOT_FOUND)
        sub, _ = Subscription.objects.get_or_create(user=user, defaults={'tier': new_tier, 'status': SubscriptionStatus.ACTIVE})
        sub.tier = new_tier
        sub.save()
        return success_response({'message': f'Tier updated to {new_tier}.'})


class AdminUserStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, user_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return error_response("NOT_FOUND", "User not found.", stat=status.HTTP_404_NOT_FOUND)
        user.is_active = not user.is_active
        user.save()
        return success_response({'is_active': user.is_active})


class AdminFoodListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        foods = FoodItem.objects.order_by('name')
        serializer = AdminFoodItemSerializer(foods, many=True)
        return success_response({'foods': serializer.data, 'count': foods.count()})

    def post(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        serializer = AdminFoodItemCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)
        food = serializer.save()
        return success_response({'food': AdminFoodItemSerializer(food).data}, stat=status.HTTP_201_CREATED)


class AdminFoodDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, food_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            food = FoodItem.objects.get(id=food_id)
        except FoodItem.DoesNotExist:
            return error_response("NOT_FOUND", "Food item not found.", stat=status.HTTP_404_NOT_FOUND)
        serializer = AdminFoodItemCreateSerializer(food, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)
        food = serializer.save()
        return success_response({'food': AdminFoodItemSerializer(food).data})

    def delete(self, request, food_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            food = FoodItem.objects.get(id=food_id)
        except FoodItem.DoesNotExist:
            return error_response("NOT_FOUND", "Food item not found.", stat=status.HTTP_404_NOT_FOUND)
        food.is_active = not food.is_active
        food.save()
        return success_response({'is_active': food.is_active})


class AdminTipListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        tips = DailyTip.objects.order_by('display_order', '-created_at')
        serializer = AdminDailyTipSerializer(tips, many=True)
        return success_response({'tips': serializer.data, 'count': tips.count()})

    def post(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        serializer = AdminDailyTipCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)
        tip = serializer.save()
        return success_response({'tip': AdminDailyTipSerializer(tip).data}, stat=status.HTTP_201_CREATED)


class AdminTipDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, tip_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            tip = DailyTip.objects.get(id=tip_id)
        except DailyTip.DoesNotExist:
            return error_response("NOT_FOUND", "Tip not found.", stat=status.HTTP_404_NOT_FOUND)
        for field in ['title', 'content', 'is_active', 'display_order']:
            if field in request.data:
                setattr(tip, field, request.data[field])
        tip.save()
        serializer = AdminDailyTipSerializer(tip)
        return success_response({'tip': serializer.data})

    def delete(self, request, tip_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            tip = DailyTip.objects.get(id=tip_id)
        except DailyTip.DoesNotExist:
            return error_response("NOT_FOUND", "Tip not found.", stat=status.HTTP_404_NOT_FOUND)
        tip.delete()
        return success_response({'message': 'Tip deleted.'})


class AdminSubscriptionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        subs = Subscription.objects.select_related('user').order_by('-created_at')
        serializer = AdminSubscriptionSerializer(subs, many=True)
        return success_response({'subscriptions': serializer.data, 'count': subs.count()})


class AdminSubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, sub_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            sub = Subscription.objects.get(id=sub_id)
        except Subscription.DoesNotExist:
            return error_response("NOT_FOUND", "Subscription not found.", stat=status.HTTP_404_NOT_FOUND)
        sub.status = SubscriptionStatus.INACTIVE if sub.status == SubscriptionStatus.ACTIVE else SubscriptionStatus.ACTIVE
        sub.save()
        return success_response({'status': sub.status})


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        total_users = User.objects.count()
        free_users = Subscription.objects.filter(tier=Tier.FREE).count()
        pro_users = Subscription.objects.filter(tier=Tier.PRO).count()
        ultra_users = Subscription.objects.filter(tier=Tier.ULTRA).count()
        total_foods = FoodItem.objects.filter(is_active=True).count()
        total_tips = DailyTip.objects.filter(is_active=True).count()
        return success_response({
            'total_users': total_users,
            'free_users': free_users,
            'pro_users': pro_users,
            'ultra_users': ultra_users,
            'total_foods': total_foods,
            'total_tips': total_tips,
        })


class AdminActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        logs = AuditLog.objects.select_related('actor').order_by('-created_at')[:50]
        serializer = AdminAuditLogSerializer(logs, many=True)
        return success_response({'activity': serializer.data})


class AdminAlternativeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        alts = (
            HealthyAlternative.objects
            .select_related('alternative_food')
            .order_by('-created_at')
        )
        serializer = AdminHealthyAlternativeSerializer(alts, many=True)
        return success_response({'alternatives': serializer.data, 'count': alts.count()})

    def post(self, request):
        err = _require_admin(request.user)
        if err:
            return err
        serializer = AdminHealthyAlternativeCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)
        alt = serializer.save()
        return success_response(
            {'alternative': AdminHealthyAlternativeSerializer(alt).data},
            stat=status.HTTP_201_CREATED,
        )


class AdminAlternativeDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, alt_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            alt = HealthyAlternative.objects.get(id=alt_id)
        except HealthyAlternative.DoesNotExist:
            return error_response("NOT_FOUND", "Alternative not found.", stat=status.HTTP_404_NOT_FOUND)
        serializer = AdminHealthyAlternativeCreateSerializer(alt, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response("VALIDATION_ERROR", "Invalid data.", details=serializer.errors)
        alt = serializer.save()
        return success_response({'alternative': AdminHealthyAlternativeSerializer(alt).data})

    def delete(self, request, alt_id):
        err = _require_admin(request.user)
        if err:
            return err
        try:
            alt = HealthyAlternative.objects.get(id=alt_id)
        except HealthyAlternative.DoesNotExist:
            return error_response("NOT_FOUND", "Alternative not found.", stat=status.HTTP_404_NOT_FOUND)
        alt.is_active = not alt.is_active
        alt.save()
        return success_response({'is_active': alt.is_active})
