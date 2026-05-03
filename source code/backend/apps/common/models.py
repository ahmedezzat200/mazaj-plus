from django.db import models
from django.conf import settings
from .enums import IdempotencyStatus

class IdempotencyKey(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    key = models.CharField(max_length=255)
    endpoint = models.CharField(max_length=255)
    request_hash = models.CharField(max_length=255)
    status = models.CharField(max_length=50, choices=IdempotencyStatus.choices)
    response_body = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"IdempotencyKey: {self.key} ({self.status})"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'key', 'endpoint'], name='unique_idempotency_key')
        ]
        indexes = [
            models.Index(fields=['key', 'endpoint', 'status']),
        ]

class AuditLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=255)
    resource_id = models.CharField(max_length=255, null=True, blank=True)
    safe_metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AuditLog [{self.created_at}]: {self.action} by {self.actor}"

    class Meta:
        indexes = [
            models.Index(fields=['actor']),
            models.Index(fields=['action']),
            models.Index(fields=['resource_type']),
            models.Index(fields=['created_at']),
        ]
