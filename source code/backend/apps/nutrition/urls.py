from django.urls import path
from .views import (
    NutritionPlanGenerateView, NutritionPlanListView, NutritionPlanDetailView,
    AlternativeSearchView, HydrationTargetView, HydrationLogView, DailyTipView,
    HealthConditionListView, AllergyListView
)
from .upload_views import FoodImageUploadView, InBodyUploadView

urlpatterns = [
    path('plans/generate/', NutritionPlanGenerateView.as_view(), name='plan_generate'),
    path('plans/', NutritionPlanListView.as_view(), name='plan_list'),
    path('plans/<int:id>/', NutritionPlanDetailView.as_view(), name='plan_detail'),
    path('uploads/food-image/', FoodImageUploadView.as_view(), name='food_image_upload'),
    path('uploads/inbody/', InBodyUploadView.as_view(), name='inbody_upload'),
    path('alternatives/search/', AlternativeSearchView.as_view(), name='alternatives_search'),
    path('hydration/target/', HydrationTargetView.as_view(), name='hydration_target'),
    path('hydration/log/', HydrationLogView.as_view(), name='hydration_log'),
    path('tips/daily/', DailyTipView.as_view(), name='tips_daily'),
    path('health-conditions/', HealthConditionListView.as_view(), name='health_conditions'),
    path('allergies/', AllergyListView.as_view(), name='allergies'),
]
