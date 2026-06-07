from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/', include('apps.profiles.urls')),
    path('api/v1/', include('apps.nutrition.urls')),
    path('api/v1/chat/', include('apps.chat.urls')),
    path('api/v1/subscription/', include('apps.subscriptions.urls')),
    path('api/v1/', include('apps.common.urls')),
    path('api/v1/admin/', include('apps.admin_portal.urls')),
]
