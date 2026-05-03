from django.contrib import admin
from .models import IdempotencyKey, AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'resource_type', 'actor', 'created_at')
    readonly_fields = ('actor', 'action', 'resource_type', 'resource_id', 'safe_metadata', 'created_at')
    
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(IdempotencyKey)
class IdempotencyKeyAdmin(admin.ModelAdmin):
    list_display = ('key', 'user', 'endpoint', 'status', 'created_at')
    readonly_fields = [f.name for f in IdempotencyKey._meta.fields]
    
    def has_add_permission(self, request):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False
