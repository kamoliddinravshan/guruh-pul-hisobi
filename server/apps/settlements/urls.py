from django.urls import path

from apps.settlements.views import SettlementViewSet

settle = SettlementViewSet.as_view({'post': 'create'})
history = SettlementViewSet.as_view({'get': 'list'})

urlpatterns = [
    path('groups/<uuid:group_pk>/settle/', settle, name='group-settle'),
    path('groups/<uuid:group_pk>/history/', history, name='group-history'),
]
