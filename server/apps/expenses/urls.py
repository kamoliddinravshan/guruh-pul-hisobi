from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.expenses.views import ExpenseViewSet, GroupExpenseViewSet

router = DefaultRouter()
router.register('expenses', ExpenseViewSet, basename='expense')

group_expenses = GroupExpenseViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
group_balances = GroupExpenseViewSet.as_view({'get': 'balances'})
group_settlements = GroupExpenseViewSet.as_view({'get': 'settlements'})

urlpatterns = [
    path('groups/<uuid:group_pk>/expenses/', group_expenses, name='group-expenses'),
    path('groups/<uuid:group_pk>/balances/', group_balances, name='group-balances'),
    path('groups/<uuid:group_pk>/settlements/', group_settlements, name='group-settlements'),
]
urlpatterns += router.urls
