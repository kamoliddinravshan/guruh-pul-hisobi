from django.urls import path
from api import views

urlpatterns = [
    path("api/health", views.health),
    path("api/auth/register", views.register),
    path("api/auth/login", views.login),
    path("api/auth/google", views.google_login),
    path("api/groups", views.groups),
    path("api/groups/<int:group_id>", views.group_detail),
    path("api/groups/<int:group_id>/expenses", views.group_expenses),
    path("api/groups/<int:group_id>/settlements", views.group_settlements),
    path("api/settlements", views.settlements),
    path("api/reports/summary", views.report_summary),
]
