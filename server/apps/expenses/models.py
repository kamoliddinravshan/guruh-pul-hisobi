import uuid

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils import timezone

from apps.groups.models import Group


class Expense(models.Model):
    SPLIT_TYPES = [('equal', 'Teng'), ('percent', 'Foizda'), ('exact', 'Aniq summa')]
    CATEGORIES = [
        ('food', 'Ovqat'),
        ('transport', 'Transport'),
        ('housing', 'Turar joy'),
        ('entertainment', "Ko'ngil ochar"),
        ('shopping', 'Xarid'),
        ('health', 'Salomatlik'),
        ('other', 'Boshqa'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='expenses')
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='paid_expenses')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    description = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORIES, default='other')
    split_type = models.CharField(max_length=10, choices=SPLIT_TYPES, default='equal')
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['group', '-date']),
            models.Index(fields=['paid_by']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f'{self.description} - {self.amount}'

    def get_absolute_url(self):
        return reverse('expense-detail', kwargs={'pk': self.pk})


class ExpenseSplit(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='splits')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    share = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        unique_together = ('expense', 'user')
        ordering = ['user__full_name']

    def __str__(self):
        return f'{self.user} - {self.share}'
