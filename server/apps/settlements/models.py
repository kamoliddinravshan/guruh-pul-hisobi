import uuid

from django.conf import settings
from django.db import models
from django.urls import reverse

from apps.groups.models import Group


class Settlement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='settlements')
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settlements_paid')
    paid_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settlements_received')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    settled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-settled_at']
        indexes = [
            models.Index(fields=['group', '-settled_at']),
            models.Index(fields=['paid_by', 'paid_to']),
        ]

    def __str__(self):
        return f'{self.paid_by} -> {self.paid_to}: {self.amount}'

    def get_absolute_url(self):
        return reverse('group-history', kwargs={'group_pk': self.group_id})
