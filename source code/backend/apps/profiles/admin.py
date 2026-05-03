from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # Strict privacy: Health details are not listed
    list_display = ('user', 'role', 'onboarding_complete', 'created_at')
    fields = ('user', 'role', 'onboarding_complete')
