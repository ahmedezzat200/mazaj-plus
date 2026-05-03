from django.contrib import admin
from .models import Subscription, UsageLimitCounter

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'tier', 'status', 'activation_date')
    list_filter = ('tier', 'status')

@admin.register(UsageLimitCounter)
class UsageLimitCounterAdmin(admin.ModelAdmin):
    list_display = ('user', 'feature_key', 'count', 'period_start', 'period_end')
    list_filter = ('feature_key',)
