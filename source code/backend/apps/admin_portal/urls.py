from django.urls import path
from .views import (
    AdminUserListView, AdminUserTierView, AdminUserStatusView,
    AdminFoodListView, AdminFoodDetailView,
    AdminTipListView, AdminTipDetailView,
    AdminSubscriptionListView, AdminSubscriptionStatusView,
    AdminStatsView, AdminActivityView,
    AdminAlternativeListView, AdminAlternativeDetailView,
)

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('users/<int:user_id>/tier/', AdminUserTierView.as_view(), name='admin_user_tier'),
    path('users/<int:user_id>/status/', AdminUserStatusView.as_view(), name='admin_user_status'),
    path('foods/', AdminFoodListView.as_view(), name='admin_food_list'),
    path('foods/<int:food_id>/', AdminFoodDetailView.as_view(), name='admin_food_detail'),
    path('tips/', AdminTipListView.as_view(), name='admin_tip_list'),
    path('tips/<int:tip_id>/', AdminTipDetailView.as_view(), name='admin_tip_detail'),
    path('subscriptions/', AdminSubscriptionListView.as_view(), name='admin_subscription_list'),
    path('subscriptions/<int:sub_id>/status/', AdminSubscriptionStatusView.as_view(), name='admin_subscription_status'),
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('activity/', AdminActivityView.as_view(), name='admin_activity'),
    path('alternatives/', AdminAlternativeListView.as_view(), name='admin_alternative_list'),
    path('alternatives/<int:alt_id>/', AdminAlternativeDetailView.as_view(), name='admin_alternative_detail'),
]
