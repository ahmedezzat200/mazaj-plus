from django.urls import path
from .views import (
    NutritionPlanGenerateView, NutritionPlanListView, NutritionPlanDetailView,
    AlternativeSearchView, HydrationTargetView, HydrationLogView, DailyTipView
)

urlpatterns = [
    path('plans/generate/', NutritionPlanGenerateView.as_view(), name='plan_generate'),
    path('plans/', NutritionPlanListView.as_view(), name='plan_list'),
    path('plans/<int:id>/', NutritionPlanDetailView.as_view(), name='plan_detail'),
    path('alternatives/search/', AlternativeSearchView.as_view(), name='alternatives_search'),
    path('hydration/target/', HydrationTargetView.as_view(), name='hydration_target'),
    path('hydration/log/', HydrationLogView.as_view(), name='hydration_log'),
    path('tips/daily/', DailyTipView.as_view(), name='tips_daily'),
]
