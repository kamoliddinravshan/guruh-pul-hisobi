from decimal import Decimal

import pytest

from apps.expenses.models import Expense, ExpenseSplit
from apps.expenses.services import DebtSimplificationService
from apps.groups.models import Group, Membership
from apps.settlements.models import Settlement


@pytest.mark.django_db
class TestDebtSimplification:
    def test_simple_three_person_debt(self, django_user_model):
        ali = django_user_model.objects.create_user(email='ali@example.com', full_name='Ali', password='Testpass123')
        vali = django_user_model.objects.create_user(email='vali@example.com', full_name='Vali', password='Testpass123')
        gani = django_user_model.objects.create_user(email='gani@example.com', full_name='Gani', password='Testpass123')
        group = Group.objects.create(name='Safar', created_by=ali)
        for user in [ali, vali, gani]:
            Membership.objects.create(user=user, group=group)

        expense = Expense.objects.create(group=group, paid_by=ali, amount=Decimal('300000'), description='Ovqat')
        for user in [ali, vali, gani]:
            ExpenseSplit.objects.create(expense=expense, user=user, share=Decimal('100000'))

        transactions = DebtSimplificationService.simplify(str(group.id))

        assert len(transactions) == 2
        assert sum(t.amount for t in transactions if t.to_user == str(ali.id)) == Decimal('200000.00')

    def test_settled_amount_reduces_balance(self, django_user_model):
        ali = django_user_model.objects.create_user(email='ali2@example.com', full_name='Ali', password='Testpass123')
        vali = django_user_model.objects.create_user(email='vali2@example.com', full_name='Vali', password='Testpass123')
        group = Group.objects.create(name='Uy', created_by=ali)
        Membership.objects.create(user=ali, group=group)
        Membership.objects.create(user=vali, group=group)
        expense = Expense.objects.create(group=group, paid_by=ali, amount=Decimal('200000'), description='Ijara')
        ExpenseSplit.objects.create(expense=expense, user=ali, share=Decimal('100000'))
        ExpenseSplit.objects.create(expense=expense, user=vali, share=Decimal('100000'))
        Settlement.objects.create(group=group, paid_by=vali, paid_to=ali, amount=Decimal('100000'))

        assert DebtSimplificationService.simplify(str(group.id)) == []
