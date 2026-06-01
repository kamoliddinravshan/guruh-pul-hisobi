from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action

from apps.accounts.models import CustomUser
from apps.accounts.serializers import UserSerializer
from apps.expenses.models import Expense
from apps.expenses.serializers import ExpenseSerializer
from apps.expenses.services import DebtSimplificationService
from apps.groups.models import Group
from apps.groups.permissions import IsGroupMember
from core.responses import api_response


class GroupExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]

    def get_queryset(self):
        queryset = Expense.objects.filter(group_id=self.kwargs['group_pk']).select_related('paid_by').prefetch_related('splits__user')
        category = self.request.query_params.get('category')
        paid_by = self.request.query_params.get('paid_by')
        date = self.request.query_params.get('date')
        if category:
            queryset = queryset.filter(category=category)
        if paid_by:
            queryset = queryset.filter(paid_by_id=paid_by)
        if date:
            queryset = queryset.filter(date=date)
        return queryset.order_by('-date', '-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group'] = get_object_or_404(Group, pk=self.kwargs['group_pk'])
        return context

    def perform_create(self, serializer):
        group = get_object_or_404(Group, pk=self.kwargs['group_pk'])
        self.check_object_permissions(self.request, group)
        serializer.save(group=group, paid_by=self.request.user)

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return api_response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        return api_response(self.get_serializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(serializer.data, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        expense = self.get_object()
        serializer = self.get_serializer(expense, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        self.get_object().delete()
        return api_response({'deleted': True})

    @action(detail=False, methods=['get'], url_path='balances')
    def balances(self, request, group_pk=None):
        balances = DebtSimplificationService.compute_net_balances(group_pk)
        users = CustomUser.objects.filter(id__in=balances.keys())
        result = [{'user': UserSerializer(user).data, 'balance': str(balances[str(user.id)])} for user in users]
        return api_response({'balances': result})

    @action(detail=False, methods=['get'], url_path='settlements')
    def settlements(self, request, group_pk=None):
        transactions = DebtSimplificationService.simplify(group_pk)
        user_ids = {transaction.from_user for transaction in transactions} | {transaction.to_user for transaction in transactions}
        users = {str(user.id): user for user in CustomUser.objects.filter(id__in=user_ids)}
        result = [
            {
                'from': UserSerializer(users[transaction.from_user]).data,
                'to': UserSerializer(users[transaction.to_user]).data,
                'amount': str(transaction.amount),
            }
            for transaction in transactions
        ]
        return api_response({'transactions': result})


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]

    def get_queryset(self):
        return Expense.objects.filter(group__memberships__user=self.request.user).select_related('group', 'paid_by').prefetch_related('splits__user')

    def retrieve(self, request, *args, **kwargs):
        return api_response(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        expense = self.get_object()
        if expense.paid_by_id != request.user.id:
            return api_response(error='Faqat xarajat yaratgan foydalanuvchi tahrirlashi mumkin.', status=403)
        serializer = self.get_serializer(expense, data=request.data, partial=partial, context={**self.get_serializer_context(), 'group': expense.group})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        expense = self.get_object()
        if expense.paid_by_id != request.user.id:
            return api_response(error='Faqat xarajat yaratgan foydalanuvchi o‘chirishi mumkin.', status=403)
        expense.delete()
        return api_response({'deleted': True})
