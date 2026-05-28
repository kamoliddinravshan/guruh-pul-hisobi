from django.contrib.auth.hashers import make_password
from django.db import models


class User(models.Model):
    name = models.CharField(max_length=160)
    email = models.EmailField(unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    avatar_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def create_password_user(cls, name, email, password):
        return cls.objects.create(name=name, email=email.lower(), password_hash=make_password(password))


class Group(models.Model):
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_groups")
    members = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)


class Expense(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=180)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    payer = models.CharField(max_length=160)
    participants = models.JSONField(default=list)
    category = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Settlement(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="settlements")
    from_member = models.CharField(max_length=160)
    to_member = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
